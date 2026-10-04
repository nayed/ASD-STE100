import { useEffect, useRef, useState, type ReactNode } from "react";

const OLIVE = "#6E6E58";
const GREEN = "#0E7A3C";
const INK = "#191914";

/* ------------------------------------------------------------------ */
/* Fig. 1 — one sample travels through the decision tree               */
/* ------------------------------------------------------------------ */

const SAMPLES = [
  { w: "180 g", d: "90 mm", c: "—", r: "GRAPEFRUIT", els: ["eRR", "nRoot", "nR", "eRG", "lG"], chips: ["cRR", "cRG"] },
  { w: "120 g", d: "70 mm", c: "—", r: "ORANGE", els: ["eRR", "nRoot", "nR", "eRO", "lO"], chips: ["cRR", "cRO"] },
  { w: "110 g", d: "—", c: "YELLOW", r: "LEMON", els: ["eRL", "nRoot", "nL", "eLL", "lL"], chips: ["cRL", "cLL"] },
  { w: "95 g", d: "—", c: "RED", r: "APPLE", els: ["eRL", "nRoot", "nL", "eLA", "lA"], chips: ["cRL", "cLA"] },
];

const EDGES: [string, string][] = [
  ["eRL", "M395,60 V90 H210 V110"],
  ["eRR", "M395,60 V90 H565 V110"],
  ["eLA", "M210,150 V185 H95 V235"],
  ["eLL", "M210,150 V185 H265 V235"],
  ["eRO", "M565,150 V185 H515 V235"],
  ["eRG", "M565,150 V185 H685 V235"],
];

const CHIPS: [string, number, number, string][] = [
  ["cRL", 291, 82, "N"],
  ["cRR", 469, 82, "Y"],
  ["cLA", 141, 177, "N"],
  ["cLL", 226, 177, "Y"],
  ["cRO", 529, 177, "N"],
  ["cRG", 614, 177, "Y"],
];

const NODES: [string, number, number, number, string, number][] = [
  ["nRoot", 305, 20, 180, "WEIGHT > 150 g ?", 12],
  ["nL", 118, 110, 184, "COLOR = YELLOW ?", 11.5],
  ["nR", 468, 110, 194, "DIAMETER > 80 mm ?", 11.5],
];

const LEAVES: [string, number, string][] = [
  ["lA", 35, "APPLE"],
  ["lL", 205, "LEMON"],
  ["lO", 455, "ORANGE"],
  ["lG", 625, "GRAPEFRUIT"],
];

