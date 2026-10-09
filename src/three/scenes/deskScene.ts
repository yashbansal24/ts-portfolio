// SCENE 1 — THE IMPOSSIBLE DESK (hero).
// One of each object: monitor (with keycap staircase into a coral sun behind the glass), keyboard
// whose keys fly off and dock into ONE server rack, mug under a rain cloud, coral cable knot.
// Only clouds repeat. The desk sways and floats on its own; drag / hover add a turn on top.
import * as THREE from 'three';
import type { SceneFactory } from '../types';
import { C, addLights, clamp01, createKit, createRenderer, ease, fitCamera, lerp, qbez, rrect, smooth } from '../kit';

const create: SceneFactory = (canvas, { container: el, dpr, reducedMotion: REDUCED, requestRender }) => {
  const renderer = createRenderer(canvas, dpr, { stencil: true });
  const kit = createKit();
  const { clay, roundedBox: rbox, mesh, cloud: cloudGroup, radialTex } = kit;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(20, 1, 0.5, 200);
  addLights(scene, 7.5);
  const world = new THREE.Group(); scene.add(world);

  const ivoryM = clay(0xf4ebda, { roughness: 0.74 });
  const paperM = clay(C.paper, { roughness: 0.7 });
  const blueM = clay(C.blue, { roughness: 0.56 });
  const blue2M = clay(C.blue2, { roughness: 0.6 });
  const coralM = clay(C.coral, { roughness: 0.5 });
  const ledM = clay(C.coral, { emissive: C.coral, emissiveIntensity: 0.9, roughness: 0.4 });

  // Stencil helpers: portal content only where the screen is; ground blob never there.
  const stencilBase = { stencilWrite: true, stencilRef: 1, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp } as const;
  const inPortal = <M extends THREE.Material>(m: M): M => Object.assign(m, stencilBase, { stencilFunc: THREE.EqualStencilFunc });
  const outPortal = <M extends THREE.Material>(m: M): M => Object.assign(m, stencilBase, { stencilFunc: THREE.NotEqualStencilFunc });

  /* desk slab: ivory top on a coral underlayer, floating */
  const DW = 7.6, DD = 4.6;
  const slab = mesh(rbox(DW, 0.34, DD, 0.15, 4), ivoryM); slab.position.y = -0.17; world.add(slab);
  const under = mesh(rbox(DW - 0.3, 0.14, DD - 0.3, 0.06, 3), coralM); under.position.y = -0.4; world.add(under);
  const blob = new THREE.Mesh(
    new THREE.PlaneGeometry(10.5, 7.5),
    outPortal(new THREE.MeshBasicMaterial({ map: radialTex('rgba(20,40,110,0.30)', 'rgba(20,40,110,0)'), transparent: true, depthWrite: false })),
  );
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
  const mask = new THREE.Mesh(screenG, new THREE.MeshBasicMaterial({
    colorWrite: false, depthWrite: false, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp,
  }));
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
  const P = (d: number, ox: number, oy: number) => {
    const S = new THREE.Vector3(ox, oy, 0);
    return camL.clone().add(S.sub(camL).multiplyScalar((camL.z + d) / camL.z));
  };

  const sunO = new THREE.Vector2(0.62, 0.3);
  const skyMat = inPortal(new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      camL: { value: camL }, uC: { value: new THREE.Vector3() }, sunO: { value: sunO },
      cTop: { value: new THREE.Color(0x9db2ea) }, cMid: { value: new THREE.Color(0xdce5f7) },
      cLow: { value: new THREE.Color(0xffe4d2) }, cGlow: { value: new THREE.Color(0xffb79e) },
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
  }));
  const sky = new THREE.Mesh(new THREE.SphereGeometry(16, 48, 32), skyMat);
  sky.renderOrder = 3; portal.add(sky);

  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 20), inPortal(new THREE.MeshBasicMaterial({ color: C.coral })));
  sunMesh.renderOrder = 3; portal.add(sunMesh);
  const haloMat = inPortal(new THREE.SpriteMaterial({ map: radialTex('rgba(255,140,105,0.8)', 'rgba(255,170,140,0)'), transparent: true, depthWrite: false }));
  const halo = new THREE.Sprite(haloMat);
  halo.scale.setScalar(2.6); halo.renderOrder = 4; portal.add(halo);

  // ONE keycap staircase descending into the screen, shrinking toward the sun
  const stepIvory = inPortal(clay(0xfbf5ea, { roughness: 0.7 })), stepTop = inPortal(clay(C.white, { roughness: 0.75 }));
  const stepCoral = inPortal(clay(C.coral, { roughness: 0.55 })), stepBlue = inPortal(clay(C.blue2, { roughness: 0.6 }));
  const steps: THREE.Group[] = [];
  const N = 7;
  const stepBase: THREE.Vector3[] = [];
  for (let i = 0; i < N; i++) {
    const g = kit.keycap(i % 4 === 2 ? stepCoral : i % 4 === 0 && i ? stepBlue : stepIvory, stepTop);
    g.traverse((o) => { o.renderOrder = 3; });
    g.rotation.y = 0.2 - i * 0.06;
    portal.add(g); steps.push(g); stepBase.push(new THREE.Vector3());
  }
  const cloudInM = inPortal(clay(C.white, { roughness: 0.9, emissive: C.white, emissiveIntensity: 0.12 }));
  const innerClouds = ([[6, -0.95, 0.5, 0.75], [3.5, 1.05, -0.48, 0.55]] as const).map(([d, ox, oy, s]) => {
    const c = cloudGroup(cloudInM, s, false); c.traverse((o) => { o.renderOrder = 3; });
    portal.add(c);
    return { c, d, ox, oy, base: new THREE.Vector3() };
  });
  function layoutPortal() {
    sky.position.copy(P(9, 0, 0)); skyMat.uniforms.uC.value.copy(sky.position);
    sunMesh.position.copy(P(12, sunO.x, sunO.y)); halo.position.copy(P(11.6, sunO.x, sunO.y));
    steps.forEach((g, i) => {
      const t = i / (N - 1);
      g.position.copy(P(0.4 + t * 9.2, -1.0 + 1.42 * t, -0.56 + 0.76 * Math.pow(t, 1.4) + Math.sin(t * Math.PI) * 0.14));
      g.scale.setScalar(1 - 0.55 * t);
      stepBase[i].copy(g.position);
    });
    innerClouds.forEach((ic) => { ic.c.position.copy(P(ic.d, ic.ox, ic.oy)); ic.base.copy(ic.c.position); });
  }

  /* ONE keyboard */
  const kb = new THREE.Group(); kb.position.set(0.3, 0, 1.08); kb.rotation.y = 0.12; world.add(kb);
  const kbBase = mesh(rbox(3.55, 0.2, 1.46, 0.08), blueM); kbBase.position.y = 0.1; kb.add(kbBase);
  const kbLip = mesh(rbox(3.35, 0.05, 1.28, 0.02, 2), blue2M); kbLip.position.y = 0.205; kb.add(kbLip);
  const PITCH = 0.268, KEY = { w: 0.22, h: 0.13, d: 0.22 }, KY = 0.3;
  const keyG = rbox(KEY.w, KEY.h, KEY.d, 0.045);
  const fly: Array<[number, number]> = [[0, 2], [1, 9], [2, 4], [0, 7], [1, 1], [2, 10], [0, 11], [1, 5]]; // row, col — take-off order
  const flySet = new Set(fly.map(([r, c]) => `${r},${c}`));
  const slots: Array<[number, number]> = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 12; c++) if (!flySet.has(`${r},${c}`)) slots.push([r, c]);
  const keyMat = clay(C.white, { roughness: 0.7 });
  const inst = new THREE.InstancedMesh(keyG, keyMat, slots.length); inst.castShadow = true; inst.receiveShadow = true;
  const mtx = new THREE.Matrix4(), col = new THREE.Color();
  const keyPos = (r: number, c: number) => new THREE.Vector3(-1.474 + c * PITCH, KY, -0.54 + r * PITCH);
  slots.forEach(([r, c], i) => {
    mtx.makeTranslation(keyPos(r, c)); inst.setMatrixAt(i, mtx);
    col.setHex((r === 0 && c === 0) || (r === 2 && c === 11) ? C.coral : r === 3 && (c === 0 || c === 11) ? 0xc9d3f2 : C.keycap);
    inst.setColorAt(i, col);
  });
  kb.add(inst);
  const keycapM = clay(C.keycap, { roughness: 0.7 });
  const space = mesh(rbox(1.62, 0.13, 0.22, 0.045), keycapM); space.position.set(0, KY, -0.54 + 4 * PITCH); kb.add(space);
  [-1.474, -1.206, 1.206, 1.474].forEach((x) => { const k = mesh(keyG, keycapM); k.position.set(x, KY, -0.54 + 4 * PITCH); kb.add(k); });

  /* ONE server rack — built from the flying keys */
  const rack = new THREE.Group(); rack.position.set(2.75, 0, -1.15); rack.rotation.y = -0.08; world.add(rack);
  [-0.8, 0.8].forEach((x) => { const p = mesh(rbox(0.13, 2.45, 0.98, 0.05), blue2M); p.position.set(x, 1.225, 0); rack.add(p); });
  const rTop = mesh(rbox(1.76, 0.14, 1.08, 0.06), blue2M); rTop.position.y = 2.5; rack.add(rTop);
  const rBot = mesh(rbox(1.76, 0.16, 1.08, 0.06), blue2M); rBot.position.y = 0.08; rack.add(rBot);
  const UNIT = { w: 1.42, h: 0.2, d: 0.86 };
  const slotY = (j: number) => 0.36 + j * 0.262;
  const unitG = rbox(1, 1, 1, 0.12, 3);
  const ledG = new THREE.SphereGeometry(0.04, 12, 8);
  const ventG = rbox(0.62, 0.05, 0.02, 0.008, 1);
  const unitM = clay(C.keycap, { roughness: 0.66 });
  kb.updateMatrix(); rack.updateMatrix(); monitor.updateMatrix();
  const flyers = fly.map(([r, c], j) => {
    const m = mesh(unitG, unitM);
    const a = keyPos(r, c).applyMatrix4(kb.matrix);
    const b = new THREE.Vector3(0, slotY(j), 0.02).applyMatrix4(rack.matrix);
    const ctrl = a.clone().add(b).multiplyScalar(0.5).add(new THREE.Vector3(-0.2, 2.5 + (j % 3) * 0.35, 0.9));
    const lm = clay(C.coral, { emissive: C.coral, emissiveIntensity: 0.9, roughness: 0.4 });
    const led = mesh(ledG, lm, { cast: false }); led.position.set(0.5, slotY(j), 0.46); rack.add(led);
    const vent = mesh(ventG, blue2M, { cast: false }); vent.position.set(-0.22, slotY(j), 0.45); rack.add(vent);
    world.add(m);
    return { m, a, b, ctrl, led, lm, vent, j };
  });

  /* ONE mug + rain cloud */
  const mug = new THREE.Group(); mug.position.set(2.95, 0, 1.3); world.add(mug);
  const mugM = clay(C.paper, { roughness: 0.62, side: THREE.DoubleSide });
  const body = mesh(new THREE.CylinderGeometry(0.37, 0.33, 0.72, 40, 1, true), mugM); body.position.y = 0.36; mug.add(body);
  const bottom = mesh(new THREE.CircleGeometry(0.33, 32), mugM); bottom.rotation.x = -Math.PI / 2; bottom.position.y = 0.01; mug.add(bottom);
  const coffee = mesh(new THREE.CircleGeometry(0.355, 32), clay(0x7a5038, { roughness: 0.35 }), { cast: false }); coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.58; mug.add(coffee);
  const rim = mesh(new THREE.TorusGeometry(0.37, 0.028, 10, 48), mugM); rim.rotation.x = Math.PI / 2; rim.position.y = 0.72; mug.add(rim);
  const band = mesh(new THREE.CylinderGeometry(0.356, 0.346, 0.16, 40, 1, true), coralM); band.position.y = 0.4; mug.add(band);
  const handle = mesh(new THREE.TorusGeometry(0.17, 0.05, 12, 28, Math.PI * 1.15), mugM); handle.rotation.z = -Math.PI / 2 - 0.07; handle.position.set(0.36, 0.38, 0); mug.add(handle);
  mug.rotation.y = -0.6;
  const rainCloud = cloudGroup(clay(C.white, { roughness: 0.92, emissive: C.white, emissiveIntensity: 0.1 }), 0.95);
  rainCloud.position.set(2.95, 1.75, 1.3); world.add(rainCloud);
  const dropG = new THREE.CapsuleGeometry(0.022, 0.1, 4, 8);
  const drops = Array.from({ length: 7 }, (_, i) => {
    const d = mesh(dropG, blue2M, { cast: false }); const a = i * 2.39;
    const k = 0.17 * ((i % 3) / 2 + 0.3);
    world.add(d);
    return { d, x: Math.cos(a) * k, z: Math.sin(a) * k, o: i / 7 };
  });

  /* ONE coral cable — an impossible floating knot between monitor and keyboard */
  const pts: THREE.Vector3[] = [];
  pts.push(new THREE.Vector3(0.35, 1.2, -0.38).applyMatrix4(monitor.matrix));
  pts.push(new THREE.Vector3(0.1, 0.35, -0.75).applyMatrix4(monitor.matrix));
  pts.push(new THREE.Vector3(-1.6, 0.06, -2.0), new THREE.Vector3(-3.1, 0.06, -1.5), new THREE.Vector3(-3.25, 0.25, -0.2));
  const knotC = new THREE.Vector3(-2.85, 1.55, 0.75), knotQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
  for (let i = 0; i <= 44; i++) {
    const u = 0.35 + (i / 44) * (Math.PI * 2 - 0.7);
    pts.push(new THREE.Vector3(Math.sin(u) + 2 * Math.sin(2 * u), Math.cos(u) - 2 * Math.cos(2 * u), -Math.sin(3 * u)).multiplyScalar(0.21).applyQuaternion(knotQ).add(knotC));
  }
  pts.push(new THREE.Vector3(-2.7, 0.3, 1.7), new THREE.Vector3(-2.2, 0.06, 1.55));
  pts.push(new THREE.Vector3(-1.82, 0.12, 0.05).applyMatrix4(kb.matrix), new THREE.Vector3(-1.7, 0.14, -0.3).applyMatrix4(kb.matrix));
  const cable = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 520, 0.05, 10, false), coralM);
  world.add(cable);
  const plug = mesh(rbox(0.16, 0.12, 0.2, 0.04), paperM); plug.position.copy(pts[pts.length - 1]); plug.rotation.y = kb.rotation.y; world.add(plug);

  /* keycaps drifting upward like birds (keys on their way — same object family as the keyboard) */
  const birdIvory = clay(C.keycap, { roughness: 0.7 }), birdCoral = clay(C.coral, { roughness: 0.7 });
  const birds = Array.from({ length: 4 }, (_, i) => {
    const b = mesh(keyG, i === 1 ? birdCoral : birdIvory, { cast: true, receive: false });
    world.add(b);
    return { b, x: -0.9 + i * 0.8, z: 0.4 + (i % 2) * 0.5, o: i / 4 };
  });

  /* motion: slow turntable sway + float on their own clocks, so they can ease out while the user drags
     and pick up again where they left off (no jump). Hover tilt + drag add on top. */
  const SWAY = 0.55, SWAY_W = (Math.PI * 2) / 18; // ±0.55 rad (≈ ±32°), 18 s period
  const BOB = 0.07, BOB_W = (Math.PI * 2) / 6.5; //   ±0.07 units, 6.5 s period
  const HOVER = 0.2; // ± half of this at the canvas edges
  const AUTO_OUT = 0.35, AUTO_IN = 1.5; // seconds to ease auto-motion out on grab / back in after release
  let auto = 1, swayT = 0, bobT = 0;

  /* interaction: hover tilt + drag turntable */
  let hoverX = 0, drag = 0, dragging = false, lastX = 0, rotY = 0;
  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect(); hoverX = (e.clientX - r.left) / r.width - 0.5;
    if (dragging) { drag += (e.clientX - lastX) * 0.009; lastX = e.clientX; }
    requestRender();
  };
  const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; };
  const onEnd = () => { dragging = false; };
  const onLeave = () => { dragging = false; hoverX = 0; requestRender(); };
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointerup', onEnd);
  el.addEventListener('pointercancel', onEnd);
  el.addEventListener('pointerleave', onLeave);

  // The room behind the glass is laid out along the camera's rays for a desk turned by most of its current angle,
  // so the coral sun and stairs stay framed in the screen while the desk sways; the remainder still reads as parallax.
  const up = new THREE.Vector3(0, 1, 0);
  const portalInv = new THREE.Matrix4();
  const PORTAL_FOLLOW = 0.85;
  const followPortal = () => {
    const a = Math.atan2(Math.sin(rotY), Math.cos(rotY)); // drag can wind past a full turn
    camL.copy(camera.position).applyAxisAngle(up, -THREE.MathUtils.clamp(a, -0.8, 0.8) * PORTAL_FOLLOW).applyMatrix4(portalInv);
    layoutPortal();
  };

  const fit = () => {
    const ps: THREE.Vector3[] = [];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [0, -0.47]) ps.push(new THREE.Vector3(sx * DW / 2, y, sz * DD / 2));
    for (const sx of [-1, 1]) ps.push(new THREE.Vector3(sx * MW / 2, MY + MH / 2 + 0.05, 0.1).applyMatrix4(monitor.matrix));
    ps.push(new THREE.Vector3(3.6, 2.6, -1.7), new THREE.Vector3(2.95, 2.2, 1.3), new THREE.Vector3(-2.85, 2.3, 0.75), new THREE.Vector3(0, -1.2, 2.2), new THREE.Vector3(0.6, 3.2, -0.2));
    const all: THREE.Vector3[] = [];
    // fit the whole sway range (+ hover) and the float, so the moving desk never leaves the canvas
    const reach = SWAY + HOVER / 2;
    for (let i = -4; i <= 4; i++) for (const p of ps) for (const dy of [-BOB, BOB]) all.push(p.clone().applyAxisAngle(up, (reach * i) / 4).setY(p.y + dy));
    fitCamera(camera, all, CAM_DIR, new THREE.Vector3(0, 0.8, 0), camera.aspect < 0.9 ? 1.0 : 0.97);
    const ry = world.rotation.y, py = world.position.y;
    world.rotation.y = 0; world.position.y = 0; world.updateMatrixWorld(true);
    portalInv.copy(portal.matrixWorld).invert(); // portal frame relative to the (unturned) desk
    world.rotation.y = ry; world.position.y = py; world.updateMatrixWorld(true);
    followPortal();
  };

  const CYCLE = 18;
  const tmp = new THREE.Vector3();
  const update = (t: number, dt: number) => {
    if (!REDUCED && dt > 0) {
      auto = dragging ? Math.max(0, auto - dt / AUTO_OUT) : Math.min(1, auto + dt / AUTO_IN);
      const w = auto * auto * (3 - 2 * auto); // smoothstep: motion slows to a halt / speeds back up
      swayT += dt * w; bobT += dt * w;
    }
    const target = (REDUCED ? 0 : Math.sin(swayT * SWAY_W) * SWAY) + hoverX * HOVER + drag;
    // frame-rate independent follow (≈ 0.06 per frame at 60 fps); a fixed step when redrawn while paused (dt = 0)
    rotY += (target - rotY) * (REDUCED ? 1 : dt > 0 ? 1 - Math.exp(-dt * 3.6) : 0.06);
    world.rotation.y = rotY;
    world.position.y = REDUCED ? 0 : Math.sin(bobT * BOB_W) * BOB;
    followPortal();

    const ct = t % CYCLE;
    for (const f of flyers) {
      const a0 = 0.5 + f.j * 0.95, b0 = 12.8 + f.j * 0.28;
      const p = ct < 12.5 ? ease(clamp01((ct - a0) / 2.5)) : 1 - ease(clamp01((ct - b0) / 1.9));
      const k = smooth(0.62, 0.98, p);
      qbez(f.a, f.ctrl, f.b, p, f.m.position);
      if (p > 0 && p < 1) f.m.position.y += Math.sin(p * Math.PI * 3) * 0.06;
      f.m.scale.set(lerp(KEY.w, UNIT.w, k), lerp(KEY.h, UNIT.h, k), lerp(KEY.d, UNIT.d, k));
      const spin = Math.sin(p * Math.PI);
      f.m.rotation.set(spin * 1.2 * (f.j % 2 ? 1 : -1) * (1 - k), lerp(kb.rotation.y, rack.rotation.y, p) + spin * 0.6, spin * 0.5 * (1 - k));
      const docked = p > 0.985;
      f.led.visible = f.vent.visible = docked;
      if (docked) f.lm.emissiveIntensity = 0.5 + 0.5 * Math.max(0, Math.sin(t * 5 + f.j * 1.3));
    }
    steps.forEach((s, i) => { s.position.y = stepBase[i].y + Math.sin(t * 1.1 + i * 0.7) * 0.05; });
    innerClouds.forEach((ic, i) => { ic.c.position.x = ic.base.x + Math.sin(t * 0.25 + i * 2) * 0.35; });
    haloMat.opacity = 0.85 + Math.sin(t * 1.4) * 0.15;
    rainCloud.position.y = 1.75 + Math.sin(t * 1.3) * 0.05;
    drops.forEach(({ d, x, z, o }) => {
      const u = (t * 1.1 + o) % 1;
      d.position.set(2.95 + x, rainCloud.position.y - 0.22 - u * 0.95, 1.3 + z);
      d.scale.setScalar(u > 0.92 ? (1 - u) / 0.08 : 1);
    });
    birds.forEach(({ b, x, z, o }, i) => {
      const u = (t * 0.075 + o) % 1;
      tmp.set(x + Math.sin(u * 6 + i) * 0.3, 0.5 + u * 3.6, z - u * 1.6);
      b.position.copy(tmp).applyMatrix4(kb.matrix);
      b.rotation.set(Math.sin(t * 2 + i) * 0.5, t * 0.6 + i, Math.cos(t * 1.7 + i) * 0.4);
      b.scale.setScalar(Math.max(0.0001, Math.min(smooth(0, 0.12, u), 1 - smooth(0.8, 1, u))));
    });
  };

  return {
    startTime: 4.6,
    // link shader programs before the first frame: off the main thread where KHR_parallel_shader_compile exists
    // (checked with has() — get() logs a warning when it is missing), otherwise one synchronous compile
    prepare: () =>
      renderer.extensions.has('KHR_parallel_shader_compile')
        ? renderer.compileAsync(scene, camera)
        : Promise.resolve(renderer.compile(scene, camera)),
    staticTime: 6.4,
    render(t, dt) {
      update(t, dt);
      renderer.render(scene, camera);
    },
    resize(w, h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      fit();
      camera.updateProjectionMatrix();
    },
    dispose() {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onEnd);
      el.removeEventListener('pointercancel', onEnd);
      el.removeEventListener('pointerleave', onLeave);
      kit.dispose(scene);
      inst.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
};

export default create;
