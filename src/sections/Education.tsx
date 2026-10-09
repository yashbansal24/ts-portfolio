import { education } from '../data/profile';
import { SectionHeader } from '../components/SectionHeader';
import './Education.css';

const SMALL = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const word = (n: number) => SMALL[n] ?? String(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const STUB_TONES = ['coral', 'periwinkle'] as const;

/** Stub abbreviation: "B.E., Computer Science" → "B.E."; "MBA" → "MBA". */
const abbrOf = (degree: string) => degree.split(', ')[0];

/** EDUCATION — compact: each degree is a neo-brutal admit-ticket (coloured stub + perforation + details). */
export function Education() {
  const n = education.length;
  return (
    <section className="education section tone-ivory-2 rule-top" id="education" aria-labelledby="education-title">
      <div className="wrap education__grid">
        <SectionHeader
          id="education-title"
          num="08"
          eyebrow="Education"
          title={<>{cap(word(n))} degrees, <em>on paper.</em></>}
          className="education__header"
        />
        <ol className="education__list" role="list">
          {education.map((e, i) => {
            const abbr = abbrOf(e.degree);
            const id = `education-${i + 1}-title`;
            return (
              <li key={e.school} className={`education__ticket education__ticket--${STUB_TONES[i % STUB_TONES.length]}`} aria-labelledby={id}>
                <div className="education__stub" aria-hidden="true">
                  <span className="education__stub-no">No. {String(i + 1).padStart(2, '0')}</span>
                  <span className="education__abbr">{abbr}</span>
                </div>
                <div className="education__body">
                  <h3 id={id} className="education__school">{e.school}</h3>
                  <p className="education__degree">{e.degree}</p>
                  <p className="education__place"><span className="sr-only">Location: </span>{e.place}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
