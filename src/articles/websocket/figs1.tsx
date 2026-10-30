/** Figures 01–04 of WS-6455: who can send, four ways to get events, the opening handshake, the Accept key. */

import { useEffect, useMemo, useState } from "react";
import { useInView, Wide } from "./chrome";
import { HTTP_RUN, SESSION } from "./data";
import { ACC, Arrows, Dim, Hatch, INK, OLIVE, OLIVE_LT, reduced, T, Ticks } from "./svg";

export const GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const bytesOf = (s: string) => new TextEncoder().encode(s).length;
const httpHeads = SESSION.filter((r) => r.kind === "http") as { dir: string; t: number; text: string }[];
export const GET_HEAD = httpHeads.find((r) => r.dir === "c2s")!.text;
export const RES_HEAD = httpHeads.find((r) => r.dir === "s2c")!.text;
const header = (text: string, name: string) =>
  text.split("\r\n").find((l) => l.toLowerCase().startsWith(name.toLowerCase() + ":"))!.split(": ")[1];
export const CAPTURED_KEY = header(GET_HEAD, "sec-websocket-key");
export const CAPTURED_ACCEPT = header(RES_HEAD, "sec-websocket-accept");

/* ------------------------------------------------------------------ */
/* FIG. 01 — who can send, and when                                    */
/* ------------------------------------------------------------------ */

