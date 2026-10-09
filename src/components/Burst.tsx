import type { CSSProperties } from 'react';
import './Burst.css';

export type BurstTone = 'coral' | 'paper' | 'peach' | 'periwinkle' | 'blue';
export type BurstProps = {
  text: string; sub?: string; tone?: BurstTone; size?: number; rotate?: number; spikes?: number;
  label?: string; className?: string; style?: CSSProperties;
};

/** Deterministic comic starburst outline (slightly irregular spikes) in a 200×200 box. */
function burstPath(spikes: number, seed: number) {
  const pts: string[] = [];
  const n = spikes * 2;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const j = ((i * 37 + seed * 11) % 9) / 8; // 0..1 pseudo-jitter
    const r = i % 2 === 0 ? 92 - j * 10 : 66 + j * 6;
    pts.push(`${(100 + Math.cos(a) * r).toFixed(1)},${(100 + Math.sin(a) * r).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
}

/** SVG starburst with Bangers onomatopoeia ("SHIPPED!", "98%!"). Decorative unless `label` is given (then role="img"). Size in px; props are defaults — override from section CSS with --burst-size / --burst-fit / --burst-rot (no !important needed). */
export function Burst({ text, sub, tone = 'coral', size = 160, rotate = -8, spikes = 12, label, className, style }: BurstProps) {
  const d = burstPath(spikes, text.length);
  const fit = text.length <= 4 ? 0.3 : text.length <= 7 ? 0.22 : text.length <= 10 ? 0.17 : 0.14;
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  return (
    <div
      className={['burst', `burst--${tone}`, className].filter(Boolean).join(' ')}
      style={{ '--burst-size-p': `${size}px`, '--burst-fit-p': fit, '--burst-rot-p': `${rotate}deg`, ...style } as CSSProperties}
      {...a11y}
    >
      <svg className="burst__svg" viewBox="-6 -6 218 218" aria-hidden="true" focusable="false">
        <path d={d} transform="translate(7 7)" className="burst__shadow" />
        <path d={d} className="burst__shape" />
      </svg>
      <span className="burst__text" aria-hidden="true">
        {text}
        {sub && <small className="burst__sub">{sub}</small>}
      </span>
    </div>
  );
}
