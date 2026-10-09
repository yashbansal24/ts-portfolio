import type { CSSProperties, ReactNode } from 'react';
import './Sticker.css';

export type StickerTone = 'coral' | 'paper' | 'ivory' | 'blue' | 'peach' | 'periwinkle';
export type StickerProps = { children: ReactNode; rotate?: number; tone?: StickerTone; dot?: boolean; className?: string; as?: 'span' | 'p' | 'div' };

/** Small rotated label with ink border + hard shadow (e.g. "NOW @ PRESIGHT (G42)"). Use ≤ 1–2 per section. */
export function Sticker({ children, rotate = -3, tone = 'paper', dot = false, className, as: Tag = 'span' }: StickerProps) {
  return (
    <Tag className={['sticker', `sticker--${tone}`, className].filter(Boolean).join(' ')} style={{ '--rot': `${rotate}deg` } as CSSProperties}>
      {dot && <span className="sticker__dot" aria-hidden="true" />}
      {children}
    </Tag>
  );
}
