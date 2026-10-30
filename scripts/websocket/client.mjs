// Exhibit B: a client. Node has the same WebSocket class as the browser.
const ws = new WebSocket("ws://localhost:8764/chat");
ws.binaryType = "arraybuffer";
const t0 = performance.now();
const log = (...a) => console.log(`${(performance.now() - t0).toFixed(1).padStart(6)} ms`, ...a);

ws.onopen = () => {
  log("open     readyState", ws.readyState, "extensions", JSON.stringify(ws.extensions));
  ws.send("Hello");
};

let step = 0;
ws.onmessage = (event) => {
  const data = event.data instanceof ArrayBuffer ? new Uint8Array(event.data) : event.data;
  log("message ", typeof data === "string" ? JSON.stringify(data.slice(0, 40)) : data, `(${data.length})`);
  step += 1;
  if (step === 1) ws.send(new Uint8Array([0x00, 0x2a, 0xff, 0x10]));  // 4 bytes, binary
  if (step === 2) ws.send("x".repeat(200));                          // longer than 125 bytes
  if (step === 3) ws.send("frag");
  if (step === 4) ws.close(1000, "done");
};

ws.onclose = (event) => log("close    code", event.code, "reason", JSON.stringify(event.reason), "clean", event.wasClean);
