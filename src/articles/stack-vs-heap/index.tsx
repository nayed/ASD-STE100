import "./svh.css";
import Allocator from "./Allocator";
import Depth from "./Depth";
import Stepper from "./Stepper";
import { Code, DOC, Fig, Hazard, ISSUED, Note, Proc, REV, Rail, SHEETS, Sheet, TblCap, Term } from "./chrome";
import {
  ALLOC_ASM, ALLOC_C, COUNTER_C, DOWN_C, DOWN_OUT, DUMP, FRAME_ASM, GO_MAIN, GO_OUT, LEAK_C, LEAK_OUT, LOCAL_C, LOCAL_OUT,
  UAF_C, UAF_OUT, WHERE_C, WHERE_OUT,
} from "./data";
import { FigAddressSpace, FigFrames, FigLifetimes, FigLocality, FigWhoFrees } from "./figs";

const FIGURES: [string, string, string][] = [
  ["01", "Address space of one process", "02"],
  ["02", "Two real frames", "03"],
  ["03", "A first-fit allocator · interactive", "04"],
  ["04", "counter.c, step by step · interactive", "05"],
  ["05", "Lifetimes on a time axis", "06"],
  ["06", "Who frees a heap block", "06"],
  ["07", "One cache line against eight", "08"],
  ["08", "How deep recursion can go · interactive", "09"],
];

/** the cover specimen: the bytes of "HEAP" carry the accent, as the word does in the title */
function Dump() {
  const mark = (s: string, key: string) => {
    const at = s.indexOf(key);
    if (at < 0) return s;
    return (
      <>
        {s.slice(0, at)}
        <span className="k">{key}</span>
        {s.slice(at + key.length)}
      </>
    );
  };
  return (
    <div className="dump">
      <div className="dump-bar">
        <span>$ hexdump -C title.txt</span>
        <span>58 B</span>
      </div>
      <pre>
        {DUMP.map(([off, hex, ascii]) => (
          <span key={off}>
            <span className="o">{off}</span>
            {hex && "  "}
            {mark(hex, "48 45 41 50")}
            {ascii && "  "}
            <span className="a">{mark(ascii, "HEAP")}</span>
            {"\n"}
          </span>
        ))}
      </pre>
      <div className="dump-cap">The title of this dossier, as bytes in memory</div>
    </div>
  );
}

