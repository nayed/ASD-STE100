import { useState } from "react";
import { Check } from "lucide-react";
import { Code, Figure, Note, P, Section, Sub } from "../components/chrome";
import { Reveal } from "../lib/reveal";
import { FigPod } from "../components/figs";
import { GlossaryTable, Term } from "../components/blocks";

/* ====================== 07 — PODS, THE NAMESAKE ====================== */

export function S07() {
  return (
    <Section id="s07" no="07" kicker="SEC. 07 — THE POD" title="Pods — the Namesake">
      <Reveal>
        <div className="grid gap-10 md:grid-cols-[1fr_230px]">
          <div className="space-y-5">
            <P>
              A <b>pod</b> is a group of containers that travel together: they share one network
              namespace — <b>one IP address, one localhost</b> — and optionally one IPC namespace.
              A web server and its API in one pod can talk to each other at{" "}
              <Code>localhost:3000</Code>, while the outside world only sees the port you
              explicitly publish. The name isn’t decoration: <b>podman = pod manager.</b>
            </P>
            <P>
              The pod is borrowed straight from Kubernetes, where it is the smallest deployable
              unit. That symmetry is the punchline: prototype the pod on your laptop, then{" "}
              <Code>podman generate kube</Code> emits the YAML a cluster consumes —{" "}
              <b>same topology, no rewrite.</b>
            </P>
          </div>
          <Note label="THE INFRA CONTAINER">
            <p>
              Every pod quietly contains a tiny paused process (the infra container) whose only
              job is holding the shared namespaces open — even when your app containers restart.
              Spot it with <Code>podman ps --pod</Code>.
            </p>
          </Note>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <Figure no="07" title="Two containers, one network identity, a straight line to Kubernetes" note="SHEET 07 / DETAIL A">
          <FigPod />
        </Figure>
      </Reveal>

      <Reveal delay={40}>
        <Term
          title="OPS.LOG — A POD IN SIX VERBS"
          right="SHEET 07"
          lines={[
            { t: "podman pod create --name webpod -p 8080:80", c: "cmd" },
            { t: "# ports are published at the POD level — one shared network", c: "com" },
            { t: "podman run -d --pod webpod --name web docker.io/library/nginx", c: "cmd" },
            { t: "podman run -d --pod webpod --name api localhost/myapi:v1", c: "cmd" },
            { t: "# nginx now proxies to http://localhost:3000 — no network setup", c: "com" },
            { t: "podman pod ps", c: "cmd" },
            { t: "POD ID       NAME    STATUS   # OF CONTAINERS   INFRA ID", c: "out" },
            { t: "3b7ac91e02f4  webpod  Running  3                 8d1f04aa20c9", c: "out" },
            { t: "podman generate kube webpod > webpod.yaml", c: "cmd" },
            { t: "# and the cluster plays it back:", c: "com" },
            { t: "podman play kube webpod.yaml", c: "cmd" },
          ]}
        />
      </Reveal>
    </Section>
  );
}

/* ====================== 08 — BUILDING IMAGES ======================= */

export function S08() {
  return (
    <Section id="s08" no="08" kicker="SEC. 08 — THE RECIPE" title="Building Images">
      <Reveal>
        <div className="grid gap-10 md:grid-cols-[1fr_230px]">
          <div className="space-y-5">
            <P>
              A <b>Containerfile</b> (a Dockerfile by another name — Podman treats them as{" "}
              <i>exact</i> synonyms) is a deterministic recipe. Each instruction stamps one
              read-only layer, and unchanged instructions are <b>cached</b>: order them from
              least-changing to most-changing so code edits rebuild in seconds.
            </P>
            <P>
              Base images come straight from registries — you stand on an official, maintained
              floor instead of cloning your laptop.
            </P>
          </div>
          <Note label="NAME PARTS">
            <p>
              <b>registry / namespace / name : tag</b> →{" "}
              <b>quay.io/team/api:1.4.2</b>. Unpushed local work conventionally lives under{" "}
              <b>localhost/</b>.
            </p>
          </Note>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <Term
          title="FILE — Containerfile"
          right="7 INSTRUCTIONS"
          lines={[
            { t: "# ── base layer: an official, pinned runtime floor", c: "com" },
            { t: "FROM docker.io/library/python:3.12-slim", c: "kw" },
            { t: "", c: "dim" },
            { t: "WORKDIR /app", c: "kw" },
            { t: "", c: "dim" },
            { t: "# ── deps before code: cached until requirements.txt changes", c: "com" },
            { t: "COPY requirements.txt .", c: "kw" },
            { t: "RUN pip install --no-cache-dir -r requirements.txt", c: "kw" },
            { t: "", c: "dim" },
            { t: "# ── code lands last, so edits rebuild in seconds", c: "com" },
            { t: "COPY . .", c: "kw" },
            { t: "EXPOSE 3000", c: "kw" },
            { t: 'CMD ["python", "server.py"]', c: "kw" },
          ]}
        />
      </Reveal>

      <Reveal delay={40}>
        <Term
          title="OPS.LOG — STAMP THE LAYERS"
          right="SHEET 08"
          lines={[
            { t: "podman build -t localhost/myapi:v1 .", c: "cmd" },
            { t: "STEP 1/7 : FROM docker.io/library/python:3.12-slim", c: "out" },
            { t: "STEP 6/7 : COPY . .            --> using cache off, 2.1s", c: "out" },
            { t: "COMMIT localhost/myapi:v1      --> 4de8b1c9a0f2", c: "out" },
            { t: "podman run -d -p 3000:3000 localhost/myapi:v1", c: "cmd" },
            { t: "# build layers are content-addressed — edits only rebuild what changed", c: "com" },
          ]}
        />
      </Reveal>

      <Reveal delay={40}>
        <Note label="HYGIENE" >
          <p>
            Add a <b>.containerignore</b> file (same syntax as .gitignore) so .git, node_modules,
            and secrets never leak into the build context — or into the image.
          </p>
        </Note>
      </Reveal>
    </Section>
  );
}

