import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { oobScores, predict, PRESETS, trainForest, type Point, type Preset, type Tree } from "./forest";

const OLIVE = "#6E6E58";
const GREEN = "#0E7A3C";
const PLOT = { x: 18, y: 14, w: 690, h: 492 };
const MPLOT = { x: 8, y: 8, w: 160, h: 116 };
const MAX_POINTS = 420;
const MINIS = 5;

function frame(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = OLIVE;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(PLOT.x, PLOT.y, PLOT.w, PLOT.h);
  ctx.fillStyle = OLIVE;
  ctx.font = '10px "IBM Plex Mono",monospace';
  ctx.fillText("X2", PLOT.x + 8, PLOT.y + 16);
  ctx.fillText("X1", PLOT.x + PLOT.w - 24, PLOT.y + PLOT.h + 22);
}

/** the vote map of the whole forest, its 50 % contour, and the points */
function renderMain(cv: HTMLCanvasElement, pts: Point[], trees: Tree[]) {
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(cv.width / 720, 0, 0, cv.height / 540, 0, 0);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, 720, 540);
  if (!trees.length) {
    frame(ctx);
    return;
  }
  const NX = 96;
  const NY = 72;
  const cw = PLOT.w / NX;
  const ch = PLOT.h / NY;
  const votes = new Float32Array(NX * NY);
  for (let gy = 0; gy < NY; gy++) {
    for (let gx = 0; gx < NX; gx++) {
      const dx = (gx + 0.5) / NX;
      const dy = (gy + 0.5) / NY;
      let s = 0;
      for (const t of trees) s += predict(t.root, dx, dy) >= 0.5 ? 1 : 0;
      const v = s / trees.length;
      votes[gy * NX + gx] = v;
      ctx.fillStyle =
        v >= 0.5
          ? "rgba(14,122,60," + (0.04 + (v - 0.5) * 2 * 0.32).toFixed(3) + ")"
          : "rgba(32,32,24," + (0.05 + (0.5 - v) * 2 * 0.22).toFixed(3) + ")";
      ctx.fillRect(PLOT.x + gx * cw, PLOT.y + gy * ch, cw + 0.6, ch + 0.6);
    }
  }
  ctx.strokeStyle = "rgba(24,24,16,.8)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  for (let gy = 0; gy < NY - 1; gy++) {
    for (let gx = 0; gx < NX - 1; gx++) {
      const v = votes[gy * NX + gx];
      const vr = votes[gy * NX + gx + 1];
      const vd = votes[(gy + 1) * NX + gx];
      const X0 = PLOT.x + gx * cw;
      const Y0 = PLOT.y + gy * ch;
      if ((v - 0.5) * (vr - 0.5) < 0) {
        ctx.moveTo(X0 + cw, Y0);
        ctx.lineTo(X0 + cw, Y0 + ch);
      }
      if ((v - 0.5) * (vd - 0.5) < 0) {
        ctx.moveTo(X0, Y0 + ch);
        ctx.lineTo(X0 + cw, Y0 + ch);
      }
    }
  }
  ctx.stroke();
  frame(ctx);
  for (const p of pts) {
    ctx.beginPath();
    ctx.arc(PLOT.x + p.x * PLOT.w, PLOT.y + p.y * PLOT.h, 4.6, 0, 7);
    ctx.fillStyle = p.l === 0 ? GREEN : "#1D1D16";
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();
  }
}

