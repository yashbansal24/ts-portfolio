# UI KIT — theyashbansal.com v2 ("The Impossible Desk", neo-brutalist + mesh + comic)

Repo: `/home/user/ts-portfolio`. Read `BUILD_BRIEF.md` first; this file is the contract for section engineers.
Facts come ONLY from `src/data/profile.ts` (import `profile, stats, experience, patents, skills, education, projects`).

## 0. What already exists

```
index.html                      fonts (Instrument Serif, Inter Tight 400–800, JetBrains Mono, Bangers), meta/OG, favicon
public/favicon.svg              "YB" coral neo-brutal tile
public/logos/*                  9 org logos (copied from legacy/public)
src/main.tsx                    imports styles/tokens.css + styles/global.css, renders <App/>
src/App.tsx                     <Nav/> <main id="main"> Hero Logos About Experience Slayb Projects Patents Skills Education </main> <Contact/>
src/styles/tokens.css           ALL tokens (below)
src/styles/global.css           reset, base type, .wrap, .section, tone classes, focus, utilities, reduced-motion
src/hooks/useReducedMotion.ts   useReducedMotion() hook + prefersReducedMotion()
src/components/*                UI kit (each .tsx imports its own .css); barrel: src/components/index.ts
src/three/ThreeCanvas.tsx       3D harness;  src/three/kit.ts  shared materials/helpers;  src/three/types.ts
src/three/scenes/deskScene.ts   hero scene (lazy)
src/sections/Hero.tsx|css       DONE (mesh + 3D desk + stickers + Tape below)
src/sections/Logos.tsx|css      DONE (#organizations marquee)
src/sections/{About,Experience,Slayb,Projects,Patents,Skills,Education,Contact}.tsx|css   STUBS — replace these
```

Stub contract (do not change): `export function About()` … `export function Contact()`; root element keeps its id
(`about`, `experience`, `slayb`, `projects`, `patents`, `skills`, `education`, and `contact` on a `<footer>`);
exactly one `<h2>` per section (use `<SectionHeader id="about-title" …/>` and `aria-labelledby="about-title"`); h3 for roles/projects/patents.
Only edit your own `Section.tsx` + `Section.css`. If you need a kit change, add a prop rather than changing defaults, and say so in your summary.

## 1. Tokens (`src/styles/tokens.css`)

| Group | Tokens |
|---|---|
| Palette | `--ivory #F7F1E5` (page), `--ivory-2 #EFE6D3`, `--line #E4D8C0` (decorative hairline only), `--paper #FFFDF8`, `--blue #14286E` (text, deep blocks), `--blue-2 #2A44A0`, `--coral #FF6B4A`, `--coral-soft`/`--peach #FFD9CC`, `--periwinkle #C9D6FF`, `--ink #0E1B4D` (outlines + shadows, never black), `--on-dark #F7F1E5`, `--on-dark-2 #C9D2F0` |
| Fonts | `--font-serif` Instrument Serif (display/h2/h3), `--font-sans` Inter Tight (body; 800 for heavy labels), `--font-mono` JetBrains Mono (eyebrows, captions, meta), `--font-comic` Bangers (Burst/onomatopoeia ONLY) |
| Type scale | `--fs-xs 12` `--fs-sm 14` `--fs-base 16–17` `--fs-md 18–21` `--fs-lg 22–30` `--fs-xl 30–44` `--fs-h2 42–88` `--fs-h2-xl 64–160` `--fs-display 64–158` (all clamp), `--lh-tight/.9 --lh-snug/1.25 --lh-body/1.6`, `--tracking-mono .14em` |
| Borders | `--bw 3px`, `--bw-sm 2px`, `--border` (3px ink), `--border-sm` (2px ink) |
| Shadows | `--shadow-sm 4px`, `--shadow 6px`, `--shadow-lg 10px`, `--shadow-hover-sm 6px`, `--shadow-hover 8px`, `--shadow-press 0` (all hard, ink, no blur). Context-aware: write `box-shadow: 6px 6px 0 var(--shadow-c, var(--ink))` — `--shadow-c` is coral inside `.tone-blue/.tone-ink` and resets to ink inside light cards/panels/bubbles |
| Radii | `--r-0 0`, `--r-sm 4px`, `--r 8px`, `--r-lg 10px`, `--r-pill` (bubbles/dots only) |
| Spacing | `--s-1..--s-10` = 4 8 12 16 24 32 48 64 96 128; `--gutter clamp(16,4vw,56)`, `--section-y clamp(64,9vw,120)`, `--max 1320px`, `--max-text 68ch`, `--nav-h 68px` |
| Z | `--z-bg -1` (mesh/halftone inside an isolated section), `--z-base 0`, `--z-raised 2`, `--z-overlay 10`, `--z-nav 50`, `--z-menu 60`, `--z-skip 100` |
| Motion | `--ease-out`, `--ease-snap`, `--ease-inout`, `--dur-fast 120ms` (press), `--dur 160ms` (hover), `--dur-slow 400ms`, `--dur-marquee 38s`, `--dur-mesh 28s` |
| Misc | `--grid-dot`, `--grid-size 24px` (body dot grid), `--focus` (outline colour; coral on dark tones) |

