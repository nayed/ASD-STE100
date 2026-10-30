/** Figures 05–07 of WS-6455: the frame header bit by bit, masking, one message in four frames. */

import { useEffect, useMemo, useState } from "react";
import { useInView, Wide } from "./chrome";
import { SESSION } from "./data";
import { buildFrame, encode, fromHex, hex2, OPCODES, parseFrame, type Field, type FieldId, type Frame } from "./frame";
import { ACC, ACC_BG, Arrows, Hatch, INK, OLIVE, OLIVE_LT, PANEL, reduced, T } from "./svg";

const FRAMES = SESSION.filter((r) => r.kind === "frame").map((r) => ({ ...r, f: parseFrame(fromHex((r as { hex: string }).hex)) }));
/** the first frame of the session: the client sends "Hello", masked */
export const HELLO = FRAMES[0].f;

/* ------------------------------------------------------------------ */
/* FIG. 05 — the frame header, bit by bit                              */
/* ------------------------------------------------------------------ */

type Preset = { id: string; label: string; opcode: number; text: string };
const PRESETS: Preset[] = [
  { id: "hello", label: "Text “Hello”", opcode: 1, text: "Hello" },
  { id: "long", label: "200 × “x”", opcode: 1, text: "x".repeat(200) },
  { id: "ping", label: "Ping “tick”", opcode: 9, text: "tick" },
  { id: "close", label: "Close 1000", opcode: 8, text: "done" },
];

const FIELD_SAY: Record<FieldId, string> = {
  fin: "FIN is 1 on the last frame of a message. A message in one frame has FIN = 1.",
  rsv: "RSV1, RSV2 and RSV3 stay 0. An extension can use them. Compression sets RSV1, for example.",
  opcode: "The opcode gives the frame type: 0x1 text, 0x2 binary, 0x0 continuation, 0x8 close, 0x9 ping, 0xA pong.",
  mask: "MASK is 1 when a masking key follows. A client must mask each frame. A server must not mask.",
  len: "The 7-bit length holds a payload of 0 to 125 bytes. The value 126 adds a 16-bit length. The value 127 adds a 64-bit length.",
  ext: "The extended length holds the real payload length, in network byte order (most significant byte first).",
  key: "The masking key is 4 random bytes. The client makes a new key for each frame.",
  payload: "The payload holds the data of the frame. When MASK is 1, the sender applies XOR to each byte and one key byte.",
};

const CW = 21, X0 = 54, RH = 60, MAX_ROWS = 6;

