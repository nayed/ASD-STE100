import type { ComponentType } from "react";
import { HOME_SLUG } from "../site";

export interface ArticleMeta {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  /** each article is its own lazy chunk, with its own design */
  load: () => Promise<{ default: ComponentType }>;
}

export const ARTICLES: ArticleMeta[] = [
  {
    slug: "asd-ste100",
    title: "ASD-STE100",
    summary: "Simplified Technical English, explained in Simplified Technical English.",
    tags: ["writing", "documentation", "standards"],
    load: () => import("./asd-ste100"),
  },
  {
    slug: "stack-vs-heap",
    title: "Stack vs heap",
    summary: "Two places a program keeps its data, and why they behave so differently.",
    tags: ["memory", "systems"],
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
