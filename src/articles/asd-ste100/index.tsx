import { motion, useScroll } from "framer-motion";
import "./asd.css";
import heroImg from "./images/hero-manual.jpg";
import hangarImg from "./images/hangar-band.jpg";
import { Caption, Clause, Example, H2, Kicker, Lead, P, Section, useReveal } from "./components/Chrome";
import { FunnelDiagram, LoopDiagram } from "./components/Diagrams";
import Checker from "./components/Checker";
import RuleBook from "./components/RuleBook";

const NAV = [
  { id: "s01", n: "01", t: "What" },
  { id: "s02", n: "02", t: "Why" },
  { id: "s03", n: "03", t: "Map" },
  { id: "s04", n: "04", t: "Rules" },
  { id: "s05", n: "05", t: "Words" },
  { id: "s06", n: "06", t: "Check" },
  { id: "s07", n: "07", t: "Use" },
];

const TIMELINE = [
  ["1983", "AECMA decides to write one controlled English for European airlines."],
  ["1985", "The AECMA Simplified English guide appears, document PSC-85-16598."],
  ["1986", "ATA makes STE a requirement of specification i2200 and ATA 104."],
  ["2004", "AECMA joins ASD. The guide becomes specification ASD-STE100."],
  ["2013", "Issue 6: the standard becomes free of charge."],
  ["2021", "Issue 8: rules clarified, hundreds of dictionary entries revised."],
  ["2025", "Issue 9, January: STE becomes an international standard."],
  ["2028", "Issue 10: the next issue is planned for this year."],
];

const IS = [
  "A controlled language: limited words and limited grammar.",
  "Two parts that work together: writing rules and a dictionary.",
  "Written for maintenance, operations and safety text.",
  "Free to obtain, since Issue 6 in 2013.",
  "Used with your style guide, not instead of it.",
];

const IS_NOT = [
  "Not plain language. Plain language has no approved word list.",
  "Not a grammar book. It does not make bad writing good.",
  "Not a translator. It does not replace the technician.",
  "Not a substitute for knowledge of the subject.",
  "Not for contracts, marketing text, or legal text.",
];

const SECTIONS = [
  ["1", "Words"],
  ["2", "Multi-word nouns"],
  ["3", "Verbs"],
  ["4", "Sentence construction"],
  ["5", "Procedures"],
  ["6", "Descriptions"],
  ["7", "Safety instructions"],
  ["8", "Punctuation and word count"],
  ["9", "Writing practices"],
];

const DICT_ROWS = [
  ["acceptance (n)", "ACCEPT (v)", "BEFORE YOU ACCEPT THE UNIT, DO THE SPECIFIED TEST PROCEDURE.", "Before acceptance of unit, do the specified test procedure."],
  ["accessible (adj)", "ACCESS (n)", "TURN THE COVER UNTIL YOU CAN GET ACCESS TO THE JACKS THAT HAVE + AND − MARKS.", "Rotate the cover until the jacks marked + and − are accessible."],
  ["close (adj)", "NEAR (prep)", "DO NOT GO NEAR THE LANDING GEAR.", "Do not go close to the landing gear."],
  ["follow (v)", "OBEY (v)", "OBEY THE SAFETY INSTRUCTIONS.", "Follow the safety instructions."],
];

const STRIPPED = [
  ["begin · commence · initiate", "start"],
  ["prior to · subsequent to", "before · after"],
  ["utilize · accomplish", "use · do"],
  ["perform · carry out", "do"],
  ["ensure · verify", "make sure · check"],
  ["approximately · sufficient", "about · enough"],
  ["in order to · in the event that", "to · if"],
  ["acquire · obtain · additional", "get · get · more"],
  ["terminate · remainder", "stop · rest"],
  ["the majority of · due to the fact that", "most · because"],
];

