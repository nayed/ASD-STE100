import type { CSSProperties } from "react";

/**
 * How the shared site bar looks on one article. The bar keeps the same
 * layout and behaviour everywhere; only these values change.
 */
export interface BarTheme {
  /** page background behind the bar and the article */
  page: string;
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  border: string;
  /** search dropdown */
  panel: string;
  hover: string;
  headBg: string;
  headFg: string;
  tag: string;
  /** labels: owner name, placeholder, dropdown header */
  font: string;
  size: string;
  case: "uppercase" | "none";
  tracking: string;
  /** result titles */
  titleFont: string;
  /** result summaries */
  summaryFont: string;
  summaryStyle: "italic" | "normal";
}

export const DEFAULT_BAR: BarTheme = {
  page: "#ffffff",
  bg: "rgba(255, 255, 255, 0.95)",
  fg: "#171717",
  muted: "#737373",
  accent: "#2563eb",
  border: "#e5e5e5",
  panel: "#ffffff",
  hover: "#f5f5f5",
  headBg: "#f5f5f5",
  headFg: "#525252",
  tag: "#2563eb",
  font: "ui-sans-serif, system-ui, sans-serif",
  size: "13px",
  case: "none",
  tracking: "0",
  titleFont: "ui-sans-serif, system-ui, sans-serif",
  summaryFont: "ui-sans-serif, system-ui, sans-serif",
  summaryStyle: "normal",
};

export function barVars(t: Partial<BarTheme> = {}): CSSProperties {
  const v = { ...DEFAULT_BAR, ...t };
  return {
    "--page-bg": v.page,
    "--bar-bg": v.bg,
    "--bar-fg": v.fg,
    "--bar-muted": v.muted,
    "--bar-accent": v.accent,
    "--bar-border": v.border,
    "--bar-panel": v.panel,
    "--bar-hover": v.hover,
    "--bar-head-bg": v.headBg,
    "--bar-head-fg": v.headFg,
    "--bar-tag": v.tag,
    "--bar-font": v.font,
    "--bar-size": v.size,
    "--bar-case": v.case,
    "--bar-tracking": v.tracking,
    "--bar-title-font": v.titleFont,
    "--bar-summary-font": v.summaryFont,
    "--bar-summary-style": v.summaryStyle,
  } as CSSProperties;
}
