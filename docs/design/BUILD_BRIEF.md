# Build brief — theyashbansal.com v2 ("The Impossible Desk", neo-brutalist edition)

## Client decisions (final, do not deviate)
- Direction: **"The Impossible Desk"** preview — reference implementation at
  `/tmp/claude-0/-home-user-ts-portfolio/5e463ba0-2d91-5814-ade6-ae6124355345/scratchpad/previews/v2-desk/` (index.html, style.css, main.js, gen.mjs). Live at http://localhost:5180/v2-desk/. Screenshot: `.../scratchpad/show2/v2-desk-desktop-hero.png`. The client chose it as "the best".
- Client add-on: **"use some neo-brutalism elements as well, making it pop more."**
- Client constraint: **"Don't use that many servers. Keep all elements but don't repeat elements except the cloud."** → In 3D, each object type appears ONCE (one monitor, one keyboard, one server rack, one mug, one cable, one sun, one keycap staircase). Clouds may repeat. No fleets of servers/monitors/laptops anywhere.
- Palette: warm ivory, deep editorial blue, coral orange (from the preview: --ivory #F7F1E5, --ivory-2 #EFE6D3, --paper #FFFDF8, --blue #14286E, --blue-2 #2A44A0, --coral #FF6B4A). Add an ink token for neo-brutal outlines/shadows: --ink #0E1B4D (darkest blue — NOT black).
- Exactly TWO WebGL scenes: (1) Hero desk (port from preview), (2) Slayb section (new, see below). Everything else CSS/SVG.
- Keep the organization logos from the old site (all 10: Presight wordmark + Deel, Dataloop, H1, PayPal, Google, Envirospark, Ekster, Petasense, Trading Economics), shown as a scrolling strip like the old site's marquee.
- Light, bright, friendly, surreal. Never spooky.

## Neo-brutalism layer (apply consistently; this is what makes it "pop")
- Thick outlines: `border: 3px solid var(--ink)` on cards, buttons, chips, tiles, nav, image frames. (2px on small chips.)
- Hard offset shadows, no blur: `box-shadow: 6px 6px 0 var(--ink)` (cards), `4px 4px 0` (buttons/chips). Hover: `translate(-2px,-2px)` + bigger shadow. Active: `translate(4px,4px)` + shadow 0. Transitions 120–160ms.
- Flat colour blocking: whole sections or big panels in solid coral or solid deep blue (with ivory text), cards in --paper/--ivory-2. No gradients on buttons, cards or chips; gradients appear ONLY as the gradient-mesh section backgrounds described below (3D lighting may be soft).
- Stickers: small rotated (-4°…+4°) labels with border + hard shadow, e.g. "NOW @ PRESIGHT (G42)", "2 US PATENTS", "20+ PAYING CUSTOMERS", "★ 8". Use sparingly (≤1–2 per section).
- Tape marquee: a coral band with ink borders top/bottom, slightly rotated (≈-2°), scrolling uppercase mono/heavy-sans text separated by ✶. Respect reduced motion (static).
- Type: Instrument Serif (display, editorial headlines, italics) + Inter Tight (body; 800 weight for heavy neo-brutal labels/buttons) + JetBrains Mono (eyebrows, figure captions, metadata) + Bangers (comic bursts/onomatopoeia ONLY). Google Fonts, `display=swap`.
- Subtle ivory dot/graph-paper grid on the page background is welcome.
- Radii small: 0–10px. Mix square and slightly rounded deliberately.
- Keep the editorial "magazine" feel of the preview (FIG. captions, issue line "PORTFOLIO / EDITION 2026 / UNITED ARAB EMIRATES") — neo-brutalism is layered on top, not a replacement.

## Gradient mesh + comic-book art (client add-on, latest message: "Use gradient mesh and comic book art at different sections")
Use these two devices in DIFFERENT sections (not everywhere), so the page alternates: editorial-ivory → mesh → comic → mesh …
- **Gradient mesh**: soft, multi-point mesh gradients built from layered CSS radial-gradients (4–6 colour points) on a section background, optionally drifting very slowly (transform/background-position, ≥ 20s loop, off under reduced motion). Colours stay in the palette family: ivory #F7F1E5, peach/coral-soft #FFD9CC, coral #FF6B4A, periwinkle #C9D6FF, blue-2 #2A44A0, deep blue #14286E. Mesh zones: **Hero backdrop** behind the 3D desk (light: ivory/peach/periwinkle, so text stays deep blue and readable), **Slayb** section (richer: coral + periwinkle + blue), **Contact** footer (bold: coral → blue). Text on mesh must still meet ≥ 4.5:1 — test the worst spot; add a paper/ink card behind text if needed. A fine grain/noise overlay (SVG feTurbulence data-URI, low opacity) is welcome to make the mesh feel printed.
- **Comic-book art** (Ben-Day/halftone print + panels): pairs naturally with the neo-brutal ink outlines. Devices: halftone dot fields (radial-gradient dot patterns, in coral or blue), halftone hard-shadows, speech/thought bubbles with tails, caption boxes (yellow is NOT in palette → use paper/coral-soft caption boxes with ink border), SVG starburst "POW!"-style bursts with onomatopoeia that match the content (e.g. "SHIPPED!", "PATENTED!", "98%!", "20M+!"), speed/action lines, multi-panel comic grids with gutters, tilted panels. Comic zones: **About/stats** (stats as burst/bubble panels), **Experience** (each role = a comic panel in a strip, caption boxes for dates/company, halftone backdrop on the deep-blue block), **Patents** ("origin story" panel with a PATENTED! burst), **Projects** (halftone shadows on cards, a speech bubble for taglines). Use comic lettering sparingly with a Google Font such as "Bangers" (display only, for bursts/onomatopoeia — this may be the 4th family; keep everything else to the 3 families) — keep body text in Inter Tight.
- Never let comic or mesh effects reduce legibility of facts; facts stay in clean body type.

## Tech
- Repo: /home/user/ts-portfolio (branch claude/surrealism-portfolio-site-wso2lo). Vite 8 + React 19 + TypeScript 5.9 (strict, noUnusedLocals/Parameters). Plain CSS files (one per section + global), CSS custom properties. Previous CRA site is archived in `legacy/` — do not modify or import from it (except copying logo files from legacy/public).
- three.js: npm package `three@0.169.0` (+ `@types/three` matching). Import addons from `three/examples/jsm/...`. Lazy-load the Slayb scene module with dynamic `import()` when its section approaches the viewport so the initial bundle stays lean.
- 3D rules: canvas inside fixed-aspect container (no layout shift); DPR ≤ 1.5; render only when on-screen (IntersectionObserver) and tab visible; prefers-reduced-motion → single static frame; WebGL failure → CSS/SVG fallback; dispose renderer/geometries on unmount; handle resize via ResizeObserver.
- Content: ONLY from `src/data/profile.ts` (profile, stats, experience, patents, skills, education, projects). Never invent facts. Do not edit profile.ts unless you are told to.
- Accessibility: one h1 (name), h2 per section, h3 for roles/projects; decorative art aria-hidden; visible focus (3px ink/blue outline + offset); keyboard-operable interactions; contrast ≥ 4.5:1 body text (deep blue on ivory ✓; ivory on deep blue ✓; text ON coral must be --ink and ≥ 4.5:1 — verify; never small coral text on ivory).
- Responsive: 360 → 1440+, breakpoints ~720px and ~1080px, no horizontal scroll at 360px.
- Performance: no new deps beyond three; images lazy where below fold; no CLS.
- Section ids (anchors): hero, organizations, about, experience, slayb, projects, patents, skills, education, contact.

## Tools
- Dev server: `npx vite --port <yourPort> --strictPort` (run in background, kill when done). Typecheck: `npx tsc -b`. Do NOT run `vite build` while other agents work (shared dist/), unless you are the integrator.
- Visual check: `node /tmp/claude-0/-home-user-ts-portfolio/5e463ba0-2d91-5814-ade6-ae6124355345/scratchpad/shot/check.mjs http://localhost:<port>/ <outDir> <label>` → JSON (errors, overflowX, h1 count) + PNGs `<label>-desktop-hero.png`, `-desktop-full.png`, `-mobile-hero.png`, `-mobile-full.png`. Element-only shots: write a tiny playwright-core script modelled on check.mjs (same launch args) that screenshots `#<sectionId>` at 1440 and 390 widths. Open PNGs with the Read tool and judge critically. Note: very tall mobile full-page shots may show repeated sections (a capture artefact) — use element shots for mobile.
