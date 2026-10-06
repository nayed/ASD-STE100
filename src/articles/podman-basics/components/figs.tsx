/**
 * Hand-drafted technical figures.
 * Language: flat black/white, olive-gray construction strokes,
 * purple reserved for the single key element of each sheet.
 */

import type { ReactNode } from "react";

const O = "#70755e";
const I = "#11140f";
const P = "#6d28d9";
const W = "#fbfbf8";

type Pt = [number, number];

/* ---------------- primitives ---------------- */

function Arrow({ pts, color = O, dash = false, w = 1.4 }: { pts: Pt[]; color?: string; dash?: boolean; w?: number }) {
  const n = pts.length;
  const [tx, ty] = pts[n - 1];
  const [fx, fy] = pts[n - 2];
  const ang = Math.atan2(ty - fy, tx - fx);
  const L = 9;
  const HW = 4.2;
  const bx = tx - L * Math.cos(ang);
  const by = ty - L * Math.sin(ang);
  const px = HW * Math.cos(ang + Math.PI / 2);
  const py = HW * Math.sin(ang + Math.PI / 2);
  const line = pts
    .slice(0, -1)
    .concat([[bx, by]] as Pt[])
    .map((p) => p.join(","))
    .join(" ");
  return (
    <g>
      <polyline points={line} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dash ? "5 4" : undefined} />
      <polygon points={`${tx},${ty} ${bx + px},${by + py} ${bx - px},${by - py}`} fill={color} />
    </g>
  );
}

function Bx({
  x,
  y,
  w,
  h,
  lines,
  dark = false,
  dash = false,
  accent = false,
  sub = null,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
  dark?: boolean;
  dash?: boolean;
  accent?: boolean;
  sub?: string | null;
}) {
  const stroke = accent ? P : dash ? O : I;
  const sw = accent ? 2 : 1.2;
  const cy = y + h / 2 - ((lines.length - 1) * 13 + (sub ? 11 : 0)) / 2 + 4;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={dark ? I : W}
        stroke={stroke}
        strokeWidth={sw}
        strokeDasharray={dash ? "6 4" : undefined}
      />
      {lines.map((t, i) => (
        <text key={t} x={x + w / 2} y={cy + i * 13} textAnchor="middle" className={i === 0 ? (dark ? "fw" : "fb") : dark ? "fws" : "fs"}>
          {t}
        </text>
      ))}
      {sub && (
        <text x={x + w / 2} y={cy + lines.length * 13} textAnchor="middle" className={dark ? "fws" : "fs"}>
          {sub}
        </text>
      )}
    </g>
  );
}

function L({
  x,
  y,
  anchor = "middle",
  cls = "fs",
  bg = false,
  children,
}: {
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  cls?: "fb" | "fs" | "fp" | "fps";
  bg?: boolean;
  children: string;
}) {
  const per = cls === "fb" ? 7.1 : cls === "fp" ? 6.7 : cls === "fps" ? 5.9 : 5.75;
  const wpx = children.length * per + 10;
  const rx = anchor === "middle" ? x - wpx / 2 : anchor === "end" ? x - wpx : x;
  return (
    <g>
      {bg && <rect x={rx} y={y - 9.5} width={wpx} height={13} fill={W} />}
      <text x={x} y={y} textAnchor={anchor} className={cls}>
        {children}
      </text>
    </g>
  );
}

function Badge({ cx, cy, n }: { cx: number; cy: number; n: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={P} />
      <text x={cx} y={cy + 3.5} textAnchor="middle" className="fws" style={{ letterSpacing: 0, fontSize: "10px", fontWeight: 700 }}>
        {n}
      </text>
    </g>
  );
}

const wrap = (label: string, vb: string, kids: ReactNode) => (
  <svg viewBox={vb} role="img" aria-label={label} className="block h-auto w-full">
    {kids}
  </svg>
);

/* ---------------- FIG 02 — VM vs container stacks ---------------- */

