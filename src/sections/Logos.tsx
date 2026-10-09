import { useState, type CSSProperties } from 'react';
import { experience } from '../data/profile';
import { SectionHeader } from '../components/SectionHeader';
import { setMotionPaused, useMotionPaused } from '../hooks/useMotionPaused';
import './Logos.css';

type Org = {
  name: string;
  /** image in /public/logos; omitted = typographic wordmark */
  file?: string;
  /** crop box (x, y, w, h) inside the original image (W) so each mark sits optically centred; size = % of tile width */
  crop?: { W: number; x: number; y: number; w: number; h: number; size: number };
  tone: 'paper' | 'ivory' | 'blue' | 'coral';
};

const now = experience[0];

const ORGS: Org[] = [
  { name: `${now.company} (${now.companyNote ?? ''})`, tone: 'coral' },
  { name: 'Deel', file: 'deel_logo.png', crop: { W: 1108, x: 195, y: 183, w: 727, h: 246, size: 46 }, tone: 'paper' },
  { name: 'Dataloop', file: 'dataloop.webp', crop: { W: 1672, x: 41, y: 53, w: 1601, h: 433, size: 72 }, tone: 'ivory' },
  { name: 'H1', file: 'h1_logo.png', crop: { W: 1764, x: 0, y: 0, w: 1764, h: 1038, size: 30 }, tone: 'paper' },
  { name: 'PayPal', file: 'paypal_logo.webp', crop: { W: 1280, x: 0, y: 157, w: 1280, h: 325, size: 68 }, tone: 'ivory' },
  { name: 'Google', file: 'google_logo.png', crop: { W: 500, x: 0, y: 0, w: 500, h: 512, size: 24 }, tone: 'paper' },
  { name: 'Envirospark', file: 'envirospark-logo-site.webp', crop: { W: 300, x: 6, y: 5, w: 287, h: 109, size: 56 }, tone: 'ivory' },
  { name: 'Ekster', file: 'ekster.webp', crop: { W: 1554, x: 54, y: 68, w: 1437, h: 224, size: 72 }, tone: 'paper' },
  // white logo → deep-blue tile
  { name: 'Petasense', file: 'petasense.png', crop: { W: 300, x: 0, y: 0, w: 300, h: 61, size: 72 }, tone: 'blue' },
  { name: 'Trading Economics', file: 'trading_economics.png', crop: { W: 300, x: 0, y: 114, w: 300, h: 72, size: 74 }, tone: 'ivory' },
];

function Tile({ org, i }: { org: Org; i: number }) {
  const cls = `logos__tile logos__tile--${org.tone}${i % 2 ? ' logos__tile--tilt-b' : ''}`;
  if (!org.file || !org.crop) {
    return (
      <li className={cls}>
        <span className="logos__legend" aria-hidden="true">Now</span>
        <span className="logos__wordmark" role="img" aria-label={org.name}>
          {now.company}<small>{now.companyNote}</small>
        </span>
      </li>
    );
  }
  const c = org.crop;
  const style = { '--W': c.W, '--cw': c.w, '--ch': c.h, '--x': c.x, '--y': c.y, '--size': `${c.size}%` } as CSSProperties;
  return (
    <li className={cls}>
      <span className="logos__legend" aria-hidden="true">{org.name}</span>
      <span className="logos__crop" style={style}>
        <img src={`/logos/${org.file}`} alt={org.name} loading="lazy" decoding="async" />
      </span>
    </li>
  );
}

/** "Organizations I've worked with" — neo-brutal logo tiles in a marquee (pausable; static grid under reduced motion). */
export function Logos() {
  const [localPaused, setPaused] = useState(false);
  // the site-wide motion switch (Nav) also freezes the track via global.css; keep the label in sync with it
  const motionPaused = useMotionPaused();
  const paused = localPaused || motionPaused;
  const toggle = () => {
    if (motionPaused) {
      setMotionPaused(false); // the track cannot play while motion is paused site-wide
      setPaused(false);
    } else setPaused((p) => !p);
  };
  return (
    <section className="logos section tone-paper rule-bottom" id="organizations" aria-labelledby="orgs-title">
      <div className="wrap logos__head">
        <SectionHeader id="orgs-title" num="01" eyebrow={`Logos · ${ORGS.length} organizations`} title={<>Organizations <em>I've worked with</em></>} />
        <button type="button" className="logos__toggle" onClick={toggle}>
          <span aria-hidden="true">{paused ? '▶' : '❚❚'}</span> {paused ? 'Play' : 'Pause'} logos
        </button>
      </div>
      <div className={`logos__marquee${paused ? ' is-paused' : ''}`}>
        <div className="logos__track">
          <ul className="logos__list" role="list">
            {ORGS.map((o, i) => <Tile key={o.name} org={o} i={i} />)}
          </ul>
          <ul className="logos__list logos__list--dupe" role="list" aria-hidden="true">
            {ORGS.map((o, i) => <Tile key={o.name} org={o} i={i} />)}
          </ul>
        </div>
      </div>
    </section>
  );
}
