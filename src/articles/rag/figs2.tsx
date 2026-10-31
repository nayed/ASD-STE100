/** Figures 04–06 of RAG-100: the embedding plane, the live retriever, the prompt and its budget. */

import { useMemo, useState } from "react";
import { useInView } from "./chrome";
import { ASK, CHUNKS, COS, PROJ_CHUNKS, PROJ_QUESTIONS, QUESTIONS, THRESHOLD } from "./data";
import { IDS, INSTRUCTION, MANUAL, search, shared, tokens, words, type Method } from "./engine";
import { T, Wide } from "./figs1";

const INK = "var(--ink)", OLIVE = "var(--olive)", OLIVE_LT = "var(--olive-lt)", PANEL = "var(--panel)", ACC = "var(--acc)";

/** short names for the preset questions (same order as ASK) */
export const SHORT = [
  "Max pressure", "Replace filter", "Swap cartridge", "Too hot", "Where", "Torque", "300 flight hours",
  "Which oil", "Make safe", "Loud noise", "Motor current", "Drops at fittings", "Altitude (no answer)",
];

export function Presets({ value, onPick, include = true }: { value: number; onPick: (i: number) => void; include?: boolean }) {
  const n = include ? ASK.length : QUESTIONS.length;
  return (
    <div className="ctl-row">
      <span className="ctl-lab">Question</span>
      {ASK.slice(0, n).map((q, i) => (
        <button key={q} type="button" className="ctl q" aria-pressed={value === i} title={q} onClick={() => onPick(i)}>
          {SHORT[i]}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 04 — the embedding plane                                       */
/* ------------------------------------------------------------------ */

const px = (x: number) => 240 + x * 290;
const py = (y: number) => 215 - y * 175;
/** label offsets for the twelve dots, placed by hand around the real positions */
const LABEL: Record<string, [number, number, "start" | "end"]> = {
  "C-01": [-12, 4, "end"], "C-02": [11, 4, "start"], "C-12": [-11, -6, "end"], "C-04": [-11, 4, "end"],
  "C-08": [11, 4, "start"], "C-09": [11, 6, "start"], "C-10": [11, 4, "start"], "C-06": [11, 4, "start"],
  "C-05": [11, 4, "start"], "C-11": [11, 4, "start"], "C-03": [11, 4, "start"], "C-07": [11, 4, "start"],
};

export function FigPlane() {
  const [qi, setQi] = useState(2);
  const on = useInView();
  const row = COS[qi];
  const ranked = IDS.map((id, i) => ({ id, i, cos: row[i] })).sort((a, b) => b.cos - a.cos);
  const rankOf = new Map(ranked.map((r, n) => [r.id, n]));
  const [qx, qy] = PROJ_QUESTIONS[qi];
  const Q = { x: px(qx), y: py(qy) };
  const gold = QUESTIONS[qi]?.gold;
  const LX = 548, RY = 46, RH = 21, G = 14; // the ranked list; G opens a gap at the threshold
  const cut = ranked.findIndex((r) => r.cos < THRESHOLD);
  const rowY = (n: number) => RY + n * RH + (cut >= 0 && n >= cut ? G : 0);

  return (
    <div>
      <Presets value={qi} onPick={setQi} />
      <Wide>
          <svg className="wide" viewBox="0 0 760 346" role="img" aria-label={`Embedding plane for the question: ${ASK[qi]}`} style={{ marginTop: 12 }}>
          <T x={0} y={14} size={9} fill={OLIVE} ls={0.16}>QUESTION</T>
          <T x={76} y={14} size={10.5} weight={700}>{`“${ASK[qi]}”`}</T>
          <rect x={0} y={26} width={520} height={300} fill="none" stroke={"var(--rule-2)"} strokeWidth={1} />

          {/* lines from the question to its three nearest chunks, drawn in rank order */}
          {on &&
            ranked.slice(0, 3).map((r, n) => {
              const [cx, cy] = PROJ_CHUNKS[r.i];
              const len = Math.hypot(px(cx) - Q.x, py(cy) - Q.y);
              return (
                <line
                  key={`${qi}-${r.id}`}
                  className="draw"
                  style={{ ["--len" as string]: len, animationDelay: `${n * 0.25}s` }}
                  x1={Q.x} y1={Q.y} x2={px(cx)} y2={py(cy)}
                  stroke={n === 0 ? ACC : INK} strokeWidth={n === 0 ? 2 : 1.2} strokeDasharray={len}
                />
              );
            })}

          {/* labels on a patch of the panel colour, so a line to another chunk passes under them; dots on top */}
          {CHUNKS.map((c, i) => {
            const [x, y] = PROJ_CHUNKS[i];
            const n = rankOf.get(c.id)!;
            const [dx, dy, anchor] = LABEL[c.id];
            const lx = px(x) + dx;
            return (
              <g key={c.id}>
                <rect x={anchor === "end" ? lx - 27 : lx - 2} y={py(y) + dy - 8.5} width={29} height={11} fill={PANEL} />
                <T x={lx} y={py(y) + dy} size={9} anchor={anchor} weight={n < 3 ? 700 : 400} fill={n < 3 ? INK : OLIVE}>{c.id}</T>
              </g>
            );
          })}
          {CHUNKS.map((c, i) => {
            const [x, y] = PROJ_CHUNKS[i];
            const n = rankOf.get(c.id)!;
            return <circle key={c.id} cx={px(x)} cy={py(y)} r={n === 0 ? 6 : 4.5} fill={n === 0 ? ACC : n < 3 ? INK : PANEL} stroke={n < 3 ? INK : OLIVE} strokeWidth={1.3} />;
          })}

          {/* the question point moves to its new place */}
          <g className="slide" style={{ transform: `translate(${Q.x}px, ${Q.y}px)` }}>
            <rect x={-6} y={-6} width={12} height={12} transform="rotate(45)" fill={ACC} stroke={INK} strokeWidth={1.5} />
            <T x={10} y={-8} size={10} weight={700} fill={ACC}>Q</T>
          </g>
          <T x={0} y={342} size={8.5} fill={OLIVE}>2-D PROJECTION (PCA) OF THE REAL 384-NUMBER VECTORS</T>

          {/* the ranked list: every chunk, by cosine, with the threshold */}
          <T x={LX} y={RY - 18} size={9} fill={OLIVE} ls={0.16}>RANK · CHUNK · COSINE</T>
          {ranked.map((r, n) => {
            const fill = n === 0 ? ACC : n < 3 ? INK : OLIVE, weight = n < 3 ? 700 : 400;
            return (
              <g key={r.id} className="slide" style={{ transform: `translate(0px, ${rowY(n)}px)` }}>
                <T x={LX} y={4} size={9.5} fill={fill} weight={weight} halo={null}>{String(n + 1).padStart(2, "0")}</T>
                <T x={LX + 24} y={4} size={9.5} fill={fill} weight={weight} halo={null}>{r.id}</T>
                <T x={LX + 66} y={4} size={9} ls={0.04} fill={fill} weight={weight} halo={null}>{CHUNKS[r.i].title.toUpperCase()}</T>
                <T x={760} y={4} size={9.5} anchor="end" fill={fill} weight={weight} halo={null}>{r.cos.toFixed(3)}</T>
                {r.id === gold && <rect x={LX - 12} y={-4} width={6} height={6} fill={INK} />}
              </g>
            );
          })}
          {cut >= 0 && (
            <g className="slide" style={{ transform: `translate(0px, ${RY + cut * RH - 2}px)` }}>
              <line x1={LX - 14} y1={0} x2={760} y2={0} stroke={ACC} strokeWidth={1.2} strokeDasharray="4 3" />
              <T x={760} y={3} size={8} anchor="end" fill={ACC} weight={700}>{cut === 0 ? `THRESHOLD ${THRESHOLD} · NO CHUNK ABOVE IT` : `THRESHOLD ${THRESHOLD}`}</T>
            </g>
          )}
        </svg>
      </Wide>
      <dl className="ro">
        <div>
          <dt>Nearest chunk</dt>
          <dd className="a">
            {ranked[0].id} · cos {ranked[0].cos.toFixed(3)}
          </dd>
        </div>
        <div>
          <dt>Gold chunk</dt>
          <dd>{gold ? `${gold} · rank ${rankOf.get(gold)! + 1}` : "none: no answer"}</dd>
        </div>
        <div>
          <dt>Shared words</dt>
          <dd>{gold ? shared(MANUAL, ASK[qi], IDS.indexOf(gold)).join(" · ") || "none" : "—"}</dd>
        </div>
        <div>
          <dt>Kept (≥ {THRESHOLD})</dt>
          <dd>{ranked.slice(0, 3).filter((r) => r.cos >= THRESHOLD).map((r) => r.id).join(" · ") || "none"}</dd>
        </div>
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 05 — the live retriever                                        */
/* ------------------------------------------------------------------ */

export function FigRetriever() {
  const [q, setQ] = useState(ASK[6]);
  const [method, setMethod] = useState<Method>("keyword");
  const [k, setK] = useState(3);
  const preset = ASK.indexOf(q);
  const measured = preset >= 0;
  const m: Method = measured ? method : "keyword";
  const hits = useMemo(() => search(q, m)!, [q, m]);
  const max = Math.max(1e-9, ...hits.map((h) => h.score));
  const gold = QUESTIONS[preset]?.gold;
  const goldRank = gold ? hits.find((h) => h.id === gold)?.rank : undefined;
  // for the hybrid view: the rank of each chunk in the two searches that it fuses
  const parts = useMemo(() => {
    if (m !== "hybrid") return null;
    const rk = (x: Method) => new Map(search(q, x)!.map((h) => [h.id, h.rank]));
    return { kw: rk("keyword"), mn: rk("meaning") };
  }, [q, m]);

  return (
    <div>
      <div className="ctl-row">
        <input className="inp" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Question" autoComplete="off" spellCheck={false} />
        <span className="ctl-lab">k</span>
        {[1, 3, 5].map((n) => (
          <button key={n} type="button" className="ctl" aria-pressed={k === n} onClick={() => setK(n)}>
            {n}
          </button>
        ))}
      </div>
      <div className="ctl-row" style={{ marginTop: 8 }}>
        <span className="ctl-lab">Search</span>
        {(["keyword", "meaning", "hybrid"] as Method[]).map((x) => (
          <button key={x} type="button" className="ctl" aria-pressed={m === x} disabled={!measured && x !== "keyword"} onClick={() => setMethod(x)}>
            {x === "keyword" ? "Keyword · BM25" : x === "meaning" ? "Meaning · cosine" : "Hybrid · fusion"}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <Presets value={preset} onPick={(i) => setQ(ASK[i])} />
      </div>
      {!measured && (
        <p className="fig-note" style={{ marginTop: 8 }}>
          Meaning search needs the embedding model, and this page does not run it. Select a preset question to compare the
          three searches.
        </p>
      )}
      {/* the card file: the k best cards rise out of the drawer, each with its rank */}
      <div className="drawer" aria-hidden="true">
        <div className="dr-cards">
          {CHUNKS.map((c) => {
            const r = hits.findIndex((h) => h.id === c.id);
            const up = r >= 0 && r < k;
            return (
              <div key={c.id} className={`dr-card${up ? " up" : ""}${c.id === gold ? " gold" : ""}`} title={`${c.id} · ${c.title}`}>
                {up && <span className="dr-rank">{r + 1}</span>}
                <span className="dr-no">{c.id.slice(2)}</span>
              </div>
            );
          })}
        </div>
        <div className="dr-front">
          <span>Card file · {CHUNKS.length} cards</span>
          <span>
            {Math.min(k, hits.length)} pulled · rank on top
            {gold && (
              <>
                {" · "}
                <i className="gold-key" /> gold
              </>
            )}
          </span>
        </div>
      </div>
      <div className="tw" style={{ marginTop: 12 }}>
        <table className="tbl" style={{ minWidth: 620 }}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Chunk</th>
              <th>Title</th>
              <th style={{ width: "28%" }}>Score</th>
              <th>Value</th>
              <th>{m === "keyword" ? "Shared words" : m === "hybrid" ? "Ranks fused" : "Note"}</th>
            </tr>
          </thead>
          <tbody>
            {hits.map((h, n) => {
              const inK = n < k;
              const kwr = parts?.kw.get(h.id);
              const mnr = parts?.mn.get(h.id);
              return [
                <tr key={h.id} style={{ opacity: inK ? 1 : 0.55 }}>
                  <td>{String(n + 1).padStart(2, "0")}</td>
                  <td className={inK ? "k a" : "k"}>{h.id}</td>
                  <td>
                    {CHUNKS[h.index].title}
                    {h.id === gold && (
                      <b style={{ marginLeft: 8, fontSize: 9, letterSpacing: "0.14em", border: "1px solid var(--ink)", padding: "0 4px" }}>GOLD</b>
                    )}
                  </td>
                  <td>
                    <span style={{ display: "block", height: 9, border: "1px solid var(--rule-2)" }}>
                      <span className="grow" style={{ display: "block", height: "100%", width: `${(h.score / max) * 100}%`, background: inK ? ACC : OLIVE_LT }} />
                    </span>
                  </td>
                  <td>{m === "hybrid" ? h.score.toFixed(4) : h.score.toFixed(3)}</td>
                  <td>
                    {m === "keyword"
                      ? shared(MANUAL, q, h.index).join(" · ")
                      : m === "hybrid"
                        ? `keyword ${kwr ?? "—"} · meaning ${mnr}`
                        : h.score >= THRESHOLD
                          ? "above the threshold"
                          : ""}
                  </td>
                </tr>,
                n === k - 1 && n < hits.length - 1 && (
                  <tr key={`cut-${h.id}`}>
                    <td colSpan={6} style={{ padding: "2px 0", borderBottom: "1.5px dashed var(--ink)", fontSize: 9, letterSpacing: "0.2em", color: "var(--ink)" }}>
                      CUT · k = {k} · THE ROWS UNDER THIS LINE DO NOT GO TO THE MODEL
                    </td>
                  </tr>
                ),
              ];
            })}
          </tbody>
        </table>
      </div>
      {m === "keyword" && hits.length === 0 && (
        <p className="call warning" style={{ marginTop: 10 }}>
          <b>[WARNING]</b>No chunk shares a word with the question. Keyword search returns nothing.
        </p>
      )}
      <dl className="ro">
        <div>
          <dt>Question words</dt>
          <dd>{words(q).join(" · ") || "—"}</dd>
        </div>
        <div>
          <dt>Chunks with a score</dt>
          <dd>
            {hits.length} of {CHUNKS.length}
          </dd>
        </div>
        <div>
          <dt>Gold chunk</dt>
          <dd className={gold && goldRank !== 1 ? "a" : undefined}>
            {gold ? `${gold} · ${goldRank ? `rank ${goldRank}` : "not found"}` : measured ? "none: no answer" : "unknown"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 06 — the prompt, and the context budget                        */
/* ------------------------------------------------------------------ */

export function FigPrompt() {
  const [qi, setQi] = useState(0);
  const [k, setK] = useState(3);
  const [n, setN] = useState(5);
  const [size, setSize] = useState(400);
  const top = useMemo(() => search(ASK[qi], "meaning")!.slice(0, k), [qi, k]);

  // the budget strip uses example sizes: real chunks are 200 to 800 tokens long
  const W = 8192;
  const seg = [
    { t: "INSTRUCTION", v: 350, cls: "plain" },
    { t: "CONVERSATION", v: 1200, cls: "plain" },
    { t: "CHUNKS", v: n * size, cls: "acc" },
    { t: "QUESTION", v: 40, cls: "plain" },
    { t: "ANSWER SPACE", v: 1024, cls: "hatch" },
  ];
  const total = seg.reduce((s, x) => s + x.v, 0);
  const over = total - W;
  const X0 = 20, SC = 600 / W;
  // the segments, cut at the right edge of the drawing
  let x = X0;
  const segs = seg
    .map((s, i) => {
      const at = x;
      const w = Math.max(0, Math.min(s.v * SC, 740 - x));
      x += s.v * SC;
      const label = `${s.t} ${s.v.toLocaleString("en-US")}`;
      // label width with some margin: 0.68em per character in Plex Mono, more in a fallback font
      return { ...s, at, w, up: i % 2 === 1, label, lw: label.length * 6.1, cx: at + w / 2 };
    })
    .filter((s) => s.w > 0);
  // labels in two rows (above and below); push them apart so that small segments do not stack their labels
  for (const up of [true, false]) {
    const row = segs.filter((s) => s.up === up);
    let edge = 2;
    for (const s of row) {
      s.cx = Math.max(s.cx - s.lw / 2, edge) + s.lw / 2;
      edge = s.cx + s.lw / 2 + 12;
    }
    edge = 758;
    for (const s of row.reverse()) {
      s.cx = Math.min(s.cx + s.lw / 2, edge) - s.lw / 2;
      edge = s.cx - s.lw / 2 - 12;
    }
  }

  return (
    <div>
      <Presets value={qi} onPick={setQi} include={false} />
      <div className="ctl-row" style={{ marginTop: 8 }}>
        <span className="ctl-lab">Chunks in the prompt (k)</span>
        {[1, 2, 3, 4, 5].map((v) => (
          <button key={v} type="button" className="ctl" aria-pressed={k === v} onClick={() => setK(v)}>
            {v}
          </button>
        ))}
      </div>
      <div className="ex" style={{ marginTop: 12 }}>
        <div className="ex-bar">
          <span>The augmented prompt</span>
          <span>
            {k} chunk{k > 1 ? "s" : ""} · about {tokens(INSTRUCTION + top.map((h) => CHUNKS[h.index].text).join(" ") + ASK[qi])} tokens
          </span>
        </div>
        <pre style={{ padding: "12px 14px", whiteSpace: "pre-wrap" }}>
          <b style={{ color: ACC }}>INSTRUCTION</b>
          {"\n"}
          {INSTRUCTION}
          {"\n\n"}
          <b style={{ color: ACC }}>CHUNKS</b>
          {"\n"}
          {top.map((h, i) => (
            <span key={`${qi}-${k}-${h.id}`} className="appear" style={{ display: "block", animationDelay: `${i * 0.12}s` }}>
              [{h.id}] {CHUNKS[h.index].title} — {CHUNKS[h.index].text}
            </span>
          ))}
          {"\n"}
          <b style={{ color: ACC }}>QUESTION</b>
          {"\n"}
          {ASK[qi]}
        </pre>
      </div>

      <div className="ctl-row" style={{ marginTop: 18 }}>
        <span className="ctl-lab">Budget · chunks</span>
        <button type="button" className="ctl" onClick={() => setN((v) => Math.max(1, v - 1))} aria-label="Fewer chunks">−</button>
        <b style={{ minWidth: 24, textAlign: "center" }}>{n}</b>
        <button type="button" className="ctl" onClick={() => setN((v) => Math.min(20, v + 1))} aria-label="More chunks">+</button>
        <span className="ctl-lab" style={{ marginLeft: 10 }}>Tokens per chunk</span>
        {[200, 400, 800].map((v) => (
          <button key={v} type="button" className="ctl" aria-pressed={size === v} onClick={() => setSize(v)}>
            {v}
          </button>
        ))}
      </div>
      <Wide>
          <svg className="wide" viewBox="0 0 760 150" role="img" aria-label="Context window budget" style={{ marginTop: 10 }}>
          <defs>
            <pattern id="f6-h" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <rect width="6" height="6" fill={PANEL} />
              <line x1="0" y1="0" x2="0" y2="6" stroke={OLIVE_LT} strokeWidth="1.2" />
            </pattern>
          </defs>
          <rect x={X0} y={36} width={W * SC} height={42} fill="none" stroke={INK} strokeWidth={2} />
          {segs.map((s) => (
            <g key={s.t}>
              <rect className="grow" x={s.at} y={40} width={s.w} height={34} fill={s.cls === "acc" ? ACC : s.cls === "hatch" ? "url(#f6-h)" : PANEL} stroke={INK} strokeWidth={1} />
              <line x1={s.at + s.w / 2} y1={s.up ? 40 : 74} x2={s.cx} y2={s.up ? 28 : 88} stroke={OLIVE} strokeWidth={1} />
              <T x={s.cx} y={s.up ? 22 : 100} size={8.5} anchor="middle" fill={s.cls === "acc" ? ACC : INK} weight={s.cls === "acc" ? 700 : 400}>
                {s.label}
              </T>
            </g>
          ))}
          <line x1={X0 + W * SC} y1={14} x2={X0 + W * SC} y2={118} stroke={INK} strokeWidth={1.4} strokeDasharray="5 3" />
          <T x={X0 + W * SC + 6} y={10} size={8.5} fill={over > 0 ? ACC : OLIVE} weight={over > 0 ? 700 : 400}>
            {over > 0 ? `OVER BY ${over.toLocaleString("en-US")}` : `FREE ${(-over).toLocaleString("en-US")}`}
          </T>
          <T x={X0} y={140} size={8.5} fill={OLIVE}>CONTEXT WINDOW 8,192 TOKENS · EXAMPLE SIZES · HATCHED: SPACE FOR THE ANSWER</T>
        </svg>
      </Wide>
    </div>
  );
}
