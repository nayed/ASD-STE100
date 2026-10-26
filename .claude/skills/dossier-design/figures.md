# Figure standards and starter code

Figures are engineering drawings, not illustrations. A reader should learn something from each one without reading the text around it.

## Anatomy of a figure

```
┌ FIGURE BODY ────────────────────────────────────────────┐
│  small-caps title inside the drawing (optional)         │
│  the drawing: boxes, arrows, labels on halos,           │
│  leader callouts, dimension lines, hatching, legend     │
└─────────────────────────────────────────────────────────┘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  1px ink rule
FIG. 04 — TITLE IN CAPS                 DWG MEM-04 · SCALE 1 SLOT = 8 B
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  2.5px ink rule
A short note in the article's voice: what to look at.
```

## Checklist for every figure

- [ ] It teaches one idea, named in the caption.
- [ ] Every shape has a label; important parts have a leader callout.
- [ ] Sizes, distances and directions have dimension lines or arrows with values.
- [ ] Forbidden or unused areas are hatched, not left blank.
- [ ] Exactly one element (or one class of element) uses the accent.
- [ ] A legend explains any fill or colour that encodes a value.
- [ ] Labels that sit on lines have a paper halo.
- [ ] The numbers are real (measured, run, cited) or marked as examples.
- [ ] It reads at 375 px. A drawing whose labels would shrink under 7 px keeps a minimum width (about 640 px) and scrolls sideways in a wrapper of its own, not with the whole figure body, so the controls stay in place. The page itself never scrolls sideways.
- [ ] Boxes on the edge of the drawing keep their full stroke: `overflow: visible` on the SVG, or a viewBox with a 2-unit margin.
- [ ] Packets and other moving parts pass behind the boxes (draw them first), so they never cross a label.
- [ ] Labels that code places (from data, or after an input) stay clear in every state. Test every preset and slider position, not only the first state, which is all that `check:figures` sees. When code estimates a label's width, allow 0.72em per character in Plex Mono with letter-spacing: the check's browser can measure a wider fallback font.

## Starter primitives (React + SVG)

Adapt the colours to the article. Keep one set of primitives per article so every figure shares one hand.

```tsx
const INK = "#121210", OLIVE = "#6b6c5a", OLIVE_LT = "#a6a795", PAPER = "#f5f4ee", ACCENT = "#f2c300";

/** label on a paper-coloured halo, so lines can pass behind it */
function Label({ x, y, children, size = 10, anchor = "start", fill = INK, weight = 400, ls = 0.08 }: {
  x: number; y: number; children: React.ReactNode; size?: number;
  anchor?: "start" | "middle" | "end"; fill?: string; weight?: number; ls?: number;
}) {
  return (
    <text x={x} y={y} fontSize={size} textAnchor={anchor} fill={fill} fontWeight={weight}
      letterSpacing={`${ls}em`} stroke={PAPER} strokeWidth={4} strokeLinejoin="round" paintOrder="stroke">
      {children}
    </text>
  );
}

/** arrow head as a marker; put <ArrowDefs/> once per SVG and use markerEnd="url(#a-<id>)" */
function ArrowDefs({ id, color = OLIVE }: { id: string; color?: string }) {
  return (
    <defs>
      <marker id={`a-${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={color} />
      </marker>
    </defs>
  );
}

/** dimension line: end ticks, extension, value in the middle */
function Dim({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label: string }) {
  const vertical = x1 === x2;
  const t = 5;
  return (
    <g stroke={OLIVE} strokeWidth={1}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {vertical ? (
        <><line x1={x1 - t} y1={y1} x2={x1 + t} y2={y1} /><line x1={x2 - t} y1={y2} x2={x2 + t} y2={y2} /></>
      ) : (
        <><line x1={x1} y1={y1 - t} x2={x1} y2={y1 + t} /><line x1={x2} y1={y2 - t} x2={x2} y2={y2 + t} /></>
      )}
      <Label x={(x1 + x2) / 2 + (vertical ? 8 : 0)} y={(y1 + y2) / 2 + (vertical ? 3 : -6)}
        anchor={vertical ? "start" : "middle"} size={9} fill={OLIVE}>{label}</Label>
    </g>
  );
}

/** leader callout: a dot on the part, a bent line, the note */
function Leader({ from, to, children }: { from: [number, number]; to: [number, number]; children: React.ReactNode }) {
  const [fx, fy] = from, [tx, ty] = to;
  return (
    <g>
      <circle cx={fx} cy={fy} r={2.2} fill={INK} />
      <polyline points={`${fx},${fy} ${tx},${fy} ${tx},${ty}`} fill="none" stroke={OLIVE} strokeWidth={1} />
      <Label x={tx + 6} y={ty + 3} size={9.5} fill={OLIVE}>{children}</Label>
    </g>
  );
}

