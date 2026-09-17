import type { CfgData, GenerateOptions } from "./types";

interface SharePayload {
  v: 1;
  d: CfgData;
  o?: Partial<GenerateOptions>;
}

function toB64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function gzip(text: string): Promise<Uint8Array | null> {
  if (typeof CompressionStream === "undefined") return null;
  const cs = new CompressionStream("gzip");
  const writer = cs.writable.getWriter();
  writer.write(new TextEncoder().encode(text));
  writer.close();
  const buf = await new Response(cs.readable).arrayBuffer();
  return new Uint8Array(buf);
}
async function gunzip(bytes: Uint8Array): Promise<string> {
  const ds = new DecompressionStream("gzip");
  const writer = ds.writable.getWriter();
  writer.write(bytes as BufferSource);
  writer.close();
  return new Response(ds.readable).text();
}

export async function encodeShare(data: CfgData, options: GenerateOptions): Promise<string> {
  const payload: SharePayload = { v: 1, d: data, o: options };
  const json = JSON.stringify(payload);
  const gz = await gzip(json);
  if (gz) return "g" + toB64Url(gz);
  return "j" + toB64Url(new TextEncoder().encode(json));
}

export async function decodeShare(hash: string): Promise<SharePayload | null> {
  try {
    const s = hash.replace(/^#/, "").replace(/^cfg=/, "");
    if (!s) return null;
    const mode = s[0];
    const bytes = fromB64Url(s.slice(1));
    const json = mode === "g" ? await gunzip(bytes) : new TextDecoder().decode(bytes);
    const p = JSON.parse(json) as SharePayload;
    if (!p || p.v !== 1 || !p.d) return null;
    return p;
  } catch {
    return null;
  }
}