Contrast (verified): blue/ivory 12.0, blue-2/ivory 7.7, blue-2/ivory-2 7.0, blue-2/periwinkle 6.0, blue/peach 10.3, ink/coral 5.8, ivory/blue 12.0, on-dark-2/blue 9.0, ivory/blue-2 7.7, on-dark-2/blue-2 5.7, coral/blue 4.8 (large text or bold labels only). NEVER: coral text on ivory/paper, ivory text on coral.

## 2. Global classes (`global.css`)

- Layout: `.wrap` (max 1320 + gutter). Section root: `className="about section tone-ivory"` — `.section` = relative + `isolation:isolate` + vertical padding + scroll-margin.
- Tones: `.tone-ivory`, `.tone-ivory-2`, `.tone-paper`, `.tone-blue` (ivory text; focus+shadows switch to coral), `.tone-ink`, `.tone-coral` (ink text), `.tone-mesh` (transparent; add `<MeshGradient/>`). Seams: `.rule-top`, `.rule-bottom` (3px ink line between flat blocks).
- Type: `.serif`, `.mono`, `.comic`, `.eyebrow` (mono 12px uppercase tracked), `.h2`, `.lede` (serif 22–30), `.heavy` (Inter Tight 800 uppercase), `.muted` (blue-2; on-dark-2 on blue).
- Utilities: `.sr-only`, `.nb-box` (border+6px shadow), `.nb-box-sm`, `.nb-lift` (hover lift −2px / press +4px).
- Focus: `:focus-visible` = 3px `--focus` outline, 3px offset. Don't remove it.
- Reduced motion: global rule shortens all animations/transitions; components also set `animation:none` explicitly.

## 3. Naming

BEM-ish per section, prefixed by the section id: `.about`, `.about__grid`, `.about__stat`, `.about__stat--big`.
Kit classes are reserved: `btn sticker card chip(s) sh figcap tape nav mesh halftone burst bubble panel three-stage logos hero`. Never restyle kit classes globally — scope overrides: `.about .card { … }`.

## 4. Components (import from `'../components'` or the file)

### Button — `Button.tsx`
Props: `variant?: 'primary'|'secondary'|'ghost'|'dark'` (coral / paper / outline / deep blue), `size?: 'sm'|'md'|'lg'`, `href?` (renders `<a>`; `http(s)` links get `target=_blank rel=noopener noreferrer` automatically), plus native a/button attrs.
```tsx
<Button href={`mailto:${profile.email}`}>Email me</Button>
<Button href={profile.links.slayb} variant="dark">Visit slayb.tech ↗</Button>
<Button variant="secondary" onClick={…}>Show more</Button>
```

### Sticker — `Sticker.tsx`
Props: `children`, `rotate?=-3` (deg, keep −4…+4), `tone?: 'coral'|'paper'|'ivory'|'blue'|'peach'|'periwinkle'`, `dot?` (pulsing coral dot), `as?: 'span'|'p'|'div'`. ≤ 1–2 per section.
```tsx
<Sticker tone="coral" rotate={3}>{`${stats[4].value} ${stats[4].label}`}</Sticker>   // "2 US patents"
```

### Card — `Card.tsx`
Props: `tone?: 'paper'|'ivory'|'blue'|'coral'|'peach'`, `shadow?: 'sm'|'md'|'lg'`, `interactive?` (hover lift/press), `as?: 'div'|'article'|'li'|'section'|'aside'`, + HTML attrs. 3px ink border, radius 8.
```tsx
<Card as="li" tone="paper" interactive>…</Card>
```

