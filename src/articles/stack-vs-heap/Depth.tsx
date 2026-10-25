/**
 * Fig. 08: how deep can recursion go? The limit is the real one of the test machine
 * (ulimit -s = 8192 KiB, main thread). 32 B is the measured frame of down() at -O0
 * (push rbp, the return address, sub rsp 16). The other sizes show what large locals do.
 */

import { useState } from "react";
import { INK, INK2, L, OLIVE, OLIVE_LT, PAPER, PAPER2, YEL } from "./figs";

const LIMIT = 8192 * 1024;
const SIZES = [
  { b: 32, label: "32 B", note: "down() at -O0, measured" },
  { b: 128, label: "128 B", note: "a few locals" },
  { b: 1024, label: "1 KiB", note: "a 1 KiB local array" },
  { b: 4096, label: "4 KiB", note: "a 4 KiB local array" },
];
const fmt = (n: number) => n.toLocaleString("en-US");

/* bar geometry */
const BX = 176, BW = 150, TOP = 52, H = 300, GUARD = 30;

export default function Depth() {
  const [size, setSize] = useState(0);
  const [pct, setPct] = useState(40);
  const frame = SIZES[size].b;
  const max = Math.floor(LIMIT / frame);
  const depth = Math.round((pct / 100) * max);
  const over = depth > max;
  const fill = Math.min(pct, 100) / 100 * H;
  const spill = over ? Math.min(GUARD + 18, ((pct - 100) / 15) * (GUARD + 18)) : 0;
  const rspY = TOP + fill + spill;

  return (
    <div className="depth">
      <svg viewBox="0 0 520 440" role="img" aria-label={`Stack of 8 MiB filled to ${Math.min(pct, 100)} percent${over ? ", overflowing into the guard gap" : ""}`}>
        <defs>
          <pattern id="dp-z" patternUnits="userSpaceOnUse" width="16" height="16" patternTransform="rotate(-45)">
            <rect width="16" height="16" fill={YEL} />
            <rect width="8" height="16" fill={INK} />
          </pattern>
          <pattern id="dp-h" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <rect width="6" height="6" fill={PAPER} />
            <line x1="0" y1="0" x2="0" y2="6" stroke={OLIVE_LT} strokeWidth="1.2" />
          </pattern>
          <pattern id="dp-f" patternUnits="userSpaceOnUse" width="10" height="6">
            <rect width="10" height="6" fill={PAPER2} />
            <line x1="0" y1="5.5" x2="10" y2="5.5" stroke={OLIVE_LT} strokeWidth="1" />
          </pattern>
          <marker id="dp-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={INK} />
          </marker>
        </defs>

        <L x={0} y={16} size={10} weight={700} ls={0.16}>MAIN-THREAD STACK</L>
        <L x={520} y={16} size={9} anchor="end" fill={OLIVE} ls={0.12}>ulimit -s 8192 · TEST MACHINE</L>
        <line x1={0} y1={26} x2={520} y2={26} stroke="#dcdbcf" strokeWidth={1} />

        {/* the stack, the guard gap below it, unmapped memory below that */}
        <rect x={BX} y={TOP} width={BW} height={H} fill={PAPER} stroke={INK} strokeWidth={1.5} />
        {fill > 0 && <rect x={BX} y={TOP} width={BW} height={fill} fill="url(#dp-f)" />}
        <rect x={BX} y={TOP + H} width={BW} height={GUARD} fill="url(#dp-z)" stroke={INK} strokeWidth={2} />
        <rect x={BX} y={TOP + H + GUARD} width={BW} height={40} fill="url(#dp-h)" stroke={OLIVE_LT} strokeWidth={1} />
        {over && <rect x={BX + 18} y={TOP + H} width={BW - 36} height={spill} fill={INK} />}

        {/* the stack pointer */}
        <line x1={BX + BW + 64} y1={rspY} x2={BX + BW + 4} y2={rspY} stroke={INK} strokeWidth={1.5} markerEnd="url(#dp-a)" />
        <L x={BX + BW + 70} y={rspY + 3.5} size={10} weight={700}>rsp</L>
        <L x={BX + BW + 96} y={rspY + 3.5} size={9} fill={OLIVE}>{`depth ${fmt(depth)}`}</L>

        {/* labels and the dimension */}
        <L x={BX - 12} y={TOP + 4} size={9.5} anchor="end" weight={600}>STACK TOP</L>
        <L x={BX - 12} y={TOP + 17} size={8.5} anchor="end" fill={OLIVE}>main() starts here</L>
        <L x={BX - 12} y={TOP + H + 4} size={9.5} anchor="end" weight={600}>8 MiB LIMIT</L>
        <L x={BX - 12} y={TOP + H + 22} size={9.5} anchor="end" weight={700}>GUARD GAP</L>
        <L x={BX - 12} y={TOP + H + 35} size={8.5} anchor="end" fill={OLIVE}>an access stops the program</L>
        <L x={BX - 12} y={TOP + H + GUARD + 24} size={8.5} anchor="end" fill={OLIVE}>unmapped</L>
        <line x1={BX - 6} y1={TOP} x2={BX} y2={TOP} stroke={INK} strokeWidth={1.2} />
        <line x1={BX - 6} y1={TOP + H} x2={BX} y2={TOP + H} stroke={INK} strokeWidth={1.2} />
        <g>
          <line x1={40} y1={TOP + 40} x2={40} y2={TOP + H - 40} stroke={OLIVE} strokeWidth={1} />
          <line x1={35} y1={TOP + 40} x2={45} y2={TOP + 40} stroke={OLIVE} strokeWidth={1} />
          <line x1={35} y1={TOP + H - 40} x2={45} y2={TOP + H - 40} stroke={OLIVE} strokeWidth={1} />
          <L x={52} y={TOP + H / 2 - 4} size={9} fill={OLIVE}>8,388,608 B</L>
          <L x={52} y={TOP + H / 2 + 9} size={9} fill={OLIVE}>= 8 MiB</L>
        </g>

        {over && (
          <g transform={`rotate(-6 ${BX + BW / 2} ${TOP + H - 46})`}>
            <rect x={BX - 4} y={TOP + H - 70} width={BW + 8} height={40} fill={YEL} stroke={INK} strokeWidth={2.5} />
            <L x={BX + BW / 2} y={TOP + H - 52} size={13} anchor="middle" weight={700} ls={0.2} halo={null}>SIGSEGV</L>
            <L x={BX + BW / 2} y={TOP + H - 38} size={8.5} anchor="middle" weight={600} ls={0.1} halo={null}>STACK OVERFLOW</L>
          </g>
        )}

        <L x={0} y={432} size={9} fill={INK2}>{`1 frame = ${SIZES[size].label} · ${SIZES[size].note}`}</L>
      </svg>

      <div>
        <div className="ctl-lab">Frame size</div>
        <div className="ctl-row" style={{ marginTop: 6 }}>
          {SIZES.map((s, i) => (
            <button key={s.b} type="button" className="ctl" aria-pressed={size === i} onClick={() => setSize(i)}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="ctl-lab" style={{ marginTop: 18 }}>Recursion depth</div>
        <input
          className="slider"
          type="range"
          min={0}
          max={115}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          aria-label="Recursion depth, as a percentage of the maximum"
        />
        <div className="slider-lab">
          <span>0</span>
          <span>limit</span>
          <span>115 %</span>
        </div>
        <dl className="readout" style={{ marginTop: 16, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <div>
            <dt>Limit</dt>
            <dd>8 MiB</dd>
          </div>
          <div>
            <dt>Frame</dt>
            <dd>{SIZES[size].label}</dd>
          </div>
          <div>
            <dt>Max depth</dt>
            <dd>{fmt(max)}</dd>
          </div>
          <div>
            <dt>Depth</dt>
            <dd>{fmt(depth)}</dd>
          </div>
          <div>
            <dt>Used</dt>
            <dd>{over ? "> 100" : Math.round(pct)} %</dd>
          </div>
          <div>
            <dt>State</dt>
            <dd className={over ? "warn" : undefined}>{over ? "SIGSEGV" : "running"}</dd>
          </div>
        </dl>
        <div className="event" aria-live="polite">
          <b>{over ? "STOP" : "MATH"}</b>
          {over
            ? `Call ${fmt(max + 1)} has no room. Its frame lands in the guard gap, and the kernel sends SIGSEGV.`
            : `8,388,608 B ÷ ${fmt(frame)} B = ${fmt(max)} calls before the stack is full.`}
        </div>
      </div>
    </div>
  );
}
