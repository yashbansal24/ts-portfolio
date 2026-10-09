// Shared three.js kit: palette, matte "clay" materials, rounded geometry, keycaps, clouds,
// lights, camera fitting and a per-scene disposal registry — so both scenes look like one set.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/** Palette as three.js hex ints (mirrors tokens.css). */
export const C = {
  ivory: 0xf7f1e5, ivory2: 0xefe6d3, line: 0xe4d8c0, paper: 0xfffdf8,
  blue: 0x14286e, blue2: 0x2a44a0, coral: 0xff6b4a, peach: 0xffd9cc,
  periwinkle: 0xc9d6ff, ink: 0x0e1b4d, white: 0xffffff, keycap: 0xfbf6ec,
} as const;

/* ---------------- math ---------------- */
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Quadratic bezier a → (control c) → b. */
export function qbez(a: THREE.Vector3, c: THREE.Vector3, b: THREE.Vector3, t: number, out = new THREE.Vector3()) {
  const u = 1 - t;
  return out.set(
    u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    u * u * a.y + 2 * u * t * c.y + t * t * b.y,
    u * u * a.z + 2 * u * t * c.z + t * t * b.z,
  );
}

/* ---------------- renderer ---------------- */
/** WebGL renderer with the house settings (transparent, sRGB, soft shadows, DPR from harness). Throws if no context. */
export function createRenderer(canvas: HTMLCanvasElement, dpr: number, opts: { stencil?: boolean; shadows?: boolean } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, stencil: opts.stencil ?? false, powerPreference: 'high-performance',
  });
  if (!renderer.getContext()) throw new Error('WebGL context unavailable');
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = opts.shadows ?? true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  return renderer;
}

/** Hemisphere + warm key (soft shadows) + cool fill + front light — the "matte clay in daylight" rig. */
export function addLights(scene: THREE.Scene, shadowSize = 7) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe6d6ba, 1.85));
  const key = new THREE.DirectionalLight(0xfff2e0, 2.5);
  key.position.set(-6, 12, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  const sc = key.shadow.camera;
  sc.left = -shadowSize; sc.right = shadowSize; sc.top = shadowSize; sc.bottom = -shadowSize; sc.near = 1; sc.far = 40;
  key.shadow.bias = -0.0006; key.shadow.normalBias = 0.025;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd8e0ff, 0.75); fill.position.set(9, 4, -5); scene.add(fill);
  const front = new THREE.DirectionalLight(0xffffff, 0.5); front.position.set(6, 3, 10); scene.add(front);
  return { key, fill, front };
}

/** Fit a perspective camera looking along `dir` so all `pts` are visible and centred. */
export function fitCamera(camera: THREE.PerspectiveCamera, pts: THREE.Vector3[], dir: THREE.Vector3, target: THREE.Vector3, margin = 0.9) {
  const D = dir.clone().normalize();
  const R = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), D).normalize();
  const U = new THREE.Vector3().crossVectors(D, R).normalize();
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of pts) {
    const q = p.clone().sub(target); const x = q.dot(R), y = q.dot(U);
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const tgt = target.clone().addScaledVector(R, (x0 + x1) / 2).addScaledVector(U, (y0 + y1) / 2);
  const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  let dist = 0;
  for (const p of pts) {
    const q = p.clone().sub(tgt); const a = q.dot(D);
    dist = Math.max(dist, a + Math.abs(q.dot(U)) / (tanV * margin), a + Math.abs(q.dot(R)) / (tanV * camera.aspect * margin));
  }
  camera.position.copy(tgt).addScaledVector(D, dist);
  camera.lookAt(tgt);
  camera.near = Math.max(0.5, dist - 20); camera.far = dist + 40;
  camera.updateProjectionMatrix();
}

/* ---------------- per-scene kit with disposal registry ---------------- */
type Disposable = { dispose(): void };
type MeshOpts = { cast?: boolean; receive?: boolean };

