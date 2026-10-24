/**
 * Checks every diagram on the built site for labels that collide or get cut off:
 *   - two labels overlapping,
 *   - a line running through a label,
 *   - a label partly over a filled bar or box,
 *   - a label running past the edge of its drawing.
 *
 *   npm run build && npm run check:figures
 *
 * It serves dist/ with Vite's preview server, finds every article through the
 * A–Z index, scrolls each page so that reveal-on-scroll figures appear, and
 * exits with an error if any diagram has a problem. Needs Playwright's
 * Chromium: npx playwright install --only-shell chromium
 */
import { chromium, type Page } from "playwright";
import { preview } from "vite";

type Problem = { figure: string; issues: string[] };

/**
 * Runs inside the page. Must stay self-contained: Playwright serializes it.
 * Rules that keep intended designs from being reported:
 *   - text with a halo (paint-order: stroke) may sit on lines;
 *   - shapes filled with the drawing's background colour are masks, not content;
 *   - text that sits fully inside a filled shape (a label on its own box or
 *     badge) is only checked against shapes painted above that shape;
 *   - text is measured by its visible band, not its line box: the line box adds
 *     the font's ascent and descent, which differ between machines;
 *   - a stroke only counts where no filled shape is painted over it (chips and
 *     label patches that deliberately cover a line);
 *   - an element counts as hidden when it or a parent group is transparent.
 */
function inspectFigures(): Problem[] {
  const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).join(",");
  const overlap = (a: DOMRect, b: DOMRect, m = 1) =>
    a.left + m < b.right - m && b.left + m < a.right - m && a.top + m < b.bottom - m && b.top + m < a.bottom - m;
  const contains = (outer: DOMRect, inner: DOMRect) =>
    outer.left <= inner.left + 1 && outer.right >= inner.right - 1 && outer.top <= inner.top + 1 && outer.bottom >= inner.bottom - 1;
  const background = (el: Element) => {
    for (let e: Element | null = el; e; e = e.parentElement) {
      const c = getComputedStyle(e).backgroundColor;
      if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return rgb(c);
    }
    return "255,255,255";
  };

  const svgs = [...document.querySelectorAll("svg")].filter(
    (s) => !s.closest(".sticky") && s.getBoundingClientRect().width > 100,
  );
  const problems: Problem[] = [];

  svgs.forEach((svg, index) => {
    const bg = background(svg);
    const box = svg.getBoundingClientRect();
    const order = [...svg.querySelectorAll("*")];
    const visible = (el: Element) => {
      if (el.getBoundingClientRect().width <= 0) return false;
      for (let e: Element | null = el; e && e !== svg.parentElement; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) <= 0.05) return false;
      }
      return true;
    };
    /** filled shapes, in paint order, that can cover a stroke (including background-coloured patches) */
    const covers = [...svg.querySelectorAll("rect, circle, polygon")]
      .filter((s) => {
        const cs = getComputedStyle(s);
        return visible(s) && cs.fill !== "none" && !/rgba\(0, 0, 0, 0\)/.test(cs.fill) && Number(cs.fillOpacity) >= 0.9;
      })
      .map((s) => ({ r: s.getBoundingClientRect(), at: order.indexOf(s) }));
    const covered = (x: number, y: number, strokeAt: number) =>
      covers.some((c) => c.at > strokeAt && x >= c.r.left && x <= c.r.right && y >= c.r.top && y <= c.r.bottom);
    const texts = [...svg.querySelectorAll("text")]
      .filter((t) => t.textContent?.trim() && visible(t))
      .map((t) => {
        const r = t.getBoundingClientRect();
        // the visible band: trim the line box's ascent/descent padding
        const ink = new DOMRect(r.left, r.top + r.height * 0.18, r.width, r.height * 0.64);
        return { el: t, label: t.textContent!.trim().slice(0, 40), r, ink };
      });
    const issues: string[] = [];

    // 1. label over label
    for (let i = 0; i < texts.length; i++)
      for (let j = i + 1; j < texts.length; j++)
        if (overlap(texts[i].ink, texts[j].ink)) issues.push(`labels overlap: "${texts[i].label}" / "${texts[j].label}"`);

    // 2. strokes through a label: lines in any direction, polylines and paths, sampled every ~3px
    const strokes = [...svg.querySelectorAll("line, polyline, path")].filter((el) => {
      const cs = getComputedStyle(el);
      return visible(el) && cs.stroke !== "none" && !/rgba\(0, 0, 0, 0\)/.test(cs.stroke) && Number(cs.strokeOpacity) > 0.1;
    }) as SVGGeometryElement[];
    const samples = strokes.map((el) => {
      const at = order.indexOf(el);
      const ctm = el.getScreenCTM();
      const pts: { x: number; y: number }[] = [];
      if (!ctm) return pts;
      let length = 0;
      try {
        length = el.getTotalLength();
      } catch {
        return pts;
      }
      const step = 3 / Math.max(ctm.a, 0.01);
      for (let d = 0; d <= length; d += step) {
        const p = el.getPointAtLength(d).matrixTransform(ctm);
        if (!covered(p.x, p.y, at)) pts.push({ x: p.x, y: p.y });
      }
      return pts;
    });
    for (const t of texts) {
      const cs = getComputedStyle(t.el);
      if (cs.paintOrder.startsWith("stroke") && cs.stroke !== "none") continue; // haloed
      // the middle of the letters: a stroke that only grazes a label's edge is fine
      const band = { left: t.r.left + 2, right: t.r.right - 2, top: t.r.top + t.r.height * 0.3, bottom: t.r.bottom - t.r.height * 0.3 };
      for (const pts of samples) {
        if (pts.some((p) => p.x > band.left && p.x < band.right && p.y > band.top && p.y < band.bottom)) {
          issues.push(`line through "${t.label}"`);
          break;
        }
      }
    }

    // 3. label partly over a filled shape
    const shapes = [...svg.querySelectorAll("rect, circle")]
      .filter((s) => {
        const cs = getComputedStyle(s);
        const r = s.getBoundingClientRect();
        return (
          visible(s) && r.width >= 4 && r.height >= 4 && cs.fill !== "none" &&
          !/rgba\(0, 0, 0, 0\)/.test(cs.fill) && Number(cs.fillOpacity) >= 0.35 && rgb(cs.fill) !== bg
        );
      })
      .map((s) => ({ el: s, r: s.getBoundingClientRect(), at: order.indexOf(s) }));
    for (const t of texts) {
      const holders = shapes.filter((s) => contains(s.r, t.ink));
      const floor = holders.length ? Math.max(...holders.map((h) => h.at)) : -1;
      for (const s of shapes)
        if (s.at > floor && !contains(s.r, t.ink) && overlap(t.ink, s.r, 1.5)) issues.push(`label on a shape: "${t.label}"`);
    }

    // 4. label past the edge of the drawing
    for (const t of texts) {
      const out = Math.max(t.r.right - box.right, box.left - t.r.left, box.top - t.r.top, t.r.bottom - box.bottom);
      if (out > 0.5) issues.push(`label cut off by ${Math.round(out)}px: "${t.label}"`);
    }

    if (issues.length) {
      const name = svg.getAttribute("aria-label") || svg.closest("figure")?.querySelector("figcaption")?.textContent || "";
      problems.push({ figure: `#${index + 1} ${name.trim().slice(0, 60)}`, issues: [...new Set(issues)] });
    }
  });
  return problems;
}

