import {
  Section,
  Figure,
  CodeBlock,
  Note,
  P,
  K,
} from "../Dossier";
import { FigSlice, FigStruct } from "../diagrams/DiagramsA";

export function PartTwo() {
  return (
    <>
      {/* ---------------------------------------------------------- */}
      <Section
        id="s04"
        no="04"
        title="FUNCTIONS & CONTROL FLOW"
        brief="MULTIPLE RETURNS, DEFER, ONE LOOP"
      >
        <P>
          Functions may return multiple values — and Go leans on that hard.
          The idiomatic return is the pair <K>(value, error)</K>: results and
          failure travel together, and callers are structurally reminded to
          check. There are no default arguments and no overloading; one
          function, one signature, no ambiguity.
        </P>
        <CodeBlock
          exhibit="EXHIBIT D"
          file="FUNCS.GO"
          code={`package main

import (
	"errors"
	"fmt"
)

// two results: the answer, and the failure
func divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("division by zero")
	}
	return a / b, nil
}

func main() {
	result, err := divide(10, 4)
	if err != nil {
		fmt.Println("failed:", err)
		return
	}
	fmt.Println(result) // 2.5
}`}
        />
        <P>
          <K>defer</K> schedules a call to run when the enclosing function
          returns — regardless of how it returns. It is the standard pattern
          for cleanup: open a file, <K>defer f.Close()</K>, and never think
          about the early-exit path again.
        </P>
        <CodeBlock
          exhibit="EXHIBIT E"
          file="FLOW.GO"
          code={`// if may take a short statement; its scope ends with the block
if err := risky(); err != nil {
	return err
}

// for is the ONLY loop keyword — it plays every role
for i := 0; i < 10; i++ { } // counted
for x < 100 { }             // "while"
for { }                     // forever — break to exit

for i, v := range items {   // index and value
	fmt.Println(i, v)
}

// switch — no fallthrough, no break needed
switch os := runtime.GOOS; os {
case "darwin", "linux":
	fmt.Println("unix lineage")
default:
	fmt.Println("somewhere else")
}`}
        />
        <Note label="FIELD NOTE — ONE LOOP TO RULE THEM">
          Go has exactly one loop keyword. <strong>for</strong> is a counted
          loop, a while loop, and an infinite loop. There is no ternary
          operator either — write the <strong>if</strong> out. Verbosity here
          is a readability feature.
        </Note>
      </Section>

      {/* ---------------------------------------------------------- */}
      <Section
        id="s05"
        no="05"
        title="ARRAYS, SLICES, MAPS"
        brief="THE SLICE HEADER IS THE CONCEPT"
      >
        <P>
          Arrays in Go are fixed-length values — mostly a building block.
          The workhorse is the <strong>slice</strong>: a dynamic view onto an
          array, described by a three-word header — a pointer to the data,
          a length <K>len</K>, and a capacity <K>cap</K>. Copying a slice
          copies the header, not the data; two slices can point into the same
          array. This one picture explains almost every slice surprise.
        </P>
        <Figure
          fig="03"
          title="MEMORY LAYOUT — TWO HEADERS, ONE BACKING ARRAY"
          note="LEN IS WHAT YOU SEE; CAP IS WHAT YOU HAVE"
        >
          <FigSlice />
        </Figure>
        <CodeBlock
          exhibit="EXHIBIT F"
          file="COLLECTIONS.GO"
          code={`package main

import "fmt"

func main() {
	// array — fixed size, rarely used directly
	var grid [4]int

	// slice — grows with append
	scores := []int{90, 85, 77}
	scores = append(scores, 99)

	// slicing: half-open range [1:3]
	top := scores[1:3] // 85, 77 — shares memory with scores

	// map — reference type, must be made before use
	ages := map[string]int{"ada": 36, "grace": 45}
	ages["linus"] = 24

	// the comma-ok idiom: absent vs. present-with-zero-value
	v, ok := ages["turing"] // 0, false

	_ = grid
	fmt.Println(len(scores), top, v, ok)
}`}
        />
        <Note label="FIELD NOTE — APPEND'S CONTRACT">
          <K>append</K> writes into the existing array while capacity
          remains; at capacity it allocates a larger array and the header is
          re-pointed. That is why you assign its result back — and why
          slices passed to functions that append must be handled with care.
        </Note>
        <P>
          Maps are unordered key→value stores, always created with{" "}
          <K>make</K> or a literal. Reads return the zero type for missing
          keys; use the comma-ok form when absence matters. Iteration order
          is deliberately randomized — never depend on it.
        </P>
      </Section>

      {/* ---------------------------------------------------------- */}
      <Section
        id="s06"
        no="06"
        title="STRUCTS & METHODS"
        brief="RECORDS + FUNCTIONS WITH RECEIVERS"
      >
        <P>
          Go has no classes. State lives in <strong>structs</strong> — flat,
          predictable records — and behavior is attached via{" "}
          <strong>methods</strong>: ordinary functions with a receiver
          argument. A value receiver operates on a copy; a pointer receiver
          can mutate the original. The choice is part of your API's meaning,
          and it is declared in plain sight at every call site.
        </P>
        <CodeBlock
          exhibit="EXHIBIT G"
          file="SERVER.GO"
          code={`package main

import "fmt"

type Server struct {
	Host string
	Port int
}

// value receiver — reads a copy
func (s Server) Addr() string {
	return fmt.Sprintf("%s:%d", s.Host, s.Port)
}

// pointer receiver — mutates the original
func (s *Server) Shutdown() {
	s.Port = 0
}

func main() {
	s := Server{Host: "localhost", Port: 8080}
	fmt.Println(s.Addr()) // localhost:8080
	s.Shutdown()
	fmt.Println(s.Addr()) // localhost:0
}`}
        />
        <Figure
          fig="04"
          title="ONE STRUCT, TWO RECEIVER KINDS"
          note="COPY VS. SHARE IS DECLARED AT THE METHOD"
        >
          <FigStruct />
        </Figure>
        <Note label="FIELD NOTE — EMBEDDING, NOT INHERITANCE">
          Structs may embed other structs: type <K>Server</K> with an
          embedded <K>Logger</K> field promotes Logger's methods onto Server.
          It looks like inheritance from a distance, but it is composition —
          there is no parent class, no virtual dispatch, no fragile base
          problem. Go composes; it does not descend.
        </Note>
        <P>
          Convention carries weight here: <K>NewServer</K> constructors,{" "}
          <K>Addr</K>-style accessors, and the rule of thumb — use pointer
          receivers when in doubt, and be consistent within a type.
        </P>
      </Section>
    </>
  );
}
