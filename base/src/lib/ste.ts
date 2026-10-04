/**
 * A teaching checker for ASD-STE100.
 * It judges only what can be judged from the text alone:
 * sentence length, verb forms, the active voice, and a sample of
 * vocabulary substitutions. It is NOT a conformance tool.
 */

export type Severity = "error" | "warn" | "note";

export interface Finding {
  severity: Severity;
  rule: string;
  message: string;
  start: number;
  length: number;
  snippet: string;
}

export interface SentenceInfo {
  text: string;
  words: number;
  start: number;
}

export interface Analysis {
  sentences: SentenceInfo[];
  words: number;
  limit: number;
  findings: Finding[];
  /** non-overlapping ranges used to draw the inline marks */
  marks: Finding[];
  errors: number;
  warns: number;
  notes: number;
  rewrite: string;
}

interface Entry {
  pattern: string;
  replacement: string;
  rule: string;
  severity: Severity;
  message: string;
}

/* ------------------------------------------------------------------ */
/* Vocabulary: a small, illustrative sample of the STE dictionary.     */
/* ------------------------------------------------------------------ */

const LEX: Entry[] = [
  { pattern: "\\bin order to\\b", replacement: "to", rule: "§1", severity: "error", message: "'in order to' is wordy. Use 'to'." },
  { pattern: "\\bprior to\\b", replacement: "before", rule: "§1", severity: "error", message: "'prior to' is not approved. Use 'before'." },
  { pattern: "\\bsubsequent to\\b", replacement: "after", rule: "§1", severity: "error", message: "'subsequent to' is not approved. Use 'after'." },
  { pattern: "\\bin the event that\\b", replacement: "if", rule: "§1", severity: "error", message: "'in the event that' is wordy. Use 'if'." },
  { pattern: "\\bdue to the fact that\\b", replacement: "because", rule: "§1", severity: "error", message: "'due to the fact that' is wordy. Use 'because'." },
  { pattern: "\\bat this point in time\\b", replacement: "now", rule: "§1", severity: "error", message: "'at this point in time' is wordy. Use 'now'." },
  { pattern: "\\bin the vicinity of\\b", replacement: "near", rule: "§1", severity: "error", message: "'in the vicinity of' is wordy. Use 'near'." },
  { pattern: "\\bwith the exception of\\b", replacement: "except", rule: "§1", severity: "error", message: "'with the exception of' is wordy. Use 'except'." },
  { pattern: "\\butili[sz]e\\b", replacement: "use", rule: "§1", severity: "error", message: "'utilize' is not approved. Use 'use'." },
  { pattern: "\\bcommence\\b", replacement: "start", rule: "§1", severity: "error", message: "STE uses only 'start' for this meaning." },
  { pattern: "\\binitiate\\b", replacement: "start", rule: "§1", severity: "error", message: "STE uses only 'start' for this meaning." },
  { pattern: "\\bbegin\\b", replacement: "start", rule: "§1", severity: "error", message: "STE uses only 'start' for this meaning." },
  { pattern: "\\baccomplish\\b", replacement: "do", rule: "§1", severity: "error", message: "'accomplish' is not approved. Use 'do'." },
  { pattern: "\\bperform\\b", replacement: "do", rule: "§1", severity: "error", message: "'perform' is not approved. Use 'do'." },
  { pattern: "\\bensure\\b", replacement: "make sure", rule: "§1", severity: "error", message: "'ensure' is not approved. Use 'make sure'." },
  { pattern: "\\bacquire\\b", replacement: "get", rule: "§1", severity: "error", message: "'acquire' is not approved. Use 'get'." },
  { pattern: "\\bobtain\\b", replacement: "get", rule: "§1", severity: "error", message: "'obtain' is not approved. Use 'get'." },
  { pattern: "\\bassist\\b", replacement: "help", rule: "§1", severity: "warn", message: "'assist' is not in the approved list. Check the dictionary." },
  { pattern: "\\bapproximately\\b", replacement: "about", rule: "§1", severity: "error", message: "'approximately' is not approved. Use 'about'." },
  { pattern: "\\badditional\\b", replacement: "more", rule: "§1", severity: "error", message: "'additional' is not approved. Use 'more'." },
  { pattern: "\\bsufficient\\b", replacement: "enough", rule: "§1", severity: "error", message: "'sufficient' is not approved. Use 'enough'." },
  { pattern: "\\bterminate\\b", replacement: "stop", rule: "§1", severity: "error", message: "'terminate' is not approved. Use 'stop'." },
  { pattern: "\\battempt(?:ed|s)?\\b", replacement: "try", rule: "§1", severity: "warn", message: "'attempt' is not in the approved list. Check the dictionary." },
  { pattern: "\\bremainder\\b", replacement: "rest", rule: "§1", severity: "warn", message: "'remainder' has more than one sense. Use 'rest'." },
  { pattern: "\\bthe majority of\\b", replacement: "most", rule: "§1", severity: "error", message: "'the majority of' is wordy. Use 'most'." },
  { pattern: "\\bacessible\\b", replacement: "get access", rule: "§1", severity: "warn", message: "'accessible' is not approved. Use the noun 'access'." },
  { pattern: "\\bacceptance\\b", replacement: "accept", rule: "§1", severity: "warn", message: "'acceptance' is not approved. Use the verb 'accept'." },
  { pattern: "\\bis operable\\b", replacement: "can operate", rule: "§1", severity: "error", message: "Use 'can operate', not 'is operable'." },
  { pattern: "\\bgo close to\\b", replacement: "go near", rule: "§1", severity: "error", message: "The adjective 'close' is not approved. Use 'near'." },
  { pattern: "\\bfollow (the )?(safety )?instructions\\b", replacement: "obey $1$2instructions", rule: "§1", severity: "error", message: "Use 'obey' with instructions, not 'follow'." },
  { pattern: "\\betc\\.", replacement: "", rule: "§8", severity: "warn", message: "Do not use 'etc.'. Write the full list." },

  /* phrasal verbs — Rule 9.3 */
  { pattern: "\\bcarry out\\b", replacement: "do", rule: "9.3", severity: "error", message: "Do not make a phrasal verb. Use 'do'." },
  { pattern: "\\bput out\\b", replacement: "extinguish", rule: "9.3", severity: "error", message: "Do not make a phrasal verb. Use 'extinguish'." },
  { pattern: "\\bset up\\b", replacement: "install", rule: "9.3", severity: "error", message: "Do not make a phrasal verb. Use 'install'." },
  { pattern: "\\bfind out\\b", replacement: "determine", rule: "9.3", severity: "error", message: "Do not make a phrasal verb. Use 'determine'." },

  /* nominalisations — Rule 3.7 */
  { pattern: "\\binspections?\\b", replacement: "inspect", rule: "3.7", severity: "warn", message: "Use the verb 'inspect' instead of the noun." },
  { pattern: "\\binstallations?\\b", replacement: "install", rule: "3.7", severity: "warn", message: "Use the verb 'install' instead of the noun." },
  { pattern: "\\bremovals?\\b", replacement: "remove", rule: "3.7", severity: "warn", message: "Use the verb 'remove' instead of the noun." },
  { pattern: "\\bverifications?\\b", replacement: "verify", rule: "3.7", severity: "warn", message: "Use the verb 'verify' instead of the noun." },
  { pattern: "\\badjustments?\\b", replacement: "adjust", rule: "3.7", severity: "warn", message: "Use the verb 'adjust' instead of the noun." },
  { pattern: "\\blubrications?\\b", replacement: "lubricate", rule: "3.7", severity: "warn", message: "Use the verb 'lubricate' instead of the noun." },
  { pattern: "\\bcommencement\\b", replacement: "start", rule: "§1", severity: "warn", message: "'commencement' is not approved. Use 'start'." },
  { pattern: "\\bin compliance with\\b", replacement: "as", rule: "§1", severity: "warn", message: "'in compliance with' is wordy. Use 'as' or 'with'." },
  { pattern: "\\bat the earliest opportunity\\b", replacement: "now", rule: "§1", severity: "warn", message: "'at the earliest opportunity' is wordy. Say exactly when." },
];

