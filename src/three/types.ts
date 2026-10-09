/** Options the ThreeCanvas harness passes to every scene factory. */
export type SceneOptions<P = unknown> = {
  /** Element that wraps the canvas — attach pointer listeners here (scenes must remove them in dispose). */
  container: HTMLElement;
  /** Device pixel ratio, already capped at 1.5. */
  dpr: number;
  /** prefers-reduced-motion: the harness renders a single frame at `staticTime` and never loops. */
  reducedMotion: boolean;
  /** Ask the harness to draw one frame now (e.g. after pointer input while the loop is paused). */
  requestRender: () => void;
  /** Free-form props from <ThreeCanvas options={…}>. */
  props: P;
};

/** What a scene factory returns. The scene owns its renderer, camera and resources. */
export type SceneInstance = {
  /** Draw one frame. `t` = seconds of scene time (starts at `startTime`), `dt` = seconds since last frame (≤ 0.05). */
  render(t: number, dt: number): void;
  /** Container resized to CSS px w × h (renderer.setSize(w, h, false) + camera aspect). */
  resize(w: number, h: number): void;
  /** Free GPU memory, remove listeners, forceContextLoss. */
  dispose(): void;
  /**
   * Optional async warm-up the harness awaits before the first frame, e.g. `() => renderer.compileAsync(scene, camera)`,
   * so shader programs link off the main thread instead of stalling first render. Rejections are ignored.
   */
  prepare?(): Promise<unknown>;
  /** Scene time to start the loop at (default 0). */
  startTime?: number;
  /** Scene time rendered when reduced motion is on (default startTime). */
  staticTime?: number;
};

/** create(canvas, opts) → SceneInstance. Throw if WebGL is unusable; the harness shows the fallback. */
export type SceneFactory<P = unknown> = (canvas: HTMLCanvasElement, opts: SceneOptions<P>) => SceneInstance;

/** Lazy module shape: `() => import('./scenes/x')` where x.ts has `export default create`. */
export type SceneModule<P = unknown> = { default: SceneFactory<P> };
