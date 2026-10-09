import { useEffect, useRef, useState } from 'react';
import { profile } from '../data/profile';
import { Burst } from '../components/Burst';
import { Button } from '../components/Button';
import { MeshGradient } from '../components/MeshGradient';
import { SectionHeader } from '../components/SectionHeader';
import { Sticker } from '../components/Sticker';
import './Contact.css';

type CopyState = 'idle' | 'copied' | 'manual';

/** "https://www.linkedin.com/in/x/" → "linkedin.com/in/x", with line-break hints after each "/". */
function Handle({ url }: { url: string }) {
  const parts = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').split('/');
  return (
    <span className="contact__link-handle">
      {parts.map((part, i) => (
        <span key={i}>{i > 0 && <>/<wbr /></>}{part}</span>
      ))}
    </span>
  );
}

const LINKS = [
  { name: 'LinkedIn', href: profile.links.linkedin, tone: 'paper' },
  { name: 'GitHub', href: profile.links.github, tone: 'periwinkle' },
  { name: 'Slayb', href: profile.links.slayb, tone: 'coral' },
] as const;

/** Select the text inside `node` so the visitor can copy it by hand. */
function selectNode(node: HTMLElement | null) {
  const sel = window.getSelection();
  if (!node || !sel) return false;
  const range = document.createRange();
  range.selectNodeContents(node);
  sel.removeAllRanges();
  sel.addRange(range);
  return true;
}

/** Clipboard API first; then the legacy execCommand path; otherwise leave the text selected. */
async function copyText(text: string, node: HTMLElement | null): Promise<CopyState> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return 'copied';
    }
  } catch {
    /* permission denied or unavailable: fall through */
  }
  try {
    if (selectNode(node) && document.execCommand('copy')) return 'copied';
  } catch {
    /* execCommand unsupported */
  }
  selectNode(node);
  return 'manual';
}

function PinIcon() {
  return (
    <svg className="contact__pin" viewBox="0 0 16 20" aria-hidden="true" focusable="false">
      <path d="M8 1.5a6 6 0 0 0-6 6c0 4.4 6 11 6 11s6-6.6 6-11a6 6 0 0 0-6-6Z" />
      <circle cx="8" cy="7.5" r="2.2" />
    </svg>
  );
}

export function Contact() {
  const [copy, setCopy] = useState<CopyState>('idle');
  const emailRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const year = new Date().getFullYear();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = async () => {
    const state = await copyText(profile.email, emailRef.current);
    setCopy(state);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopy('idle'), state === 'copied' ? 2400 : 6000);
  };

  return (
    <footer className="contact section tone-blue tone-mesh" id="contact" aria-labelledby="contact-title">
      <MeshGradient preset="contact" />

      <div className="wrap contact__grid">
        <div className="contact__main">
          <div className="contact__card">
            <SectionHeader
              id="contact-title"
              num="09"
              eyebrow="Contact · Back page"
              title={<>Pull up a chair <em>at the desk.</em></>}
              dek="Agents that run for hours, platforms that hold them up, or a product that needs both: tell me what you are building."
            />

            <div className="contact__email">
              <p className="contact__email-label eyebrow">Email</p>
              <p className="contact__email-value">
                <span ref={emailRef} className="contact__email-text">{profile.email}</span>
              </p>
              <div className="contact__email-actions">
                <Button href={`mailto:${profile.email}`} variant="primary" size="lg">
                  Email me <span aria-hidden="true">→</span>
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onCopy}
                  className={copy === 'copied' ? 'contact__copy is-copied' : 'contact__copy'}
                  aria-describedby="contact-copy-status"
                >
                  {copy === 'copied' ? <>Copied <span aria-hidden="true">✓</span></> : 'Copy email'}
                </Button>
                <p id="contact-copy-status" className="contact__status" role="status" aria-live="polite">
                  {copy === 'copied' ? 'Copied' : copy === 'manual' ? 'Selected. Press Ctrl+C (⌘C) to copy.' : ''}
                </p>
              </div>
            </div>
          </div>

          <Burst text="LET'S BUILD!" tone="coral" size={190} rotate={10} spikes={14} className="contact__burst" />
        </div>

        <div className="contact__side">
          <p className="contact__side-label eyebrow">Elsewhere</p>
          <ul className="contact__links" role="list">
            {LINKS.map((l) => (
              <li key={l.name}>
                <Button href={l.href} variant="secondary" className={`contact__link contact__link--${l.tone}`}>
                  <span className="contact__link-text">
                    <span className="contact__link-name">{l.name}</span>
                    <Handle url={l.href} />
                  </span>
                  <span className="contact__link-arrow" aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </Button>
              </li>
            ))}
          </ul>
          <Sticker tone="peach" rotate={-3} as="p" className="contact__where">
            <PinIcon />
            Based in {profile.location}
          </Sticker>
        </div>
      </div>

      <div className="wrap">
        <p className="contact__colophon">
          <span>© {year} {profile.name}</span>
          <span>Built with React &amp; three.js</span>
          <span className="contact__colophon-type">Set in Instrument Serif, Inter Tight &amp; JetBrains Mono</span>
          <a className="contact__top" href="#main">Back to top <span aria-hidden="true">↑</span></a>
        </p>
      </div>
    </footer>
  );
}
