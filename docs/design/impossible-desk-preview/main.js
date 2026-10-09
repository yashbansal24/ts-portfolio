import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const C = {
  ivory: 0xF7F1E5, ivory2: 0xEFE6D3, line: 0xE4D8C0, paper: 0xFFFDF8,
  blue: 0x14286E, blue2: 0x2A44A0, coral: 0xFF6B4A, white: 0xFFFFFF,
};

/* ---------------- helpers ---------------- */
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const clay = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.66, metalness: 0, ...o });
const geo = new Map();
function rbox(w, h, d, r = 0.05, s = 3) {
  const k = `${w}|${h}|${d}|${r}|${s}`;
  if (!geo.has(k)) geo.set(k, new RoundedBoxGeometry(w, h, d, s, Math.min(r, Math.min(w, h, d) / 2 - 0.001)));
  return geo.get(k);
}
function mesh(g, m, { cast = true, receive = true } = {}) {
  const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = receive; return o;
}
const SPHERE = new THREE.SphereGeometry(1, 28, 18);
function cloudGroup(mat, s = 1, cast = true) {
  const g = new THREE.Group();
  [[0, 0, 0, 0.34], [0.32, -0.06, 0.04, 0.26], [-0.31, -0.07, 0, 0.25], [0.06, 0.15, -0.06, 0.26], [-0.12, -0.08, 0.2, 0.22], [0.16, -0.1, -0.18, 0.22]]
    .forEach(([x, y, z, r]) => { const m = mesh(SPHERE, mat, { cast, receive: false }); m.scale.set(r * s, r * s * 0.86, r * s); m.position.set(x * s, y * s, z * s); g.add(m); });
  return g;
}
function radialTex(inner, outer, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function rrect(path, w, h, r, cx = 0, cy = 0) {
  const x = cx - w / 2, y = cy - h / 2;
  path.moveTo(x + r, y); path.lineTo(x + w - r, y); path.quadraticCurveTo(x + w, y, x + w, y + r);
  path.lineTo(x + w, y + h - r); path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  path.lineTo(x + r, y + h); path.quadraticCurveTo(x, y + h, x, y + h - r);
  path.lineTo(x, y + r); path.quadraticCurveTo(x, y, x + r, y);
  return path;
}
// Fit a perspective camera along `dir` so that all `pts` are visible, centered.
function fitCamera(camera, pts, dir, target, margin = 0.9) {
  const D = dir.clone().normalize();
  const R = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), D).normalize();
  const U = new THREE.Vector3().crossVectors(D, R).normalize();
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of pts) { const q = p.clone().sub(target); const x = q.dot(R), y = q.dot(U); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
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
function addLights(scene, shadowSize = 7) {
  scene.add(new THREE.HemisphereLight(0xFFFFFF, 0xE6D6BA, 1.85));
  const key = new THREE.DirectionalLight(0xFFF2E0, 2.5);
  key.position.set(-6, 12, 7); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  const sc = key.shadow.camera; sc.left = -shadowSize; sc.right = shadowSize; sc.top = shadowSize; sc.bottom = -shadowSize; sc.near = 1; sc.far = 40;
  key.shadow.bias = -0.0006; key.shadow.normalBias = 0.025;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xD8E0FF, 0.75); fill.position.set(9, 4, -5); scene.add(fill);
  const front = new THREE.DirectionalLight(0xFFFFFF, 0.5); front.position.set(6, 3, 10); scene.add(front);
}

/* ---------------- stage runner (visibility, DPR, reduced motion, fallback) ---------------- */
function createStage(el, setup) {
  if (!el) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, stencil: true, powerPreference: 'high-performance' });
    if (!renderer.getContext()) throw new Error('no gl');
  } catch (e) { el.classList.add('is-fallback'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(20, 1, 0.5, 200);
  const api = setup({ scene, camera, renderer, el });
  let t = api.startTime || 0, last = 0, raf = 0, inView = false, running = false;
  const resize = () => {
    const r = el.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false); camera.aspect = w / h; api.fit(); camera.updateProjectionMatrix();
  };
  const draw = (time, dt) => { api.update(time, dt); renderer.render(scene, camera); };
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now; t += dt;
    draw(t, dt);
  };
  const start = () => { if (running || REDUCED) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  const sync = () => ((inView && !document.hidden) ? start() : stop());
  resize();
  draw(REDUCED ? api.staticTime : t, 0);
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { rootMargin: '80px' }).observe(el);
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(() => { resize(); if (!running) draw(REDUCED ? api.staticTime : t, 0); }).observe(el);
  renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stop(); el.classList.add('is-fallback'); renderer.domElement.style.display = 'none'; });
  api.onPoke = () => { if (!running) draw(REDUCED ? api.staticTime : t, 0); };
}

/* ======================================================================
   SCENE 1 — THE IMPOSSIBLE DESK
   ====================================================================== */
