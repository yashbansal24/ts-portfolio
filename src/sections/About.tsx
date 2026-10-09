import { useEffect, useRef } from 'react';
import { experience, patents, profile, stats, type Stat } from '../data/profile';
import { SectionHeader } from '../components/SectionHeader';
import { SpeechBubble } from '../components/SpeechBubble';
import { ComicPanel, type ComicPanelTone } from '../components/ComicPanel';
import { Burst } from '../components/Burst';
import { Halftone } from '../components/Halftone';
import type { HalftoneTone } from '../components/Halftone';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import './About.css';

/* ---------- summary bubble: profile.summary minus its first sentence (the hero already shows that pitch) ---------- */
const cut = profile.summary.indexOf('. ') + 1;
const record = profile.summary.slice(cut).trim();
/** The record is set in Instrument Serif, whose "1" reads as "l" ("H1" → "Hl"), so digit runs are set in the sans. */
const recordNodes = record.split(/(\d+)/).map((part, i) => (i % 2 ? <span key={i} className="about__digits">{part}</span> : part));
const initials = `${profile.firstName[0]}${profile.lastName[0]}`;

/* ---------- stats → comic panels ----------
   Every fact comes from `stats`; the look (tone, tilt, comic device) is keyed by the stat label so a
   re-ordered or edited stats list still renders (unknown labels fall back to a plain paper panel). */
type Device = 'impact' | 'speed' | 'plain' | 'bubble' | 'thought' | 'saved';
type Look = {
  device: Device; tone: ComicPanelTone; caption: 'paper' | 'peach' | 'coral';
  tilt: number; halftone?: HalftoneTone; wide?: boolean;
};

const LOOKS: Record<string, Look> = {
  'agent workflow success': { device: 'impact', tone: 'coral', caption: 'paper', tilt: -1, wide: true },
  'less SDLC time': { device: 'speed', tone: 'paper', caption: 'peach', tilt: 0 },
  'daily active users': { device: 'plain', tone: 'blue', caption: 'coral', tilt: 1.2, halftone: 'periwinkle' },
  'notification events': { device: 'bubble', tone: 'peach', caption: 'paper', tilt: 0.8 },
  'US patents': { device: 'thought', tone: 'paper', caption: 'peach', tilt: 0, halftone: 'blue' },
  'saved per year': { device: 'saved', tone: 'periwinkle', caption: 'paper', tilt: -0.8, wide: true },
};
const FALLBACK: Look = { device: 'plain', tone: 'paper', caption: 'peach', tilt: 0 };

/** Which employer a stat belongs to, looked up in profile.ts (experience highlights / patents) — never typed by hand. */
function whereOf(s: Stat): string | undefined {
  if (/patent/i.test(s.label)) return patents[0]?.employer;
  return experience.find((r) => r.headline.includes(s.value) || r.highlights.some((h) => h.includes(s.value)))?.company;
}

/** Decorative comic "focus lines" radiating from the burst (impact panel). */
function ActionLines() {
  const rays = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    const w = i % 3 === 0 ? 0.05 : 0.025;
    const r = 900;
    const p = (ang: number) => `${(Math.cos(ang) * r).toFixed(1)},${(Math.sin(ang) * r).toFixed(1)}`;
    return `M0,0L${p(a - w)}L${p(a + w)}Z`;
  });
  return (
    <svg className="about__rays" viewBox="-300 -300 600 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <path d={rays.join('')} />
    </svg>
  );
}

/** Decorative speed lines trailing a "FASTER!" (the "less SDLC time" panel). */
function Faster() {
  const lines = [[6, 70, 2], [14, 10, 3], [22, 92, 2], [30, 34, 4], [38, 118, 2], [44, 60, 2]];
  return (
    <span className="about__sfx about__zoom" aria-hidden="true">
      <svg className="about__speed" viewBox="0 0 200 48" preserveAspectRatio="none" focusable="false">
        {lines.map(([y, x1, w]) => (
          <line key={y} x1={x1} x2={196} y1={y} y2={y} strokeWidth={w} />
        ))}
      </svg>
      <span className="about__sfx-word">FASTER!</span>
    </span>
  );
}

