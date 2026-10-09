// SCENE 2 — AGENTS AT WORK (Slayb).
// One cloud orchestrates five UNIQUE agents: one laptop, one tablet, one GPU chip, one phone, one smartwatch.
// Story loop: a goal drops into the cloud → the cloud plans and dispatches packets one by one → the agents work in
// parallel (with peer hand-offs) → results merge back into the cloud → one finished page ships out of it.
// Only clouds repeat. Hover tilts the scene. Same matte clay kit as the hero desk.
import * as THREE from 'three';
import type { SceneFactory } from '../types';
import { C, addLights, clamp01, createKit, createRenderer, ease, fitCamera, lerp, qbez, smooth } from '../kit';

export type AgentsProps = {
  /** Called when the loop enters a new beat (0 goal, 1 plan, 2 parallel work, 3 ship) with that beat's length in seconds.
   *  Never called under reduced motion (the scene shows one composed frame instead). */
  onPhase?: (phase: number, duration: number) => void;
};

/* ---------------- timeline (seconds inside one loop) ---------------- */
const CYCLE = 14;
const BEATS = [0, 2.4, 6.2, 10.2] as const;            // goal, plan, work, ship
const GOAL_FROM = 0.25, GOAL_LAND = 1.75;
const FLY = 1.1;                                        // packet flight time
const PLAN_START = BEATS[1] + 0.2, PLAN_GAP = 0.62;     // cloud dispatches agent i at PLAN_START + i·GAP
const MERGE_AT = BEATS[3] + 0.15, MERGE_LAND = MERGE_AT + FLY + 0.12;
const SHIP_AT = MERGE_LAND + 0.05;
const RESET = CYCLE - 0.9;                              // everything powers down before the loop restarts
const PEERS: Array<[number, number, number]> = [        // [from, to, start] hand-offs during parallel work
  [0, 1, BEATS[2] + 0.45], [2, 3, BEATS[2] + 1.25], [4, 0, BEATS[2] + 2.0], [1, 2, BEATS[2] + 2.65],
];

/* ---------------- camera frame: the layout is authored in screen space (sx right, sy up, dz toward camera) ---------------- */
const CAM_DIR = new THREE.Vector3(0.2, 0.45, 1).normalize();
const AX_R = new THREE.Vector3(CAM_DIR.z, 0, -CAM_DIR.x).normalize();
const AX_U = new THREE.Vector3().crossVectors(CAM_DIR, AX_R).normalize();
const YAW = Math.atan2(CAM_DIR.x, CAM_DIR.z);           // rotation.y that faces the camera
const AIM = new THREE.Vector3(0, 0.9, 0);
const place = (out: THREE.Vector3, [sx, sy, dz]: readonly number[]) => out.copy(AIM).addScaledVector(AX_R, sx).addScaledVector(AX_U, sy).addScaledVector(CAM_DIR, dz);
type XYZ = readonly [number, number, number];
type Layout = { agents: XYZ[]; hub: XYZ; page: XYZ; extras: XYZ[] };
// agents in dispatch order: laptop, tablet, chip, phone, watch (clockwise around the cloud)
const WIDE: Layout = {
  agents: [[-2.4, -0.75, 0.6], [-2.2, 1.35, -1.0], [2.2, 1.4, -1.0], [2.45, -0.2, 0.6], [0.05, -1.05, 1.3]],
  hub: [0, 2.45, -0.5], page: [0, 0.6, 0.35], extras: [[-3.15, 2.85, -1.8], [3.2, 2.75, -1.9]],
};
const NARROW: Layout = {
  agents: [[-1.5, -1.25, 0.6], [-1.5, 1.2, -1.0], [1.5, 1.25, -1.0], [1.6, -0.55, 0.6], [0.15, -1.6, 1.3]],
  hub: [0, 2.5, -0.5], page: [0, 0.35, 0.35], extras: [[-2.0, 2.95, -1.8], [2.05, 2.8, -1.9]],
};