/* patterns that need context, checked separately */
const STRUCT: { pattern: string; rule: string; severity: Severity; message: string }[] = [
  { pattern: "\\b(?:has|have|had) been\\b", rule: "§3", severity: "error", message: "Present and past perfect are not allowed. Use simple past." },
  { pattern: "\\b(?:is|are|was|were|am)\\s+\\w+ing\\b", rule: "§3", severity: "error", message: "Progressive verb forms are not allowed." },
  { pattern: "\\b(?:is|are|was|were)\\s+(?:\\w+ed|installed|made|given|taken|shown|used|written|closed|opened|removed|checked)\\b", rule: "§4", severity: "warn", message: "This can be a passive construction. Use the active voice." },
  { pattern: "\\bby the\\b", rule: "§4", severity: "warn", message: "'by the …' often marks a passive sentence. Use the active voice." },
  { pattern: "\\band then\\b", rule: "§5", severity: "warn", message: "Write one instruction per sentence." },
  { pattern: ";", rule: "§5", severity: "warn", message: "A semicolon joins two instructions. Split the sentence." },
];

const WORD_RE =
  /\d+(?:[.,]\d+)?\s?(?:mm|cm|km|m|kg|g|N|psi|kPa|MPa|bar|°C|°F|V|A|W|kW|in|ft|lb|hr|min|s|rpm|L)\b|[\p{L}][\p{L}'’-]*|\d+/gu;

export function countWords(text: string): number {
  return (text.match(WORD_RE) ?? []).length;
}

function splitSentences(text: string): SentenceInfo[] {
  const out: SentenceInfo[] = [];
  const re = /[^.!?]+[.!?]+|\S[^.!?]*$/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = m[0];
    const lead = raw.length - raw.trimStart().length;
    const body = raw.trim();
    if (!body) continue;
    out.push({ text: body, words: countWords(body), start: m.index + lead });
  }
  return out;
}

