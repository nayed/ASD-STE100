import type { ComponentType } from "react";
import type { BarTheme } from "../components/theme";
import { HOME_SLUG } from "../site";

export interface ArticleMeta {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  /** publication date, YYYY-MM-DD; orders "recently added" */
  added: string;
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
    added: "2026-10-04",
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
    added: "2026-10-04",
  },
  {
    slug: "random-forest",
    title: "Random forest",
    summary: "How a team of randomised decision trees votes its way past overfitting, with a live forest to train.",
    tags: ["machine learning", "algorithms", "decision trees"],
    load: () => import("./random-forest"),
    added: "2026-10-05",
    bar: {
      page: "#fbfbf7",
      bg: "rgba(251, 251, 247, 0.95)",
      fg: "#191914",
      muted: "#6e6e58",
      accent: "#0e7a3c",
      border: "#191914",
      panel: "#fbfbf7",
      hover: "rgba(14, 122, 60, 0.09)",
      headBg: "#191914",
      headFg: "#fbfbf7",
      tag: "#0e7a3c",
      font: '"IBM Plex Mono", ui-monospace, monospace',
      size: "10.5px",
      case: "uppercase",
      tracking: "0.16em",
      titleFont: '"IBM Plex Mono", ui-monospace, monospace',
      summaryFont: '"IBM Plex Mono", ui-monospace, monospace',
    },
  },
  {
    slug: "go-programming",
    title: "The Go programming language",
    summary: "Go from zero: program anatomy, types, slices and maps, interfaces, errors, goroutines and channels.",
    tags: ["go", "golang", "languages", "concurrency"],
    load: () => import("./go-programming"),
    added: "2026-10-05",
    bar: {
      page: "#f2f0e9",
      bg: "rgba(242, 240, 233, 0.95)",
      fg: "#17170f",
      muted: "#6e7160",
      accent: "#00add8",
      border: "#17170f",
      panel: "#f2f0e9",
      hover: "rgba(255, 255, 255, 0.6)",
      headBg: "#17170f",
      headFg: "#f2f0e9",
      tag: "#00728f",
      font: '"IBM Plex Mono", ui-monospace, monospace',
      size: "10.5px",
      case: "uppercase",
      tracking: "0.2em",
      titleFont: '"IBM Plex Mono", ui-monospace, monospace',
      summaryFont: '"IBM Plex Mono", ui-monospace, monospace',
    },
  },
  {
    slug: "podman-basics",
    title: "Podman from zero",
    summary: "Containers from first principles, then Podman: images, rootless containers, pods, Containerfiles and systemd.",
    tags: ["podman", "containers", "devops", "linux"],
    load: () => import("./podman-basics"),
    added: "2026-10-06",
    bar: {
      page: "#fbfbf8",
      bg: "rgba(251, 251, 248, 0.95)",
      fg: "#11140f",
      muted: "#70755e",
      accent: "#6d28d9",
      border: "#11140f",
      panel: "#fbfbf8",
      hover: "rgba(17, 20, 15, 0.05)",
      headBg: "#11140f",
      headFg: "#fbfbf8",
      tag: "#6d28d9",
      font: '"IBM Plex Mono", ui-monospace, monospace',
      size: "10px",
      case: "uppercase",
      tracking: "0.16em",
      titleFont: '"IBM Plex Mono", ui-monospace, monospace',
      summaryFont: '"IBM Plex Mono", ui-monospace, monospace',
    },
  },
  {
    slug: "ci-cd",
    title: "CI/CD with Git and GitHub",
    summary: "Version control, pull requests, pipelines and deployment, with a pipeline you can run and break in the browser.",
    tags: ["ci/cd", "git", "github", "devops"],
    load: () => import("./ci-cd"),
    added: "2026-10-09",
    bar: {
      page: "#fbf9f3",
      bg: "rgba(251, 249, 243, 0.95)",
      fg: "#3c3836",
      muted: "#665c54",
      accent: "#3d7151",
      border: "#3c3836",
      panel: "#fffefb",
      hover: "#ece7da",
      headBg: "#3c3836",
      headFg: "#fbf9f3",
      tag: "#3d7151",
      font: '"IBM Plex Mono", ui-monospace, monospace',
      size: "10.5px",
      case: "uppercase",
      tracking: "0.16em",
      titleFont: '"IBM Plex Mono", ui-monospace, monospace',
      summaryFont: '"IBM Plex Mono", ui-monospace, monospace',
    },
  },
];

export function findArticle(slug: string | undefined): ArticleMeta | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/** the A–Z index of every article; "articles" is therefore not a valid slug */
export const INDEX_PATH = "/articles";

/** articles live at "/<slug>"; the home article lives at "/" */
export function articlePath(slug: string): string {
  return slug === HOME_SLUG ? "/" : `/${slug}`;
}
