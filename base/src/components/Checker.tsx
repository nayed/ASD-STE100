import { useMemo, useState } from "react";
import { analyze, SAMPLES, type Finding } from "../lib/ste";

const SEV = {
  error: { label: "Error", cls: "bg-hazard text-paper", rule: "text-hazard" },
  warn: { label: "Check", cls: "bg-blueprint text-paper", rule: "text-blueprint" },
  note: { label: "Note", cls: "bg-ash text-paper", rule: "text-ash" },
} as const;

export default function Checker() {
  const [text, setText] = useState(SAMPLES[0].text);
  const [mode, setMode] = useState<"procedure" | "description">("procedure");

  const a = useMemo(() => analyze(text, mode), [text, mode]);

  const segments = useMemo(() => {
    const out: { t: string; f?: Finding }[] = [];
    let pos = 0;
    for (const f of a.marks) {
      if (f.start < pos) continue;
      if (f.start > pos) out.push({ t: text.slice(pos, f.start) });
      out.push({ t: text.slice(f.start, f.start + f.length), f });
      pos = f.start + f.length;
    }
    if (pos < text.length) out.push({ t: text.slice(pos) });
    return out;
  }, [a, text]);

  const load = (i: number) => {
    setText(SAMPLES[i].text);
    setMode(SAMPLES[i].mode);
  };

  return (
    <div className="mt-8 border border-ink">
      {/* header strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-ink px-4 py-2.5 text-paper">
        <span className="micro">STE checker · teaching aid</span>
        <div className="flex items-center gap-4">
          {[
            ["Words", a.words],
            ["Sentences", a.sentences.length],
            ["Errors", a.errors],
            ["Checks", a.warns],
          ].map(([k, v]) => (
            <span key={k as string} className="flex items-baseline gap-1.5">
              <span className="micro text-paper/50">{k}</span>
              <span className="font-mono text-[15px] font-medium tnum">{v as number}</span>
            </span>
          ))}
        </div>
      </div>

      {/* controls */}
      <div className="flex flex-wrap items-center gap-2 border-b border-ink/20 bg-paper2 px-4 py-3">
        <span className="micro mr-1 text-ash">Text type</span>
        {(["procedure", "description"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`micro border px-2.5 py-1.5 transition-colors ${
              mode === m ? "border-ink bg-ink text-paper" : "border-ink/30 text-ash hover:border-ink hover:text-ink"
            }`}
          >
            {m} · {m === "procedure" ? 20 : 25} words
          </button>
        ))}
        <span className="micro ml-auto mr-1 text-ash">Load</span>
        {SAMPLES.map((s, i) => (
          <button
            key={s.label}
            onClick={() => load(i)}
            className="border border-ink/30 px-2.5 py-1.5 font-mono text-[11px] text-ash transition-colors hover:border-hazard hover:text-hazard"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* input */}
        <div className="border-b border-ink/20 lg:border-b-0 lg:border-r">
          <label htmlFor="ste-input" className="micro mb-2 block px-4 pt-4 text-ash">
            Your text
          </label>
          <textarea
            id="ste-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            rows={7}
            placeholder="Type or paste a sentence …"
            className="w-full resize-y border-0 bg-paper px-4 pb-4 text-[16.5px] leading-[1.6] outline-none placeholder:text-ash/60 focus:ring-0"
          />
          {/* meter */}
          <div className="border-t border-ink/20 px-4 py-4">
            <div className="micro mb-2 flex items-center justify-between text-ash">
              <span>Sentence length</span>
              <span>limit {a.limit}</span>
            </div>
            <div className="flex h-10 items-stretch gap-[3px]">
              {a.sentences.length === 0 && (
                <div className="flex w-full items-center justify-center border border-dashed border-ink/25 font-mono text-[11px] text-ash">
                  no text yet
                </div>
              )}
              {a.sentences.map((s, i) => {
                const over = s.words > a.limit;
                return (
                  <div
                    key={i}
                    title={`Sentence ${i + 1}: ${s.words} words`}
                    style={{ flexGrow: Math.max(2, s.words) }}
                    className={`flex items-center justify-center font-mono text-[11px] tnum ${
                      over ? "bg-hazard text-paper" : "border border-blueprint/50 bg-blueprint/10 text-blueprint"
                    }`}
                  >
                    {s.words}
                  </div>
                );
              })}
            </div>
            <p className="mt-2 font-mono text-[11px] leading-[1.6] text-ash">
              {a.sentences.some((s) => s.words > a.limit)
                ? `Sentence ${a.sentences.findIndex((s) => s.words > a.limit) + 1} is over the limit. Split it.`
                : "Every sentence is inside the limit."}
            </p>
          </div>

          {/* inline markup */}
          <div className="border-t border-ink/20 px-4 py-4">
            <div className="micro mb-2 flex flex-wrap gap-4 text-ash">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 bg-hazard" /> rule broken
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 bg-blueprint" /> check the dictionary
              </span>
            </div>
            <p className="whitespace-pre-wrap break-words font-serif text-[17px] leading-[1.65] text-ink/90">
              {segments.map((s, i) =>
                s.f ? (
                  <mark
                    key={i}
                    title={`${s.f.rule} — ${s.f.message}`}
                    className={`bg-transparent px-0 ${s.f.severity === "error" ? "underline decoration-hazard decoration-2 underline-offset-4" : "underline decoration-blueprint decoration-dotted underline-offset-4"}`}
                  >
                    {s.t}
                  </mark>
                ) : (
                  <span key={i}>{s.t}</span>
                ),
              )}
            </p>
          </div>
        </div>

        {/* findings + rewrite */}
        <div className="flex flex-col">
          <div className="border-b border-ink/20 px-4 py-4">
            <div className="micro mb-3 text-ash">Findings</div>
            {a.findings.length === 0 ? (
              <div className="flex items-start gap-3 border border-blueprint/40 bg-blueprint/5 p-4">
                <span aria-hidden className="mt-0.5 h-4 w-4 shrink-0 border border-blueprint bg-blueprint/25" />
                <p className="text-[15px] leading-[1.6]">
                  No violation that this page can detect.
                  <span className="mt-1 block font-mono text-[11px] leading-[1.6] text-ash">
                    This does not prove conformance. The full dictionary has about 900 approved entries, each with one part of speech and one meaning.
                  </span>
                </p>
              </div>
            ) : (
              <ul className="max-h-[330px] overflow-y-auto pr-1">
                {a.findings.map((f, i) => (
                  <li key={i} className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 border-b border-hair py-2.5 last:border-b-0">
                    <span className={`micro pt-[3px] ${SEV[f.severity].rule}`}>{f.rule}</span>
                    <div>
                      <p className="text-[14.5px] leading-[1.5]">
                        <span className={`micro mr-2 align-[2px] px-1.5 py-[1px] ${SEV[f.severity].cls}`}>{SEV[f.severity].label}</span>
                        {f.message}
                      </p>
                      <p className="mt-1 break-words font-mono text-[11px] text-ash">“{f.snippet}”</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex-1 bg-plate px-4 py-4 plate-grid">
            <div className="micro mb-3 flex items-center justify-between text-paper/60">
              <span>STE-shaped rewrite</span>
              <span className="text-paper/55">approximate</span>
            </div>
            <p className="text-[16.5px] leading-[1.6] text-paper">
              {a.rewrite || <span className="text-paper/65">Nothing to rewrite yet.</span>}
            </p>
            <p className="mt-4 border-t border-paper/15 pt-3 font-mono text-[11px] leading-[1.7] text-paper/55">
              Built by substitution and sentence splitting. A real check must test every word against the dictionary, with its part of speech.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
