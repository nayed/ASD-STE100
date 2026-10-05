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

export function PartThree() {
  return (
    <>
      {/* ---------------------------------------------------------- */}
      <Section
        id="s07"
        no="07"
        title="INTERFACES"
        brief="IMPLICIT SATISFACTION, SMALL CONTRACTS"
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
          code={`package main

import "fmt"

// the entire contract — one method
type Speaker interface {
	Speak() string
}

type Dog struct{}
type Robot struct{}

func (d Dog) Speak() string   { return "woof" }
func (r Robot) Speak() string { return "beep" }

// polymorphism without inheritance
func announce(s Speaker) {
	fmt.Println(s.Speak())
}

func main() {
	announce(Dog{})   // woof
	announce(Robot{}) // beep
}`}
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
          exhibit="EXHIBIT I"
          file="ERRORS.GO"
          code={`package main

import (
	"errors"
	"fmt"
	"os"
)

// a sentinel error — comparable, documented, stable
var ErrEmptyConfig = errors.New("empty config")

func loadConfig(path string) ([]byte, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		// wrap: add context, preserve the cause
		return nil, fmt.Errorf("load config: %w", err)
	}
	if len(data) == 0 {
		return nil, ErrEmptyConfig
	}
	return data, nil
}

func main() {
	cfg, err := loadConfig("config.toml")
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			fmt.Println("no config — using defaults")
			return
		}
		fmt.Println("fatal:", err)
		return
	}
	_ = cfg
}`}
        />
        <Figure
          fig="06"
          title="ERROR PROPAGATION — CONTEXT ACCUMULATES UPWARD"
          note="errors.IS / ERRORS.AS WALK THE CHAIN"
        >
          <FigErrors />
        </Figure>
        <Note label="FIELD NOTE — PANIC IS A LAST RESORT">
          <strong>panic</strong> crashes the goroutine and must be recovered
          explicitly; it is for programmer errors and impossible states, not
          for expected failures. Missing files, bad input, timeouts — all of
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
          between them: <strong>channels</strong> — typed conduits on which
          values flow in one direction. Send blocks until the buffer has
          room; receive blocks until a value arrives. The motto:{" "}
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
          exhibit="EXHIBIT J"
          file="CONCURRENCY.GO"
          code={`package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	var wg sync.WaitGroup           // wait for a set of goroutines
	results := make(chan string, 3) // buffered: senders never block

	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			time.Sleep(time.Millisecond) // simulate work
			results <- fmt.Sprintf("worker %d done", id)
		}(i)
	}

	wg.Wait()
	close(results)

	for msg := range results { // drains until closed
		fmt.Println(msg)
	}
}`}
        />
        <CodeBlock
          exhibit="EXHIBIT K"
          file="SELECT.GO"
          code={`// select waits on multiple channel operations at once
select {
case msg := <-news:
	fmt.Println(msg)
case <-time.After(time.Second):
	fmt.Println("timed out") // the timeout arm
}`}
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
          earth. Learn these ten verbs and you can navigate any repository
          in the ecosystem.
        </P>
        <TerminalBlock
          exhibit="EXHIBIT L"
          lines={[
            { text: "go mod init dossier      # declare a module" },
            { text: "go get ./...             # resolve dependencies" },
            { text: "go build ./...           # compile everything" },
            { text: "go test ./...            # run all tests" },
            { text: "go test -race ./...      # tests + race detector" },
            { text: "go vet ./...             # static-analysis pass" },
            { text: "gofmt -w .               # canonical formatting" },
            { text: "go doc http.Server       # docs, in your terminal" },
          ]}
        />
        <P>
          Testing is built in: files ending in <K>_test.go</K> sit beside the
          code they examine, and <K>go test</K> finds them. The idiomatic
          style is table-driven — cases as data, one loop, subtests via{" "}
          <K>t.Run</K>.
        </P>
        <CodeBlock
          exhibit="EXHIBIT M"
          file="FUNCS_TEST.GO"
          code={`func TestDivide(t *testing.T) {
	got, err := divide(10, 4)
	if err != nil || got != 2.5 {
		t.Fatalf("divide(10, 4) = %v, %v; want 2.5, nil", got, err)
	}
}`}
        />
        <InlineList
          items={[
            ["THE TOUR OF GO", "go.dev/tour — the interactive syntax primer. Do it in one sitting; it is the fastest on-ramp."],
            ["EFFECTIVE GO", "go.dev/doc/effective_go — the style document. Read it after the tour, then again a month later."],
            ["THE SPEC", "go.dev/ref/spec — short enough to read whole. When in doubt, the spec settles it."],
            ["STDLIB SOURCE", "pkg.go.dev/stdlib — the standard library is exemplary Go. Read io, fmt, net/http."],
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
