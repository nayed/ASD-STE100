import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router";
import { articlePath } from "../articles/registry";
import { useArticleSearch } from "../search/useArticleSearch";
import { OWNER, OWNER_SHORT } from "../site";

/**
 * The wiki bar on every page: owner on the left, article search on the right.
 * Colours and type come from the --bar-* variables set by SiteShell.
 */
export default function SiteBar() {
  const s = useArticleSearch();
  const { pathname } = useLocation();
  const listId = useId();
  /* below sm the field is folded into a button; this unfolds it over the bar */
  const [expanded, setExpanded] = useState(false);
  const { inputRef } = s;

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded, inputRef]);

  return (
    <div className="sticky top-0 z-50 h-(--site-bar-h) border-b border-(--bar-border) bg-(--bar-bg) text-(--bar-fg) backdrop-blur">
      <div className="relative mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-5 lg:px-10">
        <Link to="/" className="flex min-w-0 items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--bar-accent)">
          <span className="block h-3 w-3 shrink-0 bg-(--bar-accent)" />
          <span className="bar-label truncate">
            <span className="hidden sm:inline">{OWNER}</span>
            <span className="sm:hidden">{OWNER_SHORT}</span>
            <span className="text-(--bar-muted)"> · </span>
            <span className="hidden text-(--bar-muted) sm:inline">personal wiki</span>
            <span className="text-(--bar-muted) sm:hidden">wiki</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label="Search articles"
          className={`bar-label shrink-0 border border-(--bar-border) px-2 py-1 text-(--bar-muted) transition-colors hover:text-(--bar-fg) sm:hidden ${expanded ? "invisible" : ""}`}
        >
          Search ⌕
        </button>

        <div
          className={
            expanded
              ? "absolute inset-0 z-10 flex items-center gap-2 bg-(--bar-bg) px-5"
              : "relative hidden w-[min(22rem,40vw)] sm:block"
          }
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-expanded={s.open}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={s.open && s.results[s.active] ? `${listId}-${s.active}` : undefined}
              aria-label="Search articles"
              placeholder="Search articles…"
              autoComplete="off"
              spellCheck={false}
              value={s.query}
              onChange={(e) => s.setQuery(e.target.value)}
              onFocus={() => s.setOpen(true)}
              onBlur={() => {
                s.setOpen(false);
                setExpanded(false);
              }}
              onKeyDown={s.onKeyDown}
              className="bar-label w-full border border-(--bar-border) bg-transparent px-2.5 py-1 pr-8 text-[max(12px,var(--bar-size))] normal-case tracking-normal text-(--bar-fg) placeholder:text-(--bar-muted) placeholder:[letter-spacing:var(--bar-tracking)] placeholder:[text-transform:var(--bar-case)] focus:border-(--bar-accent) focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            <kbd
              className={`bar-label pointer-events-none absolute right-1.5 top-1/2 hidden -translate-y-1/2 border border-(--bar-border) px-1 text-(--bar-muted) ${s.query ? "" : "sm:block"}`}
            >
              /
            </kbd>

            {s.open && (
              <ul
                id={listId}
                role="listbox"
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 border border-(--bar-border) bg-(--bar-panel) shadow-lg sm:left-auto sm:w-full sm:min-w-[22rem]"
              >
                <li className="bar-label flex justify-between bg-(--bar-head-bg) px-3 py-1.5 text-(--bar-head-fg)" role="presentation">
                  <span>{s.query ? "Results" : "All articles"}</span>
                  <span className="text-(--bar-accent) tabular-nums">{s.results.length}</span>
                </li>
                {s.results.length === 0 && (
                  <li className="px-3 py-3 text-[14px] text-(--bar-muted) [font-family:var(--bar-summary-font)] [font-style:var(--bar-summary-style)]" role="presentation">
                    No article matches.
                  </li>
                )}
                {s.results.map((a, i) => {
                  const here = articlePath(a.slug) === pathname;
                  return (
                    <li
                      key={a.slug}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === s.active}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => s.setActive(i)}
                      onClick={() => s.select(a)}
                      className={`cursor-pointer border-t border-(--bar-border) px-3 py-2.5 ${i === s.active ? "bg-(--bar-hover)" : ""}`}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[14px] font-semibold leading-tight [font-family:var(--bar-title-font)]">{a.title}</span>
                        {here && <span className="bar-label shrink-0 text-(--bar-accent)">Here</span>}
                      </div>
                      <p className="mt-0.5 text-[13.5px] leading-[1.4] text-(--bar-muted) [font-family:var(--bar-summary-font)] [font-style:var(--bar-summary-style)]">
                        {a.summary}
                      </p>
                      <p className="mt-1 font-mono text-[10.5px] text-(--bar-tag)">{a.tags.join(" · ")}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {expanded && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => s.close()}
              className="bar-label shrink-0 text-(--bar-muted) hover:text-(--bar-accent)"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
