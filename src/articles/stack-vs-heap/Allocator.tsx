/**
 * Fig. 03: a first-fit allocator on a small arena of 768 bytes (48 units of 16 B).
 * The block sizes follow glibc on x86-64: the request plus an 8-byte header, rounded up to 16 B,
 * so malloc(24) takes 32 B, malloc(56) takes 64 B and malloc(120) takes 128 B.
 * Free blocks join their free neighbours. The arena never grows, so fragmentation shows.
 */

import { useState } from "react";

const UNIT = 16;
const UNITS = 48;
const ROW = 16;
const REQUESTS = [24, 56, 120];

type Block = { id: number; start: number; size: number };
type State = { blocks: Block[]; next: number; fresh: number | null; event: string; failed: boolean };

const hex = (units: number) => `+0x${(units * UNIT).toString(16).toUpperCase().padStart(3, "0")}`;
const bytes = (units: number) => `${units * UNIT} B`;
const unitsFor = (req: number) => Math.ceil((req + 8) / UNIT);

function holes(blocks: Block[]): { start: number; size: number }[] {
  const out: { start: number; size: number }[] = [];
  let at = 0;
  for (const b of [...blocks].sort((p, q) => p.start - q.start)) {
    if (b.start > at) out.push({ start: at, size: b.start - at });
    at = b.start + b.size;
  }
  if (at < UNITS) out.push({ start: at, size: UNITS - at });
  return out;
}

function place(blocks: Block[], id: number, size: number): Block | null {
  const hole = holes(blocks).find((h) => h.size >= size); // first fit, in address order
  return hole ? { id, start: hole.start, size } : null;
}

function initial(): State {
  let blocks: Block[] = [];
  let id = 1;
  for (const req of [56, 24, 120, 24]) {
    const b = place(blocks, id++, unitsFor(req));
    if (b) blocks = [...blocks, b];
  }
  return { blocks, next: id, fresh: null, failed: false, event: "Four blocks are in use. Push a malloc button, or click a block to free it." };
}