export function FigStacks() {
  const lx = 60;
  const rx = 440;
  const colW = 260;
  return wrap("virtual machine stack versus container stack", "0 0 760 330", <>
    <L x={lx + colW / 2} y={26} cls="fb">VIRTUAL MACHINES</L>
    <L x={rx + colW / 2} y={26} cls="fb">CONTAINERS</L>
    <L x={380} y={26} cls="fp" bg>VS</L>
    <line x1={380} y1={40} x2={380} y2={302} stroke={O} strokeWidth={1} strokeDasharray="3 5" />

    {/* VM column */}
    <Bx x={lx} y={52} w={colW} h={34} lines={["APP A · B · C"]} />
    <Bx x={lx} y={90} w={colW} h={32} lines={["BINS / LIBS ×3"]} />
    <Bx x={lx} y={126} w={colW} h={40} lines={["GUEST OS ×3", "A FULL OS PER APP"]} />
    <Bx x={lx} y={170} w={colW} h={38} lines={["HYPERVISOR", "VIRTUALIZED HARDWARE"]} />
    <Bx x={lx} y={212} w={colW} h={36} lines={["HOST OS + KERNEL"]} />
    <Bx x={lx} y={252} w={colW} h={36} lines={["HARDWARE"]} dark />
    <L x={lx + colW / 2} y={312} cls="fs">HEAVY — GIGABYTES · MINUTES TO BOOT</L>

    {/* container column */}
    <Bx x={rx} y={52} w={colW} h={34} lines={["APP A · B · C"]} />
    <Bx x={rx} y={90} w={colW} h={32} lines={["BINS / LIBS"]} />
    <rect x={rx} y={126} width={colW} height={24} fill="none" stroke={O} strokeWidth={1} strokeDasharray="5 4" />
    <L x={rx + colW / 2} y={142} cls="fps" bg>— NO GUEST OS —</L>
    <Bx x={rx} y={158} w={colW} h={36} lines={["CONTAINER ENGINE — PODMAN"]} />
    <Bx x={rx} y={198} w={colW} h={44} accent lines={["HOST OS + LINUX KERNEL", "SHARED BY EVERY CONTAINER"]} />
    <Bx x={rx} y={246} w={colW} h={36} lines={["HARDWARE"]} dark />
    <L x={rx + colW / 2} y={312} cls="fs">LIGHT — MEGABYTES · MILLISECONDS TO START</L>
  </>);
}

/* ---------------- FIG 03 — image layers / copy-on-write ---------------- */

export function FigLayers() {
  const layers = ["LAYER 04 — APP CONFIG", "LAYER 03 — APP CODE", "LAYER 02 — RUNTIME", "LAYER 01 — BASE SYSTEM"];
  return wrap("read-only image layers and per-container writable layer", "0 0 760 300", <>
    <L x={210} y={26} cls="fb">AN IMAGE — A STACK OF READ-ONLY LAYERS</L>
    <L x={586} y={26} cls="fb">RUNNING CONTAINERS SHARE IT</L>

    <rect x={52} y={44} width={318} height={170} fill="none" stroke={O} strokeWidth={1} strokeDasharray="6 4" />
    <L x={70} y={44} cls="fs" bg>UNION FILESYSTEM · READ-ONLY</L>
    {layers.map((t, i) => (
      <Bx key={t} x={70} y={56 + i * 40} w={278} h={34} lines={[t]} />
    ))}
    {[0, 1, 2, 3].map((i) => (
      <L key={i} x={360} y={78 + i * 40} anchor="end" cls="fs">{`sha:${["a91f", "04c2", "77bd", "e530"][i]}`}</L>
    ))}

    <Arrow pts={[[382, 128], [452, 128]]} color={P} w={1.8} />
    <L x={417} y={112} cls="fps">podman run ×2</L>

    {/* shared base */}
    {[3, 2, 1, 0].map((li, i) => (
      <rect key={li} x={474} y={188 + i * 30} width={228} height={26} fill="none" stroke={I} strokeWidth={1.2} />
    ))}
    <L x={588} y={264} cls="fs">SHARED READ-ONLY LAYERS</L>
    <L x={588} y={294} cls="fs">STORED ONCE ON DISK</L>

    {/* writable chips */}
    <Bx x={474} y={148} w={110} h={28} accent lines={["C1 · RW"]} />
    <Bx x={592} y={148} w={110} h={28} accent lines={["C2 · RW"]} />
    <line x1={474} y1={176} x2={474} y2={188} stroke={P} strokeWidth={1.2} strokeDasharray="2 2" />
    <line x1={592} y1={176} x2={592} y2={188} stroke={P} strokeWidth={1.2} strokeDasharray="2 2" />
    <line x1={702} y1={176} x2={702} y2={188} stroke={P} strokeWidth={1.2} strokeDasharray="2 2" />
    <L x={588} y={134} cls="fs">THIN WRITABLE LAYER PER CONTAINER</L>

    <L x={44} y={292} anchor="start" cls="fs">copy-on-write · delete C1 and only its thin layer disappears</L>
  </>);
}

