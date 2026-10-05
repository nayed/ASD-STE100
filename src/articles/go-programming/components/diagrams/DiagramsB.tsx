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

/* ================================================================== */
/*  FIG 05 — INTERFACE SATISFACTION (STRUCTURAL TYPING)                */
/* ================================================================== */
export function FigInterface() {
  const types = [
    {
      x: 50,
      name: "TYPE DOG STRUCT",
      ok: true,
      m1: "SPEAK() STRING",
      m2: "FETCH() BALL",
    },
    {
      x: 330,
      name: "TYPE ROBOT STRUCT",
      ok: true,
      m1: "SPEAK() STRING",
      m2: "REBOOT() ERROR",
    },
    {
      x: 610,
      name: "TYPE CAT STRUCT",
      ok: false,
      m1: "PURR() INT",
      m2: "NO SPEAK() — REJECTED",
    },
  ];
  return (
    <svg viewBox="0 0 880 384" className="h-auto w-full" style={MONO} role="img">
      <Defs id="arr-iface" color={OLIVE_DEEP} />
      <Defs id="arr-iface-blue" color={BLUE} />

      {/* contract */}
      <rect x={300} y={24} width={280} height={112} fill="none" stroke={BLUE} strokeWidth={2.5} />
      <rect x={300} y={24} width={280} height={30} fill={BLUE_TEXT} />
      <text x={316} y={44} fontSize={10} fill={PAPER} letterSpacing={3}>
        TYPE SPEAKER INTERFACE
      </text>
      <text x={440} y={92} textAnchor="middle" fontSize={13} fontWeight={600} fill={INK}>
        SPEAK() STRING
      </text>
      <text x={440} y={122} textAnchor="middle" fontSize={9} fill={OLIVE} letterSpacing={2}>
        THE ENTIRE CONTRACT
      </text>

      {/* satisfaction lines */}
      <line x1={370} y1={138} x2={160} y2={228} stroke={OLIVE_DEEP} strokeWidth={1.5} strokeDasharray={DASH} markerEnd="url(#arr-iface)" />
      <line x1={470} y1={138} x2={440} y2={228} stroke={OLIVE_DEEP} strokeWidth={1.5} strokeDasharray={DASH} markerEnd="url(#arr-iface)" />
      <text x={268} y={196} textAnchor="middle" fontSize={9.5} fill={BLUE_TEXT} fontWeight={600} letterSpacing={1.5}>
        SATISFIES — IMPLICITLY
      </text>
      <line x1={540} y1={138} x2={726} y2={228} stroke={OLIVE} strokeWidth={1.5} strokeDasharray={DASH} />
      <text x={646} y={196} textAnchor="middle" fontSize={9.5} fill={OLIVE} letterSpacing={1.5}>
        ×  NO SPEAK, NO SATISFACTION
      </text>

      {/* types */}
      {types.map((t) => (
        <g key={t.name}>
          <rect
            x={t.x}
            y={230}
            width={220}
            height={112}
            fill="none"
            stroke={t.ok ? INK : OLIVE}
            strokeWidth={t.ok ? 1.5 : 1}
            strokeDasharray={t.ok ? undefined : DASH}
          />
          <rect x={t.x} y={230} width={220} height={28} fill={t.ok ? INK : OLIVE} />
          <text x={t.x + 14} y={249} fontSize={9.5} fill={PAPER} letterSpacing={2}>
            {t.name}
          </text>
          <text x={t.x + 14} y={284} fontSize={11.5} fontWeight={t.ok ? 600 : 400} fill={t.ok ? INK : OLIVE}>
            {t.m1} {t.ok ? <tspan fill={BLUE_TEXT} fontWeight={700}>✓</tspan> : null}
          </text>
          <text x={t.x + 14} y={308} fontSize={11.5} fill={t.ok ? INK : OLIVE}>
            {t.m2}
          </text>
          <text x={t.x + 14} y={330} fontSize={9} fill={OLIVE} letterSpacing={1}>
            {t.ok ? "+ ANY OTHER METHODS ARE IGNORED" : "METHOD SET INCOMPLETE"}
          </text>
        </g>
      ))}

      <text x={440} y={370} textAnchor="middle" fontSize={10} fill={OLIVE} letterSpacing={1.5}>
        STRUCTURAL TYPING — METHOD SETS ARE MATCHED BY NAME + SIGNATURE. NO “IMPLEMENTS” KEYWORD EXISTS.
      </text>
    </svg>
  );
}