/** hatch for unused, forbidden or freed areas: <rect fill="url(#hatch-<id>)" /> */
function Hatch({ id, color = OLIVE_LT }: { id: string; color?: string }) {
  return (
    <defs>
      <pattern id={`hatch-${id}`} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
        <line x1={0} y1={0} x2={0} y2={6} stroke={color} strokeWidth={1.2} />
      </pattern>
    </defs>
  );
}

/** key element: an accent fill under an ink outline (works even for light accents) */
function KeyBox({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <rect x={x} y={y} width={w} height={h} fill={ACCENT} stroke={INK} strokeWidth={2} />;
}
```

SVG ids (`a-…`, `hatch-…`) must be unique on the page: prefix them with the figure number.

## Caption bar (CSS)

```css
.root .fig { margin: 40px 0 12px; }
.root .figcap {
  display: flex; flex-wrap: wrap; gap: 4px 16px; align-items: baseline;
  border-top: 1px solid var(--ink); border-bottom: 2.5px solid var(--ink);
  padding: 8px 2px; font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase;
}
.root .figcap .no { color: var(--accent-text); font-weight: 700; }
.root .figcap .ref { margin-left: auto; color: var(--olive); }
.root .fignote { font-size: 12px; color: var(--ink-2); max-width: 72ch; margin-top: 10px; }
```

## Instrument controls (interactive figures)

```css
.root .ctl {
  font: 600 10px/1 var(--mono); letter-spacing: 0.16em; text-transform: uppercase;
  border: 1.5px solid var(--ink); background: var(--paper); color: var(--ink);
  padding: 9px 12px; border-radius: 0; cursor: pointer;
}
.root .ctl:hover { background: var(--ink); color: var(--paper); }
.root .ctl[aria-pressed="true"] { background: var(--accent); }
.root .ctl:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.root .readout { display: grid; grid-template-columns: auto 1fr; gap: 4px 14px; font-size: 11px; }
.root .readout dt { color: var(--olive); letter-spacing: 0.14em; text-transform: uppercase; font-size: 9px; }
```

Readouts state the machine's state in its own terms: `SP = 0x7FFE_F3A0`, `DEPTH 3`, `FREE 288 B · LARGEST HOLE 64 B`. A reset button returns to the first state. Under `prefers-reduced-motion: reduce`, change state without animating.

## Motion

Animate what moves in the subject (SKILL.md, section 5). Three patterns cover most figures.

**Marching dashes**: data flows along a connector. The dash pattern is 5 + 5 = 10 units long, so an offset of −20 loops without a jump.

```css
.root .flow { stroke-dasharray: 5 5; animation: root-flow 1.4s linear infinite; }
@keyframes root-flow { to { stroke-dashoffset: -20; } }
@media (prefers-reduced-motion: reduce) { .root .flow { animation: none; } }
```

```tsx
<path d="M212,85 H284" className="flow" stroke={OLIVE} strokeWidth={1.4} fill="none" markerEnd="url(#a-f2)" />
```

**A packet on a path**: one request travels the pipeline. SVG's own `animateMotion` needs no JavaScript.

```tsx
<circle r={4} fill={ACCENT} stroke={INK} strokeWidth={1.2}>
  <animateMotion dur="3s" repeatCount="indefinite" path="M60,100 H380 V220 H700" />
</circle>
```

Hide such SVG animations under reduced motion with `@media (prefers-reduced-motion: reduce) { .root .packet { display: none; } }`, and keep a static marker that shows the same path.

**Values arriving**: a bar grows to its computed width; text streams in.

```css
.root .bar { transition: width 0.6s cubic-bezier(0.2, 0.7, 0.2, 1); }
@media (prefers-reduced-motion: reduce) { .root .bar { transition: none; } }
```

```tsx
/** reveal text token by token; under reduced motion, show it all at once */
function useStream(text: string, msPerToken = 45) {
  const tokens = text.split(/(\s+)/);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(tokens.length);
      return;
    }
    let i = 0;
    setN(0);
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= tokens.length) clearInterval(id);
    }, msPerToken);
    return () => clearInterval(id);
  }, [text]);
  return tokens.slice(0, n).join("");
}
```

**Run only when visible**: start a step-through or a stream when its figure enters the screen, with an `IntersectionObserver` (threshold about 0.4). Pause loops that leave it.
