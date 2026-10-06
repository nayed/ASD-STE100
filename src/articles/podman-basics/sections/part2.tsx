import { Boxes, ShieldCheck, Unplug } from "lucide-react";
import { Code, Figure, Note, P, Section, Sub } from "../components/chrome";
import { Reveal } from "../lib/reveal";
import { FigDaemon, FigLoop, FigUid } from "../components/figs";
import { CmdTable, CompareTable, Term } from "../components/blocks";

/* ====================== 04 — THE COMMAND LOOP ====================== */

export function S04() {
  return (
    <Section id="s04" no="04" kicker="SEC. 04 — HANDS ON" title="The Command Loop">
      <Reveal>
        <div className="grid gap-10 md:grid-cols-[1fr_230px]">
          <div className="space-y-5">
            <P>
              Get the binary first: <Code>dnf install podman</Code> on Fedora/RHEL,{" "}
              <Code>apt install podman</Code> on Debian/Ubuntu, <Code>brew install podman</Code>{" "}
              on macOS (then <Code>podman machine init && podman machine start</Code> once). From
              here, your whole working life is four verbs: <b>pull, build, run, prune.</b>
            </P>
            <P>
              The first real session below downloads nginx, publishes it on port 8080, inspects it,
              and cleans up — no root password, no background service, nothing left behind.
            </P>
          </div>
          <Note label="ALREADY KNOW DOCKER?">
            <p>
              The CLI is intentionally a superset of Docker’s. <Code>alias docker=podman</Code>{" "}
              works, and most distributions ship a <b>podman-docker</b> package that wires the
              alias permanently. Same images, same flags, same Containerfiles.
            </p>
          </Note>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <Figure no="04" title="The four moves — write, build, fetch, run — iterated all day" note="SHEET 04 / FLOW">
          <FigLoop />
        </Figure>
      </Reveal>

      <Reveal delay={40}>
        <Term
          title="OPS.LOG — FIRST CONTACT"
          right="SHEET 04"
          lines={[
            { t: "podman run -d --name web -p 8080:80 docker.io/library/nginx", c: "cmd" },
            { t: "# resolved → pulled → signature-checked → started. one line.", c: "com" },
            { t: "9f2c0e1a7b31d5...", c: "out" },
            { t: "podman ps", c: "cmd" },
            { t: "CONTAINER ID  IMAGE                            STATUS        PORTS                   NAMES", c: "out" },
            { t: "9f2c0e1a7b31  docker.io/library/nginx:latest   Up 4 seconds  0.0.0.0:8080->80/tcp    web", c: "out" },
            { t: "curl -s localhost:8080 | head -n 2", c: "cmd" },
            { t: "<!DOCTYPE html>  <!-- Welcome to nginx! -->", c: "out" },
            { t: "podman logs --tail 1 web", c: "cmd" },
            { t: '172.17.0.1 - - "GET / HTTP/1.1" 200 615 "curl/8.0"', c: "out" },
            { t: "podman stop web && podman rm web", c: "cmd" },
            { t: "web", c: "out" },
            { t: "web", c: "out" },
          ]}
        />
      </Reveal>

      <Reveal delay={40}>
        <Sub className="mb-4 mt-12">THE TWELVE YOU WILL TYPE DAILY</Sub>
        <CmdTable
          rows={[
            ["podman pull", "Download an image from a registry into local storage", "--quiet"],
            ["podman images", "List every image cached on this host, with size + age", "--format (scripting)"],
            ["podman run", "Create + start a container from an image", "-d · -p · --name · --rm"],
            ["podman ps", "Show running containers", "-a  (include stopped)"],
            ["podman stop / start", "Send SIGTERM, or restart a stopped container as-is", "--time 10"],
            ["podman restart", "Stop + start in one move", "-"],
            ["podman logs", "Read whatever the process printed", "-f  (follow, like tail)"],
            ["podman exec", "Run a second command inside a live container", "-it web sh  (get a shell)"],
            ["podman rm", "Delete a stopped container and its writable layer", "-f  (force, running too)"],
            ["podman rmi", "Delete an image from local storage", "--all"],
            ["podman build", "Build an image from a Containerfile", "-t localhost/app:v1 ."],
            ["podman inspect", "Dump the full JSON spec of a container or image", "--format '{{.Config.Image}}'"],
          ]}
        />
      </Reveal>

      <Reveal delay={40}>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <Note label="FULLY QUALIFY NAMES">
            <p>
              Write <b>docker.io/library/nginx</b>, not bare <b>nginx</b>. Short names make Podman
              ask which registry you meant — explicit names are reproducible everywhere.
            </p>
          </Note>
          <Note label="DISK RECLAMATION">
            <p>
              Experiments pile up. <Code>podman system prune --all</Code> deletes stopped
              containers and unused images. Add <Code>--volumes</Code> when you want data gone too.
            </p>
          </Note>
        </div>
      </Reveal>
    </Section>
  );
}

/* ========================= 05 — WHY PODMAN ========================= */

const PILLARS = [
  {
    icon: Unplug,
    no: "PILLAR 01",
    title: "NO DAEMON",
    body: "Each command forks, does its job, and exits. There is no always-root background service to crash, lag, or get pwned.",
  },
  {
    icon: ShieldCheck,
    no: "PILLAR 02",
    title: "ROOTLESS BY DESIGN",
    body: "Containers run as your normal user. A process breaking out of its sandbox lands on an account with zero privileges.",
  },
  {
    icon: Boxes,
    no: "PILLAR 03",
    title: "PODS, NATIVELY",
    body: "Groups of containers sharing one network — the exact shape Kubernetes deploys — runnable on your laptop, YAML and all.",
  },
];