/** the map of one tree alone */
function renderMini(c: HTMLCanvasElement, pts: Point[], tree: Tree | undefined) {
  const g = c.getContext("2d");
  if (!g) return;
  g.setTransform(c.width / 176, 0, 0, c.height / 132, 0, 0);
  g.fillStyle = "#FFFFFF";
  g.fillRect(0, 0, 176, 132);
  if (!tree) {
    g.strokeStyle = OLIVE;
    g.lineWidth = 1;
    g.setLineDash([3, 3]);
    g.strokeRect(MPLOT.x, MPLOT.y, MPLOT.w, MPLOT.h);
    g.setLineDash([]);
    g.fillStyle = OLIVE;
    g.font = '9px "IBM Plex Mono",monospace';
    g.textAlign = "center";
    g.fillText("NOT GROWN", 88, 70);
    g.textAlign = "left";
    return;
  }
  const NX = 44;
  const NY = 33;
  const cw = MPLOT.w / NX;
  const ch = MPLOT.h / NY;
  const votes = new Uint8Array(NX * NY);
  for (let gy = 0; gy < NY; gy++) {
    for (let gx = 0; gx < NX; gx++) {
      const v = predict(tree.root, (gx + 0.5) / NX, (gy + 0.5) / NY) >= 0.5 ? 1 : 0;
      votes[gy * NX + gx] = v;
      g.fillStyle = v ? "rgba(14,122,60,.30)" : "rgba(32,32,24,.22)";
      g.fillRect(MPLOT.x + gx * cw, MPLOT.y + gy * ch, cw + 0.5, ch + 0.5);
    }
  }
  g.strokeStyle = "rgba(24,24,16,.8)";
  g.lineWidth = 1;
  g.beginPath();
  for (let gy = 0; gy < NY - 1; gy++) {
    for (let gx = 0; gx < NX - 1; gx++) {
      const v = votes[gy * NX + gx];
      const X0 = MPLOT.x + gx * cw;
      const Y0 = MPLOT.y + gy * ch;
      if (v !== votes[gy * NX + gx + 1]) {
        g.moveTo(X0 + cw, Y0);
        g.lineTo(X0 + cw, Y0 + ch);
      }
      if (v !== votes[(gy + 1) * NX + gx]) {
        g.moveTo(X0, Y0 + ch);
        g.lineTo(X0 + cw, Y0 + ch);
      }
    }
  }
  g.stroke();
  g.strokeStyle = OLIVE;
  g.lineWidth = 1;
  g.strokeRect(MPLOT.x, MPLOT.y, MPLOT.w, MPLOT.h);
  for (const p of pts) {
    g.beginPath();
    g.arc(MPLOT.x + p.x * MPLOT.w, MPLOT.y + p.y * MPLOT.h, 2.2, 0, 7);
    g.fillStyle = p.l === 0 ? GREEN : "#1D1D16";
    g.fill();
    g.lineWidth = 0.8;
    g.strokeStyle = "#FFFFFF";
    g.stroke();
  }
}