/* ---------------- FIG 04 — build / pull / run loop ---------------- */

export function FigLoop() {
  return wrap("the build pull run lifecycle", "0 0 760 330", <>
    <L x={380} y={28} cls="fb">THE LIFECYCLE YOU WILL REPEAT ALL DAY</L>

    <Bx x={40} y={122} w={170} h={68} lines={["CONTAINERFILE", "THE RECIPE"]} />
    <Bx x={330} y={52} w={190} h={68} accent lines={["LOCAL IMAGE STORE", "podman images"]} />
    <Bx x={330} y={212} w={190} h={68} lines={["REGISTRY", "docker.io · quay.io · ghcr.io"]} />
    <Bx x={608} y={122} w={132} h={68} lines={["CONTAINER", "A LIVE PROCESS"]} dark />

    <Badge cx={40} cy={122} n={1} />
    <Badge cx={330} cy={52} n={2} />
    <Badge cx={330} cy={212} n={3} />
    <Badge cx={608} cy={122} n={4} />

    <Arrow pts={[[166, 122], [286, 86], [330, 86]]} color={I} />
    <L x={248} y={76} cls="fs">build -t app:v1</L>

    <Arrow pts={[[520, 86], [608, 140]]} color={P} w={1.8} />
    <L x={566} y={98} cls="fps">run -d -p 8080:80</L>

    <Arrow pts={[[432, 212], [432, 124]]} color={O} />
    <L x={444} y={172} anchor="start" cls="fs">pull</L>
    <Arrow pts={[[404, 124], [404, 212]]} color={O} />
    <L x={396} y={172} anchor="end" cls="fs">push</L>

    {/* iterate loop */}
    <Arrow pts={[[674, 190], [674, 302], [125, 302], [125, 194]]} color={O} dash />
    <L x={400} y={294} cls="fs" bg>CHANGE THE CODE → REBUILD → RERUN</L>

    <L x={125} y={212} cls="fs">1 · WRITE RECIPE ONCE</L>
  </>);
}

/* ---------------- FIG 05 — daemon vs daemonless ---------------- */

export function FigDaemon() {
  return wrap("docker daemon model versus podman fork-exec model", "0 0 760 340", <>
    <L x={195} y={26} cls="fb">DOCKER — A ROOT DAEMON IN THE MIDDLE</L>
    <L x={565} y={26} cls="fb">PODMAN — FORK / EXEC, NO DAEMON</L>
    <line x1={380} y1={14} x2={380} y2={300} stroke={O} strokeWidth={1} strokeDasharray="3 5" />

    {/* docker chain */}
    <Bx x={110} y={52} w={170} h={38} lines={["$ docker run"]} />
    <Arrow pts={[[195, 90], [195, 116]]} color={I} />
    <Bx x={110} y={116} w={170} h={56} dark lines={["DOCKERD", "ROOT · ALWAYS RUNNING"]} />
    <Arrow pts={[[195, 172], [195, 200]]} color={I} />
    <Bx x={110} y={200} w={170} h={34} lines={["CONTAINERD / SHIM"]} />
    <Arrow pts={[[195, 234], [195, 262]]} color={I} />
    <Bx x={110} y={262} w={170} h={40} lines={["CONTAINER", "VIA RUNC"]} />
    <L x={292} y={134} anchor="start" cls="fps">SINGLE POINT OF FAILURE</L>
    <L x={292} y={150} anchor="start" cls="fs">AND A ROOT-POWERED TARGET</L>
    <L x={195} y={328} cls="fs">IF THE DAEMON DIES, EVERY CONTAINER IS ORPHANED</L>

    {/* podman chain */}
    <Bx x={480} y={52} w={170} h={38} accent lines={["$ podman run"]} />
    <Arrow pts={[[565, 90], [565, 116]]} color={P} w={1.8} />
    <Bx x={480} y={116} w={170} h={44} lines={["PODMAN", "FORK / EXEC"]} />
    <Arrow pts={[[565, 160], [565, 196]]} color={I} />
    <Bx x={505} y={196} w={120} h={36} dash lines={["CONMON", "TINY MONITOR"]} />
    <Arrow pts={[[565, 232], [565, 258]]} color={I} />
    <Bx x={480} y={258} w={170} h={44} lines={["CONTAINER", "CHILD OF INIT, NOT PODMAN"]} />
    <Arrow pts={[[650, 138], [704, 138]]} color={O} dash />
    <L x={704} y={126} anchor="end" cls="fs" bg>PODMAN EXITS</L>
    <L x={640} y={188} anchor="start" cls="fs">STARTS IT,</L>
    <L x={640} y={202} anchor="start" cls="fs">STEPS ASIDE</L>
    <L x={565} y={328} cls="fs">CONMON ONLY STREAMS LOGS + REPORTS EXIT CODES</L>
  </>);
}

