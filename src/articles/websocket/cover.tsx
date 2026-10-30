/** The cover of WS-6455: title block, the duplex tape of the real session, metadata, index. */

import { Fragment, useEffect, useRef, useState } from "react";
import { DOC, hexNo, ISSUED, REV, SHEETS } from "./chrome";
import { RUN, SESSION, type Dir } from "./data";
import { fromHex, hex2, parseFrame, payloadText, SHORT_OP } from "./frame";

export const FIGURES: [no: string, title: string, sheet: string][] = [
  ["01", "Who can send, and when", "s01"],
  ["02", "Four ways to get server events · interactive", "s02"],
  ["03", "The opening handshake", "s03"],
  ["04", "Sec-WebSocket-Accept, computed · interactive", "s03"],
  ["05", "The frame header, bit by bit · interactive", "s04"],
  ["06", "Masking: XOR with a 4-byte key", "s05"],
  ["07", "One message in four frames", "s06"],
  ["08", "The closing handshake", "s07"],
  ["09", "Line monitor: the whole session · interactive", "s08"],
  ["10", "readyState, from open to closed · interactive", "s09"],
  ["11", "Reconnect: backoff and jitter · interactive", "s10"],
];

const HEAD_BYTES = 14; // bytes of each frame that the tape shows

/** one lane of the tape: each record of one direction, header bytes in the accent */
function laneItems(dir: Dir) {
  return SESSION.filter((r) => r.dir === dir).map((r, i) => {
    if (r.kind === "http") {
      const b = new TextEncoder().encode(r.text);
      return (
        <div key={i} className="tape-fr http">
          <span className="lbl">
            <b>HTTP</b> · {r.text.split("\r\n")[0].replace(" HTTP/1.1", "").replace("HTTP/1.1 ", "")}
          </span>
          <span className="hx">
            {Array.from(b.slice(0, 12), hex2).join(" ")} … {b.length} B
          </span>
        </div>
      );
    }
    const f = parseFrame(fromHex(r.hex));
    const shown = Array.from(f.bytes.slice(0, HEAD_BYTES));
    return (
      <div key={i} className="tape-fr">
        <span className="lbl">
          <b>{SHORT_OP[f.opcode]}</b>
          {!f.fin && " · FIN 0"} · {payloadText(f, 12)}
          {f.masked && " · masked"}
        </span>
        <span className="hx">
          {shown.map((b, j) => (
            <Fragment key={j}>
              {j > 0 && " "}
              <span className={j < 2 ? "h k" : j < f.headerLen ? "h" : undefined}>{hex2(b)}</span>
            </Fragment>
          ))}
          {f.bytes.length > HEAD_BYTES && ` … ${f.bytes.length} B`}
        </span>
      </div>
    );
  });
}

function Tape() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setRun(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const lane = (dir: Dir, who: string, to: string) => {
    const items = laneItems(dir);
    return (
      <div className={`tape-lane ${dir}`}>
        <div className="who">
          <b>{who}</b>
          <span>{to}</span>
        </div>
        <div className="tape-win">
          <div className="tape-track">
            <div className="tape-copy">{items}</div>
            <div className="tape-copy" aria-hidden="true">
              {items}
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div ref={ref} className={`tape${run ? " run" : ""}`} role="img" aria-label="The bytes of the real session of Sheet 08, both directions at once">
      {lane("c2s", "Client", "to the server →")}
      {lane("s2c", "Server", "← to the client")}
    </div>
  );
}

/** the captured session in numbers, all counted from SESSION */
function Numbers() {
  const frames = SESSION.filter((r) => r.kind === "frame") as { dir: Dir; hex: string }[];
  const bytes = (d: Dir) =>
    SESSION.filter((r) => r.dir === d).reduce((n, r) => n + (r.kind === "http" ? new TextEncoder().encode(r.text).length : r.hex.length / 2), 0);
  const head = (d: Dir) => frames.filter((r) => r.dir === d).reduce((n, r) => n + parseFrame(fromHex(r.hex)).headerLen, 0);
  const span = SESSION[SESSION.length - 1].t - SESSION[0].t;
  const rows: [string, string][] = [
    ["Records", `${SESSION.length} · 2 HTTP heads, ${frames.length} frames`],
    ["Client → server", `${bytes("c2s")} B · ${frames.filter((r) => r.dir === "c2s").length} frames`],
    ["Server → client", `${bytes("s2c")} B · ${frames.filter((r) => r.dir === "s2c").length} frames`],
    ["Frame headers", `${head("c2s") + head("s2c")} B in total`],
    ["Duration", `${span.toFixed(2)} ms, first byte to last`],
    ["Compression", "offered by the client, refused"],
  ];
  return (
    <dl className="nums">
      <div className="nums-h">The session in numbers</div>
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Cover() {
  return (
    <header id="top" className="cover">
      <div className="cover-row">
        <span>
          Technical dossier · network protocols · <b>{DOC}</b>
        </span>
        <span>
          Rev {REV} · {ISSUED} · 11 sheets + appendix
        </span>
      </div>
      <div className="cover-main">
        <h1 className="title">
          <span className="o">Web</span>
          <span className="s">Socket</span>
        </h1>
        <p className="lede">
          A WebSocket is one TCP connection that stays open. The client and the server can each send a message at any time. The connection starts as an
          HTTP request, then changes to the WebSocket protocol. This dossier follows one real session from the first request to the last frame.
        </p>
        <Numbers />
        <div className="stamp" aria-label="Stamp: every byte from a real capture">
          Every byte from a real capture
          <small>
            Node {RUN.node} ⇄ websockets {RUN.websockets}
          </small>
        </div>
      </div>
      <Tape />
      <div className="tape-cap">
        <span>The session of Sheet 08 on both lanes at once. Each lane moves in the direction of its bytes.</span>
        <span>
          <b>Magenta</b> · the first two header bytes of each frame
        </span>
      </div>
      <div className="meta">
        {[
          ["Document", DOC],
          ["Revision", REV],
          ["Issue date", ISSUED],
          ["Subject", "WebSocket protocol"],
          ["Standard", "RFC 6455 · WHATWG API"],
          ["Capture", `${RUN.date} · localhost`],
          ["Writing", "ASD-STE100"],
          ["Classification", "Public"],
        ].map(([k, v]) => (
          <div key={k}>
            <span className="k">{k}</span>
            <span className="v">{v}</span>
          </div>
        ))}
      </div>
      <div className="index">
        <div>
          <h3>Sheets</h3>
          <ol>
            {SHEETS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  <span className="n">{hexNo(s.no)}</span>
                  <span>{s.title}</span>
                  <span className="r">{s.dir === "c2s" ? "C → S" : "S → C"}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3>Figures</h3>
          <ol>
            {FIGURES.map(([no, t, s]) => (
              <li key={no}>
                <a href={`#fig${no}`}>
                  <span className="n">Fig. {no}</span>
                  <span>{t}</span>
                  <span className="r">{hexNo(s.slice(1))}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </header>
  );
}
