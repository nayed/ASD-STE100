const REFS: [string, string][] = [
  ["SPEC", "GO.DEV/REF/SPEC"],
  ["EFFECTIVE GO", "GO.DEV/DOC/EFFECTIVE_GO"],
  ["THE TOUR", "GO.DEV/TOUR"],
  ["STDLIB", "PKG.GO.DEV"],
];

export function Footer() {
  return (
    <footer className="relative mt-24 bg-go-ink text-go-paper">
      <div className="relative h-1 bg-go-accent" />
      <div className="mx-auto max-w-[1240px] px-6 py-16 lg:px-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-go-paper/50">
              Terminus — no further sections
            </div>
            <h2 className="mt-4 text-5xl font-bold leading-none tracking-tight md:text-7xl">
              END OF
              <br />
              <span className="text-outline-paper">DOSSIER</span>
            </h2>
            <div className="mt-6 h-[3px] w-20 bg-go-accent" />
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-4 border-t border-go-paper/25 pt-6 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
            {REFS.map(([k, v]) => (
              <div key={k}>
                <div className="text-[9px] uppercase tracking-[0.3em] text-go-paper/45">{k}</div>
                <div className="mt-1 text-[11px] font-semibold tracking-[0.12em]">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-go-paper/25 pt-5 text-[10px] uppercase tracking-[0.25em] text-go-paper/45 md:flex-row md:items-center md:justify-between">
          <span>GO/101 — TECHNICAL DOSSIER, REV 1.2</span>
          <span>DOCUMENT SET FOR TRAINING — REDISTRIBUTE FREELY</span>
          <span className="text-go-accent">EOF · 10 / 10</span>
        </div>
      </div>
    </footer>
  );
}