function StatPanel({ s }: { s: Stat }) {
  const look = LOOKS[s.label] ?? FALLBACK;
  const where = whereOf(s);
  const fact = (
    <p className="about__fact">
      <span className="about__num">{s.value}</span>
      <span className="about__label">{s.label}</span>
    </p>
  );
  // keep "sub-200 ms" on one line: non-breaking hyphen + space (display only; the fact is unchanged)
  const ctx = s.context.replace(/\bsub-(\d+) ms/g, 'sub\u2011$1\u00a0ms');
  const context = <p className="about__context">{ctx}</p>;

  let body;
  switch (look.device) {
    case 'impact':
      body = (
        <div className="about__impact">
          <div className="about__impact-art">
            <ActionLines />
            <span className="about__pop">
              <Burst text="RELIABLE!" tone="paper" size={210} rotate={-10} spikes={14} />
            </span>
          </div>
          <div className="about__impact-copy">{fact}{context}</div>
        </div>
      );
      break;
    case 'bubble':
      body = (
        <>
          {fact}
          <SpeechBubble side="top-left" tone="paper" as="p" className="about__say">{ctx}</SpeechBubble>
        </>
      );
      break;
    case 'thought':
      body = (
        <div className="about__think">
          {fact}
          <div className="about__thought">
            <p>{ctx}</p>
            <span className="about__thought-dot about__thought-dot--1" aria-hidden="true" />
            <span className="about__thought-dot about__thought-dot--2" aria-hidden="true" />
          </div>
        </div>
      );
      break;
    case 'saved':
      body = (
        <div className="about__impact about__impact--flip">
          <div className="about__impact-copy">{fact}{context}</div>
          <div className="about__impact-art about__impact-art--sm">
            <ActionLines />
            <span className="about__pop">
              <Burst text="SAVED!" tone="coral" size={170} rotate={9} spikes={11} />
            </span>
          </div>
        </div>
      );
      break;
    case 'speed':
      body = <>{fact}<Faster />{context}</>;
      break;
    default:
      body = <>{fact}{context}</>;
  }

  return (
    <ComicPanel
      as="li"
      tone={look.tone}
      tilt={look.tilt}
      halftone={look.halftone ?? false}
      caption={where && <><span className="sr-only">At </span>{where}</>}
      captionTone={look.caption}
      className={`about__panel about__panel--${look.device}${look.wide ? ' about__panel--wide' : ''}`}
    >
      {body}
    </ComicPanel>
  );
}

export function About() {
  const ref = useRef<HTMLElement>(null);

  // Bursts "pop" (and the FASTER! zooms) in once when they scroll into view (skipped entirely under reduced motion / no IO).
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;
    el.dataset.pop = 'ready';
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('is-popped');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    el.querySelectorAll('.about__pop, .about__zoom').forEach((n) => io.observe(n));
    return () => {
      io.disconnect();
      delete el.dataset.pop;
    };
  }, []);

  return (
    <section ref={ref} className="about section tone-ivory" id="about" aria-labelledby="about-title">
      <Halftone tone="coral" density="medium" fade="up" opacity={0.4} />
      <div className="wrap">
        <div className="about__top">
          <div className="about__intro">
            <SectionHeader
              id="about-title"
              eyebrow="About"
              title={<>Long-running agents. <em>Platforms that hold them up.</em></>}
            />
            <div className="about__focus">
              <p className="about__focus-label eyebrow">Focus</p>
              <ul className="about__focus-list" role="list">
                {profile.focus.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          </div>

          <figure className="about__manifesto">
            <SpeechBubble as="blockquote" side="bottom-left" tone="paper" className="about__bubble">
              <p className="about__record">{recordNodes}</p>
            </SpeechBubble>
            <figcaption className="about__speaker">
              <span className="about__avatar" aria-hidden="true">{initials}</span>
              <span>
                <b>{profile.name}</b>
                <span className="about__role">{profile.title}</span>
              </span>
            </figcaption>
          </figure>
        </div>

        <div className="about__bar">
          <h3 className="about__bar-title">Impact created</h3>
          <span className="about__bar-rule" aria-hidden="true" />
        </div>
        <ul className="about__grid" role="list">
          {stats.map((s) => <StatPanel key={s.label} s={s} />)}
        </ul>
      </div>
    </section>
  );
}
