import { Fragment, type CSSProperties } from "react";
import type { Tok } from "./listing";

function style({ c, f = 0 }: Tok): CSSProperties {
  return {
    color: c,
    fontStyle: f & 1 ? "italic" : undefined,
    fontWeight: f & 2 ? 700 : undefined,
    textDecoration: f & 4 ? "underline" : undefined,
  };
}

/** one highlighted line: a span for each coloured token, plain text as it is */
export function Tokens({ line }: { line: Tok[] }) {
  return (
    <>
      {line.map((tok, i) =>
        tok.c || tok.f ? (
          <span key={i} style={style(tok)}>
            {tok.t}
          </span>
        ) : (
          <Fragment key={i}>{tok.t}</Fragment>
        ),
      )}
    </>
  );
}
