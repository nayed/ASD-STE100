---
name: dossier-design
description: Design and build a web page in the "technical dossier" style (IBM Plex Mono, flat black and white, muted olive-gray strokes, one accent colour, hand-drawn SVG figures with ruled captions) at the craft level of the tech wiki's best articles. Use when asked for a page, article or explainer "styled like a technical dossier", when adding or redesigning an article in the tech-wiki repo, or whenever a page must not look generic.
---

# Technical dossier design

The page must read as a printed engineering document recreated on screen: a numbered, revised, controlled document with sheets, figures, procedures and warnings. Every detail belongs to that fiction.

The usual failure is not a wrong choice but **stopping early**. The brief names a genre and four rules (font, palette, accent, captions). A generic page obeys the four rules and stops: one centred column, a few cards, one box-and-arrow diagram, 100–200 lines. The dossiers this skill comes from are 1,500–2,500 lines each, with 6–8 annotated figures, interactive figures and dozens of document details. Plan for that scale from the start.

## 1. Commit to the document before writing code

Write a short plan first, and keep to it:

- **Identity**: document code (letters and number: `PDM-101`, `RF-100`, `TG-01`), revision, issue date, classification, sheet count, applicable standard.
- **One device that belongs to this topic only.** It is what makes the page feel designed rather than templated. Examples in the wiki: the Go gopher drawn as a dimensioned blueprint; an engineering-drawing border with zone letters (CI/CD); printer's crop marks (random forest); a barcode on the cover (Podman); an STE checker you can type into (ASD-STE100). Find the equivalent for the new topic (a hex dump, a waveform, a packet header, a ledger…).
- **Sections**: 8–12 sheets, each with a one-line purpose, in the order of the explanation.
- **Figures**: 6–8. For each one: what it teaches, the single element that gets the accent, static or interactive. At least one interactive figure that teaches by doing (step through, drag, toggle, type).
- **Accent**: the colour, and the exact places it may appear.

## 2. Visual system

**Colour**
- Paper: warm off-white, never `#fff` (`#fbfbf8`, `#f2f0e9`, `#f5f4ee`).
- Ink: near-black, never `#000` (`#11140f`, `#121210`).
- Olive-gray for diagram strokes and secondary text (`#6b6c5a`–`#70755e`, 4.5:1 or more on paper), a light olive for construction lines and hatching, a pale rule colour for hairlines.
- **One** saturated accent. It marks the single key element of each figure, the active navigation item, stamps and warnings. Never use it as a wash or for decoration.
- Check contrast. If the accent is under 4.5:1 on paper, add a darker text variant of the same hue for small text. If it is too light for thin strokes (yellow), use it only as a fill with an ink outline.

**Type** (IBM Plex Mono only, weights 300–700)
- Display title: 64–120 px, bold, letter-spacing −0.03 to −0.05em, line-height ≈ 0.9. Give one word a contrasting treatment: outlined text, a reversed block, an accent fill.
- Section titles: 20–30 px, uppercase, bold.
- Labels and metadata: 8.5–10 px, uppercase, letter-spacing 0.16–0.3em, olive.
- Body: 12.5–14 px, line-height 1.8–1.95, at most about 72ch.
- Captions: 10–11 px, uppercase, letter-spacing ≈ 0.1em.
- Few sizes, big jumps between them. Mid-size everything = generic.

**Structure**
- Rules, not boxes: 1 px hairlines, 2–2.5 px ink rules above sections, ruled tables. A grid of cells with 1 px gaps on an ink background makes a crisp metadata block or table.
- Square corners everywhere. No soft shadows (one hard offset shadow such as `6px 6px 0 rgba(17,20,15,.14)` on a terminal block is fine). No gradients, glass, blur, emoji, decorative icon fonts, pill badges.
- Asymmetric layouts: text plus a margin-note column or a sticky aside, a sticky index rail. Avoid one centred column.

## 3. Document furniture

Use most of these, but vary the combination so articles do not look alike:

- **Cover sheet**: eyebrow ("TECHNICAL DOSSIER — SERIES …"), huge title, a lede of 2–4 sentences, a metadata grid (document no., revision, date, subject, platform or scope, classification), a rotated stamp.
- **Running header** or strip: document code · revision · "SHEET 04 / 10 — TITLE", updated as the reader scrolls.
- **Index rail**: sticky, the active section marked, a scroll-progress line or counter.
- **Section header**: a giant number, a small kicker, the title, a sheet reference at the right.
- **Body parts**: margin notes, numbered procedures (`01`, `02` counters in olive), definition tables, WARNING / CAUTION panels, terminal blocks and code "exhibits" with a title bar, a summary sheet, a glossary appendix.
- **Footer**: colophon (typeface, conventions), sources, a control block (document code, revision, sheets, figures), "END OF DOCUMENT — NOTHING FOLLOWS".