/* ================================================================== */
/*  FIG 06 — ERROR PROPAGATION / WRAPPING                              */
/* ================================================================== */
export function FigErrors() {
  return (
    <svg viewBox="0 0 900 352" className="h-auto w-full" style={MONO} role="img">
      <Defs id="arr-err" color={OLIVE_DEEP} />
      <Defs id="arr-err-blue" color={BLUE} />

      {/* call chain */}
      {[
        { y: 24, l: "MAIN ()" },
        { y: 138, l: "LOADCONFIG ()" },
        { y: 252, l: "READFILE ()" },
      ].map((b) => (
        <g key={b.l}>
          <rect x={24} y={b.y} width={250} height={62} fill="none" stroke={INK} strokeWidth={1.5} />
          <text x={44} y={b.y + 37} fontSize={12.5} fontWeight={600} fill={INK} letterSpacing={1}>
            {b.l}
          </text>
        </g>
      ))}
      {/* errors travel up */}
      <line x1={150} y1={250} x2={150} y2={204} stroke={OLIVE_DEEP} strokeWidth={1.5} markerEnd="url(#arr-err)" />
      <text x={162} y={230} fontSize={9} fill={OLIVE_DEEP} letterSpacing={1}>
        RETURN (V, ERR)
      </text>
      <line x1={150} y1={136} x2={150} y2={90} stroke={OLIVE_DEEP} strokeWidth={1.5} markerEnd="url(#arr-err)" />
      <text x={162} y={116} fontSize={9} fill={OLIVE_DEEP} letterSpacing={1}>
        RETURN (V, ERR)
      </text>

      {/* pills */}
      <rect x={340} y={138} width={380} height={62} rx={31} fill="none" stroke={OLIVE_DEEP} strokeWidth={1.5} />
      <text x={530} y={164} textAnchor="middle" fontSize={11} fill={INK}>
        "OPEN CONFIG.TOML:"
      </text>
      <text x={530} y={182} textAnchor="middle" fontSize={11} fill={INK}>
        "NO SUCH FILE OR DIRECTORY"
      </text>
      <text x={340} y={128} fontSize={9} fill={OLIVE} letterSpacing={2}>
        THE CAUSE — RETURNED BY READFILE
      </text>

      <rect x={340} y={24} width={544} height={64} rx={32} fill="none" stroke={BLUE} strokeWidth={2.5} />
      <text x={612} y={52} textAnchor="middle" fontSize={11} fill={INK}>
        "LOAD CONFIG: OPEN CONFIG.TOML:
      </text>
      <text x={612} y={70} textAnchor="middle" fontSize={11} fill={INK}>
        NO SUCH FILE OR DIRECTORY"
      </text>
      <text x={340} y={16} fontSize={9} fill={BLUE_TEXT} fontWeight={600} letterSpacing={2}>
        WRAPPED — FMT.ERRORF("LOAD CONFIG: %W", ERR)
      </text>

      {/* wrap arrow */}
      <line x1={640} y1={136} x2={640} y2={92} stroke={BLUE} strokeWidth={2} markerEnd="url(#arr-err-blue)" />
      <text x={654} y={118} fontSize={9.5} fill={BLUE_TEXT} fontWeight={600} letterSpacing={1}>
        %W KEEPS THE CAUSE
      </text>

      {/* leaders from chain to pills */}
      <line x1={276} y1={169} x2={336} y2={169} stroke={OLIVE} strokeWidth={1} strokeDasharray={DASH} />
      <line x1={276} y1={55} x2={336} y2={55} stroke={OLIVE} strokeWidth={1} strokeDasharray={DASH} />

      {/* bottom annotations */}
      <text x={24} y={340} fontSize={10} fill={OLIVE} letterSpacing={0.5}>
        ERRORS ARE ORDINARY VALUES — RETURNED, CHECKED, WRAPPED. ERRORS.IS / ERRORS.AS WALK THE CHAIN.
      </text>
      <text x={640} y={230} fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        ERRORS.IS(ERR, FS.ERRNOTEXIST)
      </text>
      <text x={640} y={246} fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        UNWRAPS UNTIL IT FINDS A MATCH;
      </text>
      <text x={640} y={262} fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        ERRORS.AS EXTRACTS A TYPED ERROR.
      </text>
    </svg>
  );
}

