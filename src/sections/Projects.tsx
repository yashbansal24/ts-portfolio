import type { FocusEvent } from 'react';
import { profile, projects, type Project } from '../data/profile';
import { SectionHeader } from '../components/SectionHeader';
import { SpeechBubble, type BubbleTone } from '../components/SpeechBubble';
import { Halftone, type HalftoneTone } from '../components/Halftone';
import { ChipList } from '../components/Chip';
import { Sticker } from '../components/Sticker';
import { Burst } from '../components/Burst';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import './Projects.css';

/* ---- data: the non-featured repos, newest first; the oldest year becomes "the archive" ---- */
const yearOf = (p: Project) => Number(p.year ?? 0);
const repos = projects.filter((p) => !p.featured).sort((a, b) => yearOf(b) - yearOf(a));
const ARCHIVE_YEAR = Math.min(...repos.map(yearOf));
const archive = repos.filter((p) => yearOf(p) === ARCHIVE_YEAR);
const [lead, ...recent] = repos.filter((p) => yearOf(p) !== ARCHIVE_YEAR);

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const githubHost = profile.links.github.replace(/^https?:\/\//, '');

/** Long repo names (Fuzzy_Based_Dietary_Clustering) may break after "_" / "-" instead of mid-word. */
const breakable = (s: string) => s.split(/(?<=[_-])/).flatMap((part, i) => (i ? [<wbr key={i} />, part] : [part]));

/** Repo footer link: visible label + mono repo name. Its ::after stretches over the whole card (card = click target). */
function RepoLink({ p, variant }: { p: Project; variant?: 'lead' }) {
  return (
    <a className={`projects__link${variant ? ` projects__link--${variant}` : ''}`} href={p.url} target="_blank" rel="noopener noreferrer">
      <span className="projects__link-text">
        <span className="projects__link-k">View on GitHub<span className="sr-only">:</span></span>
        <span className="projects__link-v">{breakable(p.urlLabel)}</span>
      </span>
      <span className="projects__link-go" aria-hidden="true">↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** Only the most-starred repo gets a rotated Sticker (kit: ≤ 1–2 stickers per section); the rest get a flat tab. */
const TOP_STARS = Math.max(0, ...projects.map((p) => p.stars ?? 0));

function Stars({ n }: { n: number }) {
  if (n < TOP_STARS) {
    return (
      <p className="projects__stars projects__stars--flat">
        <span aria-hidden="true">★ {n}</span>
        <span className="sr-only">{n} GitHub stars</span>
      </p>
    );
  }
  return (
    <Sticker tone="coral" rotate={4} className="projects__stars">
      <span aria-hidden="true">★ {n}</span>
      <span className="sr-only">{n} GitHub stars</span>
    </Sticker>
  );
}

type CardSkin = { halftone: HalftoneTone; bubble: BubbleTone };

/**
 * On phones the archive is a horizontal swipe row (Projects.css). The browser leaves a partly visible
 * card where it is when its link takes keyboard focus, so snap the focused card fully into the row.
 */
function revealFocusedCard(e: FocusEvent<HTMLUListElement>) {
  const row = e.currentTarget;
  const cs = getComputedStyle(row);
  if (cs.overflowX === 'visible') return;   // wide screens: a plain grid, nothing to scroll
  const item = (e.target as HTMLElement).closest<HTMLElement>('.projects__item');
  if (!item) return;
  const start = row.getBoundingClientRect().left + (parseFloat(cs.scrollPaddingInlineStart) || 0);
  row.scrollBy({ left: item.getBoundingClientRect().left - start });
}

/** One repo card. Rows (cap / name / bubble / desc / chips / link) sit on a shared subgrid so neighbours align. */
function ProjectCard({ p, skin }: { p: Project; skin: CardSkin }) {
  const id = `project-${slug(p.name)}`;
  return (
    <li className="projects__item">
      <Halftone tone={skin.halftone} density="fine" className="projects__ht" />
      <Card as="article" tone="paper" shadow="sm" className="projects__card" aria-labelledby={id}>
        <p className="projects__cap"><span className="sr-only">Year: </span>{p.year}</p>
        {p.stars ? <Stars n={p.stars} /> : null}
        <h3 id={id} className="projects__name">{p.name}</h3>
        <SpeechBubble side="top-left" tone={skin.bubble} as="p" className="projects__bubble">{p.tagline}</SpeechBubble>
        <p className="projects__desc">{p.description}</p>
        <ChipList items={p.tech} label={`${p.name} tech`} size="sm" tone="ivory" className="projects__chips" />
        <RepoLink p={p} />
      </Card>
    </li>
  );
}

/** Projects — ivory comic-lite zone: neo-brutal repo cards with halftone hard-shadows and speech-bubble taglines. */
export function Projects() {
  const leadId = `project-${slug(lead.name)}`;
  return (
    <section className="projects section tone-ivory" id="projects" aria-labelledby="projects-title">
      <div className="wrap">
        <SectionHeader
          id="projects-title"
          eyebrow="Open source"
          title={<>Projects <em>on GitHub.</em></>}
          dek="Selected public repositories, newest first. Every card opens its repo."
        />

        {/* ---- latest builds ---- */}
        <div className="projects__bar">
          <p className="projects__bar-title" id="projects-latest">Latest builds</p>
          <span className="projects__bar-rule" aria-hidden="true" />
        </div>

        <div className="projects__latest" role="group" aria-labelledby="projects-latest">
          <div className="projects__lead-wrap">
            <Halftone tone="coral" density="medium" className="projects__ht projects__ht--lead" />
            <Card as="article" tone="paper" className="projects__card projects__lead" aria-labelledby={leadId}>
              <p className="projects__cap projects__cap--coral"><span className="sr-only">Year: </span>{lead.year} · Newest</p>
              <Burst text="NEW!" tone="periwinkle" size={140} rotate={10} className="projects__burst" />
              <div className="projects__lead-main">
                <h3 id={leadId} className="projects__name projects__name--lead">{lead.name}</h3>
                <SpeechBubble side="top-left" tone="peach" as="p" className="projects__bubble projects__bubble--lead">{lead.tagline}</SpeechBubble>
                <p className="projects__desc projects__desc--lead">{lead.description}</p>
              </div>
              <div className="projects__lead-side">
                <p className="projects__side-label eyebrow">Stack</p>
                <ChipList items={lead.tech} label={`${lead.name} tech`} tone="paper" className="projects__chips" />
                <RepoLink p={lead} variant="lead" />
              </div>
            </Card>
          </div>

          <ul className="projects__grid projects__grid--recent" role="list">
            {recent.map((p) => <ProjectCard key={p.name} p={p} skin={{ halftone: 'coral', bubble: 'peach' }} />)}
          </ul>
        </div>

        {/* ---- the archive drawer ---- */}
        <div className="projects__archive" role="group" aria-labelledby="projects-archive">
          <Halftone tone="periwinkle" density="coarse" fade="up" opacity={0.75} />
          <p className="projects__tab" id="projects-archive">
            From the archive <span className="projects__tab-year">· {ARCHIVE_YEAR}</span>
          </p>
          <p className="projects__archive-dek">
            Information retrieval, ranking, recommendation and fuzzy logic.
          </p>
          <ul className="projects__grid projects__grid--archive" role="list" onFocus={revealFocusedCard}>
            {archive.map((p) => <ProjectCard key={p.name} p={p} skin={{ halftone: 'blue', bubble: 'periwinkle' }} />)}
          </ul>
        </div>

        <div className="projects__more">
          <p className="projects__more-text">More code lives on GitHub.</p>
          <Button href={profile.links.github} variant="dark" size="lg" className="projects__more-btn">
            {githubHost} <span aria-hidden="true">↗</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
