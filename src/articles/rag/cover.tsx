/** The cover of RAG-100: masthead, the real embedding of the title, and a search over this dossier. */

import { useEffect, useMemo, useState } from "react";
import { DOC, ISSUED, REV } from "./chrome";
import { DIMS, MODEL, RUN, TITLE_VECTOR } from "./data";
import { bm25, buildIndex, type Index } from "./engine";

export function Masthead() {
  return (
    <header id="top" className="mast">
      <div className="mast-top">
        <span className="tag-ink">Technical description</span>
        <span className="muted">General</span>
        <span className="muted">Description and operation</span>
        <span className="right">English — simplified</span>
      </div>
      <div className="mast-grid">
        <div>
          <div className="kicker">ATA 46 · Information systems</div>
          <h1 className="title">
            <span>Retrieval-</span>
            <span>Augmented</span>
            <span>
              <span className="ul">Generation</span>
            </span>
          </h1>
          <div className="say">
            <span>RAG</span>
            <i aria-hidden="true" />
            <span>SAY “R-A-G”</span>
          </div>
          <div className="def">
            <p>
              A language model answers from what it learned in training. A RAG system first finds the parts of your
              documents that match the question. Then the model writes the answer from those parts and cites each one.
            </p>
            <p>
              This document follows ASD-STE100. Each sentence gives one fact. The numbers come from real runs of a
              real embedding model.
            </p>
          </div>
        </div>
        <div className="control">
          <div className="control-h">DOCUMENT CONTROL</div>
          <dl>
            {[
              ["Document", `${DOC} · Rev ${REV} · ${ISSUED}`],
              ["Subject", "RAG — retrieval-augmented generation"],
              ["Purpose", "To tell how RAG works and how to test it"],
              ["Applicability", "Systems that answer questions from documents"],
              ["Language", "ASD-STE100, Issue 9"],
              ["Figures", "09 — seven are interactive"],
              ["Example data", "HP-40 pump manual (invented), 12 chunks"],
              ["Measured with", `${MODEL.split("/")[1]} · fastembed ${RUN.fastembed}`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="control-f">
            <span>APPROVED FOR RELEASE</span>
            <span className="stamp">REV {REV}</span>
          </div>
        </div>
      </div>
      <EmbeddingBand />
    </header>
  );
}

/** the 384 numbers of the title's embedding, one cell each: ink is positive, olive is negative */
function EmbeddingBand() {
  return (
    <div className="band">
      <BandGrid cols={96} className="band-w" />
      <BandGrid cols={48} className="band-n" />
      <div className="band-cap">
        <span>
          <b>The title “Retrieval-augmented generation” as {DIMS} numbers</b>
        </span>
        <span>Model {MODEL} · real vector · length 1</span>
        <span className="r">Ink = positive · olive = negative · cobalt = the 8 largest</span>
      </div>
    </div>
  );
}

/** the cells in rows of `cols`: 96 on a wide page, 48 on a phone */
function BandGrid({ cols, className }: { cols: number; className: string }) {
  const CW = 9.4, CH = 15, GAP = 0.6, X0 = cols > 48 ? 34 : 40, FS = cols > 48 ? 8 : 11;
  const max = Math.max(...TITLE_VECTOR.map(Math.abs));
  const top = new Set(
    TITLE_VECTOR.map((v, i) => [Math.abs(v), i] as const)
      .sort((a, b) => b[0] - a[0])
      .slice(0, 8)
      .map(([, i]) => i),
  );
  const rows = DIMS / cols;
  return (
    <svg className={className} viewBox={`0 0 ${X0 + cols * (CW + GAP) + 4} ${rows * (CH + 4) + 2}`} role="img" aria-label={`The ${DIMS} numbers of the embedding of the title, shaded by value`}>
      {Array.from({ length: rows }, (_, r) => (
        <text key={r} x={0} y={r * (CH + 4) + CH - 3.5} fontSize={FS} fill="var(--olive)" letterSpacing="0.06em">
          {String(r * cols).padStart(3, "0")}
        </text>
      ))}
      {TITLE_VECTOR.map((v, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const key = top.has(i);
        return (
          <rect
            key={i}
            className="cell"
            style={{ animationDelay: `${i * 3}ms` }}
            x={X0 + c * (CW + GAP)}
            y={r * (CH + 4)}
            width={CW}
            height={CH}
            fill={key ? "var(--acc)" : v >= 0 ? "var(--ink)" : "var(--olive)"}
            fillOpacity={key ? 1 : 0.12 + 0.88 * Math.sqrt(Math.abs(v) / max)}
          >
            <title>{`dimension ${i}: ${v.toFixed(4)}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

/** search the sheets of this page with the BM25 of Sheet 05 */
export function AskDossier() {
  const [q, setQ] = useState("How do I test the system?");
  const [sheets, setSheets] = useState<{ id: string; no: string; title: string }[]>([]);
  const [index, setIndex] = useState<Index | null>(null);
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("section.sec[data-sheet]")];
    setSheets(els.map((el) => ({ id: el.id, no: el.dataset.sheet!, title: el.dataset.title! })));
    // field boost, as in most search engines: the title of a sheet counts three times
    setIndex(buildIndex(els.map((el) => `${el.dataset.title} `.repeat(3) + (el.textContent ?? ""))));
  }, []);
  const hits = useMemo(() => {
    if (!index) return [];
    const s = bm25(index, q);
    return s
      .map((score, i) => ({ score, i }))
      .filter((h) => h.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [index, q]);
  const best = hits[0]?.score ?? 1;
  return (
    <div className="ask">
      <div className="ask-row">
        <label className="ask-lab" htmlFor="ask-q">
          Ask this dossier <i>→</i>
        </label>
        <input id="ask-q" className="inp" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" spellCheck={false} />
        <span className="ctl-lab">BM25 over the {sheets.length || 11} sheets of this page · titles count 3 times</span>
      </div>
      <ol aria-live="polite">
        {hits.length ? (
          hits.map((h) => (
            <li key={h.i}>
              <a href={`#${sheets[h.i].id}`}>
                <span className="no">{sheets[h.i].no === "A" ? "A" : `${sheets[h.i].no}.0`}</span>
                <span className="t">{sheets[h.i].title}</span>
                <span className="bar">
                  <i style={{ width: `${(h.score / best) * 100}%` }} />
                </span>
                <span className="s">{h.score.toFixed(2)}</span>
              </a>
            </li>
          ))
        ) : (
          <li className="none">No sheet shares a word with the question. Keyword search needs shared words (Sheet 05).</li>
        )}
      </ol>
    </div>
  );
}
