/** RFC 6455 frames, with no React: decode the captured bytes, build a frame from options, name the fields. */

export const OPCODES: Record<number, string> = { 0: "CONTINUATION", 1: "TEXT", 2: "BINARY", 8: "CLOSE", 9: "PING", 10: "PONG" };
export const SHORT_OP: Record<number, string> = { 0: "CONT", 1: "TEXT", 2: "BIN", 8: "CLOSE", 9: "PING", 10: "PONG" };

export type FieldId = "fin" | "rsv" | "opcode" | "mask" | "len" | "ext" | "key" | "payload";

/** one field of the header, by bit position from the first bit of the frame */
export type Field = { id: FieldId; name: string; bit: number; bits: number; value: string };

export type Frame = {
  bytes: Uint8Array;
  fin: boolean;
  rsv: number;
  opcode: number;
  masked: boolean;
  /** the 7-bit length field as sent: the length itself, or 126 / 127 */
  len7: number;
  length: number;
  /** bytes of extended length: 0, 2 or 8 */
  extBytes: number;
  key: Uint8Array | null;
  headerLen: number;
  /** the payload as sent (masked when the client sent it) and after unmasking */
  wire: Uint8Array;
  data: Uint8Array;
  fields: Field[];
};

export const hex2 = (n: number) => n.toString(16).padStart(2, "0");
export const hexBytes = (b: Uint8Array, sep = " ") => Array.from(b, hex2).join(sep);

export function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export const unmask = (wire: Uint8Array, key: Uint8Array | null) => (key ? wire.map((b, i) => b ^ key[i % 4]) : wire.slice());

export function parseFrame(bytes: Uint8Array): Frame {
  const b0 = bytes[0], b1 = bytes[1];
  const len7 = b1 & 0x7f;
  let length = len7, at = 2, extBytes = 0;
  if (len7 === 126) {
    length = (bytes[2] << 8) | bytes[3];
    extBytes = 2;
  } else if (len7 === 127) {
    length = 0;
    for (let i = 2; i < 10; i++) length = length * 256 + bytes[i];
    extBytes = 8;
  }
  at += extBytes;
  const masked = (b1 & 0x80) !== 0;
  const key = masked ? bytes.slice(at, at + 4) : null;
  if (masked) at += 4;
  const wire = bytes.slice(at, at + length);
  const f: Omit<Frame, "fields"> = {
    bytes, fin: (b0 & 0x80) !== 0, rsv: (b0 >> 4) & 7, opcode: b0 & 0x0f, masked, len7, length, extBytes,
    key, headerLen: at, wire, data: unmask(wire, key),
  };
  return { ...f, fields: fieldsOf(f) };
}

function fieldsOf(f: Omit<Frame, "fields">): Field[] {
  const out: Field[] = [
    { id: "fin", name: "FIN", bit: 0, bits: 1, value: f.fin ? "1" : "0" },
    { id: "rsv", name: "RSV1–3", bit: 1, bits: 3, value: f.rsv.toString(2).padStart(3, "0") },
    { id: "opcode", name: "OPCODE", bit: 4, bits: 4, value: `0x${f.opcode.toString(16)}` },
    { id: "mask", name: "MASK", bit: 8, bits: 1, value: f.masked ? "1" : "0" },
    { id: "len", name: "PAYLOAD LEN", bit: 9, bits: 7, value: String(f.len7) },
  ];
  let bit = 16;
  if (f.extBytes) {
    out.push({ id: "ext", name: `EXTENDED LEN (${f.extBytes * 8} BIT)`, bit, bits: f.extBytes * 8, value: String(f.length) });
    bit += f.extBytes * 8;
  }
  if (f.key) {
    out.push({ id: "key", name: "MASKING KEY", bit, bits: 32, value: hexBytes(f.key) });
    bit += 32;
  }
  out.push({ id: "payload", name: "PAYLOAD", bit, bits: f.length * 8, value: `${f.length} B` });
  return out;
}

export type BuildOptions = { fin: boolean; opcode: number; payload: Uint8Array; key: Uint8Array | null };

export function buildFrame({ fin, opcode, payload, key }: BuildOptions): Frame {
  const n = payload.length;
  const ext = n > 0xffff ? 8 : n > 125 ? 2 : 0;
  const out = new Uint8Array(2 + ext + (key ? 4 : 0) + n);
  out[0] = (fin ? 0x80 : 0) | opcode;
  out[1] = (key ? 0x80 : 0) | (ext === 8 ? 127 : ext === 2 ? 126 : n);
  let at = 2;
  if (ext === 2) {
    out[2] = n >> 8;
    out[3] = n & 0xff;
  } else if (ext === 8) {
    for (let i = 0; i < 8; i++) out[2 + i] = Math.floor(n / 256 ** (7 - i)) & 0xff;
  }
  at += ext;
  if (key) {
    out.set(key, at);
    at += 4;
  }
  out.set(key ? unmask(payload, key) : payload, at);
  return parseFrame(out);
}

const utf8 = new TextDecoder("utf-8", { fatal: false });
export const text = (b: Uint8Array) => utf8.decode(b);
export const encode = (s: string) => new TextEncoder().encode(s);

/** a close payload: a 2-byte status code, then a reason in UTF-8 */
export function closeOf(data: Uint8Array): { code: number; reason: string } | null {
  return data.length >= 2 ? { code: (data[0] << 8) | data[1], reason: text(data.slice(2)) } : null;
}

/** the payload in words: "Hello", 4 bytes 00 2a ff 10, 1000 "done" */
export function payloadText(f: Frame, max = 24): string {
  if (f.opcode === 8) {
    const c = closeOf(f.data);
    return c ? `${c.code} “${c.reason}”` : "no status";
  }
  if (f.length === 0) return "empty";
  if (f.opcode === 2) return hexBytes(f.data.slice(0, 8)) + (f.length > 8 ? " …" : "");
  const s = text(f.data);
  return `“${s.length > max ? s.slice(0, max) + "…" : s}”`;
}

export const CLOSE_CODES: [number, string, string][] = [
  [1000, "Normal closure", "The purpose of the connection is complete."],
  [1001, "Going away", "The server shuts down, or the browser leaves the page."],
  [1002, "Protocol error", "The endpoint received a frame that breaks RFC 6455."],
  [1003, "Unsupported data", "The endpoint cannot accept this type of data, for example binary."],
  [1005, "No status received", "The close frame had no status code. Never sent on the wire."],
  [1006, "Abnormal closure", "The connection closed with no close frame. Never sent on the wire."],
  [1007, "Invalid payload data", "A text message was not valid UTF-8."],
  [1008, "Policy violation", "The message breaks a policy of the endpoint."],
  [1009, "Message too big", "The message is larger than the endpoint accepts."],
  [1011, "Internal error", "The server found an unexpected condition."],
  [4000, "4000–4999", "Free for the application to define."],
];
