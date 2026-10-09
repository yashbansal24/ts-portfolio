import { useId, useState, type CSSProperties } from 'react';
import { experience, type Role } from '../data/profile';
import { SectionHeader } from '../components/SectionHeader';
import { ComicPanel, type ComicPanelTone } from '../components/ComicPanel';
import { Halftone } from '../components/Halftone';
import { Burst } from '../components/Burst';
import { SpeechBubble, type BubbleTone } from '../components/SpeechBubble';
import { ChipList, type ChipTone } from '../components/Chip';
import { Button } from '../components/Button';
import { useMonthIndex } from '../hooks/useMonthIndex';
import './Experience.css';

/** Highlights shown before "Show all". */
const TOP = 3;

/* ---------- dates: "Nov 2025" / "Present" → month index (derived from profile.ts only) ---------- */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const isPresent = (s: string) => /present/i.test(s);
/** `now` = current month index (useMonthIndex), so prerender and hydration agree. */
function monthIndex(s: string, now: number): number {
  if (isPresent(s)) return now;
  const [m, y] = s.split(' ');
  return Number(y) * 12 + Math.max(0, MONTHS.indexOf(m.slice(0, 3)));
}
const yearOf = (s: string, now: number) => (isPresent(s) ? Math.floor(now / 12) : Number(s.split(' ')[1]));
/** Instrument Serif's "1" reads as "l" ("H1" → "Hl"), so digit runs in names are set in the sans. */
const nameNodes = (name: string) =>
  name.split(/(\d+)/).map((part, i) => (i % 2 ? <span key={i} className="experience__digits">{part}</span> : part));

/** Keep "sub-200 ms" on one line (non-breaking hyphen + space) — display only, the fact is unchanged. */
const keep = (s: string) => s.replace(/\bsub-(\d+) ms/g, 'sub\u2011$1\u00a0ms');

/** Career path oldest → newest, from the data: "PayPal → H1 → … → Presight (G42)". */
const path = [...experience]
  .reverse()
  .map((r) => (r.companyNote && r === experience[0] ? `${r.company} (${r.companyNote})` : r.company))
  .join(' → ');

/* ---------- look per panel (position in the strip, not tied to a company) ---------- */
type Look = { tone: ComicPanelTone; cap: 'paper' | 'peach' | 'coral'; bubble: BubbleTone; chip: ChipTone; tilt: number };
const LOOKS: Look[] = [
  { tone: 'paper', cap: 'coral', bubble: 'peach', chip: 'ivory', tilt: -0.5 },
  { tone: 'peach', cap: 'paper', bubble: 'paper', chip: 'paper', tilt: 1 },
  { tone: 'paper', cap: 'peach', bubble: 'periwinkle', chip: 'ivory', tilt: -1 },
  { tone: 'periwinkle', cap: 'paper', bubble: 'paper', chip: 'paper', tilt: -0.8 },
  { tone: 'peach', cap: 'paper', bubble: 'paper', chip: 'paper', tilt: 1.1 },
];
/** Proportional tenure rail (newest on the left, like the strip). Decorative: every date is also in the panels. */
function Rail({ now }: { now: number }) {
  return (
    <div className="experience__rail" aria-hidden="true">
      <div className="experience__rail-bar">
        {experience.map((r, i) => {
          const months = Math.max(1, monthIndex(r.end, now) - monthIndex(r.start, now));
          const tone = i === 0 && isPresent(r.end) ? 'coral' : LOOKS[i % LOOKS.length].tone;
          return (
            <span key={r.company} className={`experience__seg experience__seg--${tone}`} style={{ flexGrow: months } as CSSProperties}>
              <span className="experience__seg-name">{r.company}</span>
              <span className="experience__tick">{yearOf(r.start, now)}</span>
              {i === 0 && <span className="experience__tick experience__tick--now">Now</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function RolePanel({ role, index }: { role: Role; index: number }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const look = LOOKS[index % LOOKS.length];
  const current = index === 0 && isPresent(role.end);
  const when = `${role.start} — ${role.end}`;
  const extra = role.highlights.length - TOP;

  return (
    <li className={`experience__item${index === 0 ? ' experience__item--splash' : ''}`}>
      <ComicPanel
        as="article"
        className="experience__panel"
        tone={look.tone}
        tilt={look.tilt}
        captionTone={look.cap}
        caption={<span aria-hidden="true">{when} · {role.location}</span>}
      >
        {current && <Halftone tone="coral" density="medium" fade="radial" opacity={0.6} className="experience__splash-dots" />}
        <div className="experience__lead">
          <h3 className="experience__company">
            {nameNodes(role.company)}
            {role.companyNote && (
              <>
                <span className="sr-only">, </span>
                <span className="experience__note">{role.companyNote}</span>
              </>
            )}
          </h3>
          <p className="experience__title">{role.title}</p>
          <p className="sr-only">{`${role.start} to ${role.end}, ${role.location}`}</p>
          <SpeechBubble as="p" side="top-left" tone={look.bubble} className="experience__bubble">
            {keep(role.headline)}
          </SpeechBubble>
        </div>

        <div className="experience__detail">
          <ul className="experience__hl" id={listId} role="list" aria-label={`${role.company} highlights`}>
            {role.highlights.map((h, i) => (
              <li key={h} hidden={!open && i >= TOP}>{keep(h)}</li>
            ))}
          </ul>
          {extra > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="experience__more"
              aria-expanded={open}
              aria-controls={listId}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="experience__more-icon" aria-hidden="true">{open ? '−' : '+'}</span>
              {open ? `Show top ${TOP}` : `Show all ${role.highlights.length}`}
              <span className="sr-only"> {role.company} highlights</span>
            </Button>
          )}
          <ChipList items={role.stack} label={`${role.company} stack`} size="sm" tone={look.chip} className="experience__stack" />
        </div>
      </ComicPanel>
      {current && (
        <span className="experience__now">
          <Burst text="NOW!" tone="coral" size={132} rotate={12} spikes={14} />
        </span>
      )}
    </li>
  );
}

/** Experience — deep-blue comic zone: one ComicPanel per role (newest first) above a proportional tenure rail. */
export function Experience() {
  const now = useMonthIndex();
  return (
    <section className="experience section tone-blue" id="experience" aria-labelledby="experience-title">
      <Halftone tone="periwinkle" density="coarse" fade="up" opacity={0.2} />
      <Halftone tone="coral" density="medium" fade="radial" opacity={0.4} className="experience__dots" />
      <div className="wrap">
        <SectionHeader
          id="experience-title"
          eyebrow="Experience"
          title={<>From payments <em>to agents.</em></>}
          dek={`${path}.`}
          className="experience__sh"
        />
        <Rail now={now} />
        <ol className="experience__strip" role="list">
          {experience.map((r, i) => (
            <RolePanel key={r.company} role={r} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
