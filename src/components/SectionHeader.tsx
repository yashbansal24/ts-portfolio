import type { ReactNode } from 'react';
import './SectionHeader.css';

export type SectionHeaderProps = {
  id: string; eyebrow: string; title: ReactNode; dek?: ReactNode; num?: string;
  align?: 'start' | 'center'; size?: 'md' | 'xl'; className?: string;
};

/** Section opener: mono eyebrow + serif <h2 id={id}> (+ optional dek and italic section number). Wrap emphasis in <em>. */
export function SectionHeader({ id, eyebrow, title, dek, num, align = 'start', size = 'md', className }: SectionHeaderProps) {
  return (
    <header className={['sh', `sh--${align}`, `sh--${size}`, className].filter(Boolean).join(' ')}>
      {num && <span className="sh__num" aria-hidden="true">{num}</span>}
      <p className="sh__eyebrow eyebrow">{eyebrow}</p>
      <h2 id={id} className="sh__title">{title}</h2>
      {dek && <p className="sh__dek">{dek}</p>}
    </header>
  );
}
