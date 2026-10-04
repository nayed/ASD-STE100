import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { ARTICLES, articlePath, INDEX_PATH, type ArticleMeta } from "../articles/registry";
import { recentArticles, searchArticles } from "./search";

/** rows shown with an empty box */
export const RECENT_LIMIT = 5;
/** rows shown while typing */
export const RESULT_LIMIT = 8;

/**
 * Behaviour of a search box, without any design: query, results, the
 * highlighted row, keyboard handling and the global "/" shortcut.
 *
 * The rows are `results`, then one more row that opens the A–Z index;
 * `active` runs over both, so `active === results.length` is that last row.
 */
export function useArticleSearch() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQueryRaw] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const browsing = query.trim() === "";
  const { results, matches } = useMemo(() => {
    if (browsing) return { results: recentArticles(RECENT_LIMIT), matches: ARTICLES.length };
    const all = searchArticles(query);
    return { results: all.slice(0, RESULT_LIMIT), matches: all.length };
  }, [browsing, query]);

  /** matches not shown because of RESULT_LIMIT */
  const more = browsing ? 0 : matches - results.length;
  const indexRow = results.length;
  const rowCount = results.length + 1;

  const setQuery = useCallback((q: string) => {
    setQueryRaw(q);
    setActive(0);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    inputRef.current?.blur();
  }, []);

  const go = useCallback(
    (path: string) => {
      setQueryRaw("");
      setActive(0);
      close();
      navigate(path);
    },
    [close, navigate],
  );

  const select = useCallback((a: ArticleMeta) => go(articlePath(a.slug)), [go]);
  const openIndex = useCallback(() => go(INDEX_PATH), [go]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        setActive((i) => Math.min(i + 1, rowCount - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (active === indexRow) openIndex();
        else if (results[active]) select(results[active]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    },
    [active, close, indexRow, openIndex, results, rowCount, select],
  );

  /* "/" focuses the box from anywhere on the page, except inside a field */
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      setOpen(true);
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return {
    inputRef,
    query,
    setQuery,
    browsing,
    results,
    matches,
    more,
    total: ARTICLES.length,
    indexRow,
    active,
    setActive,
    open,
    setOpen,
    close,
    select,
    openIndex,
    onKeyDown,
  };
}
