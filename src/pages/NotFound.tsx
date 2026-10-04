import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { ARTICLES, articlePath } from "../articles/registry";
import { SITE_NAME } from "../site";

export default function NotFound() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = `Not found · ${SITE_NAME}`;
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-5 py-20">
      <p className="font-mono text-sm text-neutral-500">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">No article here</h1>
      <p className="mt-3 text-neutral-600">
        Nothing is published at <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">{pathname}</code>.
      </p>
      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-neutral-500">Articles</h2>
      <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
        {ARTICLES.map((a) => (
          <li key={a.slug}>
            <Link to={articlePath(a.slug)} className="block py-3 hover:bg-neutral-50">
              <span className="font-medium">{a.title}</span>
              <span className="block text-sm text-neutral-500">{a.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/" className="mt-8 inline-block text-sm font-medium underline underline-offset-4">
        ← Home
      </Link>
    </main>
  );
}
