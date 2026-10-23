import type { ReactNode } from "react";
import "./lm.css";
import { Fig01, Fig02, Fig03, Fig04, Fig06, ORANGE, ORANGE_TEXT } from "./components/Figures";
import SamplingLab from "./components/SamplingLab";
import coverPlate from "./assets/cover.jpg";
import plotterPlate from "./assets/plotter.jpg";

/* ──────────────────────────── page furniture ──────────────────────────── */

function Shell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1240px] px-5 md:px-10 ${className}`}>{children}</div>;
}

function Masthead() {
  const meta = [
    ["Document no.", "TG-01"],
    ["Revision", "A"],
    ["Issue date", "2026-10-23"],
    ["Classification", "Public"],
  ];
  return (
    <header className="bg-lm-ink text-lm-paper">
      <Shell>
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 py-4 u-label text-lm-olive-light">
          <span>ASD-STE100 · Simplified Technical English · Issue 9</span>
          <span>Sheet 1 of 8 · Uncontrolled when printed</span>
        </div>
        <div className="border-t border-[#3A3A34] pt-8 pb-10">
          <div className="u-label text-lm-orange">Technical dossier — TG-01</div>
          <h1 className="u-display mt-5 text-[30px] sm:text-[44px] md:text-[62px] lg:text-[78px]">
            How a large
            <br />
            language model
            <br />
            generates text
          </h1>
          <p className="mt-8 max-w-[62ch] text-[13px] leading-relaxed text-lm-olive-light">
            This document explains one operation in six steps. It states what the model does at each step. It uses
            the rules of Simplified Technical English. Each sentence gives one idea.
          </p>
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-4 border-t border-[#3A3A34]">
          {meta.map(([k, v]) => (
            <div key={k} className="py-5 pr-6 border-b md:border-b-0 border-[#3A3A34]">
              <dt className="u-label text-lm-olive-mid">{k}</dt>
              <dd className="mt-2 text-[17px] font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </Shell>
    </header>
  );
}

function Plate({
  src,
  fig,
  caption,
  height,
  position = "center",
}: {
  src: string;
  fig: string;
  caption: string;
  height: string;
  position?: string;
}) {
  return (
    <figure className="mt-0">
      <div className={`relative w-full overflow-hidden ${height}`}>
        <img
          src={src}
          alt={caption}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position, filter: "grayscale(0.35) contrast(1.04)" }}
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = "none";
            el.parentElement?.classList.add("tooth");
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(251,251,249,0.10) 0%, rgba(251,251,249,0) 45%, rgba(251,251,249,0.55) 100%)" }}
        />
      </div>
      <figcaption className="rule-ink mt-3 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 pt-2">
        <span className="u-label">
          <span style={{ color: ORANGE_TEXT }}>{fig}</span>
          <span className="ml-3">{caption}</span>
        </span>
        <span className="u-note">Plate — offset print, matte stock</span>
      </figcaption>
    </figure>
  );
}

function Figure({
  n,
  title,
  note,
  sheet,
  children,
}: {
  n: string;
  title: string;
  note: string;
  sheet: string;
  children: ReactNode;
}) {
  return (
    <figure className="mt-14">
      {children}
      <figcaption className="rule-ink mt-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 pt-3">
        <span className="u-label">
          <span style={{ color: ORANGE_TEXT }}>Fig. {n}</span>
          <span className="ml-3">{title}</span>
        </span>
        <span className="u-note">{sheet}</span>
      </figcaption>
      <p className="u-note mt-3 max-w-[72ch]">{note}</p>
    </figure>
  );
}

function Clause({
  code,
  title,
  rule,
  children,
  figure,
  invert = false,
  wide = false,
}: {
  code: string;
  title: string;
  rule: string;
  children: ReactNode;
  figure?: ReactNode;
  invert?: boolean;
  wide?: boolean;
}) {
  return (
    <section id={`clause-${code}`} className={`scroll-mt-[calc(var(--site-bar-h)+2rem)] pt-8 pb-16 ${invert ? "" : "rule-ink"}`}>
      <div className="md:grid md:grid-cols-[190px_minmax(0,1fr)] md:gap-x-12">
        <aside className="mb-7 md:mb-0">
          <div className="md:sticky md:top-[calc(var(--site-bar-h)+2rem)]">
            <div className="flex items-baseline gap-3">
              <span className="inline-block h-[10px] w-[10px]" style={{ background: ORANGE }} />
              <span className="u-label text-lm-ink-45">Clause {code}</span>
            </div>
            <h2 className="u-display mt-3 text-[22px] md:text-[26px]">{title}</h2>
            <p className="u-note mt-5 border-l pl-3" style={{ borderColor: ORANGE }}>
              {rule}
            </p>
          </div>
        </aside>
        <div className={`${wide ? "max-w-none" : "u-measure"} space-y-5 text-[15px]`}>{children}</div>
      </div>
      {figure}
    </section>
  );
}

function Defs({ items }: { items: [string, string][] }) {
  return (
    <dl className="rule-ink mt-8">
      {items.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1 border-b border-lm-rule py-3 sm:flex-row sm:gap-6">
          <dt className="u-label w-[150px] shrink-0 pt-[3px]">{k}</dt>
          <dd className="text-[13px] text-lm-ink-70">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ol className="mt-2 space-y-3">
      {items.map((t, i) => (
        <li key={t} className="flex gap-4">
          <span className="u-label pt-[5px] text-lm-ink-45">{String(i + 1).padStart(2, "0")}</span>
          <span>{t}</span>
        </li>
      ))}
    </ol>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-left">
        <thead>
          <tr className="rule-ink">
            {head.map((h) => (
              <th key={h} className="u-label py-3 pr-6 align-bottom">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-lm-rule align-top">
              {r.map((c, j) => (
                <td
                  key={j}
                  className={`py-3 pr-6 text-[13px] ${
                    j === 0 ? "font-semibold whitespace-nowrap" : "text-lm-ink-70"
                  }`}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────── content ─────────────────────────────── */

const STE_RULES: string[][] = [
  ["1.1", "Use the approved words of the dictionary.", "This document writes “use”, not “utilize”."],
  ["1.2", "Give one meaning to one word.", "“Token” has one meaning in this document."],
  ["1.5", "Write in the active voice.", "“The model predicts the next token.”"],
  ["1.6", "Use a verb, not a noun phrase.", "“Predict”, not “make a prediction”."],
  ["1.8", "Use the positive form.", "“Stop”, not “do not continue”."],
  ["2.2", "Do not use more than three nouns together.", "“Large language model” = 3 nouns."],
  ["2.3", "Use the definite article for a known item.", "“The context” = the context above."],
  ["3.1", "Write in the present tense.", "“The model gives one score.”"],
  ["3.3", "Use the imperative for an instruction.", "“Select TAKE 100 SAMPLES.”"],
  ["4.1", "Keep a sentence to 20 words or fewer.", "The longest sentence in this document has 19 words."],
  ["4.2", "Give one instruction or one fact per sentence.", "Each sentence above a diagram states one step."],
  ["6.1", "Write descriptive text in a logical order.", "Clauses 01 to 06 follow the order of the operation."],
];

const GLOSSARY: [string, string][] = [
  ["Attention", "The operation that gives a weight to each pair of tokens in the context."],
  ["Autoregressive", "The property of a model that uses its output as its next input."],
  ["Context", "The list of tokens that the model reads in one operation."],
  ["Embedding", "The list of numbers that the model uses for one token."],
  ["Logit", "The raw score that the model gives to one token."],
  ["Model", "The computer program that predicts the next token."],
  ["Probability", "A number from 0 to 1 that gives the chance of one result."],
  ["Sampling", "The operation that selects one token from the probabilities."],
  ["Softmax", "The function that changes the scores into probabilities."],
  ["Temperature", "The control that changes the shape of the probability distribution."],
  ["Token", "A small part of a text. A token can be a word or a part of a word."],
  ["Tokenizer", "The program that cuts a text into tokens."],
  ["Top-k", "The control that keeps only the k best tokens."],
  ["Top-p", "The control that keeps the smallest group of tokens with a total probability of at least p."],
  ["Vocabulary", "The complete list of tokens that a model can use."],
];

const CONTENT_CLAUSES: [string, string, string][] = [
  ["00", "Scope", "01"],
  ["01", "Tokens", "02"],
  ["02", "Numbers for words", "03"],
  ["03", "Attention", "04"],
  ["04", "The next token", "05"],
  ["05", "Choosing the token", "06"],
  ["06", "The loop", "07"],
  ["07", "What the model does not do", "08"],
  ["A", "Rules applied", "08"],
  ["B", "Glossary", "08"],
];

const CONTENT_FIGURES: [string, string, string][] = [
  ["01", "A sentence cut into tokens", "02"],
  ["02", "One token becomes a vector", "03"],
  ["03", "Attention weights, one head", "04"],
  ["04", "Scores converted to probabilities", "05"],
  ["05", "Sampling control unit", "06"],
  ["06", "One pass of the generation loop", "07"],
  ["A", "Plate — specification booklet", "01"],
  ["B", "Plate — pen plotter", "08"],
];

function Contents() {
  const col = (title: string, rows: [string, string, string][], href: boolean) => (
    <div>
      <h2 className="u-label text-lm-ink-45">{title}</h2>
      <ol className="mt-4">
        {rows.map(([n, t, s]) => {
          const inner = (
            <>
              <span className="u-label w-[28px] shrink-0 text-lm-ink-45 group-hover:text-lm-orange-text">{n}</span>
              <span className="flex-1 text-[13px]">{t}</span>
              <span className="text-[12px] italic text-lm-ink-70 group-hover:text-lm-orange-text">p. {s}</span>
            </>
          );
          return (
            <li key={n + t}>
              {href ? (
                <a
                  href={`#clause-${n}`}
                  className="group flex items-baseline gap-4 border-b border-lm-rule py-[9px] transition-colors duration-150 hover:text-lm-orange-text focus:outline-none focus-visible:bg-lm-orange focus-visible:text-lm-paper"
                >
                  {inner}
                </a>
              ) : (
                <div className="group flex items-baseline gap-4 border-b border-lm-rule py-[9px]">{inner}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );

  return (
    <Shell>
      <section className="rule-ink grid gap-x-14 gap-y-10 pt-6 pb-16 md:grid-cols-2">
        {col("Contents — clauses", CONTENT_CLAUSES, true)}
        {col("Contents — figures and plates", CONTENT_FIGURES, false)}
      </section>
    </Shell>
  );
}

