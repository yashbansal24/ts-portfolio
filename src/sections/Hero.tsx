import { experience, profile } from '../data/profile';
import { Button } from '../components/Button';
import { Sticker } from '../components/Sticker';
import { MeshGradient } from '../components/MeshGradient';
import { Tape } from '../components/Tape';
import { ThreeCanvas } from '../three/ThreeCanvas';
import './Hero.css';

// Start fetching three.js + the desk scene as soon as this module runs, in parallel with first paint,
// instead of waiting for ThreeCanvas's IntersectionObserver. Mounting is still gated by the observer.
const deskModule = typeof window !== 'undefined' ? import('../three/scenes/deskScene') : null;
deskModule?.catch(() => {}); // the loader may never be called (no WebGL); don't surface an unhandled rejection
const loadDesk = () => deskModule ?? import('../three/scenes/deskScene');

// First sentence of the summary is the pitch.
const now = experience[0];
const nowLabel = `Now @ ${now.company}${now.companyNote ? ` (${now.companyNote})` : ''}, ${now.location}`;
const pitch = profile.summary.slice(0, profile.summary.indexOf('. ') + 1);

// Expertise keywords for the tape, taken from the résumé focus areas and skills (src/data/profile.ts):
// what the work is about, not counts, places or the job title (already in the hero).
const TAPE_ITEMS = [
  'Agentic systems',
  'Multi-agent orchestration',
  'LLM evals & guardrails',
  'Context engineering',
  'RAG',
  'MCP & tool calling',
  'Open-weight model serving',
  'Distributed systems',
  'AI platform engineering',
  'Fintech & payments',
];

/** Static SVG desk shown when WebGL is unavailable. */
function DeskFallback() {
  return (
    <svg viewBox="0 0 400 300" role="presentation">
      <ellipse cx="200" cy="268" rx="150" ry="16" fill="#14286E" opacity=".08" />
      <path d="M40 190 200 110 360 190 200 270Z" fill="#EFE6D3" stroke="#0E1B4D" strokeWidth="3" />
      <path d="M40 190v12l160 80v-12ZM360 190v12l-160 80v-12Z" fill="#FF6B4A" stroke="#0E1B4D" strokeWidth="3" />
      <path d="M120 70 230 20v110l-110 50Z" fill="#14286E" />
      <path d="M130 78 220 37v86l-90 41Z" fill="#DCE5F7" />
      <circle cx="182" cy="96" r="14" fill="#FF6B4A" />
      <path d="M150 210 250 160 290 180 190 230Z" fill="#14286E" />
      <path d="M270 130h40v50h-40Z" fill="#2A44A0" />
      <path d="M90 160c-30-40 40-60 20-20s-60 10-20 40" fill="none" stroke="#FF6B4A" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function Hero() {
  return (
    <>
      <section className="hero section tone-mesh" id="hero" aria-labelledby="hero-name">
        <MeshGradient preset="hero" />
        <div className="wrap hero__grid">
          <div className="hero__head">
            <h1 id="hero-name" className="hero__name">
              {profile.firstName} <em>{profile.lastName}</em>
            </h1>
            <p className="hero__title">{profile.title}</p>
            <p className="hero__focus">
              {profile.focus.slice(0, 2).map((f, i) => (
                <span key={f}>{i > 0 && <span aria-hidden="true"> · </span>}{f}</span>
              ))}
            </p>
          </div>

          <div className="hero__stage">
            <ThreeCanvas loader={loadDesk} lazyMargin="0px" className="hero__canvas" fallback={<DeskFallback />} />
          </div>

          <div className="hero__body">
            <Sticker tone="coral" rotate={-3} dot className="hero__now" as="p">{nowLabel}</Sticker>
            <p className="hero__pitch">{pitch}</p>
            <div className="hero__ctas">
              <Button href={`mailto:${profile.email}`} variant="primary" size="lg">Email me</Button>
              <Button href={profile.links.linkedin} variant="secondary" size="lg">LinkedIn</Button>
              <Button href={profile.links.github} variant="secondary" size="lg">GitHub</Button>
            </div>
          </div>
        </div>
      </section>
      <Tape items={TAPE_ITEMS} tone="coral" rotate={-2} className="hero__tape" />
    </>
  );
}