/* ===================== 09 — KEEPING IT RUNNING ===================== */

export function S09() {
  return (
    <Section id="s09" no="09" kicker="SEC. 09 — OPERATIONS" title="Keeping It Running">
      <Reveal>
        <div className="grid gap-10 md:grid-cols-[1fr_230px]">
          <div className="space-y-5">
            <P>
              A service that needs a human to restart it isn’t a service. Because Podman is
              daemonless, containers plug straight into <b>systemd</b> — Linux’s process manager —
              via <b>Quadlets</b>: plain unit files that describe the container and let systemd do
              the supervising.
            </P>
            <P>
              Drop one file in <Code>~/.config/containers/systemd/</Code>, reload, start. systemd
              boots it, restarts it, orders it against other services, and captures logs in the
              journal. And since it’s <Code>--user</Code>, all of this happens without root.
            </P>
          </div>
          <Note label="AUTO-UPDATES">
            <p>
              Tag a container with <Code>io.containers.autoupdate=registry</Code> and{" "}
              <Code>podman auto-update</Code> pulls the new image, restarts the unit, and rolls
              back automatically if the health check fails.
            </p>
          </Note>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Term
            title="FILE — web.container"
            right="QUADLET"
            lines={[
              { t: "# ~/.config/containers/systemd/web.container", c: "com" },
              { t: "[Unit]", c: "sec" },
              { t: "Description=Training web server", c: "out" },
              { t: "", c: "dim" },
              { t: "[Container]", c: "sec" },
              { t: "Image=docker.io/library/nginx:latest", c: "out" },
              { t: "PublishPort=8080:80", c: "out" },
              { t: "", c: "dim" },
              { t: "[Service]", c: "sec" },
              { t: "Restart=always", c: "out" },
              { t: "", c: "dim" },
              { t: "[Install]", c: "sec" },
              { t: "WantedBy=default.target", c: "out" },
            ]}
          />
          <Term
            title="OPS.LOG — HAND IT TO SYSTEMD"
            right="SHEET 09"
            lines={[
              { t: "systemctl --user daemon-reload", c: "cmd" },
              { t: "systemctl --user start --now web", c: "cmd" },
              { t: "systemctl --user status web", c: "cmd" },
              { t: "● web.service — Training web server — active (running)", c: "out" },
              { t: "loginctl enable-linger $USER", c: "cmd" },
              { t: "# survive logout + reboots", c: "com" },
              { t: "journalctl --user -u web -f", c: "cmd" },
              { t: "# logs live in the journal, not in a stray file", c: "com" },
            ]}
          />
        </div>
      </Reveal>
    </Section>
  );
}

/* ====================== 10 — FIELD CHECKLIST ======================= */

const TASKS: [string, string][] = [
  ["Run a detached nginx on :8080 and serve it to curl", "CORE"],
  ["Read its logs, then open a shell inside with podman exec -it web sh", "CORE"],
  ["Stop it, remove it, and reclaim the image + disk (rm, rmi, system prune)", "CORE"],
  ["Explain image vs container out loud without once saying “VM”", "CORE"],
  ["Write a Containerfile; rebuild in seconds after a one-line code edit", "CORE"],
  ["Put two containers in a pod and reach one from the other via localhost", "STRETCH"],
  ["Run the whole day rootless; prove the UID map with podman top", "STRETCH"],
  ["Ship it as a Quadlet, enable linger, and survive a reboot", "STRETCH"],
];

