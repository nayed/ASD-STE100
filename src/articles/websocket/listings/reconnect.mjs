// Exhibit C: a client that connects again after a failure.
// It waits longer after each failure, and adds a random part (jitter).
const URL = "ws://localhost:8765/chat";
const BASE = 500;     // ms, the first wait
const CAP = 30_000;   // ms, the longest wait
let failures = 0;

function connect() {
  const ws = new WebSocket(URL);
  ws.onopen = () => {
    failures = 0;
    console.log("open");
    ws.send("Hello");
  };
  ws.onmessage = (event) => console.log("message", event.data);
  ws.onclose = (event) => {
    if (event.code === 1000) return;              // normal closure: stop here
    const ceiling = Math.min(CAP, BASE * 2 ** failures);
    const wait = Math.random() * ceiling;         // "full jitter": 0 to ceiling
    failures += 1;
    console.log(`close ${event.code}, try ${failures} in ${Math.round(wait)} ms`);
    setTimeout(connect, wait);
  };
}

connect();
