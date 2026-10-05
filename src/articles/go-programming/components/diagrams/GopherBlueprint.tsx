import { PAPER, OLIVE_SOFT, BLUE } from "../Dossier";

const MONO = { fontFamily: "'IBM Plex Mono', monospace" } as const;
const DIM = "4 4";

export function GopherBlueprint({ className = "" }: { className?: string }) {
  const hatch = Array.from({ length: 17 }, (_, i) => 186 + i * 16);
  return (
    <svg viewBox="0 0 600 474" className={className} style={MONO} role="img">
      <defs>
        <marker
          id="bp-dim"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill={OLIVE_SOFT} />
        </marker>
      </defs>

      {/* frame + crosshairs */}
      <rect x={8} y={8} width={584} height={458} fill="none" stroke={PAPER} strokeOpacity={0.35} strokeWidth={1} />
      {[
        [8, 8],
        [592, 8],
        [8, 466],
        [592, 466],
      ].map(([x, y], i) => (
        <g key={i} stroke={PAPER} strokeOpacity={0.5} strokeWidth={1}>
          <line x1={x - 7} y1={y} x2={x + 7} y2={y} />
          <line x1={x} y1={y - 7} x2={x} y2={y + 7} />
        </g>
      ))}
      <line x1={300} y1={52} x2={300} y2={430} stroke={PAPER} strokeOpacity={0.22} strokeWidth={1} strokeDasharray="14 5 2 5" />
      <line x1={96} y1={300} x2={504} y2={300} stroke={PAPER} strokeOpacity={0.22} strokeWidth={1} strokeDasharray="14 5 2 5" />

      {/* body */}
      <path
        d="M 210 400 L 210 290 Q 210 190 300 190 Q 390 190 390 290 L 390 400 Q 390 412 378 412 L 222 412 Q 210 412 210 400 Z"
        fill="none"
        stroke={PAPER}
        strokeOpacity={0.9}
        strokeWidth={2}
      />

      {/* ears */}
      <circle cx={246} cy={196} r={24} fill="none" stroke={PAPER} strokeOpacity={0.9} strokeWidth={2} />
      <circle cx={354} cy={196} r={24} fill="none" stroke={PAPER} strokeOpacity={0.9} strokeWidth={2} />
      <circle cx={246} cy={196} r={11} fill={BLUE} />
      <circle cx={354} cy={196} r={11} fill={BLUE} />

      {/* eyes */}
      <circle cx={272} cy={272} r={8} fill={BLUE} />
      <circle cx={328} cy={272} r={8} fill={BLUE} />

      {/* snout */}
      <ellipse cx={300} cy={318} rx={18} ry={11} fill="none" stroke={PAPER} strokeOpacity={0.9} strokeWidth={2} />
      <circle cx={300} cy={312} r={3.5} fill={PAPER} />
      <path d="M 292 332 Q 300 338 308 332" fill="none" stroke={PAPER} strokeOpacity={0.9} strokeWidth={1.5} />

      {/* whiskers */}
      <g stroke={PAPER} strokeOpacity={0.7} strokeWidth={1.2}>
        <line x1={282} y1={316} x2={238} y2={306} />
        <line x1={282} y1={321} x2={234} y2={321} />
        <line x1={282} y1={326} x2={240} y2={334} />
        <line x1={318} y1={316} x2={362} y2={306} />
        <line x1={318} y1={321} x2={366} y2={321} />
        <line x1={318} y1={326} x2={360} y2={334} />
      </g>

      {/* ground */}
      <line x1={168} y1={412} x2={432} y2={412} stroke={PAPER} strokeOpacity={0.9} strokeWidth={2} />
      {hatch.map((x) => (
        <line key={x} x1={x} y1={414} x2={x - 9} y2={423} stroke={PAPER} strokeOpacity={0.4} strokeWidth={1} />
      ))}

      {/* earspan dimension */}
      <line x1={246} y1={164} x2={246} y2={98} stroke={OLIVE_SOFT} strokeWidth={1} />
      <line x1={354} y1={164} x2={354} y2={98} stroke={OLIVE_SOFT} strokeWidth={1} />
      <line x1={250} y1={106} x2={350} y2={106} stroke={OLIVE_SOFT} strokeWidth={1} markerEnd="url(#bp-dim)" markerStart="url(#bp-dim)" />
      <text x={300} y={94} textAnchor="middle" fontSize={9} fill={OLIVE_SOFT} letterSpacing={1.5}>
        Ø 108 — EARSPAN
      </text>

      {/* stature dimension */}
      <line x1={394} y1={290} x2={462} y2={290} stroke={OLIVE_SOFT} strokeWidth={1} />
      <line x1={394} y1={412} x2={462} y2={412} stroke={OLIVE_SOFT} strokeWidth={1} />
      <line x1={454} y1={294} x2={454} y2={408} stroke={OLIVE_SOFT} strokeWidth={1} markerEnd="url(#bp-dim)" markerStart="url(#bp-dim)" />
      <text x={470} y={352} fontSize={9} fill={OLIVE_SOFT} letterSpacing={1.5}>
        122 — STATURE
      </text>

      {/* callouts */}
      <line x1={268} y1={278} x2={150} y2={248} stroke={OLIVE_SOFT} strokeWidth={1} strokeDasharray={DIM} />
      <text x={146} y={244} textAnchor="end" fontSize={9} fill={OLIVE_SOFT} letterSpacing={1.5}>
        OPTICS ×2 — CURIOUS
      </text>
      <line x1={336} y1={308} x2={442} y2={252} stroke={OLIVE_SOFT} strokeWidth={1} strokeDasharray={DIM} />
      <text x={446} y={248} fontSize={9} fill={OLIVE_SOFT} letterSpacing={1.5}>
        PROBOSCIS — BUG DETECTION UNIT
      </text>
      <line x1={354} y1={168} x2={430} y2={150} stroke={OLIVE_SOFT} strokeWidth={1} strokeDasharray={DIM} />
      <text x={434} y={146} fontSize={9} fill={OLIVE_SOFT} letterSpacing={1.5}>
        AERIALS — ALWAYS UP
      </text>

      {/* labels */}
      <text x={24} y={448} fontSize={10} fill={PAPER} fillOpacity={0.8} letterSpacing={3}>
        FIG. 00 — SUBJECT SCHEMATIC
      </text>
      <rect x={386} y={430} width={192} height={32} fill="none" stroke={PAPER} strokeOpacity={0.5} strokeWidth={1} />
      <text x={396} y={444} fontSize={8.5} fill={OLIVE_SOFT} letterSpacing={1.5}>
        SUBJECT: GOPHER
      </text>
      <text x={396} y={456} fontSize={8.5} fill={OLIVE_SOFT} letterSpacing={1.5}>
        MATERIAL: BYTECODE
      </text>
    </svg>
  );
}
