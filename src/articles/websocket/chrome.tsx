/** Document furniture of WS-6455: the session rail, the sheet strip, sheets, figure frames, callouts, exhibits. */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { listingStyle, type Listing } from "../../code/listing";
import { Tokens } from "../../code/Tokens";

export const DOC = "WS-6455";
export const REV = "A";
export const ISSUED = "2026-10-30";

type Dir = "c2s" | "s2c";
export const SHEETS: { id: string; no: string; title: string; sub: string; dir: Dir }[] = [
  { id: "s01", no: "01", title: "What a WebSocket is", sub: "General · Fig. 01", dir: "c2s" },
  { id: "s02", no: "02", title: "Why not plain HTTP", sub: "Comparison · Fig. 02 · Table 2-1", dir: "s2c" },
  { id: "s03", no: "03", title: "The opening handshake", sub: "Upgrade · Fig. 03, 04", dir: "c2s" },
  { id: "s04", no: "04", title: "The frame", sub: "Header layout · Fig. 05 · Table 4-1", dir: "s2c" },
  { id: "s05", no: "05", title: "Masking", sub: "Client to server · Fig. 06", dir: "c2s" },
  { id: "s06", no: "06", title: "Messages and control frames", sub: "Fragments, ping, pong · Fig. 07", dir: "s2c" },
  { id: "s07", no: "07", title: "The closing handshake", sub: "Close frames · Fig. 08 · Table 7-1", dir: "c2s" },
  { id: "s08", no: "08", title: "A real session", sub: "Line monitor · Fig. 09 · Exhibits A, B", dir: "s2c" },
  { id: "s09", no: "09", title: "In the browser", sub: "WebSocket API · Fig. 10", dir: "c2s" },
  { id: "s10", no: "10", title: "In production", sub: "Operation · Fig. 11 · Exhibit C", dir: "s2c" },
  { id: "s11", no: "11", title: "Selection", sub: "Summary · Table 11-1", dir: "c2s" },
  { id: "sA", no: "A", title: "Glossary", sub: "Appendix", dir: "s2c" },
];
export type SheetId = (typeof SHEETS)[number]["id"];

/** sheet numbers are hexadecimal, as the bytes are: 10 is 0x0A */
export const hexNo = (no: string) => (no === "A" ? "App. A" : `0x${parseInt(no, 10).toString(16).toUpperCase().padStart(2, "0")}`);

