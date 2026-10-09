// Generates index.html from the single source of truth (profile.ts).
// Run: node --experimental-strip-types gen.mjs
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const P = await import('/home/user/ts-portfolio/src/data/profile.ts');
const { profile, stats, experience, projects } = P;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const here = fileURLToPath(new URL('.', import.meta.url));

// Logos: crop box (x,y,w,h) inside the original image (W,H) so every mark sits optically centered on its keycap.
const logos = [
  { name: 'Presight (G42)', wordmark: true },
  { name: 'Deel', file: 'deel_logo.png', W: 1108, H: 607, x: 195, y: 183, w: 727, h: 246, size: 52 },
  { name: 'Dataloop', file: 'dataloop.png', W: 1672, H: 552, x: 41, y: 53, w: 1601, h: 433, size: 74 },
  { name: 'H1', file: 'h1_logo.png', W: 1764, H: 1038, x: 0, y: 0, w: 1764, h: 1038, size: 34 },
  { name: 'PayPal', file: 'paypal_logo.webp', W: 1280, H: 640, x: 0, y: 157, w: 1280, h: 325, size: 72 },
  { name: 'Google', file: 'google_logo.png', W: 500, H: 512, x: 0, y: 0, w: 500, h: 512, size: 24 },
  { name: 'Envirospark', file: 'envirospark-logo-site.webp', W: 300, H: 122, x: 6, y: 5, w: 287, h: 109, size: 56 },
  { name: 'Ekster', file: 'ekster.png', W: 1554, H: 338, x: 54, y: 68, w: 1437, h: 224, size: 80, },
  { name: 'Petasense', file: 'petasense.png', W: 300, H: 61, x: 0, y: 0, w: 300, h: 61, size: 74, dark: true },
  { name: 'Trading Economics', file: 'trading_economics.png', W: 300, H: 300, x: 0, y: 114, w: 300, h: 72, size: 72 },
];
const logoHTML = logos.map((l, i) => {
  if (l.wordmark) {
    return `<li class="key key--enter" style="--i:${i}"><span class="key-legend" aria-hidden="true">Now</span>
          <span class="wordmark" role="img" aria-label="Presight (G42)">Presight<small>G42</small></span></li>`;
  }
  const style = `--W:${l.W};--cw:${l.w};--ch:${l.h};--x:${l.x};--y:${l.y};--size:${l.size}%`;
  return `<li class="key${l.dark ? ' key--blue' : ''}" style="--i:${i}"><span class="key-legend" aria-hidden="true">${esc(l.name)}</span>
          <span class="lg" style="${style}"><img src="../logos/${l.file}" alt="${esc(l.name)}" loading="lazy" decoding="async"></span></li>`;
}).join('\n        ');

const statHTML = stats.map((s, i) => `<li class="unit">
          <span class="unit-top" aria-hidden="true"><i class="led"></i>U${i + 1}<b class="vents"></b></span>
          <span class="unit-value">${esc(s.value)}</span>
          <span class="unit-label">${esc(s.label)}</span>
          <span class="unit-ctx">${esc(s.context)}</span>
        </li>`).join('\n        ');

