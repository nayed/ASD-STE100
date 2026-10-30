/** Drawing primitives of WS-6455: one hand for every figure. */

import type { ReactNode } from "react";

export const INK = "var(--ink)", INK70 = "var(--ink-70)", OLIVE = "var(--olive)", OLIVE_LT = "var(--olive-lt)";
export const PANEL = "var(--panel)", RULE = "var(--rule-2)", ACC = "var(--acc)", ACC_BG = "var(--acc-10)";

type Anchor = "start" | "middle" | "end";

/** text on a halo in the figure's panel colour, so lines can pass behind it */
export function T({
  x, y, children, size = 10, anchor = "start", fill = INK, weight = 400, ls = 0.06, halo = PANEL, className,
}: {
  x: number; y: number; children: ReactNode; size?: number; anchor?: Anchor; fill?: string; weight?: number; ls?: number;
  halo?: string | null; className?: string;
}) {
  return (
    <text
      x={x} y={y} fontSize={size} textAnchor={anchor} fill={fill} fontWeight={weight} letterSpacing={`${ls}em`} className={className}
      {...(halo ? { stroke: halo, strokeWidth: 4, strokeLinejoin: "round" as const, paintOrder: "stroke" } : {})}
    >
      {children}
    </text>
  );
}

/** arrow heads: `${id}-a` in olive, `${id}-i` in ink, `${id}-k` in the accent */
export function Arrows({ id }: { id: string }) {
  const m = (suffix: string, fill: string) => (
    <marker id={`${id}-${suffix}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill={fill} />
    </marker>
  );
  return (
    <defs>
      {m("a", OLIVE)}
      {m("i", INK)}
      {m("k", ACC)}
    </defs>
  );
}

/** hatch for time or space where nothing can happen: fill="url(#<id>-h)" */
export function Hatch({ id, color = OLIVE_LT }: { id: string; color?: string }) {
  return (
    <defs>
      <pattern id={`${id}-h`} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
        <line x1={0} y1={0} x2={0} y2={6} stroke={color} strokeWidth={1.1} />
      </pattern>
    </defs>
  );
}

/** dimension line: ticks at both ends, the value in the middle on a halo */
export function Dim({ x1, y1, x2, y2, label, side = -6 }: { x1: number; y1: number; x2: number; y2: number; label: string; side?: number }) {
  const v = x1 === x2;
  const t = 4;
  return (
    <g>
      <g stroke={OLIVE} strokeWidth={1}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} />
        {v ? (
          <>
            <line x1={x1 - t} y1={y1} x2={x1 + t} y2={y1} />
            <line x1={x2 - t} y1={y2} x2={x2 + t} y2={y2} />
          </>
        ) : (
          <>
            <line x1={x1} y1={y1 - t} x2={x1} y2={y1 + t} />
            <line x1={x2} y1={y2 - t} x2={x2} y2={y2 + t} />
          </>
        )}
      </g>
      <T x={(x1 + x2) / 2 + (v ? 8 : 0)} y={(y1 + y2) / 2 + (v ? 3 : side)} anchor={v ? "start" : "middle"} size={9} fill={OLIVE}>
        {label}
      </T>
    </g>
  );
}

/** leader callout: a dot on the part, a bent line, the note */
export function Leader({ from, to, children, anchor = "start" }: { from: [number, number]; to: [number, number]; children: ReactNode; anchor?: Anchor }) {
  const [fx, fy] = from, [tx, ty] = to;
  return (
    <g>
      <circle cx={fx} cy={fy} r={2.2} fill={INK} />
      <polyline points={`${fx},${fy} ${fx},${ty} ${tx},${ty}`} fill="none" stroke={OLIVE} strokeWidth={1} />
      <T x={anchor === "end" ? tx - 5 : tx + 5} y={ty + 3} size={9} fill={OLIVE} anchor={anchor}>
        {children}
      </T>
    </g>
  );
}

/** corner ticks of a drawing frame */
export function Ticks({ w, h, m = 2 }: { w: number; h: number; m?: number }) {
  const l = 8;
  return (
    <g stroke={OLIVE_LT} strokeWidth={1} fill="none">
      <path d={`M${m},${m + l} V${m} H${m + l}`} />
      <path d={`M${w - m - l},${m} H${w - m} V${m + l}`} />
      <path d={`M${m},${h - m - l} V${h - m} H${m + l}`} />
      <path d={`M${w - m - l},${h - m} H${w - m} V${h - m - l}`} />
    </g>
  );
}

/** the media query, read once per render: figures show their final state under reduced motion */
export const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
