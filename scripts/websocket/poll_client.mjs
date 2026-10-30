// For Sheet 02: the same event, received by polling and by server-sent events.
const base = "http://localhost:8766";
await (await fetch(`${base}/poll`)).text();        // poll, no news
await (await fetch(`${base}/poll?news`)).text();   // poll, one event
const res = await fetch(`${base}/events`, { headers: { Accept: "text/event-stream" } });
await res.text();                                  // the stream ends after one event
