import { ARTICLES, articlePath, INDEX_PATH } from "../articles/registry";
import { norm } from "./search";

/** one column of a correction: the typed character, the character the real address wants there, or both */
export type Op =
  | { kind: "same"; ch: string }
  | { kind: "change"; typed: string; want: string }
  | { kind: "remove"; typed: string }
  | { kind: "add"; want: string };

export interface Nearest {
  /** the real address, without its leading slash */
  slug: string;
  title: string;
  path: string;
  /** what the reader typed, decoded, without the slashes at the ends */
  typed: string;
  /** the edits that turn `typed` into `slug`, left to right */
  ops: Op[];
  /** why it is near: the spelling, a word of the address, or only one of the article's tags (then `tag` names it) */
  reason: "spelling" | "word" | "tag";
  tag?: string;
}

/** one alignment of the fewest edits, read back from the end of both strings */
function walk(A: string[], B: string[]): Op[] {
  const d = A.map(() => new Array<number>(B.length + 1).fill(0));
  d.push(new Array<number>(B.length + 1).fill(0));
  for (let i = 0; i <= A.length; i++) d[i][0] = i;
  for (let j = 0; j <= B.length; j++) d[0][j] = j;
  for (let i = 1; i <= A.length; i++)
    for (let j = 1; j <= B.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));

  const ops: Op[] = [];
  let i = A.length;
  let j = B.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && A[i - 1] === B[j - 1] && d[i][j] === d[i - 1][j - 1]) {
      ops.push({ kind: "same", ch: A[--i] });
      j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) ops.push({ kind: "remove", typed: A[--i] });
    else if (j > 0 && d[i][j] === d[i][j - 1] + 1) ops.push({ kind: "add", want: B[--j] });
    else ops.push({ kind: "change", typed: A[--i], want: B[--j] });
  }
  return ops.reverse();
}

/** the number of separate blocks of edits */
const blocks = (ops: Op[]) => ops.filter((o, i) => o.kind !== "same" && (i === 0 || ops[i - 1].kind === "same")).length;

/**
 * The fewest edits (Levenshtein) that turn `a` into `b`, as columns that line the two strings up.
 * Characters compare exactly, so a capital letter counts as a change: the address is case-sensitive.
 * Of the two readings (from the end, from the start), it keeps the one with fewer blocks, so that extra
 * characters come out as one block: "wiki/" removed before the slug, ".php" removed after it.
 */
export function align(a: string, b: string): Op[] {
  const A = [...a];
  const B = [...b];
  const fromEnd = walk(A, B);
  const fromStart = walk([...A].reverse(), [...B].reverse()).reverse();
  return blocks(fromStart) < blocks(fromEnd) ? fromStart : fromEnd;
}

const distance = (a: string, b: string) => align(a, b).filter((o) => o.kind !== "same").length;

/** the forms of the typed address worth comparing: the whole path and each segment, in lower case, with "_" and spaces as "-" */
function variants(typed: string): string[] {
  const whole = norm(typed).replace(/\.(html?|php|aspx?)$/, "");
  const forms = [whole, ...whole.split("/")].map((s) => s.replace(/[\s_.+]+/g, "-")).filter(Boolean);
  return [...new Set(forms)];
}

const wordsOf = (s: string) => norm(s).split(/[^a-z0-9]+/).filter((w) => w.length >= 2);

/** every address a reader can open: the articles, and the A–Z index */
const TARGETS = [
  ...ARTICLES.map((a) => ({ slug: a.slug, title: a.title, path: articlePath(a.slug), words: new Set(wordsOf(a.slug)), tags: a.tags })),
  { slug: INDEX_PATH.slice(1), title: "All articles, A–Z", path: INDEX_PATH, words: new Set(["articles", "index"]), tags: [] as string[] },
];

/**
 * The real address nearest to a path that has no page, or null when none is near.
 * Near means: some form of the path is within one edit per three letters of the address
 * ("websockets", "stack-heap", "wiki/rag"), or one of its words is a word of the address ("go", "podman"), or else of its tags.
 */
export function nearestArticle(pathname: string): Nearest | null {
  let typed: string;
  try {
    typed = decodeURIComponent(pathname);
  } catch {
    typed = pathname;
  }
  typed = typed.replace(/^\/+|\/+$/g, "");
  if (!typed || typed.length > 80) return null;

  const forms = variants(typed);
  const words = new Set(forms.flatMap(wordsOf));
  let best: { t: (typeof TARGETS)[number]; score: number; reason: Nearest["reason"]; tag?: string } | null = null;
  for (const t of TARGETS) {
    const limit = Math.max(1, Math.floor(t.slug.length / 3));
    const d = Math.min(...forms.map((f) => distance(f, t.slug)));
    const tag = t.tags.find((g) => wordsOf(g).some((w) => words.has(w)));
    const near =
      d <= limit ? { score: d, reason: "spelling" as const }
      : [...words].some((w) => t.words.has(w)) ? { score: 100 + d, reason: "word" as const }
      : tag ? { score: 200 + d, reason: "tag" as const, tag }
      : null;
    if (near && near.score < (best?.score ?? Infinity)) best = { t, ...near };
  }
  if (!best) return null;
  const { slug, title, path } = best.t;
  return { slug, title, path, typed, ops: align(typed, slug), reason: best.reason, tag: best.tag };
}
