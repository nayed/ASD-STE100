/**
 * The retrieval engine of RAG-100, without React. It is a line-by-line port of eval.py (Exhibit C):
 * the same words, the same BM25, the same rank fusion, so the page and the script give the same ranks.
 * Meaning search cannot run in the browser (it needs the model), so it reads the measured COS table.
 */

import { ASK, CHUNKS, COS, QUESTIONS, THRESHOLD } from "./data";

const STOP = new Set(
  ("a an the and or of to in on at for by is are was be it its this that with from " +
    "as do does did i my you your what which when where why how can must if not too").split(" "),
);

/** lower-case words and numbers, no stop words, a plural "s" removed */
export function words(s: string): string[] {
  const found = s.toLowerCase().match(/[a-z0-9]+(?:\.[0-9]+)?/g) ?? [];
  return found
    .filter((w) => !STOP.has(w))
    .map((w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
}

export type Index = { docs: string[][]; avg: number; df: Map<string, number> };

export function buildIndex(texts: string[]): Index {
  const docs = texts.map(words);
  const avg = docs.reduce((n, d) => n + d.length, 0) / docs.length;
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1);
  return { docs, avg, df };
}

/** BM25 score of every document for one question (k1 = 1.2, b = 0.75) */
export function bm25(index: Index, question: string, k1 = 1.2, b = 0.75): number[] {
  const { docs, avg, df } = index;
  const q = words(question);
  return docs.map((d) => {
    let s = 0;
    for (const t of q) {
      const tf = d.filter((w) => w === t).length;
      if (!tf) continue;
      const n = df.get(t)!;
      const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
      s += (idf * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * d.length) / avg));
    }
    return s;
  });
}

/** the shared words of a question and a document */
export function shared(index: Index, question: string, doc: number): string[] {
  const d = new Set(index.docs[doc]);
  return [...new Set(words(question).filter((t) => d.has(t)))];
}

export const IDS = CHUNKS.map((c) => c.id);
export const MANUAL = buildIndex(CHUNKS.map((c) => `${c.title} ${c.text}`));

export type Ranking = Map<string, number>; // chunk id → rank (1 = best)

/** rank by score, highest first; ties keep the manual's order (as numpy's stable argsort) */
export function ranking(score: number[], positiveOnly = false): Ranking {
  const order = score.map((_, i) => i).sort((a, b) => score[b] - score[a]);
  const r: Ranking = new Map();
  order.filter((i) => !positiveOnly || score[i] > 0).forEach((i, n) => r.set(IDS[i], n + 1));
  return r;
}

/** reciprocal rank fusion of two rankings (k = 60) */
export function fuse(a: Ranking, b: Ranking, k = 60): Ranking {
  const s = new Map(IDS.map((id) => [id, [a, b].reduce((n, r) => n + (r.has(id) ? 1 / (k + r.get(id)!) : 0), 0)]));
  const r: Ranking = new Map();
  [...IDS].sort((x, y) => s.get(y)! - s.get(x)!).forEach((id, n) => r.set(id, n + 1));
  return r;
}

export type Method = "keyword" | "meaning" | "hybrid";

/** row of COS for a question, or null when the question is not one of the measured ones */
export function cosRow(question: string): number[] | null {
  const i = ASK.indexOf(question);
  return i < 0 ? null : COS[i];
}

export type Hit = { id: string; index: number; score: number; rank: number };

/** ranked chunks for one question and one method (meaning and hybrid need a measured question) */
export function search(question: string, method: Method): Hit[] | null {
  const kw = bm25(MANUAL, question);
  const cos = cosRow(question);
  if (method !== "keyword" && !cos) return null;
  let r: Ranking;
  let score: number[];
  if (method === "keyword") {
    r = ranking(kw, true);
    score = kw;
  } else if (method === "meaning") {
    r = ranking(cos!);
    score = cos!;
  } else {
    const a = ranking(kw, true);
    const b = ranking(cos!);
    r = fuse(a, b);
    score = IDS.map((id) => [a, b].reduce((n, x) => n + (x.has(id) ? 1 / (60 + x.get(id)!) : 0), 0));
  }
  return IDS.map((id, index) => ({ id, index, score: score[index], rank: r.get(id) ?? Infinity }))
    .filter((h) => Number.isFinite(h.rank))
    .sort((a, b) => a.rank - b.rank);
}

/** Fig. 08: the rank of each gold chunk for each method, and the three measures */
export function evaluate() {
  const rows = QUESTIONS.map((item) => {
    const kw = ranking(bm25(MANUAL, item.q), true);
    const mn = ranking(cosRow(item.q)!);
    const hy = fuse(kw, mn);
    return [kw, mn, hy].map((r) => r.get(item.gold) ?? null);
  });
  const n = rows.length;
  const measure = (m: number) => ({
    r1: rows.filter((row) => row[m] === 1).length,
    r3: rows.filter((row) => row[m] !== null && row[m]! <= 3).length,
    mrr: rows.reduce((s, row) => s + (row[m] ? 1 / row[m]! : 0), 0) / n,
  });
  return { rows, n, measures: [measure(0), measure(1), measure(2)] };
}

/** the chunks that go to the writer: the best 3 by meaning, if they pass the threshold */
export function kept(question: string): string[] {
  const cos = cosRow(question);
  if (!cos) return [];
  return [...ranking(cos)]
    .filter(([id, r]) => r <= 3 && cos[IDS.indexOf(id)] >= THRESHOLD)
    .sort((a, b) => a[1] - b[1])
    .map(([id]) => id);
}

export const INSTRUCTION =
  "Answer the question with only the chunks below. After each sentence, write the identity of its chunk, for example [C-02]. If the chunks do not contain the answer, write: The documents do not contain the answer.";

export function prompt(question: string, chunkIds: string[]) {
  return {
    instruction: INSTRUCTION,
    chunks: chunkIds.map((id) => CHUNKS.find((c) => c.id === id)!),
    question,
  };
}

/** a rough token count: about four characters for each token in English */
export const tokens = (s: string) => Math.ceil(s.length / 4);