/** scroll through the page so reveal-on-scroll figures render, then settle */
async function revealAll(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
}

const server = await preview({ preview: { port: 4174, strictPort: true }, logLevel: "warn" });
const base = server.resolvedUrls?.local[0]?.replace(/\/$/, "") ?? "http://localhost:4174";
// reduced motion: articles skip their entrance animations, so figures are measured at rest
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, reducedMotion: "reduce" });

let failed = 0;
try {
  await page.goto(`${base}/articles`, { waitUntil: "networkidle" });
  const paths = await page.$$eval("main a[href^='/']", (as) => [
    ...new Set(as.map((a) => a.getAttribute("href")!).filter((h) => h !== "/articles")),
  ]);
  if (!paths.length) throw new Error("no articles found on /articles");

  for (const path of paths) {
    await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    await revealAll(page);
    const problems = await page.evaluate(inspectFigures);
    if (!problems.length) {
      console.log(`ok    ${path}`);
      continue;
    }
    failed++;
    console.log(`FAIL  ${path}`);
    for (const p of problems) {
      console.log(`      figure ${p.figure}`);
      for (const issue of p.issues) console.log(`        - ${issue}`);
    }
  }
} finally {
  await browser.close();
  server.httpServer.close();
}

if (failed) {
  console.error(`\n${failed} article(s) have diagrams with colliding or cut-off labels.`);
  process.exit(1);
}
console.log("\nall diagrams clear");
