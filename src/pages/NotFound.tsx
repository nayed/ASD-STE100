import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link, useLocation } from "react-router";
import { ARTICLES, articlePath, INDEX_PATH, type ArticleMeta } from "../articles/registry";
import SiteShell from "../components/SiteShell";
import { nearestArticle, type Op } from "../search/nearest";
import { lastChange } from "../search/search";
import { SITE_NAME } from "../site";
import { REVISION, SHEET_BAR, Strip } from "./Sheet";
import "./not-found.css";

/*
 * The page for an address with no article: the wiki's List of Effective Pages, the controlled-document
 * page that lists every valid page with its issue and revision dates, with the requested address
 * flagged against it and proofread toward the nearest real address. Scoped under .nf (not-found.css).
 */

/** a list of effective pages runs in page order: here, by address */
const PAGES = [...ARTICLES].sort((a, b) => a.slug.localeCompare(b.slug));

type Kind = Exclude<Op["kind"], "same">;

/** runs of the same edit, read as one correction: remove "articles/", add "-basics", change "RAG" to "rag" */
function corrections(ops: Op[]) {
  const out: { kind: Kind; typed: string; want: string }[] = [];
  ops.forEach((o, i) => {
    if (o.kind === "same") return;
    const typed = o.kind === "add" ? "" : o.typed;
    const want = o.kind === "remove" ? "" : o.want;
    const last = out.at(-1);
    if (last && ops[i - 1]?.kind === o.kind) {
      last.typed += typed;
      last.want += want;
    } else out.push({ kind: o.kind, typed, want });
  });
  return out;
}

const say = (c: { kind: Kind; typed: string; want: string }) =>
  c.kind === "remove" ? `remove “${c.typed}”` : c.kind === "add" ? `add “${c.want}”` : `change “${c.typed}” to “${c.want}”`;
