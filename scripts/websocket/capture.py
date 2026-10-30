"""
Writes src/articles/websocket/data.ts: every byte that the WebSocket article shows.

    cd scripts/websocket
    python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt
    .venv/bin/python capture.py

Needs Node 22 or later (it has the WebSocket class). The script starts server.py (Exhibit A) and a
tap: a TCP relay that copies each byte between the client and the server, and records it with its
time. Then it runs client.mjs (Exhibit B) through the tap, and does the same for the polling and
server-sent-events requests of Sheet 02 (poll_server.py, poll_client.mjs). It splits the WebSocket
bytes into the handshake and the frames, and writes them with the output of the client.
The masking key and Sec-WebSocket-Key are random: each run gives other bytes.
"""
import asyncio, base64, datetime, hashlib, json, os, platform, subprocess, sys, time
from importlib.metadata import version

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "../../src/articles/websocket/data.ts")
GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"   # RFC 6455, section 1.3

async def tap(listen, target, log, clock):
    """relay localhost:listen to localhost:target; log [direction, ms, bytes] for each read"""
    async def pipe(reader, writer, direction):
        while data := await reader.read(65536):
            log.append([direction, round((time.perf_counter() - clock["t0"]) * 1000, 2), data])
            writer.write(data)
            await writer.drain()
        writer.close()

    async def on_client(cr, cw):
        sr, sw = await asyncio.open_connection("localhost", target)
        await asyncio.gather(pipe(cr, sw, "c2s"), pipe(sr, cw, "s2c"))

    return await asyncio.start_server(on_client, "localhost", listen)

async def run(server_cmd, client_cmd, listen, target):
    log, clock = [], {"t0": time.perf_counter()}
    server = subprocess.Popen(server_cmd, cwd=HERE)
    relay = await tap(listen, target, log, clock)
    await asyncio.sleep(1.0)
    clock["t0"] = time.perf_counter()   # times count from the start of the client
    client = await asyncio.create_subprocess_exec(*client_cmd, cwd=HERE, stdout=asyncio.subprocess.PIPE)
    out, _ = await client.communicate()
    await asyncio.sleep(0.3)
    relay.close()
    server.terminate()
    return log, out.decode().rstrip("\n")

def frames(stream):
    """split the bytes of one direction (after the handshake) into WebSocket frames"""
    out, i = [], 0
    while i < len(stream):
        b1 = stream[i + 1]
        n, j = b1 & 0x7F, i + 2
        if n == 126: n, j = int.from_bytes(stream[j:j + 2]), j + 2
        elif n == 127: n, j = int.from_bytes(stream[j:j + 8]), j + 8
        if b1 & 0x80: j += 4
        out.append((i, j + n))
        i = j + n
    return out

async def main():
    node = "node"
    ws_log, client_out = await run([sys.executable, "server.py"], [node, "client.mjs"], 8764, 8765)
    poll_log, _ = await run([sys.executable, "poll_server.py"], [node, "poll_client.mjs"], 8766, 8767)

    # WebSocket: cut each direction into the HTTP part and the frames, keep the time of the read that carried each frame
    records = []
    for d in ("c2s", "s2c"):
        reads = [(t, b) for dd, t, b in ws_log if dd == d]
        stream = b"".join(b for _, b in reads)
        starts, pos = [], 0
        for t, b in reads:
            starts.append((pos, t)); pos += len(b)
        time_at = lambda off: max(t for p, t in starts if p <= off)
        head = stream.index(b"\r\n\r\n") + 4
        records.append({"dir": d, "t": time_at(0), "kind": "http", "text": stream[:head].decode()})
        for a, b in frames(stream[head:]):
            records.append({"dir": d, "t": time_at(head + a), "kind": "frame", "hex": stream[head + a:head + b].hex()})
    records.sort(key=lambda r: (r["t"], r["dir"] == "s2c"))

    # check Sec-WebSocket-Accept against the key, as a client must
    req = records[0]["text"] if records[0]["dir"] == "c2s" else records[1]["text"]
    key = next(l.split(": ", 1)[1] for l in req.split("\r\n") if l.lower().startswith("sec-websocket-key"))
    accept = base64.b64encode(hashlib.sha1((key + GUID).encode()).digest()).decode()
    res = next(r["text"] for r in records if r["dir"] == "s2c" and r["kind"] == "http")
    assert accept in res, "Sec-WebSocket-Accept does not match"

    # polling and server-sent events: the bytes of each request and each response, in order
    http = []
    for d, t, b in poll_log:
        if http and http[-1]["dir"] == d: http[-1]["text"] += b.decode()
        else: http.append({"dir": d, "text": b.decode()})
    for h in http: h["bytes"] = len(h["text"].encode())

    run_info = {"date": datetime.date.today().isoformat(), "python": platform.python_version(),
                "websockets": version("websockets"),
                "node": subprocess.run([node, "--version"], capture_output=True, text=True).stdout.strip().lstrip("v")}
    J = lambda o: json.dumps(o, ensure_ascii=False)
    ts = f'''/**
 * Data of WS-6455, written by scripts/websocket/capture.py: do not edit by hand. Captured on {run_info["date"]} with a
 * TCP tap between client.mjs (Node {run_info["node"]}, its built-in WebSocket) and server.py (Python {run_info["python"]},
 * websockets {run_info["websockets"]}), on localhost. Every byte below crossed the wire in that run.
 */

export type Dir = "c2s" | "s2c";
/** one record of the session: the HTTP head of the handshake, or one WebSocket frame as hex */
export type Rec = {{ dir: Dir; t: number; kind: "http"; text: string }} | {{ dir: Dir; t: number; kind: "frame"; hex: string }};
export type HttpMsg = {{ dir: Dir; text: string; bytes: number }};

export const RUN = {J(run_info)};

/** the WebSocket session, in time order (t in ms from the start of the client) */
export const SESSION: Rec[] = {J(records)};

/** what client.mjs printed in the same run */
export const CLIENT_OUTPUT = {J(client_out)};

/** Sheet 02: poll without news, poll with news, one server-sent event; request and response bytes */
export const HTTP_RUN: HttpMsg[] = {J(http)};
'''
    open(OUT, "w").write(ts)
    print(client_out)
    for r in records:
        print(r["dir"], r["t"], r["kind"], r.get("hex", "")[:60] or r["text"].split("\r\n")[0])
    for h in http:
        print(h["dir"], h["bytes"], h["text"].split("\r\n")[0])
    print(f"wrote {os.path.relpath(OUT)} ({len(ts)} bytes)")

asyncio.run(main())