function BitRuler({ f, sel, onSel }: { f: Frame; sel: FieldId; onSel: (id: FieldId) => void }) {
  const totalBits = f.bytes.length * 8;
  const rows = Math.min(MAX_ROWS, Math.ceil(totalBits / 32));
  const shownBits = rows * 32;
  const H = 36 + rows * RH + 18;
  const segs: { field: Field; row: number; col: number; len: number; first: boolean }[] = [];
  for (const field of f.fields) {
    let b = field.bit;
    const end = Math.min(field.bit + field.bits, shownBits);
    let first = true;
    while (b < end) {
      const row = Math.floor(b / 32), col = b % 32, len = Math.min(32 - col, end - b);
      segs.push({ field, row, col, len, first });
      first = false;
      b += len;
    }
  }
  const bit = (i: number) => (f.bytes[i >> 3] >> (7 - (i & 7))) & 1;
  const valueOf = (field: Field) => {
    if (field.id === "fin") return f.fin ? "last" : "more";
    if (field.id === "opcode") return OPCODES[f.opcode] ?? "?";
    if (field.id === "mask") return f.masked ? "on" : "off";
    if (field.id === "len") return f.len7 === 126 ? "126 → 16 bit" : f.len7 === 127 ? "127 → 64 bit" : `${f.len7} B`;
    if (field.id === "ext") return `${f.length} B`;
    return field.value;
  };
  return (
    <svg viewBox={`0 0 760 ${H}`} role="img" aria-label={`Frame header layout, ${f.bytes.length} bytes`}>
      <Hatch id="f5" />
      {/* the bit ruler, as in RFC 6455 section 5.2 */}
      {Array.from({ length: 32 }, (_, i) => (
        <g key={i}>
          {i % 10 === 0 && <T x={X0 + i * CW + 2} y={13} size={8.5} fill={OLIVE} weight={600}>{String(i / 10)}</T>}
          <T x={X0 + i * CW + CW / 2} y={27} size={8} anchor="middle" fill={OLIVE}>{String(i % 10)}</T>
        </g>
      ))}
      <T x={X0 - 8} y={27} size={8} anchor="end" fill={OLIVE}>BIT</T>
      {Array.from({ length: rows }, (_, r) => (
        <T key={r} x={X0 - 8} y={36 + r * RH + 34} size={8.5} anchor="end" fill={OLIVE}>{`+${r * 4}`}</T>
      ))}
      {segs.map((s, i) => {
        const x = X0 + s.col * CW, y = 36 + s.row * RH + 14, w = s.len * CW, h = 30;
        const on = s.field.id === sel;
        const isBits = s.field.bit < 16;
        const startByte = (s.row * 32 + s.col) / 8;
        return (
          <g key={i} onClick={() => onSel(s.field.id)} style={{ cursor: "pointer" }}>
            <rect x={x} y={y} width={w} height={h} fill={on ? ACC_BG : PANEL} stroke={on ? ACC : INK} strokeWidth={on ? 2 : 1.1} />
            {isBits
              ? Array.from({ length: s.len }, (_, k) => (
                  <g key={k}>
                    {k > 0 && <line x1={x + k * CW} y1={y + 20} x2={x + k * CW} y2={y + h} stroke={OLIVE_LT} />}
                    <T x={x + k * CW + CW / 2} y={y + 20} size={11} anchor="middle" weight={600} fill={on ? ACC : INK} halo={null}>
                      {String(bit(s.row * 32 + s.col + k))}
                    </T>
                  </g>
                ))
              : Array.from({ length: s.len / 8 }, (_, k) => {
                  const bi = startByte + k;
                  const ch = s.field.id === "payload" ? f.data[bi - f.headerLen] : undefined;
                  const printable = ch !== undefined && ch >= 32 && ch < 127;
                  return (
                    <g key={k}>
                      {k > 0 && <line x1={x + k * 8 * CW} y1={y} x2={x + k * 8 * CW} y2={y + h} stroke={OLIVE_LT} />}
                      <T x={x + k * 8 * CW + 4 * CW} y={y + 19} size={11} anchor="middle" weight={600} fill={on ? ACC : INK} halo={null}>
                        {hex2(f.bytes[bi])}
                      </T>
                      {s.field.id === "payload" && (
                        <T x={x + k * 8 * CW + 8 * CW - 6} y={y + 19} size={8.5} anchor="end" fill={OLIVE} halo={null}>
                          {f.masked ? `${hex2(ch!)}${printable ? " " + String.fromCharCode(ch!) : ""}` : printable ? String.fromCharCode(ch!) : ""}
                        </T>
                      )}
                    </g>
                  );
                })}
            {/* name above, value below */}
            {s.first && (
              <T x={isBits ? x + w / 2 : x + 3} y={y - 4} size={8} anchor={isBits ? "middle" : "start"} fill={on ? ACC : OLIVE} weight={on ? 700 : 400}>
                {isBits ? (s.field.id === "rsv" ? "RSV" : s.field.id === "len" ? "PAYLOAD LEN" : s.field.name) : s.field.name}
              </T>
            )}
            {s.first && isBits && (
              <T x={x + w / 2} y={y + h + 11} size={8} anchor="middle" fill={on ? ACC : OLIVE}>{valueOf(s.field)}</T>
            )}
            {s.first && !isBits && s.field.id !== "payload" && (
              <T x={x + w - 3} y={y - 4} size={8} anchor="end" fill={OLIVE}>{valueOf(s.field)}</T>
            )}
            {!s.first && s.field.id !== "payload" && (
              <T x={x + 3} y={y - 4} size={8} fill={on ? ACC : OLIVE}>{`${s.field.name}, CONTINUED`}</T>
            )}
          </g>
        );
      })}
      {totalBits > shownBits && (
        <g>
          <rect x={X0} y={36 + rows * RH + 2} width={32 * CW} height={10} fill="url(#f5-h)" stroke={OLIVE_LT} />
          <T x={X0 + 16 * CW} y={36 + rows * RH + 10} size={8.5} anchor="middle" fill={OLIVE}>{`${(totalBits - shownBits) / 8} more payload bytes not drawn`}</T>
        </g>
      )}
    </svg>
  );
}

