import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Document model                                                     */
/* ------------------------------------------------------------------ */

export const SECTIONS = [
  { id: "s01", no: "01", title: "WHY CONTAINERS" },
  { id: "s02", no: "02", title: "THE MENTAL MODEL" },
  { id: "s03", no: "03", title: "CORE VOCABULARY" },
  { id: "s04", no: "04", title: "THE COMMAND LOOP" },
  { id: "s05", no: "05", title: "WHY PODMAN" },
  { id: "s06", no: "06", title: "ROOTLESS BY DESIGN" },
  { id: "s07", no: "07", title: "PODS — THE NAMESAKE" },
  { id: "s08", no: "08", title: "BUILDING IMAGES" },
  { id: "s09", no: "09", title: "KEEPING IT RUNNING" },
  { id: "s10", no: "10", title: "FIELD CHECKLIST" },
];

type DocState = { active: string; progress: number };
const DocCtx = createContext<DocState>({ active: "s01", progress: 0 });
export const useDoc = () => useContext(DocCtx);

export function DocProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState("s01");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <DocCtx.Provider value={{ active, progress }}>{children}</DocCtx.Provider>;
}

/* ------------------------------------------------------------------ */
/*  Fixed document chrome                                              */
/* ------------------------------------------------------------------ */

export function TopStrip() {
  const { active, progress } = useDoc();
  const sec = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];
  return (
    <header className="fixed inset-x-0 top-(--site-bar-h) z-40 h-8 bg-pd-ink text-pd-paper">
      <div className="flex h-full items-center justify-between px-3 text-[9px] uppercase tracking-[0.16em] md:px-5 md:text-[10px]">
        <span className="font-semibold">PDM-101 · REV C</span>
        <span className="hidden text-pd-paper/55 md:block">CONTAINER SYSTEMS — TRAINING DOSSIER</span>
        <span className="text-pd-paper/80">
          SHEET <span className="text-pd-purple font-bold">{sec.no}</span> / 10 — {sec.title}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 h-[2px] bg-pd-purple transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
    </header>
  );
}

export function Rail() {
  const { active, progress } = useDoc();
  return (
    <aside className="fixed bottom-0 left-0 top-[calc(var(--site-bar-h)+2rem)] z-30 hidden w-60 flex-col justify-between border-r border-pd-ink/15 bg-pd-paper px-6 py-8 lg:flex">
      <div>
        <div className="border border-pd-ink p-3.5">
          <div className="text-[8.5px] uppercase tracking-[0.22em] text-pd-olive">TECHNICAL DOSSIER</div>
          <div className="mt-1 text-[13px] font-bold leading-none">PDM-101 · REV C</div>
          <div className="mt-3 border-t border-pd-ink/20 pt-2 text-[8.5px] uppercase tracking-[0.22em] text-pd-olive">INDEX OF SHEETS</div>
        </div>
        <nav className="mt-5 space-y-[7px]">
          <TOCLink id="cover" no="00" title="COVER" active={active === "cover"} top />
          {SECTIONS.map((s) => (
            <TOCLink key={s.id} id={s.id} no={s.no} title={s.title} active={active === s.id} />
          ))}
        </nav>
      </div>
      <div className="space-y-4">
        <div className="text-[9px] uppercase tracking-[0.2em] text-pd-olive">
          SCROLL — <span className="text-pd-ink font-semibold">{String(Math.round(progress * 100)).padStart(3, "0")}%</span>
        </div>
        <div className="border border-pd-ink/50 p-3 text-[8px] uppercase leading-[1.8] tracking-[0.14em] text-pd-olive">
          DISTRIBUTION STATEMENT A — APPROVED FOR PUBLIC RELEASE; DISTRIBUTION UNLIMITED.
          <div className="mt-2 inline-block border border-pd-purple px-1.5 py-0.5 font-bold text-pd-purple">TLP: CLEAR</div>
        </div>
      </div>
    </aside>
  );
}

