import { useEffect, useState } from "react";

export const SECTIONS = [
  { id: "s01", no: "01", title: "SUBJECT OVERVIEW" },
  { id: "s02", no: "02", title: "ANATOMY OF A PROGRAM" },
  { id: "s03", no: "03", title: "VARIABLES & TYPES" },
  { id: "s04", no: "04", title: "FUNCTIONS & CONTROL FLOW" },
  { id: "s05", no: "05", title: "ARRAYS, SLICES, MAPS" },
  { id: "s06", no: "06", title: "STRUCTS & METHODS" },
  { id: "s07", no: "07", title: "INTERFACES" },
  { id: "s08", no: "08", title: "ERRORS" },
  { id: "s09", no: "09", title: "GOROUTINES & CHANNELS" },
  { id: "s10", no: "10", title: "TOOLING & NEXT STEPS" },
];

export function ProgressBar() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? h.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-(--site-bar-h) z-40 h-[3px] bg-transparent">
      <div
        className="h-full bg-go-accent transition-[width] duration-100 ease-linear"
        style={{ width: `${p * 100}%` }}
      />
    </div>
  );
}

export function Toc() {
  const [active, setActive] = useState("s01");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* mobile strip */}
      <nav className="sticky top-(--site-bar-h) z-30 border-b border-go-ink/30 bg-go-paper lg:hidden">
        <div className="flex gap-0 overflow-x-auto">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={
                "shrink-0 border-r border-go-ink/20 px-3.5 py-3 text-[10px] uppercase tracking-[0.2em] " +
                (active === s.id ? "bg-go-ink font-semibold text-go-paper" : "text-go-olive-deep")
              }
            >
              {s.no}
            </a>
          ))}
        </div>
      </nav>

      {/* desktop rail */}
      <aside className="hidden h-full lg:block">
        <div className="sticky top-[calc(var(--site-bar-h)+1.25rem)]">
          <div className="border-b-2 border-go-ink pb-3 text-[10px] font-semibold uppercase tracking-[0.35em]">
            Index
          </div>
          <ul className="mt-2">
            {SECTIONS.map((s) => {
              const on = active === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={
                      "flex items-baseline gap-3 border-l-2 py-2.5 pl-4 pr-2 text-[10.5px] uppercase tracking-[0.15em] transition-colors " +
                      (on
                        ? "border-go-accent bg-white/60 font-semibold text-go-accent-text"
                        : "border-go-ink/20 text-go-olive-deep hover:border-go-ink/60 hover:text-go-ink")
                    }
                  >
                    <span className={on ? "text-go-accent-text" : "text-go-olive"}>{s.no}</span>
                    <span>{s.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 border-t border-go-ink/25 pt-3 text-[9.5px] uppercase leading-5 tracking-[0.2em] text-go-olive">
            10 SECTIONS
            <br />
            8 SCHEMATICS
            <br />
            12 EXHIBITS
          </div>
        </div>
      </aside>
    </>
  );
}