/** Create one kit per scene; everything it makes is freed by `kit.dispose()`. */
export function createKit() {
  const bag = new Set<Disposable>();
  const geoCache = new Map<string, THREE.BufferGeometry>();
  const track = <T extends Disposable>(x: T): T => { bag.add(x); return x; };

  /** Matte clay material (MeshStandard, roughness .66, no metal). */
  const clay = (color: THREE.ColorRepresentation, o: THREE.MeshStandardMaterialParameters = {}) =>
    track(new THREE.MeshStandardMaterial({ color, roughness: 0.66, metalness: 0, ...o }));

  /** Cached rounded box geometry (radius auto-clamped to the smallest half-extent). */
  const roundedBox = (w: number, h: number, d: number, r = 0.05, segments = 3) => {
    const k = `${w}|${h}|${d}|${r}|${segments}`;
    let g = geoCache.get(k);
    if (!g) {
      g = track(new RoundedBoxGeometry(w, h, d, segments, Math.min(r, Math.min(w, h, d) / 2 - 0.001)));
      geoCache.set(k, g);
    }
    return g;
  };

  /** Mesh with shadow flags (cast + receive by default). */
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], { cast = true, receive = true }: MeshOpts = {}) => {
    const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = receive; return o;
  };

  const sphere = track(new THREE.SphereGeometry(1, 28, 18));

  /** Puffy six-sphere cloud group; `s` = scale. Clouds are the ONLY object allowed to repeat. */
  const cloud = (mat: THREE.Material, s = 1, cast = true) => {
    const g = new THREE.Group();
    ([[0, 0, 0, 0.34], [0.32, -0.06, 0.04, 0.26], [-0.31, -0.07, 0, 0.25], [0.06, 0.15, -0.06, 0.26], [-0.12, -0.08, 0.2, 0.22], [0.16, -0.1, -0.18, 0.22]] as const)
      .forEach(([x, y, z, r]) => {
        const m = mesh(sphere, mat, { cast, receive: false });
        m.scale.set(r * s, r * s * 0.86, r * s); m.position.set(x * s, y * s, z * s); g.add(m);
      });
    return g;
  };

  /** Two-part keycap (base + inset top), unit size ≈ 0.56. */
  const keycap = (baseMat: THREE.Material, topMat: THREE.Material, opts: MeshOpts = { cast: false, receive: false }) => {
    const g = new THREE.Group();
    const base = mesh(roundedBox(0.56, 0.24, 0.56, 0.1), baseMat, opts);
    const top = mesh(roundedBox(0.43, 0.07, 0.43, 0.03, 2), topMat, opts); top.position.y = 0.135;
    g.add(base, top);
    return g;
  };

  /** Soft radial texture (for halos / contact shadows). */
  const radialTex = (inner: string, outer: string, size = 256) => {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d');
    if (g) {
      const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gr.addColorStop(0, inner); gr.addColorStop(1, outer);
      g.fillStyle = gr; g.fillRect(0, 0, size, size);
    }
    const t = track(new THREE.CanvasTexture(c)); t.colorSpace = THREE.SRGBColorSpace; return t;
  };

  /** Free every tracked geometry / material / texture, plus anything reachable from `root`. */
  const dispose = (root?: THREE.Object3D) => {
    root?.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) bag.add(m.geometry);
      const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
      for (const mat of mats) {
        bag.add(mat);
        for (const v of Object.values(mat)) if (v instanceof THREE.Texture) bag.add(v);
      }
    });
    bag.forEach((d) => d.dispose());
    bag.clear(); geoCache.clear();
  };

  return { clay, roundedBox, mesh, cloud, keycap, radialTex, track, dispose };
}

export type Kit = ReturnType<typeof createKit>;

/** Rounded-rectangle helper for THREE.Shape / THREE.Path (centred at cx, cy). */
export function rrect<T extends THREE.Path>(path: T, w: number, h: number, r: number, cx = 0, cy = 0): T {
  const x = cx - w / 2, y = cy - h / 2;
  path.moveTo(x + r, y); path.lineTo(x + w - r, y); path.quadraticCurveTo(x + w, y, x + w, y + r);
  path.lineTo(x + w, y + h - r); path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  path.lineTo(x + r, y + h); path.quadraticCurveTo(x, y + h, x, y + h - r);
  path.lineTo(x, y + r); path.quadraticCurveTo(x, y, x + r, y);
  return path;
}