function deskScene({ scene, camera, el }) {
  camera.fov = 20;
  addLights(scene, 7.5);
  const world = new THREE.Group(); scene.add(world);

  const ivoryM = clay(0xF4EBDA, { roughness: 0.74 });
  const paperM = clay(C.paper, { roughness: 0.7 });
  const blueM = clay(C.blue, { roughness: 0.56 });
  const blue2M = clay(C.blue2, { roughness: 0.6 });
  const coralM = clay(C.coral, { roughness: 0.5 });
  const ledM = new THREE.MeshStandardMaterial({ color: C.coral, emissive: C.coral, emissiveIntensity: 0.9, roughness: 0.4 });

  // Stencil helpers: portal content only where the screen is; ground blob never there.
  const inPortal = (m) => Object.assign(m, { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp });
  const outPortal = (m) => Object.assign(m, { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.NotEqualStencilFunc, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp });

  /* desk slab: ivory top on a coral underlayer, floating */
  const DW = 7.6, DD = 4.6;
  const slab = mesh(rbox(DW, 0.34, DD, 0.15, 4), ivoryM); slab.position.y = -0.17; world.add(slab);
  const under = mesh(rbox(DW - 0.3, 0.14, DD - 0.3, 0.06, 3), coralM); under.position.y = -0.4; world.add(under);
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 7.5), outPortal(new THREE.MeshBasicMaterial({ map: radialTex('rgba(20,40,110,0.30)', 'rgba(20,40,110,0)'), transparent: true, depthWrite: false })));
  blob.rotation.x = -Math.PI / 2; blob.position.y = -2.0; world.add(blob);

  /* monitor */
  const monitor = new THREE.Group(); monitor.position.set(-1.2, 0, -1.1); monitor.rotation.y = 0.32; world.add(monitor);
  const MW = 3.45, MH = 2.2, MD = 0.2, SW = 3.1, SH = 1.78, MY = 2.08, HOLE_Y = 0.07;
  const mBase = mesh(rbox(1.35, 0.1, 0.9, 0.045), blueM); mBase.position.y = 0.05; monitor.add(mBase);
  const neck = mesh(rbox(0.28, 1.2, 0.16, 0.07), blueM); neck.position.set(0, 0.68, -0.2); monitor.add(neck);
  const shape = rrect(new THREE.Shape(), MW, MH, 0.16);
  shape.holes.push(rrect(new THREE.Path(), SW, SH, 0.05, 0, HOLE_Y));
  const bezelG = new THREE.ExtrudeGeometry(shape, { depth: MD - 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 10 });
  bezelG.translate(0, 0, -(MD - 0.08) / 2);
  const bezel = mesh(bezelG, blueM); bezel.position.y = MY; monitor.add(bezel);
  const hump = mesh(rbox(2.3, 1.45, 0.34, 0.14), blueM); hump.position.set(0, MY - 0.05, -0.2); monitor.add(hump);
  const pwr = mesh(new THREE.SphereGeometry(0.035, 12, 8), ledM, { cast: false }); pwr.position.set(MW / 2 - 0.25, MY - MH / 2 + 0.085, MD / 2 + 0.03); monitor.add(pwr);

  // portal: stencil mask + depth reset + an "impossible" room behind the glass
  const portal = new THREE.Group(); portal.position.set(0, MY + HOLE_Y, 0.03); monitor.add(portal);
  const screenG = new THREE.PlaneGeometry(SW + 0.02, SH + 0.02);
  const mask = new THREE.Mesh(screenG, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp }));
  mask.renderOrder = 1; portal.add(mask);
  const reset = new THREE.Mesh(screenG, inPortal(new THREE.ShaderMaterial({
    vertexShader: 'void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w * 0.99999; }',
    fragmentShader: 'void main(){ gl_FragColor = vec4(0.0); }',
    colorWrite: false, depthWrite: true, depthFunc: THREE.AlwaysDepth,
  })));
  reset.renderOrder = 2; portal.add(reset);

  // Everything behind the glass is placed along the camera's real rays through the screen
  // (P(depth, ox, oy) always lands on screen point ox,oy), so the room reads as deeper than the monitor.
  const CAM_DIR = new THREE.Vector3(1, 0.8, 1).normalize();
  const camL = new THREE.Vector3(0, 0, 30);
  const P = (d, ox, oy) => { const S = new THREE.Vector3(ox, oy, 0); return camL.clone().add(S.sub(camL).multiplyScalar((camL.z + d) / camL.z)); };

  const sunO = new THREE.Vector2(0.62, 0.3);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(16, 48, 32), inPortal(new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      camL: { value: camL }, uC: { value: new THREE.Vector3() }, sunO: { value: sunO },
      cTop: { value: new THREE.Color(0x9DB2EA) }, cMid: { value: new THREE.Color(0xDCE5F7) },
      cLow: { value: new THREE.Color(0xFFE4D2) }, cGlow: { value: new THREE.Color(0xFFB79E) },
    },
    vertexShader: 'uniform vec3 uC; varying vec3 vP; void main(){ vP = position + uC; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 camL; uniform vec2 sunO; uniform vec3 cTop, cMid, cLow, cGlow; varying vec3 vP;
      void main(){
        vec2 o = camL.xy + (vP.xy - camL.xy) * (camL.z / (camL.z - vP.z));
        vec3 col = mix(cLow, cMid, smoothstep(-1.0, 0.2, o.y));
        col = mix(col, cTop, smoothstep(0.1, 1.1, o.y));
        vec2 q = o - sunO; float g = exp(-dot(q, q) * 2.2);
        col = mix(col, cGlow, g * 0.8);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  })));
  sky.renderOrder = 3; portal.add(sky);

  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 20), inPortal(new THREE.MeshBasicMaterial({ color: C.coral })));
  sunMesh.renderOrder = 3; portal.add(sunMesh);
  const halo = new THREE.Sprite(inPortal(new THREE.SpriteMaterial({ map: radialTex('rgba(255,140,105,0.8)', 'rgba(255,170,140,0)'), transparent: true, depthWrite: false })));
  halo.scale.setScalar(2.6); halo.renderOrder = 4; portal.add(halo);

  // keycap staircase descending into the screen, shrinking toward the sun
  const capBaseG = rbox(0.56, 0.24, 0.56, 0.1), capTopG = rbox(0.43, 0.07, 0.43, 0.03, 2);
  const stepIvory = inPortal(clay(0xFBF5EA, { roughness: 0.7 })), stepTop = inPortal(clay(0xFFFFFF, { roughness: 0.75 }));
  const stepCoral = inPortal(clay(C.coral, { roughness: 0.55 })), stepBlue = inPortal(clay(C.blue2, { roughness: 0.6 }));
  const steps = [];
  const N = 7;
  for (let i = 0; i < N; i++) {
    const g = new THREE.Group();
    const base = mesh(capBaseG, i % 4 === 2 ? stepCoral : i % 4 === 0 && i ? stepBlue : stepIvory, { cast: false, receive: false });
    const top = mesh(capTopG, stepTop, { cast: false, receive: false }); top.position.y = 0.135;
    base.renderOrder = top.renderOrder = 3;
    g.add(base, top);
    g.rotation.y = 0.2 - i * 0.06;
    g.userData = { i, base: new THREE.Vector3() };
    portal.add(g); steps.push(g);
  }
  const cloudInM = inPortal(clay(0xFFFFFF, { roughness: 0.9, emissive: 0xFFFFFF, emissiveIntensity: 0.12 }));
  const innerClouds = [[6, -0.95, 0.5, 0.75], [3.5, 1.05, -0.48, 0.55]].map(([d, ox, oy, s]) => {
    const c = cloudGroup(cloudInM, s, false); c.traverse((o) => { o.renderOrder = 3; });
    c.userData = { d, ox, oy, base: new THREE.Vector3() }; portal.add(c); return c;
  });
  function layoutPortal() {
    sky.position.copy(P(9, 0, 0)); sky.material.uniforms.uC.value.copy(sky.position);
    sunMesh.position.copy(P(12, sunO.x, sunO.y)); halo.position.copy(P(11.6, sunO.x, sunO.y));
    steps.forEach((g) => {
      const t = g.userData.i / (N - 1);
      g.position.copy(P(0.4 + t * 9.2, -1.0 + 1.42 * t, -0.56 + 0.76 * Math.pow(t, 1.4) + Math.sin(t * Math.PI) * 0.14));
      g.scale.setScalar(1 - 0.55 * t);
      g.userData.base.copy(g.position);
    });
    innerClouds.forEach((c) => { c.position.copy(P(c.userData.d, c.userData.ox, c.userData.oy)); c.userData.base.copy(c.position); });
  }

  /* keyboard */
  const kb = new THREE.Group(); kb.position.set(0.3, 0, 1.08); kb.rotation.y = 0.12; world.add(kb);
  const kbBase = mesh(rbox(3.55, 0.2, 1.46, 0.08), blueM); kbBase.position.y = 0.1; kb.add(kbBase);
  const kbLip = mesh(rbox(3.35, 0.05, 1.28, 0.02, 2), blue2M); kbLip.position.y = 0.205; kb.add(kbLip);
  const PITCH = 0.268, KEY = { w: 0.22, h: 0.13, d: 0.22 }, KY = 0.3;
  const keyG = rbox(KEY.w, KEY.h, KEY.d, 0.045);
  const fly = [[0, 2], [1, 9], [2, 4], [0, 7], [1, 1], [2, 10], [0, 11], [1, 5]]; // row, col — order of take-off
  const flySet = new Set(fly.map(([r, c]) => `${r},${c}`));
  const slots = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 12; c++) if (!flySet.has(`${r},${c}`)) slots.push([r, c]);
  const keyMat = clay(0xFFFFFF, { roughness: 0.7 });
  const inst = new THREE.InstancedMesh(keyG, keyMat, slots.length); inst.castShadow = true; inst.receiveShadow = true;
  const mtx = new THREE.Matrix4(), col = new THREE.Color();
  const keyPos = (r, c) => new THREE.Vector3(-1.474 + c * PITCH, KY, -0.54 + r * PITCH);
  slots.forEach(([r, c], i) => {
    mtx.makeTranslation(keyPos(r, c)); inst.setMatrixAt(i, mtx);
    col.setHex((r === 0 && c === 0) || (r === 2 && c === 11) ? C.coral : r === 3 && (c === 0 || c === 11) ? 0xC9D3F2 : 0xFBF6EC);
    inst.setColorAt(i, col);
  });
  kb.add(inst);
  const space = mesh(rbox(1.62, 0.13, 0.22, 0.045), clay(0xFBF6EC, { roughness: 0.7 })); space.position.set(0, KY, -0.54 + 4 * PITCH); kb.add(space);
  [-1.474, -1.206, 1.206, 1.474].forEach((x) => { const k = mesh(keyG, clay(0xFBF6EC, { roughness: 0.7 })); k.position.set(x, KY, -0.54 + 4 * PITCH); kb.add(k); });

  /* server rack — built from flying keys */
  const rack = new THREE.Group(); rack.position.set(2.75, 0, -1.15); rack.rotation.y = -0.08; world.add(rack);
  [-0.8, 0.8].forEach((x) => { const p = mesh(rbox(0.13, 2.45, 0.98, 0.05), blue2M); p.position.set(x, 1.225, 0); rack.add(p); });
  const rTop = mesh(rbox(1.76, 0.14, 1.08, 0.06), blue2M); rTop.position.y = 2.5; rack.add(rTop);
  const rBot = mesh(rbox(1.76, 0.16, 1.08, 0.06), blue2M); rBot.position.y = 0.08; rack.add(rBot);
  const UNIT = { w: 1.42, h: 0.2, d: 0.86 };
  const slotY = (j) => 0.36 + j * 0.262;
  const unitG = rbox(1, 1, 1, 0.12, 3);
  kb.updateMatrix(); rack.updateMatrix(); monitor.updateMatrix();
  const flyers = fly.map(([r, c], j) => {
    const m = mesh(unitG, clay(0xFBF6EC, { roughness: 0.66 }));
    const a = keyPos(r, c).applyMatrix4(kb.matrix);
    const b = new THREE.Vector3(0, slotY(j), 0.02).applyMatrix4(rack.matrix);
    const ctrl = a.clone().add(b).multiplyScalar(0.5).add(new THREE.Vector3(-0.2, 2.5 + (j % 3) * 0.35, 0.9));
    const led = mesh(new THREE.SphereGeometry(0.04, 12, 8), ledM.clone(), { cast: false }); led.position.set(0.5, slotY(j), 0.46); rack.add(led);
    const vent = mesh(rbox(0.62, 0.05, 0.02, 0.008, 1), blue2M, { cast: false }); vent.position.set(-0.22, slotY(j), 0.45); rack.add(vent);
    world.add(m);
    return { m, a, b, ctrl, led, vent, j };
  });
    const qb = (a, c, b, t) => { const u = 1 - t; return new THREE.Vector3(u * u * a.x + 2 * u * t * c.x + t * t * b.x, u * u * a.y + 2 * u * t * c.y + t * t * b.y, u * u * a.z + 2 * u * t * c.z + t * t * b.z); };

  /* mug + rain cloud */
  const mug = new THREE.Group(); mug.position.set(2.95, 0, 1.3); world.add(mug);
  const mugM = clay(C.paper, { roughness: 0.62, side: THREE.DoubleSide });
  const body = mesh(new THREE.CylinderGeometry(0.37, 0.33, 0.72, 40, 1, true), mugM); body.position.y = 0.36; mug.add(body);
  const bottom = mesh(new THREE.CircleGeometry(0.33, 32), mugM); bottom.rotation.x = -Math.PI / 2; bottom.position.y = 0.01; mug.add(bottom);
  const coffee = mesh(new THREE.CircleGeometry(0.355, 32), clay(0x7A5038, { roughness: 0.35 }), { cast: false }); coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.58; mug.add(coffee);
  const rim = mesh(new THREE.TorusGeometry(0.37, 0.028, 10, 48), mugM); rim.rotation.x = Math.PI / 2; rim.position.y = 0.72; mug.add(rim);
  const band = mesh(new THREE.CylinderGeometry(0.356, 0.346, 0.16, 40, 1, true), coralM); band.position.y = 0.4; mug.add(band);
  const handle = mesh(new THREE.TorusGeometry(0.17, 0.05, 12, 28, Math.PI * 1.15), mugM); handle.rotation.z = -Math.PI / 2 - 0.07; handle.position.set(0.36, 0.38, 0); mug.add(handle);
  mug.rotation.y = -0.6;
  const rainCloud = cloudGroup(clay(0xFFFFFF, { roughness: 0.92, emissive: 0xFFFFFF, emissiveIntensity: 0.1 }), 0.95);
  rainCloud.position.set(2.95, 1.75, 1.3); world.add(rainCloud);
  const dropG = new THREE.CapsuleGeometry(0.022, 0.1, 4, 8);
  const drops = Array.from({ length: 7 }, (_, i) => {
    const d = mesh(dropG, blue2M, { cast: false }); const a = i * 2.39;
    d.userData = { x: Math.cos(a) * 0.17 * ((i % 3) / 2 + 0.3), z: Math.sin(a) * 0.17 * ((i % 3) / 2 + 0.3), o: i / 7 };
    world.add(d); return d;
  });

  /* coral cable — an impossible floating knot between monitor and keyboard */
  const pts = [];
  pts.push(new THREE.Vector3(0.35, 1.2, -0.38).applyMatrix4(monitor.matrix));
  pts.push(new THREE.Vector3(0.1, 0.35, -0.75).applyMatrix4(monitor.matrix));
  pts.push(new THREE.Vector3(-1.6, 0.06, -2.0), new THREE.Vector3(-3.1, 0.06, -1.5), new THREE.Vector3(-3.25, 0.25, -0.2));
  const knotC = new THREE.Vector3(-2.85, 1.55, 0.75), knotQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
  for (let i = 0; i <= 44; i++) {
    const u = 0.35 + (i / 44) * (Math.PI * 2 - 0.7);
    const p = new THREE.Vector3(Math.sin(u) + 2 * Math.sin(2 * u), Math.cos(u) - 2 * Math.cos(2 * u), -Math.sin(3 * u)).multiplyScalar(0.21).applyQuaternion(knotQ).add(knotC);
    pts.push(p);
  }
  pts.push(new THREE.Vector3(-2.7, 0.3, 1.7), new THREE.Vector3(-2.2, 0.06, 1.55));
  pts.push(new THREE.Vector3(-1.82, 0.12, 0.05).applyMatrix4(kb.matrix), new THREE.Vector3(-1.7, 0.14, -0.3).applyMatrix4(kb.matrix));
  const cable = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 520, 0.05, 10, false), coralM);
  world.add(cable);
  const plug = mesh(rbox(0.16, 0.12, 0.2, 0.04), paperM); plug.position.copy(pts[pts.length - 1]); plug.rotation.y = kb.rotation.y; world.add(plug);

  /* keycaps drifting upward like birds */
  const birds = Array.from({ length: 4 }, (_, i) => {
    const b = mesh(keyG, clay(i === 1 ? C.coral : 0xFBF6EC, { roughness: 0.7 }), { cast: true, receive: false });
    b.userData = { x: -0.9 + i * 0.8, z: 0.4 + (i % 2) * 0.5, o: i / 4 }; world.add(b); return b;
  });

  /* interaction: hover tilt + drag turntable */
  let hoverX = 0, drag = 0, dragging = false, lastX = 0, rotY = 0;
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect(); hoverX = (e.clientX - r.left) / r.width - 0.5;
    if (dragging) { drag += (e.clientX - lastX) * 0.009; lastX = e.clientX; }
    api.onPoke?.();
  });
  el.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; });
  const end = () => { dragging = false; };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  el.addEventListener('pointerleave', () => { dragging = false; hoverX = 0; });

  const CYCLE = 18;
  const api = {
    startTime: 4.6,
    staticTime: 6.4,
    fit() {
      const ps = [];
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [0, -0.47]) ps.push(new THREE.Vector3(sx * DW / 2, y, sz * DD / 2));
      for (const sx of [-1, 1]) ps.push(new THREE.Vector3(sx * MW / 2, MY + MH / 2 + 0.05, 0.1).applyMatrix4(monitor.matrix));
      ps.push(new THREE.Vector3(3.6, 2.6, -1.7), new THREE.Vector3(2.95, 2.2, 1.3), new THREE.Vector3(-2.85, 2.3, 0.75), new THREE.Vector3(0, -1.2, 2.2), new THREE.Vector3(0.6, 3.2, -0.2));
      const all = [];
      for (const a of [-0.16, 0, 0.16]) for (const p of ps) all.push(p.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), a));
      fitCamera(camera, all, CAM_DIR, new THREE.Vector3(0, 0.8, 0), camera.aspect < 0.9 ? 1.0 : 0.97);
      const ry = world.rotation.y, py = world.position.y;
      world.rotation.y = 0; world.position.y = 0; world.updateMatrixWorld(true);
      camL.copy(portal.worldToLocal(camera.position.clone()));
      world.rotation.y = ry; world.position.y = py; world.updateMatrixWorld(true);
      layoutPortal();
    },
    update(t) {
      const target = (REDUCED ? 0 : Math.sin(t * 0.17) * 0.1) + hoverX * 0.35 + drag;
      rotY += (target - rotY) * (REDUCED ? 1 : 0.06);
      world.rotation.y = rotY;
      world.position.y = Math.sin(t * 0.7) * 0.06;

      const ct = t % CYCLE;
      for (const f of flyers) {
        const a0 = 0.5 + f.j * 0.95, b0 = 12.8 + f.j * 0.28;
        const p = ct < 12.5 ? ease(clamp01((ct - a0) / 2.5)) : 1 - ease(clamp01((ct - b0) / 1.9));
        const k = smooth(0.62, 0.98, p);
        f.m.position.copy(qb(f.a, f.ctrl, f.b, p));
        if (p > 0 && p < 1) f.m.position.y += Math.sin(p * Math.PI * 3) * 0.06;
        f.m.scale.set(lerp(KEY.w, UNIT.w, k), lerp(KEY.h, UNIT.h, k), lerp(KEY.d, UNIT.d, k));
        const spin = Math.sin(p * Math.PI);
        f.m.rotation.set(spin * 1.2 * (f.j % 2 ? 1 : -1) * (1 - k), lerp(kb.rotation.y, rack.rotation.y, p) + spin * 0.6, spin * 0.5 * (1 - k));
        const docked = p > 0.985;
        f.led.visible = f.vent.visible = docked;
        if (docked) f.led.material.emissiveIntensity = 0.5 + 0.5 * Math.max(0, Math.sin(t * 5 + f.j * 1.3));
      }
      steps.forEach((s) => { const i = s.userData.i; s.position.y = s.userData.base.y + Math.sin(t * 1.1 + i * 0.7) * 0.05; });
      innerClouds.forEach((c, i) => { c.position.x = c.userData.base.x + Math.sin(t * 0.25 + i * 2) * 0.35; });
      halo.material.opacity = 0.85 + Math.sin(t * 1.4) * 0.15;
      rainCloud.position.y = 1.75 + Math.sin(t * 1.3) * 0.05;
      drops.forEach((d) => {
        const u = (t * 1.1 + d.userData.o) % 1;
        d.position.set(2.95 + d.userData.x, rainCloud.position.y - 0.22 - u * 0.95, 1.3 + d.userData.z);
        d.scale.setScalar(u > 0.92 ? (1 - u) / 0.08 : 1);
      });
      birds.forEach((b, i) => {
        const u = (t * 0.075 + b.userData.o) % 1;
        const p = new THREE.Vector3(b.userData.x + Math.sin(u * 6 + i) * 0.3, 0.5 + u * 3.6, b.userData.z - u * 1.6);
        b.position.copy(p).applyMatrix4(kb.matrix);
        b.rotation.set(Math.sin(t * 2 + i) * 0.5, t * 0.6 + i, Math.cos(t * 1.7 + i) * 0.4);
        b.scale.setScalar(Math.min(smooth(0, 0.12, u), 1 - smooth(0.8, 1, u)));
      });
    },
  };
  return api;
}

