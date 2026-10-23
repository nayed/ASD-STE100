import { useState } from "react";
import { useInView } from "../lib/useInView";

export const OLIVE = "#6E7259";
export const OLIVE_MID = "#8A8E75";
export const OLIVE_LIGHT = "#B4B8A2";
export const RULE = "#D9D9D0";
export const ORANGE = "#E2571F";
/** the same hue, darkened to pass 4.5:1 on the light page: small text in figures and captions */
export const ORANGE_TEXT = "#AD4216";
export const INK = "#0D0D0C";

const MONO = "'IBM Plex Mono', monospace";

function Frame({
  height,
  children,
  label,
}: {
  height: number;
  children: React.ReactNode;
  label: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="overflow-x-auto">
      <div className={`min-w-[700px] draw ${inView ? "is-in" : "is-hidden"}`}>
        <svg
          viewBox={`0 0 1000 ${height}`}
          className="w-full h-auto block"
          role="img"
          aria-label={label}
          fontFamily={MONO}
        >
          {children}
        </svg>
      </div>
    </div>
  );
}

function Corner({ x, y, flipX = false, flipY = false }: { x: number; y: number; flipX?: boolean; flipY?: boolean }) {
  const sx = flipX ? -1 : 1;
  const sy = flipY ? -1 : 1;
  return (
    <g stroke={OLIVE_LIGHT} strokeWidth={1} fill="none">
      <line x1={x} y1={y} x2={x + 14 * sx} y2={y} />
      <line x1={x} y1={y} x2={x} y2={y + 14 * sy} />
    </g>
  );
}

/* ─────────────────────────── FIG 01 — TOKENS ─────────────────────────── */
const F1_TOKENS = [
  { t: "The", id: "791" },
  { t: " model", id: "1646" },
  { t: " predicts", id: "40910" },
  { t: " the", id: "279" },
  { t: " next", id: "1828" },
  { t: " word", id: "1734" },
  { t: " .", id: "13" },
];

export function Fig01() {
  const targetIndex = 5;
  let x = 24;
  const boxes = F1_TOKENS.map((tok, i) => {
    const w = Math.max(72, tok.t.replace(/ /g, "␣").length * 11 + 30);
    const box = { ...tok, x, w, i };
    x += w + 12;
    return box;
  });
  const endX = x - 12;

  return (
    <Frame height={220} label="Figure 1: a sentence cut into tokens, each token with its numeric ID">
      <text x={24} y={26} fontSize={10} letterSpacing="0.18em" fill={OLIVE} fontWeight={600}>
        TOKENIZER OUTPUT — CHARACTERS IN, TOKENS OUT
      </text>
      <line x1={24} y1={36} x2={endX} y2={36} stroke={RULE} strokeWidth={1} />

      {boxes.map((b) => {
        const isTarget = b.i === targetIndex;
        return (
          <g key={b.i}>
            <rect
              className="d"
              x={b.x}
              y={54}
              width={b.w}
              height={48}
              fill={isTarget ? "#FBEDE6" : "none"}
              stroke={isTarget ? ORANGE : OLIVE}
              strokeWidth={isTarget ? 1.6 : 1.1}
            />
            <text
              x={b.x + b.w / 2}
              y={84}
              fontSize={14}
              textAnchor="middle"
              fill={isTarget ? ORANGE : INK}
              fontWeight={isTarget ? 600 : 400}
            >
              {b.t.replace(/ /g, "␣")}
            </text>
            <line
              className="d"
              x1={b.x + b.w / 2}
              y1={102}
              x2={b.x + b.w / 2}
              y2={126}
              stroke={isTarget ? ORANGE : OLIVE_LIGHT}
              strokeWidth={1}
            />
            <text
              x={b.x + b.w / 2}
              y={144}
              fontSize={10.5}
              textAnchor="middle"
              fill={isTarget ? ORANGE : OLIVE}
              letterSpacing="0.06em"
            >
              {b.id}
            </text>
          </g>
        );
      })}

      <g>
        <path
          className="d"
          d={`M24 168 L24 176 L${endX} 176 L${endX} 168`}
          fill="none"
          stroke={OLIVE}
          strokeWidth={1}
        />
        <text x={(24 + endX) / 2} y={196} fontSize={10} letterSpacing="0.18em" fill={OLIVE} textAnchor="middle" fontWeight={600}>
          CONTEXT — 7 TOKENS
        </text>
      </g>

      <g>
        <line x1={boxes[targetIndex].x + boxes[targetIndex].w / 2} y1={102} x2={boxes[targetIndex].x + boxes[targetIndex].w / 2} y2={126} stroke={ORANGE} strokeWidth={1} />
        <text x={boxes[targetIndex].x + boxes[targetIndex].w / 2} y={46} fontSize={10} fill={ORANGE_TEXT} textAnchor="middle" letterSpacing="0.14em" fontWeight={600}>
          TARGET
        </text>
      </g>
      <Corner x={10} y={10} />
    </Frame>
  );
}

