import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';
type Common = { variant?: ButtonVariant; size?: 'sm' | 'md' | 'lg'; children: ReactNode; className?: string };
type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
export type ButtonProps = AsLink | AsButton;

/** Neo-brutal button: primary = coral, secondary = paper, ghost = outline, dark = deep blue. Renders <a> when `href` is set. */
export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: ButtonProps) {
  const cls = ['btn', `btn--${variant}`, `btn--${size}`, className].filter(Boolean).join(' ');
  if (rest.href !== undefined) {
    const a = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    const external = /^https?:/.test(a.href ?? '');
    return (
      <a className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...a}>
        {children}
      </a>
    );
  }
  const b = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" className={cls} {...b}>
      {children}
    </button>
  );
}