/* ================================================================== */
/*  FIG 07 — GMP SCHEDULER                                             */
/* ================================================================== */
export function FigGMP() {
  const cols = [260, 470, 680];
  return (
    <svg viewBox="0 0 900 412" className="h-auto w-full" style={MONO} role="img">
      <Defs id="arr-gmp" color={OLIVE_DEEP} />
      <text x={580} y={28} textAnchor="middle" fontSize={11.5} fontWeight={600} fill={INK} letterSpacing={2}>
        RUNTIME SCHEDULER — MANY G's, FEW M's, GOMAXPROCS P's
      </text>

      {/* legend */}
      <rect x={24} y={52} width={26} height={26} fill="none" stroke={BLUE} strokeWidth={2.5} />
      <text x={62} y={66} fontSize={10.5} fontWeight={600} fill={INK} letterSpacing={1}>
        G — GOROUTINE
      </text>
      <text x={62} y={80} fontSize={9} fill={OLIVE} letterSpacing={0.5}>
        ~2 KB STACK TO START
      </text>
      <rect x={24} y={112} width={44} height={28} fill="none" stroke={OLIVE_DEEP} strokeWidth={1.5} />
      <text x={80} y={126} fontSize={10.5} fontWeight={600} fill={INK} letterSpacing={1}>
        P — LOGICAL PROCESSOR
      </text>
      <text x={80} y={140} fontSize={9} fill={OLIVE} letterSpacing={0.5}>
        HOLDS THE RUN QUEUE
      </text>
      <rect x={24} y={172} width={60} height={26} fill="none" stroke={INK} strokeWidth={1.5} />
      <text x={96} y={186} fontSize={10.5} fontWeight={600} fill={INK} letterSpacing={1}>
        M — OS THREAD
      </text>
      <text x={96} y={200} fontSize={9} fill={OLIVE} letterSpacing={0.5}>
        SYSCALLS PARK THE M,
      </text>
      <text x={96} y={212} fontSize={9} fill={OLIVE} letterSpacing={0.5}>
        THE P MOVES TO A NEW M
      </text>
      <text x={24} y={258} fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        WHEN A QUEUE RUNS DRY,
      </text>
      <text x={24} y={272} fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        THE IDLE P STEALS HALF OF
      </text>
      <text x={24} y={286} fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        ANOTHER P's QUEUE.
      </text>

      {/* work-stealing arc */}
      <path d="M 688 156 C 620 108, 390 108, 322 158" fill="none" stroke={OLIVE_DEEP} strokeWidth={1.5} strokeDasharray={DASH} markerEnd="url(#arr-gmp)" />
      <text x={505} y={122} textAnchor="middle" fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={2}>
        WORK-STEALING
      </text>

      {cols.map((x, ci) => (
        <g key={ci}>
          {/* P */}
          <rect x={x} y={140} width={190} height={122} fill="none" stroke={OLIVE_DEEP} strokeWidth={1.5} />
          <text x={x + 12} y={160} fontSize={10} fontWeight={600} fill={OLIVE_DEEP} letterSpacing={2}>
            {`P${ci}`}
          </text>
          {[0, 1, 2].map((q) => (
            <g key={q}>
              <rect x={x + 12 + q * 32} y={172} width={26} height={26} fill="none" stroke={OLIVE} strokeWidth={1.5} />
              <text x={x + 25 + q * 32} y={190} textAnchor="middle" fontSize={10} fill={OLIVE_DEEP}>
                G
              </text>
            </g>
          ))}
          <text x={x + 54} y={214} textAnchor="middle" fontSize={8} fill={OLIVE} letterSpacing={1}>
            RUN Q
          </text>
          {/* running G */}
          <rect x={x + 118} y={170} width={58} height={44} fill={BLUE_TEXT} />
          <text x={x + 147} y={188} textAnchor="middle" fontSize={10} fontWeight={700} fill={PAPER}>
            RUN
          </text>
          <text x={x + 147} y={202} textAnchor="middle" fontSize={10} fontWeight={700} fill={PAPER}>
            {`G${ci * 3 + 4}`}
          </text>
          <text x={x + 95} y={248} textAnchor="middle" fontSize={8.5} fill={OLIVE} letterSpacing={1.5}>
            EXECUTES EXACTLY ONE G
          </text>

          {/* M */}
          <rect x={x} y={286} width={190} height={46} fill="none" stroke={INK} strokeWidth={1.5} />
          <text x={x + 95} y={314} textAnchor="middle" fontSize={11} fontWeight={600} fill={INK} letterSpacing={1.5}>
            {`M${ci} — OS THREAD`}
          </text>
          <line x1={x + 95} y1={264} x2={x + 95} y2={282} stroke={OLIVE_DEEP} strokeWidth={1.5} markerEnd="url(#arr-gmp)" />
          <line x1={x + 95} y1={334} x2={x + 95} y2={352} stroke={OLIVE_DEEP} strokeWidth={1.5} markerEnd="url(#arr-gmp)" />
        </g>
      ))}

      {/* OS band */}
      <rect x={24} y={356} width={852} height={34} fill="#e6e4d8" stroke={INK} strokeWidth={1.5} />
      <text x={450} y={378} textAnchor="middle" fontSize={10.5} fontWeight={600} fill={INK} letterSpacing={4}>
        OPERATING SYSTEM — KERNEL
      </text>
    </svg>
  );
}

