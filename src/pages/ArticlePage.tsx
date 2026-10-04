import { lazy, Suspense, useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { findArticle } from "../articles/registry";
import { SITE_NAME } from "../site";
import SiteShell from "../components/SiteShell";
import NotFound from "./NotFound";

const cache = new Map<string, ReturnType<typeof lazy>>();

function lazyArticle(slug: string, load: Parameters<typeof lazy>[0]) {
  let C = cache.get(slug);
  if (!C) {
    C = lazy(load);
    cache.set(slug, C);
  }
  return C;
}

export default function ArticlePage({ slug: fixed }: { slug?: string }) {
  const params = useParams();
  const meta = findArticle(fixed ?? params.slug);
  const Article = useMemo(() => (meta ? lazyArticle(meta.slug, meta.load) : null), [meta]);

  useEffect(() => {
    document.title = meta ? `${meta.title} · ${SITE_NAME}` : `Not found · ${SITE_NAME}`;
  }, [meta]);

  if (!meta || !Article) {
    return (
      <SiteShell>
        <NotFound />
      </SiteShell>
    );
  }

  return (
    <SiteShell theme={meta.bar}>
      <Suspense fallback={<div className="min-h-screen" />}>
        <Article />
      </Suspense>
    </SiteShell>
  );
}