export function S05() {
  return (
    <Section id="s05" no="05" kicker="SEC. 05 — THE DIFFERENTIATOR" title="Why Podman">
      <Reveal>
        <P className="max-w-[640px]">
          Podman started at Red Hat in 2018 as an answer to a pointed question:{" "}
          <i>why should every container on Earth trust one giant root daemon?</i> It is a
          CNCF-graduated, Apache-2.0 project (the name: <b>pod man</b>ager), and it rests on three
          architectural choices.
        </P>
        <div className="mt-8 grid gap-px border-2 border-pd-ink bg-pd-ink sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.no} className="group bg-pd-paper p-5 transition-colors hover:bg-pd-ink">
              <div className="flex items-center justify-between">
                <p.icon className="h-5 w-5 text-pd-ink transition-colors group-hover:text-pd-purple" strokeWidth={1.8} />
                <span className="text-[8.5px] uppercase tracking-[0.22em] text-pd-olive transition-colors group-hover:text-pd-paper/50">
                  {p.no}
                </span>
              </div>
              <h3 className="mt-4 text-[13px] font-bold uppercase tracking-[0.1em] transition-colors group-hover:text-pd-paper">
                {p.title}
              </h3>
              <p className="mt-2 text-[11px] leading-[1.85] text-pd-ink/70 transition-colors group-hover:text-pd-paper/70">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={60}>
        <Figure no="05" title="The daemonless fork/exec model removes the privileged middleman" note="SHEET 05 / DETAIL A">
          <FigDaemon />
        </Figure>
      </Reveal>

      <Reveal delay={40}>
        <Sub className="mb-4">SIDE-BY-SIDE, HONESTLY</Sub>
        <CompareTable
          rows={[
            ["BACKGROUND SERVICE", "None — fork/exec per command, conmon babysits each container", "dockerd, an always-on system daemon"],
            ["PRIVILEGE DEFAULT", "Rootless-first; no root required anywhere for daily work", "Root daemon; rootless mode exists but is opt-in"],
            ["MULTI-CONTAINER UNIT", "Pods are first-class objects", "Single containers; grouping via Compose plugin"],
            ["KUBERNETES BRIDGE", "generate kube / play kube are built into the CLI", "Requires external tooling or plugins"],
            ["SERVICE MANAGEMENT", "systemd Quadlets — containers are native unit files", "--restart flags, daemon-level policies"],
            ["CLI COMPATIBILITY", "Drop-in: alias docker=podman", "The reference implementation"],
            ["IMAGE FORMAT", "OCI — runs everything Docker builds, and vice versa", "Same OCI standard"],
          ]}
        />
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <Note label="WHAT IS CONMON?">
            <p>
              A ~200-line C monitor spawned per container. It holds the PTY, forwards logs to
              journald, and records the exit code — so Podman itself is free to exit the moment
              your container starts.
            </p>
          </Note>
          <Note label="LOCKED LAPTOPS">
            <p>
              On corporate machines, rootless Podman needs no sudo, no daemon socket, no group
              membership — often the only container tool you are allowed to run.
            </p>
          </Note>
        </div>
      </Reveal>
    </Section>
  );
}

/* ======================= 06 — ROOTLESS BY DESIGN ======================= */

export function S06() {
  return (
    <Section id="s06" no="06" kicker="SEC. 06 — SECURITY MODEL" title="Rootless by Design">
      <Reveal>
        <div className="grid gap-10 md:grid-cols-[1fr_230px]">
          <div className="space-y-5">
            <P>
              In the Docker default, your shell talks to a root daemon; effectively{" "}
              <b>everything a container does is brokered by root</b>, and anyone who can talk to
              the daemon socket can mount the host disk and own the machine. Podman inverts the
              power structure. You run containers <b>as yourself</b>, and the kernel’s{" "}
              <b>user namespaces</b> perform a controlled lie: inside the container you are UID 0
              (root), outside you are UID 1000 (alex, who can’t even reboot the box).
            </P>
            <P>
              So if nginx inside your container gets hijacked tomorrow, the attacker inherits…
              your unprivileged account. No setuid binaries, no daemon attack surface, and every
              user on a shared server gets their own private container world. Rootless is the
              default posture, not a flag.
            </P>
          </div>
          <Note label="VERIFY IT YOURSELF">
            <p>
              Run <Code>podman top web user huser</Code> — the first column is the container-side
              UID, the second is what the host actually sees.
            </p>
          </Note>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <Figure no="06" title="A controlled identity lie — root inside, nobody outside" note="USER NS MAP">
          <FigUid />
        </Figure>
      </Reveal>

      <Reveal delay={40}>
        <div className="grid gap-8 md:grid-cols-3">
          <Note label="KEEP YOUR IDENTITY">
            <p>
              Bind-mounting files? <Code>--userns=keep-id</Code> maps <i>your</i> account into the
              container so file ownership behaves instead of root owning everything.
            </p>
          </Note>
          <Note label="PORTS UNDER 1024">
            <p>
              Unprivileged users can’t bind port 80. Develop on 8080, or lower the floor once:{" "}
              <Code>sysctl net.ipv4.ip_unprivileged_port_start=80</Code>.
            </p>
          </Note>
          <Note label="SURVIVING LOGOUT">
            <p>
              Rootless containers pause when you log out unless you run{" "}
              <Code>loginctl enable-linger $USER</Code> once. Sheet 09 uses this.
            </p>
          </Note>
        </div>
      </Reveal>
    </Section>
  );
}
