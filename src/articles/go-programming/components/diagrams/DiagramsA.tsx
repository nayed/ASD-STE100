import { OLIVE, OLIVE_DEEP, INK, BLUE, BLUE_TEXT, PAPER } from "../Dossier";

const MONO = { fontFamily: "'IBM Plex Mono', monospace" } as const;
const DASH = "5 5";

function Defs({ id, color = OLIVE }: { id: string; color?: string }) {
  return (
    <defs>
      <marker
        id={id}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M0,0 L10,5 L0,10 z" fill={color} />
      </marker>
    </defs>
  );
}

function BoxLabel({
  x,
  y,
  w,
  fill = INK,
}: {
  x: number;
  y: number;
  w: number;
  fill?: string;
}) {
  return (
    <rect x={x} y={y} width={w} height={30} fill={fill} />
  );
}

/* ================================================================== */
/*  FIG 01 — BUILD PIPELINE                                            */
/* ================================================================== */
export function FigPipeline() {
  const stages = [
    { x: 8, w: 104, label: "MAIN.GO", sub: "SOURCE" },
    { x: 137, w: 104, label: "PARSER", sub: "TOKENS" },
    { x: 266, w: 88, label: "AST", sub: "TREE" },
    { x: 379, w: 128, label: "TYPE CHECK", sub: "SAFETY NET" },
    { x: 532, w: 88, label: "SSA", sub: "OPTIMIZE" },
    { x: 645, w: 104, label: "CODEGEN", sub: "EMIT" },
    { x: 774, w: 118, label: "DOSSIER", sub: "STATIC BINARY" },
  ];
  return (
    <svg viewBox="0 0 900 250" className="h-auto w-full" style={MONO} role="img">
      <Defs id="arr-pipe" />
      {/* go build bracket */}
      <text x={450} y={26} textAnchor="middle" fontSize={12} fill={INK} fontWeight={600} letterSpacing={2}>
        GO BUILD ./…
      </text>
      <line x1={8} y1={44} x2={892} y2={44} stroke={OLIVE} strokeWidth={1.5} />
      <line x1={8} y1={44} x2={8} y2={56} stroke={OLIVE} strokeWidth={1.5} />
      <line x1={892} y1={44} x2={892} y2={56} stroke={OLIVE} strokeWidth={1.5} />

      {stages.map((s, i) => {
        const hot = i === 3;
        const isFile = i === 0 || i === 6;
        return (
          <g key={i}>
            <rect
              x={s.x}
              y={96}
              width={s.w}
              height={54}
              fill={hot ? "transparent" : isFile ? INK : "none"}
              stroke={hot ? BLUE : INK}
              strokeWidth={hot ? 2.5 : 1.5}
              strokeDasharray={isFile ? undefined : undefined}
            />
            <text
              x={s.x + s.w / 2}
              y={128}
              textAnchor="middle"
              fontSize={13}
              fontWeight={600}
              fill={isFile ? PAPER : hot ? BLUE_TEXT : INK}
              letterSpacing={1}
            >
              {s.label}
            </text>
            <text
              x={s.x + s.w / 2}
              y={172}
              textAnchor="middle"
              fontSize={9}
              fill={hot ? BLUE_TEXT : OLIVE}
              letterSpacing={2}
            >
              {s.sub}
            </text>
            {i < stages.length - 1 && (
              <line
                x1={s.x + s.w + 3}
                y1={123}
                x2={stages[i + 1].x - 3}
                y2={123}
                stroke={OLIVE}
                strokeWidth={1.5}
                markerEnd={`url(#arr-pipe)`}
              />
            )}
          </g>
        );
      })}

      {/* annotations */}
      <text x={205} y={208} textAnchor="middle" fontSize={10} fill={OLIVE_DEEP} letterSpacing={1}>
        SYNTAX ERRORS DIE HERE
      </text>
      <text x={443} y={208} textAnchor="middle" fontSize={10} fill={BLUE_TEXT} fontWeight={600} letterSpacing={1}>
        WHOLE-PROGRAM TYPE SAFETY,
      </text>
      <text x={443} y={222} textAnchor="middle" fontSize={10} fill={BLUE_TEXT} fontWeight={600} letterSpacing={1}>
        ESTABLISHED BEFORE RUNTIME
      </text>
      <text x={833} y={208} textAnchor="middle" fontSize={10} fill={OLIVE_DEEP} letterSpacing={1}>
        NO VM, NO INTERPRETER,
      </text>
      <text x={833} y={222} textAnchor="middle" fontSize={10} fill={OLIVE_DEEP} letterSpacing={1}>
        NO RUNTIME DEPENDENCIES
      </text>
    </svg>
  );
}

