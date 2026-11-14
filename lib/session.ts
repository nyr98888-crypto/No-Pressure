import "server-only";

import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { ensureSchema, getDb, nowSec } from "@/lib/db";
import {
  FREE_DARE_LIMIT,
  isPaywallEnabled,
  isPaywallTestMode,
  lemonCheckoutUrl,
  paywallDefaults,
} from "@/lib/paywall";
import { unsealVipCode } from "@/lib/vip";

export const SESSION_COOKIE = "np_session";

function sessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.TURSO_AUTH_TOKEN ||
    "np-dev-session-secret-change-me"
  );
}

function sign(value: string): string {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function sealSessionPayload(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

export function unsealSessionPayload(
  token: string | undefined | null
): Record<string, unknown> | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function newSessionId(): string {
  return randomBytes(16).toString("hex");
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}

export type PublicSession = {
  ok: true;
  paywallEnabled: boolean;
  testMode: boolean;
  isUnlocked: boolean;
  sessionId: string;
  vipCode: string | null;
  checkoutUrl: string;
  dareCount: number;
  freeDaresRemaining: number;
};

/** Ensure Turso session row + signed cookie; never throws to callers (returns defaults). */
export async function ensurePublicSession(): Promise<{
  body: PublicSession;
  setCookie?: string;
}> {
  const defaults = paywallDefaults();
  try {
    const db = getDb();
    await ensureSchema(db);

    const jar = await cookies();
    const raw = jar.get(SESSION_COOKIE)?.value;
    const data = unsealSessionPayload(raw);
    const sid =
      typeof data?.sid === "string" && data.sid.length >= 16
        ? String(data.sid)
        : newSessionId();

    const now = nowSec();
    const existing = await db.execute({
      sql: `SELECT id, unlocked, vip_code_enc, dare_count FROM sessions WHERE id = ? LIMIT 1`,
      args: [sid],
    });

    if (!existing.rows[0]) {
      await db.execute({
        sql: `INSERT INTO sessions (id, unlocked, dare_count, created_at, updated_at)
              VALUES (?, 0, 0, ?, ?)`,
        args: [sid, now, now],
      });
    }

    const row = (
      await db.execute({
        sql: `SELECT id, unlocked, vip_code_enc, dare_count FROM sessions WHERE id = ? LIMIT 1`,
        args: [sid],
      })
    ).rows[0] as Record<string, unknown> | undefined;

    const unlockedDb = Number(row?.unlocked ?? 0) === 1;
    const dareCount = Number(row?.dare_count ?? 0);
    const vipCode = unlockedDb
      ? unsealVipCode(
          row?.vip_code_enc == null ? null : String(row.vip_code_enc)
        )
      : null;

    const paywallEnabled = isPaywallEnabled();
    const isUnlocked = paywallEnabled ? unlockedDb : true;

    const token = sealSessionPayload({
      sid,
      unlocked: isUnlocked,
      ts: Date.now(),
    });

    return {
      body: {
        ok: true,
        paywallEnabled,
        testMode: isPaywallTestMode(),
        isUnlocked,
        sessionId: sid,
        vipCode: isUnlocked ? vipCode : null,
        checkoutUrl: lemonCheckoutUrl(),
        dareCount,
        freeDaresRemaining: Math.max(0, FREE_DARE_LIMIT - dareCount),
      },
      setCookie: token,
    };
  } catch {
    const sid = newSessionId();
    return {
      body: {
        ok: true,
        paywallEnabled: defaults.paywallEnabled,
        testMode: defaults.testMode,
        isUnlocked: defaults.isUnlocked,
        sessionId: sid,
        vipCode: null,
        checkoutUrl: lemonCheckoutUrl(),
        dareCount: 0,
        freeDaresRemaining: FREE_DARE_LIMIT,
      },
    };
  }
}

export async function readSessionState() {
  const { body } = await ensurePublicSession();
  return {
    paywallEnabled: body.paywallEnabled,
    isUnlocked: body.isUnlocked,
    sessionId: body.sessionId,
    vipCode: body.vipCode,
    dareCount: body.dareCount,
    session: { sid: body.sessionId, unlocked: body.isUnlocked },
  };
}

export function assertClientChallengeOrAllow(req: Request): {
  ok: true;
} | { ok: false; status: number; error: string } {
  if (!isPaywallEnabled()) return { ok: true };

  const challenge = req.headers.get("x-np-challenge");
  const client = req.headers.get("x-np-client");

  if (!challenge) return { ok: true };
  if (!client) return { ok: true };

  if (client.length < 8 || client.length > 128) {
    return { ok: false, status: 403, error: "Invalid client proof" };
  }
  return { ok: true };
}
