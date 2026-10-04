import { Route, Routes } from "react-router";
import ScrollManager from "./components/ScrollManager";
import SiteShell from "./components/SiteShell";
import ArticlePage from "./pages/ArticlePage";
import NotFound from "./pages/NotFound";
import { HOME_SLUG } from "./site";

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<ArticlePage slug={HOME_SLUG} />} />
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