export function Fig1() {
  const [i, setI] = useState(0);
  const s = SAMPLES[i];
  const on = (id: string) => s.els.includes(id);
  const na = (v: string) => (v === "—" ? "na" : undefined);

  return (
    <div className="fig1row">
      <svg id="fig1" viewBox="0 0 760 285" role="img" aria-label="Decision tree diagram with an active sample path">
        {EDGES.map(([id, d]) => (
          <path key={id} className={`e ${on(id) ? "on" : "off"}`} d={d} />
        ))}
        {CHIPS.map(([id, x, y, t]) => (
          <g key={id} className={`chip ${s.chips.includes(id) ? "on" : ""}`}>
            <rect x={x} y={y} width="22" height="16" />
            <text x={x + 11} y={y + 11.5} fontSize="10" textAnchor="middle">
              {t}
            </text>
          </g>
        ))}
        {NODES.map(([id, x, y, w, t, fs]) => (
          <g key={id} className={`nd ${on(id) ? "on" : ""}`}>
            <rect x={x} y={y} width={w} height="40" strokeWidth={id === "nRoot" ? 2 : undefined} />
            <text x={x + w / 2} y={y + 24} fontSize={fs} fontWeight="600" textAnchor="middle">
              {t}
            </text>
          </g>
        ))}
        {/* leaves have a double border */}
        {LEAVES.map(([id, x, t]) => (
          <g key={id} className={`nd ${on(id) ? "on win" : ""}`}>
            <rect x={x} y="235" width="120" height="34" />
            <rect x={x + 4} y="239" width="112" height="26" />
            <text x={x + 60} y="256" fontSize="11.5" fontWeight="600" textAnchor="middle">
              {t}
            </text>
          </g>
        ))}
      </svg>
      <div className="spanel">
        <div className="sh">SAMPLE FRUIT · INPUT</div>
        <div className="srow">
          <span>WEIGHT</span>
          <b className={na(s.w)}>{s.w}</b>
        </div>
        <div className="srow">
          <span>DIAMETER</span>
          <b className={na(s.d)}>{s.d}</b>
        </div>
        <div className="srow">
          <span>COLOR</span>
          <b className={na(s.c)}>{s.c}</b>
        </div>
        <div className="sres">RESULT: {s.r}</div>
        <button type="button" className="btn" onClick={() => setI((i + 1) % SAMPLES.length)}>
          NEW SAMPLE →
        </button>
        <div className="sc">
          SAMPLE {i + 1} OF {SAMPLES.length}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fig. 2 — curves draw themselves when the figure scrolls into view   */
/* ------------------------------------------------------------------ */

export function RevealSvg({
  id,
  viewBox,
  label,
  children,
}: {
  id: string;
  viewBox: string;
  label: string;
  children: ReactNode;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const lines = svg.querySelectorAll<SVGGeometryElement>(".draw");
    lines.forEach((p) => {
      const L = p.getTotalLength();
      p.style.strokeDasharray = String(L);
      p.style.strokeDashoffset = String(L);
    });
    const io = new IntersectionObserver(
      (es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        setVis(true);
        lines.forEach((p) => (p.style.strokeDashoffset = "0"));
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(svg);
    return () => io.disconnect();
  }, []);

  return (
    <svg ref={ref} id={id} viewBox={viewBox} role="img" aria-label={label} className={vis ? "vis" : undefined}>
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Fig. 3 — how often each example lands in each bootstrap sample      */
/* ------------------------------------------------------------------ */

const BAGS = [
  [1, 2, 1, 0, 1, 1, 2, 0, 1, 1, 0, 2],
  [0, 1, 0, 2, 1, 0, 1, 2, 0, 1, 2, 2],
  [2, 0, 1, 1, 0, 2, 0, 1, 2, 0, 1, 2],
];
const BAG_ROWS = [120, 168, 216];

export function Fig3Bars() {
  return (
    <g>
      {BAGS[0].map((_, i) => {
        const x = 130 + i * 48;
        return (
          <g key={`d${i}`}>
            <rect x={x} y={28} width={40} height={30} fill="none" stroke={INK} strokeWidth={1.3} />
            <text x={x + 20} y={47} fontSize={8.5} fill={OLIVE} textAnchor="middle">
              {String(i + 1).padStart(2, "0")}
            </text>
          </g>
        );
      })}
      {BAGS.map((row, r) => {
        const y = BAG_ROWS[r];
        return (
          <g key={`b${r}`}>
            {row.map((c, i) => {
              const x = 130 + i * 48;
              return (
                <g key={i}>
                  <rect x={x} y={y} width={40} height={30} fill="none" stroke={OLIVE} strokeWidth={1.2} />
                  {Array.from({ length: c }, (_, k) => (
                    <rect key={k} x={x + 7} y={y + 24 - k * 9} width={26} height={7.5} fill={k === 0 ? OLIVE : GREEN} />
                  ))}
                </g>
              );
            })}
            <text x={706} y={y + 19} fontSize={10} fill={OLIVE}>
              Σ = 12
            </text>
          </g>
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Fig. 4 — the random subset of features at one node                  */
/* ------------------------------------------------------------------ */

const PICKED = [2, 5, 7];

export function Fig4Chips() {
  return (
    <g>
      {Array.from({ length: 8 }, (_, k) => {
        const i = k + 1;
        const y = 20 + k * 28;
        const sel = PICKED.includes(i);
        return (
          <g key={i}>
            <rect x={250} y={y} width={150} height={22} fill="none" stroke={sel ? GREEN : "#B7B7A2"} strokeWidth={sel ? 1.6 : 1.2} />
            <text x={262} y={y + 15} fontSize={11} fill={sel ? GREEN : OLIVE} fontWeight={sel ? 700 : 400}>
              X{i}
            </text>
            {sel && (
              <text x={388} y={y + 14.5} fontSize={8} fill={GREEN} textAnchor="end" letterSpacing=".1em" fontWeight={700}>
                SELECTED
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Contents, with the current section marked                           */
/* ------------------------------------------------------------------ */

const TOC: [string, string, string][] = [
  ["s1", "1.0", "SCOPE"],
  ["s2", "2.0", "DEFINITIONS"],
  ["s3", "3.0", "DECISION TREE"],
  ["s4", "4.0", "ONE-TREE PROBLEM"],
  ["s5", "5.0", "FOREST PROCEDURE"],
  ["s6", "6.0", "THE VOTE"],
  ["s7", "7.0", "OOB SCORE"],
  ["s8", "8.0", "ADVANTAGES · LIMITS"],
  ["s9", "9.0", "INTERACTIVE EXAMPLE"],
  ["s10", "10.0", "SUMMARY"],
];

export function Toc() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const spy = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-12% 0px -72% 0px" },
    );
    document.querySelectorAll(".rf main section[id]").forEach((s) => spy.observe(s));
    return () => spy.disconnect();
  }, []);

  return (
    <nav className="toc">
      {TOC.map(([id, n, t]) => (
        <a key={id} href={`#${id}`} className={active === id ? "act" : undefined}>
          <span className="n">{n}</span>
          {t}
        </a>
      ))}
    </nav>
  );
}
