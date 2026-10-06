import { ArrowDown } from "lucide-react";
import { Figure, Note, P, PullQuote, Section, Sub } from "../components/chrome";
import { Reveal } from "../lib/reveal";
import { FigLayers, FigStacks } from "../components/figs";
import { GlossaryTable } from "../components/blocks";
import blueprint from "../assets/blueprint.jpg";

/* ============================ 00 — COVER ============================ */

export function Cover() {
  return (
    <div id="cover" className="flex min-h-[calc(100vh-4rem-var(--site-bar-h))] scroll-mt-[calc(var(--site-bar-h)+6rem)] flex-col justify-between pb-6 pt-12 md:pt-16">
      <div>
        <div className="flex items-baseline justify-between gap-4 border-b border-pd-ink/20 pb-3 text-[9px] uppercase tracking-[0.2em] text-pd-olive">
          <span>TECHNICAL DOSSIER // CONTAINER SYSTEMS // ENTRY LEVEL</span>
          <span className="whitespace-nowrap">ISSUE 001 — 10 SHEETS · 7 FIGS</span>
        </div>

        <div className="relative mt-12">
          <div className="absolute right-0 top-1 hidden rotate-[-6deg] border-2 border-pd-purple px-3 py-2 text-center text-[9px] font-bold uppercase leading-[1.8] tracking-[0.2em] text-pd-purple sm:block">
            FOR TRAINING USE
            <br />
            TLP: CLEAR
          </div>
          <h1 className="m-0">
            <span className="block text-[15vw] font-bold leading-[0.88] tracking-[-0.045em] md:text-[118px]">PODMAN</span>
            <span className="outline-text block text-[15vw] font-bold leading-[0.95] tracking-[-0.045em] md:text-[118px]">FROM ZERO.</span>
          </h1>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_280px]">
          <P className="max-w-[560px] text-[14px]">
            This dossier teaches containers from absolute zero — what they are, why every team ships
            with them, and how to drive <b>Podman</b>, the daemonless, rootless, security-first
            engine. Read the ten sheets in order; by the last one you will run, build, pod, and
            service-manage containers for real.
          </P>
          <div className="space-y-2 border border-pd-ink p-4 text-[10px] uppercase leading-[2] tracking-[0.14em]">
            <div className="flex justify-between border-b border-pd-ink/20 pb-1 text-pd-olive">
              <span>PREREQUISITES</span>
              <span className="text-pd-ink">A TERMINAL</span>
            </div>
            <div className="flex justify-between text-pd-olive">
              <span>READING TIME</span>
              <span className="text-pd-ink">±25 MIN</span>
            </div>
            <div className="flex justify-between text-pd-olive">
              <span>EXERCISES</span>
              <span className="text-pd-purple font-bold">8 FIELD TASKS</span>
            </div>
            <Barcode />
          </div>
        </div>
      </div>

      <div className="mt-14">
        <div className="grid grid-cols-2 gap-px border-2 border-pd-ink bg-pd-ink md:grid-cols-3 xl:grid-cols-6">
          {[
            ["DOCUMENT", "PDM-101 · REV C"],
            ["SUBJECT", "CONTAINER FUNDAMENTALS"],
            ["TOOLCHAIN", "PODMAN ≥ 4 · OCI"],
            ["HOST", "LINUX · MAC/WIN VIA VM"],
            ["LEVEL", "NO PREREQUISITES"],
            ["STATUS", "PUBLIC · TLP:CLEAR", true],
          ].map(([k, v, hot]) => (
            <div key={k as string} className="bg-pd-paper p-3.5">
              <div className="text-[8.5px] uppercase tracking-[0.22em] text-pd-olive">{k}</div>
              <div className={`mt-1.5 text-[10.5px] font-bold uppercase tracking-[0.06em] ${hot ? "text-pd-purple" : ""}`}>{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-end justify-between">
          <span className="text-[9px] uppercase tracking-[0.2em] text-pd-olive">SCROLL TO OPEN SHEET 01</span>
          <ArrowDown className="h-4 w-4 animate-bounce text-pd-purple" strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}

function Barcode() {
  const bars = [3, 1, 2, 1, 1, 4, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 4, 1, 1, 2, 1, 3];
  return (
    <svg viewBox="0 0 120 30" className="mt-2 h-7 w-full" aria-hidden="true">
      {bars.map((w, i) => {
        const x = bars.slice(0, i).reduce((a, b) => a + b, 0) * 3 + i * 2;
        return <rect key={i} x={x} y={0} width={w * 2.2} height={30} fill="#11140f" />;
      })}
    </svg>
  );
}

/* ======================= 01 — WHY CONTAINERS ======================= */

export function S01() {
  return (
    <Section id="s01" no="01" kicker="SEC. 01 — CONTEXT" title="Why Containers">
      <Reveal>
        <div className="grid gap-10 md:grid-cols-[1fr_230px]">
          <div className="space-y-5">
            <P>
              The oldest line in software is <b>“it works on my machine.”</b> Your program is never
              just your code — it is your code plus a language runtime, system libraries, CA
              certificates, fonts, environment variables, and OS settings. The moment any of those
              drift between your laptop and a server, production becomes a casino.
            </P>
            <P>
              In 1956, shipping had the same disease: every crate was a different shape, and ports
              were chaos. Malcom McLean’s fix was a <b>standard steel box</b> — seal it at the
              factory, and every crane, truck, and ship on Earth can handle it without caring
              what’s inside. A container image is that box for software: code, runtime, and
              dependencies sealed into one portable unit that any Linux host runs identically.
            </P>
            <P>
              That is the entire promise: <b>build the box once, run it anywhere, get the same
              behavior every time.</b> Everything else in this dossier is mechanics.
            </P>
          </div>
          <div className="space-y-6">
            <Note label="FIELD NOTE — DRIFT">
              <p>
                Laptop: Python 3.12, OpenSSL 3.2. Server: Python 3.10, OpenSSL 1.1. Your code never
                changed — the floor it stands on did. Containers ship the floor.
              </p>
            </Note>
            <Note label="WHAT GOES IN THE BOX">
              <p>Your code · the runtime · system libraries · default config. Everything above the kernel, nothing of the kernel itself.</p>
            </Note>
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <Figure no="01" title="The standard box — one artifact, any host" note="DWG SC-20-001">
          <img src={blueprint} alt="Technical blueprint of a standard shipping container" className="block h-auto w-full" />
        </Figure>
      </Reveal>
    </Section>
  );
}

/* ====================== 02 — THE MENTAL MODEL ====================== */

const NS = [
  ["PID", "ITS OWN PROCESS TREE"],
  ["NET", "ITS OWN IP + PORTS"],
  ["MNT", "ITS OWN FILESYSTEM VIEW"],
  ["UTS", "ITS OWN HOSTNAME"],
  ["IPC", "PRIVATE SHARED MEMORY"],
  ["USER", "HARMLESS FAKE ROOT", true],
] as const;

export function S02() {
  return (
    <Section id="s02" no="02" kicker="SEC. 02 — DEFINITION" title="The Mental Model">
      <Reveal>
        <PullQuote mark="DEF.">
          “A container is not a small virtual machine. It is an ordinary Linux process whose view
          of the world has been fenced off.”
        </PullQuote>
      </Reveal>

      <Reveal delay={60}>
        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_230px]">
          <div className="space-y-5">
            <P>
              The fencing is done by two Linux kernel features. <b>Namespaces</b> decide what a
              process can <i>see</i> — its own processes, network, filesystem, hostname.{" "}
              <b>Control groups (cgroups)</b> decide what it can <i>use</i> — rations of CPU,
              memory, and disk I/O. Stack a few namespaces around a normal process and it believes
              it has a private machine. It does not: there is exactly one kernel on the box,
              shared by everything.
            </P>
            <P>
              That is why containers start in milliseconds and weigh megabytes. Nothing virtualizes
              hardware; nothing boots a second operating system. Compare the two approaches below —
              virtual machines emulate the <i>machine</i>, containers merely isolate the <i>process</i>.
            </P>
            <Sub>THE FENCE, PIECE BY PIECE</Sub>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {NS.map(([k, v, hot]) => (
                <div key={k} className={`border px-3 py-2.5 ${hot ? "border-pd-purple" : "border-pd-ink"}`}>
                  <div className={`text-[11px] font-bold tracking-[0.12em] ${hot ? "text-pd-purple" : ""}`}>{k}</div>
                  <div className="mt-1 text-[8.5px] uppercase tracking-[0.14em] text-pd-olive">{v}</div>
                </div>
              ))}
              <div className="col-span-2 border border-pd-ink bg-pd-ink px-3 py-2.5 text-pd-paper sm:col-span-1">
                <div className="text-[11px] font-bold tracking-[0.12em]">CGROUPS</div>
                <div className="mt-1 text-[8.5px] uppercase tracking-[0.14em] text-pd-paper/60">RATIONS CPU · MEM · I/O</div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <Note label="NAMESPACES VS CGROUPS">
              <p>
                Namespaces = <b>what you can see.</b> Cgroups = <b>what you can spend.</b> Isolation
                is the first, quotas are the second.
              </p>
            </Note>
            <Note label="MAC / WINDOWS">
              <p>
                Containers are a Linux feature. On macOS or Windows, <b>podman machine</b> runs one
                tiny Fedora VM purely to lend you a kernel — the container inside is still just a
                process.
              </p>
            </Note>
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <Figure no="02" title="Virtual machines emulate hardware; containers share one kernel" note="SHEET 02 / DETAIL A">
          <FigStacks />
        </Figure>
      </Reveal>
    </Section>
  );
}

/* ====================== 03 — CORE VOCABULARY ======================= */

export function S03() {
  return (
    <Section id="s03" no="03" kicker="SEC. 03 — TERMINOLOGY" title="Core Vocabulary">
      <Reveal>
        <P className="max-w-[620px]">
          Eight words cover ninety percent of the container world. Learn them precisely now and
          every tutorial, error message, and man page gets easier.
        </P>
        <div className="mt-8">
          <GlossaryTable
            rows={[
              ["IMAGE", "A read-only, versioned template holding code + dependencies. Built once, copied everywhere. A photograph, not a living thing."],
              ["CONTAINER", "A live instance of an image: real processes running inside namespaces, with a thin writable layer on top."],
              ["CONTAINERFILE", "The build recipe for an image. Literally the same format as a Dockerfile — Podman reads both, identically."],
              ["REGISTRY", "An image warehouse over HTTP: docker.io, quay.io, ghcr.io, or your company's own. You push and pull images to/from it."],
              ["TAG", "A human label pinned to an image — app:1.4.2. ':latest' is just a tag; nothing guarantees it is latest."],
              ["OCI", "The Open Container Initiative — the open standard for image format and runtime behavior that all these tools share."],
              ["ENGINE", "The software that pulls, stores, and runs images. Podman is one; Docker and containerd are others. Fully interchangeable images."],
              ["HOST", "The machine whose single kernel every container on it shares."],
            ]}
          />
        </div>
      </Reveal>

      <Reveal delay={60}>
        <Figure no="03" title="Images are stacked read-only layers; containers add a thin writable top" note="OVERLAYFS">
          <FigLayers />
        </Figure>
      </Reveal>

      <Reveal delay={60}>
        <div className="grid gap-8 md:grid-cols-2">
          <Note label="MEMORY HOOK">
            <p>
              IMAGE : CONTAINER :: class : instance :: blueprint : building. You may run five
              containers from one image; they share the read-only layers and each gets a private
              scratch pad on top.
            </p>
          </Note>
          <Note label="WHERE IMAGES LIVE">
            <p>
              Root: <b>/var/lib/containers</b>. Rootless (you): <b>~/.local/share/containers</b>.
              Inspect with <b>podman system info</b>.
            </p>
          </Note>
        </div>
      </Reveal>
    </Section>
  );
}
