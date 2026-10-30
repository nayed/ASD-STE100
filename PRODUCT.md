# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The owner, Nayed Saïd Ali, first: the wiki holds the notes they learn programming concepts from (stack vs heap, RAG, Go, Podman, CI/CD, random forests, LLM text generation…), and they come back to them as a reference. Other readers second: the site is public at asd-ste100.nayed.dev and its content is CC BY 4.0, so other developers can read, share and adapt it, but no article is written for an audience the owner is not part of.

## Product Purpose

A personal technical wiki: each article explains one programming concept in plain, controlled English with diagrams, as a web page the reader can explore. It exists to make hard topics understandable at a glance and on a second read. Success: the owner understands the topic after reading their own article, and finds the answer again fast when they come back.

The idea comes from Andrej Karpathy's advice (the tweet in README.md): ask an LLM to explain a topic in ASD-STE100, then as diagrams, then as an interactive web page. Most articles were built by LLMs (Mimo, Qwen, Kimi, GLM, Claude) from one standard prompt; that is how the pages are made, not what the wiki is about. The articles are the product.

## Positioning

Every article is written in ASD-STE100 Simplified Technical English (short sentences, active voice, one instruction per sentence) and explains with figures first, many of them interactive, each in its own "technical dossier" design. The numbers, outputs and listings are measured from real runs, not invented. A generic wiki or tutorial site has neither the controlled language, nor a bespoke design per topic, nor measured exhibits.

## Operating Context

- Reading: on desktop and on a phone; an article is read in full once, then used as a reference (search box, A–Z index at `/articles`, in-page section anchors).
- Writing: the owner adds articles over time with LLM help. New dossiers follow the project skill `.claude/skills/dossier-design/`; CLAUDE.md records the standard prompt, the article origins and the workflow (commit straight to `main`, Netlify deploys on push).
- The homepage is the ASD-STE100 article itself, which explains the standard the rest of the wiki is written in, and includes a teaching STE checker.

## Capabilities and Constraints

- One article per programming concept; each is its own folder and its own lazy chunk, registered in `src/articles/registry.ts` with a publication date (`added`) and a last-edit date (`updated`).
- Shared site chrome is only the 44px site bar (logo, owner, search); its layout and behaviour never change, only its colours follow each article. Everything below it belongs to the article.
- Article search (title, tags, slug, summary), a "recently updated" list and an A–Z index.
- Code listings are real files highlighted at build time; data-driven articles keep the scripts that measured their data in `scripts/<slug>/`.
- Static SPA, no backend, no accounts, no analytics.

## Brand Commitments

- Name and owner: "Nayed Saïd Ali · personal wiki", with the folder-and-tools favicon/logo in each article's accent.
- Voice: ASD-STE100 in article copy, held to its rules (headings, tables and labels excepted). Plain, direct, no marketing tone.
- Each article has its own technical-dossier design; there is no shared article template, and articles are meant to look different from each other.
- Licences: code MIT, content CC BY 4.0; third-party material (the Go gopher by Renée French, ASD-STE100) is credited inside the article that uses it.

## Evidence on Hand

- Nine published articles in `src/articles/` (asd-ste100, rag, stack-vs-heap, random-forest, go-programming, podman-basics, ci-cd, llm-generation, websocket).
- Measured data: RAG scores, vectors and answers from real runs of `BAAI/bge-small-en-v1.5` (`scripts/rag/`); real addresses in stack vs heap; a real scikit-learn run in random forest; a real WebSocket session captured byte by byte (`scripts/websocket/`).
- No testimonials, reader numbers or external reviews exist; do not invent them.

## Product Principles

1. Understanding first: a figure or an interaction that explains beats a paragraph that describes.
2. Controlled language: every article's copy follows ASD-STE100 closely enough to pass the project's STE checks.
3. Real over plausible: show measured values and real code; mark anything invented (such as the RAG example manual) as invented.
4. Each topic gets its own design, at the craft level of the best existing dossiers; a correct but generic page is a failure.
5. Built to come back to: findable by search and index, stable URLs, and fast to scan on a second visit.

## Accessibility & Inclusion

Required for every article, not optional: works at 375px phone width without horizontal page scroll, honours reduced motion (animations off or static), and keeps text and diagram labels readable in contrast and size. STE copy itself serves non-native English readers.