/* ================================================================== */
/*  FIG 08 — BUFFERED CHANNEL                                          */
/* ================================================================== */
export function FigChannel() {
  return (
    <svg viewBox="0 0 900 306" className="h-auto w-full" style={MONO} role="img">
      <Defs id="arr-ch" />

      {/* sender */}
      <rect x={24} y={96} width={210} height={108} fill="none" stroke={INK} strokeWidth={1.5} />
      <rect x={24} y={96} width={210} height={28} fill={INK} />
      <text x={38} y={115} fontSize={9.5} fill={PAPER} letterSpacing={2}>
        GOROUTINE A — SENDER
      </text>
      <text x={44} y={152} fontSize={12.5} fontWeight={600} fill={INK}>
        CH &lt;- V
      </text>
      <text x={44} y={176} fontSize={9} fill={OLIVE} letterSpacing={0.5}>
        SEND BLOCKS WHILE FULL
      </text>

      {/* buffer */}
      <text x={450} y={80} textAnchor="middle" fontSize={11} fontWeight={600} fill={INK} letterSpacing={2}>
        MAKE(CHAN INT, 3) — A TYPED CONDUIT
      </text>
      {[
        { v: "9", fill: true },
        { v: "4", fill: true },
        { v: "?", fill: false },
      ].map((s, i) => (
        <g key={i}>
          <rect
            x={396 + i * 76}
            y={100}
            width={72}
            height={56}
            fill={s.fill ? "#e6e4d8" : "none"}
            stroke={s.fill ? INK : BLUE}
            strokeWidth={s.fill ? 1.5 : 2.5}
            strokeDasharray={s.fill ? undefined : DASH}
          />
          <text
            x={432 + i * 76}
            y={134}
            textAnchor="middle"
            fontSize={14}
            fontWeight={600}
            fill={s.fill ? INK : BLUE_TEXT}
          >
            {s.v}
          </text>
        </g>
      ))}

      {/* receiver */}
      <rect x={666} y={96} width={210} height={108} fill="none" stroke={INK} strokeWidth={1.5} />
      <rect x={666} y={96} width={210} height={28} fill={INK} />
      <text x={680} y={115} fontSize={9.5} fill={PAPER} letterSpacing={2}>
        GOROUTINE B — RECEIVER
      </text>
      <text x={686} y={152} fontSize={12.5} fontWeight={600} fill={INK}>
        V := &lt;-CH
      </text>
      <text x={686} y={176} fontSize={9} fill={OLIVE} letterSpacing={0.5}>
        RECEIVE BLOCKS WHILE EMPTY
      </text>

      {/* flow arrows */}
      <line x1={238} y1={128} x2={390} y2={128} stroke={OLIVE_DEEP} strokeWidth={1.5} markerEnd="url(#arr-ch)" />
      <text x={314} y={116} textAnchor="middle" fontSize={9} fill={OLIVE_DEEP} letterSpacing={1}>
        SEND
      </text>
      <line x1={620} y1={128} x2={660} y2={128} stroke={OLIVE_DEEP} strokeWidth={1.5} markerEnd="url(#arr-ch)" />
      <text x={640} y={116} textAnchor="middle" fontSize={9} fill={OLIVE_DEEP} letterSpacing={1}>
        RECV
      </text>

      {/* annotations */}
      <text x={24} y={252} fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        UNBUFFERED — CAP 0: EVERY
      </text>
      <text x={24} y={268} fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        SEND WAITS FOR A RECEIVE.
      </text>
      <text x={24} y={284} fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        A SYNCHRONIZATION POINT.
      </text>
      <text x={450} y={252} textAnchor="middle" fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        VALUES FLOW IN ONE DIRECTION,
      </text>
      <text x={450} y={268} textAnchor="middle" fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        SAFELY — NO LOCKS, NO RACES,
      </text>
      <text x={450} y={284} textAnchor="middle" fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        NO SHARED-MEMORY GUESSWORK.
      </text>
      <text x={876} y={252} textAnchor="end" fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        CLOSE(CH) SIGNALS “NO MORE
      </text>
      <text x={876} y={268} textAnchor="end" fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        VALUES”; A RANGE DRAINS THE
      </text>
      <text x={876} y={284} textAnchor="end" fontSize={9.5} fill={OLIVE_DEEP} letterSpacing={0.5}>
        CHANNEL UNTIL IT IS CLOSED.
      </text>
    </svg>
  );
}
