import { useCallback, useEffect, useRef, useState } from 'react';
import { profile } from '../data/profile';
import { Button } from './Button';
import './Nav.css';

export type NavLink = { id: string; label: string };

/** Section anchors in page order (ids are the contract between Nav and sections). */
export const NAV_LINKS: NavLink[] = [
  { id: 'organizations', label: 'Orgs' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'slayb', label: 'Slayb' },
  { id: 'projects', label: 'Projects' },
  { id: 'patents', label: 'Patents' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
];

/** Sticky neo-brutal top bar: brand tile, section anchors with scroll-spy, Contact CTA, keyboard-accessible mobile menu. */
export function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('');
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // scroll-spy: highlight the section that crosses the upper third of the viewport
  useEffect(() => {
    const ids = [...NAV_LINKS.map((l) => l.id), 'contact'];
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (!els.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) btnRef.current?.focus();
  }, []);

  // menu: focus first link on open, Esc closes, Tab is trapped between button + links, outside click closes
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLAnchorElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      if (e.key !== 'Tab' || !panel) return;
      const items = [btnRef.current, ...panel.querySelectorAll<HTMLElement>('a')].filter(Boolean) as HTMLElement[];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel?.contains(t) && !btnRef.current?.contains(t)) close(false);
    };
    const mq = window.matchMedia('(min-width: 1080px)');
    const onMq = () => { if (mq.matches) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
      mq.removeEventListener('change', onMq);
    };
  }, [open, close]);

  const links = (onClick?: () => void) =>
    NAV_LINKS.map((l) => (
      <li key={l.id}>
        <a href={`#${l.id}`} aria-current={active === l.id ? 'location' : undefined} onClick={onClick}>{l.label}</a>
      </li>
    ));

  return (
    <header className={`nav${open ? ' nav--open' : ''}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="wrap nav__in">
        <a className="nav__brand" href="#hero" aria-label={`${profile.name} — back to top`}>
          <span className="nav__mark" aria-hidden="true">YB</span>
          <span className="nav__name">{profile.name}</span>
        </a>
        <nav className="nav__primary" aria-label="Primary">
          <ul className="nav__links" role="list">{links()}</ul>
        </nav>
        <Button href="#contact" size="sm" className="nav__cta">Contact</Button>
        <button
          ref={btnRef}
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="nav__burger" aria-hidden="true"><i /><i /><i /></span>
          <span>{open ? 'Close' : 'Menu'}</span>
        </button>
      </div>
      <div id="nav-menu" ref={panelRef} className="nav__menu" hidden={!open}>
        <nav aria-label="Mobile">
          <ul className="nav__menu-links" role="list">
            {links(() => close(false))}
            <li><a href="#contact" onClick={() => close(false)}>Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
