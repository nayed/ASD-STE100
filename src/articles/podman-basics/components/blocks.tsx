/** Code / terminal blocks and dossier tables. */

import type { ReactNode } from "react";

export type TL = { t: string; c?: "cmd" | "out" | "com" | "kw" | "sec" | "dim" | "head" };

function Line({ l }: { l: TL }) {
  if (l.c === "head")
    return <div className="mt-3 border-b border-pd-paper/20 pb-1 text-[10px] uppercase tracking-[0.2em] text-pd-paper/40 first:mt-0">{l.t}</div>;
  if (l.c === "cmd")
    return (
      <div className="whitespace-pre">
        <span className="font-bold text-pd-purple">$ </span>
        <span className="text-pd-paper">{l.t}</span>
      </div>
    );
  if (l.c === "com") return <div className="whitespace-pre text-pd-olive2">{l.t}</div>;
  if (l.c === "out") return <div className="whitespace-pre text-pd-paper/55">{l.t}</div>;
  if (l.c === "dim") return <div className="whitespace-pre text-pd-paper/30">{l.t}</div>;
  if (l.c === "sec") return <div className="whitespace-pre font-bold text-pd-purple">{l.t}</div>;
  if (l.c === "kw") {
    const i = l.t.indexOf(" ");
    const first = i === -1 ? l.t : l.t.slice(0, i);
    const rest = i === -1 ? "" : l.t.slice(i);
    return (
      <div className="whitespace-pre">
        <span className="font-semibold text-pd-purple">{first}</span>
        <span className="text-pd-paper/85">{rest}</span>
      </div>
    );
  }
  return <div className="whitespace-pre text-pd-paper/85">{l.t}</div>;
}

export function Term({ title, right = "TTY", lines }: { title: string; right?: string; lines: TL[] }) {
  return (
    <div className="min-w-0 border border-pd-ink bg-pd-ink text-pd-paper shadow-[6px_6px_0_0_rgba(17,20,15,0.14)]">
      <div className="flex items-center justify-between border-b border-pd-paper/15 px-4 py-2 text-[9px] uppercase tracking-[0.22em] text-pd-paper/50">
        <span>{title}</span>
        <span>{right}</span>
      </div>
      <div className="overflow-x-auto p-4 text-[12px] leading-[1.9] md:p-5 md:text-[12.5px]">
        {lines.map((l, i) => (
          <Line key={i} l={l} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- tables ---------------- */

export function CmdTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[11.5px]">
        <thead>
          <tr className="bg-pd-ink text-pd-paper">
            <Th className="w-[180px]">COMMAND</Th>
            <Th>WHAT IT DOES</Th>
            <Th className="w-[220px]">FIRST FLAG TO LEARN</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([c, d, f]) => (
            <tr key={c} className="group transition-colors hover:bg-pd-ink/[0.04]">
              <Td className="font-semibold whitespace-nowrap">{c}</Td>
              <Td className="text-pd-ink/75">{d}</Td>
              <Td className="text-pd-ink/60">{f}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CompareTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[11.5px]">
        <thead>
          <tr className="bg-pd-ink text-pd-paper">
            <Th className="w-[170px]">CONCERN</Th>
            <Th className="text-pd-paper">PODMAN</Th>
            <Th>DOCKER</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, a, b], i) => (
            <tr key={k} className={`transition-colors hover:bg-pd-ink/[0.04] ${i % 2 ? "bg-pd-ink/[0.02]" : ""}`}>
              <Td className="font-semibold">{k}</Td>
              <Td className="text-pd-ink/85">{a}</Td>
              <Td className="text-pd-ink/55">{b}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GlossaryTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[11.5px]">
        <thead>
          <tr className="bg-pd-ink text-pd-paper">
            <Th className="w-[200px]">TERM</Th>
            <Th>PRECISE MEANING</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([t, d]) => (
            <tr key={t} className="transition-colors hover:bg-pd-ink/[0.04]">
              <Td className="font-bold">{t}</Td>
              <Td className="text-pd-ink/75">{d}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <th className={`border border-pd-ink px-3 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.18em] ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`border border-pd-ink/20 px-3 py-2.5 align-top leading-[1.7] ${className}`}>{children}</td>;
}
