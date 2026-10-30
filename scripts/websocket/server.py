# Exhibit A: an echo server. It sends back each message, pings the client once,
# and answers "frag" with one message in three fragments.
import asyncio
from websockets.asyncio.server import serve

async def handler(ws):
    pinged = False
    async for message in ws:
        if message == "frag":
            await ws.send(["Frag", "ment", "ed"])  # one message, three frames
            continue
        await ws.send(message)                     # echo: text stays text, bytes stay bytes
        if not pinged:
            await ws.ping(b"tick")                 # the client answers with a pong
            pinged = True

async def main():
    # compression off, so that the payload bytes stay readable on the wire
    async with serve(handler, "localhost", 8765, compression=None, ping_interval=None) as server:
        await server.serve_forever()

asyncio.run(main())