/* ────────────────────── FIG 02 — EMBEDDING / VECTORS ────────────────────── */
const F2_VALUES = [
  0.42, -0.18, 0.76, 0.11, -0.53, 0.29, 0.64, -0.37, 0.08, 0.85, -0.22, 0.47,
  -0.61, 0.33, 0.19, -0.05, 0.71, -0.44, 0.26, 0.58, -0.12, 0.39, -0.68, 0.14,
  0.51, -0.29, 0.62, 0.07, -0.35, 0.44, 0.23, -0.16,
];

const F2_POINTS = [
  { x: 452, y: 236, l: "dog" },
  { x: 486, y: 252, l: "cat" },
  { x: 418, y: 258, l: "horse" },
  { x: 512, y: 228, l: "wolf" },
  { x: 545, y: 92, l: "bread" },
  { x: 578, y: 108, l: "cheese" },
  { x: 522, y: 118, l: "milk" },
  { x: 806, y: 128, l: "engine", hi: true },
  { x: 842, y: 152, l: "system" },
  { x: 762, y: 158, l: "motor" },
];

export function Fig02() {
  return (
    <Frame height={340} label="Figure 2: a token becomes a vector of numbers; similar words sit near each other">
      {/* left: vector strip */}
      <text x={24} y={26} fontSize={10} letterSpacing="0.18em" fill={OLIVE} fontWeight={600}>
        EMBEDDING — 32 OF 1,536 VALUES
      </text>
      <rect className="d" x={24} y={42} width={112} height={34} fill="none" stroke={OLIVE} strokeWidth={1.1} />
      <text x={80} y={64} fontSize={13} textAnchor="middle" fill={INK}>
        model
      </text>
      <text x={150} y={64} fontSize={10.5} fill={OLIVE} letterSpacing="0.08em">
        TOKEN ID 1646
      </text>

      <line x1={24} y1={104} x2={300} y2={104} stroke={RULE} strokeWidth={1} />
      {F2_VALUES.map((v, i) => {
        const bx = 24 + i * 8.7;
        const h = Math.abs(v) * 62;
        return (
          <rect
            key={i}
            className="d"
            x={bx}
            y={v >= 0 ? 104 - h : 104}
            width={5.4}
            height={Math.max(h, 1.2)}
            fill={v >= 0 ? OLIVE : OLIVE_LIGHT}
            stroke="none"
          />
        );
      })}
      <line x1={24} y1={104} x2={300} y2={104} stroke={OLIVE} strokeWidth={1} />
      <text x={24} y={182} fontSize={10} fill={OLIVE} letterSpacing="0.12em">
        +1.0
      </text>
      <text x={24} y={126} fontSize={10} fill={OLIVE} letterSpacing="0.12em">
        0.0
      </text>
      <text x={24} y={196} fontSize={10} fill={OLIVE_LIGHT} letterSpacing="0.12em">
        −1.0
      </text>

      <line x1={24} y1={222} x2={300} y2={222} stroke={RULE} strokeWidth={1} />
      <text x={24} y={246} fontSize={10} letterSpacing="0.18em" fill={OLIVE} fontWeight={600}>
        NEAREST VECTORS
      </text>
      {[
        ["engine", "0.18"],
        ["system", "0.22"],
        ["machine", "0.24"],
      ].map(([w, d], i) => (
        <g key={w}>
          <text x={24} y={272 + i * 22} fontSize={12} fill={INK}>
            {w}
          </text>
          <text x={276} y={272 + i * 22} fontSize={11} fill={OLIVE} textAnchor="end">
            {d}
          </text>
          <line x1={24} y1={280 + i * 22} x2={300} y2={280 + i * 22} stroke={RULE} strokeWidth={1} />
        </g>
      ))}

      {/* right: 2-D projection */}
      <text x={372} y={26} fontSize={10} letterSpacing="0.18em" fill={OLIVE} fontWeight={600}>
        PROJECTION OF 1,536 DIMENSIONS ONTO 2 AXES
      </text>
      <rect className="d" x={372} y={44} width={604} height={244} fill="none" stroke={OLIVE} strokeWidth={1.1} />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={`v${i}`} x1={372 + (i + 1) * 100.6} y1={44} x2={372 + (i + 1) * 100.6} y2={288} stroke={RULE} strokeWidth={1} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line key={`h${i}`} x1={372} y1={44 + (i + 1) * 48.8} x2={976} y2={44 + (i + 1) * 48.8} stroke={RULE} strokeWidth={1} />
      ))}

      {F2_POINTS.map((p, i) => (
        <g key={p.l}>
          {p.hi && (
            <>
              <line x1={372} y1={p.y} x2={p.x} y2={p.y} stroke={ORANGE} strokeWidth={1} strokeDasharray="3 3" />
              <line x1={p.x} y1={44} x2={p.x} y2={288} stroke={ORANGE} strokeWidth={1} strokeDasharray="3 3" />
            </>
          )}
          <circle
            className="d"
            cx={p.x}
            cy={p.y}
            r={p.hi ? 5.5 : 3.6}
            fill={p.hi ? ORANGE : "none"}
            stroke={p.hi ? ORANGE : OLIVE}
            strokeWidth={1.2}
            style={{ transitionDelay: `${i * 45}ms` }}
          />
          <text
            x={p.x + 10}
            y={p.y + 4}
            fontSize={11}
            fill={p.hi ? ORANGE : OLIVE}
            fontWeight={p.hi ? 600 : 400}
          >
            {p.l}
          </text>
        </g>
      ))}
      <text x={372} y={312} fontSize={10} fill={OLIVE} letterSpacing="0.12em">
        DIMENSION 1 →
      </text>
      <text x={976} y={312} fontSize={10} fill={OLIVE} letterSpacing="0.12em" textAnchor="end">
        ↑ DIMENSION 2
      </text>
    </Frame>
  );
}