export default function LlmGeneration() {
  return (
    <div className="lm min-h-screen bg-lm-paper font-mono text-lm-ink antialiased">
      <Masthead />

      <Shell className="pt-10">
        <Plate
          src={coverPlate}
          fig="Plate A"
          caption="Specification booklet with line drawings and drafting instruments"
          height="h-[38vh] min-h-[240px] md:h-[52vh]"
          position="center 60%"
        />
      </Shell>

      <Contents />

      <Shell>
        {/* 00 SCOPE */}
        <Clause
          code="00"
          title="Scope"
          rule="STE 4.1 — Keep a sentence to 20 words or fewer. STE 4.2 — Give one instruction or one fact per sentence."
        >
          <p>
            This document explains how a large language model (LLM) generates text. It is for engineers and for
            general readers. It follows the rules of Simplified Technical English (ASD-STE100, Issue 9).
          </p>
          <p>
            A large language model is a computer program that predicts the next token in a text. Training gives the
            model this skill. The model repeats the prediction until it selects an end token. This repetition is the
            complete operation of text generation.
          </p>
          <p>
            Read the clauses in order. Clause 01 to clause 06 follow the order of the operation. Clause 07 states the
            limits of the model.
          </p>
          <p className="u-note border-l pl-3" style={{ borderColor: ORANGE }}>
            The diagrams show the operation at a high level. The numbers in the diagrams are examples. They are not
            the values of a specific model.
          </p>

          <Defs
            items={[
              ["LLM", "Large language model. A model that generates text one token at a time."],
              ["Training", "The long calculation that moves the values of the model to useful positions."],
              ["End token", "A special token that tells the model to stop the operation."],
            ]}
          />
        </Clause>

        {/* 01 TOKENS */}
        <Clause
          code="01"
          title="Tokens"
          rule="STE 1.2 — Give one meaning to one word. In this document, “token” always means a small part of a text."
          figure={
            <Figure
              n="01"
              title="A sentence cut into tokens, with the numeric ID of each token"
              note="The space before a token is part of the token. This is the reason for the mark ␣. The last token is the target: the model must predict this token from the five tokens that come before it."
              sheet="Sheet 2 of 8 · Scale 1:1"
            >
              <Fig01 />
            </Figure>
          }
        >
          <p>
            A token is a small part of a text. A tokenizer cuts the text into tokens. A token can be a word, a part
            of a word, or a punctuation mark. FIG. 01 shows one sentence and its seven tokens.
          </p>
          <p>
            Each token has a number. This number is its ID. The model uses the IDs. It does not use the letters. A
            common vocabulary has about 50,000 to 200,000 tokens.
          </p>
          <p>
            The tokens in one operation make the context. The context has a maximum length. For example, 8,192
            tokens or 128,000 tokens. When the context is full, the model must remove the first tokens or stop.
          </p>
          <List
            items={[
              "The tokenizer reads the text as characters.",
              "The tokenizer finds the longest token that matches the text.",
              "The tokenizer gives an ID to the token.",
              "The tokenizer repeats this operation to the end of the text.",
            ]}
          />
        </Clause>

        {/* 02 EMBEDDINGS */}
        <Clause
          code="02"
          title="Numbers for words"
          rule="STE 2.3 — Use the definite article for a known item. “The vector” means the vector of the selected token."
          figure={
            <Figure
              n="02"
              title="One token becomes a vector; similar words sit near each other"
              note="A real vector has 768 to 4,096 values. The chart on the left shows 32 of these values. The chart on the right shows a projection of 1,536 dimensions onto two axes. The distances in this projection are only a simple view of the real distances."
              sheet="Sheet 3 of 8 · Scale 1:1"
            >
              <Fig02 />
            </Figure>
          }
        >
          <p>
            Each token ID becomes a list of numbers. This list is a vector. The technical name for a vector is an
            embedding. FIG. 02 shows 32 values of one vector.
          </p>
          <p>
            The values are not random. Training moves the vectors of similar words to near positions. The vector for
            “model” is near the vectors for “engine” and “system”.
          </p>
          <p>
            The model does not store a definition of a word. It stores a position. The meaning of a token comes from
            its position and from the other tokens in the context. The same token can have different meanings in
            different contexts.
          </p>
        </Clause>

        {/* 03 ATTENTION */}
        <Clause
          code="03"
          title="Attention"
          rule="STE 6.1 — Write descriptive text in a logical order. This clause moves from the token to the head to the layer."
          figure={
            <Figure
              n="03"
              title="Attention weights for one head in one layer"
              note="Select a token in the left column. The orange row shows the weights that this token gives to the other tokens. A row always shows the token that asks. A column always shows the token that answers. In this example, the word “model” looks most strongly at itself and at the verb “reads”."
              sheet="Sheet 4 of 8 · Interactive"
            >
              <Fig03 />
            </Figure>
          }
        >
          <p>
            The order of the words gives meaning to a sentence. The model must see the other tokens to know the
            meaning of one token. Attention is the operation that does this.
          </p>
          <p>
            Each token looks at all the tokens in the context. The model gives a weight to each pair of tokens. A
            high weight means “use this token”. A low weight means “do not use this token”.
          </p>
          <p>
            Attention runs many times at the same time. Each run is a head. A large model can use 96 heads in one
            layer. The model can have 96 layers. The output of one layer is the input of the next layer.
          </p>
          <p>
            The result of the attention operation is a new vector for each token. This vector contains information
            from the full context. The model needs this information for the next operation.
          </p>
        </Clause>

        {/* 04 NEXT TOKEN */}
        <Clause
          code="04"
          title="The next token"
          rule="STE 1.6 — Use a verb, not a noun phrase. This document writes “predict”, not “make a prediction”."
          figure={
            <Figure
              n="04"
              title="Raw scores converted to probabilities by the softmax function"
              note="The scores (logits) are raw numbers with no limit. The softmax function changes them to probabilities. The probabilities always sum to 1.000. The final row shows the 199,992 tokens that are not in the first five positions."
              sheet="Sheet 5 of 8 · Scale 1:1"
            >
              <Fig04 />
            </Figure>
          }
        >
          <p>
            At the end of one operation, the model gives one score to each token in the vocabulary. This score is a
            logit. The score is a raw number. It has no minimum and no maximum.
          </p>
          <p>
            Softmax is the function that changes the scores into probabilities. Each probability is a number from 0
            to 1. The sum of all probabilities is 1. FIG. 04 shows the six highest probabilities for one operation.
          </p>
          <p>
            The model does not always select the token with the highest probability. Sometimes it selects a token
            with a lower probability. The next clause explains this selection.
          </p>
        </Clause>
      </Shell>

      {/* 05 SAMPLING — inverted instrument band (the original lacked this id, so its contents link went nowhere) */}
      <div id="clause-05" className="scroll-mt-[var(--site-bar-h)] bg-lm-ink text-lm-paper py-16">
        <Shell>
          <div className="md:grid md:grid-cols-[190px_minmax(0,1fr)] md:gap-x-12">
            <aside className="mb-8 md:mb-0">
              <div className="flex items-baseline gap-3">
                <span className="inline-block h-[10px] w-[10px]" style={{ background: ORANGE }} />
                <span className="u-label text-lm-olive-mid">Clause 05</span>
              </div>
              <h2 className="u-display mt-3 text-[22px] md:text-[26px]">Choosing the token</h2>
              <p className="u-note mt-5 border-l pl-3" style={{ borderColor: ORANGE, color: "#B4B8A2" }}>
                STE 3.3 — Use the imperative for an instruction. Select, move, and read the controls below.
              </p>
            </aside>
            <div className="u-measure space-y-5 text-[15px] text-[#F2F2EC]">
              <p>
                Sampling is the operation that selects one token from the probabilities. Temperature, top-k, and
                top-p are the controls for sampling. A text generator gives these controls to the user.
              </p>
              <p>
                Temperature changes the shape of the probability distribution. A low temperature gives more
                probability to the best token. A high temperature gives more probability to the other tokens.
              </p>
              <p>
                Top-k keeps only the k best tokens. Top-p keeps the smallest group of tokens with a total
                probability of at least p. The operation then renormalizes the probabilities of this group. The sum
                of the group is always 1.
              </p>
            </div>
          </div>

          <div className="mt-14">
            <SamplingLab />
          </div>
        </Shell>
      </div>

      <Shell>
        {/* 06 LOOP */}
        <Clause
          code="06"
          title="The loop"
          rule="STE 1.5 — Write in the active voice. “The model repeats the operation”, not “the operation is repeated”."
          figure={
            <Figure
              n="06"
              title="One pass of the autoregressive generation loop"
              note="The orange path is the repeat. Step 6 puts the new token at the end of the context. Then the operation starts again at step 3. The loop ends when the model selects an end token, or when the text reaches the maximum length."
              sheet="Sheet 7 of 8 · Scale 1:1"
            >
              <Fig06 />
            </Figure>
          }
        >
          <p>
            The model generates text with a loop. The loop has six steps. FIG. 06 shows these steps and the repeat
            path.
          </p>
          <List
            items={[
              "Input text: the user enters a text, for example a question.",
              "Tokenizer: the program cuts the text into tokens.",
              "Model: the model calculates new vectors for all tokens in the context.",
              "Scores: the model gives one score to each token in the vocabulary.",
              "Sample: the operation selects one token with the controls of clause 05.",
              "Append: the operation puts the new token at the end of the context.",
            ]}
          />
          <p>
            The operation then repeats from step 3. This property is autoregressive: the output of one pass is part
            of the input of the next pass. A 200-word answer is the result of about 300 passes.
          </p>
          <p>
            The user sees the text one token at a time. This is the reason for the moving cursor in a chat window.
            The model does not write a full answer and then show it. It shows each token after it selects the token.
          </p>
        </Clause>

        {/* 07 LIMITS */}
        <Clause
          code="07"
          title="What the model does not do"
          rule="STE 1.8 — Use the positive form when it is possible. Some limits need the negative form for safety."
        >
          <p>
            A model can produce a text that is wrong. The user must know the limits of the operation. The next
            statements give these limits.
          </p>
          <div className="mt-6 space-y-4">
            {[
              ["The model predicts text.", "It does not look up a fact in a database. It calculates only the next probable token."],
              ["The model has no plan for the full answer.", "It decides one token at a time. It cannot change a sentence that it has already produced."],
              ["The model does not know whether a statement is true.", "Truth is not part of the calculation. Probability is the only quantity in the calculation."],
              ["The model can copy an error from its training data.", "Verify important facts with a second source."],
              ["The output is not stable.", "A small change in one probability can change all the text that comes after it."],
            ].map(([a, b]) => (
              <div key={a} className="rule-ink pt-3">
                <p className="font-semibold">{a}</p>
                <p className="text-lm-ink-70 text-[13px] mt-1">{b}</p>
              </div>
            ))}
          </div>
        </Clause>
      </Shell>

      <Shell>
        <Plate
          src={plotterPlate}
          fig="Plate B"
          caption="Pen plotter drawing one continuous line on white stock"
          height="h-[32vh] min-h-[210px] md:h-[42vh]"
          position="center 50%"
        />
      </Shell>

      <Shell>
        {/* APPENDIX A */}
        <Clause
          code="A"
          wide
          title="Appendix A — Rules applied"
          rule="ASD-STE100, Issue 9. This document applies the rules of Section 1 (words), Section 2 (noun phrases), Section 3 (verbs), Section 4 (sentences), and Section 6 (descriptive writing)."
        >
          <p>
            Simplified Technical English is a set of writing rules for technical documentation. The rules control
            the words, the verbs, and the sentence length. The target is a text that a reader can understand on the
            first read.
          </p>
          <div className="mt-8">
            <Table
              head={["Rule", "Requirement", "Application in this document"]}
              rows={STE_RULES}
            />
          </div>
        </Clause>

        {/* APPENDIX B */}
        <Clause
          code="B"
          title="Appendix B — Glossary"
          rule="STE 4.2 — Give one fact per sentence. Each entry below gives one definition."
        >
          <Defs items={GLOSSARY} />
        </Clause>
      </Shell>

      <footer className="bg-lm-ink text-lm-paper mt-6">
        <Shell>
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8 py-14">
            <div>
              <div className="u-label text-lm-olive-mid">End of document</div>
              <p className="u-display mt-4 text-[26px] md:text-[38px] max-w-[16ch]">
                The model predicts the next token
              </p>
              <p className="u-note mt-5 max-w-[52ch]" style={{ color: "#B4B8A2" }}>
                This is the complete operation. Everything else in this document describes how the model prepares
                for this one calculation.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-10 gap-y-4 text-[12px]">
              {[
                ["Author", "N. Saïd Ali"],
                ["Draft", "AI-assisted, edited"],
                ["Checked", "Not yet"],
                ["Applicable spec", "ASD-STE100, Issue 9"],
                ["Status", "Published"],
                ["Sheets", "8 of 8"],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-[#3A3A34] pt-3">
                  <dt className="u-label text-lm-olive-mid">{k}</dt>
                  <dd className="mt-1">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-[#3A3A34] py-5 u-label text-lm-olive-mid">
            <span>Doc. TG-01 · Rev. A</span>
            <span>Set in IBM Plex Mono</span>
            <span style={{ color: ORANGE }}>■</span>
          </div>
        </Shell>
      </footer>
    </div>
  );
}
