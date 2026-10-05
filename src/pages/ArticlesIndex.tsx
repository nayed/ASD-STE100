import { useEffect } from "react";
import { Link } from "react-router";
import { ARTICLES, articlePath } from "../articles/registry";
import { groupByLetter } from "../search/search";
import { OWNER, SITE_NAME } from "../site";

const LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** every article, A–Z, grouped by first letter, with a letter bar to jump */
export default function ArticlesIndex() {
  const groups = groupByLetter(ARTICLES);
  const present = new Set(groups.map((g) => g.letter));

  useEffect(() => {
    document.title = `All articles · ${SITE_NAME}`;
  }, []);

  return (
    <main className="pb-24 text-neutral-900">
      <header className="mx-auto max-w-3xl px-5 pt-14">
        <p className="font-mono text-sm text-neutral-500">Index</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">All articles</h1>
        <p className="mt-3 text-neutral-600">
          {ARTICLES.length} {ARTICLES.length === 1 ? "article" : "articles"}, A to Z.
          <span className="hidden sm:inline">
            {" "}
            Press <kbd className="rounded border border-neutral-300 px-1.5 font-mono text-xs">/</kbd> to search instead.
          </span>
        </p>
      </header>

      {/* letter bar, held under the site bar */}
      <nav
        aria-label="Jump to letter"
        className="sticky top-(--site-bar-h) z-30 mt-8 border-y border-neutral-200 bg-white/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-3xl flex-wrap gap-x-0.5 px-4 py-2 font-mono text-[13px]">
          {LETTERS.map((l) =>
            present.has(l) ? (
              <a
                key={l}
                href={`#letter-${l === "#" ? "num" : l}`}
                className="rounded px-1.5 py-0.5 font-semibold text-blue-600 hover:bg-blue-50"
              >
                {l}
              </a>
            ) : (
              <span key={l} className="px-1.5 py-0.5 text-neutral-300" aria-hidden>
                {l}
              </span>
            ),
          )}
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-5">
        {groups.map(({ letter, articles }) => (
          <section
            key={letter}
            id={`letter-${letter === "#" ? "num" : letter}`}
            className="mt-10 scroll-mt-[calc(var(--site-bar-h)+3.5rem)]"
          >
            <h2 className="flex items-baseline gap-3 border-b border-neutral-900 pb-1.5">
              <span className="text-2xl font-bold">{letter}</span>
              <span className="font-mono text-xs text-neutral-400">{articles.length}</span>
            </h2>
            <ul className="divide-y divide-neutral-200">
              {articles.map((a) => (
                <li key={a.slug}>
                  <Link to={articlePath(a.slug)} className="group block py-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-lg font-semibold group-hover:text-blue-600 group-hover:underline group-hover:underline-offset-4">
                        {a.title}
                      </span>
                      <time dateTime={a.added} className="shrink-0 font-mono text-xs text-neutral-400">
                        {formatDate(a.added)}
                      </time>
                    </div>
                    <p className="mt-1 text-neutral-600">{a.summary}</p>
                    <p className="mt-1.5 font-mono text-xs text-blue-600">{a.tags.join(" · ")}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="mt-16 border-t border-neutral-200 pt-4 font-mono text-xs text-neutral-400">
          © 2026 {OWNER} · Articles under{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" className="underline underline-offset-2 hover:text-neutral-600">
            CC BY 4.0
          </a>{" "}
          · Code under MIT · Third-party material keeps its own licence
        </p>
      </div>
    </main>
  );
}
