---
version: 1
slug: "src-pages-notfound-tsx"
primary_target: "src/pages/NotFound.tsx"
related_targets: []
---

# 404 page (src/pages/NotFound.tsx)

Scope: the page for any path with no file (Cloudflare serves 404.html with status 404; React Router draws NotFound). Mode: Operate. The reader came for an article and must reach it, or a good alternative, in one step.

Audience and job: a reader who mistyped an address or followed an old link (for example the early `/wiki/<slug>` scheme). Content: the requested path, the nine articles from the registry with their `added` and `updated` dates. Constraints: shared site bar unchanged (own `bar` theme only), STE copy, 375 px, reduced motion, real 404 status kept.

## Direction contract

THESIS: The 404 is the wiki's List of Effective Pages, the controlled-document page that lists every valid page with its issue and revision, with the requested address flagged against it and proofread toward the nearest real one. It refuses the category default: a giant 404 numeral, a joke, a centred "Go home" button.

OWN-WORLD: Technical dossier family. IBM Plex Mono only; off-white paper, near-black ink, olive-gray rules and labels; one petrol accent (#006d77), used only for the NOT ISSUED stamp and the NOT ISSUED flags (strip value, requested row, its cross), the proofreading marks and the nearest-page marker; links and the button hover stay in the ink family; ink change bars in the list margin; a ruled form strip; comb fields (one boxed cell per character); square corners, hairlines, 2 px ink rules.

STORY: The reader sees at once that no page has this address, sees the nearest real address with each correction marked, and opens it in one click. Without a near match, they scan all nine pages, or search.

FIRST VIEWPORT: Form strip across the top: document code LEP-01, revision, pages, the requested address flagged NOT ISSUED. Left column: "Page not found" display title, "not found" outlined; a rotated NOT ISSUED stamp; the STE lede with the path; the comb-field proof (typed row over effective row) with its FIG. 01 caption bar; the primary action "Open <address>" as a square ink button (the address, because the button repeats the proof's effective row and long titles wrapped to two uppercase lines; the accessible name adds the title). Right column: the List of Effective Pages table (change bar, page, title, issued, revised), the nearest row marked, and the requested address as its own NOT ISSUED row at its place by address. A key line under it. All on one 1440x900 screen; on a phone: strip, title, proof, list.

FORM: The user's pinned concept "Not in the List of Effective Pages" (no roll; direction pinned). Signature move: the comb-field proofreading diff of the typed address against the nearest slug, its delete, insert and change marks drawn once on load. seed: none (direction pinned by the user; no roll)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
