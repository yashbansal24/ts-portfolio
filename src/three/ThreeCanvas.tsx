import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { isMotionPaused, subscribeMotion } from '../hooks/useMotionPaused';
import type { SceneFactory, SceneInstance, SceneModule } from './types';
import './ThreeCanvas.css';

export type ThreeCanvasProps<P = unknown> = {
  /** Eager factory (bundled with the caller). Provide `factory` OR `loader`. */
  factory?: SceneFactory<P>;
  /** Lazy factory: `() => import('./scenes/x')`. Loaded when the stage is within `lazyMargin` of the viewport. */
  loader?: () => Promise<SceneModule<P>>;
  /** IntersectionObserver rootMargin for lazy loading (default '600px 0px'). */
  lazyMargin?: string;
  /** Passed to the factory as opts.props. Read once at mount. */
  options?: P;
  /** Rendered when WebGL is unavailable, the factory throws, or the context is lost. */
  fallback?: ReactNode;
  /** Overlays rendered above the canvas (captions etc.). */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Decorative by default. Pass a label to expose the stage as role="img". */
  label?: string;
};

const DPR_CAP = 1.5;

/** Throwaway-context probe: run at most once per page, and only when a stage is about to mount. */
function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
let webglOk: boolean | undefined;
const hasWebGL = () => (webglOk ??= webglAvailable());

/**
 * Hosts a three.js scene: creates its own <canvas>, caps DPR at 1.5, resizes via ResizeObserver,
 * pauses off-screen (IntersectionObserver), in hidden tabs and while the site-wide "Pause motion" switch is on
 * (keeping the last frame), renders one static frame under prefers-reduced-motion, compiles shaders off the
 * main thread before the first frame (`prepare`), shows `fallback` without WebGL, and disposes everything on unmount.
 * Size the stage with CSS (fixed height / aspect-ratio) so there is no layout shift.
 */
export function ThreeCanvas<P = unknown>({ factory, loader, lazyMargin = '600px 0px', options, fallback, children, className, style, label }: ThreeCanvasProps<P>) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const optsRef = useRef(options);
  const factoryRef = useRef(factory);
  const loaderRef = useRef(loader);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const eager = factoryRef.current, lazy = loaderRef.current;
    if (eager && !hasWebGL()) { setFailed(true); return; }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let inst: SceneInstance | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let raf = 0, running = false, inView = false, last = 0, t = 0;
    const cleanups: Array<() => void> = [];

    const draw = (dt: number) => { if (inst) inst.render(reduced ? (inst.staticTime ?? inst.startTime ?? 0) : t, dt); };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now; t += dt;
      draw(dt);
    };
    const start = () => { if (running || reduced || !inst) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    // paused = keep the last frame on screen; resize / requestRender still redraw at the frozen t
    const sync = () => (inView && !document.hidden && !isMotionPaused() ? start() : stop());
    const requestRender = () => { if (!running && inst) draw(0); };

    // context lost: tear the scene down for good (listeners + instance), so nothing restarts behind the fallback
    const fail = () => {
      stop();
      cleanups.forEach((c) => c());
      cleanups.length = 0;
      try { inst?.dispose(); } catch { /* context already lost */ }
      inst = null;
      if (canvas) canvas.style.display = 'none';
      setFailed(true);
    };

    const mount = async (create: SceneFactory<P>) => {
      if (disposed) return;
      canvas = document.createElement('canvas');
      canvas.className = 'three-stage__canvas';
      canvas.setAttribute('aria-hidden', 'true');
      host.prepend(canvas);
      try {
        inst = create(canvas, {
          container: host,
          dpr: Math.min(window.devicePixelRatio || 1, DPR_CAP),
          reducedMotion: reduced,
          requestRender,
          props: optsRef.current as P,
        });
      } catch (err) {
        console.warn('[ThreeCanvas] scene failed, showing fallback', err);
        canvas.remove(); canvas = null; setFailed(true); return;
      }
      t = inst.startTime ?? 0;
      const onLost = (e: Event) => { e.preventDefault(); fail(); };
      canvas.addEventListener('webglcontextlost', onLost);
      cleanups.push(() => canvas?.removeEventListener('webglcontextlost', onLost));

      // compile shaders asynchronously (KHR_parallel_shader_compile) instead of stalling the first frame
      try { await inst.prepare?.(); } catch { /* falls back to compiling on first draw */ }
      if (disposed || !inst) return; // unmounted (cleanup disposed inst) or context lost meanwhile

      const resize = () => {
        const r = host.getBoundingClientRect();
        inst?.resize(Math.max(1, Math.round(r.width)), Math.max(1, Math.round(r.height)));
        if (!running) draw(0);
      };
      resize();
      const ro = new ResizeObserver(resize); ro.observe(host);
      // one callback can batch several entries for this host (e.g. [true, false] after a long task): the last one is current
      const io = new IntersectionObserver((entries) => { inView = entries[entries.length - 1].isIntersecting; sync(); }, { rootMargin: '80px 0px' });
      io.observe(host);
      document.addEventListener('visibilitychange', sync);
      const unsubMotion = subscribeMotion(sync);
      cleanups.push(() => { ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', sync); unsubMotion(); });
      setReady(true);
    };

    if (eager) void mount(eager);
    else if (lazy) {
      const io = new IntersectionObserver((entries) => {
        // any intersecting entry in the batch counts; loading early is harmless (the pause observer keeps the loop stopped)
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        if (!hasWebGL()) { setFailed(true); return; }
        lazy().then((m) => mount(m.default), (err) => { console.warn('[ThreeCanvas] scene load failed', err); if (!disposed) setFailed(true); });
      }, { rootMargin: lazyMargin });
      io.observe(host);
      cleanups.push(() => io.disconnect());
    }

    return () => {
      disposed = true;
      stop();
      cleanups.forEach((c) => c());
      try { inst?.dispose(); } catch { /* already gone */ }
      inst = null;
      canvas?.remove();
      canvas = null;
    };
  }, [lazyMargin]);

  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  return (
    <div
      ref={hostRef}
      className={['three-stage', failed && 'three-stage--fallback', ready && 'three-stage--ready', className].filter(Boolean).join(' ')}
      style={style}
      {...a11y}
    >
      {failed && <div className="three-stage__fallback">{fallback}</div>}
      {children}
    </div>
  );
}
