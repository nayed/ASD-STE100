/**
 * A small random forest for the interactive example (Fig. 6).
 * Two features (x, y in 0..1), two classes (0 = A, 1 = B).
 * CART trees with Gini splits; each split tests one random feature of two (m = 1, p = 2).
 */

export interface Point {
  x: number;
  y: number;
  /** class: 0 = A, 1 = B */
  l: 0 | 1;
}

export type TreeNode =
  | { leaf: 1; p: number }
  | { leaf: 0; f: 0 | 1; t: number; l: TreeNode; r: TreeNode };

export interface Tree {
  root: TreeNode;
  /** indices of the points this tree did not train on */
  oob: number[];
}

export type Preset = "blobs" | "moons" | "ring";

function gauss(): number {
  let u = 0;
  let v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const cl = (v: number) => Math.min(0.985, Math.max(0.015, v));

export const PRESETS: Record<Preset, () => Point[]> = {
  blobs() {
    const P: Point[] = [];
    for (let k = 0; k < 70; k++) P.push({ x: cl(0.32 + gauss() * 0.115), y: cl(0.32 + gauss() * 0.115), l: 0 });
    for (let k = 0; k < 70; k++) P.push({ x: cl(0.68 + gauss() * 0.115), y: cl(0.68 + gauss() * 0.115), l: 1 });
    return P;
  },
  moons() {
    const P: Point[] = [];
    for (let k = 0; k < 80; k++) {
      const t = Math.random() * Math.PI;
      P.push({ x: cl(0.5 + (Math.cos(t) - 0.5) * 0.28 + gauss() * 0.04), y: cl(0.5 + (Math.sin(t) - 0.25) * 0.26 + gauss() * 0.04), l: 0 });
    }
    for (let k = 0; k < 80; k++) {
      const t = Math.random() * Math.PI;
      P.push({ x: cl(0.5 + (0.5 - Math.cos(t)) * 0.28 + gauss() * 0.04), y: cl(0.5 + (0.25 - Math.sin(t)) * 0.26 + gauss() * 0.04), l: 1 });
    }
    return P;
  },
  ring() {
    const P: Point[] = [];
    for (let k = 0; k < 55; k++) {
      const a = Math.random() * 6.2832;
      const r = 0.13 * Math.sqrt(Math.random());
      P.push({ x: cl(0.5 + r * Math.cos(a)), y: cl(0.5 + r * Math.sin(a)), l: 0 });
    }
    for (let k = 0; k < 95; k++) {
      const a = Math.random() * 6.2832;
      const r = 0.27 + Math.random() * 0.09;
      P.push({ x: cl(0.5 + r * Math.cos(a)), y: cl(0.5 + r * Math.sin(a)), l: 1 });
    }
    return P;
  },
};

function build(pts: Point[], idxs: number[], depth: number): TreeNode {
  let a = 0;
  for (const i of idxs) if (pts[i].l === 0) a++;
  const p = a / idxs.length;
  if (depth === 0 || idxs.length < 3 || p === 0 || p === 1) return { leaf: 1, p };

  const f: 0 | 1 = Math.random() < 0.5 ? 0 : 1;
  const key = f === 0 ? "x" : "y";
  const vals = idxs.map((i) => pts[i][key]);
  const sorted = [...vals].sort((x, y) => x - y);
  const uq = [...new Set(sorted)];
  if (uq.length < 2) return { leaf: 1, p };

  /* candidate thresholds: every midpoint for few values, else 13 quantiles */
  const cands: number[] = [];
  if (uq.length <= 13) {
    for (let k = 0; k < uq.length - 1; k++) cands.push((uq[k] + uq[k + 1]) / 2);
  } else {
    for (let k = 1; k <= 13; k++) {
      const v = sorted[Math.floor((sorted.length * k) / 14)];
      if (v > uq[0] && v < uq[uq.length - 1]) cands.push(v);
    }
  }

  const g0 = 1 - p * p - (1 - p) * (1 - p);
  let best: number | null = null;
  let bestGain = 1e-9;
  for (const t of cands) {
    let nl = 0;
    let al = 0;
    for (let k = 0; k < vals.length; k++) {
      if (vals[k] <= t) {
        nl++;
        if (pts[idxs[k]].l === 0) al++;
      }
    }
    if (nl === 0 || nl === vals.length) continue;
    const pl = al / nl;
    const pr = (a - al) / (idxs.length - nl);
    const gain =
      g0 -
      (nl / idxs.length) * (1 - pl * pl - (1 - pl) * (1 - pl)) -
      ((idxs.length - nl) / idxs.length) * (1 - pr * pr - (1 - pr) * (1 - pr));
    if (gain > bestGain + Math.random() * 1e-6) {
      bestGain = gain;
      best = t;
    }
  }
  if (best === null) return { leaf: 1, p };

  const L: number[] = [];
  const R: number[] = [];
  for (const i of idxs) (pts[i][key] <= best ? L : R).push(i);
  if (!L.length || !R.length) return { leaf: 1, p };
  return { leaf: 0, f, t: best, l: build(pts, L, depth - 1), r: build(pts, R, depth - 1) };
}

/** share of class A in the leaf that (x, y) reaches */
export function predict(node: TreeNode, x: number, y: number): number {
  while (!node.leaf) {
    const v = node.f === 0 ? x : y;
    node = v <= node.t ? node.l : node.r;
  }
  return node.p;
}

export function trainForest(pts: Point[], trees: number, depth: number): Tree[] {
  const n = pts.length;
  const out: Tree[] = [];
  for (let b = 0; b < trees; b++) {
    const bag = new Uint8Array(n);
    const idx: number[] = [];
    for (let k = 0; k < n; k++) {
      const j = (Math.random() * n) | 0;
      bag[j] = 1;
      idx.push(j);
    }
    const oob: number[] = [];
    for (let j = 0; j < n; j++) if (!bag[j]) oob.push(j);
    out.push({ root: build(pts, idx, depth), oob });
  }
  return out;
}

/** out-of-bag accuracy: mean of the single trees, and of the full vote */
export function oobScores(pts: Point[], trees: Tree[]): { mean: number | null; forest: number | null } {
  const n = pts.length;
  let sum = 0;
  let cnt = 0;
  const vA = new Int16Array(n);
  const vN = new Int16Array(n);
  for (const t of trees) {
    let ok = 0;
    let tot = 0;
    for (const j of t.oob) {
      const c = predict(t.root, pts[j].x, pts[j].y) >= 0.5 ? 0 : 1;
      if (c === pts[j].l) ok++;
      tot++;
      if (c === 0) vA[j]++;
      vN[j]++;
    }
    if (tot) {
      sum += ok / tot;
      cnt++;
    }
  }
  let fok = 0;
  let ftot = 0;
  for (let j = 0; j < n; j++) {
    if (vN[j] > 0) {
      const c = vA[j] / vN[j] >= 0.5 ? 0 : 1;
      if (c === pts[j].l) fok++;
      ftot++;
    }
  }
  return { mean: cnt ? sum / cnt : null, forest: ftot ? fok / ftot : null };
}
