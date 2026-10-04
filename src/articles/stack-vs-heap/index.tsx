const ROWS = [
  ["Allocation", "Automatic, on function call", "Explicit (malloc, new) or by the runtime"],
  ["Freed", "Automatically, on return", "free / delete, or the garbage collector"],
  ["Speed", "Very fast: move one pointer", "Slower: find a free block"],
  ["Size", "Small, fixed per thread (often 1–8 MB)", "Large, grows as needed"],
  ["Lifetime", "Ends with the function", "Until freed or unreachable"],
  ["Typical failure", "Stack overflow", "Leaks, fragmentation, use-after-free"],
];

function MemoryDiagram() {
  const frames = [
    { name: "main()", vars: "argc, argv" },
    { name: "load()", vars: "path, buf*" },
    { name: "parse()", vars: "i, node*" },
  ];
  const blocks = [
    { x: 40, y: 40, w: 120, h: 44, label: "buf[4096]" },
    { x: 190, y: 70, w: 90, h: 36, label: "node" },
    { x: 70, y: 130, w: 70, h: 30, label: "node" },
    { x: 170, y: 150, w: 110, h: 50, label: "string" },
  ];
  return (
    <svg viewBox="0 0 680 300" className="h-auto w-full" role="img" aria-label="Stack frames on the left point into blocks on the heap on the right">
      <defs>
        <marker id="svh-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#5eead4" />
        </marker>
      </defs>

      {/* stack */}
      <text x="40" y="24" fill="#94a3b8" fontSize="12" fontFamily="ui-monospace, monospace">STACK · grows down ↓</text>
      {frames.map((f, i) => (
        <g key={f.name} transform={`translate(40, ${40 + i * 70})`}>
          <rect width="220" height="58" rx="6" fill={i === frames.length - 1 ? "#134e4a" : "#1e293b"} stroke="#334155" />
          <text x="14" y="24" fill="#e2e8f0" fontSize="14" fontFamily="ui-monospace, monospace">{f.name}</text>
          <text x="14" y="44" fill="#94a3b8" fontSize="12" fontFamily="ui-monospace, monospace">{f.vars}</text>
        </g>
      ))}
      <text x="270" y="250" fill="#5eead4" fontSize="11" fontFamily="ui-monospace, monospace">← sp</text>

      {/* heap */}
      <g transform="translate(360, 0)">
        <text x="0" y="24" fill="#94a3b8" fontSize="12" fontFamily="ui-monospace, monospace">HEAP · any order</text>
        <rect x="0" y="34" width="300" height="220" rx="8" fill="none" stroke="#334155" strokeDasharray="4 4" />
        {blocks.map((b, i) => (
          <g key={i}>
            <rect x={b.x - 30} y={b.y} width={b.w} height={b.h} rx="5" fill="#312e81" stroke="#6366f1" />
            <text x={b.x - 22} y={b.y + 20} fill="#e0e7ff" fontSize="12" fontFamily="ui-monospace, monospace">{b.label}</text>
          </g>
        ))}
      </g>

      {/* pointers from stack into heap */}
      <path d="M240,124 C300,124 320,62 368,62" fill="none" stroke="#5eead4" strokeWidth="1.5" markerEnd="url(#svh-arrow)" />
      <path d="M240,194 C300,194 330,150 398,145" fill="none" stroke="#5eead4" strokeWidth="1.5" markerEnd="url(#svh-arrow)" />
    </svg>
  );
}

export default function StackVsHeap() {
  return (
    <div className="bg-slate-950 text-slate-200 antialiased">
      <main className="mx-auto max-w-3xl px-5 py-14">
        <div className="flex items-center gap-3">
          <p className="font-mono text-sm text-teal-300">memory / systems</p>
          <span className="rounded border border-amber-500/40 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-amber-300">
            stub
          </span>
        </div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">Stack vs heap</h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-400">
          A running program keeps its data in two main regions. The stack is fast, ordered and short-lived. The heap is
          flexible, unordered and lives as long as you need it.
        </p>

        <figure className="mt-10 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <MemoryDiagram />
          <figcaption className="mt-2 font-mono text-xs text-slate-500">
            Each call pushes a frame. Frames hold pointers to data that must outlive them, which lives on the heap.
          </figcaption>
        </figure>

        <div className="mt-10 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-900 font-mono text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3" />
                <th className="px-4 py-3 text-teal-300">Stack</th>
                <th className="px-4 py-3 text-indigo-300">Heap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ROWS.map(([k, s, h]) => (
                <tr key={k}>
                  <td className="px-4 py-3 font-medium text-slate-300">{k}</td>
                  <td className="px-4 py-3 text-slate-400">{s}</td>
                  <td className="px-4 py-3 text-slate-400">{h}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-10 border-l-2 border-amber-500/60 pl-4 text-sm text-slate-500">
          This article is a placeholder. It shows that each wiki page can have its own design.
        </p>
      </main>
    </div>
  );
}
