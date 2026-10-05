import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Tokens                                                             */
/* ------------------------------------------------------------------ */
export const OLIVE = "#6e7160";
export const OLIVE_SOFT = "#8e9080";
export const OLIVE_DEEP = "#43463a";
export const INK = "#17170f";
export const BLUE = "#00add8"; // Gopher Blue, the Go mascot colour: lines, fills, dark backgrounds
/** the same hue, darkened to pass 4.5:1 on paper: small text, and fills that carry paper text */
export const BLUE_TEXT = "#00728f";
export const PAPER = "#f2f0e9";

/* ------------------------------------------------------------------ */
/*  Section shell                                                      */
/* ------------------------------------------------------------------ */
export function Section({
  id,
  no,
  title,
  brief,
  children,
}: {
  id: string;
  no: string;
  title: string;
  brief: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[calc(var(--site-bar-h)+3.25rem)] pt-16">
      <div className="flex items-end gap-5 border-b-2 border-go-ink pb-4">
        <span className="text-outline select-none text-6xl font-bold leading-none md:text-7xl">
          {no}
        </span>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.35em] text-go-olive">
            Section {no} / 10
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-[28px]">
            {title}
          </h2>
        </div>
        <span className="ml-auto hidden max-w-[180px] text-right text-[10px] uppercase leading-relaxed tracking-[0.15em] text-go-olive lg:block">
          {brief}
        </span>
      </div>

      <div className="mt-9 max-w-[740px] space-y-6 text-[13.5px] leading-7">
        {children}
      </div>

      <div className="mt-14 flex items-center justify-between border-t border-go-ink/30 pt-2 text-[10px] uppercase tracking-[0.3em] text-go-olive">
        <span>GO/101 — TECHNICAL DOSSIER</span>
        <span>§ {no}</span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Figure + caption (ruled)                                           */
/* ------------------------------------------------------------------ */
export function Figure({
  fig,
  title,
  children,
  note,
}: {
  fig: string;
  title: string;
  children: ReactNode;
  note?: string;
}) {
  return (
    <figure className="my-10">
      <div className="border-t-2 border-go-ink pt-6">{children}</div>
      <figcaption className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-go-ink/60 border-b border-b-go-ink/40 py-2.5 text-[11px] uppercase">
        <span className="font-semibold tracking-[0.2em]">Fig. {fig}</span>
        <span className="flex-1 border-l border-go-ink/30 pl-4 tracking-[0.18em] text-go-olive-deep">
          {title}
        </span>
        {note && (
          <span className="tracking-[0.15em] text-go-olive">{note}</span>
        )}
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/*  Code exhibit with tiny Go highlighter                              */
/* ------------------------------------------------------------------ */
const TOKEN_RE =
  /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')|\b(func|package|import|return|if|else|for|range|switch|case|default|type|struct|interface|map|chan|go|defer|select|var|const|break|continue|fallthrough)\b|\b(nil|true|false|iota)\b|\b(\d[\d_]*(?:\.\d+)?)\b|([A-Z]\w*)(?=[({])|(\w+)(?=\()/g;

function tokenize(code: string) {
  const out: { text: string; kind: string }[] = [];
  let last = 0;
  for (const m of code.matchAll(TOKEN_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push({ text: code.slice(last, idx), kind: "plain" });
    const kind = m[1]
      ? "comment"
      : m[2] || m[3]
        ? "string"
        : m[4]
          ? "keyword"
          : m[5]
            ? "constant"
            : m[6]
              ? "number"
              : m[7]
                ? "type"
                : "call";
    out.push({ text: m[0], kind });
    last = idx + m[0].length;
  }
  if (last < code.length) out.push({ text: code.slice(last), kind: "plain" });
  return out;
}

const CLASS: Record<string, string> = {
  comment: "text-go-olive italic",
  string: "text-go-olive-deep",
  keyword: "text-go-accent-text font-medium",
  constant: "text-go-accent-text font-medium",
  number: "text-go-ink",
  type: "text-go-ink font-medium",
  call: "text-go-ink",
  plain: "",
};

export function CodeBlock({
  exhibit,
  file,
  code,
}: {
  exhibit?: string;
  file: string;
  code: string;
}) {
  const lines = code.split("\n");
  return (
    <div className="my-8 border border-go-ink/40 bg-white/45">
      <div className="flex items-center justify-between border-b border-go-ink/40 px-4 py-2 text-[10px] uppercase tracking-[0.2em]">
        <span>
          {exhibit ? <span className="text-go-olive-deep">{exhibit} — </span> : null}
          {file}
        </span>
        <span className="text-go-olive">GO SOURCE / {lines.length} LN</span>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[12.5px] leading-6">
        <code>
          {lines.map((line, i) => (
            <span key={i} className="block whitespace-pre">
              {tokenize(line).map((t, j) => (
                <span key={j} className={CLASS[t.kind]}>
                  {t.text}
                </span>
              ))}
              {line.length === 0 ? " " : ""}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Terminal block                                                     */
/* ------------------------------------------------------------------ */
export function TerminalBlock({
  exhibit,
  lines,
}: {
  exhibit?: string;
  lines: { prompt?: boolean; text: string; out?: boolean }[];
}) {
  return (
    <div className="my-8 border border-go-ink/40 bg-go-ink text-go-paper">
      <div className="flex items-center justify-between border-b border-go-paper/25 px-4 py-2 text-[10px] uppercase tracking-[0.2em]">
        <span className="text-go-paper/70">
          {exhibit ? <span className="text-go-accent">{exhibit} — </span> : null}SHELL
        </span>
        <span className="text-go-paper/40">TTY-0</span>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[12.5px] leading-6">
        {lines.map((l, i) => (
          <span key={i} className="block whitespace-pre">
            {l.out ? (
              <span className="text-go-paper/60">{l.text}</span>
            ) : (
              <>
                <span className="text-go-accent">$ </span>
                <span>{l.text}</span>
              </>
            )}
          </span>
        ))}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Margin note                                                        */
/* ------------------------------------------------------------------ */
export function Note({
  label = "NOTE",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <aside className="my-8 border-l-2 border-go-accent bg-white/40 px-5 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-go-accent-text">
        {label}
      </div>
      <p className="mt-2 text-[12.5px] leading-6 text-go-olive-deep">{children}</p>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Prose helpers                                                      */
/* ------------------------------------------------------------------ */
export function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export function K({ children }: { children: ReactNode }) {
  return (
    <code className="border border-go-ink/25 bg-white/60 px-1.5 py-0.5 text-[12px] font-medium">
      {children}
    </code>
  );
}

export function InlineList({ items }: { items: [string, string][] }) {
  return (
    <ul className="my-2 divide-y divide-go-ink/15 border-y border-go-ink/25">
      {items.map(([term, def], i) => (
        <li key={i} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-6">
          <span className="w-56 shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-go-olive-deep">
            {term}
          </span>
          <span className="text-[13px] leading-6 text-go-ink/85">{def}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Data table                                                         */
/* ------------------------------------------------------------------ */
export function DataTable({
  head,
  rows,
  caption,
}: {
  head: string[];
  rows: string[][];
  caption?: string;
}) {
  return (
    <div className="my-8">
      <div className="overflow-x-auto border border-go-ink/40">
        <table className="w-full border-collapse text-left text-[12px]">
          <thead>
            <tr className="bg-go-ink text-go-paper">
              {head.map((h, i) => (
                <th
                  key={i}
                  className="border-b border-go-paper/30 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.25em]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="odd:bg-white/40 even:bg-transparent">
                {r.map((c, j) => (
                  <td
                    key={j}
                    className={
                      "border-t border-go-ink/20 px-4 py-2.5 leading-6 " +
                      (j === 0 ? "font-medium" : "text-go-ink/80")
                    }
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <div className="mt-2 text-[10.5px] uppercase tracking-[0.2em] text-go-olive">
          {caption}
        </div>
      )}
    </div>
  );
}
