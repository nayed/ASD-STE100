import "./ws.css";
import { Body, Call, Code, DOC, Figure, ISSUED, Proc, Rail, REV, Section, SHEETS, Strip, TblCap, Term, useReading, Wire } from "./chrome";
import { Cover, FIGURES } from "./cover";
import { CLIENT_OUTPUT, RUN, SESSION } from "./data";
import { CLOSE_CODES } from "./frame";
import { CAPTURED_ACCEPT, CAPTURED_KEY, FigAccept, FigFourWays, FigHandshake, FigWhoSends, GET_HEAD, GUID, RES_HEAD, SIZES } from "./figs1";
import { FigFragments, FigFrameBuilder, FigMasking } from "./figs2";
import { FigBackoff, FigClose, FigMonitor, FigReadyState } from "./figs3";
import SERVER from "../../../scripts/websocket/server.py?theme=one-light&highlight";
import CLIENT from "../../../scripts/websocket/client.mjs?theme=one-light&highlight";
import RECONNECT from "./listings/reconnect.mjs?theme=one-light&highlight";

/** what reconnect.mjs printed in one run: server.py started about 4 s after the client; the waits are random */
const RECONNECT_OUTPUT = `close 1006, try 1 in 216 ms
close 1006, try 2 in 518 ms
close 1006, try 3 in 1445 ms
close 1006, try 4 in 2432 ms
open
message Hello`;

const frames = SESSION.filter((r) => r.kind === "frame");
const fromClient = frames.filter((r) => r.dir === "c2s").length;