/* ---------------- FIG 06 — UID mapping / rootless ---------------- */

export function FigUid() {
  return wrap("user namespace uid mapping", "0 0 760 310", <>
    <L x={380} y={26} cls="fb">USER NAMESPACES — A CONTROLLED IDENTITY LIE</L>

    <rect x={44} y={56} width={300} height={196} fill="none" stroke={O} strokeWidth={1} strokeDasharray="6 4" />
    <L x={62} y={56} cls="fs" bg>INSIDE THE CONTAINER</L>
    <Bx x={72} y={88} w={244} h={36} dark lines={["UID 0 · ROOT — FULL POWER HERE"]} />
    <Bx x={72} y={132} w={244} h={36} lines={["UID 1 · APP"]} />
    <Bx x={72} y={176} w={244} h={36} lines={["UID 27 · DBUSER"]} />

    <rect x={420} y={56} width={296} height={196} fill="none" stroke={I} strokeWidth={1.2} />
    <L x={438} y={56} cls="fs" bg>ON THE HOST</L>
    <Bx x={448} y={88} w={240} h={36} lines={["UID 1000 · ALEX — AN ORDINARY USER"]} />
    <Bx x={448} y={132} w={240} h={36} lines={["UID 100000 · SUBUID + 0"]} />
    <Bx x={448} y={176} w={240} h={36} lines={["UID 100001 · SUBUID + 1"]} />

    <L x={382} y={42} cls="fps" bg>ROOT HERE = NOBODY OUTSIDE</L>
    <Arrow pts={[[316, 106], [448, 106]]} color={P} w={2} />
    <Arrow pts={[[316, 150], [448, 150]]} color={O} />
    <Arrow pts={[[316, 194], [448, 194]]} color={O} />
    <L x={382} y={270} cls="fs" bg>HOST UID = CONTAINER UID + 99,999</L>

    <L x={44} y={296} anchor="start" cls="fs">/etc/subuid lends each user 65,536 host UIDs · rootless storage lives in ~/.local/share/containers</L>
  </>);
}

/* ---------------- FIG 07 — pod anatomy ---------------- */

export function FigPod() {
  return wrap("a pod with two containers sharing a network namespace", "0 0 760 340", <>
    <L x={380} y={26} cls="fb">LOCAL POD ≡ KUBERNETES POD</L>

    {/* pod boundary */}
    <rect x={170} y={64} width={420} height={212} fill="none" stroke={P} strokeWidth={1.8} strokeDasharray="8 5" />
    <L x={176} y={64} cls="fp" bg>POD — SHARED NET + IPC NAMESPACE</L>

    <Bx x={206} y={104} w={160} h={76} lines={["NGINX", "SERVES :80"]} />
    <Bx x={414} y={104} w={160} h={76} lines={["APP API", "LISTENS :3000"]} />

    {/* localhost exchange */}
    <Arrow pts={[[366, 134], [414, 134]]} color={I} />
    <Arrow pts={[[414, 150], [366, 150]]} color={I} />
    <L x={390} y={126} cls="fb" bg>localhost</L>

    <Bx x={206} y={214} w={150} h={42} dash lines={["INFRA (PAUSE)", "HOLDS NAMESPACES"]} />
    <L x={380} y={240} anchor="start" cls="fs">ONE IP ADDRESS FOR THE WHOLE POD</L>

    {/* client in */}
    <Bx x={32} y={116} w={104} h={52} lines={["CLIENT", "curl :8080"]} />
    <Arrow pts={[[136, 142], [206, 142]]} color={P} w={1.8} />
    <L x={171} y={132} cls="fps" bg>-p 8080:80</L>

    {/* kube out */}
    <Arrow pts={[[590, 142], [616, 142]]} color={P} w={1.8} />
    <Bx x={616} y={104} w={114} h={76} lines={["POD.YAML", "K8S SPEC"]} dash />
    <L x={673} y={200} cls="fs">podman generate kube</L>
    <L x={673} y={214} cls="fs">podman play kube</L>

    <L x={44} y={318} anchor="start" cls="fs">containers in a pod reach each other on localhost · the pod is the smallest unit kubernetes deploys</L>
  </>);
}
