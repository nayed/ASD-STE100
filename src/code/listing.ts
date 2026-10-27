import type { CSSProperties } from "react";

/** one token: its text, its colour when it is not the default one, Shiki's font-style flags (1 italic, 2 bold, 4 underline) */
export type Tok = { t: string; c?: string; f?: number };

/** a source file highlighted at build time: `import x from "./file.py?highlight"` (scripts/highlight-plugin.ts) */
export type Listing = { lines: Tok[][]; bg: string; fg: string; ln: string; hl: string };

/** the surface of a listing; articles read --code-ln and --code-hl for their line numbers and the active line */
export function listingStyle(l: Listing): CSSProperties {
  return { background: l.bg, color: l.fg, "--code-bg": l.bg, "--code-ln": l.ln, "--code-hl": l.hl } as CSSProperties;
}

/** the text of one line */
export const lineText = (line: Tok[]) => line.map((tok) => tok.t).join("");
