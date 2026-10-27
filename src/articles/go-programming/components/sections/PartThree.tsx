import {
  Section,
  Figure,
  CodeBlock,
  TerminalBlock,
  Note,
  P,
  K,
  InlineList,
} from "../Dossier";
import { FigInterface } from "../diagrams/DiagramsB";
import { FigErrors } from "../diagrams/DiagramsB";
import { FigGMP } from "../diagrams/DiagramsB";
import { FigChannel } from "../diagrams/DiagramsB";
import SPEAKER from "../../listings/speaker.go?highlight";
import GENERICS from "../../listings/generics.go?highlight";
import ERRORS from "../../listings/errors.go?highlight";
import PARSE_ERROR from "../../listings/parse_error.go?highlight";
import CONCURRENCY from "../../listings/concurrency.go?highlight";
import CONTEXT from "../../listings/context.go?highlight";
import FUNCS_TEST from "../../listings/funcs_test.go?highlight";

export function PartThree() {
  return (
    <>
      {/* ---------------------------------------------------------- */}
      <Section
        id="s07"
        no="07"
        title="INTERFACES & GENERICS"
        brief="IMPLICIT SATISFACTION, TYPE PARAMETERS"
      >
        <P>
          An interface declares a method set and nothing else. There is no{" "}
          <K>implements</K> keyword: any type whose method set contains the
          interface's methods <em>is</em> that interface, automatically.
          Satisfaction is structural — decided at compile time by shape, not
          by declaration. This is Go's quiet superpower: you can define an
          interface for types you don't own.
        </P>
        <CodeBlock
          exhibit="EXHIBIT H"
          file="SPEAKER.GO"
          listing={SPEAKER}
        />
        <Figure
          fig="05"
          title="STRUCTURAL TYPING — SATISFACTION BY SHAPE"
          note="METHODS MATCHED BY NAME + SIGNATURE"
        >
          <FigInterface />
        </Figure>
        <Note label="FIELD NOTE — SMALL INTERFACES WIN">
          The standard library is built on one- and two-method interfaces:{" "}
          <strong>io.Reader</strong>, <strong>io.Writer</strong>,{" "}
          <strong>fmt.Stringer</strong>, and <strong>error</strong> itself.
          As Rob Pike put it: the bigger the interface, the weaker the
          abstraction. Define small, accept interfaces, return concrete types.
        </Note>
        <P>
          The empty interface <K>any</K> (alias for <K>interface{"{}"}</K>)
          is satisfied by everything — use it sparingly. Narrow values back
          with a type assertion <K>v := x.(T)</K> or a type switch when one
          value may be several things.
        </P>
        <P>
          Interfaces abstract over behavior. <strong>Generics</strong>, added
          in Go 1.18, abstract over types: a function or type takes{" "}
          <strong>type parameters</strong> in square brackets, each limited by
          a constraint. The constraint is itself an interface — <K>any</K>{" "}
          for every type, <K>comparable</K> for types that support{" "}
          <K>==</K>, <K>cmp.Ordered</K> for types that support <K>&lt;</K>.
        </P>
        <CodeBlock
          exhibit="EXHIBIT I"
          file="GENERICS.GO"
          listing={GENERICS}
        />
        <Note label="FIELD NOTE — GENERICS OR INTERFACES?">
          Use an interface when values of different types must behave alike
          at run time. Use a type parameter when the same code works on many
          types and must keep the exact type — containers, <K>Max</K>,{" "}
          <K>Map</K>, <K>Filter</K>. The standard library's <K>slices</K> and{" "}
          <K>maps</K> packages are generic; start there before writing your
          own.
        </Note>
      </Section>

      {/* ---------------------------------------------------------- */}
      <Section
        id="s08"
        no="08"
        title="ERRORS"
        brief="VALUES, NOT EXCEPTIONS"
      >
        <P>
          Go has no exceptions. <K>error</K> is a built-in interface with a
          single method — <K>Error() string</K> — and failures are returned
          as ordinary values, checked on the line below the call. You will
          write <K>if err != nil</K> thousands of times. This is not
          boilerplate to escape; it is the language forcing the failure path
          to be designed, not discovered in production.
        </P>
        <CodeBlock
          exhibit="EXHIBIT J"
          file="ERRORS.GO"
          listing={ERRORS}
        />
        <Figure
          fig="06"
          title="ERROR PROPAGATION — CONTEXT ACCUMULATES UPWARD"
          note="ERRORS.IS / ERRORS.AS WALK THE CHAIN"
        >
          <FigErrors />
        </Figure>
        <P>
          <K>errors.Is</K> compares against a specific value, such as a
          sentinel. <K>errors.As</K> looks for an error of a given{" "}
          <em>type</em> anywhere in the chain and hands it back, fields
          included — the way to carry structured detail like a line number.
        </P>
        <CodeBlock
          exhibit="EXHIBIT K"
          file="PARSE_ERROR.GO"
          listing={PARSE_ERROR}
        />
        <Note label="FIELD NOTE — THE TYPED NIL TRAP">
          An interface value holds a type and a value. Return a nil{" "}
          <strong>*ParseError</strong> as an <strong>error</strong> and the
          interface is not nil — its type is set — so <K>err != nil</K> is
          true. When there is no error, return a literal <K>nil</K>.
        </Note>
        <Note label="FIELD NOTE — PANIC IS A LAST RESORT">
          <strong>panic</strong> unwinds the goroutine, running its deferred
          calls; unless a deferred <strong>recover</strong> stops it, it then
          crashes the whole program. It is for programmer errors and
          impossible states, not for expected failures. Missing files, bad input, timeouts — all of
          that is an <strong>error</strong>, returned calmly like any other
          result.
        </Note>
      </Section>

      {/* ---------------------------------------------------------- */}
      <Section
        id="s09"
        no="09"
        title="GOROUTINES & CHANNELS"
        brief="CONCURRENCY AS A LANGUAGE FEATURE"
      >
        <P>
          Precede any function call with <K>go</K> and it runs concurrently —
          a goroutine with its own ~2 KB stack, hundreds of thousands of them
          per process. The runtime multiplexes goroutines onto a small pool
          of OS threads: logical processors (<strong>P</strong>) run
          goroutines (<strong>G</strong>) on threads (<strong>M</strong>),
          stealing work when queues run dry. Blocking a thread doesn't block
          the program — the P migrates.
        </P>
        <Figure
          fig="07"
          title="THE G–M–P SCHEDULER"
          note="M:N THREADING, WORK-STEALING"
        >
          <FigGMP />
        </Figure>
        <P>
          Goroutines share memory, so Go gives you a discipline for talking
          between them: <strong>channels</strong> — typed conduits that carry
          values from a sending goroutine to a receiving one. On an
          unbuffered channel, a send waits until a receiver takes the value,
          so the two goroutines meet. On a buffered channel, a send waits only
          when the buffer is full, and a receive only when it is empty. The
          motto:{" "}
          <em>don't communicate by sharing memory; share memory by
          communicating.</em>
        </P>
        <Figure
          fig="08"
          title="BUFFERED CHANNEL — SEND LEFT, RECEIVE RIGHT"
          note="THE EMPTY SLOT IS THE SIGNAL"
        >
          <FigChannel />
        </Figure>
        <CodeBlock
          exhibit="EXHIBIT L"
          file="CONCURRENCY.GO"
          listing={CONCURRENCY}
        />
        <Note label="FIELD NOTE — CLOSING A CHANNEL">
          Only the sending side closes a channel, to say that no more values
          will come. A receive from a closed channel returns at once with the
          zero value; the two-value form <K>v, ok := &lt;-ch</K> sets{" "}
          <K>ok</K> to false. Sending on a closed channel panics.
        </Note>
        <P>
          Real programs must also <em>stop</em> work: a client hangs up, a
          deadline passes. <K>context.Context</K> carries that cancellation
          signal. Any function that can block takes a <K>ctx</K> as its first
          argument, and the standard library's HTTP requests and database
          calls all accept one. <K>select</K> waits on the work and on{" "}
          <K>ctx.Done()</K> at the same time.
        </P>
        <CodeBlock
          exhibit="EXHIBIT M"
          file="CONTEXT.GO"
          listing={CONTEXT}
        />
        <Note label="FIELD NOTE — THE RACE DETECTOR">
          If you must share memory, do it under <K>sync.Mutex</K> — and
          always run <K>go test -race</K>. The detector instruments actual
          execution and catches data races that code review cannot. It is
          standard equipment, not an optional extra.
        </Note>
      </Section>

      {/* ---------------------------------------------------------- */}
      <Section
        id="s10"
        no="10"
        title="TOOLING & NEXT STEPS"
        brief="THE TOOLCHAIN IS THE PRODUCT"
      >
        <P>
          Go ships as one toolchain with no package-manager archaeology.
          Formatting, testing, dependency management, vetting and docs are
          first-class commands — consistent across every Go codebase on
          earth. Learn these nine commands and you can navigate any repository
          in the ecosystem.
        </P>
        <TerminalBlock
          exhibit="EXHIBIT N"
          lines={[
            { text: "go mod init example.com/dossier       # declare a module" },
            { text: "go get github.com/google/uuid@latest  # add or upgrade one dependency" },
            { text: "go mod tidy                           # add missing, drop unused deps" },
            { text: "go build ./...                        # compile everything" },
            { text: "go test ./...                         # run all tests" },
            { text: "go test -race ./...                   # tests + race detector" },
            { text: "go vet ./...                          # static-analysis pass" },
            { text: "gofmt -w .                            # canonical formatting" },
            { text: "go doc net/http.Server                # docs, in your terminal" },
          ]}
        />
        <P>
          Testing is built in: files ending in <K>_test.go</K> sit beside the
          code they examine, and <K>go test</K> finds them. The idiomatic
          style is table-driven — cases as data, one loop, subtests via{" "}
          <K>t.Run</K>.
        </P>
        <CodeBlock
          exhibit="EXHIBIT O"
          file="FUNCS_TEST.GO"
          listing={FUNCS_TEST}
        />
        <InlineList
          items={[
            ["THE TOUR OF GO", "go.dev/tour — the interactive syntax primer. Do it in one sitting; it is the fastest on-ramp.", "https://go.dev/tour"],
            ["EFFECTIVE GO", "go.dev/doc/effective_go — the style document. Read it after the tour, then again a month later.", "https://go.dev/doc/effective_go"],
            ["THE SPEC", "go.dev/ref/spec — short enough to read whole. When in doubt, the spec settles it.", "https://go.dev/ref/spec"],
            ["STDLIB SOURCE", "pkg.go.dev/std — the standard library is exemplary Go. Read io, fmt, net/http.", "https://pkg.go.dev/std"],
            ["BUILD SOMETHING", "A CLI tool, then a JSON REST API with net/http, then a worker pool with channels. Ten sections can only take you to the trailhead."],
          ]}
        />
        <P>
          The language will take a week. The restraint — checking errors,
          keeping interfaces small, sharing memory by communicating — is the
          practice of a career. End of dossier.
        </P>
      </Section>
    </>
  );
}
