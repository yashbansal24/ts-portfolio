import type { ReactNode } from 'react';
import './Chip.css';

export type ChipTone = 'ivory' | 'paper' | 'coral' | 'peach' | 'periwinkle' | 'blue';
export type ChipProps = { children: ReactNode; tone?: ChipTone; size?: 'sm' | 'md'; as?: 'li' | 'span'; className?: string };

/** Small mono tag with 2px ink border + 4px hard shadow. Use inside <ChipList> (renders <li>) or standalone with as="span". */
export function Chip({ children, tone = 'ivory', size = 'md', as: Tag = 'li', className }: ChipProps) {
  return <Tag className={['chip', `chip--${tone}`, `chip--${size}`, className].filter(Boolean).join(' ')}>{children}</Tag>;
}

/** Wrapping list of chips; `label` becomes the list's aria-label (e.g. "Stack"). */
export function ChipList({ items, label, tone, size, className }: { items: readonly string[]; label?: string; tone?: ChipTone; size?: 'sm' | 'md'; className?: string }) {
  return (
    <ul className={['chips', className].filter(Boolean).join(' ')} role="list" aria-label={label}>
      {items.map((t) => <Chip key={t} tone={tone} size={size}>{t}</Chip>)}
    </ul>
  );
}

/** Alias: a Tag is a Chip. */
export const Tag = Chip;
