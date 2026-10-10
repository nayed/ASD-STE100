# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A personal technical wiki. Each article explains a programming concept with diagrams. The homepage (`/`) is the ASD-STE100 article. Stack: React 19, Vite 7, React Router 7, Tailwind CSS v4 (via `@tailwindcss/vite`), framer-motion, TypeScript (strict). The site is a client-side SPA built for a static host with a rewrite to `index.html`: `public/_redirects` serves Netlify and Cloudflare, `vercel.json` serves Vercel. It deploys on Netlify at asd-ste100.nayed.dev; `netlify.toml` holds the build command (type-check, then build, so a type error blocks the deploy), publish directory, Node version and cache headers. `.github/workflows/ci.yml` runs `npm ci`, type-check and build on pull requests and pushes to `main`; Netlify deploys independently of it. The CI/CD article imports that workflow with `?raw`, so moving or renaming it breaks the build.

## Licensing

Code is MIT (`LICENSE`); article content (text, diagrams, figures) is CC BY 4.0 (`LICENSE-CONTENT`, which also lists third-party material such as the Go gopher and ASD-STE100). Credit third-party artwork inside the article that uses it, as the Go footer does for Renée French's gopher.

## Commands

- `npm run dev`: start the Vite dev server
- `npm run build`: production build into `dist/`
- `npm run preview`: serve the build
- `npm run typecheck`: `tsc --noEmit`. `vite build` does not type-check

There is no linter and no test suite.

## Architecture

- `src/articles/registry.ts` (`ARTICLES`) is the single source of truth for routing, titles and the planned search. Each entry has a `slug`, `title`, `summary`, `tags`, an `added` date (`YYYY-MM-DD`, drives "recently added") and a `load: () => import("./<slug>")`. Build links with `articlePath(slug)`.
- `src/App.tsx` sets up the routes. `/` renders `HOME_SLUG` (from `src/site.ts`). `/:slug` renders through `pages/ArticlePage.tsx`, which looks up the registry, lazy-loads the article as its own chunk, and sets `document.title`. `/articles` (`INDEX_PATH`) is the A–Z index (`pages/ArticlesIndex.tsx`, grouped by first letter with a sticky letter bar), so `articles` must never be used as a slug. Any unknown path shows `pages/NotFound.tsx`.
- `components/ScrollManager.tsx` runs only when the path changes: it scrolls to the top, or to the `#hash` element once it renders after the lazy load. Hash changes on the same page are left to the browser so that `scroll-behavior: smooth` works; in-page anchors stay plain `<a href="#id">`.
- **Each article is a folder** in `src/articles/<slug>/`. Its `index.tsx` default-exports a component that owns the whole page: layout, header and design. There is no shared site chrome. Articles are meant to look different from each other.
- **To add an article:** create `src/articles/<slug>/index.tsx`, then add an entry to `ARTICLES`, including a `bar` theme that matches the article's design. Put any article-specific CSS in the folder, import it from the article, and scope it under a root class. CSS from a lazy chunk stays loaded after you navigate away, so unscoped rules leak into other articles.
- **Shared site bar on every page:** `components/SiteShell.tsx` renders `components/SiteBar.tsx` (owner on the left, search on the right) above each article and the 404 page. The bar's layout and behaviour never change. Its colours and type come from `--bar-*` CSS variables, built by `barVars()` in `components/theme.ts` from the article's optional `bar` field in the registry, with `DEFAULT_BAR` filling any gaps. It is a 44px sticky bar (`--site-bar-h`). Articles must not draw their own site header, and fixed or sticky parts of an article must sit below `var(--site-bar-h)`.
- **Favicon:** a folder holding a protractor and a ruler; the folder takes the page's `bar.accent`, the tools stay cream. `components/favicon.ts` draws it (`faviconSvg`, `flatSvg`) and picks the colours (`folderColors`: darkened until the cream tools read at 3:1, lightened for dark tab bars until the folder shows at 2:1). `SiteShell` calls `setFavicon()` on every page. The SVG hides its ticks below 40 px with a media query. `npm run favicons` (`scripts/favicons.ts`, rendered with `@resvg/resvg-js`) regenerates `public/favicon.svg`, `favicon.ico` and `apple-touch-icon.png` from the same drawing; run it after changing the drawing.
- `src/search/` holds design-free article search. `searchArticles(query)` matches all query terms against title, tags, slug and summary, ignoring accents, and orders by match quality then A–Z (`byTitle`). `recentArticles(n)` sorts by `added`, newest first; `groupByLetter` feeds the index page. The `useArticleSearch()` hook adds the query, results, highlighted row, keyboard handling (↑ ↓ Enter Esc) and the global `/` shortcut. An empty box shows the `RECENT_LIMIT` (5) newest articles; typing shows at most `RESULT_LIMIT` (8) matches plus a "+N more" note. The last row always opens the A–Z index, and `active === indexRow` selects it. `SiteBar` is built on it.
- `src/index.css` is the only Tailwind entry point. It holds the shared `@theme` tokens (the ASD palette: `paper`, `ink`, `hazard`, `blueprint`…; the Go article's palette, prefixed `go-*`, and the Podman article's, prefixed `pd-*`, because their `paper`/`ink` differ; and the fonts `display`/`mono`/`serif`, which load from Google Fonts in `index.html`) and a neutral `body`. When an imported article brings its own theme, prefix its colour names rather than reusing existing ones. Tailwind only emits theme variables that classes use, so article CSS should use literal values for colours no class references. Imported dossiers tend to pin bars to `top: 0` and size offsets for their own chrome: move fixed/sticky parts below `var(--site-bar-h)`, add it to `scroll-margin` values, and check phone width for grid items that need `min-w-0` and tables that need a scroll wrapper. A dossier delivered as one `.html` file (`random-forest`, `ci-cd`) keeps its markup as static JSX and its script as a module that mounts on the article root and returns a cleanup (`ci-cd/sim.ts`); its palette stays as CSS variables on the root class rather than Tailwind tokens. While such a file sits in the project root, `npm run dev` serves it at `/<name>` instead of the SPA route, so delete it before testing the port.

