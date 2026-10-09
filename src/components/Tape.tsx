import type { CSSProperties } from 'react';
import './Tape.css';

export type TapeProps = { items: readonly string[]; tone?: 'coral' | 'blue' | 'paper'; rotate?: number; speed?: number; reverse?: boolean; className?: string };

/** Slightly rotated tape band with scrolling uppercase text separated by ✶. Decorative (aria-hidden); static under reduced motion. */
export function Tape({ items, tone = 'coral', rotate = -2, speed = 32, reverse = false, className }: TapeProps) {
  const run = (
    <span className="tape__run">
      {items.map((t, i) => (
        <span key={i} className="tape__item">{t}<span className="tape__sep">✶</span></span>
      ))}
    </span>
  );
  return (
    <div className={['tape', `tape--${tone}`, className].filter(Boolean).join(' ')} aria-hidden="true"
      style={{ '--tape-rot': `${rotate}deg`, '--tape-dur': `${speed}s`, '--tape-dir': reverse ? 'reverse' : 'normal' } as CSSProperties}>
      <div className="tape__band">
        <div className="tape__track">{run}{run}{run}{run}</div>
      </div>
    </div>
  );
}
