import { useId } from 'react';
import { patents, stats, type Patent } from '../data/profile';
import { SectionHeader } from '../components/SectionHeader';
import { ComicPanel } from '../components/ComicPanel';
import { Burst } from '../components/Burst';
import { Halftone } from '../components/Halftone';
import './Patents.css';

/* ---- data-derived copy (no invented facts) ---- */
const SMALL = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const word = (n: number) => SMALL[n] ?? String(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const employers = [...new Set(patents.map((p) => p.employer))];
const soleEmployer = employers.length === 1 ? employers[0] : undefined;
const field = stats.find((s) => s.label === 'US patents')?.context; // "Machine learning & web performance"

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "Mar 2021" → "2021-03" for <time dateTime>. */
function isoMonth(s: string) {
  const [m, y] = s.split(' ');
  const i = MONTHS.indexOf(m);
  return i >= 0 && y ? `${y}-${String(i + 1).padStart(2, '0')}` : undefined;
}

/** Serrated rosette outline for the certificate seal (120×120 box, centre 60,60). */
const ROSETTE = (() => {
  const n = 56;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = i % 2 === 0 ? 56 : 50;
    pts.push(`${(60 + Math.cos(a) * r).toFixed(1)},${(60 + Math.sin(a) * r).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
})();

/** Decorative certificate seal: coral rosette, ribbon tails, "US PATENT" ring text and "US" at the centre. */
function Seal() {
  const ring = `seal-ring-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg className="patents__seal" viewBox="0 0 120 150" aria-hidden="true" focusable="false">
      <path className="patents__seal-ribbon" d="M40 92 L26 146 L40 136 L50 149 L60 100Z" />
      <path className="patents__seal-ribbon patents__seal-ribbon--b" d="M80 92 L94 146 L80 136 L70 149 L60 100Z" />
      <path className="patents__seal-shadow" d={ROSETTE} transform="translate(4 4)" />
      <path className="patents__seal-rosette" d={ROSETTE} />
      <circle className="patents__seal-face" cx="60" cy="60" r="41" />
      <defs>
        <path id={ring} d="M60 60 m-31 0 a31 31 0 1 1 62 0 a31 31 0 1 1 -62 0" />
      </defs>
      <text className="patents__seal-ring">
        <textPath href={`#${ring}`} textLength="191" lengthAdjust="spacing">US PATENT ✶ US PATENT ✶ </textPath>
      </text>
      <text className="patents__seal-no" x="60" y="70" textAnchor="middle">US</text>
    </svg>
  );
}

/** "Idea!" lightbulb with comic glow rays (decorative). */
function Bulb() {
  const rays = [-180, -150, -120, -90, -60, -30, 0].map((deg) => {
    const a = (deg * Math.PI) / 180;
    const [r1, r2] = [84, 110];
    return `M${(100 + Math.cos(a) * r1).toFixed(1)} ${(92 + Math.sin(a) * r1).toFixed(1)}L${(100 + Math.cos(a) * r2).toFixed(1)} ${(92 + Math.sin(a) * r2).toFixed(1)}`;
  });
  return (
    <svg className="patents__bulb" viewBox="-20 -30 240 270" aria-hidden="true" focusable="false">
      <path className="patents__bulb-rays" d={rays.join('')} />
      <path className="patents__bulb-shadow" d="M100 22C56 22 32 56 32 92c0 32 22 48 34 74h68c12-26 34-42 34-74 0-36-24-70-68-70Z" transform="translate(7 7)" />
      <path className="patents__bulb-glass" d="M100 22C56 22 32 56 32 92c0 32 22 48 34 74h68c12-26 34-42 34-74 0-36-24-70-68-70Z" />
      <path className="patents__bulb-shine" d="M58 74c4-18 16-30 32-34" />
      <path className="patents__bulb-wire" d="M84 166 80 124M116 166l4-42" />
      <path className="patents__bulb-filament" d="M78 124l8-18 7 18 7-18 7 18 7-18 8 18" />
      <rect className="patents__bulb-base" x="64" y="166" width="72" height="15" rx="3" />
      <rect className="patents__bulb-base patents__bulb-base--b" x="66" y="181" width="68" height="15" rx="3" />
      <rect className="patents__bulb-base" x="68" y="196" width="64" height="15" rx="3" />
      <path className="patents__bulb-tip" d="M82 211h36l-8 14H90Z" />
    </svg>
  );
}

function Certificate({ p, i }: { p: Patent; i: number }) {
  const id = `patent-${i + 1}-title`;
  return (
    <ComicPanel
      as="li"
      tone="paper"
      tilt={i % 2 ? -0.8 : 0.8}
      className={`patents__panel patents__panel--cert patents__panel--${i + 1}`}
    >
      <article className="patents__cert" aria-labelledby={id}>
        <div className="patents__head">
          <Seal />
          <p className="patents__kicker eyebrow">United States Patent</p>
          <h3 id={id} className="patents__title">{p.title}</h3>
        </div>
        <dl className="patents__fields">
          <div className="patents__field patents__field--no">
            <dt>Patent no.</dt>
            <dd>{p.number}</dd>
          </div>
          <div className="patents__field">
            <dt>Issued</dt>
            <dd><time dateTime={isoMonth(p.issued)}>{p.issued}</time></dd>
          </div>
          <div className="patents__field">
            <dt>Employer</dt>
            <dd>{p.employer}</dd>
          </div>
        </dl>
        <p className="patents__note">
          <span className="patents__note-k">In plain English:</span> {p.note}
        </p>
      </article>
    </ComicPanel>
  );
}

/** PATENTS — comic page: a coral splash panel (lightbulb + speed lines) and one certificate panel per patent. */
export function Patents() {
  return (
    <section className="patents section tone-blue rule-top" id="patents" aria-labelledby="patents-title">
      <Halftone tone="periwinkle" density="coarse" fade="left" opacity={0.25} className="patents__dots" />
      <div className="wrap">
        <SectionHeader
          id="patents-title"
          eyebrow="Patents"
          title={
            field
              ? <>{cap(word(patents.length))} US patents in <em>{field.toLowerCase()}.</em></>
              : <>{cap(word(patents.length))} <em>US patents.</em></>
          }
        />

        <ol className="patents__grid" role="list">
          <ComicPanel
            as="li"
            tone="coral"
            tilt={-1}
            caption={soleEmployer ? `At ${soleEmployer}` : undefined}
            captionTone="paper"
            halftone="peach"
            halftoneFade="radial"
            className="patents__panel patents__panel--splash"
          >
            <div className="patents__art" aria-hidden="true">
              <span className="patents__speed" />
              <Bulb />
              <Burst text="PATENTED!" tone="paper" size={190} rotate={-10} spikes={14} className="patents__burst" />
            </div>
          </ComicPanel>
          {patents.map((p, i) => <Certificate key={p.number} p={p} i={i} />)}
        </ol>
      </div>
    </section>
  );
}
