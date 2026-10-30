/**
 * Vite plugin: gives every route of the SPA its own HTML file in dist/, so that the static host answers a real
 * 404 for any other path. Cloudflare Pages serves `websocket.html` at `/websocket`, and, because dist/ holds a
 * `404.html`, serves that file with status 404 for a path that has no file. Each file is a copy of index.html:
 * React Router then draws the article, the A–Z index or the NotFound page.
 *
 * The routes come from src/articles/registry.ts (every `slug`, and INDEX_PATH), read as text: importing the
 * registry would pull the articles into the Vite config.
 */
import { copyFileSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const REGISTRY = new URL("../src/articles/registry.ts", import.meta.url);

function routes(): string[] {
  const src = readFileSync(REGISTRY, "utf8");
  const slugs = [...src.matchAll(/^\s+slug: "([a-z0-9-]+)",$/gm)].map((m) => m[1]);
  const index = src.match(/^export const INDEX_PATH = "\/([a-z0-9-]+)";$/m)?.[1];
  if (!slugs.length || !index) throw new Error("routes-plugin: no slugs or no INDEX_PATH in registry.ts");
  return [...slugs, index, "404"];
}

export default function spaRoutes(): Plugin {
  return {
    name: "spa-routes",
    apply: "build",
    // after Vite has written index.html (it adds the page to the bundle after the other plugins run)
    writeBundle({ dir = "dist" }) {
      for (const name of routes()) copyFileSync(path.join(dir, "index.html"), path.join(dir, `${name}.html`));
    },
  };
}
