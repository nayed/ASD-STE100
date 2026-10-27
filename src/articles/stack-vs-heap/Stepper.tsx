/**
 * Fig. 04: counter.c, one line at a time. The left panel is the source (Exhibit B), the right
 * panel is the machine: frames on the stack, the block on the heap, pointers between them.
 * Addresses and offsets come from one real run (see RUN in data.ts). In each step, the one
 * element that changed carries the yellow accent.
 */

import { useState } from "react";
import { Code } from "./chrome";
import COUNTER from "./listings/counter.c?highlight";
import { RUN } from "./data";
import { INK, INK2, L, OLIVE, OLIVE_LT, PAPER, PAPER2, YEL } from "./figs";

type Var = { name: string; value: string; changed?: boolean };
type Frame = { name: string; rbp: string; vars: Var[]; fresh?: boolean };
type Step = {
  line: number | null;
  frames: Frame[];
  block: null | { value: string; fresh?: boolean; changed?: boolean; freed?: boolean };
  ptr: null | { frame: number; v: number; dangling?: boolean };
  sp: string;
  event: string;
};

const UNSET = "??";
const tail = (a: string) => `…${a.slice(-3)}`;

const main = (step: string, c: string, o: { fresh?: boolean; step?: boolean; c?: boolean } = {}): Frame => ({
  name: "main()",
  rbp: RUN.main_rbp,
  fresh: o.fresh,
  vars: [
    { name: "int step", value: step, changed: o.step },
    { name: "int *c", value: c, changed: o.c },
  ],
});
const mc = (p: string, o: { fresh?: boolean } = {}): Frame => ({
  name: "make_counter()",
  rbp: RUN.mc_rbp,
  fresh: o.fresh,
  vars: [
    { name: "int start", value: "10" },
    { name: "int *p", value: p },
  ],
});

const STEPS: Step[] = [
  { line: null, frames: [], block: null, ptr: null, sp: RUN.caller_rsp, event: "Ready. Push STEP to call main()." },
  { line: 9, frames: [main(UNSET, UNSET, { fresh: true })], block: null, ptr: null, sp: RUN.main_rsp, event: "Call main(): the frame of main is pushed. Its locals have no value yet." },
  { line: 10, frames: [main("2", UNSET, { step: true })], block: null, ptr: null, sp: RUN.main_rsp, event: "step = 2: the value goes into the frame of main, at rbp−4." },
  { line: 11, frames: [main("2", UNSET), mc(UNSET, { fresh: true })], block: null, ptr: null, sp: RUN.mc_rsp, event: "Call make_counter(10): a new frame is pushed under the frame of main." },
  { line: 4, frames: [main("2", UNSET), mc(RUN.block)], block: { value: UNSET, fresh: true }, ptr: { frame: 1, v: 1 }, sp: RUN.mc_rsp, event: "malloc(4): the allocator returns a block on the heap. p holds its address." },
  { line: 5, frames: [main("2", UNSET), mc(RUN.block)], block: { value: "10", changed: true }, ptr: { frame: 1, v: 1 }, sp: RUN.mc_rsp, event: "*p = start: the value 10 goes into the block, not into the frame." },
  { line: 6, frames: [main("2", RUN.block, { c: true })], block: { value: "10" }, ptr: { frame: 0, v: 1 }, sp: RUN.main_rsp, event: "return p: the frame of make_counter is popped and p is gone. The block stays: c holds its address." },
  { line: 12, frames: [main("2", RUN.block)], block: { value: "12", changed: true }, ptr: { frame: 0, v: 1 }, sp: RUN.main_rsp, event: "*c += step: the block now holds 12." },
  { line: 13, frames: [main("2", RUN.block)], block: { value: "12", freed: true }, ptr: { frame: 0, v: 1, dangling: true }, sp: RUN.main_rsp, event: "free(c): the block goes back to the allocator. c still holds the old address: a dangling pointer." },
  { line: 14, frames: [], block: { value: "12", freed: true }, ptr: null, sp: RUN.caller_rsp, event: "return 0: the frame of main is popped. The stack is back where it started." },
];

/* machine panel geometry */
const SX = 100, SW = 222, HX = 362, HW = 148;
const TOP = 58, HEAD = 24, ROW = 26, GAP = 8;
const BX = HX + 16, BW = HW - 32, BY = 156, BH = 52;

