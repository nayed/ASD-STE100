import { Code, Figure, Note, P, Section } from "../components/chrome";
import { Reveal } from "../lib/reveal";
import { FigData } from "../components/figs";
import { Term } from "../components/blocks";

/* ======================== 07 — KEEPING DATA ======================== */

export function S07() {
  return (
    <Section id="s07" no="07" kicker="SEC. 07 — STORAGE" title="Keeping Data">
      <Reveal>
        <div className="grid gap-10 md:grid-cols-[1fr_230px]">
          <div className="space-y-5">
            <P>
              A container’s writable layer is scratch paper. Everything a process writes there
              disappears with <Code>podman rm</Code> — and containers are meant to be deleted and
              recreated all day. <b>Data that must outlive the container lives outside it</b>,
              mounted in at a path the process already uses.
            </P>
            <P>
              A <b>named volume</b> (<Code>-v pgdata:/var/lib/postgresql/data</Code>) is storage
              that Podman creates and manages: it survives <Code>rm</Code>, the next container
              mounts it again, and <Code>podman volume ls</Code> lists it. A <b>bind mount</b>{" "}
              (<Code>-v ./src:/app</Code>) maps a folder you already own into the container —
              the development favourite, because an edit on the host shows up inside at once.
            </P>
          </div>
          <Note label="SELINUX — THE :Z SUFFIX">
            <p>
              On Fedora, RHEL and other SELinux hosts, a bind mount gives “permission denied” until
              you add <b>:Z</b> (private to this container) or <b>:z</b> (shared by several).
              Podman relabels the folder so the container may read it.
            </p>
          </Note>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <Figure no="07" title="Volumes and bind mounts outlive the container; the writable layer does not" note="SHEET 07 / DETAIL A">
          <FigData />
        </Figure>
      </Reveal>

      <Reveal delay={40}>
        <Term
          title="OPS.LOG — DATA THAT SURVIVES"
          right="SHEET 07"
          lines={[
            { t: "podman volume create pgdata", c: "cmd" },
            { t: "podman run -d --name db -e POSTGRES_PASSWORD=dev \\", c: "cmd" },
            { t: "    -v pgdata:/var/lib/postgresql/data docker.io/library/postgres:16", c: "out" },
            { t: "podman rm -f db", c: "cmd" },
            { t: "# the container is gone — the volume is not", c: "com" },
            { t: "podman volume ls", c: "cmd" },
            { t: "DRIVER      VOLUME NAME", c: "out" },
            { t: "local       pgdata", c: "out" },
            { t: "# a new container with the same -v finds every row where it was left", c: "com" },
            { t: "podman run -d --name site -p 8080:80 \\", c: "cmd" },
            { t: "    -v ./public:/usr/share/nginx/html:ro,Z docker.io/library/nginx", c: "out" },
            { t: "# edit ./public/index.html on the host, reload the browser — no rebuild", c: "com" },
          ]}
        />
      </Reveal>

      <Reveal delay={40}>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <Note label="FILE OWNERSHIP">
            <p>
              Files a rootless container writes into a bind mount belong to a sub-UID on the host
              (sheet 06). <Code>--userns=keep-id</Code> makes them yours.
            </p>
          </Note>
          <Note label="BACKUPS">
            <p>
              <Code>podman volume export pgdata &gt; pgdata.tar</Code> writes a volume to one file;{" "}
              <Code>podman volume import</Code> restores it. Stop the database first for a clean
              copy.
            </p>
          </Note>
        </div>
      </Reveal>
    </Section>
  );
}

/* ===================== 08 — NETWORKS & COMPOSE ===================== */

export function S08() {
  return (
    <Section id="s08" no="08" kicker="SEC. 08 — CONNECTING" title="Networks & Compose">
      <Reveal>
        <div className="grid gap-10 md:grid-cols-[1fr_230px]">
          <div className="space-y-5">
            <P>
              Containers on the default network reach the internet, but they cannot find each other
              by name. <b>Create a network and attach containers to it</b>: Podman runs a small DNS
              server on that network, so a container named <Code>db</Code> answers to{" "}
              <Code>db</Code> from every other container on it. No IP addresses to copy around.
            </P>
            <P>
              Typing those run commands by hand gets old by the third service. A{" "}
              <b>compose.yaml</b> describes the whole set — services, ports, volumes, networks —
              and <Code>podman compose up</Code> starts it in one command. Podman hands the file to
              a compose provider (docker-compose or podman-compose), so files written for Docker
              work unchanged.
            </P>
          </div>
          <Note label="THE DOCKER API">
            <p>
              <Code>systemctl --user enable --now podman.socket</Code> serves a Docker-compatible
              API on demand. Point <b>DOCKER_HOST</b> at it, and tools that expect Docker —
              Testcontainers, IDE plugins, docker-compose itself — drive Podman instead.
            </p>
          </Note>
        </div>
      </Reveal>

      <Reveal delay={40}>
        <Term
          title="OPS.LOG — CONTAINERS FIND EACH OTHER"
          right="SHEET 08"
          lines={[
            { t: "podman network create appnet", c: "cmd" },
            { t: "podman run -d --name db --network appnet -e POSTGRES_PASSWORD=dev \\", c: "cmd" },
            { t: "    docker.io/library/postgres:16", c: "out" },
            { t: "podman run --rm --network appnet docker.io/library/postgres:16 pg_isready -h db", c: "cmd" },
            { t: "db:5432 - accepting connections", c: "out" },
            { t: "# “db” resolved by the network’s DNS — the name is the address", c: "com" },
          ]}
        />
      </Reveal>

      <Reveal delay={60}>
        <div className="mt-8 grid gap-6">
          <Term
            title="FILE — compose.yaml"
            right="2 SERVICES"
            lines={[
              { t: "services:", c: "sec" },
              { t: "  db:" },
              { t: "    image: docker.io/library/postgres:16" },
              { t: "    environment:" },
              { t: "      POSTGRES_PASSWORD: dev" },
              { t: "    volumes:" },
              { t: "      - pgdata:/var/lib/postgresql/data" },
              { t: "  api:" },
              { t: "    image: localhost/myapi:v1   # built on sheet 10", c: "out" },
              { t: "    ports:" },
              { t: '      - "3000:3000"' },
              { t: "    depends_on: [db]" },
              { t: "", c: "dim" },
              { t: "volumes:", c: "sec" },
              { t: "  pgdata:" },
            ]}
          />
          <Term
            title="OPS.LOG — ONE COMMAND"
            right="SHEET 08"
            lines={[
              { t: "podman compose up -d", c: "cmd" },
              { t: "# creates a network, the volume, then db and api", c: "com" },
              { t: "podman compose ps", c: "cmd" },
              { t: "# api reaches the database at db:5432", c: "com" },
              { t: "podman compose logs -f api", c: "cmd" },
              { t: "podman compose down", c: "cmd" },
              { t: "# containers and network removed; pgdata stays", c: "com" },
            ]}
          />
        </div>
      </Reveal>

      <Reveal delay={40}>
        <div className="mt-8">
          <Note label="NETWORK OR POD?">
            <p>
              A network connects separate containers that talk by name. A pod (next sheet) goes
              further: its containers share one network identity and reach each other on localhost.
            </p>
          </Note>
        </div>
      </Reveal>
    </Section>
  );
}
