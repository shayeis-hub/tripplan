import { createHmac, timingSafeEqual } from "crypto";

// Signed, opaque tokens for e-mail links (click tracking, unsubscribe) and a
// keyed hash of an address. Neither the token nor the hash contains a uid or an
// e-mail address. Everything is derived from EMAIL_TOKEN_SECRET (server only);
// without it nothing is signed and nothing is sent.

export class EmailConfigError extends Error {}

const secret = (): string => {
  const s = process.env.EMAIL_TOKEN_SECRET;
  if (!s || s.length < 32) throw new EmailConfigError("EMAIL_TOKEN_SECRET is missing or shorter than 32 characters");
  return s;
};

const b64u = (b: Buffer) => b.toString("base64url");
const mac = (purpose: string, data: string) => createHmac("sha256", secret()).update(`${purpose}:${data}`).digest();

export const normalizeEmail = (e: string) => e.trim().toLowerCase();

// Stable pseudonym for an address (suppression key). Keyed, so it cannot be
// reversed or matched against a list of known addresses without the secret.
export const emailHash = (email: string): string => mac("email", normalizeEmail(email)).toString("hex");

export type TokenPayload =
  | { k: "c"; ev: string } // click: the email event
  | { k: "u"; h: string; ev: string; l: string }; // unsubscribe: address hash, event, language

export function signToken(p: TokenPayload): string {
  const body = b64u(Buffer.from(JSON.stringify(p)));
  return `${body}.${b64u(mac("token", body))}`;
}

export function verifyToken(t: unknown): TokenPayload | null {
  if (typeof t !== "string" || t.length > 600) return null;
  const [body, sig] = t.split(".");
  if (!body || !sig) return null;
  try {
    const expected = mac("token", body);
    const given = Buffer.from(sig, "base64url");
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (p?.k === "c" && typeof p.ev === "string") return p;
    if (p?.k === "u" && typeof p.h === "string" && typeof p.ev === "string" && typeof p.l === "string") return p;
    return null;
  } catch {
    return null;
  }
}

// Deterministic 0-99 bucket of a user for one flow, for a holdout group.
export function bucketOf(uid: string, flow: string): number {
  const d = mac("bucket", `${flow}:${uid}`);
  return d.readUInt32BE(0) % 100;
}