function frameTop(frames: Frame[], i: number) {
  let y = TOP;
  for (let k = 0; k < i; k++) y += HEAD + frames[k].vars.length * ROW + GAP;
  return y;
}

export default function Stepper() {
  const [n, setN] = useState(0);
  const st = STEPS[n];
  const last = st.frames.length - 1;
  const spY = last < 0 ? TOP - 4 : frameTop(st.frames, last) + HEAD + st.frames[last].vars.length * ROW;
  const ptrY = st.ptr ? frameTop(st.frames, st.ptr.frame) + HEAD + st.ptr.v * ROW + ROW / 2 : 0;

  return (
    <div>
      <div className="stepper">
        <Code label="EXHIBIT B — counter.c" meta="C · FROM SHEET 03" listing={COUNTER} on={st.line ?? undefined} />

        <div className="machine">
          <div className="machine-bar">
            <span>MACHINE STATE</span>
            <span>STEP {n} / {STEPS.length - 1}</span>
          </div>
          <svg viewBox="0 0 520 400" role="img" aria-label={`Stack and heap after step ${n}: ${st.event}`}>
            <defs>
              <marker id="st-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill={INK} />
              </marker>
              <pattern id="st-h" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <rect width="6" height="6" fill={PAPER} />
                <line x1="0" y1="0" x2="0" y2="6" stroke={OLIVE_LT} strokeWidth="1.2" />
              </pattern>
            </defs>

            {/* column titles */}
            <L x={SX} y={20} size={10} weight={700} ls={0.2}>STACK</L>
            <L x={SX + SW} y={20} size={8.5} anchor="end" fill={OLIVE} ls={0.12}>↑ HIGH ADDRESSES</L>
            <L x={HX} y={20} size={10} weight={700} ls={0.2}>HEAP</L>

            {/* the caller of main */}
            <rect x={SX} y={30} width={SW} height={22} fill="none" stroke={OLIVE} strokeWidth={1} strokeDasharray="4 3" />
            <L x={SX + 10} y={45} size={9} fill={OLIVE} halo={null}>caller of main() · libc</L>

            {/* frames */}
            {st.frames.map((f, i) => {
              const y0 = frameTop(st.frames, i);
              return (
                <g key={`${f.name}-${n}`} className={f.fresh ? "enter" : undefined}>
                  <rect x={SX} y={y0} width={SW} height={HEAD} fill={f.fresh ? YEL : PAPER2} stroke={INK} strokeWidth={f.fresh ? 2 : 1.4} />
                  <L x={SX + 10} y={y0 + 16} size={9.5} weight={700} ls={0.06} halo={null}>{`FRAME ${f.name}`}</L>
                  <L x={SX + SW - 10} y={y0 + 16} size={8.5} anchor="end" fill={f.fresh ? INK : OLIVE} halo={null}>{`rbp ${tail(f.rbp)}`}</L>
                  {f.vars.map((v, k) => {
                    const ry = y0 + HEAD + k * ROW;
                    return (
                      <g key={v.name}>
                        <rect x={SX} y={ry} width={SW} height={ROW} fill={v.changed ? YEL : PAPER} stroke={INK} strokeWidth={v.changed ? 2 : 1.1} />
                        <L x={SX + 10} y={ry + 17} size={9.5} halo={null}>{v.name}</L>
                        <L x={SX + SW - 10} y={ry + 17} size={9.5} anchor="end" weight={600} fill={v.value === UNSET ? OLIVE : INK} halo={null}>{v.value}</L>
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* the stack pointer */}
            <line x1={10} y1={spY} x2={SX - 4} y2={spY} stroke={INK} strokeWidth={1.5} markerEnd="url(#st-a)" />
            <L x={10} y={spY - 6} size={10} weight={700}>rsp</L>
            <L x={10} y={spY + 15} size={8.5} fill={OLIVE}>{tail(st.sp)}</L>

            {/* the heap region and the block */}
            <rect x={HX} y={30} width={HW} height={300} fill="none" stroke={OLIVE} strokeWidth={1} strokeDasharray="4 3" />
            {st.block && (
              <g className={st.block.fresh ? "enter" : undefined}>
                <L x={BX} y={BY - 8} size={8.5} fill={OLIVE}>{RUN.block}</L>
                <rect
                  x={BX} y={BY} width={BW} height={BH}
                  fill={st.block.freed ? "url(#st-h)" : st.block.fresh || st.block.changed ? YEL : PAPER}
                  stroke={st.block.freed ? OLIVE : INK} strokeWidth={st.block.fresh || st.block.changed ? 2 : 1.4}
                  strokeDasharray={st.block.freed ? "5 3" : undefined}
                />
                {!st.block.freed && <rect x={BX} y={BY} width={6} height={BH} fill={INK} />}
                {st.block.freed ? (
                  <L x={BX + BW / 2} y={BY + 31} size={11} anchor="middle" weight={700} fill={OLIVE} ls={0.24}>FREE</L>
                ) : (
                  <>
                    <L x={BX + 16} y={BY + 18} size={8.5} fill={st.block.fresh || st.block.changed ? INK : OLIVE} halo={null}>4 B · int</L>
                    <L x={BX + 16} y={BY + 40} size={16} weight={700} fill={st.block.value === UNSET ? OLIVE : INK} halo={null}>{st.block.value}</L>
                  </>
                )}
              </g>
            )}

            {/* the pointer from a frame to the block */}
            {st.ptr && (
              <g>
                <path
                  d={`M${SX + SW},${ptrY} C${SX + SW + 30},${ptrY} ${BX - 34},${BY + BH / 2} ${BX - 2},${BY + BH / 2}`}
                  fill="none" stroke={INK} strokeWidth={1.6} strokeDasharray={st.ptr.dangling ? "5 4" : undefined} markerEnd="url(#st-a)"
                />
                <circle cx={SX + SW} cy={ptrY} r={3} fill={INK} />
                {st.ptr.dangling && (
                  <g>
                    <rect x={HX + 14} y={BY + BH + 20} width={104} height={22} fill={YEL} stroke={INK} strokeWidth={2} />
                    <L x={HX + 66} y={BY + BH + 35} size={9.5} anchor="middle" weight={700} ls={0.16} halo={null}>DANGLING</L>
                  </g>
                )}
              </g>
            )}

            {/* legend */}
            <rect x={SX} y={356} width={18} height={12} fill={YEL} stroke={INK} strokeWidth={1.5} />
            <L x={SX + 26} y={366} size={9} fill={INK2}>changed in this step</L>
            <rect x={HX} y={356} width={18} height={12} fill="url(#st-h)" stroke={OLIVE} strokeWidth={1} />
            <L x={HX + 26} y={366} size={9} fill={INK2}>freed</L>
          </svg>
        </div>
      </div>

      <div className="stepper-ctl">
        <div className="ctl-row">
          <button type="button" className="ctl" onClick={() => setN((v) => Math.max(0, v - 1))} disabled={n === 0}>
            ◂ Back
          </button>
          <button type="button" className="ctl" aria-pressed={n > 0 && n < STEPS.length - 1} onClick={() => setN((v) => Math.min(STEPS.length - 1, v + 1))} disabled={n === STEPS.length - 1}>
            Step ▸
          </button>
          <button type="button" className="ctl" onClick={() => setN(0)} disabled={n === 0}>
            Reset
          </button>
        </div>
      </div>
      <dl className="readout" style={{ marginTop: 12 }}>
        <div>
          <dt>Step</dt>
          <dd>{n} / {STEPS.length - 1}</dd>
        </div>
        <div>
          <dt>Line</dt>
          <dd>{st.line ?? "—"}</dd>
        </div>
        <div>
          <dt>rsp</dt>
          <dd>{st.sp}</dd>
        </div>
        <div>
          <dt>Frames</dt>
          <dd>{st.frames.length}</dd>
        </div>
        <div>
          <dt>Heap</dt>
          <dd className={st.ptr?.dangling ? "warn" : undefined}>
            {!st.block ? "empty" : st.block.freed ? "1 block, freed" : "1 block · 4 B"}
          </dd>
        </div>
      </dl>
      <div className="event" aria-live="polite">
        <b>STEP {n}</b>
        {st.event}
      </div>
    </div>
  );
}
