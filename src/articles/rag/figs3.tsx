/** Figures 07–09 of RAG-100: the end-to-end run, the evaluation, the fault-isolation ladder. */

import { useEffect, useMemo, useState } from "react";
import { useInView } from "./chrome";
import { ANSWERS, ASK, CHUNKS, QUESTIONS, THRESHOLD } from "./data";
import { evaluate, IDS, kept, search } from "./engine";
import { Presets, SHORT } from "./figs2";

const ACC = "var(--acc)";
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** reveal text one token at a time; under reduced motion, all at once */
function useStream(text: string, run: boolean, msPerToken = 55) {
  const parts = useMemo(() => text.split(/(\s+)/), [text]);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) {
      setN(0);
      return;
    }
    if (reduced()) {
      setN(parts.length);
      return;
    }
    let i = 0;
    setN(0);
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= parts.length) clearInterval(id);
    }, msPerToken);
    return () => clearInterval(id);
  }, [parts, run]);
  return { shown: parts.slice(0, n).join(""), done: n >= parts.length };
}

/* ------------------------------------------------------------------ */
/* FIG. 07 — one question, from search to answer                        */
/* ------------------------------------------------------------------ */

const REFUSAL = "The documents do not contain the answer.";

export function FigRun() {
  const [qi, setQi] = useState(2);
  const [run, setRun] = useState(0);
  const [stage, setStage] = useState(0);
  const on = useInView();
  const q = ASK[qi];
  const top = search(q, "meaning")!.slice(0, 3);
  const keep = kept(q);
  const answer = ANSWERS[qi];
  const text = keep.length ? answer.sentences.map(([id, s]) => `${s} [${id}]`).join(" ") : REFUSAL;

  // the four steps light up in turn when the figure is on screen, or when RUN is pressed
  useEffect(() => {
    if (!on) return;
    if (reduced()) {
      setStage(4);
      return;
    }
    setStage(0);
    const ids = [1, 2, 3, 4].map((s) => setTimeout(() => setStage(s), s * 550));
    return () => ids.forEach(clearTimeout);
  }, [on, qi, run]);
  const { shown, done } = useStream(text, stage >= 4);

  const cited = [...new Set(answer.sentences.map(([id]) => id))];
  const gold = QUESTIONS[qi]?.gold;
  const verdict = !gold
    ? keep.length
      ? { ok: false, t: "The writer gave an answer to a question that has no answer." }
      : { ok: true, t: `Refused: no chunk reaches ${THRESHOLD}. This is the correct result.` }
    : cited.includes(gold)
      ? { ok: true, t: `The answer cites the gold chunk, ${gold}.` }
      : { ok: false, t: `The answer cites ${cited.join(", ")}, but the gold chunk is ${gold}. The search failed (Sheet 09).` };

  const card = (n: number, title: string, body: React.ReactNode) => (
    <div style={{ border: `1px solid ${stage === n ? "var(--acc)" : "var(--rule-2)"}`, background: "var(--panel)", minWidth: 0, transition: "border-color .3s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid var(--rule-2)", fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase" }}>
        <b style={{ color: stage >= n ? ACC : "var(--olive)" }}>
          Step {String(n).padStart(2, "0")} · {title}
        </b>
        <span style={{ color: stage >= n ? "var(--ink)" : "var(--olive)" }}>{stage > n || (n === 4 && done) ? "DONE" : stage === n ? "RUN" : "WAIT"}</span>
      </div>
      <div style={{ padding: "8px 10px", fontSize: 11.5, lineHeight: 1.65, opacity: stage >= n ? 1 : 0.35, transition: "opacity .3s" }}>{body}</div>
    </div>
  );

  return (
    <div>
      <Presets value={qi} onPick={setQi} />
      <div className="ctl-row" style={{ marginTop: 8 }}>
        <button type="button" className="ctl" aria-pressed={false} onClick={() => setRun((r) => r + 1)}>
          ▶ Run again
        </button>
        <span className="ctl-lab">Meaning search · keep the best 3 with cosine ≥ {THRESHOLD}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 12 }}>
        {card(
          1,
          "Search",
          <>
            {top.map((h) => (
              <div key={h.id} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span>
                  <b>{h.id}</b> {CHUNKS[h.index].title}
                </span>
                <span style={{ color: h.score >= THRESHOLD ? ACC : "var(--olive)", fontWeight: 600 }}>{h.score.toFixed(3)}</span>
              </div>
            ))}
          </>,
        )}
        {card(
          2,
          "Keep",
          keep.length ? (
            <>
              {keep.map((id) => (
                <div key={id}>
                  <b style={{ color: ACC }}>{id}</b> passes {THRESHOLD}
                </div>
              ))}
              {top.length > keep.length && <div style={{ color: "var(--olive)" }}>{top.length - keep.length} chunk{top.length - keep.length > 1 ? "s" : ""} under the threshold</div>}
            </>
          ) : (
            <b style={{ color: ACC }}>No chunk passes {THRESHOLD}.</b>
          ),
        )}
        {card(
          3,
          "Prompt",
          <>
            <div style={{ color: "var(--olive)" }}>Instruction: use only the chunks; cite each one.</div>
            <div>Chunks: {keep.length ? keep.map((id) => `[${id}]`).join(" ") : "none"}</div>
            <div>Question: {q}</div>
          </>,
        )}
        {card(
          4,
          "Write",
          <div aria-live="polite" style={{ minHeight: "4.5em" }}>
            {shown.split(/(\[C-\d\d\])/).map((part, i) =>
              /^\[C-\d\d\]$/.test(part) ? (
                <b key={i} style={{ color: ACC }}>
                  {part}
                </b>
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
            {stage >= 4 && !done && <span className="caret" aria-hidden="true" />}
          </div>,
        )}
      </div>
      <div
        className="appear"
        key={`${qi}-${run}-${done}`}
        style={{
          marginTop: 10, padding: "8px 12px", fontSize: 11.5, letterSpacing: "0.04em",
          borderLeft: `3px solid ${verdict.ok ? "var(--olive)" : "var(--acc)"}`, background: verdict.ok ? "var(--panel)" : "var(--acc-12)",
          visibility: done ? "visible" : "hidden",
        }}
      >
        <b style={{ marginRight: 8, fontSize: 9.5, letterSpacing: "0.2em", color: verdict.ok ? "var(--ink)" : ACC }}>{verdict.ok ? "CHECK OK" : "CHECK FAILED"}</b>
        {verdict.t}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 08 — the rank of each gold chunk, for each search               */
/* ------------------------------------------------------------------ */

export function FigEval() {
  const on = useInView();
  const e = useMemo(() => evaluate(), []);
  const cell = (r: number | null, row: number, col: number) => {
    const style: React.CSSProperties =
      r === 1
        ? { background: "var(--acc)", color: "#fff", fontWeight: 700 }
        : r !== null && r <= 3
          ? { boxShadow: "inset 0 0 0 1.5px var(--acc)", color: ACC, fontWeight: 700 }
          : r !== null
            ? { color: "var(--ink)", fontWeight: 700, boxShadow: "inset 0 0 0 1px var(--rule-2)" }
            : { background: "repeating-linear-gradient(45deg, transparent 0 4px, rgba(103,109,82,.28) 4px 5px)", color: "var(--olive)" };
    return (
      <td key={col} style={{ textAlign: "center", padding: 4 }}>
        <span className={on ? "appear" : undefined} style={{ display: "block", padding: "3px 0", animationDelay: `${row * 70 + col * 25}ms`, opacity: on ? undefined : 0, ...style }}>
          {r ?? "—"}
        </span>
      </td>
    );
  };
  const names = ["Keyword · BM25", "Meaning · cosine", "Hybrid · fusion"];
  const best = (vals: number[]) => Math.max(...vals);
  const r1 = e.measures.map((m) => m.r1), r3 = e.measures.map((m) => m.r3), mrr = e.measures.map((m) => m.mrr);
  return (
    <div>
      <div className="tw">
        <table className="tbl" style={{ minWidth: 600 }}>
          <thead>
            <tr>
              <th>Question</th>
              <th>Gold</th>
              {names.map((n) => (
                <th key={n} style={{ textAlign: "center" }}>
                  {n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {QUESTIONS.map((item, i) => (
              <tr key={item.q}>
                <td title={item.q}>{item.q}</td>
                <td className="k">{item.gold}</td>
                {e.rows[i].map((r, c) => cell(r, i, c))}
              </tr>
            ))}
            {[
              ["Recall@1", r1.map((v) => `${v}/${e.n}`), r1],
              ["Recall@3", r3.map((v) => `${v}/${e.n}`), r3],
              ["MRR", mrr.map((v) => v.toFixed(3)), mrr],
            ].map(([label, shown, vals]) => (
              <tr key={label as string}>
                <td className="k" colSpan={2} style={{ background: "var(--paper-2)" }}>
                  {label as string}
                </td>
                {(shown as string[]).map((s, c) => (
                  <td key={c} style={{ textAlign: "center", background: "var(--paper-2)", fontWeight: 700, color: (vals as number[])[c] === best(vals as number[]) ? ACC : "var(--ink)" }}>
                    {s}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ctl-row" style={{ marginTop: 10, fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--olive)", gap: 16 }}>
        <span>
          <span style={{ display: "inline-block", width: 14, height: 10, background: "var(--acc)", verticalAlign: -1, marginRight: 6 }} />
          Rank 1
        </span>
        <span>
          <span style={{ display: "inline-block", width: 14, height: 10, boxShadow: "inset 0 0 0 1.5px var(--acc)", verticalAlign: -1, marginRight: 6 }} />
          Rank 2–3
        </span>
        <span>
          <span style={{ display: "inline-block", width: 14, height: 10, boxShadow: "inset 0 0 0 1px var(--rule-2)", verticalAlign: -1, marginRight: 6 }} />
          Rank 4 or lower
        </span>
        <span>
          <span style={{ display: "inline-block", width: 14, height: 10, background: "repeating-linear-gradient(45deg, transparent 0 4px, rgba(103,109,82,.4) 4px 5px)", verticalAlign: -1, marginRight: 6 }} />
          Not found
        </span>
        <span>Computed in this page by the engine of Exhibit C · {IDS.length} chunks</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 09 — the fault-isolation ladder                                 */
/* ------------------------------------------------------------------ */

const STEPS = [
  { q: "Is the answer in the documents?", fault: "The documents do not contain the fact.", fix: "Add the document to the index. Until then, the system must refuse." },
  { q: "Did the search keep the gold chunk?", fault: "The gold chunk is not in the top k, or its score is under the threshold.", fix: "Use hybrid search. Change the chunk size or k. Add a reranker." },
  { q: "Is the chunk complete in the prompt?", fault: "The prompt builder or the budget removed it.", fix: "Decrease k. Put the best chunk first. Keep the instruction." },
  { q: "Does each sentence cite a chunk that supports it?", fault: "The model added facts, or the instruction is weak.", fix: "Make the instruction stricter. Set the temperature to 0. Use a stronger model." },
];

export function FigLadder() {
  const [ans, setAns] = useState<(boolean | null)[]>([null, null, null, null]);
  const set = (i: number, v: boolean) => setAns((a) => a.map((x, j) => (j < i ? x : j === i ? v : null)));
  const reach = ans.findIndex((a) => a !== true); // the first step without a YES
  const allYes = ans.every((a) => a === true);
  return (
    <div>
      <div className="ctl-row">
        <span className="ctl-lab">Example</span>
        <button type="button" className="ctl q" onClick={() => setAns([true, false, null, null])}>
          {SHORT[6]} (Fig. 07)
        </button>
        <button type="button" className="ctl q" onClick={() => setAns([false, null, null, null])}>
          {SHORT[12]}
        </button>
        <button type="button" className="ctl" onClick={() => setAns([null, null, null, null])}>
          Reset
        </button>
      </div>
      <div style={{ marginTop: 14 }}>
        {STEPS.map((s, i) => {
          const visible = i === 0 || ans[i - 1] === true;
          if (!visible) return null;
          const a = ans[i];
          return (
            <div key={i} className="appear">
              {i > 0 && (
                <div style={{ marginLeft: 22, height: 22, borderLeft: "2px solid var(--acc)", fontSize: 9, letterSpacing: "0.18em", color: ACC, paddingLeft: 8, display: "flex", alignItems: "center" }}>
                  YES
                </div>
              )}
              <div className="ladder-row">
                <div style={{ border: `1.5px solid ${a === null ? "var(--acc)" : "var(--ink)"}`, background: a === null ? "var(--acc-12)" : "var(--panel)", padding: "9px 12px" }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.18em", color: ACC }}>Q{i + 1}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, margin: "2px 0 8px" }}>{s.q}</div>
                  <div className="ctl-row">
                    <button type="button" className="ctl" aria-pressed={a === true} onClick={() => set(i, true)}>
                      Yes
                    </button>
                    <button type="button" className="ctl" aria-pressed={a === false} onClick={() => set(i, false)}>
                      No
                    </button>
                  </div>
                </div>
                {a === false ? (
                  <div className="appear" style={{ border: "1.5px solid var(--acc)", padding: "9px 12px", background: "var(--panel)" }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.18em", color: ACC }}>FAULT</div>
                    <div style={{ fontSize: 12, margin: "2px 0 6px" }}>{s.fault}</div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.18em" }}>CORRECTION</div>
                    <div style={{ fontSize: 12, color: "var(--ink-70)" }}>{s.fix}</div>
                  </div>
                ) : (
                  <div className="ladder-hint" style={{ border: "1px dashed var(--rule-2)", padding: "9px 12px", fontSize: 11, color: "var(--olive)", display: "flex", alignItems: "center" }}>
                    {a === true ? "Yes: go to the next check." : reach === i ? "Answer the check. A NO shows the fault and its correction." : ""}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {allYes && (
          <div className="appear" style={{ marginTop: 12, borderLeft: "3px solid var(--olive)", background: "var(--panel)", padding: "8px 12px", fontSize: 12 }}>
            <b style={{ marginRight: 8, fontSize: 9.5, letterSpacing: "0.2em" }}>NO FAULT</b>
            Each sentence of the answer cites a chunk that supports it.
          </div>
        )}
      </div>
    </div>
  );
}