export default function Allocator() {
  const [s, setS] = useState<State>(initial);

  const malloc = (req: number) =>
    setS((st) => {
      const size = unitsFor(req);
      const b = place(st.blocks, st.next, size);
      if (!b) {
        const free = holes(st.blocks);
        const total = free.reduce((n, h) => n + h.size, 0);
        return {
          ...st,
          fresh: null,
          failed: true,
          event: `malloc(${req}) failed: no hole of ${bytes(size)}. ${bytes(total)} are free, in ${free.length} hole${free.length === 1 ? "" : "s"}.`,
        };
      }
      return {
        blocks: [...st.blocks, b],
        next: st.next + 1,
        fresh: b.id,
        failed: false,
        event: `malloc(${req}) → block B${b.id}, ${bytes(size)} at ${hex(b.start)}. The first hole that fits wins.`,
      };
    });

  const free = (id: number) =>
    setS((st) => {
      const b = st.blocks.find((x) => x.id === id);
      if (!b) return st;
      const blocks = st.blocks.filter((x) => x.id !== id);
      const hole = holes(blocks).find((h) => h.start <= b.start && h.start + h.size >= b.start + b.size)!;
      const joined = hole.size > b.size;
      return {
        ...st,
        blocks,
        fresh: null,
        failed: false,
        event: `free(B${id}): ${bytes(b.size)} back.${joined ? ` It joins its free neighbours: one hole of ${bytes(hole.size)} at ${hex(hole.start)}.` : ""}`,
      };
    });

  const fragment = () => {
    let blocks: Block[] = [];
    for (let id = 1; id <= 24; id++) blocks.push({ id, start: (id - 1) * 2, size: 2 });
    blocks = blocks.filter((b) => b.id % 2 === 1);
    setS({
      blocks,
      next: 25,
      fresh: null,
      failed: false,
      event: "24 × malloc(24), then free of every second block: 384 B are free, in 12 holes of 32 B. Now push malloc(120).",
    });
  };

  const reset = () => setS({ blocks: [], next: 1, fresh: null, failed: false, event: "The arena is empty: one hole of 768 B." });

  const free_ = holes(s.blocks);
  const freeTotal = free_.reduce((n, h) => n + h.size, 0);
  const largest = free_.reduce((n, h) => Math.max(n, h.size), 0);
  const frag = freeTotal ? Math.round((1 - largest / freeTotal) * 100) : 0;

  /* cut blocks and holes into row pieces: a block can wrap onto the next row */
  const rows = Array.from({ length: UNITS / ROW }, (_, r) => {
    const lo = r * ROW, hi = lo + ROW;
    const pieces: { kind: "block" | "hole"; b?: Block; start: number; len: number; first: boolean }[] = [];
    for (const b of s.blocks) {
      const a = Math.max(lo, b.start), z = Math.min(hi, b.start + b.size);
      if (a < z) pieces.push({ kind: "block", b, start: a, len: z - a, first: a === b.start });
    }
    for (const h of free_) {
      const a = Math.max(lo, h.start), z = Math.min(hi, h.start + h.size);
      if (a < z) pieces.push({ kind: "hole", start: a, len: z - a, first: a === h.start });
    }
    pieces.sort((p, q) => p.start - q.start);
    return { r, lo, pieces };
  });

  return (
    <div>
      <div className="ctl-row">
        <span className="ctl-lab">Request</span>
        {REQUESTS.map((req) => (
          <button key={req} type="button" className="ctl code" onClick={() => malloc(req)}>
            malloc({req})
          </button>
        ))}
        <span className="ctl-lab" style={{ marginLeft: 10 }}>Arena</span>
        <button type="button" className="ctl" onClick={fragment}>
          Fragment
        </button>
        <button type="button" className="ctl" onClick={reset}>
          Reset
        </button>
      </div>

      <div className="arena" role="group" aria-label="Heap arena of 768 bytes; each block is a button that frees it">
        {rows.map(({ r, lo, pieces }) => (
          <div key={r} className="arena-row">
            <span className="arena-off">{hex(lo)}</span>
            {pieces.map((p) =>
              p.kind === "block" && p.b ? (
                <button
                  key={`b${p.b.id}-${p.start}`}
                  type="button"
                  className={`seg${p.first ? "" : " cont"}${p.b.id === s.fresh ? " new enter" : ""}`}
                  style={{ gridRow: 1, gridColumn: `${p.start - lo + 2} / span ${p.len}` }}
                  onClick={() => free(p.b!.id)}
                  aria-label={`Free block B${p.b.id}, ${bytes(p.b.size)} at ${hex(p.b.start)}`}
                  title={`free(B${p.b.id})`}
                >
                  <span>B{p.b.id}</span>
                  {p.first && <span className="sz">{bytes(p.b.size)}</span>}
                </button>
              ) : (
                <div key={`h${p.start}`} className="hole" style={{ gridRow: 1, gridColumn: `${p.start - lo + 2} / span ${p.len}` }} aria-hidden="true" />
              ),
            )}
          </div>
        ))}
      </div>

      <div className="freelist">
        <b>FREE LIST</b>
        {free_.length
          ? free_.map((h) => `${hex(h.start)} (${bytes(h.size)})`).join(" → ") + " → NULL"
          : "NULL — the arena is full"}
      </div>

      <dl className="readout" style={{ marginTop: 12 }}>
        <div>
          <dt>In use</dt>
          <dd>{bytes(UNITS - freeTotal)}</dd>
        </div>
        <div>
          <dt>Free</dt>
          <dd>{bytes(freeTotal)}</dd>
        </div>
        <div>
          <dt>Holes</dt>
          <dd>{free_.length}</dd>
        </div>
        <div>
          <dt>Largest hole</dt>
          <dd>{bytes(largest)}</dd>
        </div>
        <div>
          <dt>Fragmentation</dt>
          <dd className={frag >= 50 ? "warn" : undefined}>{frag} %</dd>
        </div>
      </dl>
      <div className="event" aria-live="polite">
        <b>{s.failed ? "FAILED" : "EVENT"}</b>
        {s.event}
      </div>
    </div>
  );
}
