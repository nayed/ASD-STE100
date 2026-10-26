/** Figures 01–03 of RAG-100: two ways to answer, the two phases, the chunker. */

import { useMemo, useState, type ReactNode } from "react";
import { CHUNKER_TEXT } from "./data";

const INK = "var(--ink)", OLIVE = "var(--olive)", OLIVE_LT = "var(--olive-lt)", PANEL = "var(--panel)", ACC = "var(--acc)";

type Anchor = "start" | "middle" | "end";
/** text with a halo in the panel colour, so connectors can pass behind it */
export function T({
  x, y, children, size = 10, anchor = "start", fill = INK, weight = 400, ls = 0.08, halo = PANEL,
}: { x: number; y: number; children: ReactNode; size?: number; anchor?: Anchor; fill?: string; weight?: number; ls?: number; halo?: string | null }) {
  return (
    <text
      x={x} y={y} fontSize={size} textAnchor={anchor} fill={fill} fontWeight={weight} letterSpacing={`${ls}em`}
      {...(halo ? { stroke: halo, strokeWidth: 4, strokeLinejoin: "round" as const, paintOrder: "stroke" } : {})}
    >
      {children}
    </text>
  );
}

/** a drawing that keeps a readable size on a phone and scrolls sideways in its own frame */
export function Wide({ children }: { children: ReactNode }) {
  return (
    <div className="wide-box">
      <div className="wide-wrap">{children}</div>
    </div>
  );
}

