import { Nav } from './components/Nav';
import { Hero } from './sections/Hero';
import { Logos } from './sections/Logos';
import { About } from './sections/About';
import { Experience } from './sections/Experience';
import { Slayb } from './sections/Slayb';
import { Projects } from './sections/Projects';
import { Patents } from './sections/Patents';
import { Skills } from './sections/Skills';
import { Education } from './sections/Education';
import { Contact } from './sections/Contact';

export function App() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Logos />
        <About />
        <Experience />
        <Slayb />
        <Projects />
        <Patents />
        <Skills />
        <Education />
      </main>
      <Contact />
    </>
  );
}