/* ─────────────────────── FIG 03 — ATTENTION MATRIX ─────────────────────── */
const F3_TOKENS = ["The", "model", "reads", "the", "sentence", "again"];
const F3_MATRIX = [
  [0.42, 0.18, 0.12, 0.14, 0.08, 0.06],
  [0.16, 0.34, 0.14, 0.11, 0.15, 0.1],
  [0.1, 0.28, 0.22, 0.08, 0.18, 0.14],
  [0.22, 0.12, 0.1, 0.3, 0.16, 0.1],
  [0.08, 0.14, 0.2, 0.1, 0.36, 0.12],
  [0.12, 0.16, 0.24, 0.09, 0.15, 0.24],
];

export function Fig03() {
  const [row, setRow] = useState(1);
  const cell = 46;
  const ox = 300;
  const oy = 78;

  return (
    <Frame height={470} label="Figure 3: an attention matrix. Select a token to see the weights it gives to the other tokens">
      <text x={24} y={26} fontSize={10} letterSpacing="0.18em" fill={OLIVE} fontWeight={600}>
        ATTENTION WEIGHTS — ONE HEAD, ONE LAYER
      </text>
      <text x={24} y={46} fontSize={11} fill={INK}>
        Sentence: “The model reads the sentence again”
      </text>
      <line x1={24} y1={58} x2={976} y2={58} stroke={RULE} strokeWidth={1} />

      {/* column labels */}
      {F3_TOKENS.map((t, c) => (
        <text
          key={`c${t}`}
          x={ox + c * cell + cell / 2}
          y={oy - 12}
          fontSize={11}
          textAnchor="middle"
          fill={row === c ? ORANGE : OLIVE}
          fontWeight={row === c ? 600 : 400}
        >
          {t}
        </text>
      ))}
      <text x={ox - 96} y={oy - 12} fontSize={9.5} letterSpacing="0.16em" fill={OLIVE_LIGHT} fontWeight={600}>
        QUERY ↓ / KEY →
      </text>
      <text x={ox - 16} y={oy - 30} fontSize={9} letterSpacing="0.12em" fill={OLIVE_LIGHT} fontWeight={600} textAnchor="end">
        WEIGHT TO SELECTED
      </text>

      {/* cells */}
      {F3_MATRIX.map((r, ri) =>
        r.map((w, ci) => {
          const active = ri === row;
          return (
            <rect
              key={`${ri}-${ci}`}
              className="fade-cell"
              style={{ transitionDelay: `${(ri * 6 + ci) * 18}ms` }}
              x={ox + ci * cell}
              y={oy + ri * cell}
              width={cell}
              height={cell}
              fill={active ? ORANGE : OLIVE}
              fillOpacity={active ? 0.12 + w * 1.6 : 0.08 + w * 1.5}
              stroke={active ? ORANGE : RULE}
              strokeWidth={active ? 1.2 : 1}
            />
          );
        })
      )}

      {/* row weights + labels */}
      {F3_TOKENS.map((t, ri) => {
        const active = ri === row;
        return (
          <g
            key={`r${t}`}
            onClick={() => setRow(ri)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setRow(ri);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Select query token ${t}`}
            style={{ cursor: "pointer", outline: "none" }}
          >
            <rect x={ox - 210} y={oy + ri * cell} width={200} height={cell} fill="transparent" />
            <text
              x={ox - 118}
              y={oy + ri * cell + cell / 2 + 4}
              fontSize={12}
              textAnchor="middle"
              fill={active ? ORANGE : INK}
              fontWeight={active ? 600 : 400}
            >
              {t}
            </text>
            <text
              x={ox - 16}
              y={oy + ri * cell + cell / 2 + 4}
              fontSize={10.5}
              textAnchor="end"
              fill={active ? ORANGE : OLIVE}
            >
              {F3_MATRIX[ri][row].toFixed(2)}
            </text>
            {active && (
              <rect
                x={ox - 210}
                y={oy + ri * cell}
                width={200 + 6 * cell}
                height={cell}
                fill="none"
                stroke={ORANGE}
                strokeWidth={1.4}
              />
            )}
          </g>
        );
      })}

      {/* legend */}
      <text x={ox + 6 * cell + 34} y={oy + 6} fontSize={9.5} letterSpacing="0.16em" fill={OLIVE} fontWeight={600}>
        WEIGHT
      </text>
      {[0.08, 0.3, 0.55, 0.8, 1].map((w, i) => (
        <g key={w}>
          <rect x={ox + 6 * cell + 34} y={oy + 20 + i * 22} width={22} height={14} fill={OLIVE} fillOpacity={w} stroke={RULE} />
          <text x={ox + 6 * cell + 64} y={oy + 31 + i * 22} fontSize={9.5} fill={OLIVE}>
            {["0.0", "0.2", "0.4", "0.7", "1.0"][i]}
          </text>
        </g>
      ))}

      <line x1={24} y1={oy + 6 * cell + 34} x2={976} y2={oy + 6 * cell + 34} stroke={RULE} strokeWidth={1} />
      <text x={24} y={oy + 6 * cell + 58} fontSize={11.5} fill={INK}>
        Selected query: <tspan fontWeight={600} fill={ORANGE_TEXT}>{F3_TOKENS[row]}</tspan>. This token looks at the
        other five tokens in the context.
      </text>
      <text x={24} y={oy + 6 * cell + 80} fontSize={11.5} fill={OLIVE}>
        The value at the left of each row is the weight that the row gives to the selected token. High weight = the
        model uses that token.
      </text>
    </Frame>
  );
}

/* ─────────────────── FIG 04 — LOGITS → SOFTMAX → PROBABILITY ─────────────────── */
const F4_ROWS = [
  { tok: " next", logit: 8.42, p: 0.412 },
  { tok: " word", logit: 7.11, p: 0.112 },
  { tok: " token", logit: 6.84, p: 0.085 },
  { tok: " step", logit: 6.2, p: 0.045 },
  { tok: " line", logit: 5.97, p: 0.036 },
  { tok: " all other tokens", logit: 0, p: 0.31 },
];

export function Fig04() {
  const barX = 520;
  const barScale = 840;
  return (
    <Frame height={360} label="Figure 4: raw scores converted to probabilities by the softmax function">
      <text x={24} y={26} fontSize={10} letterSpacing="0.18em" fill={OLIVE} fontWeight={600}>
        RANK / TOKEN / LOGIT (RAW SCORE) / PROBABILITY
      </text>
      <line x1={24} y1={38} x2={976} y2={38} stroke={INK} strokeWidth={1} />

      {F4_ROWS.map((r, i) => {
        const y = 72 + i * 46;
        const isOther = i === F4_ROWS.length - 1;
        return (
          <g key={r.tok}>
            <text x={24} y={y} fontSize={11} fill={OLIVE}>
              {String(i + 1).padStart(2, "0")}
            </text>
            <text x={60} y={y} fontSize={13} fill={isOther ? OLIVE_MID : INK} fontStyle={isOther ? "italic" : "normal"}>
              {r.tok}
            </text>
            <text x={266} y={y} fontSize={12} fill={OLIVE} textAnchor="end">
              {isOther ? "—" : r.logit.toFixed(2)}
            </text>
            <text x={352} y={y} fontSize={12} fill={isOther ? OLIVE_MID : ORANGE} textAnchor="end" fontWeight={i === 0 ? 600 : 400}>
              {r.p.toFixed(3)}
            </text>
            <rect
              className="d"
              x={barX}
              y={y - 13}
              width={Math.max(r.p * barScale, 2)}
              height={18}
              fill={i === 0 ? ORANGE : isOther ? OLIVE_LIGHT : OLIVE}
              stroke="none"
              style={{ transitionDelay: `${i * 60}ms` }}
            />
            <line x1={24} y1={y + 18} x2={976} y2={y + 18} stroke={RULE} strokeWidth={1} />
          </g>
        );
      })}

      <text x={barX} y={72 - 30} fontSize={9.5} letterSpacing="0.16em" fill={OLIVE} fontWeight={600}>
        PROBABILITY AFTER SOFTMAX
      </text>
      <line x1={barX} y1={46} x2={barX} y2={72 + 5 * 46} stroke={OLIVE} strokeWidth={1} />
      {[0.25, 0.5].map((v) => (
        <g key={v}>
          <line x1={barX + v * barScale} y1={46} x2={barX + v * barScale} y2={72 + 5 * 46} stroke={RULE} strokeWidth={1} strokeDasharray="2 4" />
          <text x={barX + v * barScale} y={72 + 5 * 46 + 16} fontSize={9.5} fill={OLIVE} textAnchor="middle">
            {v.toFixed(2)}
          </text>
        </g>
      ))}

      <text x={24} y={330} fontSize={11} fill={INK}>
        Softmax: p = e^score ÷ Σ e^score. The six probabilities above sum to 1.000.
      </text>
    </Frame>
  );
}

/* ─────────────────────────── FIG 06 — THE LOOP ─────────────────────────── */
function Box({
  x,
  y,
  w = 150,
  h = 52,
  n,
  label,
  accent = false,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  n: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <g>
      <rect
        className="d"
        x={x}
        y={y}
        width={w}
        height={h}
        fill="none"
        stroke={accent ? ORANGE : OLIVE}
        strokeWidth={accent ? 1.5 : 1.2}
      />
      <text x={x + 10} y={y + 18} fontSize={9} letterSpacing="0.16em" fill={accent ? ORANGE : OLIVE_MID} fontWeight={600}>
        {n}
      </text>
      <text x={x + 10} y={y + 38} fontSize={12.5} fill={INK} fontWeight={500}>
        {label}
      </text>
    </g>
  );
}

export function Fig06() {
  return (
    <Frame height={350} label="Figure 6: the generation loop. The output token returns to the input of the model">
      <text x={24} y={26} fontSize={10} letterSpacing="0.18em" fill={OLIVE} fontWeight={600}>
        ONE PASS OF THE AUTOREGRESSIVE LOOP
      </text>
      <line x1={24} y1={38} x2={976} y2={38} stroke={RULE} strokeWidth={1} />

      <defs>
        <marker id="arw" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
          <path d="M0 0 L9 4.5 L0 9 z" fill={OLIVE} />
        </marker>
        <marker id="arwO" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
          <path d="M0 0 L9 4.5 L0 9 z" fill={ORANGE} />
        </marker>
      </defs>

      <Box x={24} y={70} n="STEP 1" label="INPUT TEXT" />
      <Box x={214} y={70} n="STEP 2" label="TOKENIZER" />
      <Box x={404} y={70} n="STEP 3" label="MODEL" accent />
      <Box x={594} y={70} n="STEP 4" label="SCORES" />
      <Box x={784} y={70} n="STEP 5" label="SAMPLE" />
      <Box x={784} y={190} n="STEP 6" label="APPEND TOKEN" />

      {[
        [174, 214],
        [364, 404],
        [554, 594],
        [744, 784],
      ].map(([a, b]) => (
        <line key={a} className="d" x1={a + 12} y1={96} x2={b - 4} y2={96} stroke={OLIVE} strokeWidth={1.2} markerEnd="url(#arw)" />
      ))}

      <line className="d" x1={859} y1={122} x2={859} y2={184} stroke={OLIVE} strokeWidth={1.2} markerEnd="url(#arw)" />

      {/* diamond */}
      <polygon className="d" points="700,216 600,174 500,216 600,258" fill="none" stroke={OLIVE} strokeWidth={1.2} />
      <text x={600} y={212} fontSize={11.5} textAnchor="middle" fill={INK} fontWeight={500}>
        END TOKEN?
      </text>
      <text x={600} y={230} fontSize={9.5} textAnchor="middle" fill={OLIVE_MID} letterSpacing="0.12em">
        OR MAX LENGTH
      </text>

      <line className="d" x1={778} y1={216} x2={706} y2={216} stroke={OLIVE} strokeWidth={1.2} markerEnd="url(#arw)" />

      {/* no → back to model */}
      <path
        className="d"
        d="M600 174 L600 148 L479 148 L479 128"
        fill="none"
        stroke={ORANGE}
        strokeWidth={1.6}
        markerEnd="url(#arwO)"
      />
      <text x={614} y={164} fontSize={10} fill={ORANGE_TEXT} letterSpacing="0.14em" fontWeight={600}>
        NO — REPEAT
      </text>
      <path className="d" d="M479 216 L479 240 L120 240 L120 128" fill="none" stroke={OLIVE_LIGHT} strokeWidth={1} strokeDasharray="4 4" markerEnd="url(#arw)" />
      <text x={132} y={232} fontSize={9.5} fill={OLIVE_LIGHT} letterSpacing="0.12em">
        NEW CONTEXT = OLD CONTEXT + NEW TOKEN
      </text>

      {/* yes */}
      <line className="d" x1={600} y1={258} x2={600} y2={300} stroke={OLIVE} strokeWidth={1.2} markerEnd="url(#arw)" />
      <text x={614} y={286} fontSize={10} fill={OLIVE} letterSpacing="0.14em" fontWeight={600}>
        YES
      </text>
      <text x={600} y={326} fontSize={12.5} textAnchor="middle" fill={INK} fontWeight={600} letterSpacing="0.14em">
        OUTPUT TEXT
      </text>
    </Frame>
  );
}
