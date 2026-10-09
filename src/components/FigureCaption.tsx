import type { ReactNode } from 'react';
import './FigureCaption.css';

export type FigureCaptionProps = { n: number; title: string; children?: ReactNode; tone?: 'ink' | 'paper'; as?: 'figcaption' | 'div' | 'span'; className?: string };

/** Editorial "FIG. 0x — Title" caption card (ink border); optional body text as children. */
export function FigureCaption({ n, title, children, tone = 'ink', as: Tag = 'figcaption', className }: FigureCaptionProps) {
  return (
    <Tag className={['figcap', `figcap--${tone}`, className].filter(Boolean).join(' ')}>
      <span className="figcap__label">Fig. {String(n).padStart(2, '0')} — {title}</span>
      {children && <span className="figcap__body">{children}</span>}
    </Tag>
  );
}
