/**
 * The site favicon: a folder holding a protractor and a ruler (after a design
 * Nayed picked). The folder takes the accent of the page's site-bar theme; the
 * tools stay cream. scripts/favicons.ts writes the static fallbacks in public/
 * from this same drawing, so they cannot drift.
 */

/** cream of the tools, and the default folder (the original navy) */
export const CREAM = "#f7f4ea";
export const NAVY = "#1f2a38";
/** typical dark tab bar the folder has to stand out against */
const DARK_BAR = "#2b2b2b";

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function toHex([r, g, b]: [number, number, number]): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function mix(a: string, b: string, t: number): string {
  const x = rgb(a);
  const y = rgb(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t) as [number, number, number]);
}

/**
 * Folder colours for one accent:
 * - light: the accent, darkened until the cream tools read on it (3:1);
 * - dark: lightened from there until the folder stands out on a dark tab bar
 *   (2:1), but never so far that the tools stop reading (3:1 against cream).
 */
export function folderColors(accent?: string): { light: string; dark: string } {
  const base = accent && /^#[0-9a-f]{6}$/i.test(accent) ? accent : NAVY;
  let light = base;
  for (let t = 0; t <= 1 && contrast(light, CREAM) < 3; t += 0.05) light = mix(base, "#000000", t);
  let dark = light;
  for (let t = 0.05; t <= 1 && contrast(dark, DARK_BAR) < 2; t += 0.05) {
    const next = mix(light, "#ffffff", t);
    if (contrast(next, CREAM) < 3) break;
    dark = next;
  }
  return { light, dark };
}

/* ------------------------------------------------------------------ */
/* Drawing — a 64-unit box                                             */
/* ------------------------------------------------------------------ */

const R = (n: number) => Math.round(n * 100) / 100;

/** point on a circle; angle in degrees, counter-clockwise from 3 o'clock */
function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [R(cx + r * Math.cos(a)), R(cy - r * Math.sin(a))];
}

const BACK = "M5 17Q5 12 10 12H26.6Q28.2 12 29.2 13.2L32.2 16.6H54.8Q59 16.6 59 20.8V51.5Q59 56 54.5 56H9.5Q5 56 5 51.5Z";
const FRONT = "M5 27Q5 22.6 9.4 22.6H54.6Q59 22.6 59 27V51.5Q59 56 54.5 56H9.5Q5 56 5 51.5Z";

/** protractor: a ring from the lower left, over the top, to the upper right */
const P = { cx: 29, cy: 41.5, outer: 15.6, inner: 9.2, from: 193, to: 37 };
function protractor(): string {
  const [ax, ay] = polar(P.cx, P.cy, P.outer, P.from);
  const [bx, by] = polar(P.cx, P.cy, P.outer, P.to);
  const [cx, cy] = polar(P.cx, P.cy, P.inner, P.to);
  const [dx, dy] = polar(P.cx, P.cy, P.inner, P.from);
  return `M${ax} ${ay}A${P.outer} ${P.outer} 0 0 1 ${bx} ${by}L${cx} ${cy}A${P.inner} ${P.inner} 0 0 0 ${dx} ${dy}Z`;
}
function protractorTicks(): string {
  let d = "";
  for (let deg = 185; deg >= 50; deg -= 11.25) {
    const long = Math.round((185 - deg) / 11.25) % 2 === 0;
    const [x1, y1] = polar(P.cx, P.cy, P.outer - 1, deg);
    const [x2, y2] = polar(P.cx, P.cy, P.outer - (long ? 3.4 : 2.4), deg);
    d += `M${x1} ${y1}L${x2} ${y2}`;
  }
  return d;
}

/** ruler: a bar across the folder, lower left to upper right, in its own frame */
const RULER = { cx: 38.5, cy: 40, length: 41, width: 7.2, angle: -40 };
function rulerTicks(): string {
  let d = "";
  const top = -RULER.width / 2 + 1;
  for (let i = 0, x = -16.5; x <= 13.5; i++, x += 2.9) d += `M${R(x)} ${top}V${R(top + (i % 2 === 0 ? 2.6 : 1.6))}`;
  return d;
}

type Paint = { folder: string; folderDark?: string; details: "always" | "large" | "never" };