function TopBar() {
  const { scrollYProgress } = useScroll();
  return (
    <header className="fixed inset-x-0 top-(--site-bar-h) z-40 border-b border-ink bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-11 max-w-[1280px] items-center gap-4 px-5 lg:px-10">
        <a href="#top" className="flex shrink-0 items-center gap-2">
          <span className="block h-3 w-3 bg-hazard" />
          <span className="micro text-ink">ASD-STE100</span>
        </a>
        <nav className="hide-scroll -mx-1 flex flex-1 items-center gap-4 overflow-x-auto px-1">
          {NAV.map((i) => (
            <a key={i.id} href={`#${i.id}`} className="micro shrink-0 text-ash transition-colors hover:text-hazard">
              <span className="text-hazard/70">{i.n}</span> {i.t}
            </a>
          ))}
        </nav>
        <span className="micro hidden shrink-0 text-ash sm:block">Issue 9 · Jan 2025</span>
      </div>
      <motion.div style={{ scaleX: scrollYProgress }} className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-hazard" />
    </header>
  );
}

function Hero() {
  const r = useReveal();
  return (
    <section id="top" className="border-b border-ink">
      <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.div
          {...r}
          className="flex min-h-[64vh] flex-col justify-between border-b border-ink px-5 py-9 lg:min-h-[86vh] lg:border-b-0 lg:border-r lg:px-10 lg:py-12"
        >
          <div className="flex items-center justify-between">
            <span className="micro text-ash">Specification · aerospace and defence</span>
            <span className="micro text-hazard">Issue 9 · January 2025</span>
          </div>

          <div className="py-10">
            <div className="flex items-center gap-3">
              <span className="block h-4 w-4 bg-hazard" />
              <span className="micro tracking-[0.3em]">ASD-STE100</span>
            </div>
            <h1 className="mt-6 text-[clamp(2.6rem,7.2vw,5.8rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.045em]">
              Simplified
              <br />
              Technical
              <br />
              <span className="text-hazard">English</span>
            </h1>
            <p className="mt-7 max-w-[44ch] font-serif text-[clamp(1.15rem,2vw,1.5rem)] italic leading-[1.45] text-ink/85">
              A controlled language for technical documentation. Fifty-three writing rules. About nine hundred approved words. One meaning for each word.
            </p>
            <a
              href="#s06"
              className="mt-8 inline-flex items-center gap-3 border border-ink px-4 py-3 transition-colors hover:bg-ink hover:text-paper"
            >
              <span className="micro">Check your own sentence</span>
              <span aria-hidden className="text-hazard">↓</span>
            </a>
          </div>

          <dl className="grid grid-cols-2 gap-px border border-ink/25 bg-ink/20 lg:grid-cols-4">
            {[
              ["Owner", "ASD, Brussels"],
              ["Written by", "STEMG, since 1983"],
              ["Two parts", "53 rules · ~900 words"],
              ["Cost", "Free since 2013"],
            ].map(([k, v]) => (
              <div key={k} className="bg-paper px-3 py-3">
                <dt className="micro text-ash">{k}</dt>
                <dd className="mt-1.5 text-[14px] font-semibold leading-tight">{v}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <div className="relative min-h-[46vh] overflow-hidden lg:min-h-full">
          <img
            src={heroImg}
            alt="An open aircraft maintenance manual on a scratched steel workbench, lit by a task lamp"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-plate/85 via-plate/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 lg:p-6">
            <p className="max-w-[34ch] font-mono text-[11px] leading-[1.7] text-paper">
              FIG. 0 — The manual stays open at the page that the technician must trust. Everything in the standard exists for that page.
            </p>
            <span className="micro shrink-0 bg-hazard px-2 py-1 text-paper">STE</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Band() {
  return (
    <figure className="relative overflow-hidden border-y border-ink">
      <img
        src={hangarImg}
        alt="A technician at a workbench in a dark hangar, reading a manual under a work lamp"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-plate/95 via-plate/75 to-plate/30" />
      <figcaption className="relative mx-auto w-full max-w-[1280px] px-5 py-14 lg:px-10 lg:py-24">
        <div className="micro text-hazard">The reason for the rules</div>
        <p className="mt-4 max-w-[16ch] text-[clamp(2.1rem,5.6vw,4.4rem)] font-extrabold leading-[0.94] tracking-[-0.04em] text-paper">
          One reader. Any first language.
        </p>
        <p className="mt-5 max-w-[54ch] font-serif text-[clamp(1rem,1.5vw,1.2rem)] italic leading-[1.5] text-paper/85">
          A maintenance instruction written in one country is read in another country, in a second or third language, under time pressure. A sentence that can be read two ways is a defect.
        </p>
        <p className="mt-6 max-w-[60ch] border-t border-paper/25 pt-3 font-mono text-[11px] leading-[1.7] text-paper/70">
          64% of Issue 8 users came from outside aerospace and defence · distribution log, December 2024
        </p>
      </figcaption>
    </figure>
  );
}

function DictionaryTable() {
  return (
    <div className="mt-8 overflow-x-auto border border-ink/25">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead>
          <tr className="bg-ink text-paper">
            {["Word (part of speech)", "Approved meaning", "STE example", "Non-STE example"].map((h) => (
              <th key={h} className="micro border-r border-paper/15 px-3 py-2.5 last:border-r-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DICT_ROWS.map(([w, m, ok, no], i) => (
            <tr key={w} className={i % 2 ? "bg-paper2/60" : "bg-paper"}>
              <td className="border-r border-t border-hair px-3 py-3 align-top font-mono text-[13px] font-medium">{w}</td>
              <td className="border-r border-t border-hair px-3 py-3 align-top font-mono text-[13px] text-blueprint">{m}</td>
              <td className="border-r border-t border-hair px-3 py-3 align-top font-mono text-[11.5px] leading-[1.6]">{ok}</td>
              <td className="border-t border-hair px-3 py-3 align-top font-serif text-[14px] italic leading-[1.5] text-ash">{no}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-ink bg-ink text-paper">
      <div className="mx-auto max-w-[1280px] px-5 py-12 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="block h-4 w-4 bg-hazard" />
              <span className="micro">Colophon</span>
            </div>
            <p className="mt-5 max-w-[46ch] font-serif text-[1.15rem] italic leading-[1.5] text-paper/85">
              This page tries to explain ASD-STE100 in Simplified Technical English. Short sentences. Active voice. One idea in each sentence.
            </p>
            <p className="mt-4 max-w-[52ch] font-mono text-[11px] leading-[1.8] text-paper/55">
              Some lines break the rules on purpose: the headline, the numbers in the margin, and this note. The standard itself allows exceptions for titles, headings, tables and labels.
            </p>
          </div>
          <div>
            <div className="micro text-hazard">Self-check</div>
            <ul className="mt-4 space-y-2 font-mono text-[11.5px] leading-[1.6] text-paper/75">
              {[
                "✓ sentences at 20 words or fewer",
                "✓ one instruction in each sentence",
                "✓ active voice in every procedure",
                "✓ approved words, from a sample list",
                "✗ not a conformance certificate",
              ].map((l) => (
                <li key={l} className="border-b border-paper/12 pb-2">
                  {l}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="micro text-hazard">Sources</div>
            <ul className="mt-4 space-y-2 text-[13.5px] leading-[1.5] text-paper/80">
              <li>
                <a className="underline decoration-hazard underline-offset-4 transition-colors hover:text-hazard" href="https://www.asd-ste100.org/" target="_blank" rel="noreferrer">
                  ASD-STE100 · official site
                </a>
              </li>
              <li>ASD-STE100 Issue 9, January 2025</li>
              <li>STEMG · Simplified Technical English Maintenance Group</li>
              <li>
                <a className="underline decoration-hazard underline-offset-4 transition-colors hover:text-hazard" href="https://en.wikipedia.org/wiki/Simplified_Technical_English" target="_blank" rel="noreferrer">
                  Wikipedia · Simplified Technical English
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-paper/20 pt-4">
          <span className="micro text-paper/50">A teaching aid. Not the standard, and not a conformance tool.</span>
          <span className="micro text-paper/50">For the rules, use the official document.</span>
        </div>
      </div>
    </footer>
  );
}

export default function AsdSte100() {
  const r = useReveal();
  return (
    <div className="asd paper-grid min-h-screen bg-paper pt-11 font-display text-ink">
      <TopBar />
      <Hero />

      {/* §01 ------------------------------------------------------------ */}
      <Section id="s01" code="01" title="What ASD-STE100 is">
        <Kicker>Definition</Kicker>
        <H2>Not a style guide. A controlled language.</H2>
        <Lead>
          ASD-STE100 is an international standard for technical documentation. It tells you which words you may use, and how you must build a sentence with them.
        </Lead>
        <P>
          The name says it all. ASD is the AeroSpace and Defence Industries Association of Europe. STE is Simplified Technical English. 100 is the number of the document in the ASD series.
        </P>
        <P>
          The standard has two parts. Part 1 gives the writing rules. Part 2 gives the dictionary. The rules work only with the dictionary, and the dictionary works only with the rules. Use one part alone and the text will fail.
        </P>

        <div className="mt-8 grid grid-cols-1 border border-ink/25 sm:grid-cols-2">
          <div className="border-b border-ink/20 sm:border-b-0 sm:border-r">
            <div className="micro bg-ink px-4 py-2.5 text-paper">STE is</div>
            <ul>
              {IS.map((t) => (
                <li key={t} className="flex gap-3 border-b border-hair px-4 py-3 text-[15.5px] leading-[1.5] last:border-b-0">
                  <span aria-hidden className="mt-[3px] h-3.5 w-3.5 shrink-0 border border-blueprint bg-blueprint/15" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="micro bg-hazard px-4 py-2.5 text-paper">STE is not</div>
            <ul>
              {IS_NOT.map((t) => (
                <li key={t} className="flex gap-3 border-b border-hair px-4 py-3 text-[15.5px] leading-[1.5] text-ash last:border-b-0">
                  <span aria-hidden className="mt-[3px] h-3.5 w-3.5 shrink-0 border border-hazard" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <blockquote className="mt-9 border-l-[6px] border-hazard bg-paper2/70 px-5 py-5">
          <p className="max-w-[52ch] font-serif text-[clamp(1.1rem,1.7vw,1.3rem)] italic leading-[1.5]">
            “Can STE be used alone? No. It is intended to be used with other applicable specifications for technical publications, style guides, and official directives.”
          </p>
          <Caption>ASD-STE100, front matter. The standard is a tool, not a profession.</Caption>
        </blockquote>

        <LoopDiagram />
      </Section>

      {/* §02 ------------------------------------------------------------ */}
      <Section id="s02" code="02" title="Why the standard exists">
        <Kicker>Origin</Kicker>
        <H2>Built by airlines that could not misread a page.</H2>
        <Lead>
          In 1979, European aerospace documentation was written in American English, in British English, and in English written by companies whose first language was not English. Airlines translated parts of the manuals for local mechanics. Ambiguity cost time, and sometimes it cost more than that.
        </Lead>

        <div className="mt-8 grid grid-cols-2 gap-px border border-ink/25 bg-ink/20 md:grid-cols-4 lg:grid-cols-8">
          {TIMELINE.map(([y, t]) => (
            <div key={y} className="bg-paper px-3 py-4">
              <div className="font-mono text-[17px] font-medium text-hazard tnum">{y}</div>
              <p className="mt-2 text-[13px] leading-[1.45] text-ink/85">{t}</p>
            </div>
          ))}
        </div>
        <Caption>Eight dates. From an industry request in 1983 to an international standard in 2025.</Caption>

        <P>
          The Simplified Technical English Maintenance Group, STEMG, has written the standard since 1983. Writers, linguists and engineers from many countries work in the group. When users report a problem with a rule, the group studies it and changes the rule at the next issue. The next issue is Issue 10, planned for 2028.
        </P>
        <P>
          The rules are strict because the reader is far away. The technician does not know you. The technician cannot ask what you meant. The sentence has one reading, or it has none.
        </P>
      </Section>

      <Band />

      {/* §03 ------------------------------------------------------------ */}
      <Section id="s03" code="03" title="What is in the box">
        <Kicker>The structure</Kicker>
        <H2>Two parts, nine sections, fifty-three rules.</H2>
        <Lead>
          Part 1 holds the writing rules in nine sections. Part 2 holds the dictionary. Every rule in Part 1 points back to a word in Part 2, or to a technical term from your own glossary.
        </Lead>

        <div className="mt-8 grid grid-cols-1 border border-ink/25 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="border-b border-ink/20 lg:border-b-0 lg:border-r">
            <div className="micro flex items-center justify-between bg-ink px-4 py-2.5 text-paper">
              <span>Part 1 — Writing rules</span>
              <span className="text-hazard">9 sections · 53 rules</span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-hair sm:grid-cols-3">
              {SECTIONS.map(([n, t]) => (
                <div key={n} className="bg-paper px-3 py-4">
                  <div className="font-mono text-[12px] text-hazard tnum">§{n}</div>
                  <div className="mt-1.5 text-[14px] font-semibold leading-tight">{t}</div>
                </div>
              ))}
              <div className="bg-paper2/70 px-3 py-4">
                <div className="font-mono text-[12px] text-ash">Text</div>
                <div className="mt-1.5 text-[14px] leading-tight text-ink/85">
                  Two kinds: <span className="font-semibold">procedures</span> and <span className="font-semibold">descriptions</span>.
                </div>
              </div>
              <div className="bg-paper2/70 px-3 py-4">
                <div className="font-mono text-[12px] text-ash">Total</div>
                <div className="mt-1.5 text-[14px] leading-tight text-ink/85">53 rules in the current issue.</div>
              </div>
              <div className="bg-paper2/70 px-3 py-4">
                <div className="font-mono text-[12px] text-ash">Issue</div>
                <div className="mt-1.5 text-[14px] leading-tight text-ink/85">Issue 9, January 2025. Next: Issue 10, 2028.</div>
              </div>
            </div>
          </div>
          <div className="bg-paper2/50">
            <div className="micro flex items-center justify-between bg-ink px-4 py-2.5 text-paper">
              <span>Part 2 — Dictionary</span>
              <span className="text-hazard">~900 approved</span>
            </div>
            <div className="px-4 py-4">
              <p className="text-[15.5px] leading-[1.55]">
                Each approved word has one part of speech and one meaning. The dictionary also lists about 1,200 words that are not approved, with the word to use instead.
              </p>
              <div className="mt-4 space-y-px bg-hair">
                {[
                  ["Approved words", "the core vocabulary"],
                  ["Technical nouns", "your parts and materials · rule 1.5"],
                  ["Technical verbs", "your processes and actions · rule 1.12"],
                ].map(([a, b]) => (
                  <div key={a} className="flex items-baseline justify-between gap-3 bg-paper px-3 py-2.5">
                    <span className="text-[14.5px] font-semibold">{a}</span>
                    <span className="text-right font-mono text-[11px] leading-[1.5] text-ash">{b}</span>
                  </div>
                ))}
              </div>
              <Caption>Rule 1.1: use only these three kinds of word.</Caption>
            </div>
          </div>
        </div>
      </Section>

      {/* §04 ------------------------------------------------------------ */}
      <Section id="s04" code="04" title="The writing rules">
        <RuleBook />
      </Section>

      {/* §05 ------------------------------------------------------------ */}
      <Section id="s05" code="05" title="The controlled vocabulary">
        <Kicker>Part 2 · Dictionary</Kicker>
        <H2>One word. One meaning.</H2>
        <Lead>
          Ordinary English lets one word carry many meanings, and it lets many words carry one meaning. The dictionary removes both freedoms. That is the whole idea.
        </Lead>
        <P>
          In ordinary English you can close a door, close a circuit, close a meeting and close an account. In STE, close has two approved meanings: to move together so that nothing gets in or out, and to operate a circuit breaker. Close an account is not allowed. Begin, commence, initiate and originate are four words for one action, so STE keeps only start.
        </P>

        <FunnelDiagram />

        <Clause n="§2">
          The dictionary is small, so your own terms must fill the gap. A technical noun is a term from your field: engine, grease, torque wrench. A technical verb is an action from your trade: drill, weld, ream, rivet. Use each term the same way in every document, and never invent a second name for the same item.
        </Clause>

        <h3 className="mt-10 border-b border-ink pb-2 text-[15px] font-extrabold uppercase tracking-[0.14em]">Four dictionary entries, as they appear</h3>
        <DictionaryTable />

        <h3 className="mt-10 border-b border-ink pb-2 text-[15px] font-extrabold uppercase tracking-[0.14em]">What the rules take out, and what they keep</h3>
        <div className="mt-5 grid grid-cols-1 gap-px border border-ink/25 bg-ink/20 sm:grid-cols-2">
          {STRIPPED.map(([bad, good]) => (
            <div key={bad} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-paper px-3 py-3">
              <span className="font-serif text-[14.5px] italic text-ash line-through decoration-hazard decoration-[1.5px]">{bad}</span>
              <span className="text-hazard">→</span>
              <span className="text-right text-[14.5px] font-semibold">{good}</span>
            </div>
          ))}
        </div>
        <Caption>A sample only. The full dictionary decides, with about 900 approved entries.</Caption>

        <Example non="The pressure of the system is checked by the technician." ste="The technician checks the pressure of the system." />
      </Section>

      {/* §06 ------------------------------------------------------------ */}
      <Section id="s06" code="06" title="Try the rules on your text">
        <Kicker>Working aid</Kicker>
        <H2>Watch a sentence get shorter.</H2>
        <Lead>
          Type your own sentence, or load one of the examples. The checker counts the words, looks for the passive voice, and marks the words that the standard replaces. Then it shows an approximate rewrite.
        </Lead>
        <Checker />
        <Caption>
          This aid judges only what can be judged from text alone. Real conformance needs the whole dictionary, with a part of speech for each word. Nothing here certifies your document.
        </Caption>
      </Section>

      {/* §07 ------------------------------------------------------------ */}
      <Section id="s07" code="07" title="Where it is used">
        <Kicker>Application</Kicker>
        <H2>Required in the air. Spreading on the ground.</H2>
        <Lead>
          The standard started in civil aviation. It became a requirement of the specifications that airlines and defence programmes use, and then it moved into other industries where a mistake has a cost.
        </Lead>

        <div className="mt-8 grid grid-cols-1 gap-px border border-ink/25 bg-ink/20 md:grid-cols-3">
          {[
            ["Required by", ["ATA iSpec 2200, since 1986", "ATA 104, training", "S1000D specification", "EDSTAR recommends it for defence"]],
            ["Also used in", ["Land and sea defence systems", "Automotive and machinery", "Renewable energy, offshore logistics", "Medical devices and pharmaceuticals"]],
            ["Supported by checkers", ["Boeing Simplified English Checker", "HyperSTE, by Etteplan", "Congree STE checker", "TechScribe term checker"]],
          ].map(([h, items]) => (
            <div key={h as string} className="bg-paper">
              <div className="micro bg-ink px-4 py-2.5 text-paper">{h as string}</div>
              <ul>
                {(items as string[]).map((t) => (
                  <li key={t} className="border-b border-hair px-4 py-2.5 text-[14.5px] leading-[1.45] last:border-b-0">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-l-[6px] border-hazard bg-hazard/[0.06] px-5 py-5">
          <div className="micro text-hazard">Where not to use it</div>
          <p className="mt-3 max-w-[62ch] text-[16.5px] leading-[1.6]">
            Do not use STE as a style guide, and do not use it to make a sentence grammatically correct. Do not use it for contracts, marketing text or legal text. ASD and STEMG do not endorse the checker tools. The specification is the reference.
          </p>
        </div>

        <motion.div {...r} className="mt-10">
          <P>
            The success of the standard is the point. Most of its users now work outside aerospace and defence, and the rules travel well: short sentences, one instruction, active voice, one word for one thing. Any reader who must act on your text can read them faster.
          </P>
        </motion.div>
      </Section>

      <Footer />
    </div>
  );
}