### Chip / ChipList / Tag — `Chip.tsx`
`<Chip tone? size? as?='li'|'span'>`; `<ChipList items label? tone? size? />` renders `<ul role=list aria-label>` of chips. Tones `ivory|paper|coral|peach|periwinkle|blue`.
```tsx
<ChipList items={role.stack} label="Stack" size="sm" />
```

### SectionHeader — `SectionHeader.tsx`
Props: `id` (goes on the `<h2>`), `eyebrow` (mono box), `title: ReactNode` (wrap emphasis in `<em>` → italic blue-2 / coral on blue), `dek?`, `num?` ("02" italic serif numeral: ink with a 3px coral offset on light grounds and light cards; coral with a 1px ink outline only on .tone-blue/.tone-ink). Root is a `<div>` (never `<header>`: it sits inside the Contact `<footer>`), `align?: 'start'|'center'`, `size?: 'md'|'xl'`.
```tsx
<section className="about section tone-ivory" id="about" aria-labelledby="about-title">
  <div className="wrap"><SectionHeader id="about-title" num="02" eyebrow="About" title={<>Agents that run for hours. <em>Platforms that hold them up.</em></>} /></div>
</section>
```
(Headline copy may be editorial, but numbers/claims inside it must come from profile.ts.)

### Tape — `Tape.tsx`
Props: `items: string[]`, `tone?: 'coral'|'blue'|'paper'`, `rotate?=-2`, `speed?=32` (s/loop), `reverse?`. Decorative (aria-hidden), static under reduced motion. Place it BETWEEN two sections (sibling, not inside); it straddles the seam with −48px margins and paints over both. Max ~2 on the page (hero already has one).

### Nav — `Nav.tsx`
Already in App. `NAV_LINKS` lists every section id; scroll-spy sets `aria-current="location"`. <1080px: Menu button (aria-expanded/controls, focus first link, Tab trap, Esc returns focus, outside click closes). Includes the skip link to `#main`.

### MeshGradient — `MeshGradient.tsx`
Props: `preset?: 'hero'|'slayb'|'contact'`, `points?: {x,y,color,size?,hold?}[]` (custom; %, 6-digit hex), `base?`, `drift?=true` (28s transform drift, off in reduced motion), `grain?=true` (feTurbulence print grain). Absolute, `z-index:-1`, aria-hidden → first child of a `.section.tone-mesh` (needs isolation, which `.section` gives; add `overflow:hidden` on your section).
Text-safe zones: **hero** — anywhere (deep blue ≥ 9:1). **slayb** — top-left (peach/periwinkle) only for blue text; put body copy on a `Card tone="paper"` or the canvas frame; never body text over the coral/blue-2 corners. **contact** — ivory text in the blue lower/right 2/3 (≥ 7:1); the top-left is coral (ink text there, or keep it empty); put links/buttons on paper or coral fills.
```tsx
<section className="slayb section tone-mesh" id="slayb" aria-labelledby="slayb-title" style={{overflow:'hidden'}}>
  <MeshGradient preset="slayb" />
  …
</section>
```

### Halftone — `Halftone.tsx`
Props: `tone?: 'coral'|'blue'|'ink'|'periwinkle'|'paper'|'peach'`, `density?: 'fine'|'medium'|'coarse'`, `fade?: 'none'|'up'|'down'|'left'|'right'|'radial'|'corner'` (direction the dots fade OUT toward; `corner` = strongest bottom-right), `opacity?`, `className`, `style`. Absolute fill, z −1 → put inside a positioned+isolated parent (`.section`, `.panel`, or your own `position:relative; isolation:isolate`). Halftone "shadow" under a card: wrap card in a relative box and place a Halftone offset `style={{inset:'14px -14px -14px 14px'}}`.
On `.tone-blue` use `tone="periwinkle"` at ~0.25 opacity or `coral` at ~0.35.

