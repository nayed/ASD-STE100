import {
  Section,
  Figure,
  CodeBlock,
  TerminalBlock,
  Note,
  P,
  K,
  InlineList,
  DataTable,
} from "../Dossier";
import { FigPipeline, FigAnatomy } from "../diagrams/DiagramsA";
import HELLO from "../../listings/hello.go?theme=light-plus&highlight";
import VARS from "../../listings/vars.go?theme=light-plus&highlight";

export function PartOne() {
  return (
    <>
      {/* ---------------------------------------------------------- */}
      <Section
        id="s01"
        no="01"
        title="SUBJECT OVERVIEW"
        brief="WHAT GO IS, WHY IT EXISTS"
      >
        <P>
          Go — also <strong>golang</strong> — was designed inside Google in
          2007 by Robert Griesemer, Rob Pike and Ken Thompson, and released as
          open source in 2009. It was a reaction to a specific problem:
          building large, networked server software in languages that had
          accumulated twenty-five years of complexity. The authors wanted a
          language a competent engineer could learn in a week and still read
          confidently ten years later.
        </P>
        <P>
          It worked. Go now runs much of the cloud's plumbing: Docker,
          Kubernetes, Terraform, Prometheus, CockroachDB. The language is
          deliberately small — 25 keywords, one loop, no inheritance — and
          every feature was accepted only after simpler alternatives were
          rejected. Learning Go is less about absorbing features and more
          about internalizing its restraint.
        </P>
        <InlineList
          items={[
            ["COMPILED", "Source compiles to a single binary with the Go runtime — garbage collector, scheduler — built in. Drop it on a server: no VM, no interpreter, nothing to install."],
            ["FAST BUILDS", "The dependency model was designed for builds measured in seconds, even across millions of lines."],
            ["GARBAGE COLLECTED", "A low-latency collector manages memory. No malloc, no free, no ownership battles."],
            ["CONCURRENCY-FIRST", "Goroutines and channels are part of the language, not a library bolted on afterward."],
            ["OPINIONATED", "gofmt formats all Go code identically. Formatting debates are culturally extinct."],
          ]}
        />
        <Note label="FIELD NOTE — WHAT GO REFUSES">
          No classes, no inheritance, no exceptions, no ternary operator, no{" "}
          <strong>while</strong> keyword, no function overloading, no unused
          imports tolerated. Each omission is deliberate: less to argue about,
          less to misread, one obvious way to write things.
        </Note>
        <Figure
          fig="01"
          title="COMPILATION PIPELINE — SOURCE TO STATIC BINARY"
          note="THE LINKER BUNDLES THE RUNTIME"
        >
          <FigPipeline />
        </Figure>
        <P>
          Everything the compiler verifies happens before your program runs.
          Entire categories of failure — misspelled identifiers, wrong argument
          types, unused imports — are eliminated at build time, on your
          machine, in seconds.
        </P>
      </Section>

      {/* ---------------------------------------------------------- */}
      <Section
        id="s02"
        no="02"
        title="ANATOMY OF A PROGRAM"
        brief="PACKAGES, IMPORTS, EXPORTED NAMES"
      >
        <P>
          Every executable Go program is a <K>package main</K> containing a{" "}
          <K>func main</K> — that is the entire contract. Dependencies are
          declared explicitly with <K>import</K>, and the compiler enforces
          hygiene: an unused import or local variable is a compile error, not
          a warning. Dead weight cannot hide.
        </P>
        <CodeBlock
          exhibit="EXHIBIT A"
          file="HELLO.GO"
          listing={HELLO}
        />
        <Figure
          fig="02"
          title="PROGRAM STRUCTURE, ANNOTATED"
          note="COMPLETE COMPILABLE SPECIMEN"
        >
          <FigAnatomy />
        </Figure>
        <P>
          Two commands cover most of your working life: <K>go run</K> compiles
          to a temporary binary and executes it immediately; <K>go build</K>{" "}
          writes the artifact to disk. What you ship is that binary — nothing
          else.
        </P>
        <TerminalBlock
          exhibit="EXHIBIT B"
          lines={[
            { text: "go run hello.go" },
            { text: "hello, dossier", out: true },
            { text: "" },
            { text: "go build -o dossier hello.go" },
            { text: "./dossier" },
            { text: "hello, dossier", out: true },
            { text: "" },
            { text: "file dossier" },
            { text: "dossier: ELF 64-bit LSB executable, x86-64, statically linked, Go BuildID=…, not stripped", out: true },
          ]}
        />
        <P>
          Names carry their own visibility. An identifier that starts with a
          capital letter — <K>fmt.Println</K>, <K>http.Server</K> — is{" "}
          <strong>exported</strong>: other packages can use it. A lowercase
          name stays private to its package. There is no public, private or
          protected keyword; the first letter is the whole access system.
        </P>
        <Note label="FIELD NOTE — MODULES AND PACKAGES">
          A <strong>module</strong> is a project with a go.mod file at its
          root (<K>go mod init example.com/app</K>). Each folder inside it is
          one <strong>package</strong>, imported by its path:{" "}
          <K>example.com/app/store</K>. A folder named <K>internal/</K> can
          only be imported by code under the same parent — the compiler
          enforces it.
        </Note>
      </Section>

      {/* ---------------------------------------------------------- */}
      <Section
        id="s03"
        no="03"
        title="VARIABLES & TYPES"
        brief="STATIC TYPING, INFERENCE, ZERO VALUES"
      >
        <P>
          Go is statically typed: every value has a type fixed at compile
          time. The <K>:=</K> operator declares <em>and</em> infers in one
          stroke and is the idiomatic default inside functions; <K>var</K>{" "}
          either names a type and starts at its zero value (<K>var n int</K>)
          or takes its type from an initial value (<K>var n = 10</K>). Crucially, Go has no uninitialized memory: every variable
          is born zeroed and immediately usable.
        </P>
        <CodeBlock
          exhibit="EXHIBIT C"
          file="VARS.GO"
          listing={VARS}
        />
        <DataTable
          head={["TYPE", "ZERO VALUE", "FIELD NOTE"]}
          caption="TABLE 01 — EVERY TYPE HAS A USABLE ZERO"
          rows={[
            ["int, int64, float64", "0 / 0.0", "int is platform-sized; size it explicitly when it matters"],
            ["string", '""', "empty string — valid, comparable, iterable"],
            ["bool", "false", "no truthy/falsy coercion; conditions must be bool"],
            ["pointer, slice, map, chan, func, interface", "nil", "a nil slice/map is readable — len 0, safe to range"],
            ["struct", "all fields zeroed", "composite literals fill only what you specify"],
          ]}
        />
        <Note label="FIELD NOTE — NIL IS NOT NULL">
          Coming from other languages: Go's <strong>nil</strong> is a typed
          zero, and much of it is safe — a nil slice can be ranged over and
          appended to, and reading a nil map returns zero values. Two things
          still panic: <strong>writing to a nil map</strong> and{" "}
          <strong>dereferencing a nil pointer</strong>. Make a map before you
          write to it.
        </Note>
        <P>
          Core types to know first: <K>int</K>, <K>float64</K>, <K>string</K>,{" "}
          <K>bool</K>; then <K>byte</K> and <K>rune</K> for raw bytes and
          Unicode code points; then the composites — arrays, slices, maps and
          structs — covered in §05 and §06.
        </P>
        <Note label="FIELD NOTE — STRINGS ARE BYTES">
          A string is a read-only sequence of bytes, usually UTF-8.{" "}
          <K>len("é")</K> is 2, because é takes two bytes. A{" "}
          <K>for range</K> loop over a string decodes it instead, giving one{" "}
          <strong>rune</strong> (code point) per step.
        </Note>
      </Section>
    </>
  );
}
