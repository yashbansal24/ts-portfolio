import type { ReactNode } from 'react';
import './SpeechBubble.css';

export type BubbleSide = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'left' | 'right';
export type BubbleTone = 'paper' | 'ivory' | 'peach' | 'coral' | 'periwinkle' | 'blue';
export type SpeechBubbleProps = { children: ReactNode; side?: BubbleSide; tone?: BubbleTone; as?: 'div' | 'p' | 'blockquote'; className?: string };

/** Comic speech bubble: ink border, hard drop-shadow, tail on `side`. Content is real text (keep facts here legible, Inter Tight). */
export function SpeechBubble({ children, side = 'bottom-left', tone = 'paper', as: Tag = 'div', className }: SpeechBubbleProps) {
  return (
    <Tag className={['bubble', `bubble--${side}`, `bubble--${tone}`, className].filter(Boolean).join(' ')}>
      {children}
      <svg className="bubble__tail" viewBox="0 0 36 30" aria-hidden="true" focusable="false">
        <path d="M2 0 L12 28 L34 0" />
      </svg>
    </Tag>
  );
}
