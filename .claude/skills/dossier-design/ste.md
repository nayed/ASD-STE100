# The STE sentence check

Use this when the brief asks for ASD-STE100. Run it on the rendered page, fix every hit, and run it again. Deliver only when it reports nothing.

## The check

Paste into the browser console on the finished page. Set `ROOT` to the article's root element.

```js
const ROOT = document.querySelector("main");
// a number with its unit counts as one word, as in the STE rule
const WORD = /\d[\d.,]*\s?(?:%|ms|s|kg|km|m|mm|cm|g|°C|kB|KiB|MiB|MB|GB|B|psi|Nm)\b|[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu;
const PASSIVE = /\b(is|are|was|were|be|been|being)\s+(\w+ly\s+)?\w+(ed|en)\b/i;
const SKIP = "pre, code, svg, nav, button, label, h1, h2, h3, h4, h5, h6, figcaption, thead"; // code, drawings, labels
// group the text by its block element, so that callouts and figure panels written as <div> are checked too
const blockOf = (node) => {
  for (let e = node.parentElement; e && e !== ROOT; e = e.parentElement)
    if (!/^(inline|contents)/.test(getComputedStyle(e).display)) return e;
  return ROOT;
};
const blocks = new Map();
const walk = document.createTreeWalker(ROOT, NodeFilter.SHOW_TEXT);
for (let n; (n = walk.nextNode()); ) {
  if (!n.textContent.trim() || n.parentElement.closest(SKIP)) continue;
  const b = blockOf(n);
  blocks.set(b, (blocks.get(b) ?? "") + n.textContent);
}
const out = [];
for (const text of blocks.values())
  text.replace(/\s+/g, " ").trim()
    .split(/(?<=[.!?])\s+(?=[A-Z“"(\[])/)
    .forEach((s) => {
      const words = (s.match(WORD) || []).length;
      if (words > 20) out.push(`${words} words: ${s}`);
      else if (PASSIVE.test(s)) out.push(`passive: ${s}`);
    });
console.log(out.length ? out.join("\n") : "STE check: nothing to fix");
```

The check reads only what is on the page. Text that appears in another state (a selected block, a preset, a verdict, a fault) is not there yet: check those strings in the source, or select each state and run the check again.

The limit here is 20 words for every sentence. STE allows 25 for descriptive text, but 20 everywhere is simpler and reads better. The passive test is crude: it also flags adjectives such as "is used to". Read each hit and decide.

Headings, labels, table headers, captions, code and figure text are exempt, as in STE itself.

## Rewrites that fix most hits

| Problem | Before | After |
|---|---|---|
| Two facts in one sentence | "The index holds a vector for each chunk, and the retriever compares the question with each one." | "The index holds a vector for each chunk. The retriever compares the question with each vector." |
| A colon or semicolon that joins sentences | "RAG fixes this at query time: it finds the passages and puts them in the prompt." | "RAG fixes this at query time. It finds the passages. It puts them in the prompt." |
| Passive voice | "The chunks are stored in the index." | "The system stores the chunks in the index." |
| A noun where a verb works | "Perform a retrieval of the documents." | "Retrieve the documents." |
| An empty opening | "It is important to note that the model can be wrong." | "The model can be wrong." |
| A list hidden in a sentence | "Store the source, the section, the date and the access rights with each chunk, because…" | A numbered procedure, one item per line. |

Also: one word, one meaning (do not switch between "chunk", "part" and "passage" for the same thing), simple present tense, and warnings that start with the command.