/* ======================================================================
   SCENE 2 — AGENT GRID (Slayb)
   ====================================================================== */
function agentsScene({ scene, camera, el }) {
  camera.fov = 22;
  addLights(scene, 7);
  const root = new THREE.Group(); scene.add(root);
  const tileM = clay(C.paper, { roughness: 0.72 });
  const blueM = clay(C.blue, { roughness: 0.56 });
  const blue2M = clay(C.blue2, { roughness: 0.6 });
  const lineM = clay(0xF1E6D0, { roughness: 0.8 });
  const cCoral = new THREE.Color(C.coral), cIdle = new THREE.Color(0x3A55B4), cDone = new THREE.Color(0x6F86D6);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ color: C.blue, opacity: 0.13 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -1.1; ground.receiveShadow = true; root.add(ground);

  const PITCH = 1.95, TS = 1.55;
  const cell = (r, c) => new THREE.Vector3((c - 1.5) * PITCH, 0, (r - 1) * PITCH);
  const order = [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [2, 2], [2, 1], [2, 0], [1, 0]];
  const agents = order.map(([r, c], k) => {
    const g = new THREE.Group(); g.position.copy(cell(r, c)); root.add(g);
    const tile = mesh(rbox(TS, 0.22, TS, 0.09), tileM); tile.position.y = -0.11; g.add(tile);
    const mon = new THREE.Group(); mon.position.set(0, 0, -0.18); g.add(mon);
    const base = mesh(rbox(0.46, 0.05, 0.3, 0.02, 2), blueM); base.position.y = 0.025; mon.add(base);
    const neck = mesh(rbox(0.09, 0.34, 0.07, 0.03, 2), blueM); neck.position.set(0, 0.2, -0.06); mon.add(neck);
    const bodyM = mesh(rbox(1.02, 0.68, 0.09, 0.04), blueM); bodyM.position.set(0, 0.62, 0); mon.add(bodyM);
    const scrM = new THREE.MeshStandardMaterial({ color: cIdle.clone(), roughness: 0.45, emissive: cCoral.clone(), emissiveIntensity: 0 });
    const scr = mesh(new THREE.PlaneGeometry(0.88, 0.54), scrM, { cast: false }); scr.position.set(0, 0.63, 0.047); mon.add(scr);
    const lines = [0.62, 0.42, 0.52].map((w, i) => {
      const l = mesh(new THREE.PlaneGeometry(1, 0.055), new THREE.MeshBasicMaterial({ color: 0xFFFDF8, transparent: true, opacity: 0.85 }), { cast: false, receive: false });
      l.position.set(-0.36, 0.75 - i * 0.12, 0.05); l.userData.w = w; l.scale.x = w * 0.6; l.geometry.translate(0.5, 0, 0); mon.add(l); return l;
    });
    const kbd = mesh(rbox(0.66, 0.05, 0.22, 0.02, 2), blue2M); kbd.position.set(0, 0.025, 0.46); g.add(kbd);
    const led = mesh(new THREE.SphereGeometry(0.045, 12, 8), new THREE.MeshStandardMaterial({ color: 0xC9D3F2, emissive: C.coral, emissiveIntensity: 0, roughness: 0.4 }), { cast: false });
    led.position.set(0.58, 0.04, 0.58); g.add(led);
    return { g, scrM, lines, led, k, phase: Math.random() * 6 };
  });
  // central server: two rack towers on a wide tile
  const srv = new THREE.Group(); srv.position.set(0, 0, 0); root.add(srv);
  const bigTile = mesh(rbox(PITCH + TS, 0.26, TS, 0.1), tileM); bigTile.position.y = -0.13; srv.add(bigTile);
  const leds = [];
  [[-0.72, 2.05], [0.72, 1.55]].forEach(([x, h], ti) => {
    const tower = mesh(rbox(1.2, h, 0.95, 0.08), blueM); tower.position.set(x, h / 2, -0.1); srv.add(tower);
    const n = Math.floor((h - 0.25) / 0.26);
    for (let i = 0; i < n; i++) {
      const y = 0.22 + i * 0.26;
      const face = mesh(rbox(1.02, 0.19, 0.04, 0.015, 1), blue2M, { cast: false }); face.position.set(x, y, 0.385); srv.add(face);
      const vent = mesh(new THREE.PlaneGeometry(0.5, 0.04), lineM, { cast: false }); vent.position.set(x - 0.18, y, 0.407); srv.add(vent);
      const l = mesh(new THREE.SphereGeometry(0.038, 10, 8), new THREE.MeshStandardMaterial({ color: 0x8FA2E0, emissive: C.coral, emissiveIntensity: 0, roughness: 0.4 }), { cast: false });
      l.position.set(x + 0.36, y, 0.41); srv.add(l); leds.push({ l, i, ti });
    }
  });
  const cloud = cloudGroup(clay(0xFFFFFF, { roughness: 0.92, emissive: 0xFFFFFF, emissiveIntensity: 0.1 }), 1.25);
  cloud.position.set(0, 3.35, -0.1); root.add(cloud);

  const pkG = rbox(0.2, 0.2, 0.2, 0.05, 2);
  const packets = Array.from({ length: 7 }, () => { const p = mesh(pkG, new THREE.MeshStandardMaterial({ color: C.coral, emissive: C.coral, emissiveIntensity: 0.35, roughness: 0.45 }), { cast: true, receive: false }); root.add(p); return p; });

  const top = (a) => a.g.position.clone().add(new THREE.Vector3(0, 1.12, -0.18));
  const srvIn = new THREE.Vector3(0, 2.25, -0.1);
  const arc = (a, b, s, h) => a.clone().lerp(b, s).add(new THREE.Vector3(0, Math.sin(s * Math.PI) * h, 0));
  const ARR = [0.7, 1.85, 3.0, 4.15], DWELL = 0.55, HOP = 0.6;
  const steps = Array.from(document.querySelectorAll('#agent-steps li'));
  let lastStage = -1;

  let hoverX = 0;
  el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); hoverX = (e.clientX - r.left) / r.width - 0.5; api.onPoke?.(); });
  el.addEventListener('pointerleave', () => { hoverX = 0; });
  let rot = 0;
  const CAM_DIR = new THREE.Vector3(0.62, 1.05, 1.25);

  const api = {
    startTime: 4.9,
    staticTime: 6.6,
    fit() {
      const ps = [];
      for (const x of [-3.7, 3.7]) for (const z of [-2.75, 2.75]) for (const y of [-0.25, 1.05]) ps.push(new THREE.Vector3(x, y, z));
      ps.push(new THREE.Vector3(0, 3.9, -0.1), new THREE.Vector3(-0.7, 3.9, -0.1), new THREE.Vector3(0.7, 3.9, -0.1));
      fitCamera(camera, ps, CAM_DIR, new THREE.Vector3(0, 0.6, 0), camera.aspect < 0.9 ? 0.97 : 0.9);
    },
    update(t) {
      rot += ((REDUCED ? 0 : Math.sin(t * 0.2) * 0.06) + hoverX * 0.25 - rot) * (REDUCED ? 1 : 0.05);
      root.rotation.y = rot;
      const ct = t % 12;
      agents.forEach((a, i) => { a.g.position.y = Math.sin(t * 0.9 + i * 0.8) * 0.05; });
      srv.position.y = Math.sin(t * 0.6) * 0.03;
      // agent activity
      agents.forEach((a, i) => {
        let on = 0, done = 0;
        if (i < 4) { on = smooth(ARR[i] - 0.1, ARR[i] + 0.15, ct) * (1 - smooth(ARR[i] + DWELL + 0.3, ARR[i] + DWELL + 0.8, ct)); done = smooth(ARR[i] + 0.5, ARR[i] + 0.9, ct) * (1 - smooth(10.6, 11.4, ct)); }
        else { on = smooth(5.35, 5.6, ct) * (1 - smooth(8.1, 8.5, ct)); done = smooth(8.2, 8.6, ct) * (1 - smooth(10.6, 11.4, ct)); }
        const c = cIdle.clone().lerp(cDone, done * 0.8).lerp(cCoral, on);
        a.scrM.color.copy(c); a.scrM.emissiveIntensity = on * 0.45;
        a.led.material.emissiveIntensity = Math.max(on, done * 0.6) * 1.1;
        a.led.material.color.setHex(on || done > 0.3 ? C.coral : 0xC9D3F2);
        a.lines.forEach((l, j) => { const typing = on > 0.5 ? (0.25 + 0.75 * ((t * 1.6 + j * 0.37 + a.phase) % 1)) : 0.6; l.scale.x = l.userData.w * typing; l.material.color.setHex(on > 0.5 ? C.blue : 0xFFFDF8); });
      });
      // packets
      packets.forEach((p) => { p.visible = false; });
      const p0 = packets[0];
      if (ct < ARR[0]) { const s = ease(clamp01(ct / ARR[0])); p0.visible = true; p0.position.copy(top(agents[0])).add(new THREE.Vector3(0, (1 - s) * 2.2, 0)); }
      for (let i = 0; i < 4; i++) {
        const lv = ARR[i] + DWELL;
        if (ct >= ARR[i] && ct < lv) { p0.visible = true; p0.position.copy(top(agents[i])); }
        if (i < 3 && ct >= lv && ct < ARR[i + 1]) { p0.visible = true; p0.position.copy(arc(top(agents[i]), top(agents[i + 1]), ease((ct - lv) / HOP), 0.6)); }
      }
      for (let k = 0; k < 6; k++) {
        const p = packets[k + 1], a = agents[4 + k];
        if (ct >= 4.7 && ct < 5.5) { p.visible = true; p.position.copy(arc(top(agents[3]), top(a), ease((ct - 4.7) / 0.8), 1.4)); }
        else if (ct >= 5.5 && ct < 8.2) { p.visible = true; p.position.copy(top(a)); p.position.y += Math.abs(Math.sin(t * 4 + k)) * 0.12; }
        else if (ct >= 8.2 && ct < 9.0) { p.visible = true; p.position.copy(arc(top(a), srvIn, ease((ct - 8.2) / 0.8), 1.0)); }
      }
      if (ct >= 9.6 && ct < 10.3) { p0.visible = true; p0.position.copy(arc(srvIn, cloud.position.clone().add(new THREE.Vector3(0, -0.2, 0)), ease((ct - 9.6) / 0.7), 0.2)); }
      packets.forEach((p) => { p.rotation.set(t * 1.3, t * 1.7, 0); });
      // server LEDs wave + cloud pop
      const srvOn = smooth(8.9, 9.2, ct) * (1 - smooth(10.8, 11.4, ct));
      leds.forEach(({ l, i, ti }) => { const w = 0.5 + 0.5 * Math.sin(t * 6 - i * 0.9 - ti); l.material.emissiveIntensity = srvOn * (0.4 + 0.8 * w) + 0.08; l.material.color.setHex(srvOn > 0.2 ? C.coral : 0x8FA2E0); });
      const pop = smooth(10.2, 10.4, ct) * (1 - smooth(10.5, 11.2, ct));
      cloud.scale.setScalar(1 + pop * 0.12);
      cloud.position.y = 3.35 + Math.sin(t * 0.8) * 0.06;
      // legend sync
      const stage = ct < 1.85 ? 0 : ct < 4.7 ? 1 : ct < 8.2 ? 2 : 3;
      if (stage !== lastStage) { steps.forEach((li, i) => li.classList.toggle('is-on', i === stage)); lastStage = stage; }
    },
  };
  return api;
}

createStage(document.getElementById('desk-stage'), deskScene);
createStage(document.getElementById('agents-stage'), agentsScene);