export default function WebSocketArticle() {
  const reading = useReading();
  return (
    <div className="ws">
      <Strip active={reading.active} progress={reading.progress} />
      <div className="page">
        <Rail active={reading.active} progress={reading.progress} />
        <main>
          <Cover />

          {/* ============ 0x01 ============ */}
          <Section id="s01">
            <Body
              aside={
                <>
                  <div className="mnote">
                    <h5>Two URL schemes</h5>
                    <p>
                      <code>ws://</code> sends the bytes as clear text. <code>wss://</code> sends them through TLS, as <code>https://</code> does. Use{" "}
                      <code>wss://</code> in production.
                    </p>
                  </div>
                  <div className="mnote">
                    <h5>Messages, not a stream</h5>
                    <p>A WebSocket is not a raw TCP socket. It carries messages. Each message arrives complete and in order.</p>
                  </div>
                </>
              }
            >
              <p className="lead">
                A WebSocket is a connection between a client and a server that stays open. Each side can send a message at any time. The other side
                gets it at once, with no new request.
              </p>
              <p>HTTP works in a different way. The client sends a request. The server sends one response. The server cannot start a message.</p>
              <p>
                RFC 6455 defines the protocol. It runs on TCP, on the ports of HTTP: 80 for <code>ws://</code> and 443 for <code>wss://</code>. A
                browser page uses it through the <code>WebSocket</code> class. Node 22 and later have the same class.
              </p>
              <p>Use a WebSocket when the server must push data, or when both sides talk often. Examples are chat, live prices, games and shared editors.</p>
            </Body>
            <Figure
              no="01" title="Who can send, and when" dwg="DWG WS-01 · time runs down"
              note="In lane A, the new price waits on the server for the next request. In lane B, the server sends it when the price changes."
            >
              <FigWhoSends />
            </Figure>
          </Section>

          {/* ============ 0x02 ============ */}
          <Section id="s02">
            <Body
              aside={
                <Call>
                  The sizes in Table 2-1 come from the fetch function of Node on localhost. A browser sends more headers, for example cookies and its user
                  agent. Its requests are larger.
                </Call>
              }
            >
              <p className="lead">
                Without WebSocket, a browser has three ways to get server events: short polling, long polling and server-sent events. Each one has a
                cost.
              </p>
              <p>Short polling sends a request at a fixed interval. Most responses are empty. Each request carries all the HTTP headers again.</p>
              <p>Long polling sends a request that the server keeps open. The server answers when it has an event. Then the client sends a new request.</p>
              <p>
                Server-sent events (SSE) keep one HTTP response open. The server writes each event into it as a line of text. SSE goes in one direction
                only, from the server to the client.
              </p>
              <p>A WebSocket costs one handshake. After it, a small message costs a header of 2 to 14 bytes.</p>
            </Body>
            <Figure
              no="02" title="Four ways to get the same server events" dwg="Interactive · model · sizes from Table 2-1"
              note="The five event times are an example. The delays use a one-way time of 250 ms. The byte counts add the measured sizes of Table 2-1."
            >
              <FigFourWays />
            </Figure>
            <TblCap no="2-1">Bytes on the wire · measured with capture.py · Node {RUN.node} fetch to Python http.server</TblCap>
            <div className="tw">
              <table className="tbl" style={{ minWidth: 560 }}>
                <thead>
                  <tr>
                    <th>Exchange</th>
                    <th className="r">Request</th>
                    <th className="r">Response</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="k">Poll, no news</td>
                    <td className="r">{SIZES.pollReq} B</td>
                    <td className="r">{SIZES.pollEmpty} B</td>
                    <td>204 No Content</td>
                  </tr>
                  <tr>
                    <td className="k">Poll, one event</td>
                    <td className="r">{SIZES.pollReq + 5} B</td>
                    <td className="r">{SIZES.pollNews} B</td>
                    <td>200 with 12 B of JSON. The path holds “?news”, 5 B more.</td>
                  </tr>
                  <tr>
                    <td className="k">SSE stream</td>
                    <td className="r">{SIZES.sseReq} B</td>
                    <td className="r">
                      {SIZES.sseHead} + {SIZES.sseEvent} B
                    </td>
                    <td>The head one time, then {SIZES.sseEvent} B for each event</td>
                  </tr>
                  <tr>
                    <td className="k">WebSocket handshake</td>
                    <td className="r">{SIZES.wsGet} B</td>
                    <td className="r">{SIZES.ws101} B</td>
                    <td>One time for each connection (Sheet 03)</td>
                  </tr>
                  <tr className="hl">
                    <td className="k">WebSocket frame</td>
                    <td className="r">—</td>
                    <td className="r">{SIZES.wsFrame} B</td>
                    <td>2 B of header and the same 12 B of JSON. From the frame format (Sheet 04).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* ============ 0x03 ============ */}
          <Section id="s03">
            <Body
              aside={
                <>
                  <Call>
                    Node sent no <code>Origin</code> line, because it is not a browser. A browser always sends one. Sheet 10 tells how a server uses it.
                  </Call>
                  <div className="mnote">
                    <h5>Optional lines</h5>
                    <p>
                      <code>Sec-WebSocket-Protocol</code> asks for a subprotocol, for example <code>graphql-ws</code>. <code>Sec-WebSocket-Extensions</code>{" "}
                      offers extensions. The server picks one or none.
                    </p>
                  </div>
                </>
              }
            >
              <p className="lead">
                A WebSocket connection starts as one HTTP/1.1 request. The client asks the server to change the protocol. If the server agrees, it
                answers with status 101. Then both sides send frames on the same TCP connection.
              </p>
              <p>
                The request must hold four lines: <code>Upgrade: websocket</code>, <code>Connection: Upgrade</code>, a random{" "}
                <code>Sec-WebSocket-Key</code> and <code>Sec-WebSocket-Version: 13</code>.
              </p>
              <p>
                The server proves that it read the key. It adds a fixed GUID to the key, calculates SHA-1, and encodes the result in base64. It sends
                the result in <code>Sec-WebSocket-Accept</code>.
              </p>
              <p>
                A server that does not know WebSocket cannot make this value. So the client knows that the other side speaks WebSocket. The key is not
                security, because anyone can calculate the value.
              </p>
            </Body>
            <Wire label="Exhibit 3-1 · request, client to server" text={GET_HEAD} mark={["upgrade", "connection", "sec-websocket-key", "sec-websocket-version"]} />
            <Wire label="Exhibit 3-2 · response, server to client" text={RES_HEAD} mark={["upgrade", "connection", "sec-websocket-accept"]} />
            <Figure
              no="03" title="The opening handshake" dwg="DWG WS-03 · times from the capture"
              note="The TCP connection opens first, but the tap records only the bytes inside it. After the 101 response, HTTP ends. The next byte is the first frame."
            >
              <FigHandshake />
            </Figure>
            <Term
              label="Terminal 3-1 · the Accept value with OpenSSL" meta="key from Exhibit 3-1"
              command={`printf '%s' '${CAPTURED_KEY}${GUID}' | openssl sha1 -binary | base64`}
              output={CAPTURED_ACCEPT}
            />
            <Figure
              no="04" title="Sec-WebSocket-Accept, computed" dwg="Interactive · Web Crypto SHA-1 in this page"
              note="This page calculates each step with the Web Crypto API. Type a key, or make a random one. The captured key gives the value of Exhibit 3-2."
            >
              <FigAccept />
            </Figure>
          </Section>

          {/* ============ 0x04 ============ */}
          <Section id="s04">
            <Body
              aside={
                <div className="mnote">
                  <h5>Text or binary</h5>
                  <p>A text frame must hold valid UTF-8. If it does not, the receiver closes the connection with code 1007. A binary frame can hold any bytes.</p>
                </div>
              }
            >
              <p className="lead">After the handshake, each side sends frames. A frame has a header of 2 to 14 bytes, then the payload.</p>
              <p>The first byte holds FIN, three reserved bits and the opcode. The second byte holds MASK and a 7-bit length.</p>
              <p>
                A payload of 125 bytes or less fits in the 7-bit length. For 126 to 65,535 bytes, the length field holds 126, and a 16-bit length
                follows. For a larger payload, it holds 127, and a 64-bit length follows.
              </p>
              <p>A client adds a 4-byte masking key. So the smallest client frame is 6 bytes. The smallest server frame is 2 bytes.</p>
            </Body>
            <Figure
              no="05" title="The frame header, bit by bit" dwg="Interactive · layout of RFC 6455 § 5.2 · 32 bits a row"
              note="Select a preset or type a payload. Select a field to see its bits. The first preset gives the bytes of record 03 of the real session."
            >
              <FigFrameBuilder />
            </Figure>
            <div className="body has-aside" style={{ marginTop: 6 }}>
              <div>
                <TblCap no="4-1">Opcodes</TblCap>
                <div className="tw">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Opcode</th>
                        <th>Frame</th>
                        <th>Kind</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["0x0", "Continuation", "Data: the next fragment of a message"],
                        ["0x1", "Text", "Data: UTF-8 text"],
                        ["0x2", "Binary", "Data: any bytes"],
                        ["0x3–0x7", "Reserved", "For future data frames"],
                        ["0x8", "Close", "Control: starts or answers the closing handshake"],
                        ["0x9", "Ping", "Control: asks for a pong"],
                        ["0xA", "Pong", "Control: answers a ping"],
                        ["0xB–0xF", "Reserved", "For future control frames"],
                      ].map(([o, f, k]) => (
                        <tr key={o}>
                          <td className="k">{o}</td>
                          <td>{f}</td>
                          <td>{k}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <TblCap no="4-2">Header size</TblCap>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Payload</th>
                      <th className="r">Server</th>
                      <th className="r">Client</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["0–125 B", 2, 6],
                      ["126 B–64 KiB", 4, 8],
                      ["over 64 KiB", 10, 14],
                    ].map(([p, s, c]) => (
                      <tr key={p}>
                        <td className="k">{p}</td>
                        <td className="r">{s} B</td>
                        <td className="r">{c} B</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          {/* ============ 0x05 ============ */}
          <Section id="s05">
            <Body
              aside={
                <div className="mnote">
                  <h5>Why proxies</h5>
                  <p>
                    RFC 6455, section 10.3, names the attack: cache poisoning. Masking makes the bytes on the wire unknown to the page that sends
                    them.
                  </p>
                </div>
              }
            >
              <p className="lead">
                A client must mask the payload of each frame. It makes 4 random bytes, the masking key. Then it applies XOR to each payload byte and one
                byte of the key.
              </p>
              <p>Payload byte i uses key byte i mod 4. The server applies the same XOR to get the payload back.</p>
              <p>Masking is not encryption. The key is in the frame, next to the data.</p>
              <p>
                Masking protects old proxies, not your data. Without it, a hostile page could send bytes that look like an HTTP request. A proxy could
                then keep a false response in its cache.
              </p>
              <p>A server must close the connection if a client frame has no mask. A client must close it if a server frame has a mask.</p>
              <Call kind="warning">DO NOT use masking to hide data. Use wss:// (TLS) to protect the data on the network.</Call>
            </Body>
            <Figure
              no="06" title="Masking: XOR with a 4-byte key" dwg="DWG WS-06 · record 03 of Fig. 09"
              note="The bytes come from record 03 of the session: the client sends “Hello”. The key changes in each frame, so the same text gives different bytes."
            >
              <FigMasking />
            </Figure>
          </Section>

          {/* ============ 0x06 ============ */}
          <Section id="s06">
            <Body
              aside={
                <div className="mnote">
                  <h5>No ping in the browser API</h5>
                  <p>The page cannot send a ping. The browser answers pings by itself. To test the connection from the page, send a small application message.</p>
                </div>
              }
            >
              <p className="lead">
                A message can use one frame or many frames. The first frame gives the type, text or binary. The next frames use opcode 0x0,
                continuation. The last frame has FIN = 1.
              </p>
              <p>With fragments, a sender can start a message before it knows the full length. The receiver joins the fragments and gives one message to the program.</p>
              <p>
                In the session, the server sends “Fragmented” in four frames. Its library adds an empty last frame to set FIN = 1.
              </p>
              <p>
                Control frames manage the connection: ping (0x9), pong (0xA) and close (0x8). A control frame holds 125 bytes or less. A sender must not
                cut it into fragments.
              </p>
              <p>A control frame can come between two fragments of a message. So a long message does not delay a ping.</p>
              <p>
                An endpoint that receives a ping sends a pong with the same payload. In the session, the client answered the ping “tick” by itself. The
                program saw nothing.
              </p>
            </Body>
            <Figure
              no="07" title="One message in four frames" dwg="DWG WS-07 · real bytes · records 12 to 15"
              note="Each block is one frame, byte by byte. The client gives the message to the program only after the frame with FIN 1."
            >
              <FigFragments />
            </Figure>
          </Section>

          {/* ============ 0x07 ============ */}
          <Section id="s07">
            <Body
              aside={
                <Call kind="caution">
                  close() accepts only 1000, or a code from 3000 to 4999. Other codes cause an InvalidAccessError.
                </Call>
              }
            >
              <p className="lead">
                To close a connection, one side sends a close frame. The other side answers with a close frame. Then the server closes the TCP
                connection.
              </p>
              <p>The close payload starts with a 2-byte status code. A reason in UTF-8 can follow, up to 123 bytes.</p>
              <p>After an endpoint sends a close frame, it sends no more data. It can still receive frames until the close frame of the other side arrives.</p>
              <p>
                If TCP closes with no close frame, the browser gives code 1006. A program never sends 1005 or 1006. These codes exist only in the close
                event.
              </p>
            </Body>
            <Figure
              no="08" title="The closing handshake" dwg="DWG WS-08 · records 16 and 17"
              note="Both close frames carry 1000 and the reason “done”. The client masks its frame. The tap does not see the two TCP FIN segments."
            >
              <FigClose />
            </Figure>
            <TblCap no="7-1">Close codes · RFC 6455 § 7.4</TblCap>
            <div className="tw">
              <table className="tbl" style={{ minWidth: 560 }}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {CLOSE_CODES.map(([c, n, m]) => (
                    <tr key={c} className={c === 1000 ? "hl" : undefined}>
                      <td className={`k${c === 1000 ? " a" : ""}`}>{c === 4000 ? "4000–4999" : c}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{c === 4000 ? "Private use" : n}</td>
                      <td>{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* ============ 0x08 ============ */}
          <Section id="s08">
            <Body
              aside={
                <>
                  <div className="mnote">
                    <h5>What the tap sees</h5>
                    <p>
                      The tap reads TCP data, not packets. It cannot see the TCP handshake or the FIN segments. The tap saw {frames.length} frames: {fromClient} from the client,{" "}
                      {frames.length - fromClient} from the server.
                    </p>
                  </div>
                  <div className="mnote">
                    <h5>Frames in one read</h5>
                    <p>The echo and the ping (records 04 and 05) arrived in one TCP read. TCP keeps no frame limits. The receiver finds them from the length fields.</p>
                  </div>
                </>
              }
            >
              <p className="lead">
                This sheet shows one complete session, byte by byte. A small relay, the tap, copied each byte between a client and a server. It recorded
                the time of each byte.
              </p>
              <p>
                Exhibit A is the server, in Python with the websockets library. Exhibit B is the client, in Node. It uses the same WebSocket class as a
                browser. Output B is what the client printed.
              </p>
              <p>The client sends text, binary data and a long text, and asks for a fragmented message. Then it closes the connection.</p>
            </Body>
            <Code label="Exhibit A · scripts/websocket/server.py" meta={`Python ${RUN.python} · websockets ${RUN.websockets} · ${SERVER.lines.length} lines`} listing={SERVER} />
            <Code label="Exhibit B · scripts/websocket/client.mjs" meta={`Node ${RUN.node} · ${CLIENT.lines.length} lines`} listing={CLIENT} />
            <Term label="Output B · node client.mjs" meta={`run by capture.py through the tap · ${RUN.date}`} command="node client.mjs" output={CLIENT_OUTPUT} />
            <Figure
              no="09" title="Line monitor: the whole session" dwg={`Interactive · ${SESSION.length} records · capture of ${RUN.date}`}
              note="Select a record, or play the session. Point to a row of the table to mark its bytes. The times count from the first byte of the handshake."
            >
              <FigMonitor />
            </Figure>
            <Proc
              title="Procedure — record the session again"
              steps={[
                <>Install Python 3 and Node 22 or later.</>,
                <>
                  Go to the folder <code>scripts/websocket</code> of the repository.
                </>,
                <>
                  Make a virtual environment: <code>python3 -m venv .venv</code>.
                </>,
                <>
                  Install the library: <code>.venv/bin/pip install -r requirements.txt</code>.
                </>,
                <>
                  Run <code>.venv/bin/python capture.py</code>. It writes <code>src/articles/websocket/data.ts</code>.
                </>,
                <>Build the site again. The keys and the masks change in each run, so all masked bytes change.</>,
              ]}
            />
          </Section>

          {/* ============ 0x09 ============ */}
          <Section id="s09">
            <Body
              aside={
                <Call kind="caution">
                  DO NOT call send() in a loop without a check of bufferedAmount. If the network is slower than the loop, the queue grows in memory.
                </Call>
              }
            >
              <p className="lead">
                A browser page uses the WebSocket class. The constructor opens the connection. Four events report what happens: open, message, error
                and close.
              </p>
              <p>The page never sees frames. It gets complete messages. The browser masks, joins fragments, answers pings and closes by itself.</p>
              <p>send() does not wait. It puts the data in a queue and returns. bufferedAmount gives the bytes that are still in the queue.</p>
              <p>
                The error event gives no details, for security. Read the close event after it. Its code and its wasClean flag tell more.
              </p>
            </Body>
            <TblCap no="9-1">The WebSocket class · WHATWG WebSockets Standard</TblCap>
            <div className="tw">
              <table className="tbl" style={{ minWidth: 560 }}>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>What it does</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["new WebSocket(url, protocols?)", "Starts the handshake. readyState is 0."],
                    ["send(data)", "Sends a string as a text frame. Sends an ArrayBuffer, a typed array or a Blob as a binary frame."],
                    ["close(code?, reason?)", "Starts the closing handshake."],
                    ["readyState", "0 CONNECTING, 1 OPEN, 2 CLOSING, 3 CLOSED."],
                    ["bufferedAmount", "Bytes that send() put in the queue and the browser did not send yet."],
                    ["binaryType", "“blob” (the default) or “arraybuffer”: the type of binary data in message events."],
                    ["protocol, extensions", "The subprotocol and the extensions that the server accepted. Empty in the session."],
                    ["onopen, onmessage, onerror, onclose", "The four events. addEventListener() also works."],
                  ].map(([m, d]) => (
                    <tr key={m}>
                      <td className="k">
                        <code>{m}</code>
                      </td>
                      <td>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Figure
              no="10" title="readyState, from open to closed" dwg="Interactive · WHATWG WebSockets Standard"
              note="Select the actions in order. An action that the current state does not allow stays disabled. The events appear under the drawing."
            >
              <FigReadyState />
            </Figure>
          </Section>

          {/* ============ 0x0A ============ */}
          <Section id="s10">
            <Body
              aside={
                <>
                  <div className="mnote">
                    <h5>Defaults of websockets</h5>
                    <p>A ping every 20 s. Messages up to 1 MiB, then close code 1009. Exhibit A turns off the pings, so that the capture stays short.</p>
                  </div>
                  <div className="mnote">
                    <h5>Behind nginx</h5>
                    <p>
                      Set <code>proxy_http_version 1.1</code>, and pass the <code>Upgrade</code> and <code>Connection</code> headers. Its idle time-out is 60 s by
                      default.
                    </p>
                  </div>
                </>
              }
            >
              <p className="lead">
                A WebSocket stays open for minutes or hours. Most production problems come from this long life: proxies, load balancers, restarts and
                lost networks.
              </p>
              <h3>Security</h3>
              <p>Use wss:// only. TLS protects the data, and most proxies let it through with no change.</p>
              <p>
                Check the Origin header in the handshake. A browser can send the cookies of your site with a WebSocket request from another site.
                Without the check, that site can open a connection as your user.
              </p>
              <p>
                In websockets, the <code>origins</code> argument of <code>serve()</code> refuses all other origins. Also set a maximum message size.
              </p>
              <Call kind="warning">
                DO NOT accept a connection only because it has a session cookie. Check Origin. Then authenticate in the handshake or in the first message.
              </Call>
              <h3>Proxies and load balancers</h3>
              <p>A proxy closes a connection that stays quiet for too long. Send a ping, or a small message, more often than its idle time-out.</p>
              <p>
                A load balancer can send each connection to a different server. A message for one user must reach the server that holds the connection
                of that user. Use a shared message bus between the servers, for example Redis pub/sub.
              </p>
              <h3>Connect again</h3>
              <p>Connections close: a deploy, a lost Wi-Fi network, a laptop that sleeps. The client must connect again by itself.</p>
              <p>Wait longer after each failure: 0.5 s, 1 s, 2 s, 4 s, up to a limit. This is exponential backoff.</p>
              <p>Add a random part to each wait. This is jitter. Without it, all the clients of a restarted server try at the same time.</p>
            </Body>
            <Code label="Exhibit C · listings/reconnect.mjs" meta={`JavaScript · ${RECONNECT.lines.length} lines · browser or Node 22+`} listing={RECONNECT} />
            <Term label="Output C · node reconnect.mjs" meta="server.py started 4 s after the client · one run, random waits" command="node reconnect.mjs" output={RECONNECT_OUTPUT} />
            <Figure
              no="11" title="Reconnect: backoff and jitter" dwg="Interactive · simulation of Exhibit C"
              note="24 clients lose the server at 0 s. The server comes back at 6 s. Without jitter, all tries fall at the same times. With jitter, they spread out."
            >
              <FigBackoff />
            </Figure>
            <Proc
              title="Procedure — continue after a reconnect"
              steps={[
                "Keep the messages that the client could not send.",
                "When the connection opens, authenticate again.",
                "Send the identifier of the last message that the client received.",
                "On the server, send the messages that the client did not get.",
                "Send the kept messages.",
              ]}
            />
          </Section>

          {/* ============ 0x0B ============ */}
          <Section id="s11">
            <Body>
              <p className="lead">
                Use the simplest method that does the job. A WebSocket is the best choice when both sides send often, or when the delay must be low.
              </p>
              <p>For events from the server only, server-sent events usually do the job. EventSource connects again by itself, and SSE uses plain HTTP.</p>
            </Body>
            <TblCap no="11-1">Selection of a method</TblCap>
            <div className="tw">
              <table className="tbl" style={{ minWidth: 680 }}>
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Direction</th>
                    <th>Delay</th>
                    <th>Cost of one event</th>
                    <th>Use for</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Short polling", "Client asks", "Up to one interval", "A full request and response", "Data that changes rarely"],
                    ["Long polling", "Client asks, server waits", "Low", "A full request and response", "Networks that block the other methods"],
                    ["Server-sent events", "Server to client", "Low", "One line of text", "Notifications, feeds, logs, model output"],
                    ["WebSocket", "Both, at any time", "Low", "A header of 2 to 14 B", "Chat, games, shared editors, live prices"],
                    ["WebTransport", "Both, over HTTP/3", "Low", "QUIC streams or datagrams", "New projects that need datagrams; check browser support"],
                  ].map((r) => (
                    <tr key={r[0]} className={r[0] === "WebSocket" ? "hl" : undefined}>
                      <td className={`k${r[0] === "WebSocket" ? " a" : ""}`}>{r[0]}</td>
                      {r.slice(1).map((c, i) => (
                        <td key={i}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3>Summary</h3>
            <div className="sum">
              {[
                "A WebSocket is one TCP connection that stays open. Both sides send messages at any time.",
                "It starts as an HTTP request. The answer 101 changes the protocol on the same connection.",
                "The Accept value proves that the server read the key. It is not security.",
                "A frame has a header of 2 to 14 bytes. The opcode gives its type. FIN marks the last fragment.",
                "A client masks each frame with 4 random bytes. Masking protects proxies, not data.",
                "Ping, pong and close are control frames. The browser handles them by itself.",
                "Use wss://, check Origin, and send a message more often than the proxy time-out.",
                "Connect again with exponential backoff and jitter.",
              ].map((s, i) => (
                <div key={i}>
                  <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* ============ APPENDIX A ============ */}
          <Section id="sA">
            <dl className="gloss">
              {[
                ["Backoff", "A wait that grows after each failed try, up to a limit."],
                ["bufferedAmount", "The bytes that send() put in the queue and the browser did not send yet."],
                ["Close code", "The 2-byte status at the start of a close frame. 1000 is a normal closure."],
                ["Control frame", "A ping, pong or close frame. It holds 125 bytes or less and has no fragments."],
                ["Fragment", "One frame of a message that uses more than one frame."],
                ["Frame", "The unit on the wire: a header of 2 to 14 bytes, then the payload."],
                ["Handshake", "The HTTP request and the 101 response that open the connection."],
                ["Jitter", "A random part of a wait. It spreads the tries of many clients."],
                ["Masking key", "4 random bytes in each client frame. The client applies XOR to the payload with them."],
                ["Message", "What the program sends and receives: text or binary, in one or more frames."],
                ["Opcode", "4 bits in the first byte of a frame. They give its type."],
                ["Origin", "The header in which a browser names the site of the page."],
                ["readyState", "The state of a WebSocket object: 0 to 3."],
                ["Server-sent events", "One HTTP response that stays open. The server writes events into it."],
                ["Subprotocol", "An application protocol on top of WebSocket, chosen in the handshake."],
                ["wss://", "A WebSocket through TLS, on port 443 by default."],
              ].map(([t, d]) => (
                <div key={t}>
                  <dt>{t}</dt>
                  <dd>{d}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <footer className="foot">
            <div>
              <h4>Colophon</h4>
              <p>
                Set in IBM Plex Mono. Written in ASD-STE100 Simplified Technical English. Drawings are hand-built SVG. Magenta marks the key element of
                each figure.
              </p>
              <p style={{ marginTop: 8 }}>
                Content CC BY 4.0, code MIT. Every byte comes from one capture on localhost, on {RUN.date}. The tools: Node {RUN.node}, Python{" "}
                {RUN.python} and websockets {RUN.websockets}.
              </p>
            </div>
            <div>
              <h4>Sources</h4>
              <ul>
                <li>RFC 6455, The WebSocket Protocol (2011)</li>
                <li>RFC 7692, Compression Extensions for WebSocket</li>
                <li>WHATWG, WebSockets Standard</li>
                <li>websockets library documentation, version {RUN.websockets}</li>
                <li>Scripts: scripts/websocket/ in this repository</li>
              </ul>
            </div>
            <div className="ctrl">
              <span>Document</span>
              <span>{DOC}</span>
              <span>Revision</span>
              <span>{REV}</span>
              <span>Issued</span>
              <span>{ISSUED}</span>
              <span>Sheets</span>
              <span>{SHEETS.length - 1} + appendix</span>
              <span>Figures</span>
              <span>{FIGURES.length}</span>
            </div>
            <div className="endline">
              <span className="fr">
                <i>88 06 03 e8</i> 64 6f 6e 65
              </span>
              <span>Close 1000 · normal closure · end of document · nothing follows</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