function TOCLink({ id, no, title, active, top }: { id: string; no: string; title: string; active: boolean; top?: boolean }) {
  return (
    <a
      href={`#${id}`}
      className={`group flex items-baseline gap-2 text-[10px] uppercase tracking-[0.14em] transition-colors ${
        active ? "font-bold text-pd-purple" : "text-pd-ink/70 hover:text-pd-purple"
      } ${top ? "pb-1" : ""}`}
    >
      <span className="w-5 shrink-0">{active ? ">" : no}</span>
      <span className={active ? "" : "group-hover:translate-x-0.5 transition-transform"}>{top ? title : `${no} — ${title}`}</span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout primitives                                                  */
/* ------------------------------------------------------------------ */

export function Column({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[900px] px-5 md:px-10">{children}</div>;
}

export function Section({
  id,
  no,
  kicker,
  title,
  children,
}: {
  id: string;
  no: string;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-28 scroll-mt-[calc(var(--site-bar-h)+6rem)] border-t-2 border-pd-ink pt-6 first:mt-0">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2 border-b border-pd-ink pb-5">
        <span className="text-[56px] font-bold leading-[0.78] tracking-[-0.05em] md:text-[72px]">{no}</span>
        <div className="pb-1">
          <div className="text-[9px] uppercase tracking-[0.26em] text-pd-olive">{kicker}</div>
          <h2 className="mt-1 text-[22px] font-bold uppercase leading-[1.05] tracking-tight md:text-[30px]">{title}</h2>
        </div>
        <div className="ml-auto pb-1 text-right text-[9px] uppercase leading-[1.7] tracking-[0.18em] text-pd-olive">
          PDM-101
          <br />
          SHEET {no} / 10
        </div>
      </div>
      <div className="pt-9">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Typographic atoms                                                  */
/* ------------------------------------------------------------------ */

export function P({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[13px] leading-[1.95] text-pd-ink/90 ${className}`}>{children}</p>;
}

export function Sub({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] ${className}`}>
      <span className="inline-block h-2 w-2 bg-pd-purple" />
      {children}
    </h3>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="bg-pd-ink px-1.5 py-[1px] text-[0.85em] font-medium text-pd-paper">{children}</code>;
}

export function Note({ label = "FIELD NOTE", children }: { label?: string; children: ReactNode }) {
  return (
    <aside className="border-l-2 border-pd-ink pl-4">
      <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-pd-purple">{label}</div>
      <div className="mt-2 space-y-2 text-[11.5px] leading-[1.85] text-pd-ink/75">{children}</div>
    </aside>
  );
}

export function PullQuote({ children, mark }: { children: ReactNode; mark?: string }) {
  return (
    <div className="relative border-y-2 border-pd-ink px-1 py-8 md:px-6">
      <span className="absolute -top-[1px] right-0 bg-pd-purple px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-pd-paper">
        {mark ?? "KEY IDEA"}
      </span>
      <p className="max-w-[680px] text-[19px] font-semibold leading-[1.6] tracking-tight md:text-[23px]">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Figure frame — ruledcaption, corner ticks                          */
/* ------------------------------------------------------------------ */

export function Figure({
  no,
  title,
  note = "SCALE: NTS",
  children,
}: {
  no: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <figure className="my-10">
      <div className="relative border border-pd-ink bg-pd-paper">
        <Ticks />
        {children}
      </div>
      <figcaption className="mt-2.5 flex items-baseline justify-between gap-4 border-t border-pd-ink pt-2 text-[9.5px] uppercase tracking-[0.14em]">
        <span className="min-w-0">
          <b className="font-bold text-pd-purple">FIG. {no}</b>
          <span className="text-pd-olive"> — </span>
          <span className="text-pd-ink">{title}</span>
        </span>
        <span className="whitespace-nowrap text-pd-olive">{note}</span>
      </figcaption>
      <div className="mt-2 border-b border-pd-ink/15" />
    </figure>
  );
}

function Ticks() {
  const c = "pointer-events-none absolute select-none text-[11px] leading-none text-pd-olive";
  return (
    <>
      <span className={`${c} -left-1.5 -top-2`}>+</span>
      <span className={`${c} -right-1.5 -top-2`}>+</span>
      <span className={`${c} -bottom-2 -left-1.5`}>+</span>
      <span className={`${c} -bottom-2 -right-1.5`}>+</span>
    </>
  );
}
