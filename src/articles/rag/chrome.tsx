/** Document furniture of RAG-100: document bar, contents rail, sections, figure frames, callouts, exhibits. */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { listingStyle, type Listing } from "../../code/listing";
import { Tokens } from "../../code/Tokens";

export const DOC = "RAG-100";
export const REV = "A";
export const ISSUED = "2026-10-26";

export const SHEETS = [
  { id: "s01", no: "01", title: "What RAG does", sub: "General — Figure 01" },
  { id: "s02", no: "02", title: "The two phases", sub: "Block diagram — Figure 02" },
  { id: "s03", no: "03", title: "Divide the documents", sub: "Preparation — Figure 03" },
  { id: "s04", no: "04", title: "Words become numbers", sub: "Embedding — Figure 04" },
  { id: "s05", no: "05", title: "Find the best chunks", sub: "Retrieval — Figure 05" },
  { id: "s06", no: "06", title: "Build the prompt", sub: "Augmentation — Figure 06" },
  { id: "s07", no: "07", title: "Write the answer", sub: "Generation — Figure 07" },
  { id: "s08", no: "08", title: "Test the system", sub: "Evaluation — Figure 08" },
  { id: "s09", no: "09", title: "Troubleshooting", sub: "Fault isolation — Figure 09" },
  { id: "s10", no: "10", title: "When to use RAG", sub: "Selection — Summary" },
  { id: "sA", no: "A", title: "Glossary", sub: "Appendix" },
] as const;

/** the sheet on screen and the scroll progress; the page calls it once and passes the result down */
export function useReading() {
  const [active, setActive] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    // the active sheet is the last one whose top is above a line at 25 % of the window; this also works after a jump
    const ids = ["top", ...SHEETS.map((s) => s.id)];
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
      const line = window.innerHeight * 0.25;
      let cur: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) cur = id;
      }
      setActive(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return { active, progress };
}

export function DocBar({ active, progress }: { active: string | null; progress: number }) {
  const sheet = SHEETS.find((s) => s.id === active);
  return (
    <div className="docbar">
      <div className="docbar-in">
        <span className="doc">Doc {DOC}</span>
        <span className="muted opt">· Rev {REV} · ASD-STE100 ·</span>
        <span className="muted opt">10 sheets · 9 figures</span>
        <span className="cur">
          {sheet ? (
            <>
              Sheet <b>{sheet.no}</b> — {sheet.title}
            </>
          ) : (
            "Cover — Retrieval-augmented generation"
          )}
        </span>
      </div>
      <div className="prog" style={{ width: `${progress * 100}%` }} />
    </div>
  );
}

export function Rail({ active }: { active: string | null }) {
  return (
    <nav className="rail" aria-label="Contents">
      <div className="rail-in">
        <h4>CONTENTS</h4>
        <ol>
          {SHEETS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className={active === s.id ? "on" : undefined} aria-current={active === s.id ? "location" : undefined}>
                <span className="n">{s.no}</span>
                <span>{s.title}</span>
              </a>
            </li>
          ))}
        </ol>
        <a className="top" href="#top">
          ↑ Top of document
        </a>
      </div>
    </nav>
  );
}

export function Section({ id, children }: { id: (typeof SHEETS)[number]["id"]; children: ReactNode }) {
  const s = SHEETS.find((x) => x.id === id)!;
  return (
    <section id={id} className="sec" data-sheet={s.no} data-title={s.title} aria-labelledby={`${id}-t`}>
      <header className="sec-head">
        <span className="badge">{s.no === "A" ? "A" : `${s.no}.0`}</span>
        <h2 id={`${id}-t`}>{s.title}</h2>
        <span className="sub">{s.sub}</span>
      </header>
      <div className="sec-body">{children}</div>
    </section>
  );
}

/** true while the figure is on screen; animations start and loops run only then */
const InView = createContext(false);
export const useInView = () => useContext(InView);

export function Figure({
  no, title, sheet, inverse = false, note, children,
}: { no: string; title: string; sheet: string; inverse?: boolean; note?: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div>
      <figure ref={ref} className={`fig${inverse ? " inverse" : ""}${on ? " inview" : ""}`} style={{ margin: 0 }}>
        <div className="fig-body">
          <InView.Provider value={on}>{children}</InView.Provider>
        </div>
        <figcaption className="fig-cap">
          <span className="no">Figure {no}</span>
          <span>{title}</span>
          <span className="sheet">{sheet}</span>
        </figcaption>
      </figure>
      {note && <p className="fig-note">{note}</p>}
    </div>
  );
}

export function Call({ kind = "note", children }: { kind?: "note" | "caution" | "warning"; children: ReactNode }) {
  return (
    <div className={`call ${kind}`} role="note">
      <b>[{kind.toUpperCase()}]</b>
      {children}
    </div>
  );
}

/** a source listing, highlighted at build time (`?highlight` imports) */
export function Code({ label, meta, listing }: { label: string; meta: string; listing: Listing }) {
  return (
    <div className="ex">
      <div className="ex-bar">
        <span>{label}</span>
        <span>{meta}</span>
      </div>
      <pre style={listingStyle(listing)}>
        {listing.lines.map((line, i) => (
          <span key={i} className="ln" data-n={i + 1}>
            <Tokens line={line} />
            {"\n"}
          </span>
        ))}
      </pre>
    </div>
  );
}

export function Term({ label, meta, command, output }: { label: string; meta: string; command: string; output: string }) {
  return (
    <div className="term">
      <div className="term-bar">
        <span>{label}</span>
        <span>{meta}</span>
      </div>
      <pre>
        <span className="cmd">{command}</span>
        {"\n"}
        <span className="out">{output}</span>
      </pre>
    </div>
  );
}
