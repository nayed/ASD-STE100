/**
 * Vite plugin: `import listing from "./file.py?highlight"` gives a source file highlighted at build time with
 * Shiki (VS Code's grammars), in the gruvbox-light-hard theme. The browser gets only the coloured tokens:
 * Shiki stays out of the bundle. The grammar follows the file name; add a line to LANGS for a new kind of file.
 *
 * Another theme, for one listing or for all the listings of an article: `"./file.py?theme=github-light&highlight"`,
 * with any theme from https://shiki.style/themes. Put `theme` first: TypeScript knows the imports that end in
 * `highlight` (src/vite-env.d.ts). The listing carries the colours of its theme, so the article needs no change.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { bundledThemes, createHighlighter, type BundledLanguage, type BundledTheme, type Highlighter, type ThemedToken } from "shiki";
import type { Plugin } from "vite";
import type { Listing, Tok } from "../src/code/listing";

const DEFAULT_THEME: BundledTheme = "gruvbox-light-hard";
/** the grammar of a file: by its whole name first, then by its extension */
const LANGS: Record<string, BundledLanguage> = {
  Containerfile: "docker",
  Dockerfile: "docker",
  ".c": "c",
  ".container": "ini",
  ".go": "go",
  ".js": "javascript",
  ".mjs": "javascript",
  ".py": "python",
  ".ts": "typescript",
  ".yaml": "yaml",
  ".yml": "yaml",
};

/** joins neighbouring tokens of the same style; spaces, which show no colour, join their neighbours */
function compact(line: ThemedToken[], fg: string): Tok[] {
  const out: Tok[] = [];
  for (const { content, color, fontStyle } of line) {
    if (!content) continue;
    const c = color && color.toLowerCase() !== fg.toLowerCase() ? color : undefined;
    const f = fontStyle && fontStyle > 0 ? fontStyle : undefined;
    const last = out[out.length - 1];
    if (last && (/^\s+$/.test(content) || (last.c === c && last.f === f))) last.t += content;
    else if (last && /^\s+$/.test(last.t)) Object.assign(last, { t: last.t + content, c, f });
    else out.push({ t: content, c, f });
  }
  return out;
}

export default function highlight(): Plugin {
  let shiki: Promise<Highlighter> | undefined;
  const loaded = new Map<string, Promise<void>>(); // each theme loads once, when an import first asks for it
  return {
    name: "highlight",
    enforce: "pre",
    async load(id) {
      const [file, query = ""] = id.split("?");
      const params = new URLSearchParams(query);
      if (!params.has("highlight")) return null;
      const lang = LANGS[path.basename(file)] ?? LANGS[path.extname(file)];
      if (!lang) this.error(`no grammar for ${file}: add it to LANGS in scripts/highlight-plugin.ts`);
      const name = (params.get("theme") ?? DEFAULT_THEME) as BundledTheme;
      if (!(name in bundledThemes)) this.error(`unknown theme "${name}" in ${id}: see https://shiki.style/themes`);
      this.addWatchFile(file);
      shiki ??= createHighlighter({ themes: [DEFAULT_THEME], langs: [...new Set(Object.values(LANGS))] });
      const hl = await shiki;
      if (!loaded.has(name)) loaded.set(name, hl.loadTheme(name));
      await loaded.get(name);
      const theme = hl.getTheme(name);
      const code = (await readFile(file, "utf8")).replace(/\n$/, "");
      const listing: Listing = {
        lines: hl.codeToTokensBase(code, { lang, theme: name }).map((line) => compact(line, theme.fg)),
        bg: theme.bg,
        fg: theme.fg,
        ln: theme.colors?.["editorLineNumber.foreground"] ?? theme.fg,
        // without its transparency, so that the active line of a step-through stands out
        hl: (theme.colors?.["editor.lineHighlightBackground"] ?? theme.bg).slice(0, 7),
      };
      return `export default ${JSON.stringify(listing)};`;
    },
  };
}