### Burst — `Burst.tsx`
Props: `text` (Bangers, keep ≤ 10 chars: "SHIPPED!", "98%!", "20M+!"), `sub?` (tiny Inter Tight 800 line under it), `tone?: 'coral'|'paper'|'peach'|'periwinkle'|'blue'`, `size?=160` (px; override responsively with CSS `--burst-size`), `rotate?=-8`, `spikes?=12`, `label?` (if the burst carries a fact, pass a full sentence → role="img" aria-label; otherwise it is aria-hidden — then repeat the fact in real text nearby).
```tsx
<Burst text={stats[0].value + '!'} sub={stats[0].label} label={`${stats[0].value} ${stats[0].label}`} />
<Burst text="PATENTED!" tone="peach" size={150} rotate={8} />
```

### SpeechBubble — `SpeechBubble.tsx`
Props: `children`, `side?: 'bottom-left'|'bottom-right'|'top-left'|'top-right'|'left'|'right'` (tail position; matching margin is added), `tone?: 'paper'|'ivory'|'peach'|'coral'|'periwinkle'|'blue'`, `as?: 'div'|'p'|'blockquote'`. Hard drop-shadow follows the tail. Real text in Inter Tight 600.
```tsx
<SpeechBubble side="bottom-left" tone="peach" as="p">{project.tagline}</SpeechBubble>
```

### ComicPanel — `ComicPanel.tsx`
Props: `tone?: 'paper'|'ivory'|'peach'|'periwinkle'|'coral'|'blue'`, `tilt?=0` (deg; keep ±1.5), `caption?` (top-left caption box: dates/place, mono uppercase), `captionTone?: 'paper'|'peach'|'coral'`, `footer?` (bottom-right caption box), `halftone?: HalftoneTone|false`, `halftoneFade?` (default 'corner'), `as?: 'div'|'article'|'li'|'figure'|'section'`. Square corners, 3px ink border, 6px hard shadow (coral on blue sections automatically).
```tsx
<ol className="experience__strip" role="list">
  {experience.map((r, i) => (
    <ComicPanel as="li" key={r.company} tilt={i % 2 ? 1 : -1} caption={`${r.start} — ${r.end} · ${r.location}`} halftone={i === 0 ? 'coral' : false}>
      <h3>{r.company}</h3> …
    </ComicPanel>
  ))}
</ol>
```

## 5. three.js harness (`src/three/`)

```ts
type SceneFactory<P> = (canvas: HTMLCanvasElement, opts: {
  container: HTMLElement; dpr: number /* ≤1.5 */; reducedMotion: boolean; requestRender(): void; props: P;
}) => { render(t, dt): void; resize(w, h): void; dispose(): void; startTime?: number; staticTime?: number };
```
`<ThreeCanvas loader={() => import('../three/scenes/agentsScene')} lazyMargin="600px 0px" fallback={<Svg/>} className="slayb__stage" options={{…}} label?>{overlays}</ThreeCanvas>`
(or `factory={create}` for eager). The harness creates the `<canvas>`, caps DPR 1.5, ResizeObserver → `resize`, IntersectionObserver + `visibilitychange` pause, reduced motion → ONE frame at `staticTime` (re-drawn on resize / `requestRender`), WebGL missing / factory throws / context lost → renders `fallback`, disposes on unmount (StrictMode-safe). Decorative by default (aria-hidden). **Size the host in CSS** (fixed height or aspect-ratio) — no CLS. The canvas fades in when ready.

Scene skeleton (`src/three/scenes/agentsScene.ts`, `export default create`):
```ts
import * as THREE from 'three';
import type { SceneFactory } from '../types';
import { C, addLights, createKit, createRenderer, fitCamera, smooth, ease } from '../kit';
const create: SceneFactory = (canvas, { container, dpr, reducedMotion, requestRender }) => {
  const renderer = createRenderer(canvas, dpr);          // transparent, sRGB, soft shadows
  const kit = createKit();                               // clay(), roundedBox(), mesh(), cloud(), keycap(), radialTex(), dispose()
  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(22, 1, 0.5, 200);
  addLights(scene, 7);
  const tile = kit.mesh(kit.roundedBox(1.5, 0.22, 1.5, 0.09), kit.clay(C.paper)); scene.add(tile);
  const onMove = (e: PointerEvent) => { /* … */ requestRender(); };
  container.addEventListener('pointermove', onMove);
  return {
    startTime: 4.9, staticTime: 6.6,
    render(t) { /* animate with t */ renderer.render(scene, camera); },
    resize(w, h) { renderer.setSize(w, h, false); camera.aspect = w / h; fitCamera(camera, pts, dir, target); },
    dispose() { container.removeEventListener('pointermove', onMove); kit.dispose(scene); renderer.dispose(); renderer.forceContextLoss(); },
  };
};
export default create;
```
Kit exports: `C` (palette ints), `clamp01 smooth ease lerp qbez`, `createRenderer`, `addLights` (hemi + warm key w/ soft shadow + cool fill + front), `fitCamera`, `createKit()` → `{clay, roundedBox, mesh, cloud, keycap, radialTex, track, dispose}`, `rrect`. Matte clay = MeshStandard roughness .66, metalness 0, NoToneMapping. Rule: ONE of each object per scene (and across scenes no second desk/monitor fleet) — only clouds repeat. Slayb scene must not add more servers than ONE.

