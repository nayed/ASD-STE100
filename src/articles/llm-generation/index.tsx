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
    ["Revision", "B"],
    ["Issue date", "2026-10-24"],
    ["Classification", "Public"],
  ];
  return (
    <header className="bg-lm-ink text-lm-paper">
      <Shell>
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 py-4 u-label text-lm-olive-light">
          <span>ASD-STE100 · Simplified Technical English · Issue 9</span>
          <span>Sheet 1 of 9 · Uncontrolled when printed</span>
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
  kicker = `Clause ${code}`,
  title,
  rule,
  children,
  figure,
  invert = false,
}: {
  code: string;
  kicker?: string;
  title: string;
  rule: string;
  children: ReactNode;
  figure?: ReactNode;
  invert?: boolean;
}) {
  return (
    <section id={`clause-${code}`} className={`scroll-mt-[calc(var(--site-bar-h)+2rem)] pt-8 pb-16 ${invert ? "" : "rule-ink"}`}>
      <div className="md:grid md:grid-cols-[190px_minmax(0,1fr)] md:gap-x-12">
        <aside className="mb-7 md:mb-0">
          <div className="md:sticky md:top-[calc(var(--site-bar-h)+2rem)]">
            <div className="flex items-baseline gap-3">
              <span className="inline-block h-[10px] w-[10px]" style={{ background: ORANGE }} />
              <span className="u-label text-lm-ink-45">{kicker}</span>
            </div>
            <h2 className="u-display mt-3 text-[22px] md:text-[26px]">{title}</h2>
            <p className="u-note mt-5 border-l pl-3" style={{ borderColor: ORANGE }}>
              {rule}
            </p>
          </div>
        </aside>
        <div className="u-measure space-y-5 text-[15px]">{children}</div>
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

/** Fig. 07: a chat after the chat template, special tokens in orange (the format is an example) */
const CHAT_SENT: [role: string, text: string][] = [
  ["system", "You are a helpful assistant. Use short sentences."],
  ["user", "What is a token?"],
  ["assistant", "A token is a small part of a text."],
  ["user", "Give an example."],
];
const CHAT_ANSWER = "The word “unhappy” can be two tokens: “un” and “happy”.";

function ChatListing() {
  const tok = (t: string) => (
    <span className="font-semibold" style={{ color: ORANGE_TEXT }}>
      {t}
    </span>
  );
  const part = (label: string, body: ReactNode, model = false) => (
    <div className={model ? "border-t border-lm-rule bg-[#FBEDE6]" : ""}>
      <div className="u-label px-6 pt-4" style={model ? { color: ORANGE_TEXT } : undefined}>
        {label}
      </div>
      <pre className="min-w-max px-6 pt-2 pb-5 text-[13px] leading-[1.75]">{body}</pre>
    </div>
  );
  return (
    <div className="overflow-x-auto border border-lm-rule bg-[#F2F2EC]">
      {part(
        "1 — The application sends this text",
        <>
          {CHAT_SENT.map(([role, text]) => (
            <span key={role + text}>
              {tok("<|start|>")}
              {role}
              {"\n"}
              {text}
              {tok("<|end|>")}
              {"\n"}
            </span>
          ))}
          {tok("<|start|>")}assistant
        </>,
      )}
      {part(
        "2 — The model writes the rest, one token at a time",
        <>
          {CHAT_ANSWER}
          {tok("<|end|>")}
        </>,
        true,
      )}
    </div>
  );
}

/* ─────────────────────────────── content ─────────────────────────────── */

const GLOSSARY: [string, string][] = [
  ["Attention", "The operation that gives a weight from each token to itself and to each earlier token."],
  ["Autoregressive", "The property of a model that uses its output as its next input."],
  ["Chat template", "The format that joins the parts of a chat into one text."],
  ["Context", "The list of tokens that the model reads in one operation."],
  ["Embedding", "The list of numbers that the model uses for one token."],
  ["Feed-forward network", "The part of a layer that changes each vector by itself, after attention."],
  ["Fine-tuning", "The second stage of training. It uses examples of good answers."],
  ["KV cache", "The store that keeps the attention data of the earlier tokens."],
  ["Logit", "The raw score that the model gives to one token."],
  ["Model", "The computer program that predicts the next token."],
  ["Position information", "The numbers that the model adds to a vector to show the position of its token."],
  ["Pre-training", "The first stage of training. The model predicts the next token in a very large text."],
  ["Probability", "A number from 0 to 1 that gives the chance of one result."],
  ["Sampling", "The operation that selects one token from the probabilities."],
  ["Softmax", "The function that changes the scores into probabilities."],
  ["Special token", "A token that marks a part of a text. It is not a word."],
  ["System prompt", "The instructions that the application puts before the conversation."],
  ["Temperature", "The control that changes the shape of the probability distribution."],
  ["Token", "A small part of a text. A token can be a word or a part of a word."],
  ["Tokenizer", "The program that cuts a text into tokens."],
  ["Top-k", "The control that keeps only the k best tokens."],
  ["Top-p", "The control that keeps the smallest group of tokens with a total probability of at least p."],
  ["Vocabulary", "The complete list of tokens that a model can use."],
];

/** [number, title, page, anchor id when it is not the number] */
const CONTENT_CLAUSES: [string, string, string, string?][] = [
  ["00", "Scope", "01"],
  ["01", "Tokens", "02"],
  ["02", "Numbers for words", "03"],
  ["03", "Attention", "04"],
  ["04", "The next token", "05"],
  ["05", "Choosing the token", "06"],
  ["06", "The loop", "07"],
  ["07", "Where the skill comes from", "08"],
  ["08", "A chat is one text", "08"],
  ["09", "What the model does not do", "09"],
  ["", "Glossary", "09", "glossary"],
];

const CONTENT_FIGURES: [string, string, string][] = [
  ["01", "A sentence cut into tokens", "02"],
  ["02", "One token becomes a vector", "03"],
  ["03", "Attention weights, one head", "04"],
  ["04", "Scores converted to probabilities", "05"],
  ["05", "Sampling control unit", "06"],
  ["06", "One pass of the generation loop", "07"],
  ["07", "A chat as the model reads it", "08"],
  ["A", "Plate — specification booklet", "01"],
  ["B", "Plate — pen plotter", "09"],
];

function Contents() {
  const col = (title: string, rows: [string, string, string, string?][], href: boolean) => (
    <div>
      <h2 className="u-label text-lm-ink-45">{title}</h2>
      <ol className="mt-4">
        {rows.map(([n, t, s, id]) => {
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
                  href={`#clause-${id ?? n}`}
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
          rule="Keep a sentence to 20 words or fewer. Give one instruction or one fact per sentence."
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
            Read the clauses in order. Clause 01 to clause 06 follow the order of the operation. Clause 07 explains
            training. Clause 08 explains how a chat becomes one text. Clause 09 states the limits of the model.
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
          rule="Give one meaning to one word. In this document, “token” always means a small part of a text."
          figure={
            <Figure
              n="01"
              title="A sentence cut into tokens, with the numeric ID of each token"
              note="The space before a token is part of the token. This is the reason for the mark ␣. The marked token “␣word” is the target. The model must predict this token from the five tokens before it."
              sheet="Sheet 2 of 9 · Scale 1:1"
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
            tokens or 128,000 tokens. When the context is full, the program must remove the first tokens or stop.
          </p>
          <List
            items={[
              "The tokenizer starts with the text as single characters.",
              "The tokenizer applies a merge rule. The rule joins two neighbouring pieces into one larger piece.",
              "The tokenizer repeats this step until no merge rule applies.",
              "The tokenizer gives the ID of each final piece.",
            ]}
          />
          <p className="u-note border-l pl-3" style={{ borderColor: ORANGE }}>
            The merge rules come from a large sample of text. A frequent word becomes one token. A rare word becomes
            two or more tokens.
          </p>
        </Clause>

        {/* 02 EMBEDDINGS */}
        <Clause
          code="02"
          title="Numbers for words"
          rule="Use the definite article for a known item. “The vector” means the vector of the selected token."
          figure={
            <Figure
              n="02"
              title="One token becomes a vector; similar words sit near each other"
              note="A real vector has from 768 to more than 16,000 values. The chart on the left shows 32 of these values. The chart on the right shows a projection of 1,536 dimensions onto two axes. The distances in this projection are only a simple view of the real distances. A lower distance means a nearer vector."
              sheet="Sheet 3 of 9 · Scale 1:1"
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
          rule="Write descriptive text in a logical order. This clause moves from the token to the head to the layer."
          figure={
            <Figure
              n="03"
              title="Attention weights for one head in one layer"
              note="Select a token in the left column. The orange row shows the weights that this token gives to itself and to the tokens before it. A row always shows the token that asks. A column always shows the token that answers. The hatched cells are later tokens, which the row cannot see. In this example, the word “model” looks most strongly at itself and at “The”."
              sheet="Sheet 4 of 9 · Interactive"
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
            The vectors alone do not show the order of the tokens. For this reason, the model adds position
            information to each vector before attention.
          </p>
          <p>
            Each token looks at itself and at the tokens before it. It cannot look at the tokens after it. During
            generation, these tokens do not exist yet. The model gives a weight to each of these pairs. A high
            weight means “use this token”. A low weight means “do not use this token”.
          </p>
          <p>
            Attention runs many times at the same time. Each run is a head. After attention, a feed-forward network
            changes each vector by itself. Attention and the feed-forward network together make one layer.
          </p>
          <p>
            A large model can use 96 heads in one layer. The model can have 96 layers. The output of one layer is
            the input of the next layer.
          </p>
          <p>
            The result of the layers is a new vector for each token. This vector contains information from the
            token and from the tokens before it. The model needs this information for the next operation.
          </p>
        </Clause>

        {/* 04 NEXT TOKEN */}
        <Clause
          code="04"
          title="The next token"
          rule="Use a verb, not a noun phrase. This document writes “predict”, not “make a prediction”."
          figure={
            <Figure
              n="04"
              title="Raw scores converted to probabilities by the softmax function"
              note="The scores (logits) are raw numbers with no limit. The softmax function changes them to probabilities. The probabilities always sum to 1.000. The final row shows the 199,992 tokens that are not in the first five positions."
              sheet="Sheet 5 of 9 · Scale 1:1"
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
            The program does not always select the token with the highest probability. Sometimes it selects a token
            with a lower probability. At the lowest temperature, it always selects the token with the highest
            probability. The next clause explains this selection.
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
                Use the imperative for an instruction. Select, move, and read the controls below.
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
          rule="Write in the active voice. “The model repeats the operation”, not “the operation is repeated”."
          figure={
            <Figure
              n="06"
              title="One pass of the autoregressive generation loop"
              note="The orange path is the repeat. Step 6 puts the new token at the end of the context. Then the operation starts again at step 3. The loop ends when the model selects an end token, or when the text reaches the maximum length."
              sheet="Sheet 7 of 9 · Scale 1:1"
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
              "Model: the model calculates a new vector for each new token.",
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
            The model does not calculate the old tokens again. It keeps their attention data in a store. This store
            is the KV cache.
          </p>
          <p>
            For this reason, the first token takes the longest time. On the first pass, the model reads the full
            input. On each later pass, it calculates only the new token.
          </p>
          <p>
            The user sees the text one token at a time. This is the reason for the moving cursor in a chat window.
            The model does not write a full answer and then show it. It shows each token after it selects the token.
          </p>
        </Clause>

        {/* 07 TRAINING */}
        <Clause
          code="07"
          title="Where the skill comes from"
          rule="Write in the present tense. “Training changes the values”, not “training changed the values”."
        >
          <p>
            A new model cannot predict text. Its values start as random numbers. Training changes these values in two
            stages.
          </p>
          <List
            items={[
              "Pre-training: the model reads a very large amount of text. At each position, it predicts the next token. The training program compares the prediction with the real token. Then it changes the values by a small quantity to make the error smaller. The program repeats this step for trillions of tokens.",
              "Fine-tuning: the model trains on examples of questions and good answers. People also compare two answers and select the better answer. The model learns to give answers of the better type.",
            ]}
          />
          <p>
            Training stops before people use the model. During use, the values do not change. The model does not
            learn from a conversation. It knows the conversation only because the conversation is in its context.
          </p>
        </Clause>

        {/* 08 CHAT */}
        <Clause
          code="08"
          title="A chat is one text"
          rule="Write descriptive text in a logical order. The listing shows the text in the order that the model reads it."
          figure={
            <Figure
              n="07"
              title="A chat with two questions, as one text for the model"
              note="Part 1 ends with the label of the assistant, with no answer. The model writes part 2 after this label. It stops when it selects the end token. The orange marks are special tokens. Each mark is one token with its own ID. The exact marks are different for each model."
              sheet="Sheet 8 of 9 · Listing"
            >
              <ChatListing />
            </Figure>
          }
        >
          <p>
            A chat window shows separate messages. The model does not see separate messages. It sees one text.
          </p>
          <p>
            A chat template joins all the parts of the chat into this text. The parts are the system prompt, the user
            messages and the answers. Special tokens mark the start and the end of each part. FIG. 07 shows an
            example.
          </p>
          <p>
            The system prompt is a text from the application. It gives instructions to the model before the
            conversation starts.
          </p>
          <p>
            The text ends with the label of the assistant. The model continues the text after this label. When the
            answer is complete, the model selects the end token.
          </p>
          <p>
            The model keeps no memory between two messages. The application sends the full conversation again with
            each new message. For this reason, a long chat uses more of the context.
          </p>
        </Clause>

        {/* 09 LIMITS */}
        <Clause
          code="09"
          title="What the model does not do"
          rule="Use the positive form when it is possible. Some limits need the negative form for safety."
        >
          <p>
            A model can produce a text that is wrong. The user must know the limits of the operation. The next
            statements give these limits.
          </p>
          <div className="mt-6 space-y-4">
            {[
              ["The model alone does not look up facts.", "It calculates only the next probable token. Some applications search the web or use other tools. They put the results into the context."],
              ["The model commits to one token at a time.", "It can prepare the next words inside its calculation. It cannot change a token that it has already produced."],
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
        {/* GLOSSARY */}
        <Clause
          code="glossary"
          kicker="Appendix"
          title="Glossary"
          rule="Give one fact per sentence. Each entry below gives one definition."
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
                ["Sheets", "9 of 9"],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-[#3A3A34] pt-3">
                  <dt className="u-label text-lm-olive-mid">{k}</dt>
                  <dd className="mt-1">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-[#3A3A34] py-5 u-label text-lm-olive-mid">
            <span>Doc. TG-01 · Rev. B</span>
            <span>Set in IBM Plex Mono</span>
            <span style={{ color: ORANGE }}>■</span>
          </div>
        </Shell>
      </footer>
    </div>
  );
}
