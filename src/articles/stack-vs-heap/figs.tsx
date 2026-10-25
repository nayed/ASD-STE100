/**
 * Static figures of MEM-100, drawn as engineering sheets: ink outlines, olive construction,
 * hatched forbidden areas, dimension lines, and one yellow key element per figure.
 */

import type { ReactNode } from "react";
import { RUN, WHERE_RUN1 } from "./data";

export const INK = "#121210";
export const INK2 = "#3a3a33";
export const OLIVE = "#6b6c5a";
export const OLIVE_LT = "#a6a795";
export const RULE = "#dcdbcf";
export const PAPER = "#f5f4ee";
export const PAPER2 = "#ecebe3";
export const YEL = "#f2c300";
export const YEL_TEXT = "#7a5800";

/* ------------------------------------------------------------------ */
/* primitives                                                          */
/* ------------------------------------------------------------------ */

type Anchor = "start" | "middle" | "end";

/** text on a paper halo, so construction lines can pass behind it */
export function L({
  x, y, children, size = 10, anchor = "start", fill = INK, weight = 400, ls = 0.06, halo = PAPER,
}: { x: number; y: number; children: ReactNode; size?: number; anchor?: Anchor; fill?: string; weight?: number; ls?: number; halo?: string | null }) {
  return (
    <text
      x={x} y={y} fontSize={size} textAnchor={anchor} fill={fill} fontWeight={weight} letterSpacing={`${ls}em`}
      {...(halo ? { stroke: halo, strokeWidth: 4, strokeLinejoin: "round" as const, paintOrder: "stroke" } : {})}
    >
      {children}
    </text>
  );
}