const sentence = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}.`;

/** the address as the reader typed it: decoded, without the slashes at the ends */
function typedPath(pathname: string) {
  let s = pathname;
  try {
    s = decodeURIComponent(pathname);
  } catch {
    // a broken %-escape: show it as typed
  }
  return s.replace(/^\/+|\/+$/g, "");
}

/** an address that may break only after a slash: "/articles/" then "websocket", never inside a word */
function Addr({ path }: { path: string }) {
  const parts = path.split("/");
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {p}
          {i < parts.length - 1 && (
            <>
              /<wbr />
            </>
          )}
        </Fragment>
      ))}
    </>
  );
}

/** a cross: the requested address, which has no page */
function Flag() {
  return (
    <svg className="flag" viewBox="0 0 8 8" aria-hidden="true">
      <path d="M1 1 L7 7 M7 1 L1 7" />
    </svg>
  );
}

/*
 * The proofreader's marks, drawn over a comb cell (24 × 32 units). A run of removals is one strike through
 * every cell with the delete loop at its end; an insertion is one caret where the run begins; a change strikes
 * each character. pathLength 1 lets one keyframe draw any of them.
 */
function Mark({ kind, first = true, last = true }: { kind: Kind; first?: boolean; last?: boolean }) {
  const d =
    kind === "remove" ? `M${first ? 3 : 0} 20 H${last ? "16 C22 20 22.5 10.5 18 10 C14.5 9.6 14 14.5 17.5 15" : 24}`
    : kind === "change" ? "M6 26 L18 8"
    : first ? "M6 31 L12 23 L18 31" : "";
  return (
    <svg className="mk" viewBox="0 0 24 32" aria-hidden="true">
      {d && <path pathLength={1} d={d} />}
    </svg>
  );
}

/*
 * When each mark is drawn, in seconds from the start: one correction after the other, at a pen's pace.
 * A strike sweeps 0.1 s per character and ends with its delete loop; an insertion draws its caret, then
 * types its characters in; a change strikes each character, then its correction appears below.
 * d: when the stroke starts, t: how long it takes, ld: when the corrected character appears.
 */
const START = 0.4;
const STEP = 0.1;
function schedule(ops: Op[]) {
  const plan = new Map<number, { d: number; t: number; ld: number }>();
  let at = START;
  for (let i = 0; i < ops.length; ) {
    const kind = ops[i].kind;
    let j = i;
    while (j < ops.length && ops[j].kind === kind) j++;
    const n = j - i;
    if (kind === "remove") {
      const end = n === 1 ? 0.7 : 0.6; // the cell that carries the loop
      for (let k = 0; k < n; k++) plan.set(i + k, { d: at + k * STEP, t: k === n - 1 ? end : STEP, ld: 0 });
      at += (n - 1) * STEP + end + 0.15;
    } else if (kind === "add") {
      for (let k = 0; k < n; k++) plan.set(i + k, { d: at, t: 0.4, ld: at + 0.3 + k * STEP });
      at += 0.3 + n * STEP + 0.35;
    } else if (kind === "change") {
      for (let k = 0; k < n; k++) plan.set(i + k, { d: at + k * 0.3, t: 0.35, ld: at + k * 0.3 + 0.3 });
      at += n * 0.3 + 0.4;
    }
    i = j;
  }
  return plan;
}

/** true once the fonts are in and the figure is on screen: the drawing starts on a settled page */
function useSettled<T extends Element>() {
  const ref = useRef<T>(null);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let live = true;
    let seen = false;
    let fonts = false;
    const go = () => live && seen && fonts && setSettled(true);
    document.fonts.ready.then(() => {
      fonts = true;
      go();
    });
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        seen = true;
        io.disconnect();
        go();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      live = false;
      io.disconnect();
    };
  }, []);
  return [ref, settled] as const;
}

/** the signature: the typed address over the real one in comb fields, one character per cell, each correction marked */
function Proof({ ops }: { ops: Op[] }) {
  const plan = schedule(ops);
  return (
    <div className="proof" aria-hidden="true" style={{ "--n": ops.length + 1 } as CSSProperties}>
      <div className="keys">
        <span>Typed</span>
        <span>Effective</span>
      </div>
      <ol className="cols">
        <li className="col lead">
          <span className="c">/</span>
          <span className="c">/</span>
        </li>
        {ops.map((o, i) => {
          if (o.kind === "same")
            return (
              <li key={i} className="col">
                <span className="c">{o.ch}</span>
                <span className="c">{o.ch}</span>
              </li>
            );
          const first = ops[i - 1]?.kind !== o.kind;
          const last = ops[i + 1]?.kind !== o.kind;
          const p = plan.get(i)!;
          return (
            <li
              key={i}
              className={`col ${o.kind}${first ? " first" : ""}${last ? " last" : ""}`}
              style={{ "--d": `${p.d}s`, "--t": `${p.t}s`, "--ld": `${p.ld}s` } as CSSProperties}
            >
              <span className="c t">
                {o.kind === "add" ? "" : o.typed}
                <Mark kind={o.kind} first={first} last={last} />
              </span>
              <span className="c e">{o.kind === "remove" ? "" : <span className="ch">{o.want}</span>}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Legend({ kinds }: { kinds: Kind[] }) {
  return (
    <ul className="legend">
      {(["remove", "add", "change"] as const)
        .filter((k) => kinds.includes(k))
        .map((k) => (
          <li key={k}>
            <span className="sw">
              <Mark kind={k} />
            </span>
            {k}
          </li>
        ))}
    </ul>
  );
}

function Arrow() {
  return (
    <svg className="arr" viewBox="0 0 16 10" aria-hidden="true">
      <path d="M0 5 H14 M10 1 L14 5 L10 9" />
    </svg>
  );
}

export default function NotFound() {
  const { pathname } = useLocation();
  const near = useMemo(() => nearestArticle(pathname), [pathname]);
  const [figRef, settled] = useSettled<HTMLElement>();
  const shown = typedPath(pathname);
  const fixes = near ? corrections(near.ops) : [];
  // the requested address takes its place in the list, by address, as a page not issued
  const rows: ({ req: false; a: ArticleMeta; key: string } | { req: true; key: string })[] = [
    ...PAGES.map((a) => ({ req: false as const, a, key: a.slug })),
    { req: true as const, key: shown.toLowerCase() },
  ].sort((x, y) => x.key.localeCompare(y.key));

  useEffect(() => {
    document.title = `Not found · ${SITE_NAME}`;
  }, []);

  return (
    <SiteShell theme={SHEET_BAR}>
      <div className="wk nf">
        <main className="sheet">
          <Strip
            cells={[
              { k: "Document", v: <><b>LEP-01</b> · List of effective pages</> },
              { k: "Revision", v: REVISION },
              { k: "Pages", v: ARTICLES.length },
              {
                k: "Requested page",
                className: "st",
                v: (
                  <>
                    <span className="rq">
                      <Addr path={`/${shown}`} />
                    </span>{" "}
                    · <span className="ni">Not issued</span>
                  </>
                ),
              },
            ]}
          />

          <div className="grid">
            <section className="claim" aria-labelledby="nf-title">
              <div className="head">
                <h1 id="nf-title">
                  Page <span className="ol">not found</span>
                </h1>
                <div className="stamp" aria-hidden="true">
                  <span className="big">Not issued</span>
                  <span className="small">HTTP 404 · {ARTICLES.length} pages on file</span>
                </div>
              </div>

              <p className="lede">
                No article has the address{" "}
                <code className="addr">
                  <Addr path={`/${shown}`} />
                </code>
                .{" "}
                {!near && "No address in the list is near it. Find the page in the list, or search all pages."}
                {near?.reason === "tag" && (
                  <>
                    The article <b>{near.title}</b> has the tag “{near.tag}”.
                  </>
                )}
                {near && near.reason !== "tag" && (
                  <>
                    The nearest address is <code className="addr">{near.path === "/" ? `/${near.slug}` : near.path}</code>.
                  </>
                )}
              </p>

              {near && near.reason !== "tag" && fixes.length > 0 && (
                <figure className={`proof-fig${settled ? " draw" : ""}`} ref={figRef}>
                  <Proof ops={near.ops} />
                  <figcaption className="figcap">
                    <span className="no">Fig. 01</span>
                    <span className="tt">Address proof</span>
                    <span className="ref">
                      {fixes.length} {fixes.length === 1 ? "correction" : "corrections"}
                    </span>
                  </figcaption>
                  <div className="fignote">
                    <span className="fx">{fixes.map((f) => sentence(say(f))).join(" ")}</span>
                    <Legend kinds={fixes.map((f) => f.kind)} />
                  </div>
                  <p className="sr-only">
                    You typed /{near.typed}. To get the address {near.path}, {fixes.map(say).join(", then ")}.
                  </p>
                </figure>
              )}

              {near ? (
                <Link className="go" to={near.path} aria-label={`Open ${near.path === "/" ? `/${near.slug}` : near.path}: ${near.title}`}>
                  <span>Open {near.path === "/" ? `/${near.slug}` : near.path}</span>
                  <Arrow />
                </Link>
              ) : (
                <Link className="go" to={INDEX_PATH}>
                  <span>Open the A–Z index</span>
                  <Arrow />
                </Link>
              )}
            </section>

            <section className="lep" aria-labelledby="lep-title">
              <h2 id="lep-title">List of effective pages</h2>
              <p className="sub">
                Every page of the wiki, by address · <span className="nw">Revision {REVISION}</span>
              </p>
              <table>
                <thead>
                  <tr>
                    <th className="m">
                      <span className="sr-only">Change</span>
                    </th>
                    <th className="pg">Page</th>
                    <th>Title</th>
                    <th className="d iss">Issued</th>
                    <th className="d">Revised</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    if (r.req)
                      return (
                        <tr key="requested" className="req">
                          <td className="m">
                            <Flag />
                          </td>
                          <td className="pg">
                            <Addr path={`/${shown}`} />
                          </td>
                          <td className="tt">
                            <span className="ni">Not issued</span>
                            <span className="slug">
                              <Addr path={`/${shown}`} />
                            </span>
                            <span className="sr-only"> (the address that you requested)</span>
                          </td>
                          <td className="d iss">—</td>
                          <td className="d">—</td>
                        </tr>
                      );
                    const { a } = r;
                    const isNear = near?.slug === a.slug;
                    const changed = lastChange(a) === REVISION;
                    return (
                      <tr key={a.slug} className={isNear ? "near" : undefined}>
                        <td className="m">
                          {changed && <span className="cb" title={`Changed in revision ${REVISION}`} />}
                          {isNear && (
                            <svg className="ptr" viewBox="0 0 8 10" aria-hidden="true">
                              <path d="M0 0 L8 5 L0 10 Z" />
                            </svg>
                          )}
                        </td>
                        <td className="pg">/{a.slug}</td>
                        <td className="tt">
                          <Link to={articlePath(a.slug)}>{a.title}</Link>
                          <span className="slug">/{a.slug}</span>
                          {isNear && <span className="tag">Nearest</span>}
                          {changed && <span className="sr-only"> (changed in revision {REVISION})</span>}
                        </td>
                        <td className="d iss">{a.added}</td>
                        <td className="d">{a.updated ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="key">
                <span>
                  <span className="cb" aria-hidden="true" />A bar in the margin marks a page that changed in revision {REVISION}.
                </span>
                <span>
                  <Flag />A cross marks the address that you requested.
                </span>
              </p>
            </section>
          </div>

          <footer className="foot">
            <p>
              To find a page by its title, use the <Link to={INDEX_PATH}>A–Z index</Link>. To search all pages, press{" "}
              <kbd>/</kbd> or use the search box at the top.
            </p>
            <p className="end">End of list · nothing follows</p>
          </footer>
        </main>
      </div>
    </SiteShell>
  );
}