### ASD-STE100 article (`src/articles/asd-ste100/`)

- `index.tsx` is the page (§01–§07, ids `s01`…`s07`, listed in `NAV`). Its fixed article nav (with the scroll progress line) sits at `top: var(--site-bar-h)`, under the shared bar. The sticky `Section` margin (`lg:top-[5.5rem]`) and `section[id]` `scroll-margin-top` in `asd.css` assume both 44px bars. `asd.css` holds its custom classes (`.micro`, `.paper-grid`, `.rail-rule`, `.tnum`…), all scoped under `.asd`.
- `components/Chrome.tsx` has the article's typographic primitives: `Section`, `Kicker`, `H2`, `Lead`, `P`, `Caption`, `Clause`, `Example`, and `useReveal()`, which turns off under reduced motion. `Diagrams.tsx` has the hand-built SVG figures. `RuleBook.tsx` is §04.
- `lib/ste.ts` is the checker engine, with no React. `analyze(text, mode)`:
  - Uses `LEX` (regex → replacement vocabulary sample) for both findings and `makeRewrite`.
  - Uses `STRUCT` (tense, passive and multi-instruction patterns) for findings only.
  - Limits sentences to 20 words for `procedure` and 25 for `description`.
  - `findings` is the full list. `marks` is a non-overlapping subset that `Checker.tsx` uses for inline highlights.
  - `WORD_RE` counts a number plus a unit as one word. `TOKEN` duplicates it.
- The copy of this article is itself written in STE: short sentences, active voice, one instruction per sentence. Headings, tables and labels are exceptions. Keep edits to it within these rules. The checker is a teaching aid, not a conformance tool, so keep that disclaimer.
- Images live in `images/` and are imported as modules.
