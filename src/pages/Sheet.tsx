import type { ReactNode } from "react";
import { ARTICLES } from "../articles/registry";
import type { BarTheme } from "../components/theme";
import { lastChange } from "../search/search";
import "./sheet.css";

/*
 * What the wiki's own pages share (the 404 page, the A–Z index): one controlled document on a datasheet's
 * cold white. The styles are in sheet.css, scoped under .wk; each page adds its own root class.
 */

const MONO = '"IBM Plex Mono", ui-monospace, monospace';
export const SHEET_BAR: Partial<BarTheme> = {
  page: "#f5f8f9",
  bg: "rgba(245, 248, 249, 0.95)",
  fg: "#0d1316",
  muted: "#5b6359",
  accent: "#006d77",
  border: "#0d1316",
  panel: "#fbfcfd",
  hover: "rgba(0, 109, 119, 0.08)",
  headBg: "#0d1316",
  headFg: "#f5f8f9",
  tag: "#006d77",
  font: MONO,
  size: "10px",
  case: "uppercase",
  tracking: "0.16em",
  titleFont: MONO,
  summaryFont: MONO,
};

/** the wiki's current revision: the newest publication or edit date in the registry */
export const REVISION = ARTICLES.map(lastChange).sort().at(-1)!;

/** the ruled strip of a printed form: one cell per fact, the first one the document itself */
export function Strip({ cells }: { cells: { k: string; v: ReactNode; className?: string }[] }) {
  return (
    <header className="strip">
      {cells.map((c, i) => (
        <div key={c.k} className={`cell${i === 0 ? " doc" : ""}${c.className ? ` ${c.className}` : ""}`}>
          <span className="k">{c.k}</span>
          <span className="v">{c.v}</span>
        </div>
      ))}
    </header>
  );
}
