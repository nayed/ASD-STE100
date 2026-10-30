import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ARTICLES, articlePath } from "../articles/registry";
import SiteShell from "../components/SiteShell";
import { groupByLetter, lastChange } from "../search/search";
import { OWNER, SITE_NAME } from "../site";
import { REVISION, SHEET_BAR, Strip } from "./Sheet";
import "./articles-index.css";

/*
 * The A–Z index: the wiki's alphabetical index, the second sheet of the document that the 404 page opens
 * (sheet.css). Its device is the thumb index, the letter tabs cut into the edge of a printed manual:
 * a sticky column at the right on wide screens, a sticky row under the site bar on narrow ones.
 * Scoped under .ix (articles-index.css).
 */

const LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const idOf = (letter: string) => `letter-${letter === "#" ? "num" : letter}`;

/** the letter whose group is under the reading line (30 % down the window), or the last one at the bottom of the page, for the active tab */
function useActiveLetter(letters: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      let cur: string | null = null;
      for (const l of letters) {
        const el = document.getElementById(idOf(l));
        if (el && el.getBoundingClientRect().top <= line) cur = l;
      }
      // at the bottom of the page the last groups cannot reach the line: the last one is then the active one
      const h = document.documentElement;
      if (h.scrollTop + window.innerHeight >= h.scrollHeight - 2) cur = letters.at(-1) ?? cur;
      setActive(cur ?? letters[0] ?? null);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [letters]);
  return active;
}

export default function ArticlesIndex() {
  const groups = groupByLetter(ARTICLES);
  const [present] = useState(() => groups.map((g) => g.letter));
  const active = useActiveLetter(present);

  useEffect(() => {
    document.title = `All articles · ${SITE_NAME}`;
  }, []);

  return (
    <SiteShell theme={SHEET_BAR}>
      <div className="wk ix">
        <main className="sheet">
          <Strip
            cells={[
              { k: "Document", v: <><b>IDX-01</b> · Alphabetical index</> },
              { k: "Revision", v: REVISION },
              { k: "Pages", v: ARTICLES.length },
              { k: "Letters", className: "st", v: `${present.length} of ${LETTERS.length} in use` },
            ]}
          />

          <header className="head">
            <h1>
              All <span className="ol">articles</span>
            </h1>
            <p className="lede">
              The wiki has {ARTICLES.length} articles. This index lists them by title, from A to Z. To search all pages, press{" "}
              <kbd>/</kbd>.
            </p>
          </header>

          <div className="ix-grid">
            <nav className="thumb" aria-label="Jump to letter">
              <ol>
                {LETTERS.map((l) =>
                  present.includes(l) ? (
                    <li key={l}>
                      <a href={`#${idOf(l)}`} className={active === l ? "on" : undefined} aria-current={active === l ? "location" : undefined}>
                        {l}
                      </a>
                    </li>
                  ) : (
                    <li key={l} className="off" aria-hidden="true">
                      <span>{l}</span>
                    </li>
                  ),
                )}
              </ol>
            </nav>

            <div className="body">
              {groups.map(({ letter, articles }) => (
                <section key={letter} id={idOf(letter)} className="grp" aria-labelledby={`${idOf(letter)}-t`}>
                  <header className="gh">
                    <h2 id={`${idOf(letter)}-t`}>{letter}</h2>
                    <span className="sub">
                      {articles.length} {articles.length === 1 ? "article" : "articles"}
                    </span>
                  </header>
                  <ul className="entries">
                    {articles.map((a) => {
                      const changed = lastChange(a) === REVISION;
                      return (
                        <li key={a.slug} className="ent">
                          {changed && <span className="cb" title={`Changed in revision ${REVISION}`} />}
                          <div className="line">
                            <Link to={articlePath(a.slug)} className="t">
                              {a.title}
                            </Link>
                            <span className="lead" aria-hidden="true" />
                            <span className="pg">/{a.slug}</span>
                          </div>
                          <p className="sum">{a.summary}</p>
                          <div className="meta">
                            <span className="tags">{a.tags.join(" · ")}</span>
                            <span className="dates">
                              Issued {a.added} · Revised {a.updated ?? "—"}
                            </span>
                          </div>
                          {changed && <span className="sr-only"> (changed in revision {REVISION})</span>}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}

              <p className="key">
                <span>
                  <span className="cb" aria-hidden="true" />A bar in the margin marks a page that changed in revision {REVISION}.
                </span>
              </p>
            </div>
          </div>

          <footer className="foot">
            <p>
              © 2026 {OWNER} · Articles under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · Code under
              MIT · Third-party material keeps its own licence
            </p>
            <p className="end">End of index · nothing follows</p>
          </footer>
        </main>
      </div>
    </SiteShell>
  );
}
