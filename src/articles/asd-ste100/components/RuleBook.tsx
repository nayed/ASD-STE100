import { Caption, Clause, Example, H2, Kicker, Lead, P, useReveal } from "./Chrome";
import { LengthDiagram, VoiceDiagram } from "./Diagrams";
import { motion } from "framer-motion";

const VERBS_OK = [
  "infinitive — to remove",
  "imperative — Remove the pin.",
  "simple present — The pump runs.",
  "simple past — The pump stopped.",
  "simple future — The pump will stop.",
  "past participle, as an adjective — the removed pin",
];

const VERBS_NO = ["present perfect — has been removed", "past perfect — had been removed", "progressive — is checking the input", "future progressive — will be checking"];

export default function RuleBook() {
  const r = useReveal();
  return (
    <>
      <Kicker>The rules that change everything</Kicker>
      <H2>Short sentences. One instruction. Active voice.</H2>
      <Lead>
        The rules do two jobs. They limit your words. And they tell you how to build a sentence. You learn them once, then you write the same way for the rest of your career.
      </Lead>

      <Clause n="1.1">
        Use only three kinds of word: a word approved in the dictionary, a technical noun, or a technical verb. A technical noun comes from your parts list or your engineering drawing. A technical verb comes from your trade: drill, weld, ream, rivet.
      </Clause>

      <Example
        non="Make sure that the valve is operable."
        ste="Make sure that the valve can operate."
      />

      <Clause n="1.2 / 1.3">
        Use an approved word only as the part of speech that the dictionary gives, and only with the approved meaning. The word is in the dictionary, so you think it is safe. It can still be wrong.
      </Clause>

      <Example non="Dim the lights." ste="Set the lights to the dim position." />
      <Example
        non="Do not go close to the landing gear."
        ste="Do not go near the landing gear."
      />

      <Clause n="§4">
        Write short sentences. A sentence in a procedure has a limit of twenty words. A sentence in descriptive text has a limit of twenty-five words. Count the words before you send the text for review.
      </Clause>
      <LengthDiagram />

      <Clause n="§5">
        Write one instruction in one sentence. Write one topic in one paragraph. Do not write more than six sentences in a paragraph. When the text has many steps, use a vertical list. The reader can then see every step at one time.
      </Clause>
      <div className="mt-5 border border-ink/25 bg-paper2/60 px-4 py-4">
        <div className="micro mb-3 text-ash">A procedure, in a vertical list</div>
        <ol className="space-y-2 text-[16.5px] leading-[1.5]">
          {["Stop the engine.", "Put the lockout tag on the control lever.", "Remove the access panel (4).", "Do the leak test."].map((s, i) => (
            <li key={s} className="grid grid-cols-[34px_minmax(0,1fr)] gap-3 border-b border-hair pb-2 last:border-b-0">
              <span className="font-mono text-[13px] text-hazard tnum">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <Clause n="§4">
        Use the active voice. The passive hides the person who does the work. It makes a long sentence, and the reader must search for the verb. In descriptive text, you may use the passive only when you do not know who does the work.
      </Clause>
      <VoiceDiagram />

      <Clause n="§3">
        Use only six forms of the verb. The other forms are out. This is the rule that writers find hardest, because the removed forms are common in ordinary technical English.
      </Clause>

      <motion.div {...r} className="mt-6 grid grid-cols-1 border border-ink/25 sm:grid-cols-2">
        <div className="border-b border-ink/20 p-4 sm:border-b-0 sm:border-r">
          <div className="micro mb-3 text-blueprint">✓ Six forms are allowed</div>
          <ul className="space-y-2">
            {VERBS_OK.map((v) => (
              <li key={v} className="border-b border-hair pb-2 text-[15px] leading-snug last:border-b-0">
                {v}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-hazard/[0.04] p-4">
          <div className="micro mb-3 text-hazard">✗ These forms are out</div>
          <ul className="space-y-2">
            {VERBS_NO.map((v) => (
              <li key={v} className="border-b border-hazard/25 pb-2 text-[15px] leading-snug text-ash line-through decoration-hazard/70 last:border-b-0">
                {v}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-[11px] leading-[1.7] text-ash">
            Do not use auxiliaries to make a complex verb construction. Do not drop the verb, the subject, or the article to make the text shorter.
          </p>
        </div>
      </motion.div>

      <Clause n="3.7">
        Use the verb, not a noun that you make from the verb. A noun that comes from a verb is called a nominalisation. It adds words, and it pushes the action to the back of the sentence.
      </Clause>
      <Example non="Do an inspection of the brake pads." ste="Inspect the brake pads." />

      <Clause n="9.3">
        Do not add a preposition to an approved verb to make a new phrase. The meaning of such a phrase is not clear from its two parts. Machine translation and non-native readers handle these phrases badly.
      </Clause>
      <Example non="Put out the fire with the extinguisher." ste="Extinguish the fire with the extinguisher." />

      <Clause n="§7">
        Start every safety instruction with a clear command or with a condition. Then say what can happen, and then say what the reader must do. Keep the safety text short, and put it before the step that it controls.
      </Clause>
      <div className="mt-5 border-l-[6px] border-hazard bg-hazard/[0.06] px-4 py-4">
        <div className="micro text-hazard">Warning</div>
        <p className="mt-2 text-[16.5px] font-semibold leading-[1.5]">
          Do not work near the landing gear if the gear is not locked. The gear can move and kill you. Lock the gear before you work.
        </p>
        <Caption>Command first. Result second. Action third. Nothing else in the box.</Caption>
      </div>

      <Clause n="§8">
        The standard also tells you how to count. Without a rule for counting, a limit of twenty words could be argued by every writer in the company.
      </Clause>
      <div className="mt-5 grid grid-cols-2 gap-px border border-ink/25 bg-ink/20 sm:grid-cols-4">
        {[
          ["8.00 mm", "one word"],
          ["ATA-100", "one word"],
          ["torque wrench", "two words"],
          ["(see figure 3)", "one word"],
        ].map(([a, b]) => (
          <div key={a} className="bg-paper2/70 px-3 py-4">
            <div className="font-mono text-[14px] text-ink">{a}</div>
            <div className="micro mt-1.5 text-hazard">{b}</div>
          </div>
        ))}
      </div>
      <Caption>Numbers with a unit, abbreviations, and hyphenated groups count as one word each.</Caption>

      <P>
        That is the shape of it. The rules look severe on paper. In use they are fast: you stop choosing between six words, and you write the sentence that the technician must read.
      </P>
    </>
  );
}
