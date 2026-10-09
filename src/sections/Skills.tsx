import { skills } from '../data/profile';
import { SectionHeader } from '../components/SectionHeader';
import { ChipList, type ChipTone } from '../components/Chip';
import './Skills.css';

/* ---- data-derived copy ---- */
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function words(n: number) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
  return String(n);
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const total = skills.reduce((n, g) => n + g.items.length, 0);
const first = skills[0]?.items[0];
const last = skills[skills.length - 1]?.items.at(-1);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Keycap colourway, like the hero desk's keyboard: one coral accent key, one periwinkle modifier, the rest paper. */
function keyTone(i: number): { key: 'coral' | 'periwinkle' | 'paper'; chips: ChipTone } {
  if (i === 0) return { key: 'coral', chips: 'paper' };
  if (i === skills.length - 1) return { key: 'periwinkle', chips: 'paper' };
  return { key: 'paper', chips: 'ivory' };
}

/** SKILLS — every group as a keycap on one neo-brutal keyboard (deep-blue case, paper keys, a coral accent key). */
export function Skills() {
  return (
    <section className="skills section tone-paper rule-top" id="skills" aria-labelledby="skills-title">
      <div className="wrap">
        <SectionHeader
          id="skills-title"
          num="07"
          eyebrow={`Skills · ${skills.length} groups · ${total} keys`}
          title={<>{cap(words(skills.length))} groups, <em>{words(total)} keys.</em></>}
          dek={first && last ? <>The whole board, from {first.toLowerCase()} to {last.toLowerCase()}.</> : undefined}
        />

        <div className="skills__board">
          <div className="skills__deck" aria-hidden="true">
            <span className="skills__model">YB-{total}</span>
            <span className="skills__leds"><i /><i /><i /></span>
          </div>
          <ul className="skills__keys" role="list">
            {skills.map((g, i) => {
              const tone = keyTone(i);
              const id = `skills-${slug(g.name)}`;
              return (
                <li key={g.name} className={`skills__key skills__key--${tone.key} skills__key--${i + 1}`} aria-labelledby={id}>
                  <div className="skills__legend">
                    <h3 id={id} className="skills__name">{g.name}</h3>
                    <span className="skills__fn" aria-hidden="true">F{i + 1}</span>
                  </div>
                  <ChipList items={g.items} label={g.name} size="sm" tone={tone.chips} className="skills__chips" />
                  <span className="skills__count" aria-hidden="true">{g.items.length} keys</span>
                </li>
              );
            })}
            <li className="skills__space" aria-hidden="true"><span>space for the next one</span></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
