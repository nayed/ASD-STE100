# For Sheet 02: one HTTP endpoint for polling and one for server-sent events.
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def do_GET(self):
        if self.path == "/poll":                       # no news yet
            self.send_response(204)
            self.end_headers()
        elif self.path == "/poll?news":                # one event, as JSON
            body = b'{"price":42}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif self.path == "/events":                   # server-sent events: one event, then the end
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.write(b'data: {"price":42}\n\n')
            self.wfile.flush()

    def log_message(self, *args):
        pass

ThreadingHTTPServer(("localhost", 8767), Handler).serve_forever()
