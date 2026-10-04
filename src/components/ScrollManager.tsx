import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * On arrival at a page: scroll to the top, or to the #hash target (it may
 * render only after the lazy article loads). Hash changes inside the same page
 * are left to the browser, so in-page links keep their smooth scrolling.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    const timer = window.setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tries > 40) {
        window.clearInterval(timer);
        el?.scrollIntoView({ behavior: "instant" });
      }
    }, 50);
    return () => window.clearInterval(timer);
    // only a new page runs this; `hash` is read as it is at that moment
  }, [pathname]);

  return null;
}
