import { GopherBlueprint } from "./diagrams/GopherBlueprint";

const META = [
  ["DOC NO", "GO/101"],
  ["REV", "1.2"],
  ["SPEC", "GO1.22"],
  ["CLASS", "PUBLIC RELEASE"],
];

const SPECIMEN = [
  ["ORIGIN", "GOOGLE, 2007"],
  ["OPEN-SOURCED", "NOVEMBER 2009"],
  ["AUTHORS", "GRIESEMER · PIKE · THOMPSON"],
  ["PARADIGM", "CONCURRENT · IMPERATIVE"],
  ["TYPING", "STATIC · STRUCTURAL"],
  ["MEMORY", "GARBAGE COLLECTED"],
];

export function Cover() {
  return (
    <header className="relative overflow-hidden bg-go-ink text-go-paper">
      {/* faint blueprint grid */}
      <div className="blueprint-grid pointer-events-none absolute inset-0" />

      {/* progress-blue hairline at very top */}
      <div className="relative h-1 bg-go-accent" />

      <div className="relative mx-auto max-w-[1240px] px-6 lg:px-10">
        {/* meta bar */}
        <div className="grid grid-cols-2 border-b border-go-paper/25 md:grid-cols-4">
          {META.map(([k, v], i) => (
            <div
              key={k}
              className={
                "flex items-baseline justify-between gap-4 px-4 py-3 text-[10px] uppercase tracking-[0.25em] " +
                (i > 0 ? "border-l border-go-paper/25" : "") +
                (i >= 2 ? " max-md:border-t max-md:border-go-paper/25" : "") +
                (i === 2 ? " max-md:border-l-0" : "")
              }
            >
              <span className="text-go-paper/45">{k}</span>
              <span className={v === "PUBLIC RELEASE" ? "font-semibold text-go-accent" : "font-semibold"}>
                {v}
              </span>
            </div>
          ))}
        </div>

        {/* masthead */}
        <div className="grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-20">
          <div className="relative flex flex-col justify-center">
            <div className="text-[10px] uppercase tracking-[0.4em] text-go-paper/50">
              Technical dossier — series: programming languages
            </div>
            <h1 className="mt-6 text-[11.5vw] font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-[84px]">
              THE GO
              <br />
              <span className="text-outline-paper">PROGRAMMING</span>
              <br />
              LANGUAGE
            </h1>
            <div className="mt-8 h-[3px] w-24 bg-go-accent" />
            <p className="mt-6 max-w-md text-[12.5px] leading-6 text-go-paper/70">
              A field document on the fundamentals of Go — compiled for
              engineers entering from zero. Ten sections, eight schematics,
              every concept reduced to what actually matters. No prior
              experience assumed; none required.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-8">
              <a
                href="#s01"
                className="group inline-flex items-center gap-3 border border-go-accent px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-go-accent transition-colors hover:bg-go-accent hover:text-go-paper"
              >
                Begin with §01
                <span className="transition-transform group-hover:translate-y-0.5">↓</span>
              </a>
              <div className="rotate-[-4deg] border-2 border-go-accent px-4 py-2 text-[10px] font-bold uppercase leading-relaxed tracking-[0.3em] text-go-accent">
                APPROVED
                <br />
                FOR STUDY
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <GopherBlueprint className="w-full max-w-[560px]" />
          </div>
        </div>

        {/* specimen data */}
        <div className="grid grid-cols-2 border-t border-go-paper/25 md:grid-cols-3 xl:grid-cols-6">
          {SPECIMEN.map(([k, v], i) => (
            <div
              key={k}
              className={
                "border-go-paper/25 px-4 py-4 " +
                (i % 2 === 1 ? "max-md:border-l" : "") +
                " " +
                (i >= 2 ? "max-md:border-t" : "") +
                " " +
                (i >= 3 ? "max-xl:border-t xl:border-l" : "") +
                (i === 3 ? " max-md:border-l-0" : "")
              }
            >
              <div className="text-[9px] uppercase tracking-[0.3em] text-go-paper/45">{k}</div>
              <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em]">{v}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-go-paper/25 px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-go-paper/45">
          <span>FOR DISTRIBUTION TO NEW ENGINEERS</span>
          <span className="hidden sm:inline">HANDLE WITH CURIOSITY</span>
          <span>01 / 10 FOLLOW</span>
        </div>
      </div>
    </header>
  );
}