function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { v: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={o.v} type="button" className={o.v === value ? "on" : ""} onClick={() => onChange(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Playground() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const miniRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const pts = useRef<Point[]>([]);
  const trees = useRef<Tree[]>([]);
  const settings = useRef({ trees: 25, depth: 5 });
  const timer = useRef<number | undefined>(undefined);

  const [preset, setPreset] = useState<Preset>("blobs");
  const [addClass, setAddClass] = useState<"0" | "1">("0");
  const [nTrees, setNTrees] = useState(25);
  const [depth, setDepth] = useState(5);
  const [reads, setReads] = useState<{ pts: number; mean: string; forest: string; tick: number }>({
    pts: 0,
    mean: "—",
    forest: "—",
    tick: 0,
  });

  const renderAll = useCallback(() => {
    if (cvRef.current) renderMain(cvRef.current, pts.current, trees.current);
    miniRefs.current.forEach((c, i) => c && renderMini(c, pts.current, trees.current[i]));
  }, []);

  const train = useCallback(() => {
    trees.current = trainForest(pts.current, settings.current.trees, settings.current.depth);
    renderAll();
    const s = oobScores(pts.current, trees.current);
    setReads((r) => ({
      pts: pts.current.length,
      mean: s.mean === null ? "—" : s.mean.toFixed(3),
      forest: s.forest === null ? "—" : s.forest.toFixed(3),
      tick: r.tick + 1,
    }));
  }, [renderAll]);

  const defer = useCallback(
    (ms: number) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(train, ms);
    },
    [train],
  );

  /* canvas pixels follow the displayed size and the device pixel ratio */
  const fit = useCallback(() => {
    const dpr = window.devicePixelRatio || 1;
    const cv = cvRef.current;
    if (cv) {
      const w = cv.clientWidth || 600;
      cv.width = w * dpr;
      cv.height = w * 0.75 * dpr;
      cv.style.height = w * 0.75 + "px";
    }
    for (const c of miniRefs.current) {
      if (!c) continue;
      const mw = c.clientWidth || 100;
      c.width = mw * dpr;
      c.height = mw * 0.75 * dpr;
      c.style.height = mw * 0.75 + "px";
    }
    renderAll();
  }, [renderAll]);

  useEffect(() => {
    pts.current = PRESETS.blobs();
    fit();
    train();
    let rt: number | undefined;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(fit, 120);
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(renderAll);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(rt);
      window.clearTimeout(timer.current);
    };
  }, [fit, train, renderAll]);

  const onPlotClick = (e: MouseEvent<HTMLCanvasElement>) => {
    if (pts.current.length >= MAX_POINTS) return;
    const r = e.currentTarget.getBoundingClientRect();
    const lx = e.nativeEvent.offsetX * (720 / r.width);
    const ly = e.nativeEvent.offsetY * (540 / r.height);
    if (lx < PLOT.x || lx > PLOT.x + PLOT.w || ly < PLOT.y || ly > PLOT.y + PLOT.h) return;
    pts.current.push({ x: (lx - PLOT.x) / PLOT.w, y: (ly - PLOT.y) / PLOT.h, l: addClass === "0" ? 0 : 1 });
    defer(140);
  };

  return (
    <div className="play">
      <div className="plot">
        <canvas id="cv" ref={cvRef} onClick={onPlotClick} />
        <div className="plegend">
          <span>
            <i className="dA" />
            CLASS A
          </span>
          <span>
            <i className="dB" />
            CLASS B
          </span>
        </div>
        <div className="phint">CLICK PLOT TO ADD POINTS</div>
        <div className="strip">
          <div className="strip-title">INDIVIDUAL TREES — THE FIRST FIVE MEMBERS OF THE FOREST</div>
          {Array.from({ length: MINIS }, (_, i) => (
            <div key={i} className="cell">
              <canvas
                className="mini"
                ref={(el) => {
                  miniRefs.current[i] = el;
                }}
              />
              <span>T{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ctl">
        <div className="grp">
          <div className="t">DATA SHAPE</div>
          <Seg
            options={[
              { v: "blobs", label: "BLOBS" },
              { v: "moons", label: "MOONS" },
              { v: "ring", label: "RING" },
            ]}
            value={preset}
            onChange={(v) => {
              setPreset(v);
              pts.current = PRESETS[v]();
              train();
            }}
          />
        </div>
        <div className="grp">
          <div className="t">CLICK ADDS CLASS</div>
          <Seg
            options={[
              { v: "0", label: "CLASS A" },
              { v: "1", label: "CLASS B" },
            ]}
            value={addClass}
            onChange={setAddClass}
          />
        </div>
        <div className="grp">
          <div className="t">
            <span>TREES IN FOREST (B)</span>
            <b className="vv">{nTrees}</b>
          </div>
          <input
            type="range"
            min={1}
            max={49}
            value={nTrees}
            aria-label="Trees in forest"
            onChange={(e) => {
              const v = +e.target.value;
              setNTrees(v);
              settings.current.trees = v;
              defer(70);
            }}
          />
        </div>
        <div className="grp">
          <div className="t">
            <span>MAX DEPTH (LEVELS)</span>
            <b className="vv">{depth}</b>
          </div>
          <input
            type="range"
            min={1}
            max={9}
            value={depth}
            aria-label="Maximum tree depth"
            onChange={(e) => {
              const v = +e.target.value;
              setDepth(v);
              settings.current.depth = v;
              defer(70);
            }}
          />
        </div>
        <div className="row2">
          <button type="button" className="btn" onClick={train}>
            RETRAIN
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              pts.current = PRESETS[preset]();
              train();
            }}
          >
            RESET DATA
          </button>
        </div>
        <div className="reads">
          <div>
            <span>POINTS</span>
            <b>{reads.pts || "—"}</b>
          </div>
          <div>
            <span>SPLIT RULE</span>
            <b>m = 1 / p = 2</b>
          </div>
          <div>
            <span>MEAN TREE OOB</span>
            {/* a new key replays the highlight animation on every update */}
            <b key={`m${reads.tick}`} className="upd">
              {reads.mean}
            </b>
          </div>
          <div className="hl">
            <span>FOREST OOB</span>
            <b key={`f${reads.tick}`} className="upd">
              {reads.forest}
            </b>
          </div>
        </div>
        <div className="cnote">
          OOB = OUT-OF-BAG ESTIMATE · SEE §7.0. EACH SPLIT TESTS ONE RANDOM FEATURE OF TWO. THE STRIP SHOWS THE MAPS OF THE
          FIRST FIVE TREES.
        </div>
      </div>
    </div>
  );
}
