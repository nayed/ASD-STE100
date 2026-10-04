import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useReveal } from "./Chrome";

const INK = "#17161a";
const HAZ = "#b3261e";
const BLUE = "#2c4c6b";
const ASH = "#6b6558";
const HAIR = "#d6cfbe";

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <figure className="mt-8 border border-ink/25 bg-paper2/50">
      <figcaption className="flex items-center justify-between gap-3 border-b border-ink/15 bg-ink px-4 py-2 text-paper">
        <span className="micro">{label}</span>
        <span className="micro shrink-0 text-paper/55">Fig.</span>
      </figcaption>
      <div className="px-3 py-5 sm:px-5">{children}</div>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Fig. 1 — the loop that keeps the standard alive                    */
/* ------------------------------------------------------------------ */
export function LoopDiagram() {
  const r = useReveal();
  const boxes = [
    { t: "Origin", a: "European aerospace", b: "industry, 1983" },
    { t: "Standard", a: "ASD-STE100", b: "53 rules + dictionary" },
    { t: "Writer", a: "applies the rules", b: "and approved words" },
    { t: "Document", a: "ATA iSpec 2200", b: "and S1000D" },
    { t: "Reader", a: "technician, any", b: "first language" },
  ];
  const w = 170;
  const gap = 28;
  const x0 = 19;
  return (
    <Frame label="Fig. 1 — From an industry problem to a readable instruction">
      <motion.svg
        viewBox="0 0 1000 250"
        className="h-auto w-full"
        role="img"
        aria-label="Flow: origin, standard, writer, document, reader, with user feedback back to the maintenance group"
        {...r}
      >
        <defs>
          <marker id="fig1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill={BLUE} />
          </marker>
          <marker id="fig1-arrow-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill={HAZ} />
          </marker>
        </defs>

        {boxes.map((b, i) => {
          const x = x0 + i * (w + gap);
          return (
            <g key={b.t}>
              <rect x={x} y={56} width={w} height={96} fill="none" stroke={INK} strokeWidth="1.25" />
              <rect x={x} y={56} width={w} height={22} fill={i === 1 ? HAZ : INK} />
              <text x={x + 10} y={71} fill="#f2eee4" fontFamily="IBM Plex Mono" fontSize="10.5" letterSpacing="2">
                {b.t.toUpperCase()}
              </text>
              <text x={x + 10} y={110} fill={INK} fontFamily="Archivo" fontSize="13" fontWeight="600">
                {b.a}
              </text>
              <text x={x + 10} y={130} fill={ASH} fontFamily="Archivo" fontSize="13">
                {b.b}
              </text>
              {i < boxes.length - 1 && (
                <line
                  x1={x + w + 4}
                  y1={104}
                  x2={x + w + gap - 8}
                  y2={104}
                  stroke={BLUE}
                  strokeWidth="1.5"
                  markerEnd="url(#fig1-arrow)"
                />
              )}
            </g>
          );
        })}

        <path
          d="M 896 156 L 896 206 L 302 206 L 302 158"
          fill="none"
          stroke={HAZ}
          strokeWidth="1.25"
          strokeDasharray="7 5"
          markerEnd="url(#fig1-arrow-h)"
        />
        <text x={600} y={230} textAnchor="middle" fill={HAZ} fontFamily="IBM Plex Mono" fontSize="11" letterSpacing="1.6">
          USER FEEDBACK → STEMG → NEXT ISSUE
        </text>
      </motion.svg>
      <p className="mt-3 border-t border-hair pt-2 font-mono text-[11px] leading-[1.7] text-ash">
        STEMG has written the standard since 1983. It changes when users report a problem with a rule. A new issue comes about every three years.
      </p>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Fig. 2 — the length of a sentence                                  */
/* ------------------------------------------------------------------ */
export function LengthDiagram() {
  const r = useReveal();
  const animate = Boolean(r.initial);
  const x0 = 250;
  const px = 16.5;
  const rows = [
    { label: "STE · procedure", note: "instruction, warning, caution", words: 20, kind: "ok" },
    { label: "STE · description", note: "general information, notes", words: 25, kind: "ok2" },
    { label: "Typical technical sentence", note: "before the rules", words: 34, kind: "over" },
  ];
  return (
    <Frame label="Fig. 2 — How long a sentence may be">
      <motion.svg
        viewBox="0 0 1000 268"
        className="h-auto w-full"
        role="img"
        aria-label="Bar chart: procedures maximum 20 words, descriptions maximum 25 words, a typical technical sentence 34 words"
        {...r}
      >
        {[0, 5, 10, 15, 20, 25, 30, 35, 40].map((n) => (
          <g key={n}>
            <line x1={x0 + n * px} y1={18} x2={x0 + n * px} y2={236} stroke={HAIR} strokeWidth="1" />
            <text x={x0 + n * px} y={254} textAnchor="middle" fill={ASH} fontFamily="IBM Plex Mono" fontSize="10">
              {n}
            </text>
          </g>
        ))}
        <line x1={x0 + 20 * px} y1={12} x2={x0 + 20 * px} y2={240} stroke={HAZ} strokeWidth="1.5" strokeDasharray="5 4" />
        <text x={x0 + 20 * px + 6} y={14} fill={HAZ} fontFamily="IBM Plex Mono" fontSize="10.5" letterSpacing="1">
          20
        </text>

        {rows.map((row, i) => {
          const y = 42 + i * 66;
          const full = row.words * px;
          const capped = Math.min(row.words, 20) * px;
          return (
            <g key={row.label}>
              <text x={0} y={y + 20} fill={INK} fontFamily="Archivo" fontSize="14" fontWeight="600">
                {row.label}
              </text>
              <text x={0} y={y + 38} fill={ASH} fontFamily="Archivo" fontSize="12">
                {row.note}
              </text>
              <motion.rect
                x={x0}
                y={y}
                height={30}
                fill={row.kind === "over" ? ASH : BLUE}
                initial={{ width: animate ? 0 : capped }}
                whileInView={{ width: capped }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.09, ease: "easeOut" }}
              />
              {row.kind === "over" && (
                <motion.rect
                  x={x0 + capped}
                  y={y}
                  height={30}
                  fill={HAZ}
                  initial={{ width: animate ? 0 : full - capped }}
                  whileInView={{ width: full - capped }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
                />
              )}
              <text
                x={x0 + full + 12}
                y={y + 21}
                fill={row.kind === "over" ? HAZ : INK}
                fontFamily="IBM Plex Mono"
                fontSize="12"
                fontWeight="500"
              >
                {row.words} words
              </text>
            </g>
          );
        })}
      </motion.svg>
      <p className="mt-3 border-t border-hair pt-2 font-mono text-[11px] leading-[1.7] text-ash">
        A number with its unit counts as one word. An abbreviation counts as one. A hyphenated group counts as one. Without those rules, the limit could be argued.
      </p>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Fig. 3 — active against passive                                    */
/* ------------------------------------------------------------------ */
export function VoiceDiagram() {
  const r = useReveal();
  const box = (x: number, y: number, w: number, t: string, stroke: string, fill: string) => (
    <g>
      <rect x={x} y={y} width={w} height={44} fill={fill} stroke={stroke} strokeWidth="1.25" />
      <text x={x + 12} y={y + 28} fill={INK} fontFamily="Archivo" fontSize="14.5">
        {t}
      </text>
    </g>
  );
  return (
    <Frame label="Fig. 3 — Who does the work, and where you find them">
      <motion.svg
        viewBox="0 0 1000 300"
        className="h-auto w-full"
        role="img"
        aria-label="A passive sentence compared with the same idea written in the active voice"
        {...r}
      >
        <defs>
          <marker id="fig3-right" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill={BLUE} />
          </marker>
          <marker id="fig3-up" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill={HAZ} />
          </marker>
        </defs>

        <text x={0} y={44} fill={HAZ} fontFamily="IBM Plex Mono" fontSize="11" letterSpacing="2">
          NON-STE · PASSIVE
        </text>
        <path
          d="M 409 66 L 409 34 L 246 34 L 246 62"
          fill="none"
          stroke={HAZ}
          strokeWidth="1.25"
          strokeDasharray="5 4"
          markerEnd="url(#fig3-up)"
        />
        <text x={430} y={38} fill={HAZ} fontFamily="IBM Plex Mono" fontSize="10.5" letterSpacing="1.4">
          THE DOER ARRIVES LAST, AS A FRAGMENT
        </text>
        {box(0, 66, 168, "These values", HAZ, "none")}
        {box(176, 66, 140, "are used", HAZ, "none")}
        {box(324, 66, 172, "by the computer", HAZ, "none")}
        {box(504, 66, 348, "to calculate the energy consumption.", HAZ, "none")}

        <text x={0} y={186} fill={BLUE} fontFamily="IBM Plex Mono" fontSize="11" letterSpacing="2">
          STE · ACTIVE
        </text>
        {box(0, 202, 158, "The computer", BLUE, "rgba(44,76,107,0.10)")}
        {box(166, 202, 158, "calculates", BLUE, "rgba(44,76,107,0.10)")}
        {box(332, 202, 352, "the energy consumption from these values.", BLUE, "rgba(44,76,107,0.10)")}
        <line x1={4} y1={266} x2={640} y2={266} stroke={BLUE} strokeWidth="1.5" markerEnd="url(#fig3-right)" />
        <text x={4} y={288} fill={BLUE} fontFamily="IBM Plex Mono" fontSize="11" letterSpacing="1.8">
          DOER → ACTION → OBJECT. ONE VERB, ONE ACTOR.
        </text>
      </motion.svg>
      <p className="mt-3 border-t border-hair pt-2 font-mono text-[11px] leading-[1.7] text-ash">
        The passive is allowed in descriptive text only when you do not know who does the work. In a procedure, it is never allowed.
      </p>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Fig. 4 — the funnel of the dictionary                              */
/* ------------------------------------------------------------------ */
export function FunnelDiagram() {
  const r = useReveal();
  const stroke = "#7d97a6";
  const text = "#e7e1d3";
  return (
    <figure className="mt-8 border border-paper/15 bg-plate plate-grid">
      <figcaption className="flex items-center justify-between gap-3 border-b border-paper/15 px-4 py-2">
        <span className="micro text-paper">Fig. 4 — The controlled vocabulary</span>
        <span className="micro shrink-0 text-paper/50">Part 2 · Dictionary</span>
      </figcaption>
      <div className="px-3 py-6 sm:px-6">
        <motion.svg
          viewBox="0 0 1000 430"
          className="h-auto w-full"
          role="img"
          aria-label="Funnel from a general dictionary of about 170000 headwords down to about 900 approved words, with technical nouns and verbs added, producing one unambiguous instruction"
          {...r}
        >
          <defs>
            <marker id="fig4-in" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill="#c9635c" />
            </marker>
            <marker id="fig4-down" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill={stroke} />
            </marker>
          </defs>

          <polygon points="60,44 940,44 770,168 230,168" fill="rgba(231,225,211,0.05)" stroke={stroke} strokeWidth="1.25" />
          <text x={500} y={100} textAnchor="middle" fill={text} fontFamily="IBM Plex Mono" fontSize="15" letterSpacing="1.4">
            ≈170,000 HEADWORDS IN A GENERAL DICTIONARY
          </text>
          <text x={500} y={126} textAnchor="middle" fill="#9fb4c0" fontFamily="Archivo" fontSize="13">
            every sense, every part of speech, every synonym
          </text>

          <polygon points="230,196 770,196 640,318 360,318" fill="rgba(179,38,30,0.16)" stroke="#c9635c" strokeWidth="1.25" />
          <text x={500} y={250} textAnchor="middle" fill="#f2eee4" fontFamily="IBM Plex Mono" fontSize="15" letterSpacing="1.4">
            ≈900 APPROVED WORDS
          </text>
          <text x={500} y={276} textAnchor="middle" fill="#e7b3af" fontFamily="Archivo" fontSize="13">
            one word, one part of speech, one meaning
          </text>

          <line x1={64} y1={250} x2={276} y2={250} stroke="#c9635c" strokeWidth="1.5" markerEnd="url(#fig4-in)" />
          <text x={64} y={228} fill="#c9635c" fontFamily="IBM Plex Mono" fontSize="11" letterSpacing="1.6">
            TECHNICAL NOUNS
          </text>
          <text x={64} y={274} fill="#c9635c" fontFamily="IBM Plex Mono" fontSize="11" letterSpacing="1.6">
            &amp; VERBS · RULES 1.5 / 1.12
          </text>

          <line x1={500} y1={322} x2={500} y2={352} stroke={stroke} strokeWidth="1.5" markerEnd="url(#fig4-down)" />
          <rect x={310} y={356} width={380} height={54} fill="rgba(231,225,211,0.10)" stroke={stroke} strokeWidth="1.25" />
          <text x={500} y={389} textAnchor="middle" fill="#f2eee4" fontFamily="IBM Plex Mono" fontSize="14" letterSpacing="1.6">
            ONE UNAMBIGUOUS INSTRUCTION
          </text>
        </motion.svg>
        <p className="mt-4 border-t border-paper/15 pt-3 font-mono text-[11px] leading-[1.8] text-paper/60">
          The dictionary also lists about 1,200 words that are not approved, with the word to use instead. Your own glossary fills the gaps: engine, grease, ream, torque wrench.
        </p>
      </div>
    </figure>
  );
}
