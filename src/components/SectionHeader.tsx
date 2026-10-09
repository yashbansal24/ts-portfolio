import type { ReactNode } from 'react';
import './SectionHeader.css';

export type SectionHeaderProps = {
  id: string; eyebrow?: string; title: ReactNode; dek?: ReactNode;
  /** @deprecated Ignored — decorative section numbers were removed; kept optional so callers still compile while they drop it. */
  num?: string;
  align?: 'start' | 'center'; size?: 'md' | 'xl'; className?: string;
};

/**
 * Section opener: optional mono eyebrow + serif <h2 id={id}> (+ optional dek). Wrap emphasis in <em>.
 * Root is a plain <div>, not <header>: inside the Contact <footer> a <header> is invalid and is exposed as a stray banner landmark.
 */
export function SectionHeader({ id, eyebrow, title, dek, align = 'start', size = 'md', className }: SectionHeaderProps) {
  return (
    <div className={['sh', `sh--${align}`, `sh--${size}`, className].filter(Boolean).join(' ')}>
      {eyebrow && <p className="sh__eyebrow eyebrow">{eyebrow}</p>}
      <h2 id={id} className="sh__title">{title}</h2>
      {dek && <p className="sh__dek">{dek}</p>}
    </div>
  );
}
