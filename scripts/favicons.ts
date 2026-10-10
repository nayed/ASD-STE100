/**
 * Writes the static favicon fallbacks in public/ from the drawing in
 * src/components/favicon.ts, so they always match the live, recoloured one.
 *
 *   npm run favicons     (Node 23.6+ runs this TypeScript file directly)
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { CREAM, faviconSvg, flatSvg, folderColors } from "../src/components/favicon.ts";

const { light, dark } = folderColors(); // the navy default, and its dark-tab-bar variant
const out = (f: string) => join(import.meta.dirname, "..", "public", f);

/** render a flat SVG (no CSS) to a square PNG of `px` pixels */
function png(svg: string, px: number, background?: string): Buffer {
  return new Resvg(svg, { fitTo: { mode: "width", value: px }, background }).render().asPng();
}

/** an .ico holding PNG images (supported by every browser that still reads .ico) */
function ico(images: { px: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ px, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(px >= 256 ? 0 : px, e); // width
    header.writeUInt8(px >= 256 ? 0 : px, e + 1); // height
    header.writeUInt16LE(1, e + 4); // colour planes
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.data)]);
}

// 1. the SVG favicon: navy, lighter on dark tab bars, details only from 40 px up
writeFileSync(out("favicon.svg"), faviconSvg({ folder: light, folderDark: dark, details: "large" }) + "\n");

// 2. favicon.ico for browsers without SVG favicons: 16 and 32 px without details, 48 with
writeFileSync(
  out("favicon.ico"),
  ico([
    { px: 16, data: png(flatSvg(light, false), 16) },
    { px: 32, data: png(flatSvg(light, false), 32) },
    { px: 48, data: png(flatSvg(light, true), 48) },
  ]),
);

// 3. iOS home screen: full-bleed cream (iOS rounds the corners itself), folder inset
const inset = flatSvg(light, true).replace('viewBox="0 0 64 64"', 'viewBox="-10 -10 84 84"');
writeFileSync(out("apple-touch-icon.png"), png(inset, 180, CREAM));

console.log("wrote public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png");
