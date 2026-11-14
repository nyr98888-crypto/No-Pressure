import "server-only";

import { createHash, randomBytes, createHmac } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Format: NP-XXXX-XXXX-XXXX (12 random chars). */
export function generateVipCode(): string {
  const bytes = randomBytes(12);
  let raw = "";
  for (let i = 0; i < 12; i++) {
    raw += ALPHABET[bytes[i]! % ALPHABET.length]!;
  }
  return `NP-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

export function normalizeVipCode(input: string): string {
  const cleaned = input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  // Accept NP + 12 chars or bare 12 chars
  const body = cleaned.startsWith("NP") ? cleaned.slice(2) : cleaned;
  if (body.length !== 12) return "";
  return `NP-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`;
}

export function hashVipCode(code: string): string {
  const normalized = normalizeVipCode(code);
  return createHash("sha256").update(normalized).digest("hex");
}

function vipSealKey(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.TURSO_AUTH_TOKEN ||
    "np-dev-vip-seal"
  );
}

/** Reversible seal so the owning session can display the recovery code. */
export function sealVipCode(code: string): string {
  const body = Buffer.from(code, "utf8").toString("base64url");
  const sig = createHmac("sha256", vipSealKey()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function unsealVipCode(sealed: string | null | undefined): string | null {
  if (!sealed || !sealed.includes(".")) return null;
  const [body, sig] = sealed.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", vipSealKey())
    .update(body)
    .digest("base64url");
  if (sig.length !== expected.length) return null;
  // timing-safe-ish compare
  let mismatch = 0;
  for (let i = 0; i < sig.length; i++) {
    mismatch |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) return null;
  try {
    return Buffer.from(body, "base64url").toString("utf8");
  } catch {
    return null;
  }
}