/**
 * The favicon as an SVG document.
 * - `folderDark` adds a prefers-color-scheme branch (browser favicons);
 * - details "large" hides the ticks and the ruler's hole below 40 px: at 16 and 32 px they
 *   turn into one-pixel dashes that make the tools look fuzzy.
 */
export function faviconSvg({ folder, folderDark, details }: Paint): string {
  const css = [
    `.f{fill:${folder}}.s{stroke:${folder}}`,
    folderDark ? `@media (prefers-color-scheme:dark){.f{fill:${folderDark}}.s{stroke:${folderDark}}}` : "",
    details === "large" ? "@media (max-width:40px){.d{display:none}}" : "",
  ].join("");
  const showDetails = details !== "never";
  const rulerFrame = `translate(${RULER.cx} ${RULER.cy}) rotate(${RULER.angle})`;
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    `<style>${css}</style>` +
    // folder: back with tab (shaded), a sheet of paper, the front panel
    `<path class="f" d="${BACK}"/><path d="${BACK}" fill="#000" fill-opacity=".22"/>` +
    `<rect x="8.6" y="19.4" width="50.4" height="5" rx="2.2" fill="${CREAM}"/>` +
    `<path class="f" d="${FRONT}"/>` +
    // tools
    `<path d="${protractor()}" fill="${CREAM}"/>` +
    (showDetails ? `<path class="s d" d="${protractorTicks()}" fill="none" stroke-width=".9" stroke-linecap="round"/>` : "") +
    `<g transform="${rulerFrame}">` +
    // the folder-coloured outline separates the ruler from the protractor it crosses
    `<rect class="f s" x="${-RULER.length / 2}" y="${-RULER.width / 2}" width="${RULER.length}" height="${RULER.width}" rx="1" stroke-width="2.4"/>` +
    `<rect x="${-RULER.length / 2}" y="${-RULER.width / 2}" width="${RULER.length}" height="${RULER.width}" rx="1" fill="${CREAM}"/>` +
    (showDetails
      ? `<path class="s d" d="${rulerTicks()}" fill="none" stroke-width=".8" stroke-linecap="round"/>` +
        `<circle class="f d" cx="${RULER.length / 2 - 3.2}" cy="0" r="1.25"/>`
      : "") +
    "</g></svg>"
  );
}

/** inline SVG with no CSS: for rasterizers that ignore <style> (scripts/favicons.ts) */
export function flatSvg(folder: string, details: boolean): string {
  return faviconSvg({ folder, details: details ? "always" : "never" })
    .replace(/<style>.*?<\/style>/, "")
    .replace(/class="f s"/g, `fill="${folder}" stroke="${folder}"`)
    .replace(/class="f d"/g, `fill="${folder}"`)
    .replace(/class="f"/g, `fill="${folder}"`)
    .replace(/class="s d"/g, `stroke="${folder}"`);
}

/**
 * The same folder as an inline logo for the site bar (no ticks: it is about 18 px tall).
 * `background` is the bar's page colour; on a dark bar the folder takes its
 * dark-tab-bar variant so it does not sink into the background.
 * The SVG carries no <style>: inline, a style block would apply to the whole page.
 */
export function logoSvg(accent: string | undefined, background: string): string {
  const { light, dark } = folderColors(accent);
  const onDark = /^#[0-9a-f]{6}$/i.test(background) && luminance(background) < 0.2;
  return flatSvg(onDark ? dark : light, false);
}

/**
 * Show the favicon in the page's accent (or the navy default).
 *
 * Chromium browsers pick the icon whose declared size matches the tab, so a
 * static favicon.ico would win over the recoloured SVG. Once this runs, the
 * SVG is the only icon left, and it is a fresh <link> each time so that every
 * browser notices the change. Crawlers still read the static links in index.html.
 */
export function setFavicon(accent?: string): void {
  const { light, dark } = folderColors(accent);
  document.querySelectorAll('link[rel~="icon"]').forEach((l) => l.remove());
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/svg+xml";
  link.setAttribute("sizes", "any");
  link.href = "data:image/svg+xml," + encodeURIComponent(faviconSvg({ folder: light, folderDark: dark, details: "large" }));
  document.head.appendChild(link);
}