const roleHTML = experience.map((r, i) => {
  const first = r.highlights.slice(0, 2), rest = r.highlights.slice(2);
  return `<li class="role">
          <div class="role-when"><span class="mono">${esc(r.start)} — ${esc(r.end)}</span><span class="mono role-loc">${esc(r.location)}</span></div>
          <div class="role-who">
            <h3>${esc(r.company)}${r.companyNote ? ` <span class="role-note">${esc(r.companyNote)}</span>` : ''}</h3>
            <p class="role-title">${esc(r.title)}</p>
          </div>
          <div class="role-what">
            <p class="role-head">${esc(r.headline)}</p>
            <ul class="role-list">${first.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
            ${rest.length ? `<details><summary>${rest.length} more ${rest.length === 1 ? 'highlight' : 'highlights'}</summary><ul class="role-list">${rest.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></details>` : ''}
            <ul class="chips" aria-label="Stack">${r.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          </div>
        </li>`;
}).join('\n        ');

const slayb = projects.find((p) => p.featured);
const pickNames = ['Legal Intel Dashboard', 'Kafka Producer–Consumer', 'Vector Space Search Engine', 'Vehicle Detection & Counting'];
const picks = pickNames.map((n) => projects.find((p) => p.name === n));
const projHTML = picks.map((p, i) => `<li class="card">
          <div class="card-meta mono"><span>${String(i + 1).padStart(2, '0')}</span><span>${p.year ? esc(p.year) : ''}${p.stars ? ` · ★ ${p.stars}` : ''}</span></div>
          <h3 class="card-title">${esc(p.name)}</h3>
          <p class="card-tag">${esc(p.tagline)}</p>
          <p class="card-desc">${esc(p.description)}</p>
          <ul class="chips chips--sm" aria-label="Tech">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          <a class="card-link" href="${esc(p.url)}" target="_blank" rel="noopener">GitHub · ${esc(p.urlLabel)}<span aria-hidden="true"> ↗</span></a>
        </li>`).join('\n        ');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Yash Bansal — ${esc(profile.title)}</title>
<meta name="description" content="${esc(profile.summary)}">
<meta name="theme-color" content="#F7F1E5">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Crect width=%2232%22 height=%2232%22 rx=%228%22 fill=%22%2314286E%22/%3E%3Ccircle cx=%2222%22 cy=%2210%22 r=%225%22 fill=%22%23FF6B4A%22/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="style.css">
<script type="importmap">{"imports":{"three":"../vendor/three.module.min.js","three/addons/":"../vendor/jsm/"}}</script>
<script type="module" src="main.js"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="nav">
  <div class="wrap nav-in">
    <a class="brand" href="#hero"><span class="brand-mark" aria-hidden="true">YB</span><span class="brand-name">Yash Bansal</span></a>
    <nav aria-label="Primary">
      <ul class="nav-links">
        <li><a href="#about">About</a></li>
        <li><a href="#experience">Experience</a></li>
        <li><a href="#slayb">Slayb</a></li>
        <li><a href="#projects">Projects</a></li>
      </ul>
    </nav>
    <a class="btn btn--coral btn--sm" href="#contact">Contact</a>
  </div>
</header>

<main id="main">
  <section class="hero" id="hero" aria-labelledby="hero-name">
    <div class="wrap hero-grid">
      <div class="hero-head">
        <p class="masthead mono"><span>Portfolio</span><span class="mh-opt">Edition 2026</span><span>${esc(profile.location)}</span></p>
        <h1 id="hero-name" class="display">${esc(profile.firstName)} <em>${esc(profile.lastName)}</em></h1>
        <p class="hero-title">${esc(profile.title)}</p>
        <p class="hero-focus">${esc(profile.focus[0])} <span aria-hidden="true">·</span> ${esc(profile.focus[1])}</p>
      </div>

      <figure class="hero-stage" aria-hidden="true">
        <div class="stage stage--desk" id="desk-stage" data-scene="desk">
          <div class="fallback fallback--desk">
            <svg viewBox="0 0 400 300" role="presentation">
              <ellipse cx="200" cy="268" rx="150" ry="16" fill="#14286E" opacity=".08"/>
              <path d="M40 190 200 110 360 190 200 270Z" fill="#EFE6D3" stroke="#E4D8C0"/>
              <path d="M40 190v12l160 80v-12ZM360 190v12l-160 80v-12Z" fill="#E4D8C0"/>
              <path d="M120 70 230 20v110l-110 50Z" fill="#14286E"/>
              <path d="M130 78 220 37v86l-90 41Z" fill="#DCE3F5"/>
              <circle cx="182" cy="96" r="14" fill="#FF6B4A"/>
              <path d="M150 210 250 160 290 180 190 230Z" fill="#14286E"/>
              <path d="M270 130h40v50h-40Z" fill="#2A44A0"/>
              <path d="M90 160c-30-40 40-60 20-20s-60 10-20 40" fill="none" stroke="#FF6B4A" stroke-width="5" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
        <figcaption class="cover-lines">
          <span class="cover-tag mono">Fig. 01 — The impossible desk</span>
          <span class="cover-call cover-call--a"><b>A screen deeper than its monitor.</b> Keycap stairs lead down to a coral sun.</span>
          <span class="cover-call cover-call--b"><b>Keys take flight</b> and rebuild themselves as a server rack.</span>
          <span class="cover-hint mono">Drag to turn ⟲</span>
        </figcaption>
      </figure>

      <div class="hero-body">
        <p class="hero-now"><span class="pulse" aria-hidden="true"></span>Now at ${esc(experience[0].company)} (${esc(experience[0].companyNote)}), UAE</p>
        <p class="hero-pitch">I build multi-agent systems that run for hours without falling over — and the distributed platforms underneath them.</p>
        <div class="ctas">
          <a class="btn btn--coral" href="mailto:${esc(profile.email)}">Email me</a>
          <a class="btn btn--ghost" href="${esc(profile.links.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
          <a class="btn btn--ghost" href="${esc(profile.links.github)}" target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>
    </div>
  </section>

  <section class="sec sec--logos" id="organizations" aria-labelledby="orgs-title">
    <div class="wrap">
      <div class="logos-head">
        <h2 id="orgs-title" class="kicker mono">Organizations I've worked with</h2>
        <p class="logos-note">Ten keys, one keyboard.</p>
      </div>
      <div class="board">
        <ul class="keys" role="list">
        ${logoHTML}
        </ul>
      </div>
    </div>
  </section>

  <section class="sec" id="about" aria-labelledby="about-title">
    <div class="wrap">
      <header class="sec-head">
        <span class="sec-num" aria-hidden="true">02</span>
        <p class="kicker mono">About</p>
        <h2 id="about-title" class="h2">Agents that run for hours. <em>Platforms that hold them up.</em></h2>
      </header>
      <div class="about-grid">
        <p class="about-lede">${esc(profile.summary)}</p>
        <ul class="units" role="list">
        ${statHTML}
        </ul>
      </div>
    </div>
  </section>

  <section class="sec" id="experience" aria-labelledby="exp-title">
    <div class="wrap">
      <header class="sec-head">
        <span class="sec-num" aria-hidden="true">03</span>
        <p class="kicker mono">Experience · since ${profile.careerStart}</p>
        <h2 id="exp-title" class="h2">Five desks, <em>eight years.</em></h2>
      </header>
      <ol class="roles" role="list">
        ${roleHTML}
      </ol>
    </div>
  </section>

  <section class="sec sec--slayb" id="slayb" aria-labelledby="slayb-title">
    <div class="wrap slayb-grid">
      <div class="slayb-copy">
        <header class="sec-head sec-head--tight">
          <span class="sec-num" aria-hidden="true">04</span>
          <p class="kicker mono">Featured · live product</p>
          <h2 id="slayb-title" class="h2 h2--xl">${esc(slayb.name)}</h2>
        </header>
        <p class="slayb-tag">${esc(slayb.tagline)}</p>
        <p class="slayb-desc">${esc(slayb.description)}</p>
        <ul class="chips" aria-label="Focus">${slayb.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <a class="btn btn--blue" href="${esc(slayb.url)}" target="_blank" rel="noopener">Visit ${esc(slayb.urlLabel)}<span aria-hidden="true"> ↗</span></a>
      </div>
      <figure class="slayb-fig">
        <div class="stage stage--agents" id="agents-stage" data-scene="agents" aria-hidden="true">
          <div class="fallback fallback--agents">
            <div class="fb-grid">${Array.from({ length: 12 }, (_, i) => `<i class="${i === 5 ? 'srv' : i === 6 ? 'gone' : ''}"></i>`).join('')}</div>
          </div>
        </div>
        <figcaption>
          <ol class="steps mono" id="agent-steps">
            <li data-step="0">A goal comes in</li>
            <li data-step="1">Agents plan, one after another</li>
            <li data-step="2">Six agents work in parallel</li>
            <li data-step="3">Results merge on the server</li>
          </ol>
          <p class="fig-note">Illustration of coordinated agents. The same shape runs my day job: at ${esc(experience[0].company)}, up to 6 agents per module handle parallel coding and QA.</p>
        </figcaption>
      </figure>
    </div>
  </section>

  <section class="sec" id="projects" aria-labelledby="proj-title">
    <div class="wrap">
      <header class="sec-head">
        <span class="sec-num" aria-hidden="true">05</span>
        <p class="kicker mono">Projects · GitHub</p>
        <h2 id="proj-title" class="h2">From the <em>GitHub drawer.</em></h2>
      </header>
      <ul class="cards" role="list">
        ${projHTML}
      </ul>
    </div>
  </section>
</main>

<footer class="contact" id="contact" aria-labelledby="contact-title">
  <div class="wrap">
    <span class="sec-num sec-num--light" aria-hidden="true">06</span>
    <p class="kicker mono">Contact</p>
    <h2 id="contact-title" class="h2 h2--contact">Pull up a chair <em>at the desk.</em></h2>
    <a class="contact-mail" href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>
    <ul class="contact-links" role="list">
      <li><a href="${esc(profile.links.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a></li>
      <li><a href="${esc(profile.links.github)}" target="_blank" rel="noopener">GitHub ↗</a></li>
      <li><a href="${esc(profile.links.website)}" target="_blank" rel="noopener">theyashbansal.com ↗</a></li>
      <li><a href="${esc(profile.links.slayb)}" target="_blank" rel="noopener">slayb.tech ↗</a></li>
    </ul>
    <p class="colophon mono"><span>© 2026 ${esc(profile.name)}</span><span>${esc(profile.location)}</span></p>
  </div>
</footer>
</body>
</html>
`;
fs.writeFileSync(here + 'index.html', html);
console.log('wrote index.html', html.length);
