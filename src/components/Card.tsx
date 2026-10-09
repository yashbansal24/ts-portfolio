import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

export type CardTone = 'paper' | 'ivory' | 'blue' | 'coral' | 'peach';
export type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode; tone?: CardTone; shadow?: 'sm' | 'md' | 'lg'; interactive?: boolean;
  as?: 'div' | 'article' | 'li' | 'section' | 'aside';
};

/** Bordered neo-brutal card with hard offset shadow; `interactive` adds hover lift / press. */
export function Card({ children, tone = 'paper', shadow = 'md', interactive = false, as: Tag = 'div', className, ...rest }: CardProps) {
  const cls = ['card', `card--${tone}`, `card--shadow-${shadow}`, interactive && 'card--interactive', className].filter(Boolean).join(' ');
  return <Tag className={cls} {...rest}>{children}</Tag>;
}
