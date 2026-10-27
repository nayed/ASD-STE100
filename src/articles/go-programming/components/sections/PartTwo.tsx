import {
  Section,
  Figure,
  CodeBlock,
  Note,
  P,
  K,
} from "../Dossier";
import { FigSlice, FigStruct } from "../diagrams/DiagramsA";
import FUNCS from "../../listings/funcs.go?highlight";
import FLOW from "../../listings/flow.go?highlight";
import COLLECTIONS from "../../listings/collections.go?highlight";
import SERVER from "../../listings/server.go?highlight";

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
          listing={FUNCS}
        />
        <P>
          <K>defer</K> schedules a call to run when the enclosing function
          returns — regardless of how it returns. It is the standard pattern
          for cleanup: open a file, <K>defer f.Close()</K>, and never think
          about the early-exit path again. Several deferred calls run in
          reverse order, last in first out, and their arguments are evaluated
          when the <K>defer</K> line runs, not when the call finally happens.
        </P>
        <CodeBlock
          exhibit="EXHIBIT E"
          file="FLOW.GO"
          listing={FLOW}
        />
        <Note label="FIELD NOTE — FUNCTIONS ARE VALUES">
          A function can be stored in a variable, passed as an argument and
          returned. A function literal is a <strong>closure</strong>: it
          captures the variables around it and keeps them alive. HTTP
          handlers, sort orders and callbacks are all plain func values —{" "}
          <K>slices.SortFunc(xs, func(a, b T) int {"{ … }"})</K>.
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
          listing={COLLECTIONS}
        />
        <Note label="FIELD NOTE — APPEND'S CONTRACT">
          <K>append</K> writes into the existing array while capacity
          remains; at capacity it allocates a larger array and the header is
          re-pointed. That is why you assign its result back — and why
          slices passed to functions that append must be handled with care.
        </Note>
        <P>
          Maps are unordered key→value stores, always created with{" "}
          <K>make</K> or a literal. Reads return the zero value for missing
          keys; use the comma-ok form when absence matters. Iteration order
          is deliberately randomized — never depend on it. For a stable order,
          sort the keys: <K>slices.Sorted(maps.Keys(ages))</K>.
        </P>
        <P>
          The generic <K>slices</K> and <K>maps</K> packages cover the
          everyday chores — <K>slices.Sort</K>, <K>slices.Contains</K>,{" "}
          <K>slices.Index</K>, <K>maps.Keys</K> — so you rarely write those
          loops by hand.
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
          and it is declared at the method, not at the call:{" "}
          <K>s.Shutdown()</K> reads the same either way, because Go takes the
          address for you.
        </P>
        <CodeBlock
          exhibit="EXHIBIT G"
          file="SERVER.GO"
          listing={SERVER}
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
