/** Document furniture of MEM-100: the address-map rail, sheet headers, captions, exhibits, hazards. */

import { useEffect, useState, type ReactNode } from "react";
import { listingStyle, type Listing } from "../../code/listing";
import { Tokens } from "../../code/Tokens";

export const DOC = "MEM-100";
export const REV = "A";
export const ISSUED = "2026-10-25";

/** each sheet sits at an "offset" in the dossier, as if the document were a block of memory */
export const SHEETS = [
  { id: "s01", no: "01", title: "Scope", off: "+0x100" },
  { id: "s02", no: "02", title: "The address space", off: "+0x200" },
  { id: "s03", no: "03", title: "The stack", off: "+0x300" },
  { id: "s04", no: "04", title: "The heap", off: "+0x400" },
  { id: "s05", no: "05", title: "One program, step by step", off: "+0x500" },
  { id: "s06", no: "06", title: "Lifetimes", off: "+0x600" },
  { id: "s07", no: "07", title: "The compiler decides", off: "+0x700" },
  { id: "s08", no: "08", title: "Speed and locality", off: "+0x800" },
  { id: "s09", no: "09", title: "Failure modes", off: "+0x900" },
  { id: "s10", no: "10", title: "Field rules", off: "+0xA00" },
  { id: "sA", no: "A", title: "Definitions", off: "+0xB00" },
] as const;

const ALL = [{ id: "cover", no: "00", title: "Cover", off: "+0x000" }, ...SHEETS];

/** which sheet is on screen, and how far the reader has scrolled */
function useReading() {
  const [active, setActive] = useState("cover");
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-20% 0px -70% 0px" },
    );
    ALL.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) spy.observe(el);
    });
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      spy.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return { active, progress };
}

export function Rail() {
  const { active, progress } = useReading();
  const at = Math.max(0, ALL.findIndex((s) => s.id === active));
  // the reader is the stack pointer: it walks down the dossier as the page scrolls
  const sp = `+0x${Math.round(progress * 0xbff).toString(16).toUpperCase().padStart(3, "0")}`;
  return (
    <>
      <aside className="rail" aria-label="Index of sheets">
        <div className="rail-doc">{DOC}</div>
        <div className="rail-rev">REV {REV} · {ISSUED}</div>
        <div className="rail-h">
          <span>ADDRESS MAP</span>
          <span>12 SHEETS</span>
        </div>
        <nav className="rail-map">
          {ALL.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className={i === at ? "act" : i < at ? "done" : undefined} aria-current={i === at ? "location" : undefined}>
              <span className="off">{s.off}</span>
              <span>{s.title}</span>
            </a>
          ))}
        </nav>
        <dl className="rail-sp">
          <dt>SP</dt>
          <dd>{sp}</dd>
          <dt>DEPTH</dt>
          <dd>
            {String(at).padStart(2, "0")} / {String(ALL.length - 1).padStart(2, "0")}
          </dd>
        </dl>
        <div className="rail-legal">
          Training document. Addresses and outputs come from real runs on one machine. Your values will differ.
        </div>
      </aside>
      <div className="strip" aria-hidden="true">
        <span>
          {DOC} · REV {REV}
        </span>
        <span>
          SHEET <b>{ALL[at].no}</b> — {ALL[at].title}
        </span>
      </div>
    </>
  );
}

export function Sheet({ id, no, kicker, title, off, children }: { id: string; no: string; kicker: string; title: string; off: string; children: ReactNode }) {
  return (
    <section id={id} className="sheet" aria-labelledby={`${id}-t`}>
      <header className="sheet-head">
        <div className="sheet-no">{no}</div>
        <div>
          <div className="sheet-kicker">
            SHEET {no} · OFFSET {off} · {kicker}
          </div>
          <h2 id={`${id}-t`} className="sheet-title">
            {title}
          </h2>
        </div>
        <div className="sheet-ref">
          {DOC} · REV {REV}
          <br />
          SHEET {no} OF 10{no === "A" ? " + A" : ""}
        </div>
      </header>
      <div className="ruler" aria-hidden="true" />
      {children}
    </section>
  );
}

export function Fig({ no, title, refText, note, children }: { no: string; title: string; refText: string; note?: ReactNode; children: ReactNode }) {
  return (
    <figure className="fig">
      <div className="figbody">{children}</div>
      <figcaption className="figcap">
        <span className="no">FIG. {no}</span>
        <span>— {title}</span>
        <span className="ref">{refText}</span>
      </figcaption>
      {note && <p className="fignote">{note}</p>}
    </figure>
  );
}

export function Note({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="note">
      <b>{label}</b>
      {children}
    </div>
  );
}

/** an STE safety instruction: the command first, then the risk */
export function Hazard({ kind = "warning", cmd, children }: { kind?: "warning" | "caution"; cmd: string; children: ReactNode }) {
  return (
    <div className={`hazard ${kind === "caution" ? "caution" : ""}`} role="note">
      <div className="hazard-bar">
        <b>{kind === "caution" ? "CAUTION" : "WARNING"}</b>
        <i aria-hidden="true" />
      </div>
      <div className="hazard-body">
        <p className="cmd">{cmd}</p>
        {children}
      </div>
    </div>
  );
}

export function Proc({ items }: { items: ReactNode[] }) {
  return (
    <ol className="proc">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ol>
  );
}

/** a C or Go listing, highlighted at build time (`?highlight` imports); `on` marks the active line of the step-through */
export function Code({ label, meta, listing, on }: { label: string; meta: string; listing: Listing; on?: number }) {
  return (
    <div className="ex">
      <div className="ex-bar">
        <span>{label}</span>
        <span>{meta}</span>
      </div>
      <pre style={listingStyle(listing)}>
        {listing.lines.map((line, i) => (
          <span key={i} className={`ln${on === i + 1 ? " on" : ""}`} data-n={i + 1}>
            <Tokens line={line} />
            {"\n"}
          </span>
        ))}
      </pre>
    </div>
  );
}

export type TermLine = { t: string; k?: "cmd" | "out" | "com" | "hot" | "omit" };

export function Term({ label, meta, lines }: { label: string; meta: string; lines: TermLine[] }) {
  return (
    <div className="term">
      <div className="term-bar">
        <span>{label}</span>
        <span>{meta}</span>
      </div>
      <pre>
        {lines.map((l, i) => (
          <span key={i} className={l.k ?? "out"}>
            {l.t}
            {"\n"}
          </span>
        ))}
      </pre>
    </div>
  );
}

export function TblCap({ no, title, refText }: { no: string; title: string; refText: string }) {
  return (
    <div className="tblcap">
      <span className="no">TABLE {no}</span>
      <span>— {title}</span>
      <span className="ref">{refText}</span>
    </div>
  );
}
