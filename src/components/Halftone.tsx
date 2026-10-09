import type { CSSProperties } from 'react';
import './Halftone.css';

export type HalftoneTone = 'coral' | 'blue' | 'ink' | 'periwinkle' | 'paper' | 'peach';
export type HalftoneFade = 'none' | 'up' | 'down' | 'left' | 'right' | 'radial' | 'corner';
export type HalftoneProps = { tone?: HalftoneTone; density?: 'fine' | 'medium' | 'coarse'; fade?: HalftoneFade; opacity?: number; className?: string; style?: CSSProperties };

/** Ben-Day dot field overlay (absolute, fills its positioned parent, aria-hidden). `fade` = direction the dots fade OUT towards. */
export function Halftone({ tone = 'coral', density = 'medium', fade = 'none', opacity = 1, className, style }: HalftoneProps) {
  return (
    <div
      className={['halftone', `halftone--${tone}`, `halftone--${density}`, `halftone--fade-${fade}`, className].filter(Boolean).join(' ')}
      style={{ opacity, ...style }}
      aria-hidden="true"
    />
  );
}
