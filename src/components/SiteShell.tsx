import type { ReactNode } from "react";
import SiteBar from "./SiteBar";
import { barVars, type BarTheme } from "./theme";

/** every page: the themed site bar, then the page itself */
export default function SiteShell({ theme, children }: { theme?: Partial<BarTheme>; children: ReactNode }) {
  return (
    <div style={barVars(theme)} className="min-h-screen bg-(--page-bg)">
      <SiteBar />
      {children}
    </div>
  );
}