/** the sheet on screen and the scroll progress; the page calls it once and passes the result down */
export function useReading() {
  const [active, setActive] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    // the active sheet is the last one whose top is above a line at 30 % of the window; this also works after a jump
    const ids = SHEETS.map((s) => s.id);
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
      const line = window.innerHeight * 0.3;
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

/** the contents as one session: two lanes, and each sheet an arrow between them */
export function Rail({ active, progress }: { active: string | null; progress: number }) {
  const idx = SHEETS.findIndex((s) => s.id === active);
  return (
    <nav className="rail" aria-label="Contents">
      <div className="rail-in">
        <div className="rail-head">
          <span>Session · {DOC}</span>
          <span className="pct">{Math.round(progress * 100).toString().padStart(2, "0")} %</span>
        </div>
        <div className="lanes-key" aria-hidden="true">
          <span>Client</span>
          <span>Server</span>
        </div>
        <div className="lanes">
          <div className="lane-dot" style={{ top: `${progress * 100}%` }} aria-hidden="true" />
          <div className="ev">TCP connect · Sheet 00</div>
          <ol>
            {SHEETS.map((s, i) => (
              <li key={s.id} className={`${s.dir}${i < idx ? " past" : ""}`}>
                <a href={`#${s.id}`} className={active === s.id ? "on" : undefined} aria-current={active === s.id ? "location" : undefined}>
                  <span className="n">{hexNo(s.no)}</span>
                  <span className="t">{s.title}</span>
                  <span className="arrow" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ol>
          <div className="ev end">Close 1000 · end of document</div>
        </div>
        <a className="top" href="#top">
          Back to the cover
        </a>
      </div>
    </nav>
  );
}

/** on narrow screens: the sheet on screen and the progress, under the site bar */
export function Strip({ active, progress }: { active: string | null; progress: number }) {
  const s = SHEETS.find((x) => x.id === active);
  return (
    <div className="strip" aria-hidden="true">
      <span className="doc">{DOC}</span>
      <span className="cur">
        {s ? (
          <>
            <span className="hx">{hexNo(s.no)}</span> — {s.title}
          </>
        ) : (
          "Cover"
        )}
      </span>
      <span className="prog" style={{ width: `${progress * 100}%` }} />
    </div>
  );
}

export function Section({ id, children }: { id: SheetId; children: ReactNode }) {
  const s = SHEETS.find((x) => x.id === id)!;
  const n = SHEETS.filter((x) => x.no !== "A").length;
  return (
    <section id={id} className="sheet" aria-labelledby={`${id}-t`}>
      <header className="sheet-head">
        <span className="big" aria-hidden="true">
          {s.no === "A" ? "A" : hexNo(s.no)}
        </span>
        <div className="ttl">
          <h2 id={`${id}-t`}>{s.title}</h2>
          <span className="sub">{s.sub}</span>
        </div>
        <span className="ref">{s.no === "A" ? "Appendix" : `Sheet ${s.no} / ${n}`}</span>
      </header>
      {children}
    </section>
  );
}

/** text with a margin column for notes on wide screens */
export function Body({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className={`body${aside ? " has-aside" : ""}`}>
      <div className="txt">{children}</div>
      {aside && <aside className="aside">{aside}</aside>}
    </div>
  );
}

/** true while the figure is on screen; animations start and loops run only then */
const InView = createContext(false);
export const useInView = () => useContext(InView);

export function Figure({ no, title, dwg, note, children }: { no: string; title: string; dwg: string; note?: ReactNode; children: ReactNode }) {
  const el = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = el.current;
    if (!f) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.2 });
    io.observe(f);
    return () => io.disconnect();
  }, []);
  return (
    <figure ref={el} className={`fig${on ? " inview" : ""}`} id={`fig${no}`}>
      <div className="fig-body">
        <InView.Provider value={on}>{children}</InView.Provider>
      </div>
      <figcaption className="figcap">
        <span className="no">Fig. {no}</span>
        <span className="tt">{title}</span>
        <span className="ref">{dwg}</span>
      </figcaption>
      {note && <p className="fignote">{note}</p>}
    </figure>
  );
}

/** a drawing that keeps a readable size on a phone and scrolls sideways in its own frame */
export function Wide({ children, min = 640 }: { children: ReactNode; min?: number }) {
  return (
    <div className="wide-box">
      <div className="wide-in" style={{ minWidth: min }}>
        {children}
      </div>
    </div>
  );
}

export function Call({ kind = "note", children }: { kind?: "note" | "caution" | "warning"; children: ReactNode }) {
  return (
    <div className={`call ${kind}`} role="note">
      <span className="tag">{kind}</span>
      <div>{children}</div>
    </div>
  );
}

export function Proc({ title, steps }: { title: string; steps: ReactNode[] }) {
  return (
    <div className="proc">
      <h3>{title}</h3>
      <ol>
        {steps.map((s, i) => (
          <li key={i}>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function TblCap({ no, children }: { no: string; children: ReactNode }) {
  return (
    <div className="tcap">
      <b>Table {no}</b> {children}
    </div>
  );
}

/** a source file, highlighted at build time (`?highlight` imports) */
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

/** a terminal session: exactly the command that printed the output */
export function Term({ label, meta, command, output }: { label: string; meta: string; command: string; output: string }) {
  return (
    <div className="term">
      <div className="term-bar">
        <span>{label}</span>
        <span>{meta}</span>
      </div>
      <pre>
        <span className="cmd">$ {command}</span>
        {"\n"}
        {output}
      </pre>
    </div>
  );
}

/** an HTTP head as it crossed the wire: one row per line, its CRLF and its size in bytes */
export function Wire({ label, text, mark = [] }: { label: string; text: string; mark?: string[] }) {
  const lines = text.split("\r\n").slice(0, -1); // the head ends with an empty line
  const total = new TextEncoder().encode(text).length;
  return (
    <div className="wire">
      <div className="wire-bar">
        <span>{label}</span>
        <span>{total} B on the wire</span>
      </div>
      <div className="wire-rows">
        {lines.map((l, i) => {
          const key = mark.some((m) => l.toLowerCase().startsWith(m));
          return (
            <div key={i} className={`wr${key ? " k" : ""}${l === "" ? " blank" : ""}`}>
              <span className="l">{l === "" ? "(empty line: end of the head)" : l}</span>
              <span className="crlf">CRLF</span>
              <span className="b">{new TextEncoder().encode(l).length + 2}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
