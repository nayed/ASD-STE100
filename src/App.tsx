import { Route, Routes } from "react-router";
import ScrollManager from "./components/ScrollManager";
import SiteShell from "./components/SiteShell";
import { INDEX_PATH } from "./articles/registry";
import ArticlePage from "./pages/ArticlePage";
import ArticlesIndex from "./pages/ArticlesIndex";
import NotFound from "./pages/NotFound";
import { HOME_SLUG } from "./site";

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<ArticlePage slug={HOME_SLUG} />} />
        <Route
          path={INDEX_PATH}
          element={
            <SiteShell>
              <ArticlesIndex />
            </SiteShell>
          }
        />
        <Route path="/:slug" element={<ArticlePage />} />
        <Route
          path="*"
          element={
            <SiteShell>
              <NotFound />
            </SiteShell>
          }
        />
      </Routes>
    </>
  );
}
