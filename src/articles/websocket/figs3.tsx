/** Figures 08–11 of WS-6455: the closing handshake, the line monitor, readyState, reconnecting with backoff. */

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, Wide } from "./chrome";
import { SESSION, type Rec } from "./data";
import { closeOf, fromHex, hex2, OPCODES, parseFrame, payloadText, SHORT_OP, type FieldId, type Frame } from "./frame";
import { ACC, ACC_BG, Arrows, Hatch, INK, OLIVE, OLIVE_LT, PANEL, reduced, T } from "./svg";

const T0 = SESSION[0].t;
const ms = (t: number) => `+${(t - T0).toFixed(2)}`;
const enc = (s: string) => new TextEncoder().encode(s).length;
type Parsed = Rec & { f?: Frame };
const RECS: Parsed[] = SESSION.map((r) => (r.kind === "frame" ? { ...r, f: parseFrame(fromHex(r.hex)) } : r));

/* ------------------------------------------------------------------ */
/* FIG. 08 — the closing handshake                                     */
/* ------------------------------------------------------------------ */

export function FigClose() {
  const closes = RECS.filter((r) => r.f?.opcode === 8);
  const cc = closes.find((r) => r.dir === "c2s")!, sc = closes.find((r) => r.dir === "s2c")!;
  const C = 170, S = 620;
  const bytes = (f: Frame, accFrom: number, accTo: number) =>
    Array.from(f.bytes, (b, i) => (
      <tspan key={i} fill={i >= accFrom && i < accTo ? ACC : undefined} fontWeight={i >= accFrom && i < accTo ? 700 : undefined}>
        {(i ? " " : "") + hex2(b)}
      </tspan>
    ));
  const code = closeOf(cc.f!.data)!;
  return (
    <Wide min={680}>
      <svg viewBox="0 0 760 330" role="img" aria-label="The closing handshake: the client sends close 1000, the server answers close 1000, then the TCP connection closes">
        <Arrows id="f8" />
        <T x={C} y={16} size={9.5} anchor="middle" weight={700} ls={0.14}>CLIENT</T>
        <T x={S} y={16} size={9.5} anchor="middle" weight={700} ls={0.14}>SERVER</T>
        <line x1={C} y1={26} x2={C} y2={300} stroke={INK} strokeWidth={1.3} />
        <line x1={S} y1={26} x2={S} y2={300} stroke={INK} strokeWidth={1.3} />

        <line x1={C} y1={52} x2={S} y2={70} stroke={INK} strokeWidth={1.5} markerEnd="url(#f8-i)" />
        <T x={395} y={50} size={10} anchor="middle" weight={700}>{`CLOSE · masked · ${cc.f!.bytes.length} B`}</T>
        <T x={395} y={86} size={9.5} anchor="middle">{bytes(cc.f!, -1, -1)}</T>
        <T x={395} y={101} size={9} anchor="middle" fill={OLIVE}>
          <tspan>unmasked: </tspan>
          <tspan fill={ACC} fontWeight={700}>{`${hex2(cc.f!.data[0])} ${hex2(cc.f!.data[1])}`}</tspan>
          <tspan>{` ${Array.from(cc.f!.data.slice(2), hex2).join(" ")} → ${code.code} “${code.reason}”`}</tspan>
        </T>
        <T x={104} y={58} size={8.5} anchor="end" fill={OLIVE}>{`${ms(cc.t)} ms`}</T>

        <line x1={S} y1={128} x2={C} y2={146} stroke={INK} strokeWidth={1.5} markerEnd="url(#f8-i)" />
        <T x={395} y={126} size={10} anchor="middle" weight={700}>{`CLOSE · ${sc.f!.bytes.length} B · the server answers`}</T>
        <T x={395} y={162} size={9.5} anchor="middle">{bytes(sc.f!, 2, 4)}</T>
        <T x={104} y={134} size={8.5} anchor="end" fill={OLIVE}>{`${ms(sc.t)} ms`}</T>
        <T x={S + 10} y={100} size={8.5} fill={OLIVE}>0x03E8 = 1000</T>
        <T x={S + 10} y={112} size={8.5} fill={OLIVE}>normal closure</T>

        {/* TCP close, not in the capture */}
        <line x1={20} y1={186} x2={740} y2={186} stroke={INK} strokeDasharray="6 4" />
        <rect x={282} y={178} width={226} height={16} fill={PANEL} />
        <T x={395} y={190} size={8.5} anchor="middle" weight={700} ls={0.16}>NO MORE FRAMES · TCP CLOSES</T>
        <line x1={S} y1={212} x2={C} y2={226} stroke={OLIVE_LT} markerEnd="url(#f8-a)" />
        <T x={395} y={212} size={8.5} anchor="middle" fill={OLIVE}>FIN · the server closes TCP first</T>
        <line x1={C} y1={240} x2={S} y2={254} stroke={OLIVE_LT} markerEnd="url(#f8-a)" />
        <T x={395} y={268} size={8.5} anchor="middle" fill={OLIVE}>FIN · then the client</T>
        <T x={C - 8} y={296} size={8.5} anchor="end" fill={OLIVE}>time ↓</T>
        <rect x={C + 14} y={284} width={300} height={22} fill={ACC_BG} stroke={ACC} strokeWidth={1.2} />
        <T x={C + 24} y={299} size={9.5} weight={600} fill={ACC} halo={null}>close event · code 1000 · wasClean true</T>
      </svg>
    </Wide>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 09 — line monitor: the whole session                           */
/* ------------------------------------------------------------------ */

function DirMark({ dir }: { dir: "c2s" | "s2c" }) {
  return (
    <svg width={22} height={10} viewBox="0 0 22 10" aria-label={dir === "c2s" ? "client to server" : "server to client"} style={{ width: 22, display: "inline-block" }}>
      <line x1={1} y1={5} x2={21} y2={5} stroke="currentColor" strokeWidth={1.3} />
      {dir === "c2s" ? <path d="M15,1 L21,5 L15,9" fill="none" stroke="currentColor" strokeWidth={1.3} /> : <path d="M7,1 L1,5 L7,9" fill="none" stroke="currentColor" strokeWidth={1.3} />}
    </svg>
  );
}

const summary = (r: Parsed) => {
  if (r.kind === "http") {
    return { op: r.dir === "c2s" ? "GET" : "101", rest: r.dir === "c2s" ? "/chat · Upgrade" : "Switching Protocols", size: enc(r.text) };
  }
  const f = r.f!;
  return { op: SHORT_OP[f.opcode], rest: `${f.fin ? "" : "FIN 0 · "}${payloadText(f, 14)}`, size: f.bytes.length };
};

type Range = [number, number];
function rangeOf(f: Frame, id: FieldId): Range {
  const extEnd = 2 + f.extBytes;
  switch (id) {
    case "fin":
    case "rsv":
    case "opcode":
      return [0, 1];
    case "mask":
    case "len":
      return [1, 2];
    case "ext":
      return [2, extEnd];
    case "key":
      return [extEnd, extEnd + 4];
    default:
      return [f.headerLen, f.bytes.length];
  }
}

export function FigMonitor() {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState<FieldId | null>(null);
  const [play, setPlay] = useState(false);
  const inView = useInView();
  const listRef = useRef<HTMLDivElement>(null);
  const r = RECS[i];
  useEffect(() => {
    if (!play || !inView) return;
    const id = setInterval(() => setI((v) => (v + 1 < RECS.length ? v + 1 : (setPlay(false), v))), reduced() ? 2400 : 1500);
    return () => clearInterval(id);
  }, [play, inView]);
  // keep the selected record visible in the list, without moving the page
  useEffect(() => {
    const list = listRef.current;
    const b = list?.querySelectorAll("button")[i] as HTMLElement | undefined;
    if (list && b && (b.offsetTop < list.scrollTop || b.offsetTop + b.offsetHeight > list.scrollTop + list.clientHeight))
      list.scrollTop = b.offsetTop - list.clientHeight / 2;
  }, [i]);

  const f = r.f;
  const range = f && hover ? rangeOf(f, hover) : null;
  const cls = (j: number) => {
    if (!f) return "";
    const c = j < 2 ? "f-hdr" : j < 2 + f.extBytes ? "f-ext" : j < f.headerLen ? "f-key" : "f-pay";
    return range && j >= range[0] && j < range[1] ? `${c} on` : c;
  };
  const rows: [FieldId, string, string][] = f
    ? [
        ["fin", "FIN", f.fin ? "1 · last frame of the message" : "0 · more frames follow"],
        ["rsv", "RSV1–3", `${f.rsv.toString(2).padStart(3, "0")} · no extension`],
        ["opcode", "Opcode", `0x${f.opcode.toString(16)} · ${OPCODES[f.opcode]}`],
        ["mask", "Mask", f.masked ? "1 · the client masks" : "0 · the server does not mask"],
        ["len", "Payload len", f.len7 === 126 ? "126 · a 16-bit length follows" : `${f.len7} B`],
        ...(f.extBytes ? [["ext", "Extended len", `${f.length} B`] as [FieldId, string, string]] : []),
        ...(f.key ? [["key", "Masking key", Array.from(f.key, hex2).join(" ")] as [FieldId, string, string]] : []),
        ["payload", f.masked ? "Payload, unmasked" : "Payload", f.opcode === 2 ? Array.from(f.data, hex2).join(" ") : payloadText(f, 60)],
      ]
    : [];
  return (
    <div>
      <div className="fig-row">
        <div className="ctls">
          <button type="button" className="ctl" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
            Previous
          </button>
          <button type="button" className="ctl" onClick={() => setI(Math.min(RECS.length - 1, i + 1))} disabled={i === RECS.length - 1}>
            Next
          </button>
          <button
            type="button" className="ctl go" aria-pressed={play}
            onClick={() => {
              if (!play && i === RECS.length - 1) setI(0);
              setPlay(!play);
            }}
          >
            {play ? "Stop" : "Play session"}
          </button>
          <button type="button" className="ctl" onClick={() => { setPlay(false); setI(0); }}>
            Reset
          </button>
        </div>
        <dl className="readout" aria-live="polite">
          <div>
            <dt>Record</dt>
            <dd>
              {String(i + 1).padStart(2, "0")} / {RECS.length}
            </dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{ms(r.t)} ms</dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd className="k">{summary(r).size} B</dd>
          </div>
        </dl>
      </div>
      <div className="mon">
        <div className="mon-list" ref={listRef} role="listbox" aria-label="Records of the session">
          {RECS.map((x, j) => {
            const s = summary(x);
            return (
              <button key={j} type="button" role="option" aria-selected={i === j} aria-current={i === j} className={x.dir} onClick={() => { setPlay(false); setI(j); }}>
                <span className="t">{ms(x.t)}</span>
                <span className="d">
                  <DirMark dir={x.dir} />
                </span>
                <span className="w">
                  <b>{s.op}</b> {s.rest} · {s.size} B
                </span>
              </button>
            );
          })}
        </div>
        <div className="mon-detail">
          {r.kind === "http" ? (
            <>
              <pre className="mon-http">{r.text.replace(/\r\n/g, "␍␊\n")}</pre>
              <p className="say" style={{ marginTop: 0 }}>
                {r.dir === "c2s"
                  ? "The client asks to change protocol. It offers compression (permessage-deflate). The server can refuse it."
                  : "The server accepts the upgrade. It sends no Sec-WebSocket-Extensions line, so compression stays off."}
              </p>
            </>
          ) : (
            <>
              <div className="hexd" aria-label="Frame bytes">
                {Array.from({ length: Math.ceil(f!.bytes.length / 16) }, (_, row) => {
                  const slice = Array.from(f!.bytes.slice(row * 16, row * 16 + 16));
                  return (
                    <div className="row" key={row}>
                      <span className="off">{(row * 16).toString(16).padStart(4, "0")}</span>
                      <span className="by">
                        {slice.map((b, k) => (
                          <span key={k} className={cls(row * 16 + k)}>
                            {hex2(b)}
                            {k < slice.length - 1 ? " " : ""}
                          </span>
                        ))}
                      </span>
                    </div>
                  );
                })}
              </div>
              <table className="dec">
                <tbody>
                  {rows.map(([id, k, v]) => (
                    <tr key={id} className={hover === id ? "on" : undefined} onMouseEnter={() => setHover(id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(id)} onBlur={() => setHover(null)} tabIndex={0}>
                      <td>{k}</td>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 10 — readyState, from open to closed                           */
/* ------------------------------------------------------------------ */

type St = 0 | 1 | 2 | 3;
const NAMES = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];

export function FigReadyState() {
  const [st, setSt] = useState<St | null>(null);
  const [edge, setEdge] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const timer = useRef<number>(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const go = (to: St | null, e: string | null, ...lines: string[]) => {
    if (to !== null) setSt(to);
    setEdge(e);
    setLog((l) => [...lines, ...l].slice(0, 7));
  };
  const actions: { label: string; ok: boolean; run: () => void }[] = [
    {
      label: "new WebSocket(url)", ok: st === null || st === 3,
      run: () => { setLog([]); go(0, null, "readyState 0 · CONNECTING · the handshake starts"); },
    },
    { label: "Server sends 101", ok: st === 0, run: () => go(1, "01", "open event · readyState 1 · OPEN") },
    { label: "Server refuses", ok: st === 0, run: () => go(3, "03", "error event", "close event · code 1006 · wasClean false · readyState 3") },
    {
      label: "ws.send(\"Hi\")", ok: st !== null,
      run: () =>
        go(null, null, st === 0
          ? "InvalidStateError · send() throws while CONNECTING"
          : st === 1
            ? "frame sent · bufferedAmount 2 → 0 B"
            : "nothing sent · the connection is closing or closed"),
    },
    { label: "Server sends a message", ok: st === 1, run: () => go(null, null, "message event · data “price 42”") },
    {
      label: "ws.close(1000)", ok: st === 1,
      run: () => {
        go(2, "12", "close frame sent · readyState 2 · CLOSING");
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => go(3, "23", "server close frame · close event · code 1000 · wasClean true"), reduced() ? 0 : 1100);
      },
    },
    { label: "Network drops", ok: st === 1, run: () => go(3, "13", "close event · code 1006 · wasClean false · readyState 3") },
  ];
  const BX = [8, 214, 420, 626], BY = 78, BW = 124, BH = 54;
  const edgeLine = (id: string, d: string, label: string, lx: number, ly: number, anchor: "start" | "middle" | "end" = "middle") => {
    const on = edge === id;
    return (
      <g>
        <path d={d} fill="none" stroke={on ? ACC : OLIVE} strokeWidth={on ? 2 : 1.2} className={on ? "flow" : undefined} markerEnd={`url(#f10-${on ? "k" : "a"})`} />
        <T x={lx} y={ly} size={8.5} anchor={anchor} fill={on ? ACC : OLIVE} weight={on ? 600 : 400}>{label}</T>
      </g>
    );
  };
  return (
    <div>
      <div className="ctls" role="group" aria-label="Actions" style={{ marginBottom: 14 }}>
        {actions.map((a) => (
          <button key={a.label} type="button" className={`ctl${a.label.startsWith("new") ? " go" : ""}${/[()]/.test(a.label) ? " code" : ""}`} disabled={!a.ok} onClick={a.run}>
            {a.label}
          </button>
        ))}
      </div>
      <Wide min={660}>
        <svg viewBox="0 0 760 250" role="img" aria-label={`State machine of readyState; current state ${st === null ? "none" : NAMES[st]}`}>
          <Arrows id="f10" />
          {edgeLine("01", `M${BX[0] + BW},${BY + 27} H${BX[1] - 2}`, "101 · open", (BX[0] + BW + BX[1]) / 2, BY + 20)}
          {edgeLine("12", `M${BX[1] + BW},${BY + 27} H${BX[2] - 2}`, "close()", (BX[1] + BW + BX[2]) / 2, BY + 20)}
          {edgeLine("23", `M${BX[2] + BW},${BY + 27} H${BX[3] - 2}`, "close frames", (BX[2] + BW + BX[3]) / 2, BY + 20)}
          {edgeLine("03", `M${BX[0] + 62},${BY + BH} V${BY + BH + 74} H${BX[3] + 82} V${BY + BH + 4}`, "refused or failed · error, close 1006", BX[0] + 72, BY + BH + 90, "start")}
          {edgeLine("13", `M${BX[1] + 62},${BY + BH} V${BY + BH + 40} H${BX[3] + 42} V${BY + BH + 4}`, "network drops · close 1006", BX[1] + 72, BY + BH + 34, "start")}
          {NAMES.map((n, k) => {
            const on = st === k;
            return (
              <g key={n}>
                <rect x={BX[k]} y={BY} width={BW} height={BH} fill={on ? ACC_BG : PANEL} stroke={on ? ACC : INK} strokeWidth={on ? 2.4 : 1.3} />
                <T x={BX[k] + BW / 2} y={BY + 24} size={11} anchor="middle" weight={700} fill={on ? ACC : INK} halo={null}>{n}</T>
                <T x={BX[k] + BW / 2} y={BY + 40} size={8.5} anchor="middle" fill={OLIVE} halo={null}>{`readyState ${k}`}</T>
              </g>
            );
          })}
          <T x={8} y={20} size={9} fill={OLIVE} ls={0.16}>WEBSOCKET OBJECT · BROWSER OR NODE</T>
          <T x={8} y={36} size={9} fill={OLIVE}>A state never goes back. A new connection needs a new object.</T>
        </svg>
      </Wide>
      <div className="say" aria-live="polite" style={{ minHeight: "9.5em" }}>
        {log.length ? (
          log.map((l, k) => (
            <div key={k} style={{ opacity: k === 0 ? 1 : 0.55 }}>
              {k === 0 ? <b>{l}</b> : l}
            </div>
          ))
        ) : (
          <span>Select “new WebSocket(url)” to start. The events appear here, newest first.</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 11 — reconnect: backoff and jitter                             */
/* ------------------------------------------------------------------ */

const CLIENTS = 24, DOWN = 6, SPAN = 20, BASE = 0.5, CAP = 30, BIN = 0.5;

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function simulate(jitter: boolean, seed: number) {
  const rnd = mulberry(seed);
  return Array.from({ length: CLIENTS }, () => {
    const tries: { t: number; ok: boolean }[] = [];
    let t = 0;
    for (let n = 0; n < 12; n++) {
      const ceiling = Math.min(CAP, BASE * 2 ** n);
      t += jitter ? rnd() * ceiling : ceiling;
      const ok = t >= DOWN;
      tries.push({ t, ok });
      if (ok) break;
    }
    return tries;
  });
}

export function FigBackoff() {
  const [jitter, setJitter] = useState(false);
  const [seed, setSeed] = useState(7);
  const sim = useMemo(() => simulate(jitter, seed), [jitter, seed]);
  const X0 = 96, X1 = 740, Y0 = 40, RH = 6.5;
  const x = (t: number) => X0 + (Math.min(t, SPAN) / SPAN) * (X1 - X0);
  const bins = Array.from({ length: SPAN / BIN }, () => 0);
  sim.flat().forEach((a) => {
    if (a.t < SPAN) bins[Math.floor(a.t / BIN)] += 1;
  });
  const peak = Math.max(...bins);
  const lastBack = Math.max(...sim.map((s) => s[s.length - 1].t));
  const total = sim.flat().length;
  const HY = Y0 + CLIENTS * RH + 70, HH = 60;
  return (
    <div>
      <div className="fig-row">
        <div className="ctls" role="group" aria-label="Wait">
          <button type="button" className="ctl" aria-pressed={!jitter} onClick={() => setJitter(false)}>
            Backoff, no jitter
          </button>
          <button type="button" className="ctl" aria-pressed={jitter} onClick={() => setJitter(true)}>
            Backoff + full jitter
          </button>
          <button type="button" className="ctl" onClick={() => setSeed((s) => s + 1)} disabled={!jitter}>
            New random draw
          </button>
        </div>
        <dl className="readout" aria-live="polite">
          <div>
            <dt>Peak in 0.5 s</dt>
            <dd className="k">{peak} tries</dd>
          </div>
          <div>
            <dt>Tries</dt>
            <dd>{total}</dd>
          </div>
          <div>
            <dt>All back at</dt>
            <dd>{lastBack.toFixed(1)} s</dd>
          </div>
        </dl>
      </div>
      <Wide min={660}>
        <svg viewBox={`0 0 760 ${HY + HH + 40}`} role="img" aria-label={`Reconnect tries of ${CLIENTS} clients after a server restart, ${jitter ? "with" : "without"} jitter`}>
          <Hatch id="f11" />
          <rect x={x(0)} y={Y0 - 8} width={x(DOWN) - x(0)} height={CLIENTS * RH + 14} fill="url(#f11-h)" />
          <T x={x(DOWN / 2)} y={Y0 - 14} size={8.5} anchor="middle" fill={OLIVE} ls={0.12}>SERVER DOWN · 0–6 S</T>
          <T x={x(DOWN) + 6} y={Y0 - 14} size={8.5} fill={OLIVE} ls={0.12}>SERVER BACK</T>
          <line x1={x(DOWN)} y1={Y0 - 10} x2={x(DOWN)} y2={HY + HH} stroke={OLIVE} strokeDasharray="3 3" />
          <T x={X0 - 10} y={Y0 + 4} size={8.5} anchor="end" fill={OLIVE}>CLIENT 1</T>
          <T x={X0 - 10} y={Y0 + (CLIENTS - 1) * RH + 4} size={8.5} anchor="end" fill={OLIVE}>{`CLIENT ${CLIENTS}`}</T>
          {sim.map((tries, c) => (
            <g key={c}>
              <line x1={x(0)} y1={Y0 + c * RH} x2={x(tries[tries.length - 1].t)} y2={Y0 + c * RH} stroke={OLIVE_LT} strokeWidth={0.8} />
              {tries.map((a, k) =>
                a.t < SPAN ? (
                  <rect key={k} x={x(a.t) - 2.5} y={Y0 + c * RH - 2.5} width={5} height={5} fill={a.ok ? INK : PANEL} stroke={INK} strokeWidth={1} />
                ) : null,
              )}
            </g>
          ))}
          {/* tries per 0.5 s */}
          <T x={X0 - 10} y={HY + 4} size={8.5} anchor="end" fill={OLIVE}>TRIES</T>
          <T x={X0 - 10} y={HY + 16} size={8.5} anchor="end" fill={OLIVE}>PER 0.5 S</T>
          {bins.map((v, k) => {
            const h = (v / CLIENTS) * HH;
            const on = v === peak && v > 0;
            return v ? (
              <g key={k}>
                <rect x={x(k * BIN) + 1} y={HY + HH - h} width={x(BIN) - x(0) - 2} height={h} fill={on ? ACC : OLIVE_LT} />
                {on && <T x={x(k * BIN + BIN / 2)} y={HY + HH - h - 5} size={9} anchor="middle" fill={ACC} weight={700}>{String(v)}</T>}
              </g>
            ) : null;
          })}
          <line x1={X0} y1={HY + HH} x2={X1} y2={HY + HH} stroke={INK} />
          {[0, 5, 10, 15, 20].map((t) => (
            <g key={t}>
              <line x1={x(t)} y1={HY + HH} x2={x(t)} y2={HY + HH + 5} stroke={OLIVE} />
              <T x={x(t)} y={HY + HH + 17} size={9} anchor="middle" fill={OLIVE}>{`${t} s`}</T>
            </g>
          ))}
          <g transform={`translate(${X0} ${HY + HH + 34})`}>
            <rect x={0} y={-7} width={6} height={6} fill={PANEL} stroke={INK} />
            <T x={12} y={0} size={8.5} fill={OLIVE}>TRY FAILS</T>
            <rect x={90} y={-7} width={6} height={6} fill={INK} />
            <T x={102} y={0} size={8.5} fill={OLIVE}>TRY CONNECTS</T>
            <T x={210} y={0} size={8.5} fill={OLIVE}>{`BASE ${BASE * 1000} MS · CAP ${CAP} S · ${CLIENTS} CLIENTS · SIMULATED`}</T>
          </g>
        </svg>
      </Wide>
    </div>
  );
}