## 6. Section background rhythm (top → bottom)

| # | Section | Background | Device |
|---|---|---|---|
| 1 | hero | **light gradient mesh** `preset="hero"` (ivory/peach/periwinkle) behind the 3D desk | mesh + 3D |
| — | tape | **solid coral** band, −2°, straddling hero/logos | neo-brutal |
| 2 | organizations | **paper** (`tone-paper rule-bottom`) logo-tile marquee | neo-brutal |
| 3 | about | **ivory + comic**: stats as `Burst`s and `SpeechBubble`s, coral `Halftone` fading up | comic |
| 4 | experience | **solid deep blue** (`tone-blue`), roles as a strip of `ComicPanel`s (paper/peach panels, caption boxes for dates/company), periwinkle/coral halftone backdrop | comic |
| 5 | slayb | **rich gradient mesh** `preset="slayb"` + 3D agents scene (lazy), copy on a paper card | mesh + 3D |
| 6 | projects | **ivory**, cards with halftone hard-shadows, taglines in `SpeechBubble`s | comic-lite |
| 7 | patents | **comic origin-story panel(s)** (ComicPanel multi-panel grid) + "PATENTED!" `Burst`, on `tone-blue` with periwinkle Halftone at 0.25 (breaks the paper run between Projects and Skills) | comic |
| 8 | skills | **paper**, chips grouped in Cards | neo-brutal |
| 9 | education | **paper/ivory-2** (alternate with skills; separate with `rule-top`) | neo-brutal |
| 10 | contact (footer) | **bold gradient mesh** `preset="contact"` (coral → blue), ivory text, paper/coral buttons | mesh |

Mesh appears in exactly 3 places (hero, slayb, contact); comic devices in about, experience, projects, patents. Adjacent sections must differ in tone; use `.rule-top/.rule-bottom` (3px ink) between flat blocks.

## 7. Neo-brutal do / don't

DO
- 3px `--ink` borders on cards/buttons/tiles/panels; 2px on small chips. Hard offset shadows only (4px buttons/chips, 6px cards). Hover `translate(-2px,-2px)` + bigger shadow; active `translate(4px,4px)` + no shadow; 120–160ms.
- Flat fills from the palette. Mix square (panels, captions) and 4–10px radii (cards, buttons) deliberately.
- Keep the editorial voice: serif h2 with an `<em>` italic phrase, mono eyebrows, FIG. captions.
- Keep facts in clean Inter Tight/serif text; comic lettering (Bangers) only in Bursts.
- Text on coral = `--ink`. On blue = `--on-dark` / `--on-dark-2`. Test the worst spot on any mesh.
- Decorative art `aria-hidden`; any fact shown only in a Burst needs `label` or a visible text twin.
- Respect reduced motion (no drift, no marquee, no flying), and keep 360px free of horizontal scroll (rotated things need `overflow:hidden` on their section).

DON'T
- No gradients on buttons/cards/chips; gradients only as MeshGradient section backgrounds.
- No black (`#000`) — ink is `#0E1B4D`. No blurred drop shadows on UI.
- No more than 1–2 stickers per section, ≤ 2 Bursts per section, tilt ≤ ±4° (panels ±1.5°).
- Don't invent numbers/claims; don't repeat 3D objects (one server rack, one monitor…; clouds may repeat).
- Don't put body text directly on the coral/blue-2 zones of the slayb/contact mesh, or small coral text on ivory.
- Don't add dependencies; don't edit profile.ts, other sections, or kit defaults.
- Don't run `vite build` into the shared `dist/` (use `npx tsc -b`; if you must build, `--outDir` into the scratchpad).