export function S10() {
  const [done, setDone] = useState<boolean[]>(() => TASKS.map(() => false));
  const count = done.filter(Boolean).length;

  return (
    <Section id="s10" no="10" kicker="SEC. 10 — VERIFICATION" title="Field Checklist">
      <Reveal>
        <P className="max-w-[620px]">
          Knowledge is certified by doing. Click each square as you complete the task on a real
          machine — when all eight are marked, you officially know the basics of Podman.
        </P>

        <div className="mt-8 border-2 border-pd-ink">
          <div className="flex items-center justify-between border-b-2 border-pd-ink bg-pd-ink px-4 py-2.5 text-pd-paper">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em]">Trainee performance record</span>
            <span className="text-[10px] uppercase tracking-[0.18em]">
              <span className="text-pd-purple font-bold">{count}</span> / {TASKS.length} verified
            </span>
          </div>
          <div className="h-[3px] bg-pd-ink/10">
            <div className="h-full bg-pd-purple transition-all duration-300" style={{ width: `${(count / TASKS.length) * 100}%` }} />
          </div>
          <ul>
            {TASKS.map(([task, tag], i) => (
              <li key={task} className={i === TASKS.length - 1 ? "" : "border-b border-pd-ink/10"}>
                <button
                  onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
                  className={`group flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-pd-ink/[0.03] ${
                    done[i] ? "bg-pd-ink/[0.025]" : ""
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors ${
                      done[i] ? "border-pd-purple bg-pd-purple" : "border-pd-ink group-hover:border-pd-purple"
                    }`}
                  >
                    {done[i] && <Check className="h-3.5 w-3.5 text-pd-paper" strokeWidth={3.2} />}
                  </span>
                  <span className={`flex-1 text-[12px] leading-[1.7] ${done[i] ? "text-pd-ink/40 line-through" : "text-pd-ink/85"}`}>
                    {task}
                  </span>
                  <span
                    className={`text-[8.5px] font-bold uppercase tracking-[0.2em] ${
                      tag === "STRETCH" ? "text-pd-purple" : "text-pd-olive"
                    }`}
                  >
                    {tag}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal delay={50}>
        <Sub className="mb-4 mt-14">FURTHER READING — DECLASSIFY THESE NEXT</Sub>
        <GlossaryTable
          rows={[
            ["docs.podman.io", "The official documentation and tutorials — start with 'Basic Setup and Use'."],
            ["podman-desktop.io", "The graphical cockpit: images, pods, registries, and Kubernetes in one window."],
            ["quay.io", "A public registry to push your first image to (docker.io works too)."],
            ["github.com/containers/podman", "The source, the issue tracker, and the community around the engine."],
            ["developers.redhat.com", "Free labs: 'Deploying containers with Podman' and rootless deep dives."],
          ]}
        />
      </Reveal>

      <Reveal delay={60}>
        <div className="my-14 border-2 border-pd-ink p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-pd-ink" />
            <span className="text-[10px] font-bold uppercase tracking-[0.26em]">Certification of completion</span>
            <div className="h-px flex-1 bg-pd-ink" />
          </div>
          <p className="mx-auto mt-5 max-w-[520px] text-center text-[11.5px] leading-[1.9] text-pd-ink/70">
            The trainee named below has completed sheets 01–10 of dossier PDM-101 and is cleared to
            run, build, pod, and service-manage containers with Podman.
          </p>
          <div className="relative mx-auto mt-8 grid max-w-[560px] gap-8 sm:grid-cols-3">
            <div className="absolute -right-4 -top-10 rotate-[8deg] border-2 border-pd-purple px-2 py-1 text-[8.5px] font-bold uppercase tracking-[0.2em] text-pd-purple">
              REVIEWED · PDM-101
            </div>
            {["TRAINEE", "DATE", "REVIEWER"].map((k) => (
              <div key={k}>
                <div className="border-b border-pd-ink pb-2 text-[13px] tracking-[0.3em] text-pd-ink/20">
                  {k === "TRAINEE" ? "＿＿＿＿＿＿＿＿" : "＿＿＿＿＿"}
                </div>
                <div className="mt-1.5 text-[8.5px] uppercase tracking-[0.22em] text-pd-olive">{k}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ============================ FOOTER ============================== */

export function Footer() {
  return (
    <footer className="mt-28 bg-pd-ink text-pd-paper">
      <div className="mx-auto max-w-[900px] px-5 py-14 md:px-10">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-pd-purple">Colophon</div>
            <p className="mt-3 text-[11px] leading-[1.9] text-pd-paper/60">
              Set in IBM Plex Mono. Figures are hand-drafted vector plates; Fig. 01 is an original
              technical illustration. Flat black on paper-white, olive-gray construction strokes,
              one violet reserved for markings.
            </p>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-pd-purple">Sources</div>
            <p className="mt-3 text-[11px] leading-[1.9] text-pd-paper/60">
              podman.io · docs.podman.io · OCI image + runtime specifications · conmon(8),
              podman(1), containers.conf(5) man pages. Verify everything against your own man
              pages — versions move fast.
            </p>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-pd-purple">Control</div>
            <p className="mt-3 text-[11px] leading-[1.9] text-pd-paper/60">
              DOC PDM-101 · REV C · 10 SHEETS · 7 FIGURES
              <br />
              DISTRIBUTION STATEMENT A — UNLIMITED
              <br />
              TLP: CLEAR
            </p>
          </div>
        </div>
        <div className="mt-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-pd-paper/25" />
          <span className="text-[9px] uppercase tracking-[0.28em] text-pd-paper/50">END OF DOCUMENT — NOTHING FOLLOWS</span>
          <span className="inline-block h-2 w-2 bg-pd-purple" />
          <div className="h-px flex-1 bg-pd-paper/25" />
        </div>
      </div>
    </footer>
  );
}