## 4. Figures carry the explanation

Full standards and starter code: [figures.md](figures.md). The rules:

- Hand-built inline SVG with a shared set of primitives per article: box, arrow, **label on a paper-coloured halo**, leader callout, **dimension line**, hatch pattern, corner ticks.
- Stroke weights: 1 for grids and construction, 1.2–1.5 for the drawing, 2–2.5 for the key element.
- Every figure has a caption bar between rules: `FIG. 03 — TITLE` at the left, a drawing reference, scale or "INTERACTIVE" at the right. Under it, a short note in the article's voice.
- Annotate the drawing itself: labels, leader callouts, dimensions, a legend when colour or fill encodes a value. A diagram of unlabelled boxes and arrows is a failure.
- The accent marks one element (or one class of element) per figure.
- Interactive figures look like instruments: square buttons with uppercase labels, labelled readouts (`SP = 0x7FFE_F3A0 · DEPTH 3`), a reset. Respect `prefers-reduced-motion`.
- Use real data. Run the code, measure, paste the real output. Label example values as examples.

## 5. Writing

- ASD-STE100 when the brief asks for it: at most 20 words per instruction sentence and 25 per descriptive sentence, active voice, simple present, one instruction per sentence, procedures as numbered steps, warnings that start with the command ("DO NOT …", then the risk).
- The voice belongs to the document: SHEET, FIG., EXHIBIT, NOTE, CAUTION, WARNING.
- Never invent terminal output, measurements, quotes or citations.
- A terminal block shows exactly the commands that produced its output, with every flag, and nothing else. If a command prints nothing (`gcc -S` writes a file), show the command that displays the result too. Before you report, copy the commands from the page, run them verbatim, and compare. Label any trimming in the block's title: lines left out, paths shortened.
- Show a program's source before any output that depends on it.

## 6. Generic tells: reject on sight

Framework-default palettes (slate, zinc, indigo, teal), rounded cards, soft or coloured shadows, gradients, glassmorphism, emoji, pill badges, a centred hero with a subtitle and a button, every section built the same way (heading, paragraph, card grid), "Key takeaways" boxes, two or three accent colours, diagrams of rounded rectangles with no annotation, fake numbers presented as real, short output.

## 7. Process

1. **Study references.** Open two finished dossiers (in this repo: `src/articles/podman-basics`, `llm-generation`, `random-forest`, `go-programming`, `ci-cd`) and list the devices they use. Match their depth, not their content.
2. **Plan** (section 1).
3. **Build the system first**: colour tokens, type scale, figure primitives, caption bar, section header.
4. **Write the content and draw the figures.** Run every code example and use its real output.
5. **Look at it.** Screenshot the desktop page and a 375 px phone. Put it beside a reference and list the ten most visible differences in craft. Fix them, and repeat until no generic tell remains.
6. **Verify** (section 8 in this repo).

## 8. In the tech-wiki repo

- An article is a folder in `src/articles/<slug>/` with an `index.tsx` default export and an entry in `src/articles/registry.ts`, including a `bar` theme. The bar shows `bar.accent` as text in the search menu, so use the dark text variant of a light accent there.
- Scope all CSS under one root class in a file in the folder. Keep the palette as CSS variables on that root class, or as prefixed Tailwind tokens in `src/index.css`.
- The shared site bar is 44 px (`var(--site-bar-h)`). Fixed and sticky parts go below it, and `scroll-margin-top` must include it.
- Accents already used: red `#b3261e` (ASD-STE100), greens `#0e7a3c` and `#3d7151` (random forest, CI/CD), cyan `#00add8` (Go), purple `#6d28d9` (Podman), orange `#e2571f` (LLM), yellow `#f2c300` (stack vs heap). Pick another hue.
- Checks before you report:
  - `npm run typecheck`, `npm run build`, then `npm run check:figures` (colliding or cut-off SVG labels; a label on a line needs a halo or a background patch).
  - No horizontal overflow at 375 px. Test in a 375 px iframe and compare `documentElement.scrollWidth` with 375: under phone emulation `innerWidth` grows with the page, so comparing the two hides the overflow. Grid children need `min-width: 0`; code blocks and wide tables scroll inside their own box.
  - Sentence lengths when the article is in STE (count words per sentence in `p`, `li`, `td`).
- Real output: compile and run C with `gcc`, Go with `go`, Python in a virtual environment in the scratchpad.