export function FigWhoSends() {
  // two panels, time runs down
  const panel = (ox: number, title: string, sub: string) => (
    <g>
      <T x={ox} y={14} size={10} weight={700} ls={0.1}>{title}</T>
      <T x={ox} y={28} size={9} fill={OLIVE}>{sub}</T>
      <T x={ox + 40} y={56} size={9} anchor="middle" fill={OLIVE} ls={0.16}>CLIENT</T>
      <T x={ox + 300} y={56} size={9} anchor="middle" fill={OLIVE} ls={0.16}>SERVER</T>
      <line x1={ox + 40} y1={64} x2={ox + 40} y2={300} stroke={INK} strokeWidth={1.3} />
      <line x1={ox + 300} y1={64} x2={ox + 300} y2={300} stroke={INK} strokeWidth={1.3} />
    </g>
  );
  const msg = (x1: number, y1: number, x2: number, y2: number, label: string, kind: "i" | "a" | "k" = "i", above = true) => {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const col = kind === "k" ? ACC : kind === "a" ? OLIVE : INK;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={kind === "k" ? 2 : 1.3} markerEnd={`url(#f1-${kind})`} />
        <T x={mx} y={above ? my - 6 : my + 13} size={9} anchor="middle" fill={kind === "k" ? ACC : INK} weight={kind === "k" ? 600 : 400}>
          {label}
        </T>
      </g>
    );
  };
  const A = 0, B = 400;
  return (
    <Wide min={660}>
      <svg viewBox="0 0 760 330" role="img" aria-label="HTTP: the server answers only a request. WebSocket: after one handshake, both sides send at any time.">
        <Arrows id="f1" />
        <Hatch id="f1" />
        {/* packets first, so that they pass behind the labels */}
        <rect className="packet" x={-3.5} y={-3.5} width={7} height={7} fill={ACC}>
          <animateMotion dur="4s" repeatCount="indefinite" path={`M${B + 300},158 L${B + 40},170`} />
        </rect>
        {panel(A, "A — HTTP/1.1", "The client asks. The server answers.")}
        {msg(A + 40, 80, A + 300, 96, "GET /price")}
        {msg(A + 300, 104, A + 40, 120, "200 · no change", "i", false)}
        {/* the event that has to wait */}
        <rect x={A + 294} y={146} width={12} height={12} transform={`rotate(45 ${A + 300} 152)`} fill={ACC} stroke={INK} strokeWidth={1.2} />
        <T x={A + 286} y={150} size={9} anchor="end" fill={ACC} weight={600}>price changes</T>
        <rect x={A + 296} y={160} width={8} height={56} fill="url(#f1-h)" stroke={OLIVE_LT} strokeWidth={0.8} />
        <Dim x1={A + 326} y1={152} x2={A + 326} y2={222} label="waits" />
        {msg(A + 40, 206, A + 300, 222, "GET /price")}
        {msg(A + 300, 230, A + 40, 246, "200 · new price", "k", false)}
        <T x={A + 50} y={292} size={9} fill={OLIVE}>The server cannot start a message.</T>

        {panel(B, "B — WebSocket", "One handshake. Then both sides send.")}
        {msg(B + 40, 80, B + 300, 92, "GET · Upgrade", "a")}
        {msg(B + 300, 100, B + 40, 112, "101 Switching", "a", false)}
        <rect x={B + 44} y={124} width={252} height={168} fill="none" stroke={OLIVE_LT} strokeDasharray="3 4" />
        <T x={B + 170} y={138} size={8.5} anchor="middle" fill={OLIVE} ls={0.14}>CONNECTION STAYS OPEN</T>
        <rect x={B + 294} y={152} width={12} height={12} transform={`rotate(45 ${B + 300} 158)`} fill={ACC} stroke={INK} strokeWidth={1.2} />
        {msg(B + 300, 158, B + 40, 170, "new price", "k")}
        {msg(B + 40, 196, B + 300, 206, "subscribe EUR")}
        {msg(B + 300, 224, B + 40, 234, "new price", "i")}
        {msg(B + 300, 252, B + 40, 262, "new price", "i")}
        <T x={B + 50} y={312} size={9} fill={OLIVE}>The server sends when it has data.</T>

        <line x1={380} y1={44} x2={380} y2={310} stroke={OLIVE_LT} strokeWidth={1} />
        <line x1={14} y1={80} x2={14} y2={250} stroke={OLIVE} strokeWidth={1} markerEnd="url(#f1-a)" />
        <T x={8} y={72} size={8.5} fill={OLIVE} ls={0.14}>TIME</T>
        <Ticks w={760} h={330} />
      </svg>
    </Wide>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 02 — four ways to get the same server events                  */
/* ------------------------------------------------------------------ */

type Method = "poll" | "long" | "sse" | "ws";
const EVENTS = [1.2, 5.0, 6.4, 11.3, 17.8]; // s, an example
const SPAN = 20, POLL = 3, ONE_WAY = 0.25;

/** measured sizes (Table 2-1), in bytes */
export const SIZES = (() => {
  const [pollReq, pollEmpty, , pollNews, sseReq, sseRes] = HTTP_RUN.map((h) => h.bytes);
  const sseEvent = bytesOf('data: {"price":42}\n\n');
  return {
    pollReq, pollEmpty, pollNews, pollNewsHead: pollNews - 12, sseReq, sseHead: sseRes - sseEvent, sseEvent,
    wsGet: bytesOf(GET_HEAD), ws101: bytesOf(RES_HEAD), wsFrame: 2 + 12,
  };
})();

type Arrow = { t0: number; t1: number; up: boolean; kind: "req" | "res" | "frame" | "hand" };
type Plan = { arrows: Arrow[]; held: [number, number][]; deliveries: number[]; requests: number; bytes: number; open: string };

function plan(m: Method): Plan {
  const arrows: Arrow[] = [], held: [number, number][] = [], deliveries: number[] = [];
  let requests = 0, bytes = 0;
  if (m === "poll") {
    let pending = [...EVENTS];
    for (let t = 0; t <= SPAN - 1; t += POLL) {
      const at = t + ONE_WAY;
      const news = pending.filter((e) => e <= at);
      pending = pending.filter((e) => e > at);
      arrows.push({ t0: t, t1: at, up: true, kind: "req" }, { t0: at, t1: at + ONE_WAY, up: false, kind: "res" });
      news.forEach(() => deliveries.push(at + ONE_WAY));
      requests += 1;
      bytes += SIZES.pollReq + (news.length ? SIZES.pollNewsHead + 12 * news.length : SIZES.pollEmpty);
    }
  } else if (m === "long") {
    let t = 0;
    for (const e of EVENTS) {
      const at = t + ONE_WAY;
      const fire = Math.max(e, at);
      arrows.push({ t0: t, t1: at, up: true, kind: "req" }, { t0: fire, t1: fire + ONE_WAY, up: false, kind: "res" });
      held.push([at, fire]);
      deliveries.push(fire + ONE_WAY);
      requests += 1;
      bytes += SIZES.pollReq + SIZES.pollNewsHead + 12;
      t = fire + ONE_WAY;
    }
    arrows.push({ t0: t, t1: t + ONE_WAY, up: true, kind: "req" });
    held.push([t + ONE_WAY, SPAN]);
    requests += 1;
    bytes += SIZES.pollReq;
  } else {
    const isWs = m === "ws";
    arrows.push({ t0: 0, t1: ONE_WAY, up: true, kind: "hand" }, { t0: ONE_WAY, t1: 2 * ONE_WAY, up: false, kind: "hand" });
    held.push([2 * ONE_WAY, SPAN]);
    for (const e of EVENTS) {
      arrows.push({ t0: e, t1: e + ONE_WAY, up: false, kind: "frame" });
      deliveries.push(e + ONE_WAY);
    }
    requests = 1;
    bytes = isWs ? SIZES.wsGet + SIZES.ws101 + EVENTS.length * SIZES.wsFrame : SIZES.sseReq + SIZES.sseHead + EVENTS.length * SIZES.sseEvent;
  }
  return { arrows, held, deliveries, requests, bytes, open: m === "poll" ? "none" : m === "long" ? "one, renewed" : "one, all the time" };
}

const METHODS: [Method, string][] = [["poll", "Short polling"], ["long", "Long polling"], ["sse", "Server-sent events"], ["ws", "WebSocket"]];
const SAY: Record<Method, string> = {
  poll: "The client asks every 3 s. Most answers are empty. An event waits on the server until the next request arrives.",
  long: "The server keeps each request open until it has an event. Then the client sends a new request at once.",
  sse: "One HTTP response stays open. The server writes each event into it. The client cannot send on this connection.",
  ws: "One handshake opens the connection. Each event is one small frame. The client can also send on the same connection.",
};

export function FigFourWays() {
  const [m, setM] = useState<Method>("poll");
  const inView = useInView();
  const [now, setNow] = useState(SPAN);
  const p = useMemo(() => plan(m), [m]);
  // the playhead runs from 0 s to 20 s when the figure is on screen or the method changes
  useEffect(() => {
    if (!inView || reduced()) {
      setNow(SPAN);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (ts: number) => {
      const t = Math.min(SPAN, ((ts - start) / 7000) * SPAN);
      setNow(t);
      if (t < SPAN) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [m, inView]);

  const X0 = 96, X1 = 740, YS = 44, YC = 150;
  const x = (t: number) => X0 + (t / SPAN) * (X1 - X0);
  const delays = EVENTS.map((e, i) => p.deliveries[i] - e);
  const mean = delays.reduce((a, b) => a + b, 0) / delays.length;
  const shown = (t: number) => (t <= now ? 1 : 0);

  return (
    <div>
      <div className="fig-row">
        <div className="ctls" role="group" aria-label="Method">
          {METHODS.map(([k, label]) => (
            <button key={k} type="button" className="ctl" aria-pressed={m === k} onClick={() => setM(k)}>
              {label}
            </button>
          ))}
        </div>
        <dl className="readout" aria-live="polite">
          <div>
            <dt>HTTP requests</dt>
            <dd>{p.requests}</dd>
          </div>
          <div>
            <dt>Bytes on the wire</dt>
            <dd>{p.bytes.toLocaleString("en-US")} B</dd>
          </div>
          <div>
            <dt>Mean delay</dt>
            <dd className="k">{mean.toFixed(2)} s</dd>
          </div>
        </dl>
      </div>
      <Wide min={660}>
        <svg viewBox="0 0 760 236" role="img" aria-label={`Timeline of five server events received by ${METHODS.find((q) => q[0] === m)![1]}`}>
          <Arrows id="f2" />
          {/* held requests and open streams */}
          {p.held.map(([a, b], i) => (
            <rect key={i} x={x(a)} y={YS - 3} width={Math.max(0, Math.min(x(b), x(now)) - x(a))} height={6} fill={OLIVE_LT} opacity={a <= now ? 1 : 0} />
          ))}
          <line x1={X0} y1={YS} x2={X1} y2={YS} stroke={INK} strokeWidth={1.3} />
          <line x1={X0} y1={YC} x2={X1} y2={YC} stroke={INK} strokeWidth={1.3} />
          <T x={X0 - 10} y={YS + 3} size={9} anchor="end" fill={OLIVE} ls={0.16}>SERVER</T>
          <T x={X0 - 10} y={YC + 3} size={9} anchor="end" fill={OLIVE} ls={0.16}>CLIENT</T>
          {p.arrows.map((a, i) => {
            const k = a.kind === "frame" ? "k" : a.kind === "hand" ? "a" : "i";
            const col = k === "k" ? ACC : k === "a" ? OLIVE : INK;
            return (
              <line
                key={i} className="fade" opacity={shown(a.t1)}
                x1={x(a.t0)} y1={a.up ? YC - 2 : YS + 4} x2={x(a.t1)} y2={a.up ? YS + 4 : YC - 4}
                stroke={col} strokeWidth={k === "k" ? 1.8 : 1.1} markerEnd={`url(#f2-${k})`}
              />
            );
          })}
          {EVENTS.map((e, i) => (
            <g key={e}>
              <rect x={x(e) - 5} y={YS - 5} width={10} height={10} transform={`rotate(45 ${x(e)} ${YS})`} fill={ACC} stroke={INK} strokeWidth={1} />
              <T x={x(e)} y={YS - 14} size={9} anchor="middle" fill={ACC} weight={600}>{`E${i + 1}`}</T>
              <g className="fade" opacity={shown(p.deliveries[i])}>
                <line x1={x(p.deliveries[i])} y1={YC + 6} x2={x(p.deliveries[i])} y2={YC + 16} stroke={ACC} strokeWidth={2} />
                <T x={x(p.deliveries[i])} y={YC + 28} size={8.5} anchor="middle" fill={OLIVE}>{`+${delays[i].toFixed(1)}`}</T>
              </g>
            </g>
          ))}
          {/* the time axis */}
          {[0, 5, 10, 15, 20].map((t) => (
            <g key={t}>
              <line x1={x(t)} y1={YC + 36} x2={x(t)} y2={YC + 42} stroke={OLIVE} />
              <T x={x(t)} y={YC + 54} size={9} anchor="middle" fill={OLIVE}>{`${t} s`}</T>
            </g>
          ))}
          <line x1={X0} y1={YC + 39} x2={X1} y2={YC + 39} stroke={OLIVE_LT} />
          <line x1={x(now)} y1={YS - 30} x2={x(now)} y2={YC + 39} stroke={ACC} strokeWidth={1} strokeDasharray="2 3" opacity={now < SPAN ? 1 : 0} />
          {/* legend */}
          <g transform="translate(96 228)">
            <rect x={0} y={-6} width={7} height={7} transform="rotate(45 3.5 -2.5)" fill={ACC} />
            <T x={14} y={0} size={8.5} fill={OLIVE}>EVENT ON THE SERVER</T>
            <line x1={170} y1={-3} x2={170} y2={5} stroke={ACC} strokeWidth={2} transform="translate(0 -4)" />
            <T x={180} y={0} size={8.5} fill={OLIVE}>RECEIVED · DELAY IN S</T>
            <rect x={330} y={-6} width={22} height={5} fill={OLIVE_LT} />
            <T x={360} y={0} size={8.5} fill={OLIVE}>REQUEST OR STREAM HELD OPEN</T>
          </g>
        </svg>
      </Wide>
      <p className="say">
        <b>{METHODS.find((q) => q[0] === m)![1]}.</b> {SAY[m]}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 03 — the opening handshake                                     */
/* ------------------------------------------------------------------ */

export function FigHandshake() {
  const t0 = SESSION[0].t;
  const ms = (t: number) => `+${(t - t0).toFixed(2)} ms`;
  const frames = SESSION.filter((r) => r.kind === "frame").slice(0, 3);
  const C = 170, S = 640;
  const row = (y1: number, y2: number, toServer: boolean, col: string, w = 1.3, mk = "i") => (
    <line x1={toServer ? C : S} y1={y1} x2={toServer ? S : C} y2={y2} stroke={col} strokeWidth={w} markerEnd={`url(#f3-${mk})`} />
  );
  const short = (s: string) => `${s.slice(0, 8)}…${s.slice(-6)}`;
  return (
    <Wide min={680}>
      <svg viewBox="0 0 760 446" role="img" aria-label="Sequence of the opening handshake: TCP connection, HTTP GET with Upgrade, 101 response, then frames">
        <Arrows id="f3" />
        <T x={C} y={16} size={9.5} anchor="middle" weight={700} ls={0.14}>CLIENT · NODE</T>
        <T x={S} y={16} size={9.5} anchor="middle" weight={700} ls={0.14}>SERVER · WEBSOCKETS</T>
        <line x1={C} y1={26} x2={C} y2={434} stroke={INK} strokeWidth={1.3} />
        <line x1={S} y1={26} x2={S} y2={434} stroke={INK} strokeWidth={1.3} />

        {/* TCP: not in the capture */}
        {row(44, 54, true, OLIVE_LT, 1, "a")}
        {row(62, 72, false, OLIVE_LT, 1, "a")}
        {row(80, 90, true, OLIVE_LT, 1, "a")}
        <T x={405} y={46} size={8.5} anchor="middle" fill={OLIVE}>SYN</T>
        <T x={405} y={64} size={8.5} anchor="middle" fill={OLIVE}>SYN-ACK</T>
        <T x={405} y={82} size={8.5} anchor="middle" fill={OLIVE}>ACK</T>
        <path d="M118,44 H110 V90 H118" fill="none" stroke={OLIVE} />
        <T x={104} y={62} size={8.5} anchor="end" fill={OLIVE}>TCP</T>
        <T x={104} y={74} size={8.5} anchor="end" fill={OLIVE}>connect</T>

        {/* the HTTP part */}
        {row(118, 140, true, INK, 1.6)}
        <T x={405} y={116} size={10} anchor="middle" weight={700}>GET /chat HTTP/1.1</T>
        <T x={405} y={150} size={9} anchor="middle" fill={OLIVE}>{`Upgrade: websocket · ${bytesOf(GET_HEAD)} B`}</T>
        <T x={405} y={164} size={9.5} anchor="middle" fill={ACC} weight={600}>{`Sec-WebSocket-Key: ${short(CAPTURED_KEY)}`}</T>
        <T x={104} y={122} size={8.5} anchor="end" fill={OLIVE}>{ms(SESSION[0].t)}</T>

        {row(190, 212, false, INK, 1.6)}
        <T x={405} y={188} size={10} anchor="middle" weight={700}>HTTP/1.1 101 Switching Protocols</T>
        <T x={405} y={222} size={9} anchor="middle" fill={OLIVE}>{`Upgrade: websocket · ${bytesOf(RES_HEAD)} B`}</T>
        <T x={405} y={236} size={9.5} anchor="middle" fill={ACC} weight={600}>{`Sec-WebSocket-Accept: ${short(CAPTURED_ACCEPT)}`}</T>
        <T x={104} y={194} size={8.5} anchor="end" fill={OLIVE}>{ms(SESSION[1].t)}</T>
        <T x={405} y={252} size={8.5} anchor="middle" fill={OLIVE}>Accept = base64( SHA-1( key + GUID ) ) · Fig. 04</T>

        {/* the protocol changes */}
        <line x1={20} y1={272} x2={740} y2={272} stroke={INK} strokeDasharray="6 4" />
        <rect x={232} y={264} width={346} height={16} fill="var(--panel)" />
        <T x={405} y={276} size={8.5} anchor="middle" weight={700} ls={0.16}>HTTP ENDS · FRAMES BEGIN · SAME TCP CONNECTION</T>

        {frames.map((r, i) => {
          const y = 306 + i * 42;
          const up = r.dir === "c2s";
          const hex = r.kind === "frame" ? r.hex : "";
          const names = ["TEXT “Hello” · masked", "TEXT “Hello”", "PING “tick”"];
          return (
            <g key={i}>
              {row(y, y + 12, up, i === 0 ? ACC : INK, i === 0 ? 1.8 : 1.2, i === 0 ? "k" : "i")}
              <T x={405} y={y - 2} size={9.5} anchor="middle" weight={600} fill={i === 0 ? ACC : INK}>{names[i]}</T>
              <T x={405} y={y + 24} size={8.5} anchor="middle" fill={OLIVE}>{`${hex.match(/../g)!.join(" ")} · ${hex.length / 2} B`}</T>
              <T x={104} y={y + 4} size={8.5} anchor="end" fill={OLIVE}>{ms(r.t)}</T>
            </g>
          );
        })}
        <T x={C - 8} y={432} size={8.5} anchor="end" fill={OLIVE}>time ↓</T>
      </svg>
    </Wide>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 04 — Sec-WebSocket-Accept, computed in this page                */
/* ------------------------------------------------------------------ */

const b64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));
const RFC_KEY = "dGhlIHNhbXBsZSBub25jZQ==";

export function FigAccept() {
  const [key, setKey] = useState(CAPTURED_KEY);
  const [sha, setSha] = useState<Uint8Array | null>(null);
  const [step, setStep] = useState(4);
  const inView = useInView();
  useEffect(() => {
    let live = true;
    crypto.subtle.digest("SHA-1", new TextEncoder().encode(key + GUID)).then((d) => {
      if (live) setSha(new Uint8Array(d));
    });
    return () => {
      live = false;
    };
  }, [key]);
  // the steps light up one after the other after each new key
  useEffect(() => {
    if (!inView || reduced()) {
      setStep(4);
      return;
    }
    setStep(0);
    let s = 0;
    const id = setInterval(() => {
      s += 1;
      setStep(s);
      if (s >= 4) clearInterval(id);
    }, 420);
    return () => clearInterval(id);
  }, [key, inView]);
  const accept = sha ? b64(sha) : "…";
  const valid = (() => {
    try {
      return atob(key).length === 16;
    } catch {
      return false;
    }
  })();
  const verdict =
    key === CAPTURED_KEY
      ? accept === CAPTURED_ACCEPT
        ? "Equal to the Sec-WebSocket-Accept line of the captured 101 response."
        : "Not equal to the captured response."
      : key === RFC_KEY
        ? accept === "s3pPLMBiTxaQ9kYGzzhZRbK+xOo="
          ? "Equal to the example in RFC 6455, section 1.3."
          : "Not equal to the RFC example."
        : valid
          ? "A server must send this value for this key."
          : "Not a valid key: a key is 16 bytes in base64 (24 characters). A server refuses it.";
  const newKey = () => setKey(b64(crypto.getRandomValues(new Uint8Array(16))));
  return (
    <div>
      <div className="fig-row">
        <div className="ctls">
          <button type="button" className="ctl" aria-pressed={key === CAPTURED_KEY} onClick={() => setKey(CAPTURED_KEY)}>
            Captured key
          </button>
          <button type="button" className="ctl" aria-pressed={key === RFC_KEY} onClick={() => setKey(RFC_KEY)}>
            RFC 6455 example
          </button>
          <button type="button" className="ctl go" onClick={newKey}>
            New random key
          </button>
        </div>
        <label className="ctls" style={{ flex: "1 1 260px" }}>
          <span className="lbl">Key</span>
          <input className="inp" style={{ flex: 1 }} value={key} spellCheck={false} maxLength={40} onChange={(e) => setKey(e.target.value.trim())} aria-label="Sec-WebSocket-Key" />
        </label>
      </div>
      <div className="calc" aria-live="polite">
        <div className="st">
          <span className="i">01</span>
          <span className="nm">Sec-WebSocket-Key</span>
          <span className="v">
            {key} <span className="g">· {valid ? "16 random bytes, base64" : "not 16 bytes"}</span>
          </span>
        </div>
        <div className={`st${step < 1 ? " dim" : ""}`}>
          <span className="i">02</span>
          <span className="nm">Append the GUID</span>
          <span className="v">
            {key}
            <span className="g">{GUID}</span>
          </span>
        </div>
        <div className={`st${step < 2 ? " dim" : ""}`}>
          <span className="i">03</span>
          <span className="nm">SHA-1 · 20 bytes</span>
          <span className="v">{sha ? Array.from(sha, (b) => b.toString(16).padStart(2, "0")).join(" ") : "…"}</span>
        </div>
        <div className={`st k${step < 3 ? " dim" : ""}`}>
          <span className="i">04</span>
          <span className="nm">Base64 · Accept</span>
          <span className="v">{accept}</span>
        </div>
        <div className={`st${step < 4 ? " dim" : ""}`}>
          <span className="i">05</span>
          <span className="nm">Check</span>
          <span className="v">{verdict}</span>
        </div>
      </div>
    </div>
  );
}
