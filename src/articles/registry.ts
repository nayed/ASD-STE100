import type { ComponentType } from "react";
import type { BarTheme } from "../components/theme";
import { HOME_SLUG } from "../site";

export interface ArticleMeta {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  /** colours and type of the shared site bar on this article; unset fields use DEFAULT_BAR */
  bar?: Partial<BarTheme>;
  /** each article is its own lazy chunk, with its own design */
  load: () => Promise<{ default: ComponentType }>;
}

export const ARTICLES: ArticleMeta[] = [
  {
    slug: "asd-ste100",
    title: "ASD-STE100",
    summary: "Simplified Technical English, explained in Simplified Technical English.",
    tags: ["writing", "documentation", "standards"],
    bar: {
      page: "#f2eee4",
      bg: "rgba(242, 238, 228, 0.95)",
      fg: "#17161a",
      muted: "#6b6558",
      accent: "#b3261e",
      border: "#17161a",
      panel: "#f2eee4",
      hover: "#e7e1d3",
      headBg: "#17161a",
      headFg: "#f2eee4",
      tag: "#2c4c6b",
      font: '"IBM Plex Mono", ui-monospace, monospace',
      size: "10.5px",
      case: "uppercase",
      tracking: "0.18em",
      titleFont: '"Archivo", ui-sans-serif, system-ui, sans-serif',
      summaryFont: '"Newsreader", ui-serif, Georgia, serif',
      summaryStyle: "italic",
    },
    load: () => import("./asd-ste100"),
  },
  {
    slug: "stack-vs-heap",
    title: "Stack vs heap",
    summary: "Two places a program keeps its data, and why they behave so differently.",
    tags: ["memory", "systems"],
    bar: {
      page: "#020617",
      bg: "rgba(2, 6, 23, 0.9)",
      fg: "#e2e8f0",
      muted: "#64748b",
      accent: "#5eead4",
      border: "#1e293b",
      panel: "#0f172a",
      hover: "#1e293b",
      headBg: "#1e293b",
      headFg: "#94a3b8",
      tag: "#a5b4fc",
      font: "ui-monospace, SFMono-Regular, monospace",
      size: "12px",
      case: "none",
      tracking: "0",
    },
    load: () => import("./stack-vs-heap"),
  },
];

export function findArticle(slug: string | undefined): ArticleMeta | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/** articles live at "/<slug>"; the home article lives at "/" */
export function articlePath(slug: string): string {
  return slug === HOME_SLUG ? "/" : `/${slug}`;
}
