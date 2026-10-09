import type { CSSProperties, ReactNode } from 'react';
import { Halftone, type HalftoneTone } from './Halftone';
import './ComicPanel.css';

export type ComicPanelTone = 'paper' | 'ivory' | 'peach' | 'periwinkle' | 'coral' | 'blue';
export type ComicPanelProps = {
  children: ReactNode; tone?: ComicPanelTone; tilt?: number;
  caption?: ReactNode; captionTone?: 'paper' | 'peach' | 'coral'; footer?: ReactNode;
  halftone?: HalftoneTone | false; halftoneFade?: 'none' | 'up' | 'down' | 'left' | 'right' | 'radial' | 'corner';
  as?: 'div' | 'article' | 'li' | 'figure' | 'section'; className?: string; style?: CSSProperties;
};

/** Ink-bordered comic panel: optional top-left caption box (dates, places), bottom caption, halftone backdrop and tilt (deg). */
export function ComicPanel({
  children, tone = 'paper', tilt = 0, caption, captionTone = 'peach', footer,
  halftone = false, halftoneFade = 'corner', as: Tag = 'div', className, style,
}: ComicPanelProps) {
  return (
    <Tag className={['panel', `panel--${tone}`, className].filter(Boolean).join(' ')} style={{ '--panel-tilt': `${tilt}deg`, ...style } as CSSProperties}>
      {halftone && <Halftone tone={halftone} fade={halftoneFade} density="medium" opacity={tone === 'blue' ? 0.35 : 0.5} />}
      {caption && <div className={`panel__caption panel__caption--${captionTone}`}>{caption}</div>}
      <div className="panel__body">{children}</div>
      {footer && <div className={`panel__caption panel__caption--foot panel__caption--${captionTone}`}>{footer}</div>}
    </Tag>
  );
}