export function FigFrameBuilder() {
  const [preset, setPreset] = useState<string>("hello");
  const [opcode, setOpcode] = useState(1);
  const [txt, setTxt] = useState("Hello");
  const [client, setClient] = useState(true);
  const [fin, setFin] = useState(true);
  const [key, setKey] = useState<Uint8Array>(HELLO.key!);
  const [sel, setSel] = useState<FieldId>("len");
  const payload = useMemo(() => {
    const t = encode(txt.slice(0, 300));
    return opcode === 8 ? new Uint8Array([0x03, 0xe8, ...t]) : t;
  }, [txt, opcode]);
  const f = useMemo(() => buildFrame({ fin, opcode, payload, key: client ? key : null }), [fin, opcode, payload, client, key]);
  const hex = Array.from(f.bytes, hex2).join("");
  const match = FRAMES.findIndex((r) => (r as { hex: string }).hex === hex);
  const ids = new Set(f.fields.map((x) => x.id));
  const pick = (p: Preset) => {
    setPreset(p.id);
    setOpcode(p.opcode);
    setTxt(p.text);
    setFin(true);
    setKey(p.id === "hello" ? HELLO.key! : crypto.getRandomValues(new Uint8Array(4)));
    if (p.id === "long") setSel("ext");
  };
  const curSel = ids.has(sel) ? sel : "len";
  return (
    <div>
      <div className="fig-row">
        <div className="ctls" role="group" aria-label="Preset">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" className="ctl" aria-pressed={preset === p.id} onClick={() => pick(p)}>
              {p.label}
            </button>
          ))}
        </div>
        <label className="ctls" style={{ flex: "1 1 220px" }}>
          <span className="lbl">{opcode === 8 ? "Reason" : "Payload"}</span>
          <input
            className="inp" style={{ flex: 1 }} value={txt} maxLength={300} spellCheck={false}
            onChange={(e) => {
              setTxt(e.target.value);
              setPreset("");
            }}
            aria-label="Payload text"
          />
        </label>
      </div>
      <div className="fig-row">
        <div className="ctls" role="group" aria-label="Sender">
          <span className="lbl">Sender</span>
          <button type="button" className="ctl" aria-pressed={client} onClick={() => setClient(true)}>
            Client · masked
          </button>
          <button type="button" className="ctl" aria-pressed={!client} onClick={() => setClient(false)}>
            Server
          </button>
          <button type="button" className="ctl" aria-pressed={!fin} onClick={() => setFin(!fin)} disabled={opcode >= 8}>
            FIN 0 · more follows
          </button>
          <button type="button" className="ctl" onClick={() => setKey(crypto.getRandomValues(new Uint8Array(4)))} disabled={!client}>
            New key
          </button>
        </div>
        <dl className="readout" aria-live="polite">
          <div>
            <dt>Header</dt>
            <dd>{f.headerLen} B</dd>
          </div>
          <div>
            <dt>Payload</dt>
            <dd>{f.length} B</dd>
          </div>
          <div>
            <dt>Frame</dt>
            <dd className="k">{f.bytes.length} B</dd>
          </div>
        </dl>
      </div>
      <Wide min={660}>
        <BitRuler f={f} sel={curSel} onSel={setSel} />
      </Wide>
      <div className="ctls" role="group" aria-label="Field" style={{ marginTop: 10 }}>
        <span className="lbl">Field</span>
        {f.fields.map((x) => (
          <button key={x.id} type="button" className="ctl" aria-pressed={curSel === x.id} onClick={() => setSel(x.id)}>
            {x.id === "ext" ? "Ext. length" : x.id === "rsv" ? "RSV" : x.id === "len" ? "Length" : x.id === "key" ? "Key" : x.name}
          </button>
        ))}
      </div>
      <p className="say" aria-live="polite">
        <b>{f.fields.find((x) => x.id === curSel)!.name}.</b>
        {` ${FIELD_SAY[curSel]} `}
        {match >= 0 ? (
          <>
            These {f.bytes.length} bytes are the same as record {String(match + 3).padStart(2, "0")} of the real session (Fig. 09).
          </>
        ) : (
          !client && opcode < 8 && f.length <= 125 && <>The server sends no key, so the header is 2 bytes.</>
        )}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 06 — masking: XOR with a 4-byte key                            */