/* ================================================================== */
/*  FIG 02 — PROGRAM ANATOMY                                           */
/* ================================================================== */
export function FigAnatomy() {
  const code: [string, number][] = [
    ["package main", 0],
    ["", 0],
    ["import \"fmt\"", 1],
    ["", 0],
    ["func main() {", 2],
    ["\tfmt.Println(\"hello\")", 3],
    ["}", 0],
    ["", 0],
    ["// run: go run hello.go", 0],
  ];
  const markers: Record<number, string> = { 0: "01", 2: "02", 4: "03", 5: "04" };
  const callouts = [
    {
      y: 76,
      n: "01",
      t: "PACKAGE CLAUSE",
      d: ["EVERY FILE DECLARES EXACTLY ONE", "PACKAGE. MAIN MARKS AN", "EXECUTABLE, NOT A LIBRARY."],
    },
    {
      y: 156,
      n: "02",
      t: "IMPORTS",
      d: ["IMPORTS ARE THE DEPENDENCY", "SYSTEM. UNUSED IMPORTS ARE A", "COMPILE ERROR — NO DEAD WEIGHT."],
    },
    {
      y: 240,
      n: "03",
      t: "ENTRY POINT",
      d: ["EXECUTION BEGINS AT FUNC MAIN.", "NO ARGS, NO RETURN VALUE,", "NO CONSTRUCTOR REQUIRED."],
    },
    {
      y: 310,
      n: "04",
      t: "STDLIB CALL",
      d: ["FMT IS FORMATTED I/O FROM THE", "STANDARD LIBRARY —", "BATTERIES INCLUDED."],
    },
  ];
  return (
    <svg viewBox="0 0 900 348" className="h-auto w-full" style={MONO} role="img">
      {/* code panel */}
      <rect x={16} y={24} width={400} height={296} fill="none" stroke={INK} strokeWidth={1.5} />
      <BoxLabel x={16} y={24} w={400} />
      <text x={32} y={44} fontSize={10} fill={PAPER} letterSpacing={3}>
        HELLO.GO — COMPLETE, COMPILABLE, 7 LINES
      </text>
      {code.map(([line], i) => (
        <text key={i} x={32} y={78 + i * 26} fontSize={12.5} fill={line.startsWith("//") ? OLIVE : INK}>
          {line.replace(/\t/, "    ")}
        </text>
      ))}

      {/* markers */}
      {Object.entries(markers).map(([ln, n]) => {
        const cy = 74 + Number(ln) * 26;
        return (
          <g key={n}>
            <circle cx={432} cy={cy} r={10} fill={BLUE_TEXT} />
            <text x={432} y={cy + 3.5} textAnchor="middle" fontSize={9.5} fill={PAPER} fontWeight={700}>
              {n}
            </text>
          </g>
        );
      })}

      {/* callouts */}
      {callouts.map((c) => {
        const src = 74 + (Number(c.n === "01" ? 0 : c.n === "02" ? 2 : c.n === "03" ? 4 : 5)) * 26;
        return (
          <g key={c.n}>
            <line
              x1={445}
              y1={src}
              x2={478}
              y2={c.y - 12}
              stroke={OLIVE}
              strokeWidth={1}
              strokeDasharray={DASH}
            />
            <text x={486} y={c.y} fontSize={11.5} fontWeight={700} fill={INK} letterSpacing={2}>
              {c.n} / {c.t}
            </text>
            {c.d.map((d, i) => (
              <text key={i} x={486} y={c.y + 16 + i * 14} fontSize={10} fill={OLIVE_DEEP} letterSpacing={0.5}>
                {d}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/* ================================================================== */
/*  FIG 03 — SLICE ANATOMY (HEADER + BACKING ARRAY)                    */
/* ================================================================== */
export function FigSlice() {
  const cells = ["90", "85", "77", "0", "0", "0"];
  const cellW = 90;
  const ax = 40;
  const ay = 192;
  return (
    <svg viewBox="0 0 900 356" className="h-auto w-full" style={MONO} role="img">
      <Defs id="arr-slice" color={OLIVE_DEEP} />

      {/* slice s header */}
      <text x={40} y={22} fontSize={11} fontWeight={600} fill={INK} letterSpacing={1.5}>
        S := MAKE([]INT, 3, 6)
      </text>
      <rect x={40} y={34} width={560} height={82} fill="none" stroke={INK} strokeWidth={1.5} />
      <text x={52} y={54} fontSize={9} fill={OLIVE} letterSpacing={2}>
        SLICE HEADER — 24 BYTES, PASSED BY VALUE
      </text>
      {[
        { x: 40, w: 186, l1: "PTR", l2: "0XC000A8…", hot: true },
        { x: 226, w: 186, l1: "LEN", l2: "3", hot: false },
        { x: 412, w: 188, l1: "CAP", l2: "6", hot: false },
      ].map((c, i) => (
        <g key={i}>
          <rect x={c.x} y={64} width={c.w} height={44} fill="none" stroke={c.hot ? BLUE : INK} strokeWidth={c.hot ? 2.5 : 1.5} />
          <text x={c.x + 12} y={82} fontSize={9} fill={c.hot ? BLUE_TEXT : OLIVE} letterSpacing={2}>
            {c.l1}
          </text>
          <text x={c.x + 12} y={99} fontSize={12} fontWeight={600} fill={INK}>
            {c.l2}
          </text>
        </g>
      ))}

      {/* slice t header */}
      <text x={640} y={22} fontSize={11} fontWeight={600} fill={INK} letterSpacing={1.5}>
        T := S[1:4]
      </text>
      <rect x={640} y={34} width={244} height={82} fill="none" stroke={INK} strokeWidth={1.5} />
      <text x={652} y={54} fontSize={9} fill={OLIVE} letterSpacing={2}>
        ITS OWN HEADER
      </text>
      {[
        { x: 640, w: 80, l1: "PTR", l2: "…+90B", hot: true },
        { x: 720, w: 80, l1: "LEN", l2: "3", hot: false },
        { x: 800, w: 84, l1: "CAP", l2: "5", hot: false },
      ].map((c, i) => (
        <g key={i}>
          <rect x={c.x} y={64} width={c.w} height={44} fill="none" stroke={c.hot ? BLUE : INK} strokeWidth={c.hot ? 2.5 : 1.5} />
          <text x={c.x + 9} y={82} fontSize={8.5} fill={c.hot ? BLUE_TEXT : OLIVE} letterSpacing={1.5}>
            {c.l1}
          </text>
          <text x={c.x + 9} y={99} fontSize={12} fontWeight={600} fill={INK}>
            {c.l2}
          </text>
        </g>
      ))}

      {/* pointers into the array */}
      <line x1={133} y1={112} x2={86} y2={188} stroke={OLIVE_DEEP} strokeWidth={1.5} strokeDasharray={DASH} markerEnd="url(#arr-slice)" />
      <text x={96} y={150} fontSize={9} fill={OLIVE_DEEP} letterSpacing={1}>S.PTR</text>
      <line x1={680} y1={112} x2={172} y2={188} stroke={OLIVE_DEEP} strokeWidth={1.5} strokeDasharray={DASH} markerEnd="url(#arr-slice)" />
      <text x={400} y={136} fontSize={9} fill={OLIVE_DEEP} letterSpacing={1}>T.PTR — CELL 1</text>

      {/* backing array */}
      <text x={40} y={174} fontSize={10} fill={OLIVE} letterSpacing={2}>
        BACKING ARRAY — ONE ALLOCATION, SHARED BY EVERY SLICE ONTO IT
      </text>
      {cells.map((v, i) => {
        const inLen = i < 3;
        return (
          <g key={i}>
            <rect
              x={ax + i * cellW}
              y={ay}
              width={cellW}
              height={48}
              fill={inLen ? "#e6e4d8" : "none"}
              stroke={inLen ? INK : OLIVE}
              strokeWidth={inLen ? 1.5 : 1}
              strokeDasharray={inLen ? undefined : DASH}
            />
            <text x={ax + i * cellW + cellW / 2} y={ay + 29} textAnchor="middle" fontSize={13} fontWeight={600} fill={INK}>
              {v}
            </text>
            <text x={ax + i * cellW + cellW / 2} y={258} textAnchor="middle" fontSize={9} fill={OLIVE} letterSpacing={1}>
              {`[${i}]`}
            </text>
          </g>
        );
      })}
      <text x={640} y={212} fontSize={10} fill={OLIVE_DEEP} letterSpacing={0.5}>
        APPEND WRITES IN PLACE
      </text>
      <text x={640} y={228} fontSize={10} fill={OLIVE_DEEP} letterSpacing={0.5}>
        WHILE CAP SUFFICES; AT
      </text>
      <text x={640} y={244} fontSize={10} fill={OLIVE_DEEP} letterSpacing={0.5}>
        CAPACITY IT ALLOCATES A
      </text>
      <text x={640} y={260} fontSize={10} fill={OLIVE_DEEP} letterSpacing={0.5}>
        FRESH, LARGER ARRAY.
      </text>

      {/* brackets */}
      <line x1={40} y1={282} x2={310} y2={282} stroke={BLUE} strokeWidth={2} />
      <line x1={40} y1={276} x2={40} y2={288} stroke={BLUE} strokeWidth={2} />
      <line x1={310} y1={276} x2={310} y2={288} stroke={BLUE} strokeWidth={2} />
      <text x={175} y={302} textAnchor="middle" fontSize={10} fill={BLUE_TEXT} fontWeight={600} letterSpacing={1.5}>
        LEN S = 3 — WHAT YOU SEE
      </text>
      <line x1={40} y1={322} x2={580} y2={322} stroke={OLIVE} strokeWidth={1.5} />
      <line x1={40} y1={316} x2={40} y2={328} stroke={OLIVE} strokeWidth={1.5} />
      <line x1={580} y1={316} x2={580} y2={328} stroke={OLIVE} strokeWidth={1.5} />
      <text x={310} y={342} textAnchor="middle" fontSize={10} fill={OLIVE_DEEP} letterSpacing={1.5}>
        CAP S = 6 — ROOM BEFORE REALLOCATION
      </text>
    </svg>
  );
}

/* ================================================================== */
/*  FIG 04 — STRUCT + METHOD RECEIVERS                                 */
/* ================================================================== */
export function FigStruct() {
  return (
    <svg viewBox="0 0 880 330" className="h-auto w-full" style={MONO} role="img">
      <Defs id="arr-struct" />
      <Defs id="arr-struct-blue" color={BLUE} />

      {/* struct */}
      <rect x={20} y={40} width={300} height={184} fill="none" stroke={INK} strokeWidth={1.5} />
      <BoxLabel x={20} y={40} w={300} />
      <text x={36} y={60} fontSize={10} fill={PAPER} letterSpacing={3}>
        TYPE SERVER STRUCT {`{ … }`}
      </text>
      <text x={40} y={102} fontSize={12.5} fill={INK}>
        HOST     STRING
      </text>
      <text x={40} y={132} fontSize={12.5} fill={INK}>
        PORT     INT
      </text>
      <line x1={36} y1={152} x2={304} y2={152} stroke={OLIVE} strokeWidth={1} strokeDasharray={DASH} />
      <text x={40} y={176} fontSize={10} fill={OLIVE} letterSpacing={0.5}>
        {"// FIELDS DEFAULT TO ZERO VALUES"}
      </text>
      <text x={40} y={196} fontSize={10} fill={OLIVE} letterSpacing={0.5}>
        {"// NO CONSTRUCTOR REQUIRED"}
      </text>

      {/* method A — value receiver */}
      <rect x={560} y={30} width={300} height={104} fill="none" stroke={INK} strokeWidth={1.5} />
      <BoxLabel x={560} y={30} w={300} />
      <text x={576} y={50} fontSize={10} fill={PAPER} letterSpacing={3}>
        VALUE RECEIVER
      </text>
      <text x={580} y={84} fontSize={12.5} fontWeight={600} fill={INK}>
        FUNC (S SERVER) ADDR() STRING
      </text>
      <text x={580} y={106} fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        RECEIVES A COPY OF THE STRUCT —
      </text>
      <text x={580} y={120} fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        READ-ONLY, SAFE TO SHARE.
      </text>

      {/* method B — pointer receiver */}
      <rect x={560} y={176} width={300} height={104} fill="none" stroke={BLUE} strokeWidth={2.5} />
      <rect x={560} y={176} width={300} height={30} fill={BLUE_TEXT} />
      <text x={576} y={196} fontSize={10} fill={PAPER} letterSpacing={3}>
        POINTER RECEIVER
      </text>
      <text x={580} y={230} fontSize={12.5} fontWeight={600} fill={INK}>
        FUNC (S *SERVER) SHUTDOWN()
      </text>
      <text x={580} y={252} fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        RECEIVES A POINTER — CAN MUTATE
      </text>
      <text x={580} y={266} fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        THE ORIGINAL STRUCT IN PLACE.
      </text>

      {/* arrows */}
      <line x1={322} y1={96} x2={554} y2={84} stroke={OLIVE} strokeWidth={1.5} markerEnd="url(#arr-struct)" />
      <text x={430} y={76} textAnchor="middle" fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={2}>
        COPY
      </text>
      <line x1={322} y1={188} x2={554} y2={226} stroke={BLUE} strokeWidth={2} markerEnd="url(#arr-struct-blue)" />
      <text x={430} y={196} textAnchor="middle" fontSize={9.5} fill={BLUE_TEXT} fontWeight={600} letterSpacing={2}>
        SHARE
      </text>

      <text x={440} y={314} textAnchor="middle" fontSize={10} fill={OLIVE} letterSpacing={1.5}>
        METHODS ARE FUNCTIONS WITH A RECEIVER ARGUMENT — NO CLASSES, NO INHERITANCE, NO HIDDEN STATE
      </text>
    </svg>
  );
}