export function Arrows({ id, color = "var(--olive)", acc = "var(--acc)" }: { id: string; color?: string; acc?: string }) {
  return (
    <defs>
      <marker id={`${id}-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={color} />
      </marker>
      <marker id={`${id}-k`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={acc} />
      </marker>
    </defs>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 01 — two ways to answer the same question (dark panel)          */
/* ------------------------------------------------------------------ */

export function FigTwoWays() {
  const D = "#121311", LIGHT = "#e9e8e1", DIM = "#8d8f80", ACCL = "var(--acc-lt)";
  const box = (x: number, y: number, w: number, t: string, sub: string, key = false) => (
    <g>
      <rect x={x} y={y} width={w} height={46} fill={D} />
      <rect x={x} y={y} width={w} height={46} fill={key ? "rgba(147,163,255,0.14)" : D} stroke={key ? ACCL : DIM} strokeWidth={key ? 1.8 : 1.1} />
      <T x={x + w / 2} y={y + 20} size={10} anchor="middle" weight={700} fill={key ? ACCL : LIGHT} halo={null}>{t}</T>
      <T x={x + w / 2} y={y + 34} size={8.5} anchor="middle" fill={DIM} halo={null}>{sub}</T>
    </g>
  );
  const arrow = (x1: number, x2: number, y: number, key = false) => (
    <line x1={x1} y1={y} x2={x2 - 3} y2={y} stroke={key ? ACCL : DIM} strokeWidth={1.3} className="flow" markerEnd={`url(#f1-${key ? "k" : "a"})`} />
  );
  return (
    <Wide>
        <svg className="wide" viewBox="0 0 760 290" role="img" aria-label="Two ways to answer a question: a language model alone, and RAG">
        <Arrows id="f1" color={DIM} acc={ACCL} />
        <T x={0} y={14} size={9.5} fill={DIM} ls={0.18} halo={null}>THE SAME QUESTION</T>
        <T x={150} y={14} size={10} weight={700} fill={LIGHT} halo={null}>“What is the maximum system pressure?”</T>

        {/* lane A */}
        <T x={0} y={52} size={9} fill={DIM} ls={0.16} halo={null}>A — LANGUAGE MODEL ONLY</T>
        {/* packets first, so they pass behind the boxes */}
        <circle className="packet" r={4} fill={DIM}>
          <animateMotion dur="3.4s" repeatCount="indefinite" path="M60,85 H535" />
        </circle>
        {box(0, 62, 120, "QUESTION", "normal words")}
        {arrow(120, 180, 85)}
        {box(180, 62, 200, "LANGUAGE MODEL", "training data only")}
        {arrow(380, 440, 85)}
        {box(440, 62, 190, "ANSWER", "no source · can be old")}
        <T x={642} y={82} size={9} fill={DIM} halo={null}>cannot be</T>
        <T x={642} y={95} size={9} fill={DIM} halo={null}>checked</T>

        <line x1={0} y1={136} x2={760} y2={136} stroke="#3a3b36" strokeWidth={1} strokeDasharray="3 4" />

        {/* lane B */}
        <T x={0} y={168} size={9} fill={ACCL} ls={0.16} weight={700} halo={null}>B — RETRIEVAL-AUGMENTED GENERATION</T>
        <circle className="packet" r={4} fill={ACCL}>
          <animateMotion dur="3.4s" repeatCount="indefinite" path="M56,201 H700" />
        </circle>
        {box(0, 178, 112, "QUESTION", "normal words")}
        {arrow(112, 148, 201, true)}
        {box(148, 178, 136, "SEARCH", "your documents", true)}
        {arrow(284, 320, 201, true)}
        {box(320, 178, 136, "CHUNKS", "+ the question")}
        {arrow(456, 492, 201)}
        {box(492, 178, 120, "MODEL", "writes from them")}
        {arrow(612, 640, 201)}
        {box(640, 178, 120, "ANSWER", "+ [C-02]")}
        <T x={640} y={248} size={9} fill={LIGHT} halo={null}>each fact has</T>
        <T x={640} y={261} size={9} fill={LIGHT} halo={null}>a source</T>
      </svg>
    </Wide>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 02 — the two phases, with data flowing on every connector       */
/* ------------------------------------------------------------------ */

type BlockKey = "docs" | "divide" | "embed" | "index" | "question" | "qembed" | "search" | "prompt" | "llm" | "answer";
const BLOCKS: Record<BlockKey, { x: number; y: number; w: number; h: number; t: string; sub: string; does: string; input: string; output: string; fail: string }> = {
  docs: { x: 0, y: 40, w: 130, h: 54, t: "DOCUMENTS", sub: "MANUALS · REPORTS", does: "The documents are the source of all answers.", input: "Files: PDF, HTML or text.", output: "Text with its headings.", fail: "If a document is missing, the system cannot find its facts." },
  divide: { x: 166, y: 40, w: 120, h: 54, t: "DIVIDE", sub: "SHEET 03", does: "This step cuts the text into chunks of a few hundred words.", input: "Text with its headings.", output: "Chunks, each with an identity.", fail: "If a cut splits a fact, no chunk holds the full fact." },
  embed: { x: 322, y: 40, w: 120, h: 54, t: "EMBED", sub: "SHEET 04", does: "The embedding model changes each chunk into a vector of 384 numbers.", input: "One chunk.", output: "One vector.", fail: "If the model does not know the words of the subject, similar texts get different vectors." },
  index: { x: 620, y: 24, w: 300, h: 168, t: "VECTOR INDEX", sub: "ONE VECTOR FOR EACH CHUNK", does: "The index stores each vector with its chunk. It finds the nearest vectors fast.", input: "Vectors and their chunks.", output: "The identities of the nearest chunks.", fail: "If the index is old, the system cites old values." },
  question: { x: 0, y: 252, w: 116, h: 54, t: "QUESTION", sub: "NORMAL WORDS", does: "A person asks a question in normal words.", input: "The words of the person.", output: "The question text.", fail: "If the question is not clear, the search finds the wrong chunks." },
  qembed: { x: 146, y: 252, w: 110, h: 54, t: "EMBED", sub: "SAME MODEL", does: "The same model changes the question into a vector.", input: "The question text.", output: "One vector.", fail: "If the model is not the same as for the chunks, you cannot compare the vectors." },
  search: { x: 286, y: 252, w: 116, h: 54, t: "SEARCH", sub: "TOP k · SHEET 05", does: "The search compares the question vector with the stored vectors. It keeps the best k chunks.", input: "The question vector.", output: "k chunks and their scores.", fail: "If the right chunk is not in the top k, the answer cannot use it." },
  prompt: { x: 432, y: 252, w: 136, h: 54, t: "BUILD PROMPT", sub: "SHEET 06", does: "The builder puts the instruction, the chunks and the question into one text.", input: "The k chunks and the question.", output: "The augmented prompt.", fail: "If the instruction is missing, the model answers from its memory." },
  llm: { x: 598, y: 252, w: 140, h: 54, t: "LANGUAGE MODEL", sub: "SHEET 07", does: "The model writes the answer from the prompt only.", input: "The augmented prompt.", output: "An answer with chunk identities.", fail: "If the model adds facts that are not in the chunks, the answer is not grounded." },
  answer: { x: 768, y: 252, w: 152, h: 54, t: "ANSWER + REFS", sub: "TO THE PERSON", does: "The answer goes back to the person, with a reference for each fact.", input: "The answer text.", output: "The answer and its references.", fail: "If a sentence has no reference, a person must check it." },
};
const ORDER: BlockKey[] = ["docs", "divide", "embed", "index", "question", "qembed", "search", "prompt", "llm", "answer"];

export function FigSystem() {
  const [sel, setSel] = useState<BlockKey>("search");
  const b = BLOCKS[sel];
  const box = (k: BlockKey) => {
    const o = BLOCKS[k];
    const on = sel === k;
    const key = k === "search";
    return (
      <g key={k} onClick={() => setSel(k)} onMouseEnter={() => setSel(k)} style={{ cursor: "pointer" }}>
        <rect x={o.x} y={o.y} width={o.w} height={o.h} fill={PANEL} />
        <rect x={o.x} y={o.y} width={o.w} height={o.h} fill={on ? "var(--acc-12)" : PANEL} stroke={on || key ? ACC : OLIVE} strokeWidth={on ? 2 : key ? 1.6 : 1.1} />
        {on && <rect x={o.x + 4} y={o.y + 4} width={5} height={5} fill={ACC} />}
        <T x={o.x + 14} y={o.y + 23} size={11} weight={700} fill={on || key ? ACC : INK} halo={null}>{o.t}</T>
        <T x={o.x + 14} y={o.y + 39} size={8.5} fill={on ? INK : OLIVE} halo={null}>{o.sub}</T>
      </g>
    );
  };
  return (
    <div>
      <Wide>
          <svg className="wide" viewBox="0 0 920 350" role="img" aria-label="RAG system: an indexing phase and a question phase share one vector index. Select a block for details.">
          <Arrows id="f2" />
          <T x={0} y={14} size={9} fill={OLIVE} ls={0.18}>A · INDEXING — BEFORE ANYONE ASKS</T>
          <line x1={0} y1={222} x2={600} y2={222} stroke={OLIVE_LT} strokeWidth={1} strokeDasharray="3 4" />
          <T x={0} y={240} size={9} fill={OLIVE} ls={0.18}>B · QUESTION — EACH TIME A PERSON ASKS</T>

          {/* connectors, drawn first so the blocks sit on top */}
          <g fill="none" stroke={OLIVE} strokeWidth={1.4}>
            <path d="M130,67 H164" className="flow slow" markerEnd="url(#f2-a)" />
            <path d="M286,67 H320" className="flow slow" markerEnd="url(#f2-a)" />
            <path d="M442,67 H618" className="flow slow" markerEnd="url(#f2-a)" />
            <path d="M116,279 H144" className="flow" markerEnd="url(#f2-a)" />
            <path d="M402,279 H430" className="flow" markerEnd="url(#f2-a)" />
            <path d="M568,279 H596" className="flow" markerEnd="url(#f2-a)" />
            <path d="M738,279 H766" className="flow" markerEnd="url(#f2-a)" />
            <path d="M58,306 V334 H500 V308" className="flow" markerEnd="url(#f2-a)" />
          </g>
          <g fill="none" stroke={ACC} strokeWidth={1.8}>
            <path d="M256,279 H284" className="flow" markerEnd="url(#f2-k)" />
            <path d="M344,252 V212 H690 V194" className="flow" markerEnd="url(#f2-k)" />
            <path d="M850,194 V232 H500 V250" className="flow" markerEnd="url(#f2-k)" />
          </g>
          <T x={530} y={60} size={8.5} fill={OLIVE} ls={0.1} anchor="middle">VECTOR + CHUNK</T>
          <T x={470} y={207} size={8.5} fill={ACC} weight={700} ls={0.1} anchor="middle">QUESTION VECTOR</T>
          <T x={770} y={227} size={8.5} fill={ACC} weight={700} ls={0.1} anchor="middle">k CHUNKS + IDS</T>
          <T x={280} y={329} size={8.5} fill={OLIVE} ls={0.1} anchor="middle">QUESTION TEXT</T>

          {/* the packet runs behind the blocks, so it shows only on the connectors */}
          <circle className="packet" r={4.5} fill={ACC} stroke={INK} strokeWidth={1}>
            <animateMotion dur="4.2s" repeatCount="indefinite" path="M58,279 H850" />
          </circle>

          {ORDER.map(box)}

          {/* the stored vectors, drawn inside the index */}
          {["C-01", "C-02", "C-03", "C-04", "C-05", "C-06"].map((id, i) => (
            <g key={id}>
              <T x={638} y={88 + i * 16} size={8.5} fill={OLIVE} halo={null}>{id}</T>
              {Array.from({ length: 16 }, (_, j) => (
                <rect key={j} x={676 + j * 14} y={80 + i * 16} width={10} height={10} fill={(i * 7 + j * 3) % 5 === 0 ? OLIVE : PANEL} fillOpacity={(i * 7 + j * 3) % 5 === 0 ? 0.55 : 1} stroke={OLIVE} strokeWidth={0.6} />
              ))}
            </g>
          ))}
          <T x={638} y={184} size={8.5} fill={OLIVE} halo={null}>… C-12 · 384 NUMBERS EACH</T>
        </svg>
      </Wide>

      <div className="ctl-row" style={{ marginTop: 12 }} role="tablist" aria-label="Blocks">
        {ORDER.map((k, i) => (
          <button key={k} type="button" role="tab" className="ctl" aria-pressed={sel === k} aria-selected={sel === k} onClick={() => setSel(k)}>
            {i < 4 ? "A" : "B"}
            {i < 4 ? i + 1 : i - 3} · {BLOCKS[k].t.replace(" + REFS", "")}
          </button>
        ))}
      </div>
      <div className="panel" aria-live="polite">
        <div className="panel-grid">
          <div>
            <h6>What it does</h6>
            <p>{b.does}</p>
          </div>
          <div>
            <h6>Input</h6>
            <p>{b.input}</p>
          </div>
          <div>
            <h6>Output</h6>
            <p>{b.output}</p>
          </div>
        </div>
        <div className="fail">
          <h6>If this block is not correct</h6>
          <p>{b.fail}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 03 — the chunker                                               */
/* ------------------------------------------------------------------ */

const isWord = (c: string | undefined) => !!c && /[A-Za-z0-9]/.test(c);

function cut(text: string, mode: "length" | "sentence", size: number, overlap: number): [number, number][] {
  const L = text.length;
  const out: [number, number][] = [];
  if (mode === "length") {
    let s = 0;
    while (s < L) {
      const e = Math.min(s + size, L);
      out.push([s, e]);
      if (e >= L) break;
      s = Math.max(e - overlap, s + 1);
    }
    return out;
  }
  const sents: [number, number][] = [];
  const re = /[^.]+\.(\s+|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) sents.push([m.index, m.index + m[0].trimEnd().length]);
  // with overlap, the last sentence of a chunk starts the next one, when it fits with at least one new sentence
  let i = 0, carry = -1;
  while (i < sents.length) {
    const start = carry >= 0 && sents[i][1] - sents[carry][0] <= size ? carry : i;
    let j = i;
    while (j + 1 < sents.length && sents[j + 1][1] - sents[start][0] <= size) j++;
    out.push([sents[start][0], sents[j][1]]);
    if (j + 1 >= sents.length) break;
    carry = overlap > 0 ? j : -1;
    i = j + 1;
  }
  return out;
}

export function FigChunker() {
  const [mode, setMode] = useState<"length" | "sentence">("length");
  const [size, setSize] = useState(120);
  const [overlap, setOverlap] = useState(20);
  const text = CHUNKER_TEXT;
  const L = text.length;
  const chunks = useMemo(() => cut(text, mode, size, overlap), [text, mode, size, overlap]);

  // every position where a chunk starts or ends, counted once; a cut is "mid-word" when letters touch it on both sides
  const cuts = new Set<number>();
  chunks.forEach(([s, e]) => {
    if (s > 0) cuts.add(s);
    if (e < L) cuts.add(e);
  });
  const midWord = [...cuts].filter((p) => isWord(text[p - 1]) && isWord(text[p])).length;
  const repeated = chunks.reduce((n, [s], i) => n + (i > 0 ? Math.max(0, chunks[i - 1][1] - s) : 0), 0);

  const X0 = 20, X1 = 740, sx = (v: number) => X0 + ((X1 - X0) * v) / L;
  const rows = chunks.length > 6 ? 3 : 2;
  const H = 62 + rows * 22 + 26;
  const sentenceEnds = [...text.matchAll(/\.(\s|$)/g)].map((m) => m.index! + 1);

  return (
    <div>
      <div className="ctl-row">
        <span className="ctl-lab">Cut</span>
        <button type="button" className="ctl" aria-pressed={mode === "length"} onClick={() => setMode("length")}>By length</button>
        <button type="button" className="ctl" aria-pressed={mode === "sentence"} onClick={() => setMode("sentence")}>By sentence</button>
        <label className="ctl-lab" style={{ marginLeft: 10 }}>
          Size <input className="slider" type="range" min={60} max={220} step={10} value={size} onChange={(e) => setSize(+e.target.value)} /> <b>{size}</b>
        </label>
        {mode === "length" ? (
          <label className="ctl-lab">
            Overlap <input className="slider" type="range" min={0} max={60} step={10} value={overlap} onChange={(e) => setOverlap(+e.target.value)} /> <b>{overlap}</b>
          </label>
        ) : (
          <>
            <span className="ctl-lab">Overlap</span>
            <button type="button" className="ctl" aria-pressed={overlap === 0} onClick={() => setOverlap(0)}>None</button>
            <button type="button" className="ctl" aria-pressed={overlap > 0} onClick={() => setOverlap((v) => v || 20)}>1 sentence</button>
          </>
        )}
      </div>
      <Wide>
          <svg className="wide" viewBox={`0 0 760 ${H}`} role="img" aria-label="Chunks drawn over the length of the text" style={{ marginTop: 12 }}>
          <line x1={X0} y1={30} x2={X1} y2={30} stroke={INK} strokeWidth={1.2} />
          {Array.from({ length: Math.floor(L / 50) + 1 }, (_, k) => k * 50).map((v) => (
            <g key={v}>
              <line x1={sx(v)} y1={v % 100 ? 26 : 22} x2={sx(v)} y2={30} stroke={OLIVE} strokeWidth={1} />
              {v % 100 === 0 && v + 40 < L && <T x={sx(v)} y={16} size={8.5} anchor="middle" fill={OLIVE}>{String(v)}</T>}
            </g>
          ))}
          <T x={X1} y={16} size={8.5} anchor="end" fill={OLIVE}>{`${L} CHARACTERS`}</T>
          {sentenceEnds.map((p) => (
            <line key={p} x1={sx(p)} y1={36} x2={sx(p)} y2={44 + rows * 22} stroke={OLIVE_LT} strokeWidth={1} strokeDasharray="2 3" />
          ))}
          {chunks.map(([s, e], i) => {
            const y = 44 + (i % rows) * 22;
            const prev = chunks[i - 1];
            const next = chunks[i + 1];
            // the number goes in the part that no other chunk shares, when that part is wide enough
            const a = prev && s < prev[1] ? prev[1] : s;
            const b = next && next[0] < e ? next[0] : e;
            return (
              <g key={i}>
                <rect className="slide" x={sx(s)} y={y} width={Math.max(1, sx(e) - sx(s))} height={14} fill={PANEL} stroke={INK} strokeWidth={1.2} />
                {prev && s < prev[1] && <rect className="slide" x={sx(s)} y={y} width={sx(prev[1]) - sx(s)} height={14} fill={ACC} />}
                {next && next[0] < e && <rect className="slide" x={sx(next[0])} y={y} width={sx(e) - sx(next[0])} height={14} fill={ACC} />}
                {sx(b) - sx(a) >= 28 && (
                  <T x={sx(a) + 5} y={y + 10.5} size={8} weight={700} halo={null}>{`#${String(i + 1).padStart(2, "0")}`}</T>
                )}
                {e < L && isWord(text[e - 1]) && isWord(text[e]) && <line x1={sx(e)} y1={y - 3} x2={sx(e)} y2={y + 17} stroke={INK} strokeWidth={2.2} />}
              </g>
            );
          })}
          <T x={X0} y={H - 8} size={8.5} fill={OLIVE}>DOTTED: SENTENCE ENDS</T>
          <rect x={205} y={H - 16} width={14} height={9} fill={ACC} />
          <T x={225} y={H - 8} size={8.5} fill={OLIVE}>OVERLAP: STORED TWO TIMES</T>
          <line x1={420} y1={H - 18} x2={420} y2={H - 6} stroke={INK} strokeWidth={2.2} />
          <T x={428} y={H - 8} size={8.5} fill={OLIVE}>END INSIDE A WORD</T>
        </svg>
      </Wide>

      <div style={{ marginTop: 10, borderLeft: "2px solid var(--ink)", paddingLeft: 12 }}>
        {chunks.map(([s, e], i) => {
          const ovEnd = i > 0 && s < chunks[i - 1][1] ? chunks[i - 1][1] : s;
          const startCut = s > 0 && isWord(text[s - 1]) && isWord(text[s]);
          const endCut = e < L && isWord(text[e - 1]) && isWord(text[e]);
          return (
            <div key={`${mode}-${i}`} className="appear" style={{ animationDelay: `${i * 40}ms`, padding: "3px 0", borderBottom: "1px dashed var(--rule)", fontSize: 11.5, lineHeight: 1.7 }}>
              <span style={{ display: "inline-block", minWidth: "5.6em", marginRight: 10, fontSize: 9, letterSpacing: "0.14em", color: "var(--olive)", fontWeight: 600 }}>
                #{String(i + 1).padStart(2, "0")} · {e - s}
              </span>
              {startCut && <b style={{ color: ACC }}>¦</b>}
              {ovEnd > s && <span style={{ color: ACC, borderBottom: "2px solid var(--acc)" }}>{text.slice(s, ovEnd)}</span>}
              {text.slice(ovEnd, e)}
              {endCut && <b style={{ color: ACC }}>¦</b>}
            </div>
          );
        })}
      </div>
      <dl className="ro">
        <div>
          <dt>Source</dt>
          <dd>{L} characters</dd>
        </div>
        <div>
          <dt>Chunks</dt>
          <dd>{chunks.length}</dd>
        </div>
        <div>
          <dt>Average</dt>
          <dd>{Math.round(chunks.reduce((n, [s, e]) => n + e - s, 0) / chunks.length)} characters</dd>
        </div>
        <div>
          <dt>Stored two times</dt>
          <dd>{repeated} characters</dd>
        </div>
        <div>
          <dt>Cuts inside a word</dt>
          <dd className={midWord ? "a" : undefined}>
            {midWord} of {cuts.size}
          </dd>
        </div>
      </dl>
    </div>
  );
}
