import { ARTICLES, type ArticleMeta } from "../articles/registry";

/** lower case, no accents: "Saïd" matches "said" */
export function norm(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** A–Z by title, ignoring case and accents */
export function byTitle(a: ArticleMeta, b: ArticleMeta): number {
  return a.title.localeCompare(b.title, "en", { sensitivity: "base", numeric: true });
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

/** every article that matches all terms, best match first, then A–Z */
export function searchArticles(query: string): ArticleMeta[] {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [...ARTICLES].sort(byTitle);
  return ARTICLES.map((a) => ({ a, s: score(a, terms) }))
    .filter((r) => r.s > 0)
    .sort((x, y) => y.s - x.s || byTitle(x.a, y.a))
    .map((r) => r.a);
}

/** newest first, then A–Z */
export function recentArticles(limit: number): ArticleMeta[] {
  return [...ARTICLES].sort((a, b) => b.added.localeCompare(a.added) || byTitle(a, b)).slice(0, limit);
}

/** articles grouped by the first letter of the title; titles that start with a digit or a symbol go under "#" */
export function groupByLetter(list: ArticleMeta[]): { letter: string; articles: ArticleMeta[] }[] {
  const groups = new Map<string, ArticleMeta[]>();
  for (const a of [...list].sort(byTitle)) {
    const first = norm(a.title).charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : "#";
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(a);
  }
  return [...groups.entries()]
    .sort(([x], [y]) => (x === "#" ? -1 : y === "#" ? 1 : x.localeCompare(y)))
    .map(([letter, articles]) => ({ letter, articles }));
}
