import { ARTICLES, type ArticleMeta } from "../articles/registry";

/** lower case, no accents: "Saïd" matches "said" */
function norm(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function score(a: ArticleMeta, terms: string[]): number {
  const title = norm(a.title);
  const tags = a.tags.map(norm);
  const rest = norm(`${a.slug} ${a.summary}`);
  let total = 0;
  for (const t of terms) {
    if (title.startsWith(t)) total += 8;
    else if (title.includes(t)) total += 5;
    else if (tags.some((g) => g.startsWith(t))) total += 3;
    else if (rest.includes(t)) total += 1;
    else return 0; // every term must match somewhere
  }
  return total;
}

/** an empty query lists every article, in registry order */
export function searchArticles(query: string): ArticleMeta[] {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return ARTICLES;
  return ARTICLES.map((a) => ({ a, s: score(a, terms) }))
    .filter((r) => r.s > 0)
    .sort((x, y) => y.s - x.s)
    .map((r) => r.a);
}
