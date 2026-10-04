import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { articlePath, type ArticleMeta } from "../articles/registry";
import { searchArticles } from "./search";

/**
 * Behaviour of a search box, without any design: query, results, the
 * highlighted row, keyboard handling and the global "/" shortcut.
 * Each article draws its own box around it.
 */
export function useArticleSearch() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQueryRaw] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const results = useMemo(() => searchArticles(query), [query]);

  const setQuery = useCallback((q: string) => {
    setQueryRaw(q);
    setActive(0);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    inputRef.current?.blur();
  }, []);

  const select = useCallback(
    (a: ArticleMeta) => {
      setQueryRaw("");
      setActive(0);
      close();
      navigate(articlePath(a.slug));
    },
    [close, navigate],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        setActive((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const a = results[active];
        if (a) {
          e.preventDefault();
          select(a);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    },
    [active, close, results, select],
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

  return { inputRef, query, setQuery, results, active, setActive, open, setOpen, close, select, onKeyDown };
}