function collect(text: string, pattern: string): { start: number; length: number }[] {
  const res: { start: number; length: number }[] = [];
  let re: RegExp;
  try {
    re = new RegExp(pattern, "gi");
  } catch {
    return res;
  }
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[0].length === 0) {
      re.lastIndex += 1;
      continue;
    }
    res.push({ start: m.index, length: m[0].length });
  }
  return res;
}

export function analyze(text: string, mode: "procedure" | "description"): Analysis {
  const limit = mode === "procedure" ? 20 : 25;
  const sentences = splitSentences(text);
  const findings: Finding[] = [];
  const lengths: Finding[] = [];

  /* vocabulary + construction findings */
  for (const e of LEX) {
    for (const hit of collect(text, e.pattern)) {
      findings.push({
        severity: e.severity,
        rule: e.rule,
        message: e.message,
        start: hit.start,
        length: hit.length,
        snippet: text.substr(hit.start, hit.length),
      });
    }
  }
  for (const s of STRUCT) {
    for (const hit of collect(text, s.pattern)) {
      findings.push({
        severity: s.severity,
        rule: s.rule,
        message: s.message,
        start: hit.start,
        length: hit.length,
        snippet: text.substr(hit.start, hit.length),
      });
    }
  }

  /* sentence length — highlight only the words past the limit */
  for (const s of sentences) {
    if (s.words <= limit) continue;
    let cursor = 0;
    let seen = 0;
    let start = -1;
    const re = new RegExp(WORD_RE.source, "gu");
    let m: RegExpExecArray | null;
    while ((m = re.exec(s.text)) !== null) {
      if (seen === limit) {
        start = m.index;
        break;
      }
      seen += 1;
      cursor = m.index + m[0].length;
    }
    if (start < 0) start = Math.min(cursor, s.text.length);
    lengths.push({
      severity: "error",
      rule: "§4",
      message: `This sentence has ${s.words} words. The limit is ${limit}.`,
      start: s.start + start,
      length: Math.max(1, s.text.length - start),
      snippet: s.text.slice(start),
    });
  }

  /* word-level findings may not overlap each other */
  findings.sort((a, b) => a.start - b.start || a.length - b.length);
  const clean: Finding[] = [];
  let edge = -1;
  for (const f of findings) {
    if (f.start < edge) continue;
    clean.push(f);
    edge = f.start + f.length;
  }

  /* inline marks: keep the specific findings, then fit the over-length
     ranges around them so that no mark is swallowed by another */
  const marks: Finding[] = [...clean];
  for (const len of lengths) {
    let pieces: { start: number; length: number }[] = [{ start: len.start, length: len.length }];
    for (const c of clean) {
      if (c.start + c.length <= len.start || c.start >= len.start + len.length) continue;
      const next: { start: number; length: number }[] = [];
      for (const p of pieces) {
        if (c.start + c.length <= p.start || c.start >= p.start + p.length) {
          next.push(p);
          continue;
        }
        if (c.start > p.start) next.push({ start: p.start, length: c.start - p.start });
        if (c.start + c.length < p.start + p.length) {
          next.push({
            start: c.start + c.length,
            length: p.start + p.length - (c.start + c.length),
          });
        }
      }
      pieces = next;
    }
    for (const p of pieces) {
      if (p.length < 2) continue;
      marks.push({ ...len, start: p.start, length: p.length, snippet: text.substr(p.start, p.length) });
    }
  }
  marks.sort((a, b) => a.start - b.start);

  const list = [...clean, ...lengths].sort((a, b) => a.start - b.start);

  return {
    sentences,
    words: countWords(text),
    limit,
    findings: list,
    marks,
    errors: list.filter((f) => f.severity === "error").length,
    warns: list.filter((f) => f.severity === "warn").length,
    notes: list.filter((f) => f.severity === "note").length,
    rewrite: makeRewrite(text, limit),
  };
}

