import { useState, type CSSProperties } from 'react';
import { projects } from '../data/profile';
import { SectionHeader } from '../components/SectionHeader';
import { Card } from '../components/Card';
import { Sticker } from '../components/Sticker';
import { ChipList } from '../components/Chip';
import { Button } from '../components/Button';
import { MeshGradient } from '../components/MeshGradient';
import { ThreeCanvas } from '../three/ThreeCanvas';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { AgentsProps } from '../three/scenes/agentsScene';
import './Slayb.css';

// three.js + the scene stay in their own lazy chunk (type-only import above).
const loadAgents = () => import('../three/scenes/agentsScene');

const slayb = projects.find((p) => p.featured) ?? projects[0];
/** "20+ paying customers", lifted from the tagline in profile.ts (no hard-coded numbers). */
const customers = slayb.tagline.match(/\d[\d,.]*\+?\s+paying customers/i)?.[0];
/**
 * The count gets ONE emphasis: the coral sticker. When it closes the tagline ("… with 20+ paying
 * customers."), the sticker carries it and the tagline ends before it ("A live agentic AI platform.").
 * Any other phrasing keeps the full tagline and drops the sticker, so the fact is never shown twice.
 */
const [taglineLead = '', taglineTail = ''] = customers ? slayb.tagline.split(customers) : [];
const stickerCount = customers && /\s+with\s*$/i.test(taglineLead) && /^\W*$/.test(taglineTail) ? customers : undefined;
const tagline = stickerCount ? taglineLead.replace(/\s+with\s*$/i, '.') : slayb.tagline;

/** The beats of the 3D loop; the active one lights up in sync with the scene. */
const STEPS = [
  { label: 'Goal', note: 'Describe what you want.' },
  { label: 'Plan', note: 'The cloud splits it up.' },
  { label: 'Agents work in parallel', note: 'Each device is a different agent.' },
  { label: 'Ship', note: 'Results merge into one.' },
];

/** Flat SVG stand-in when WebGL is unavailable: one cloud, distinct devices, coral packets. */
function AgentsFallback() {
  const ink = '#0E1B4D', coral = '#FF6B4A', blue = '#14286E', blue2 = '#2A44A0', paper = '#FFFDF8', peri = '#C9D6FF', peach = '#FFD9CC';
  const paths = ['M178 104 Q120 120 92 186', 'M186 98 Q140 92 96 92', 'M226 98 Q270 90 304 92', 'M228 104 Q280 122 310 182', 'M204 112 Q204 170 204 220'];
  const dots = [[120, 140], [140, 93], [262, 91], [282, 140], [204, 168]];
  return (
    <svg viewBox="0 0 400 300" role="presentation" fill="none" stroke={ink} strokeWidth="3" strokeLinejoin="round">
      <ellipse cx="200" cy="284" rx="160" ry="10" fill={blue} stroke="none" opacity=".1" />
      {paths.map((d) => <path key={d} d={d} stroke={paper} strokeWidth="4" strokeDasharray="1 9" strokeLinecap="round" />)}
      <path d="M150 104c-16 0-18-26 2-26 0-22 30-26 38-10 8-16 40-14 40 8 20-2 24 28 2 28Z" fill={paper} />
      {/* laptop */}
      <path d="M44 176h76v-48H44Z" fill={blue} /><path d="M50 170h64v-36H50Z" fill={paper} />
      <path d="M34 186h96l-10-10H44Z" fill={blue} />
      <path d="M56 142h30M62 152h40M56 162h22" stroke={coral} strokeWidth="4" />
      {/* tablet */}
      <rect x="62" y="66" width="62" height="46" rx="5" fill={paper} /><rect x="68" y="72" width="50" height="34" fill={peri} />
      <path d="M76 102v-8M86 102v-16M96 102v-11M106 102v-20" stroke={coral} strokeWidth="5" />
      {/* GPU chip */}
      <path d="M286 74h8M286 84h8M286 94h8M330 74h8M330 84h8M330 94h8" />
      <rect x="292" y="62" width="40" height="40" rx="4" fill={blue} /><rect x="302" y="72" width="20" height="20" rx="3" fill={coral} />
      {/* phone */}
      <rect x="300" y="160" width="32" height="58" rx="7" fill={coral} /><rect x="305" y="166" width="22" height="46" rx="3" fill={paper} />
      <path d="M309 176h12M312 186h10" stroke={blue2} strokeWidth="4" />
      {/* watch */}
      <path d="M194 214h20v-12h-20ZM194 254h20v12h-20Z" fill={peach} />
      <circle cx="204" cy="234" r="21" fill={blue2} /><circle cx="204" cy="234" r="14" fill={paper} />
      <path d="M204 224a10 10 0 1 1-9 6" stroke={coral} strokeWidth="4" strokeLinecap="round" />
      {dots.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="6" fill={coral} />)}
    </svg>
  );
}

export function Slayb() {
  const reduced = useReducedMotion();
  const [beat, setBeat] = useState<{ i: number; d: number }>({ i: -1, d: 0 });
  const [options] = useState<AgentsProps>(() => ({ onPhase: (i, d) => setBeat({ i, d }) }));
  const active = reduced ? -1 : beat.i;

  return (
    <section className="slayb section tone-mesh" id="slayb" aria-labelledby="slayb-title">
      <MeshGradient preset="slayb" />
      <div className="wrap slayb__grid">
        <div className="slayb__head">
          <SectionHeader
            id="slayb-title"
            size="xl"
            eyebrow="Featured product"
            title={<>{slayb.name}<span className="slayb__dot" aria-hidden="true">.</span></>}
          />
        </div>

        <figure className="slayb__fig">
          <ThreeCanvas<AgentsProps>
            loader={loadAgents}
            lazyMargin="600px 0px"
            options={options}
            className="slayb__stage"
            fallback={<AgentsFallback />}
          />
          <figcaption className="slayb__cap">
            <span className="sr-only">Illustration: one cloud coordinates a laptop, a tablet, a chip, a phone and a watch, each a different agent.</span>
            <ol className="slayb__steps" role="list" aria-label="How a goal moves through Slayb">
              {STEPS.map((s, i) => {
                const on = i === active;
                const cls = ['slayb__step', on && 'is-active', active > i && 'is-done'].filter(Boolean).join(' ');
                return (
                  <li key={s.label} className={cls} aria-current={on ? 'step' : undefined}>
                    <span className="slayb__step-label">{s.label}</span>
                    <span className="slayb__step-note">{s.note}</span>
                    {on && <span className="slayb__step-bar" aria-hidden="true" style={{ '--beat': `${beat.d}s` } as CSSProperties} />}
                  </li>
                );
              })}
            </ol>
          </figcaption>
        </figure>

        <div className="slayb__copy">
          <Card tone="paper" shadow="lg" className="slayb__card">
            {/* not aria-hidden: the sticker is the only place the customer count appears */}
            {stickerCount && (
              <span className="slayb__sticker">
                <Sticker tone="coral" rotate={4} dot>{stickerCount}</Sticker>
              </span>
            )}
            <p className="slayb__tagline">{tagline}</p>
            <p className="slayb__desc">{slayb.description}</p>
            <ChipList items={slayb.tech} label={`${slayb.name} focus`} size="sm" tone="periwinkle" className="slayb__chips" />
            <div className="slayb__cta">
              <Button href={slayb.url} variant="dark" size="lg">
                Visit {slayb.urlLabel}<span aria-hidden="true"> ↗</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
