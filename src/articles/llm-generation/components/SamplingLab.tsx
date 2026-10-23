import { useMemo, useState } from "react";

const ORANGE = "#E2571F";
const OLIVE_LIGHT = "#B4B8A2";
const OLIVE_MID = "#8A8E75";
const RULE = "#3A3A34";

type Cand = { tok: string; logit: number };

const CANDIDATES: Cand[] = [
  { tok: "word", logit: 8.42 },
  { tok: "token", logit: 7.11 },
  { tok: "step", logit: 6.84 },
  { tok: "line", logit: 6.2 },
  { tok: "number", logit: 5.97 },
  { tok: "move", logit: 5.61 },
  { tok: "thing", logit: 5.22 },
  { tok: "time", logit: 4.88 },
];

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  note,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  note: string;
}) {
  return (
    <div className="mb-7">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={label} className="u-label" style={{ color: OLIVE_LIGHT }}>
          {label}
        </label>
        <span className="text-[19px] font-semibold leading-none" style={{ color: ORANGE }}>
          {format(value)}
        </span>
      </div>
      <input
        id={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-2"
      />
      <p className="u-note mt-1" style={{ color: OLIVE_MID }}>
        {note}
      </p>
    </div>
  );
}

export default function SamplingLab() {
  const [temp, setTemp] = useState(0.8);
  const [topK, setTopK] = useState(5);
  const [topP, setTopP] = useState(0.9);
  const [seed, setSeed] = useState(41207);
  const [tally, setTally] = useState<number[] | null>(null);

  const rows = useMemo(() => {
    const scaled = CANDIDATES.map((c) => c.logit / temp);
    const maxS = Math.max(...scaled);
    const exps = scaled.map((s) => Math.exp(s - maxS));
    const sum = exps.reduce((a, b) => a + b, 0);
    const raw = exps.map((e) => e / sum);

    const order = raw.map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p);
    const keep = new Set<number>();
    order.slice(0, topK).forEach((o) => keep.add(o.i));
    let acc = 0;
    for (const o of order) {
      if (acc >= topP) break;
      keep.add(o.i);
      acc += o.p;
    }

    const keptSum = raw.reduce((a, p, i) => a + (keep.has(i) ? p : 0), 0);
    return CANDIDATES.map((c, i) => ({
      tok: c.tok,
      logit: c.logit,
      raw: raw[i],
      p: keep.has(i) ? raw[i] / keptSum : 0,
      kept: keep.has(i),
    })).sort((a, b) => b.logit - a.logit);
  }, [temp, topK, topP]);

  const keptCount = rows.filter((r) => r.kept).length;
  const top = rows.filter((r) => r.kept).sort((a, b) => b.p - a.p)[0];
  const entropy = rows.reduce((a, r) => (r.p > 0 ? a - r.p * Math.log2(r.p) : a), 0);

  function sample100() {
    const rng = mulberry32(seed);
    const counts = new Array(CANDIDATES.length).fill(0);
    const keptRows = rows.filter((r) => r.kept);
    for (let n = 0; n < 100; n++) {
      const u = rng();
      let acc = 0;
      for (const r of keptRows) {
        acc += r.p;
        if (u <= acc) {
          const idx = CANDIDATES.findIndex((c) => c.tok === r.tok);
          counts[idx] += 1;
          break;
        }
      }
    }
    setTally(counts);
    setSeed((s) => (s * 1103515245 + 12345) % 2147483647);
  }

  const maxTally = tally ? Math.max(...tally, 1) : 1;

  return (
    <div className="text-[#F2F2EC]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b pb-4" style={{ borderColor: RULE }}>
        <div>
          <div className="u-label" style={{ color: ORANGE }}>
            Fig. 05 — Sampling control unit · Sheet 6 of 8
          </div>
          <h3 className="u-display text-[30px] md:text-[37px] mt-2">Temperature · Top-k · Top-p</h3>
        </div>
        <p className="u-note max-w-[38ch]" style={{ color: OLIVE_LIGHT }}>
          The same eight candidate tokens. The controls change only the shape of the distribution before the
          selection.
        </p>
      </div>

      <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-x-12 gap-y-10 pt-8">
        {/* controls */}
        <div>
          <div className="border p-5" style={{ borderColor: RULE }}>
            <Slider
              label="Temperature"
              value={temp}
              min={0.1}
              max={2}
              step={0.05}
              format={(v) => v.toFixed(2)}
              onChange={setTemp}
              note="Low: the best token wins. High: all tokens share the probability."
            />
            <Slider
              label="Top-k"
              value={topK}
              min={1}
              max={8}
              step={1}
              format={(v) => String(v)}
              onChange={setTopK}
              note="The number of tokens that the operation keeps."
            />
            <Slider
              label="Top-p"
              value={topP}
              min={0.1}
              max={1}
              step={0.01}
              format={(v) => v.toFixed(2)}
              onChange={setTopP}
              note="The smallest group of tokens with a total probability of at least p."
            />
          </div>

          <dl className="mt-6 text-[12px]">
            {[
              ["TOKENS IN SET", `${keptCount} / 8`],
              ["ENTROPY", `${entropy.toFixed(2)} BITS`],
              ["ARGMAX", top ? top.tok : "—"],
              ["SEED", String(seed).padStart(8, "0")],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between border-b py-2" style={{ borderColor: RULE }}>
                <dt className="u-label" style={{ color: OLIVE_MID }}>
                  {k}
                </dt>
                <dd className="font-semibold" style={{ color: k === "ARGMAX" ? ORANGE : "#F2F2EC" }}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>

          <button
            onClick={sample100}
            className="mt-6 w-full u-label py-3 transition-colors duration-150 hover:bg-[#F2F2EC] hover:text-[#0D0D0C] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0C]"
            style={{ background: ORANGE, color: "#0D0D0C", borderColor: ORANGE, borderWidth: 1 }}
          >
            Take 100 samples
          </button>
          <button
            onClick={() => {
              setTally(null);
              setTemp(0.8);
              setTopK(5);
              setTopP(0.9);
            }}
            className="mt-2 w-full u-label py-3 transition-colors duration-150 hover:bg-[#2A2A26] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{ border: `1px solid ${RULE}`, color: OLIVE_LIGHT }}
          >
            Reset unit
          </button>
        </div>

        {/* bars */}
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
          <div>
            <div className="u-label pb-2 border-b" style={{ color: OLIVE_LIGHT, borderColor: RULE }}>
              Table 5.1 — Probability after the filters
            </div>
            {rows.map((r, i) => (
              <div key={r.tok} className="flex items-center gap-3 py-[7px] border-b" style={{ borderColor: RULE }}>
                <span
                  className="text-[12px] w-[62px] shrink-0"
                  style={{
                    color: r.kept ? "#F2F2EC" : OLIVE_MID,
                    textDecoration: r.kept ? "none" : "line-through",
                  }}
                >
                  {r.tok}
                </span>
                <span className="flex-1 h-[13px] relative" style={{ background: "#1B1B18" }}>
                  <span
                    className="absolute left-0 top-0 h-full transition-all duration-150"
                    style={{
                      width: `${Math.max(r.raw * 100, 0.6)}%`,
                      background: r.kept ? ORANGE : "transparent",
                      border: r.kept ? "none" : `1px solid ${RULE}`,
                    }}
                  />
                </span>
                <span
                  className="text-[11px] w-[42px] text-right shrink-0"
                  style={{ color: r.kept ? "#F2F2EC" : OLIVE_MID, transitionDelay: `${i * 20}ms` }}
                >
                  {r.kept ? r.p.toFixed(3) : "——"}
                </span>
              </div>
            ))}
            <p className="u-note mt-3" style={{ color: OLIVE_MID }}>
              Bar length shows the probability before renormalization. The number shows the value after
              renormalization. A struck-through token is not in the set.
            </p>
          </div>

          <div>
            <div className="u-label pb-2 border-b" style={{ color: OLIVE_LIGHT, borderColor: RULE }}>
              Table 5.2 — Tally of 100 selections
            </div>
            {tally === null ? (
              <div className="mt-4 border border-dashed p-6" style={{ borderColor: RULE }}>
                <p className="text-[12px] leading-relaxed" style={{ color: OLIVE_MID }}>
                  NO DATA.
                  <br />
                  <br />
                  The unit is ready. Select <span style={{ color: ORANGE }}>TAKE 100 SAMPLES</span> to run 100
                  independent selections with the current controls. The tally shows how often the operation
                  selected each token.
                </p>
              </div>
            ) : (
              <>
                {rows.map((r) => {
                  const idx = CANDIDATES.findIndex((c) => c.tok === r.tok);
                  const c = tally[idx];
                  return (
                    <div key={r.tok} className="flex items-center gap-3 py-[7px] border-b" style={{ borderColor: RULE }}>
                      <span className="text-[12px] w-[62px] shrink-0" style={{ color: r.kept ? "#F2F2EC" : OLIVE_MID }}>
                        {r.tok}
                      </span>
                      <span className="flex-1 h-[13px] relative" style={{ background: "#1B1B18" }}>
                        <span
                          className="absolute left-0 top-0 h-full transition-all duration-300"
                          style={{
                            width: `${(c / maxTally) * 100}%`,
                            background: OLIVE_LIGHT,
                          }}
                        />
                      </span>
                      <span className="text-[11px] w-[42px] text-right shrink-0" style={{ color: "#F2F2EC" }}>
                        {String(c).padStart(3, "0")}
                      </span>
                    </div>
                  );
                })}
                <p className="u-note mt-3" style={{ color: OLIVE_MID }}>
                  A low temperature gives almost all 100 selections to one token. A high temperature gives selections
                  to many tokens. This is the effect that a user sees as “creativity”.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