export default function StackVsHeap() {
  return (
    <div className="svh">
      <div className="page">
        <Rail />
        <main>
          {/* ============ COVER ============ */}
          <header id="cover" className="cover" style={{ scrollMarginTop: "calc(var(--site-bar-h) + 24px)" }}>
            <div className="cover-top">
              <span>Technical dossier — series: systems fundamentals</span>
              <span>
                <b>{DOC}</b> · REV {REV} · 10 SHEETS + APPENDIX
              </span>
            </div>
            <div className="stamp" aria-label="Stamp: all output from real runs">
              All output from real runs
              <small>GCC 16.2 · GO 1.27 · X86-64</small>
            </div>
            <div className="cover-body">
              <div className="cover-title">
                <div className="eyebrow">Process memory · entry level</div>
                <h1 className="title">
                  <span className="l1">Stack</span>
                  <span className="l2">
                    <span className="amp">&amp;</span>
                    <span className="hl">Heap</span>
                  </span>
                </h1>
              </div>
              <p className="lede">
                A running program keeps its data in two regions of memory. The stack holds the data of each function
                call. The heap holds data that must live longer. This dossier explains how each region works, how it
                grows, and how it fails.
              </p>
              <Dump />
            </div>
            <div className="meta">
              {[
                ["Document", DOC],
                ["Revision", REV],
                ["Issue date", ISSUED],
                ["Subject", "Process memory"],
                ["Platform", "x86-64 Linux"],
                ["Toolchain", "GCC 16.2 · Go 1.27"],
                ["Writing", "ASD-STE100"],
                ["Classification", "Public"],
              ].map(([k, v]) => (
                <div key={k}>
                  <span className="k">{k}</span>
                  <span className="v">{v}</span>
                </div>
              ))}
            </div>
          </header>

          <div className="index">
            <div>
              <h2>Index of sheets</h2>
              <ol>
                {SHEETS.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>
                      <span className="n">{s.no}</span>
                      <span>{s.title}</span>
                      <span className="p">{s.off}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h2>Index of figures</h2>
              <ol>
                {FIGURES.map(([n, t, sh]) => (
                  <li key={n}>
                    <span>
                      <span className="n">{n}</span>
                      <span>{t}</span>
                      <span className="p">SHEET {sh}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* ============ 01 SCOPE ============ */}
          <Sheet id="s01" no="01" off="+0x100" kicker="General" title="Scope">
            <div className="split">
              <div>
                <p>
                  This dossier explains the stack and the heap. They are the two regions where a program keeps its
                  variables.
                </p>
                <p>
                  The reader knows one programming language. Most examples use C, because C shows memory directly. Sheet
                  07 shows the same decisions in Go.
                </p>
                <p>
                  Each output in this dossier comes from a real run. The platform is x86-64 Linux, with GCC 16.2 and Go
                  1.27.
                </p>
                <h3>
                  <span className="n">1.1</span>How to use this dossier
                </h3>
                <Proc
                  items={[
                    "Read the sheets in order. Each sheet uses the terms of the sheets before it.",
                    "Operate the instruments in Fig. 03, Fig. 04 and Fig. 08. They run in your browser.",
                    "Find each technical term in Appendix A.",
                  ]}
                />
              </div>
              <aside>
                <Note label="Note — addresses">
                  <p>Your addresses will be different. The kernel moves each region to a random position at each start.</p>
                </Note>
                <Note label="Note — units">
                  <p>1 KiB is 1,024 bytes. 1 MiB is 1,048,576 bytes. One row in a stack drawing is 8 bytes.</p>
                </Note>
              </aside>
            </div>
          </Sheet>

          {/* ============ 02 ADDRESS SPACE ============ */}
          <Sheet id="s02" no="02" off="+0x200" kicker="Description" title="The address space">
            <div className="split">
              <div>
                <p>
                  Each process sees one large range of addresses. The kernel divides this range into regions. Each region
                  has one job.
                </p>
                <p>
                  Exhibit A prints one address from each region. Fig. 01 puts these addresses in order, from the highest to
                  the lowest.
                </p>
              </div>
              <aside>
                <Note label="Note — ASLR">
                  <p>
                    Compare the two runs in Exhibit A. The high digits change, but the last three digits stay the same.
                  </p>
                  <p>The kernel moves each region by whole pages of 4 KiB. The stack also moves inside its page.</p>
                </Note>
              </aside>
            </div>
            <Code label="EXHIBIT A — where.c" meta="C · 23 LINES" code={WHERE_C} />
            <Term label="OUTPUT A — TWO REAL RUNS" meta="X86-64 LINUX · GCC 16.2" lines={WHERE_OUT} />
            <Fig
              no="01"
              title="Address space of one process"
              refText="DWG MEM-01 · NOT TO SCALE"
              note="The stack sits near the top and grows down. The heap starts above the program and grows up. Between them, terabytes of addresses have no memory at all."
            >
              <FigAddressSpace />
            </Fig>
            <div className="tblwrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Region</th>
                    <th>Contents</th>
                    <th>Lifetime of the data</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Text</td><td>The machine code of the program. The kernel marks it read-only.</td><td>The full run</td></tr>
                  <tr><td>Data</td><td>Global variables with an initial value.</td><td>The full run</td></tr>
                  <tr><td>BSS</td><td>Global variables without an initial value. The kernel sets them to zero.</td><td>The full run</td></tr>
                  <tr><td>Heap</td><td>Blocks from malloc.</td><td>From malloc to free</td></tr>
                  <tr><td>Mapped</td><td>Shared libraries and large blocks.</td><td>Until the program unmaps them</td></tr>
                  <tr><td>Stack</td><td>One frame for each active function call.</td><td>From the call to the return</td></tr>
                </tbody>
              </table>
            </div>
            <TblCap no="2-1" title="The regions of a process" refText="6 REGIONS" />
          </Sheet>

          {/* ============ 03 THE STACK ============ */}
          <Sheet id="s03" no="03" off="+0x300" kicker="Description and procedure" title="The stack">
            <div className="split">
              <div>
                <p>
                  The stack holds one frame for each function call that has not returned. A frame holds the local
                  variables of the call. It also holds the data that the return needs.
                </p>
                <p>
                  The stack pointer is a CPU register. On x86-64, its name is <code>rsp</code>. It holds the address of
                  the top of the stack.
                </p>
                <p>
                  The stack grows down. A call moves <code>rsp</code> to a lower address. A return moves it back up. The
                  last frame in is the first frame out.
                </p>
                <h3>
                  <span className="n">3.1</span>Procedure — what a call does
                </h3>
                <Proc
                  items={[
                    "The caller puts up to six integer arguments in registers.",
                    <>The <code>call</code> instruction pushes the return address onto the stack.</>,
                    <>The function pushes the frame pointer of the caller, <code>rbp</code>.</>,
                    <>The function subtracts the size of its locals from <code>rsp</code>.</>,
                    <>The function runs. It finds each local at a fixed offset from <code>rbp</code>.</>,
                    <>The <code>leave</code> instruction moves <code>rsp</code> back up and restores <code>rbp</code>.</>,
                    <>The <code>ret</code> instruction pops the return address and jumps to it.</>,
                  ]}
                />
              </div>
              <aside>
                <Note label="Note — registers">
                  <p>
                    On x86-64 Linux, the first six integer arguments travel in registers. A seventh argument goes on the
                    stack.
                  </p>
                </Note>
                <Note label="Note — canary">
                  <p>
                    GCC can put a canary value under the return address. A changed canary stops the program. The flag is{" "}
                    <code>-fstack-protector-strong</code>.
                  </p>
                  <p>Ubuntu's GCC sets this flag by default. The Debian GCC of this dossier does not.</p>
                </Note>
              </aside>
            </div>
            <p>
              Exhibit B is the example program of this sheet and of sheet 05. main() calls make_counter(), which asks
              for a block on the heap. Output B·1 shows how GCC builds the frame of make_counter().
            </p>
            <p>
              counter.c prints nothing when it runs. Output B·1 is not its output: it is the machine code that GCC
              writes to the file counter.s.
            </p>
            <Code label="EXHIBIT B — counter.c" meta="C · 15 LINES" code={COUNTER_C} />
            <Term label="OUTPUT B·1 — THE MACHINE CODE OF make_counter()" meta="GCC 16.2 · -O0 · INTEL SYNTAX" lines={FRAME_ASM} />
            <Fig
              no="02"
              title="Two real frames"
              refText="DWG MEM-02 · 1 ROW = 8 B"
              note="push rbp and sub rsp, 32 build the frame of make_counter. It holds 8 bytes for the return address, 8 for the saved rbp and 32 for the locals. GCC keeps rsp aligned to 16 bytes at each call."
            >
              <FigFrames />
            </Fig>
            <Hazard cmd="Do not write past the end of a local array.">
              <p>The extra bytes overwrite the saved rbp and the return address. An attacker can then select the code that runs next.</p>
            </Hazard>
          </Sheet>

          {/* ============ 04 THE HEAP ============ */}
          <Sheet id="s04" no="04" off="+0x400" kicker="Description and procedure" title="The heap">
            <div className="split">
              <div>
                <p>
                  The heap holds blocks that live until the program frees them. Their lifetime does not depend on a
                  function call.
                </p>
                <p>
                  In C, <code>malloc</code> asks for a block, and <code>free</code> gives it back. The allocator in the C
                  library manages the region.
                </p>
                <h3>
                  <span className="n">4.1</span>Procedure — what malloc does
                </h3>
                <Proc
                  items={[
                    "Add a header of 8 bytes to the request. Round the total up to a multiple of 16 bytes.",
                    "Search the free lists for a hole that is large enough.",
                    "If a hole fits, split it. Return the address after the header.",
                    <>If no hole fits, ask the kernel for more memory with <code>brk</code> or <code>mmap</code>.</>,
                    <>For a request of 128 KiB or more, use a separate <code>mmap</code>. This is the default of glibc.</>,
                  ]}
                />
                <p>
                  <code>free</code> puts the block back on a free list. If a neighbour block is also free, the allocator
                  joins the two into one hole.
                </p>
              </div>
              <aside>
                <Note label="Note — Exhibit A">
                  <p>
                    The 1 MiB block of Exhibit A is larger than 128 KiB. For this reason, it is in the mapped region, not in
                    the heap.
                  </p>
                </Note>
                <Note label="Note — the header">
                  <p>The header holds the size of the block. free reads it, so free needs no size argument.</p>
                </Note>
              </aside>
            </div>
            <h3>
              <span className="n">4.2</span>Procedure — operate the allocator
            </h3>
            <Proc
              items={[
                "Push a malloc button. A new block appears in the first hole that fits.",
                "Click a block to free it. Look at how free holes join.",
                "Push FRAGMENT. Then push malloc(120).",
              ]}
            />
            <Fig
              no="03"
              title="A first-fit allocator"
              refText="INTERACTIVE · 1 CELL = 16 B · ARENA = 768 B"
              note="Block sizes follow glibc on x86-64: malloc(24) takes 32 bytes, malloc(56) takes 64, malloc(120) takes 128. The arena never grows, so the effect of fragmentation stays visible."
            >
              <Allocator />
            </Fig>
            <p>
              After FRAGMENT, 384 bytes are free, but no hole holds 128 bytes. The request fails. This problem is external
              fragmentation.
            </p>
            <Hazard kind="caution" cmd="Do not mix many small and large blocks with long and short lifetimes.">
              <p>The holes between long-lived blocks become too small to use. The program then needs more memory than its data.</p>
            </Hazard>
          </Sheet>

          {/* ============ 05 STEP BY STEP ============ */}
          <Sheet id="s05" no="05" off="+0x500" kicker="Procedure" title="One program, step by step">
            <p>
              Fig. 04 runs the program of Exhibit B, from sheet 03, one line at a time. The left panel is the source. The right panel is
              the stack and the heap.
            </p>
            <Proc
              items={[
                "Push STEP to run the next line.",
                "Look at the frames on the stack and the block on the heap.",
                "Read the event line under the figure.",
                "Push BACK to go back one line. Push RESET to start again.",
              ]}
            />
            <Fig
              no="04"
              title="counter.c, step by step"
              refText="INTERACTIVE · ADDRESSES FROM ONE REAL RUN"
              note="The addresses come from one run of counter.c with print statements added, compiled with -O0. The yellow element is the one that changed."
            >
              <Stepper />
            </Fig>
            <div className="split">
              <div>
                <p>
                  Look at step 6. The frame of <code>make_counter</code> disappears, and its local <code>p</code> goes with
                  it. The block stays, because <code>main</code> has its address in <code>c</code>.
                </p>
                <p>
                  Look at step 8. <code>free</code> gives the block back, but the value of <code>c</code> does not change.{" "}
                  <code>c</code> is now a dangling pointer.
                </p>
              </div>
              <aside>
                <Hazard cmd="Do not use a pointer after you free its block.">
                  <p>The allocator can give the same block to the next request. Set the pointer to NULL after free.</p>
                </Hazard>
              </aside>
            </div>
          </Sheet>

          {/* ============ 06 LIFETIMES ============ */}
          <Sheet id="s06" no="06" off="+0x600" kicker="Description" title="Lifetimes">
            <div className="split">
              <div>
                <p>
                  Stack lifetimes nest. A frame always ends before the frame of its caller. The return ends it
                  automatically.
                </p>
                <p>
                  Heap lifetimes do not nest. A block can outlive the function that made it. Something must end the life
                  of each block.
                </p>
              </div>
              <aside>
                <Note label="Note — the leak row">
                  <p>The last row of Fig. 05 shows counter.c without line 13. Nothing frees the block, so it stays until the program stops.</p>
                </Note>
              </aside>
            </div>
            <Fig
              no="05"
              title="Lifetimes on a time axis"
              refText="DWG MEM-05 · ONE COLUMN PER STEP"
              note="The frame of make_counter ends at step 6. The block that it made lives until step 8."
            >
              <FigLifetimes />
            </Fig>
            <p>
              Languages use three methods to free heap blocks. Fig. 06 compares them. In each lane, the yellow box is the
              moment of the free.
            </p>
            <Fig
              no="06"
              title="Who frees a heap block"
              refText="DWG MEM-06"
              note="CPython is a mix. A reference count frees most objects at once. A collector removes the cycles that the counts cannot free."
            >
              <FigWhoFrees />
            </Fig>
          </Sheet>

          {/* ============ 07 THE COMPILER DECIDES ============ */}
          <Sheet id="s07" no="07" off="+0x700" kicker="Description" title="The compiler decides">
            <div className="split">
              <div>
                <p>
                  In C, you select the region. A local variable goes on the stack. A block from malloc goes on the heap.
                </p>
                <p>In Go, Java and C#, you do not select the region. The compiler or the runtime selects it.</p>
                <p>
                  The Go compiler uses escape analysis. If a value can outlive its function, the compiler puts it on the
                  heap. The flag <code>-gcflags=-m</code> shows each decision.
                </p>
              </div>
              <aside>
                <Note label="Note — C++ and Rust">
                  <p>
                    In C++, <code>new</code> puts an object on the heap. In Rust, <code>Box::new</code> does the same.
                    Plain local values stay on the stack.
                  </p>
                </Note>
              </aside>
            </div>
            <Code label="EXHIBIT C — main.go" meta="GO · 21 LINES" code={GO_MAIN} />
            <Term label="OUTPUT C — THE DECISIONS OF THE GO COMPILER" meta="GO 1.27" lines={GO_OUT} />
            <ul className="reading">
              <li>
                <b>Line 15</b>
                <span>
                  <code>moved to heap: p</code>. newPoint returns the address of p, so p must outlive the call.
                </span>
              </li>
              <li>
                <b>Line 9</b>
                <span>No message. The p of sum stays on the stack.</span>
              </li>
              <li>
                <b>Line 20</b>
                <span>
                  Two values escape. fmt.Println takes interface values, and the compiler puts these values on the heap.
                </span>
              </li>
            </ul>
          </Sheet>

          {/* ============ 08 SPEED AND LOCALITY ============ */}
          <Sheet id="s08" no="08" off="+0x800" kicker="Description" title="Speed and locality">
            <p>
              Stack allocation is one subtraction from <code>rsp</code>. Exhibit D shows the real machine code of the two
              methods.
            </p>
            <Code label="EXHIBIT D — alloc.c" meta="C · 14 LINES" code={ALLOC_C} />
            <Term label="OUTPUT D — THE SAME 4,096 BYTES, TWO WAYS" meta="GCC 16.2 · -O2 · INTEL SYNTAX" lines={ALLOC_ASM} />
            <ul className="reading">
              <li>
                <b>on_stack</b>
                <span>
                  <code>sub rsp, 4104</code> makes room for 4,096 bytes and alignment. <code>add rsp, 4104</code> gives
                  the room back.
                </span>
              </li>
              <li>
                <b>on_heap</b>
                <span>
                  The function calls <code>malloc</code> and <code>free</code>. Each call runs the code of the allocator:
                  search, split, record.
                </span>
              </li>
            </ul>
            <p>
              The stack is also compact. The data of the active calls sits in a few cache lines. Heap data can spread
              over many lines.
            </p>
            <Fig
              no="07"
              title="One cache line against eight"
              refText="DWG MEM-07 · EXAMPLE LAYOUT"
              note="The CPU reads memory in lines of 64 bytes. Data that sits together arrives together."
            >
              <FigLocality />
            </Fig>
            <div className="tblwrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Stack</th>
                    <th>Heap</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Allocation</td><td>Move rsp: one instruction</td><td>A call to the allocator</td></tr>
                  <tr><td>Release</td><td>Automatic, at the return</td><td>free, a destructor or the collector</td></tr>
                  <tr><td>Lifetime</td><td>Until the function returns</td><td>Until the program frees the block</td></tr>
                  <tr><td>Size</td><td>Fixed per thread: 8 MiB here</td><td>Limited by the memory of the machine</td></tr>
                  <tr><td>Order</td><td>Last in, first out</td><td>Any order</td></tr>
                  <tr><td>Typical failure</td><td>Stack overflow</td><td>Leak, use-after-free, fragmentation</td></tr>
                </tbody>
              </table>
            </div>
            <TblCap no="8-1" title="The stack and the heap, side by side" refText="6 PROPERTIES" />
            <Hazard kind="caution" cmd="Do not put large arrays on the stack.">
              <p>One char buf[1 &lt;&lt; 20] uses one eighth of the 8 MiB stack. Use malloc for large data and for data of variable size.</p>
            </Hazard>
          </Sheet>

          {/* ============ 09 FAILURE MODES ============ */}
          <Sheet id="s09" no="09" off="+0x900" kicker="Troubleshooting" title="Failure modes">
            <h3>
              <span className="n">9.1</span>Stack overflow
            </h3>
            <div className="split">
              <div>
                <p>
                  The stack has a fixed limit. On the test machine, <code>ulimit -s</code> gives 8,192 KiB for the main
                  thread.
                </p>
                <p>
                  Under the stack, the kernel keeps a guard gap of unmapped memory. A write into it stops the program with
                  SIGSEGV.
                </p>
              </div>
              <aside>
                <Note label="Note — exit status 139">
                  <p>139 is 128 + 11. Signal 11 is SIGSEGV.</p>
                </Note>
              </aside>
            </div>
            <Fig
              no="08"
              title="How deep recursion can go"
              refText="INTERACTIVE · LIMIT FROM THE TEST MACHINE"
              note="down() uses 32 bytes for each call at -O0. 8 MiB divided by 32 bytes is 262,144 calls. The real run in Exhibit E stopped between 250,000 and 300,000."
            >
              <Depth />
            </Fig>
            <Code label="EXHIBIT E — down.c" meta="C · 11 LINES" code={DOWN_C} />
            <Term label="OUTPUT E — A REAL STACK OVERFLOW" meta="BASH · GCC 16.2 · -O0" lines={DOWN_OUT} />

            <h3>
              <span className="n">9.2</span>Heap errors
            </h3>
            <div className="tblwrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Error</th>
                    <th>Cause</th>
                    <th>Result</th>
                    <th>Find it with</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Leak</td><td>The last pointer to a block is lost.</td><td>Memory use grows until the program stops.</td><td>LeakSanitizer, Valgrind</td></tr>
                  <tr><td>Use-after-free</td><td>The program uses a block after free.</td><td>It reads or changes another object.</td><td>AddressSanitizer</td></tr>
                  <tr><td>Double free</td><td>free runs two times on one block.</td><td>The allocator stops the program, or its lists break.</td><td>AddressSanitizer, glibc checks</td></tr>
                  <tr><td>Dangling stack pointer</td><td>A function returns the address of a local.</td><td>The next call overwrites the value.</td><td>-Wreturn-local-addr</td></tr>
                  <tr><td>Fragmentation</td><td>Small holes between live blocks.</td><td>A large request fails or takes new memory.</td><td>Allocator statistics</td></tr>
                </tbody>
              </table>
            </div>
            <TblCap no="9-1" title="Heap errors and their tools" refText="5 ERRORS" />
            <p>AddressSanitizer finds three of these errors at run time. Add -fsanitize=address to the compile command.</p>
            <Code label="EXHIBIT F — uaf.c" meta="C · USE-AFTER-FREE" code={UAF_C} />
            <Term label="OUTPUT F — ADDRESSSANITIZER REPORT, FIRST LINES" meta="GCC 16.2 · LIBC LINES LEFT OUT (…) · PATHS SHORTENED" lines={UAF_OUT} />
            <Code label="EXHIBIT G — leak.c" meta="C · LEAK" code={LEAK_C} />
            <Term label="OUTPUT G — LEAKSANITIZER REPORT" meta="GCC 16.2 · LIBC LINES LEFT OUT (…) · PATHS SHORTENED" lines={LEAK_OUT} />
            <Code label="EXHIBIT H — local.c" meta="C · DANGLING STACK POINTER" code={LOCAL_C} />
            <Term label="OUTPUT H — THE COMPILER WARNS" meta="GCC 16.2 · -WALL" lines={LOCAL_OUT} />
            <Hazard cmd="Do not return the address of a local variable.">
              <p>The frame ends at the return. The next call uses the same addresses for its own data.</p>
            </Hazard>
          </Sheet>

          {/* ============ 10 FIELD RULES ============ */}
          <Sheet id="s10" no="10" off="+0xA00" kicker="Summary" title="Field rules">
            <ol className="rules">
              <li>Keep large data, and data of variable size, on the heap.</li>
              <li>Free each heap block exactly one time.</li>
              <li>Set a pointer to NULL after you free its block.</li>
              <li>Do not return the address of a local variable.</li>
              <li>Use types that free automatically: unique_ptr in C++, Box in Rust.</li>
              <li>Compile your tests with -fsanitize=address.</li>
              <li>Use a loop, not recursion, when the input sets the depth.</li>
            </ol>
            <div className="sum">
              <div className="sum-bar">SUMMARY — {DOC}</div>
              <p>The stack holds one frame for each active call. It is fast, ordered and small.</p>
              <p>The heap holds blocks with free lifetimes. It is flexible, slower and large.</p>
              <p>A pointer on the stack often holds the address of a block on the heap.</p>
              <p>A return ends a frame. Only a free ends a block.</p>
            </div>
          </Sheet>

          {/* ============ APPENDIX A ============ */}
          <Sheet id="sA" no="A" off="+0xB00" kicker="Appendix" title="Definitions">
            <div className="tblwrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Term</th>
                    <th>Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Address space", "The range of addresses that one process can use."],
                    ["Allocator", "The library code that gives out heap blocks and takes them back."],
                    ["ASLR", "Address space layout randomization. The kernel moves each region to a random address at start."],
                    ["BSS", "The region for global variables without an initial value. The kernel fills it with zeros."],
                    ["Canary", "A value under the return address. A change in it shows an overflow of a local array."],
                    ["Dangling pointer", "A pointer to memory that is no longer valid."],
                    ["Escape analysis", "A check in the compiler. It finds the values that can outlive their function."],
                    ["Fragmentation", "Free memory in holes that are too small to use."],
                    ["Frame", "The part of the stack that one function call uses."],
                    ["Free list", "The list of free holes that the allocator keeps."],
                    ["Garbage collector", "Runtime code that finds unreachable blocks and frees them."],
                    ["Guard gap", "Unmapped memory under the stack. A write into it stops the program."],
                    ["Heap", "The region for blocks with a lifetime that the program controls."],
                    ["Leak", "A block that the program cannot free, because no pointer to it remains."],
                    ["Return address", "The address where the CPU continues after a function returns."],
                    ["Stack", "The region for call frames. The last frame in is the first frame out."],
                    ["Stack pointer", "The register that holds the address of the top of the stack: rsp on x86-64."],
                    ["Use-after-free", "An access to a heap block after the program freed it."],
                  ].map(([t, d]) => (
                    <tr key={t}>
                      <td>{t}</td>
                      <td>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TblCap no="A-1" title="Terms of this dossier" refText="18 TERMS" />
          </Sheet>

          <footer className="foot">
            <div>
              <h4>Colophon</h4>
              Set in IBM Plex Mono. Drawings are not to scale unless a dimension says so. Yellow marks the one element
              that matters in each figure.
            </div>
            <div>
              <h4>Sources</h4>
              <a href="https://gitlab.com/x86-psABIs/x86-64-ABI" target="_blank" rel="noreferrer">System V x86-64 ABI</a> ·{" "}
              <a href="https://sourceware.org/glibc/wiki/MallocInternals" target="_blank" rel="noreferrer">glibc malloc internals</a> ·{" "}
              <a href="https://gcc.gnu.org/onlinedocs/gcc/Instrumentation-Options.html" target="_blank" rel="noreferrer">GCC instrumentation options</a> ·{" "}
              <a href="https://github.com/google/sanitizers/wiki/AddressSanitizer" target="_blank" rel="noreferrer">AddressSanitizer</a> ·{" "}
              <a href="https://go.dev/doc/faq#stack_or_heap" target="_blank" rel="noreferrer">Go FAQ: stack or heap</a>
            </div>
            <div>
              <h4>Control</h4>
              {DOC} · REV {REV} · {ISSUED}
              <br />
              10 sheets + appendix · 8 figures · 8 exhibits
              <br />
              Outputs: real runs, x86-64 Linux
            </div>
            <div className="endline">
              <span>End of document — the stack is empty</span>
              <i aria-hidden="true" />
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
