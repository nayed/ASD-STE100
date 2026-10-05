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
            ["COMPILED", "Source compiles to a single static binary. Drop it on a server — there is no VM, no interpreter, no runtime to install."],
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
          note="REF: GO.DEV/REF/CONN"
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
        brief="PACKAGE MAIN, IMPORTS, FUNC MAIN"
      >
        <P>
          Every executable Go program is a <K>package main</K> containing a{" "}
          <K>func main</K> — that is the entire contract. Dependencies are
          declared explicitly with <K>import</K>, and the compiler enforces
          hygiene: an unused import or variable is a compile error, not a
          warning. Dead weight cannot hide.
        </P>
        <CodeBlock
          exhibit="EXHIBIT A"
          file="HELLO.GO"
          code={`package main

import "fmt"

// the entry point — execution starts here
func main() {
\tfmt.Println("hello, dossier")
}`}
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
            { text: "dossier: ELF 64-bit executable, statically linked — no deps", out: true },
          ]}
        />
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
          declares with an explicit type (or none — the zero value is
          inferred). Crucially, Go has no uninitialized memory: every variable
          is born zeroed and immediately usable.
        </P>
        <CodeBlock
          exhibit="EXHIBIT C"
          file="VARS.GO"
          code={`package main

import "fmt"

func main() {
\t// var — explicit type, starts at its zero value (0)
\tvar counter int

\t// := — declare and infer, inside functions only
\tratio := 3.14
\tlang := "go"
\tok := true

\tcounter++
\tfmt.Println(counter, ratio, lang, ok)
\t// 1 3.14 go true
}`}
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
          zero, not a landmine. A nil slice can be appended to and ranged
          over. The zero value is a feature — types are designed so that
          "nothing there yet" still behaves.
        </Note>
        <P>
          Core types to know first: <K>int</K>, <K>float64</K>, <K>string</K>,{" "}
          <K>bool</K>; then <K>byte</K> and <K>rune</K> for raw bytes and
          Unicode code points; then the composites — arrays, slices, maps and
          structs — covered in §05 and §06.
        </P>
      </Section>
    </>
  );
}
