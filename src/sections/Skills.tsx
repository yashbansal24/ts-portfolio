import { skills } from '../data/profile';
import { SectionHeader } from '../components/SectionHeader';
import { ChipList, type ChipTone } from '../components/Chip';
import './Skills.css';

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
          eyebrow="Skills"
          title={<>From applied AI <em>to infrastructure.</em></>}
        />

        <div className="skills__board">
          <div className="skills__deck" aria-hidden="true">
            <span className="skills__leds"><i /><i /><i /></span>
          </div>
          <ul className="skills__keys" role="list">
            {skills.map((g, i) => {
              const tone = keyTone(i);
              const id = `skills-${slug(g.name)}`;
              return (
                <li key={g.name} className={`skills__key skills__key--${tone.key} skills__key--${i + 1}`} aria-labelledby={id}>
                  <h3 id={id} className="skills__name">{g.name}</h3>
                  <ChipList items={g.items} label={g.name} size="sm" tone={tone.chips} className="skills__chips" />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