/* ------------------------------------------------------------------ */
/* An approximate rewrite: substitute approved words, then split any   */
/* sentence that is still longer than the limit.                       */
/* ------------------------------------------------------------------ */

function makeRewrite(text: string, limit: number): string {
  let t = text.trim();
  if (!t) return "";
  for (const e of LEX) {
    try {
      t = t.replace(new RegExp(e.pattern, "gi"), e.replacement || " ");
    } catch {
      /* ignore */
    }
  }
  t = t.replace(/\s{2,}/g, " ").replace(/\s+([.,;:])/g, "$1");

  const parts = splitSentences(t);
  const out: string[] = [];
  const CONNECTOR = /^(and|but|before|after|then|so)$/i;

  for (const p of parts) {
    let s = p.text.trim();
    let guard = 0;
    while (countWords(s) > limit && guard < 6) {
      guard += 1;
      const words = s.split(/\s+/);
      const headWords = words.slice(0, limit);
      let cut = -1;
      for (let i = headWords.length - 1; i >= Math.floor(limit * 0.3); i--) {
        const w = headWords[i];
        if (/[,;:]$/.test(w)) {
          cut = i + 1;
          break;
        }
        if (CONNECTOR.test(w.replace(/[.,;:]/g, ""))) {
          cut = i;
          break;
        }
      }
      if (cut < 3) break;
      const head = headWords.slice(0, cut).join(" ").replace(/[,;:]$/, "").trim();
      const tail = words
        .slice(cut)
        .join(" ")
        .replace(/^(and|but|which|that|when|before|after|then)\s+/i, "")
        .trim();
      if (!head || !tail) break;
      out.push(capitalise(head) + ".");
      s = capitalise(tail);
    }
    if (s) out.push(/[.!?]$/.test(s) ? s : s + ".");
  }
  return out.join(" ");
}

function capitalise(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/* ------------------------------------------------------------------ */

export const SAMPLES: { label: string; mode: "procedure" | "description"; text: string }[] = [
  {
    label: "A maintenance instruction",
    mode: "procedure",
    text: "In order to make sure that the hydraulic system is operable, prior to the commencement of the work, the technician should utilize the specified test equipment and then perform an inspection of the filter for any additional restrictions which have been caused by the installation of the new seals.",
  },
  {
    label: "A short procedure",
    mode: "procedure",
    text: "The cover is removed by the technician and the bolts are checked for damage, and then the sealing surface is wiped clean with a lint-free cloth, and then the new gasket is put in position.",
  },
  {
    label: "A safety warning",
    mode: "procedure",
    text: "Do not go close to the landing gear.",
  },
  {
    label: "Descriptive text",
    mode: "description",
    text: "The engine control unit has been designed to reduce the fuel flow when the temperature of the oil is high, and it gives an alert to the crew in order to make sure that the correct action is taken at this point in time.",
  },
];

export const TOKEN =
  /\d+(?:[.,]\d+)?\s?(?:mm|cm|km|m|kg|g|N|psi|kPa|MPa|bar|°C|°F|V|A|W|kW|in|ft|lb|hr|min|s|rpm|L)\b|[\p{L}][\p{L}'’-]*|\d+/gu;
