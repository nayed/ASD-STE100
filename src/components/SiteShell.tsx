import { useEffect, type ReactNode } from "react";
import { setFavicon } from "./favicon";
import SiteBar from "./SiteBar";
import { barVars, DEFAULT_BAR, type BarTheme } from "./theme";

/** every page: the themed site bar, then the page itself; the favicon and the bar's logo take the bar's accent */
export default function SiteShell({ theme, children }: { theme?: Partial<BarTheme>; children: ReactNode }) {
  const accent = theme?.accent;
  useEffect(() => setFavicon(accent), [accent]);

  return (
    <div style={barVars(theme)} className="min-h-screen bg-(--page-bg)">
      <SiteBar accent={accent} background={theme?.page ?? DEFAULT_BAR.page} />
      {children}
    </div>
  );
}