const backOut = (x: number) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const bump = (t: number, at: number, len: number) => (t < at || t > at + len ? 0 : Math.sin(((t - at) / len) * Math.PI));

type Agent = {
  g: THREE.Group;
  port: THREE.Object3D;                  // where packets land
  screen?: THREE.MeshStandardMaterial;
  work(k: number, wake: number, t: number): void;
  pos: THREE.Vector3; rot: THREE.Euler; scale: number;
};
/** Tilt about x first, then turn to face the camera (+ a yaw offset toward the cloud). */
const facing = (x: number, yawOff: number, z = 0) => new THREE.Euler(x, YAW + yawOff, z, 'YXZ');

const create: SceneFactory<AgentsProps> = (canvas, { container: el, dpr, reducedMotion: REDUCED, requestRender, props }) => {
  const renderer = createRenderer(canvas, dpr);
  const kit = createKit();
  const { clay, roundedBox: rbox, mesh, cloud: cloudGroup, radialTex, track } = kit;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(22, 1, 0.5, 200);
  addLights(scene, 6.5);
  const world = new THREE.Group(); scene.add(world);

  /* ---------------- materials ---------------- */
  const paperM = clay(C.paper, { roughness: 0.7 });
  const keycapM = clay(C.keycap, { roughness: 0.72 });
  const ivory2M = clay(C.ivory2, { roughness: 0.72 });
  const blueM = clay(C.blue, { roughness: 0.56 });
  const blue2M = clay(C.blue2, { roughness: 0.6 });
  const softM = clay(0x9fb2f2, { roughness: 0.62 });
  const periM = clay(C.periwinkle, { roughness: 0.66 });
  const coralM = clay(C.coral, { roughness: 0.5 });
  const inkM = clay(C.ink, { roughness: 0.6 });
  const cloudM = clay(C.white, { roughness: 0.92, emissive: C.white, emissiveIntensity: 0.1 });
  const packetM = clay(C.coral, { roughness: 0.42, emissive: C.coral, emissiveIntensity: 0.3 });
  const hullM = track(new THREE.MeshBasicMaterial({ color: C.ink, side: THREE.BackSide }));
  const dotM = clay(C.paper, { roughness: 0.6, emissive: C.paper, emissiveIntensity: 0.3 });

  const OFF = new THREE.Color(0x1f3283), ON = new THREE.Color(0xfbf7ee);
  const screenMat = () => clay(0x1f3283, { roughness: 0.45, emissive: C.white, emissiveIntensity: 0 });
  const unit = rbox(1, 1, 1, 0.2, 2);    // scaled per use for bars / lines / bubbles
  const flat = { cast: false, receive: false };
  const sized = (m: THREE.Mesh, x: number, y: number, z: number) => { m.scale.set(Math.max(1e-4, x), Math.max(1e-4, y), z); m.visible = x > 1e-3 && y > 1e-3; };

  /* ---------------- ONE laptop: lines of code type themselves ---------------- */
  function laptop(): Agent {
    const g = new THREE.Group();
    const base = mesh(rbox(1.8, 0.1, 1.22, 0.05), blueM); base.position.y = 0.05; g.add(base);
    const deck = mesh(rbox(1.58, 0.02, 0.6, 0.008, 2), keycapM, { cast: false }); deck.position.set(0, 0.104, -0.18); g.add(deck);
    const pad = mesh(rbox(0.52, 0.02, 0.28, 0.008, 2), blue2M, { cast: false }); pad.position.set(0, 0.104, 0.36); g.add(pad);
    const hinge = new THREE.Group(); hinge.position.set(0, 0.1, -0.58); hinge.rotation.x = -0.24; g.add(hinge);
    const lid = mesh(rbox(1.8, 1.18, 0.07, 0.05), blueM); lid.position.y = 0.6; hinge.add(lid);
    const screen = screenMat();
    const scr = mesh(rbox(1.62, 1.0, 0.014, 0.006, 1), screen, { cast: false }); scr.position.set(0, 0.62, 0.036); hinge.add(scr);
    const spec: Array<[number, number, THREE.Material]> = [[0, 0.62, coralM], [0.14, 1.0, blue2M], [0.14, 0.7, softM], [0.28, 0.86, blue2M], [0.14, 0.46, coralM], [0, 0.94, softM]];
    const lines = spec.map(([indent, w, m], j) => {
      const b = mesh(unit, m, flat); b.position.set(0, 0.98 - j * 0.135, 0.046); hinge.add(b);
      return { b, indent, w };
    });
    const port = new THREE.Object3D(); port.position.set(0, 0.66, 0.14); hinge.add(port);
    return {
      g, port, screen, pos: new THREE.Vector3(), rot: facing(0, 0.5), scale: 1,
      work(k, wake) {
        lines.forEach(({ b, indent, w }, j) => {
          const len = w * clamp01(k * lines.length * 1.15 - j) * wake;
          sized(b, len, 0.062, 0.014);
          b.position.x = -0.7 + indent + len / 2;
        });
      },
    };
  }

  /* ---------------- ONE tablet: a bar chart grows ---------------- */
  function tablet(): Agent {
    const g = new THREE.Group();
    const body = mesh(rbox(1.42, 1.0, 0.08, 0.08), paperM); g.add(body);
    const cam = mesh(rbox(0.05, 0.05, 0.01, 0.02, 1), inkM, flat); cam.position.set(0, 0.455, 0.042); g.add(cam);
    const screen = screenMat();
    const scr = mesh(rbox(1.24, 0.82, 0.014, 0.006, 1), screen, { cast: false }); scr.position.z = 0.042; g.add(scr);
    const title = mesh(unit, blue2M, flat); title.position.set(0, 0.3, 0.053); g.add(title);
    const BOT = -0.32;
    const bars = ([[0.24, blue2M], [0.44, coralM], [0.32, softM], [0.52, coralM]] as Array<[number, THREE.Material]>).map(([h, m], j) => {
      const b = mesh(unit, m, flat); b.position.set(-0.39 + j * 0.26, 0, 0.053); g.add(b);
      return { b, h, j };
    });
    const port = new THREE.Object3D(); port.position.set(0, 0, 0.16); g.add(port);
    return {
      g, port, screen, pos: new THREE.Vector3(), rot: facing(-0.1, 0.42), scale: 1,
      work(k, wake) {
        const tw = 0.42 * wake; sized(title, tw, 0.055, 0.014); title.position.x = -0.5 + tw / 2;
        bars.forEach(({ b, h, j }) => {
          const hh = h * smooth(j * 0.16, j * 0.16 + 0.42, k) * wake;
          sized(b, 0.16, hh, 0.014); b.position.y = BOT + hh / 2;
        });
      },
    };
  }

  /* ---------------- ONE GPU chip: the die glows while it computes ---------------- */
  function chip(): Agent {
    const g = new THREE.Group();
    const pkg = mesh(rbox(1.12, 0.12, 1.12, 0.05), blueM); g.add(pkg);
    const pinG = rbox(0.07, 0.045, 0.2, 0.02, 2);
    for (let s = 0; s < 4; s++) {
      const a = (s * Math.PI) / 2, ca = Math.cos(a), sa = Math.sin(a);
      for (let j = 0; j < 5; j++) {
        const off = -0.36 + j * 0.18;
        const p = mesh(pinG, keycapM, { cast: false }); p.rotation.y = a;
        p.position.set(ca * off + sa * 0.62, -0.01, -sa * off + ca * 0.62); g.add(p);
      }
      const tr = mesh(rbox(0.05, 0.014, 0.2, 0.006, 1), softM, flat); tr.rotation.y = a;
      tr.position.set(sa * 0.42, 0.064, ca * 0.42); g.add(tr);
    }
    const dieM = clay(C.paper, { roughness: 0.55, emissive: C.coral, emissiveIntensity: 0 });
    const die = mesh(rbox(0.58, 0.09, 0.58, 0.04), dieM); die.position.y = 0.1; g.add(die);
    const core = mesh(rbox(0.3, 0.02, 0.3, 0.008, 1), coralM, flat); core.position.y = 0.152; g.add(core);
    const port = new THREE.Object3D(); port.position.set(0, 0.36, 0); g.add(port);
    return {
      g, port, pos: new THREE.Vector3(), rot: facing(0.78, -0.42), scale: 1.12,
      work(k, wake, t) {
        const busy = k > 0 && k < 1 ? 0.5 + 0.5 * Math.sin(t * 7) : 0;
        dieM.emissiveIntensity = wake * (0.1 + 0.32 * busy);
        core.scale.setScalar(Math.max(1e-4, wake * (0.85 + 0.25 * busy)));
        core.visible = wake > 0.01;
      },
    };
  }

  /* ---------------- ONE phone: chat bubbles pop in ---------------- */
  function phone(): Agent {
    const g = new THREE.Group();
    const body = mesh(rbox(0.56, 1.08, 0.09, 0.1), coralM); g.add(body);
    const screen = screenMat();
    const scr = mesh(rbox(0.46, 0.94, 0.014, 0.006, 1), screen, { cast: false }); scr.position.z = 0.047; g.add(scr);
    const notch = mesh(rbox(0.16, 0.035, 0.01, 0.012, 1), inkM, flat); notch.position.set(0, 0.42, 0.057); g.add(notch);
    const bubbles = ([[-0.05, 0.25, 0.3, softM, 0.04], [0.06, 0.09, 0.24, coralM, 0.38], [-0.04, -0.07, 0.32, softM, 0.7]] as Array<[number, number, number, THREE.Material, number]>)
      .map(([x, y, w, m, at]) => { const b = mesh(unit, m, flat); b.position.set(x, y, 0.057); g.add(b); return { b, w, at }; });
    const input = mesh(unit, ivory2M, flat); input.position.set(0, -0.34, 0.057); g.add(input);
    const port = new THREE.Object3D(); port.position.set(0, 0.05, 0.16); g.add(port);
    return {
      g, port, screen, pos: new THREE.Vector3(), rot: facing(0, -0.42, 0.07), scale: 1.08,
      work(k, wake) {
        bubbles.forEach(({ b, w, at }) => { const s = backOut(clamp01((k - at) / 0.14)) * wake * (k > at ? 1 : 0); sized(b, w * s, 0.12 * s, 0.014); });
        sized(input, 0.36 * wake, 0.07, 0.014);
      },
    };
  }

  /* ---------------- ONE smartwatch: a progress ring fills ---------------- */
  function watch(): Agent {
    const g = new THREE.Group();
    const w = new THREE.Group(); w.rotation.x = Math.PI / 2; g.add(w);   // built face-up, stood upright (face → +z)
    const strapM = clay(0xffb8a2, { roughness: 0.68 });
    const face = mesh(track(new THREE.CylinderGeometry(0.4, 0.4, 0.14, 40)), blue2M); w.add(face);
    const screen = screenMat();
    const scr = mesh(track(new THREE.CylinderGeometry(0.32, 0.32, 0.02, 40)), screen, { cast: false }); scr.position.y = 0.075; w.add(scr);
    const strapG = rbox(0.42, 0.07, 0.46, 0.03);
    for (const s of [-1, 1]) { const st = mesh(strapG, strapM); st.position.set(0, -0.02, s * 0.56); w.add(st); }
    const crown = mesh(track(new THREE.CylinderGeometry(0.06, 0.06, 0.09, 16)), coralM); crown.rotation.z = Math.PI / 2; crown.position.x = 0.44; w.add(crown);
    const dotG = track(new THREE.SphereGeometry(0.034, 12, 8));
    const dots = Array.from({ length: 12 }, (_, j) => {
      const a = (j / 12) * Math.PI * 2;
      const d = mesh(dotG, periM, flat); d.position.set(Math.sin(a) * 0.22, 0.09, -Math.cos(a) * 0.22); w.add(d);
      return d;
    });
    const hub = mesh(track(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 24)), coralM, flat); hub.position.y = 0.09; w.add(hub);
    const port = new THREE.Object3D(); port.position.set(0, 0, 0.26); g.add(port);
    return {
      g, port, screen, pos: new THREE.Vector3(), rot: new THREE.Euler(), scale: 1,
      work(k, wake) {
        dots.forEach((d, j) => { d.material = k * 12 > j + 0.3 ? coralM : periM; d.visible = wake > 0.05; d.scale.setScalar(Math.max(1e-4, wake)); });
        hub.visible = wake > 0.05; hub.scale.setScalar(Math.max(1e-4, wake * (0.9 + 0.2 * Math.sin(k * Math.PI * 6))));
      },
    };
  }

  // Dispatch order = clockwise around the cloud as seen by the camera.
  const agents: Agent[] = [laptop(), tablet(), chip(), phone(), watch()];
  agents.forEach((a) => world.add(a.g));

  /* ---------------- the cloud (orchestrator) + two drifting extras (clouds may repeat) ---------------- */
  const HUB = new THREE.Vector3();
  const hub = cloudGroup(cloudM, 2.15); world.add(hub);
  const extras = [0.72, 0.58].map((s, i) => {
    const c = cloudGroup(cloudM, s, false); world.add(c);
    return { c, base: new THREE.Vector3(), i };
  });

  /* ---------------- the shipped result: one finished page ---------------- */
  const page = new THREE.Group(); world.add(page);
  const pBody = mesh(rbox(1.12, 0.78, 0.07, 0.06), paperM); page.add(pBody);
  const pBar = mesh(rbox(1.12, 0.17, 0.085, 0.06), coralM); pBar.position.y = 0.305; page.add(pBar);
  const pHero = mesh(rbox(0.46, 0.26, 0.02, 0.02, 1), blue2M, flat); pHero.position.set(-0.24, 0.02, 0.042); page.add(pHero);
  ([[0.27, 0.1, 0.4, softM], [0.22, 0.0, 0.3, softM], [0, -0.22, 0.92, periM]] as Array<[number, number, number, THREE.Material]>).forEach(([x, y, w, m]) => {
    const l = mesh(unit, m, flat); l.scale.set(w, 0.055, 0.02); l.position.set(x, y, 0.042); page.add(l);
  });
  const PAGE0 = new THREE.Vector3(), PAGE1 = new THREE.Vector3(), PAGE_S = 1.3;

  /* ---------------- packets, trails, guide dots, the goal ---------------- */
  const packetG = track(new THREE.SphereGeometry(0.125, 22, 14));
  const POOL = 10;
  const packets = Array.from({ length: POOL }, () => {
    const m = mesh(packetG, packetM, { cast: true, receive: false });
    const h = mesh(packetG, hullM, flat); h.scale.setScalar(1.32); m.add(h);
    m.visible = false; scene.add(m);
    return m;
  });
  const TRAIL = 3;
  const trail = new THREE.InstancedMesh(track(new THREE.SphereGeometry(0.06, 12, 8)), packetM, POOL * TRAIL);
  trail.frustumCulled = false; scene.add(trail);
  const DOTS = 11;
  const guide = new THREE.InstancedMesh(track(new THREE.SphereGeometry(0.03, 10, 8)), dotM, agents.length * DOTS);
  guide.frustumCulled = false; scene.add(guide);

  const goal = mesh(track(new THREE.OctahedronGeometry(0.21, 0)), packetM, { cast: true, receive: false });
  const goalHull = mesh(goal.geometry, hullM, flat); goalHull.scale.setScalar(1.3); goal.add(goalHull);
  scene.add(goal);

  /* ---------------- floor: shadow catcher + soft blob (no visible ground) ---------------- */
  const catcher = new THREE.Mesh(track(new THREE.PlaneGeometry(14, 10)), track(new THREE.ShadowMaterial({ color: C.ink, opacity: 0.11 })));
  catcher.rotation.x = -Math.PI / 2; catcher.receiveShadow = true; world.add(catcher);
  const blob = new THREE.Mesh(track(new THREE.PlaneGeometry(9, 6.4)), track(new THREE.MeshBasicMaterial({ map: radialTex('rgba(14,27,77,0.22)', 'rgba(14,27,77,0)'), transparent: true, depthWrite: false })));
  blob.rotation.x = -Math.PI / 2; world.add(blob);

  /* ---------------- interaction: hover tilt ---------------- */
  let hoverX = 0, rotY = 0;
  const onMove = (e: PointerEvent) => { const r = el.getBoundingClientRect(); hoverX = (e.clientX - r.left) / r.width - 0.5; requestRender(); };
  const onLeave = () => { hoverX = 0; requestRender(); };
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);

  /* ---------------- helpers ---------------- */
  const V = () => new THREE.Vector3();
  const tmp = V(), tmp2 = V(), hubLow = V(), hubTop = V(), center = V(), gctrl = V();
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V();
  const ports = agents.map(() => V());
  /** Control point for an arc: from the cloud the packet swings outward and down; between peers it hops up. */
  const ctrlFor = (a: THREE.Vector3, b: THREE.Vector3, kind: 'down' | 'up' | 'hop', out: THREE.Vector3) => {
    out.copy(a).lerp(b, 0.5);
    if (kind === 'hop') return out.setY(Math.max(a.y, b.y) + 0.95);
    const far = kind === 'down' ? b : a;
    tmp2.set(far.x - center.x, 0, far.z - center.z).normalize();
    return out.addScaledVector(tmp2, 0.55).setY(Math.max(a.y, b.y) + 0.15);
  };
  type Flight = { a: THREE.Vector3; c: THREE.Vector3; b: THREE.Vector3; p: number; s: number };
  const flights: Flight[] = Array.from({ length: POOL }, () => ({ a: V(), c: V(), b: V(), p: 0, s: 1 }));
  let nFlights = 0;
  const addFlight = (a: THREE.Vector3, b: THREE.Vector3, kind: 'down' | 'up' | 'hop', p: number) => {
    if (nFlights >= POOL || p <= 0 || p >= 1) return;
    const f = flights[nFlights++];
    f.a.copy(a); f.b.copy(b); ctrlFor(a, b, kind, f.c); f.p = p; f.s = Math.min(1, smooth(0, 0.12, p) * 1.0 + 0.25) * (1 - smooth(0.9, 1, p) * 0.6);
  };
  const departOf = (i: number) => PLAN_START + i * PLAN_GAP;
  const landOf = (i: number) => departOf(i) + FLY;

  let lastPhase = -1;
  const phaseOf = (ct: number) => (ct < BEATS[1] ? 0 : ct < BEATS[2] ? 1 : ct < BEATS[3] ? 2 : 3);
  const durOf = (p: number) => (p < 3 ? BEATS[p + 1] - BEATS[p] : CYCLE - BEATS[3]);

  /* ---------------- per-frame ---------------- */
  const update = (t: number) => {
    const composed = REDUCED;                      // one legible frame: everyone at work, packets en route, page shipped
    const ct = composed ? 8.4 : ((t % CYCLE) + CYCLE) % CYCLE;

    if (!composed && props?.onPhase) {
      const ph = phaseOf(ct);
      if (ph !== lastPhase) { lastPhase = ph; props.onPhase(ph, durOf(ph)); }
    }

    const target = (composed ? 0 : Math.sin(t * 0.13) * 0.06) + hoverX * 0.22;
    rotY += (target - rotY) * (composed ? 1 : 0.06);
    world.rotation.y = rotY;

    const off = 1 - smooth(RESET, CYCLE - 0.15, ct);     // power-down before loop restart

    // agents: bob, wake on arrival, work, pop on hand-off
    agents.forEach((a, i) => {
      const land = landOf(i);
      const wake = composed ? 1 : smooth(land - 0.05, land + 0.35, ct) * off;
      const k = composed ? 0.78 : clamp01((ct - land - 0.15) / (BEATS[3] + 0.3 - land));
      let pop = bump(ct, land, 0.36);
      for (const [, to, at] of PEERS) if (to === i) pop += bump(ct, at + FLY, 0.32) * 0.7;
      pop += bump(ct, MERGE_AT - 0.05, 0.3) * 0.6;
      if (composed) pop = 0;
      a.g.position.copy(a.pos);
      a.g.position.y += Math.sin(t * 0.9 + i * 1.3) * (composed ? 0 : 0.05) + (composed ? 0 : pop * 0.08);
      a.g.rotation.copy(a.rot);
      a.g.scale.setScalar(a.scale * (1 + pop * 0.05));
      if (a.screen) {
        a.screen.color.copy(OFF).lerp(ON, wake);
        a.screen.emissiveIntensity = 0.12 * wake;
      }
      a.work(k * off, wake, t);
    });

    // cloud: breathe, swell when a goal arrives / results merge
    const swell = composed ? 0 : bump(ct, GOAL_LAND - 0.05, 0.5) + bump(ct, MERGE_LAND - 0.05, 0.55) * 1.2 +
      agents.reduce((s, _, i) => s + bump(ct, departOf(i) - 0.05, 0.25) * 0.35, 0);
    hub.scale.setScalar(1 + swell * 0.07 + (composed ? 0 : Math.sin(t * 1.1) * 0.012));
    hub.position.y = HUB.y + (composed ? 0 : Math.sin(t * 0.7) * 0.05);
    extras.forEach(({ c, base, i }) => { c.position.copy(base); c.position.x += composed ? 0 : Math.sin(t * 0.2 + i * 2) * 0.25; });

    // the page ships: drops from the cloud into the middle of the ring
    const ps = composed ? 1 : backOut(clamp01((ct - SHIP_AT) / 0.55)) * (1 - smooth(CYCLE - 0.8, CYCLE - 0.2, ct)) * (ct >= SHIP_AT ? 1 : 0);
    page.visible = ps > 0.01;
    page.scale.setScalar(Math.max(1e-4, ps * PAGE_S));
    page.position.lerpVectors(PAGE0, PAGE1, composed ? 1 : ease(clamp01((ct - SHIP_AT) / 1.1)));
    page.position.y += composed ? 0 : Math.sin(t * 1.2) * 0.04;
    page.rotation.set(-0.1, YAW + (composed ? 0.16 : Math.sin(t * 0.8) * 0.22), 0, 'YXZ');

    world.updateMatrixWorld(true);
    agents.forEach((a, i) => a.port.getWorldPosition(ports[i]));
    hub.getWorldPosition(center);
    hubLow.copy(center).add(tmp.set(0, -0.42, 0));
    hubTop.copy(center).add(tmp.set(0, 0.62, 0));

    // flights
    nFlights = 0;
    if (composed) {
      agents.forEach((_, i) => addFlight(hubLow, ports[i], 'down', 0.52 + (i % 2) * 0.1));
    } else {
      agents.forEach((_, i) => addFlight(hubLow, ports[i], 'down', ease(clamp01((ct - departOf(i)) / FLY))));
      for (const [from, to, at] of PEERS) addFlight(ports[from], ports[to], 'hop', ease(clamp01((ct - at) / FLY)));
      agents.forEach((_, i) => addFlight(ports[i], hubLow, 'up', ease(clamp01((ct - MERGE_AT - i * 0.07) / FLY))));
    }
    packets.forEach((m, j) => {
      if (j >= nFlights) { m.visible = false; return; }
      const f = flights[j];
      m.visible = true;
      qbez(f.a, f.c, f.b, f.p, m.position);
      m.scale.setScalar(f.s);
    });
    q.identity();
    for (let j = 0; j < POOL; j++) {
      for (let r = 0; r < TRAIL; r++) {
        const idx = j * TRAIL + r;
        if (j < nFlights && flights[j].p - (r + 1) * 0.045 > 0) {
          const f = flights[j];
          qbez(f.a, f.c, f.b, f.p - (r + 1) * 0.045, tmp);
          sc.setScalar(f.s * (0.85 - r * 0.22));
        } else { tmp.set(0, -50, 0); sc.setScalar(1e-4); }
        trail.setMatrixAt(idx, mtx.compose(tmp, q, sc));
      }
    }
    trail.instanceMatrix.needsUpdate = true;

    // guide dots: drawn by each dispatch packet, kept while the agents work, cleared on reset
    agents.forEach((_, i) => {
      const c = ctrlFor(hubLow, ports[i], 'down', gctrl);
      for (let d = 0; d < DOTS; d++) {
        const p = (d + 0.6) / (DOTS + 0.4);
        const at = departOf(i) + ease(p) * FLY;
        const s = composed ? 1 : smooth(at - 0.02, at + 0.18, ct) * (1 - smooth(MERGE_AT + 0.2, MERGE_AT + 1.2, ct));
        qbez(hubLow, c, ports[i], p, tmp);
        sc.setScalar(Math.max(1e-4, s));
        guide.setMatrixAt(i * DOTS + d, mtx.compose(tmp, q, sc));
      }
    });
    guide.instanceMatrix.needsUpdate = true;

    // the goal: a coral star drops in from above and is absorbed by the cloud
    const gp = composed ? -1 : clamp01((ct - GOAL_FROM) / (GOAL_LAND - GOAL_FROM));
    goal.visible = gp > 0 && gp < 1;
    if (goal.visible) {
      const e = ease(gp);
      goal.position.set(lerp(center.x + 0.45, center.x, e), lerp(hubTop.y + 0.95, hubTop.y - 0.15, e), lerp(center.z + 0.5, center.z + 0.2, e));
      goal.scale.setScalar(Math.max(1e-4, smooth(0, 0.18, gp) * (1 - smooth(0.82, 1, gp) * 0.85)));
      goal.rotation.set(t * 1.6, t * 2.1, 0);
    }
  };

  /* ---------------- layout + camera ---------------- */
  const fit = () => {
    const L = camera.aspect < 1.0 ? NARROW : WIDE;
    agents.forEach((a, i) => place(a.pos, L.agents[i]));
    place(HUB, L.hub);
    place(PAGE1, L.page); PAGE0.copy(HUB).add(tmp.set(0, -0.5, 0));
    extras.forEach((e, i) => place(e.base, L.extras[i]));
    const saved = world.rotation.y;
    world.rotation.y = 0;
    agents.forEach((a) => { a.g.position.copy(a.pos); a.g.rotation.copy(a.rot); a.g.scale.setScalar(a.scale); });
    hub.position.copy(HUB); hub.scale.setScalar(1);
    page.position.copy(PAGE1); page.rotation.set(-0.1, YAW, 0, 'YXZ'); page.scale.setScalar(PAGE_S); page.visible = true;
    extras.forEach(({ c, base }) => c.position.copy(base));
    world.updateMatrixWorld(true);
    const box = new THREE.Box3(), pts: THREE.Vector3[] = [];
    let low = Infinity;
    const add = (o: THREE.Object3D, grow = 0) => {
      box.setFromObject(o).expandByScalar(grow);
      low = Math.min(low, box.min.y);
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) pts.push(new THREE.Vector3(x, y, z));
    };
    agents.forEach((a) => add(a.g, 0.1));
    add(hub, 0.08); add(page); extras.forEach(({ c }) => add(c, 0.1));
    catcher.position.y = blob.position.y = low - 0.3;   // the goal star pops in above the frame's top and fades through the edge mask
    blob.position.y -= 0.01;
    const all: THREE.Vector3[] = [];
    const up = new THREE.Vector3(0, 1, 0);
    for (const ang of [-0.1, 0, 0.1]) for (const p of pts) all.push(p.clone().applyAxisAngle(up, ang));
    fitCamera(camera, all, CAM_DIR, AIM, 0.97);
    world.rotation.y = saved;
    world.updateMatrixWorld(true);
  };

  return {
    startTime: 0,
    staticTime: 8.4,
    render(t) {
      update(t);
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
      el.removeEventListener('pointerleave', onLeave);
      kit.dispose(scene);
      trail.dispose();
      guide.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
};

export default create;