export function Defs({ id }: { id: string }) {
  return (
    <defs>
      <marker id={`${id}-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={OLIVE} />
      </marker>
      <marker id={`${id}-ai`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={INK} />
      </marker>
      <pattern id={`${id}-h`} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
        <rect width="6" height="6" fill={PAPER} />
        <line x1="0" y1="0" x2="0" y2="6" stroke={OLIVE_LT} strokeWidth="1.2" />
      </pattern>
      <pattern id={`${id}-hk`} patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
        <rect width="7" height="7" fill={PAPER2} />
        <line x1="0" y1="0" x2="0" y2="7" stroke={INK} strokeWidth="2.2" />
      </pattern>
    </defs>
  );
}

/** title line drawn inside the sheet: name at the left, reference at the right */
function SheetTitle({ w, left, right }: { w: number; left: string; right: string }) {
  return (
    <g>
      <L x={0} y={14} size={10.5} weight={700} ls={0.16}>{left}</L>
      <L x={w} y={14} size={9} anchor="end" fill={OLIVE} ls={0.12}>{right}</L>
      <line x1={0} y1={24} x2={w} y2={24} stroke={RULE} strokeWidth={1} />
    </g>
  );
}

/** a vertical block arrow: yellow fill under an ink outline (the accent never stands alone) */
function BlockArrow({ x, y1, y2, w = 22 }: { x: number; y1: number; y2: number; w?: number }) {
  const dir = Math.sign(y2 - y1);
  const head = 14 * dir;
  const shaft = w / 3.2;
  const pts = [
    [x - shaft, y1], [x + shaft, y1], [x + shaft, y2 - head], [x + w / 2, y2 - head],
    [x, y2], [x - w / 2, y2 - head], [x - shaft, y2 - head],
  ];
  return <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={YEL} stroke={INK} strokeWidth={1.5} strokeLinejoin="miter" />;
}

/** dimension line with end ticks and a value */
function Dim({ x, y1, y2, label, side = "right" }: { x: number; y1: number; y2: number; label: string; side?: "left" | "right" }) {
  const t = 5;
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={OLIVE} strokeWidth={1} />
      <line x1={x - t} y1={y1} x2={x + t} y2={y1} stroke={OLIVE} strokeWidth={1} />
      <line x1={x - t} y1={y2} x2={x + t} y2={y2} stroke={OLIVE} strokeWidth={1} />
      <L x={side === "right" ? x + 9 : x - 9} y={(y1 + y2) / 2 + 3} size={9} fill={OLIVE} anchor={side === "right" ? "start" : "end"}>
        {label}
      </L>
    </g>
  );
}

const svgProps = (vb: string, label: string) => ({ viewBox: vb, role: "img" as const, "aria-label": label, className: "wide" });

/* ------------------------------------------------------------------ */
/* FIG. 01 — the address space of one real process                     */
/* ------------------------------------------------------------------ */

export function FigAddressSpace() {
  const X = 330, W = 210, R = X + W; // the memory column
  const callout = (y: number, ry: number, name: string, desc: string) => (
    <g>
      <polyline points={`${R},${ry} ${R + 12},${ry} ${R + 22},${y} ${R + 30},${y}`} fill="none" stroke={OLIVE} strokeWidth={1} />
      <L x={R + 36} y={y - 2} size={10.5} weight={700} ls={0.1}>{name}</L>
      <L x={R + 36} y={y + 11} size={9} fill={OLIVE}>{desc}</L>
    </g>
  );
  const addr = (y: number, a: string, tag: string) => (
    <g>
      <line x1={X - 10} y1={y} x2={X} y2={y} stroke={INK} strokeWidth={1.2} />
      <L x={X - 16} y={y + 3.5} size={10} anchor="end" weight={600}>{a}</L>
      <L x={X - 16} y={y + 15} size={8.5} anchor="end" fill={OLIVE}>{tag}</L>
    </g>
  );
  return (
    <svg {...svgProps("0 0 900 640", "Address space of a real process, from the kernel at the top to address zero at the bottom")}>
      <Defs id="f1" />
      <SheetTitle w={900} left="ADDRESS SPACE OF ONE PROCESS — X86-64 LINUX" right="NOT TO SCALE · ADDRESSES: EXHIBIT A, RUN 1" />

      <L x={X - 16} y={48} size={9} anchor="end" fill={OLIVE} ls={0.2}>↑ HIGH ADDRESSES</L>

      {/* kernel */}
      <rect x={X} y={56} width={W} height={40} fill="url(#f1-hk)" stroke={INK} strokeWidth={1.5} />
      <L x={X + W / 2} y={80} size={10} anchor="middle" weight={700} ls={0.2} halo={PAPER2}>KERNEL</L>
      {addr(96, "0xffff800000000000", "start of kernel space")}

      {/* break: the non-canonical gap, terabytes wide */}
      <path d={`M${X - 6},104 l12,-6 M${R - 6},104 l12,-6 M${X - 6},112 l12,-6 M${R - 6},112 l12,-6`} stroke={INK} strokeWidth={1.2} />

      {/* stack */}
      <rect x={X} y={120} width={W} height={110} fill={PAPER} stroke={INK} strokeWidth={1.5} />
      <rect x={X + 12} y={128} width={140} height={22} fill={PAPER2} stroke={OLIVE} strokeWidth={1} />
      <L x={X + 20} y={143} size={9.5} halo={null}>caller (libc)</L>
      <rect x={X + 12} y={154} width={140} height={34} fill={PAPER2} stroke={INK} strokeWidth={1.3} />
      <L x={X + 20} y={168} size={9.5} weight={600} halo={null}>main()</L>
      <L x={X + 20} y={181} size={9} fill={OLIVE} halo={null}>int local = 7</L>
      <rect x={X + 12} y={192} width={140} height={28} fill="none" stroke={OLIVE} strokeWidth={1} strokeDasharray="4 3" />
      <L x={X + 20} y={210} size={9} fill={OLIVE} halo={null}>next call</L>
      <BlockArrow x={X + 182} y1={150} y2={218} />
      {addr(178, WHERE_RUN1.stack, "local")}

      {/* unmapped */}
      <rect x={X} y={230} width={W} height={74} fill="url(#f1-h)" stroke={OLIVE_LT} strokeWidth={1} />
      <L x={X + W / 2} y={271} size={9.5} anchor="middle" fill={OLIVE} ls={0.2}>UNMAPPED</L>

      {/* mapped region: libraries and the large block */}
      <rect x={X} y={304} width={W} height={76} fill={PAPER} stroke={INK} strokeWidth={1.5} />
      <rect x={X + 12} y={312} width={186} height={26} fill={PAPER2} stroke={INK} strokeWidth={1.2} />
      <L x={X + 20} y={329} size={9.5} halo={null}>libc.so.6 · printf()</L>
      <rect x={X + 12} y={344} width={186} height={28} fill={PAPER2} stroke={INK} strokeWidth={1.2} />
      <L x={X + 20} y={362} size={9.5} halo={null}>1 MiB block · large</L>
      {addr(325, WHERE_RUN1.lib, "printf()")}
      {addr(358, WHERE_RUN1.mapped, "large")}

      {/* unmapped */}
      <rect x={X} y={380} width={W} height={70} fill="url(#f1-h)" stroke={OLIVE_LT} strokeWidth={1} />
      <L x={X + W / 2} y={419} size={9.5} anchor="middle" fill={OLIVE} ls={0.2}>UNMAPPED</L>

      {/* heap */}
      <rect x={X} y={450} width={W} height={56} fill={PAPER} stroke={INK} strokeWidth={1.5} />
      {[
        [X + 12, 32], [X + 50, 54], [X + 110, 24],
      ].map(([bx, bw], i) => (
        <rect key={i} x={bx} y={474} width={bw} height={24} fill={PAPER2} stroke={INK} strokeWidth={1.2} />
      ))}
      <L x={X + 12} y={466} size={9} fill={OLIVE} halo={null}>malloc blocks</L>
      <BlockArrow x={X + 182} y1={500} y2={436} />
      {addr(486, WHERE_RUN1.heap, "small")}

      {/* the random gap between bss and the heap */}
      <rect x={X} y={506} width={W} height={18} fill="url(#f1-h)" stroke={OLIVE_LT} strokeWidth={1} />

      {/* program image */}
      <rect x={X} y={524} width={W} height={20} fill={PAPER} stroke={INK} strokeWidth={1.5} />
      <L x={X + 12} y={538} size={9.5} halo={null}>BSS</L>
      <rect x={X} y={544} width={W} height={20} fill={PAPER} stroke={INK} strokeWidth={1.5} />
      <L x={X + 12} y={558} size={9.5} halo={null}>DATA</L>
      <rect x={X} y={564} width={W} height={34} fill={PAPER} stroke={INK} strokeWidth={1.5} />
      <L x={X + 12} y={585} size={9.5} halo={null}>TEXT</L>
      <rect x={X} y={598} width={W} height={14} fill="url(#f1-hk)" stroke={INK} strokeWidth={1.5} />

      {/* addresses of the program image, fanned out to stay readable */}
      <polyline points={`${X},534 ${X - 6},534 ${X - 10},528`} fill="none" stroke={INK} strokeWidth={1.2} />
      <L x={X - 16} y={530} size={10} anchor="end" weight={600}>{WHERE_RUN1.bss}</L>
      <polyline points={`${X},554 ${X - 10},554`} fill="none" stroke={INK} strokeWidth={1.2} />
      <L x={X - 16} y={557} size={10} anchor="end" weight={600}>{WHERE_RUN1.data}</L>
      <polyline points={`${X},581 ${X - 6},581 ${X - 10},586`} fill="none" stroke={INK} strokeWidth={1.2} />
      <L x={X - 16} y={590} size={10} anchor="end" weight={600}>{WHERE_RUN1.text}</L>
      <L x={X - 16} y={630} size={9} anchor="end" fill={OLIVE} ls={0.2}>↓ ADDRESS 0</L>

      {/* growth labels beside the arrows */}
      <L x={X + 170} y={246} size={8.5} anchor="middle" weight={700} ls={0.12}>GROWS DOWN</L>
      <L x={X + 170} y={428} size={8.5} anchor="middle" weight={700} ls={0.12}>GROWS UP</L>

      {/* callouts */}
      {callout(70, 76, "KERNEL SPACE", "the program cannot read or write it")}
      {callout(150, 175, "STACK", "one frame per active call")}
      {callout(262, 267, "UNMAPPED", "no memory here: an access fails")}
      {callout(318, 325, "SHARED LIBRARIES", "libc.so.6, mapped at start")}
      {callout(356, 358, "LARGE BLOCK", "malloc(1 MiB) gets its own mapping")}
      {callout(410, 415, "UNMAPPED", "terabytes of free address space")}
      {callout(470, 478, "HEAP", "small malloc blocks, near the program")}
      {callout(512, 534, "BSS", "globals without a value, set to zero")}
      {callout(548, 554, "DATA", "globals with a value")}
      {callout(584, 581, "TEXT", "machine code, read-only")}
      {callout(618, 605, "NULL PAGE", "address 0 is never mapped")}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 02 — two real frames                                           */
/* ------------------------------------------------------------------ */

export function FigFrames() {
  const X = 300, W = 230, H = 36, Y0 = 56;
  const y = (i: number) => Y0 + i * H;
  const slots: { a: string; full?: [string, string?]; key?: boolean; split?: [string, string]; unused?: boolean }[] = [
    { a: "0x7ffd32f1a3d8", full: ["RETURN ADDRESS", "back into libc"] },
    { a: "0x7ffd32f1a3d0", full: ["SAVED RBP", "rbp of the caller"] },
    { a: "0x7ffd32f1a3c8", split: ["step = 2", "3cc"] },
    { a: "0x7ffd32f1a3c0", full: ["c (int *)", `= ${RUN.block} after step 6`] },
    { a: "0x7ffd32f1a3b8", full: ["RETURN ADDRESS", "back into main(), after the call"], key: true },
    { a: "0x7ffd32f1a3b0", full: ["SAVED RBP", `= ${RUN.main_rbp}`] },
    { a: "0x7ffd32f1a3a8", full: ["p (int *)", `= ${RUN.block}`] },
    { a: "0x7ffd32f1a3a0", unused: true },
    { a: "0x7ffd32f1a398", split: ["start = 10", "39c"] },
    { a: "0x7ffd32f1a390", unused: true },
  ];
  const marker = (i: number, name: string, value: string) => {
    const yy = y(i + 1); // a register holds the lowest address of its slot: the slot's bottom edge
    return (
      <g>
        <line x1={X + W} y1={yy} x2={X + W + 22} y2={yy} stroke={INK} strokeWidth={1.5} markerStart="url(#f2-ai)" />
        <L x={X + W + 28} y={yy + 3.5} size={10} weight={700}>{name}</L>
        <L x={X + W + 28 + name.length * 6.6 + 8} y={yy + 3.5} size={9} fill={OLIVE}>{value}</L>
      </g>
    );
  };
  return (
    <svg {...svgProps("0 0 900 520", "Two real stack frames: main and make_counter, one row per eight bytes")}>
      <Defs id="f2" />
      <SheetTitle w={900} left="TWO REAL FRAMES — main() CALLS make_counter(10)" right="GCC 16.2 · -O0 · ADDRESSES FROM ONE RUN" />
      <L x={X - 14} y={46} size={9} anchor="end" fill={OLIVE} ls={0.2}>↑ HIGHER ADDRESSES</L>

      {slots.map((s, i) => {
        const yy = y(i);
        return (
          <g key={s.a}>
            <L x={X - 14} y={yy + H / 2 + 3.5} size={10} anchor="end" weight={i === 4 ? 700 : 400} fill={i === 4 ? INK : INK2}>{s.a}</L>
            {s.full && (
              <g>
                <rect x={X} y={yy} width={W} height={H} fill={s.key ? YEL : PAPER} stroke={INK} strokeWidth={s.key ? 2 : 1.2} />
                <L x={X + 12} y={yy + 15} size={10} weight={700} ls={0.08} halo={null}>{s.full[0]}</L>
                <L x={X + 12} y={yy + 28} size={9} fill={s.key ? INK : OLIVE} halo={null}>{s.full[1]}</L>
              </g>
            )}
            {s.split && (
              <g>
                <rect x={X} y={yy} width={W / 2} height={H} fill={PAPER} stroke={INK} strokeWidth={1.2} />
                <L x={X + 10} y={yy + 15} size={10} weight={700} halo={null}>{s.split[0]}</L>
                <L x={X + 10} y={yy + 28} size={9} fill={OLIVE} halo={null}>4 B at …{s.split[1]}</L>
                <rect x={X + W / 2} y={yy} width={W / 2} height={H} fill="url(#f2-h)" stroke={INK} strokeWidth={1.2} />
              </g>
            )}
            {s.unused && <rect x={X} y={yy} width={W} height={H} fill="url(#f2-h)" stroke={INK} strokeWidth={1.2} />}
          </g>
        );
      })}

      {/* the frame boundary between main and make_counter */}
      <line x1={X - 8} y1={y(4)} x2={X + W + 8} y2={y(4)} stroke={INK} strokeWidth={2.5} />

      {marker(1, "rbp", "main()")}
      {marker(3, "rsp", "main()")}
      {marker(5, "rbp", "make_counter()")}
      {marker(9, "rsp", "make_counter()")}

      {/* frame sizes */}
      <Dim x={690} y1={y(0)} y2={y(4)} label="FRAME OF main() · 32 B" />
      <Dim x={690} y1={y(4)} y2={y(10)} label="FRAME OF make_counter() · 48 B" />

      {/* legend */}
      <g>
        <rect x={X} y={y(10) + 22} width={22} height={13} fill={YEL} stroke={INK} strokeWidth={1.5} />
        <L x={X + 30} y={y(10) + 32} size={9.5}>what ret pops: overwrite it and you choose the next code</L>
        <rect x={X} y={y(10) + 44} width={22} height={13} fill="url(#f2-h)" stroke={INK} strokeWidth={1} />
        <L x={X + 30} y={y(10) + 54} size={9.5}>unused: alignment and compiler layout</L>
        <L x={X - 14} y={y(10) + 32} size={9} anchor="end" fill={OLIVE} ls={0.12}>1 ROW = 8 BYTES</L>
        <L x={X - 14} y={y(10) + 54} size={9} anchor="end" fill={OLIVE} ls={0.2}>↓ THE STACK GROWS</L>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 05 — lifetimes on a time axis                                  */
/* ------------------------------------------------------------------ */

export function FigLifetimes() {
  const X0 = 250, SW = 68; // step columns
  const sx = (s: number) => X0 + (s - 1) * SW; // left edge of step s
  const lines = ["9", "10", "11", "4", "5", "6", "12", "13", "14"];
  const row = (yy: number, from: number, to: number, label: string, sub: string, opts: { key?: boolean; dash?: boolean } = {}) => (
    <g>
      <L x={0} y={yy + 12} size={10} weight={700} ls={0.08}>{label}</L>
      <L x={0} y={yy + 25} size={9} fill={OLIVE}>{sub}</L>
      <rect
        x={sx(from) + 4} y={yy} width={sx(to + 1) - sx(from) - 8} height={26}
        fill={opts.key ? YEL : opts.dash ? "url(#f5-h)" : PAPER2} stroke={INK} strokeWidth={opts.key ? 2 : 1.3}
        strokeDasharray={opts.dash ? "5 3" : undefined}
      />
    </g>
  );
  return (
    <svg {...svgProps("0 0 900 360", "Lifetimes of the two frames and the heap block of counter.c, step by step")}>
      <Defs id="f5" />
      <SheetTitle w={900} left="LIFETIMES IN counter.c — ONE COLUMN PER STEP OF FIG. 04" right="TIME →" />

      {/* step grid */}
      {lines.map((ln, i) => (
        <g key={i}>
          <line x1={sx(i + 1)} y1={42} x2={sx(i + 1)} y2={306} stroke={RULE} strokeWidth={1} />
          <L x={sx(i + 1) + SW / 2} y={50} size={10} anchor="middle" weight={700}>{String(i + 1)}</L>
          <L x={sx(i + 1) + SW / 2} y={62} size={8.5} anchor="middle" fill={OLIVE}>{`line ${ln}`}</L>
        </g>
      ))}
      <line x1={sx(10)} y1={42} x2={sx(10)} y2={306} stroke={RULE} strokeWidth={1} />
      <L x={0} y={50} size={9} fill={OLIVE} ls={0.2}>STEP</L>

      <L x={0} y={92} size={9} fill={OLIVE} ls={0.24}>STACK — NESTED</L>
      {row(100, 1, 9, "FRAME main()", "push at step 1, pop at step 9")}
      {row(140, 3, 6, "FRAME make_counter()", "lives inside main()")}

      <L x={0} y={200} size={9} fill={OLIVE} ls={0.24}>HEAP — NOT NESTED</L>
      {row(208, 4, 8, `BLOCK ${RUN.block}`, "malloc at step 4, free at step 8", { key: true })}
      {row(256, 4, 9, "SAME BLOCK, NO free()", "line 13 removed: a leak", { dash: true })}
      <line x1={sx(10) - 4} y1={269} x2={sx(10) + 24} y2={269} stroke={INK} strokeWidth={1.5} strokeDasharray="5 3" markerEnd="url(#f5-ai)" />

      {/* the moment that matters */}
      <line x1={sx(7)} y1={132} x2={sx(7)} y2={300} stroke={INK} strokeWidth={1.5} strokeDasharray="4 3" />
      <L x={sx(7) + 8} y={196} size={9.5} weight={700}>make_counter() returns</L>
      <L x={sx(7) + 8} y={250} size={9.5} fill={INK2}>the block lives on</L>
      <L x={sx(10) + 2} y={298} size={9} fill={OLIVE} anchor="end">never freed: memory use grows</L>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 06 — who frees the heap                                        */
/* ------------------------------------------------------------------ */

export function FigWhoFrees() {
  const box = (x: number, yy: number, w: number, t: string, sub?: string, key = false) => (
    <g>
      <rect x={x} y={yy} width={w} height={44} fill={key ? YEL : PAPER} stroke={INK} strokeWidth={key ? 2 : 1.3} />
      <L x={x + w / 2} y={yy + (sub ? 19 : 26)} size={10} anchor="middle" weight={700} halo={null}>{t}</L>
      {sub && <L x={x + w / 2} y={yy + 33} size={8.5} anchor="middle" fill={key ? INK : OLIVE} halo={null}>{sub}</L>}
    </g>
  );
  const arrow = (x1: number, x2: number, yy: number) => (
    <line x1={x1} y1={yy + 22} x2={x2 - 2} y2={yy + 22} stroke={OLIVE} strokeWidth={1.3} markerEnd="url(#f6-a)" />
  );
  const lane = (yy: number, name: string, langs: string, who: string, cost: string, cost2: string, flow: ReactNode) => (
    <g>
      <line x1={0} y1={yy - 14} x2={900} y2={yy - 14} stroke={RULE} strokeWidth={1} />
      <L x={0} y={yy + 16} size={11} weight={700} ls={0.1}>{name}</L>
      <L x={0} y={yy + 30} size={9} fill={OLIVE}>{langs}</L>
      {flow}
      <L x={706} y={yy + 16} size={9.5} weight={700}>{who}</L>
      <L x={706} y={yy + 30} size={9} fill={OLIVE}>{cost}</L>
      <L x={706} y={yy + 43} size={9} fill={OLIVE}>{cost2}</L>
    </g>
  );
  return (
    <svg {...svgProps("0 0 900 330", "Three ways to free heap blocks: manual, ownership, garbage collection")}>
      <Defs id="f6" />
      <SheetTitle w={900} left="WHO FREES A HEAP BLOCK" right="ONE LANE PER METHOD" />
      <L x={0} y={50} size={9} fill={OLIVE} ls={0.22}>METHOD</L>
      <L x={190} y={50} size={9} fill={OLIVE} ls={0.22}>LIFE OF ONE BLOCK</L>
      <L x={706} y={50} size={9} fill={OLIVE} ls={0.22}>WHO FREES · COST</L>

      {lane(78, "MANUAL", "C", "THE PROGRAMMER", "a missing free leaks;", "a second free corrupts",
        <g>
          {box(190, 78, 120, "malloc()")}
          {arrow(310, 344, 78)}
          {box(344, 78, 120, "USE", "read and write")}
          {arrow(464, 498, 78)}
          {box(498, 78, 170, "free(p)", "written by hand", true)}
        </g>)}

      {lane(166, "OWNERSHIP", "C++ (RAII) · RUST", "THE COMPILER", "it inserts the free at the", "end of the owner's scope",
        <g>
          {box(190, 166, 120, "OWNER", "unique_ptr · Box")}
          {arrow(310, 344, 166)}
          {box(344, 166, 120, "USE", "move or borrow")}
          {arrow(464, 498, 166)}
          {box(498, 166, 170, "SCOPE ENDS", "destructor / drop frees", true)}
        </g>)}

      {lane(254, "GARBAGE COLLECTOR", "GO · JAVA · JAVASCRIPT", "THE RUNTIME", "it frees later; it uses extra", "memory and CPU time",
        <g>
          {box(190, 254, 96, "new · &T{}")}
          {arrow(286, 306, 254)}
          {box(306, 254, 84, "USE")}
          {arrow(390, 410, 254)}
          {box(410, 254, 92, "NO POINTER", "unreachable")}
          {arrow(502, 522, 254)}
          {box(522, 254, 146, "COLLECTOR", "finds it and frees it", true)}
        </g>)}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 07 — locality: one cache line against eight                    */
/* ------------------------------------------------------------------ */

export function FigLocality() {
  const X = 200, CW = 72; // one cache line per box in the lower strip, one long per cell in the upper
  const order = [0, 5, 2, 7, 1, 6, 3, 4]; // node i lives in cache line order[i]
  const nodeX = (i: number) => X + order[i] * CW + 14 + (i % 2) * 18;
  return (
    <svg {...svgProps("0 0 900 360", "Eight values in an array use one cache line; eight list nodes on the heap use eight")}>
      <Defs id="f7" />
      <SheetTitle w={900} left="THE SAME 8 VALUES, TWO LAYOUTS" right="CACHE LINE = 64 B ON X86-64 · EXAMPLE LAYOUT" />

      {/* array on the stack */}
      <L x={0} y={66} size={10.5} weight={700} ls={0.08}>long a[8]</L>
      <L x={0} y={80} size={9} fill={OLIVE}>an array in a frame</L>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={X + i * CW} y={56} width={CW} height={34} fill={PAPER} stroke={INK} strokeWidth={1.3} />
          <L x={X + i * CW + CW / 2} y={77} size={10} anchor="middle" halo={null}>{`a[${i}]`}</L>
        </g>
      ))}
      <rect x={X - 4} y={52} width={8 * CW + 8} height={42} fill="none" stroke={INK} strokeWidth={2} />
      <line x1={X} y1={108} x2={X + 8 * CW} y2={108} stroke={OLIVE} strokeWidth={1} />
      <line x1={X} y1={102} x2={X} y2={114} stroke={OLIVE} strokeWidth={1} />
      <line x1={X + 8 * CW} y1={102} x2={X + 8 * CW} y2={114} stroke={OLIVE} strokeWidth={1} />
      <rect x={X + 4 * CW - 70} y={100} width={140} height={18} fill={YEL} stroke={INK} strokeWidth={1.5} />
      <L x={X + 4 * CW} y={113} size={9.5} anchor="middle" weight={700} halo={null}>1 CACHE LINE · 64 B</L>
      <L x={X + 8 * CW + 14} y={77} size={9} fill={OLIVE}>8 × 8 B</L>

      {/* list nodes on the heap */}
      <L x={0} y={196} size={10.5} weight={700} ls={0.08}>8 LIST NODES</L>
      <L x={0} y={210} size={9} fill={OLIVE}>on the heap, after many</L>
      <L x={0} y={223} size={9} fill={OLIVE}>malloc and free calls</L>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={X + i * CW} y={190} width={CW} height={48} fill="url(#f7-h)" stroke={OLIVE} strokeWidth={1} />
          <L x={X + i * CW + CW / 2} y={258} size={8.5} anchor="middle" fill={OLIVE}>{`line ${i}`}</L>
        </g>
      ))}
      {/* the next pointers, all above the strip: the longer the jump, the higher the arc */}
      {Array.from({ length: 7 }, (_, i) => {
        const x1 = nodeX(i) + 8, x2 = nodeX(i + 1) + 16;
        const h = 22 + Math.abs(x2 - x1) * 0.13;
        return (
          <path key={i} d={`M${x1},200 C${x1},${200 - h} ${x2},${200 - h} ${x2},199`} fill="none" stroke={INK} strokeWidth={1.2} markerEnd="url(#f7-ai)" />
        );
      })}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={nodeX(i)} y={200} width={24} height={28} fill={PAPER} stroke={INK} strokeWidth={1.4} />
          <L x={nodeX(i) + 12} y={218} size={9} anchor="middle" weight={700} halo={null}>{`n${i}`}</L>
        </g>
      ))}
      <L x={X + 8 * CW + 14} y={210} size={9.5} weight={700}>8 CACHE LINES</L>
      <L x={X + 8 * CW + 14} y={223} size={9} fill={OLIVE}>one per node</L>

      <L x={0} y={330} size={9.5} fill={INK2}>
        A read of a[0] loads all of a[0..7]. A walk of the list loads a new line for each node.
      </L>
    </svg>
  );
}