/* ------------------------------------------------------------------ */

export function FigMasking() {
  const f = HELLO;
  const n = f.length;
  const inView = useInView();
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!inView || !auto || reduced()) return;
    const id = setInterval(() => setI((v) => (v + 1) % n), 1300);
    return () => clearInterval(id);
  }, [inView, auto, n]);
  const COLW = 86, CX = 214;
  const rows: [string, string, (k: number) => string, (k: number) => string][] = [
    ["PAYLOAD", "what the client sends", (k) => hex2(f.data[k]), (k) => `“${String.fromCharCode(f.data[k])}”`],
    ["KEY BYTE", "key[ i mod 4 ]", (k) => hex2(f.key![k % 4]), (k) => `key[${k % 4}]`],
    ["ON THE WIRE", "payload XOR key", (k) => hex2(f.wire[k]), () => ""],
  ];
  const bits = (v: number) => v.toString(2).padStart(8, "0").split("");
  const d = f.data[i], k = f.key![i % 4], w = f.wire[i];
  return (
    <div>
      <Wide min={660}>
        <svg viewBox="0 0 760 330" role="img" aria-label="Masking of the payload Hello with the captured key, byte by byte">
          <Arrows id="f6" />
          {/* the key */}
          <T x={0} y={14} size={9} fill={OLIVE} ls={0.16}>MASKING KEY · FROM THE CAPTURED FRAME</T>
          {Array.from(f.key!, (b, j) => (
            <g key={j}>
              <rect x={CX + j * COLW + 6} y={24} width={COLW - 12} height={26} fill={j === i % 4 ? ACC_BG : PANEL} stroke={j === i % 4 ? ACC : INK} strokeWidth={j === i % 4 ? 2 : 1.1} />
              <T x={CX + j * COLW + COLW / 2} y={42} size={12} anchor="middle" weight={700} halo={null} fill={j === i % 4 ? ACC : INK}>{hex2(b)}</T>
              <T x={CX + j * COLW + COLW / 2} y={64} size={8.5} anchor="middle" fill={OLIVE}>{`key[${j}]`}</T>
            </g>
          ))}
          {/* the three rows */}
          {rows.map(([name, sub, top, bottom], r) => (
            <g key={name}>
              <T x={0} y={104 + r * 54} size={9.5} weight={700} ls={0.12}>{name}</T>
              <T x={0} y={117 + r * 54} size={8.5} fill={OLIVE}>{sub}</T>
              {Array.from({ length: n }, (_, j) => {
                const on = j === i;
                return (
                  <g key={j} onClick={() => { setAuto(false); setI(j); }} style={{ cursor: "pointer" }}>
                    <rect x={CX + j * COLW + 6} y={90 + r * 54} width={COLW - 12} height={28} fill={on ? ACC_BG : PANEL} stroke={on ? ACC : INK} strokeWidth={on ? 2 : 1.1} />
                    <T x={CX + j * COLW + COLW / 2} y={109 + r * 54} size={12} anchor="middle" weight={700} halo={null} fill={on ? ACC : INK}>{top(j)}</T>
                    {bottom(j) && <T x={CX + j * COLW + COLW / 2} y={130 + r * 54} size={8.5} anchor="middle" fill={OLIVE}>{bottom(j)}</T>}
                  </g>
                );
              })}
            </g>
          ))}
          <T x={CX + 5 * COLW + 2} y={109} size={9} fill={OLIVE}>5 B</T>
          <T x={CX + 5 * COLW + 2} y={217} size={9} fill={OLIVE}>5 B, masked</T>
          {/* the bits of the byte in focus */}
          <line x1={0} y1={236} x2={760} y2={236} stroke={OLIVE_LT} />
          <T x={0} y={256} size={9} fill={OLIVE} ls={0.16}>{`BYTE ${i} · BIT BY BIT`}</T>
          {[
            ["payload", d],
            ["key", k],
            ["wire", w],
          ].map(([nm, v], r) => (
            <g key={nm as string}>
              <T x={CX - 10} y={258 + r * 22} size={9} anchor="end" fill={OLIVE}>{nm as string}</T>
              {bits(v as number).map((b, j) => {
                const flip = r === 2 && bits(k)[j] === "1";
                return (
                  <g key={j}>
                    <rect x={CX + j * 22} y={244 + r * 22} width={20} height={19} fill={flip ? ACC_BG : PANEL} stroke={flip ? ACC : OLIVE_LT} />
                    <T x={CX + j * 22 + 10} y={258 + r * 22} size={11} anchor="middle" weight={600} halo={null} fill={flip ? ACC : INK}>{b}</T>
                  </g>
                );
              })}
              <T x={CX + 8 * 22 + 10} y={258 + r * 22} size={10} weight={700}>{`0x${hex2(v as number)}`}</T>
            </g>
          ))}
          <T x={CX + 8 * 22 + 70} y={269} size={9} fill={OLIVE}>A key bit 1 flips the payload bit.</T>
          <T x={CX + 8 * 22 + 70} y={283} size={9} fill={OLIVE}>A key bit 0 keeps it.</T>
          <T x={CX + 8 * 22 + 70} y={297} size={9} fill={OLIVE}>XOR again with the key: the payload returns.</T>
        </svg>
      </Wide>
      <div className="fig-row end">
        <div className="ctls" role="group" aria-label="Byte">
          <span className="lbl">Byte</span>
          {Array.from({ length: n }, (_, j) => (
            <button key={j} type="button" className="ctl" aria-pressed={i === j} onClick={() => { setAuto(false); setI(j); }}>
              {j}
            </button>
          ))}
          <button type="button" className="ctl" onClick={() => setAuto(true)} disabled={auto}>
            Auto
          </button>
        </div>
        <dl className="readout">
          <div>
            <dt>Byte {i}</dt>
            <dd>
              0x{hex2(d)} XOR 0x{hex2(k)} = <span style={{ color: "var(--acc)" }}>0x{hex2(w)}</span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FIG. 07 — one message in four frames, and a ping between messages   */
/* ------------------------------------------------------------------ */

export function FigFragments() {
  const frags = FRAMES.filter((r) => r.dir === "s2c" && (r.f.opcode === 0 || (r.f.opcode === 1 && !r.f.fin)));
  const ping = FRAMES.find((r) => r.f.opcode === 9)!;
  const pong = FRAMES.find((r) => r.f.opcode === 10)!;
  const inView = useInView();
  const [k, setK] = useState(frags.length + 1);
  useEffect(() => {
    if (!inView || reduced()) {
      setK(frags.length + 1);
      return;
    }
    let s = 0;
    setK(0);
    const id = setInterval(() => {
      s = (s + 1) % (frags.length + 4); // three ticks of pause on the result
      setK(Math.min(s, frags.length + 1));
    }, 900);
    return () => clearInterval(id);
  }, [inView, frags.length]);

  const BW = 23; // px per byte
  let x = 20;
  const blocks = frags.map((r, i) => {
    const b = { r, x, w: r.f.bytes.length * BW, i };
    x += b.w + 22;
    return b;
  });
  const assembled = frags.slice(0, Math.min(k, frags.length)).map((r) => new TextDecoder().decode(r.f.data));
  const done = k > frags.length;
  const cell = (bx: number, y: number, v: number, head: boolean, on: boolean, key: string) => (
    <g key={key}>
      <rect x={bx} y={y} width={BW} height={24} fill={PANEL} stroke={on ? ACC : head ? INK : OLIVE_LT} strokeWidth={head ? 1.4 : 1} />
      <T x={bx + BW / 2} y={y + 16} size={10} anchor="middle" weight={head ? 700 : 400} fill={on && head ? ACC : INK} halo={null}>{hex2(v)}</T>
    </g>
  );
  return (
    <Wide min={680}>
      <svg viewBox="0 0 760 360" role="img" aria-label="The server sends the message Fragmented in four frames; the client joins them and delivers one message">
        <Arrows id="f7" />
        <T x={0} y={14} size={9} fill={OLIVE} ls={0.16}>SERVER → CLIENT · ON THE WIRE · REAL BYTES</T>
        {blocks.map(({ r, x: bx, w, i }) => {
          const on = r.f.fin && done;
          const vis = i < k ? 1 : 0.18;
          return (
            <g key={i} className="fade" opacity={vis}>
              <T x={bx} y={40} size={8.5} weight={700} fill={r.f.fin ? ACC : INK} ls={0.1}>{`FIN ${r.f.fin ? 1 : 0} · ${r.f.opcode === 0 ? "CONT 0x0" : "TEXT 0x1"}`}</T>
              {Array.from(r.f.bytes, (v, j) => cell(bx + j * BW, 48, v, j < 2, on, `${i}-${j}`))}
              <T x={bx + w / 2} y={90} size={9.5} anchor="middle" fill={OLIVE}>
                {r.f.length ? `“${new TextDecoder().decode(r.f.data)}”` : "empty"}
              </T>
              <T x={bx + w / 2} y={104} size={8.5} anchor="middle" fill={OLIVE}>{`${r.f.bytes.length} B`}</T>
            </g>
          );
        })}
        <line x1={20} y1={118} x2={x - 22} y2={118} stroke={OLIVE_LT} />
        <T x={x - 14} y={68} size={9} fill={OLIVE}>{`${blocks.reduce((a, b) => a + b.r.f.bytes.length, 0)} B in 4 frames`}</T>

        {/* the receive buffer */}
        <T x={0} y={150} size={9} fill={OLIVE} ls={0.16}>CLIENT · RECEIVE BUFFER</T>
        <rect x={20} y={160} width={330} height={34} fill={PANEL} stroke={INK} strokeWidth={1.2} />
        {(() => {
          let cx = 30;
          return assembled.map((s, i) => {
            const el = (
              <g key={i}>
                <T x={cx} y={182} size={13} weight={600} halo={null}>{s || "·"}</T>
                {i > 0 && <line x1={cx - 6} y1={166} x2={cx - 6} y2={188} stroke={OLIVE_LT} />}
              </g>
            );
            cx += (s.length || 1) * 8.2 + 12;
            return el;
          });
        })()}
        <line x1={350} y1={177} x2={420} y2={177} stroke={done ? ACC : OLIVE_LT} strokeWidth={done ? 2 : 1} markerEnd={`url(#f7-${done ? "k" : "a"})`} />
        <T x={385} y={170} size={8.5} anchor="middle" fill={OLIVE}>FIN 1</T>
        <g className="fade" opacity={done ? 1 : 0.18}>
          <rect x={428} y={160} width={316} height={34} fill={ACC_BG} stroke={ACC} strokeWidth={2} />
          <T x={440} y={182} size={11} weight={700} fill={ACC} halo={null}>onmessage · “Fragmented” · 10 B</T>
        </g>
        <T x={20} y={214} size={9} fill={OLIVE}>The client holds each fragment. It gives one message to the program after the frame with FIN 1.</T>

        {/* control frames */}
        <line x1={0} y1={236} x2={760} y2={236} stroke={OLIVE_LT} />
        <T x={0} y={258} size={9} fill={OLIVE} ls={0.16}>CONTROL FRAMES · THE SAME SESSION, EARLIER</T>
        {[ping, pong].map((r, i) => {
          const y = 270 + i * 44;
          const head = r.f.headerLen;
          return (
            <g key={i}>
              <T x={0} y={y + 16} size={9.5} weight={700}>{i === 0 ? "PING  S → C" : "PONG  C → S"}</T>
              {Array.from(r.f.bytes, (v, j) => (
                <g key={j}>
                  <rect x={120 + j * BW} y={y} width={BW} height={24} fill={PANEL} stroke={j < 2 ? INK : j < head ? OLIVE : OLIVE_LT} strokeWidth={j < 2 ? 1.4 : 1} strokeDasharray={j >= 2 && j < head ? "2 2" : undefined} />
                  <T x={120 + j * BW + BW / 2} y={y + 16} size={10} anchor="middle" weight={j < 2 ? 700 : 400} halo={null}>{hex2(v)}</T>
                </g>
              ))}
              <T x={120 + r.f.bytes.length * BW + 12} y={y + 16} size={9} fill={OLIVE}>
                {i === 0 ? "opcode 0x9 · payload “tick”" : `opcode 0xA · key ${Array.from(r.f.key!, hex2).join(" ")} · payload “tick”`}
              </T>
            </g>
          );
        })}
      </svg>
    </Wide>
  );
}

