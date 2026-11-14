import { NextResponse } from "next/server";
import { ensureSchema, getDb, nowSec } from "@/lib/db";
import { isPaywallEnabled, paywallDefaults } from "@/lib/paywall";
import {
  SESSION_COOKIE,
  cookieOptions,
  sealSessionPayload,
} from "@/lib/session";
import { hashVipCode, normalizeVipCode, unsealVipCode } from "@/lib/vip";

const attempts = new Map<string, { n: number; until: number }>();

export async function POST(req: Request) {
  const defaults = paywallDefaults();

  // When paywall is off, restore is a no-op success
  if (!isPaywallEnabled()) {
    return NextResponse.json({
      ok: true,
      ...defaults,
      vipCode: null,
      message: "Paywall disabled",
    });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const bucket = attempts.get(ip) ?? { n: 0, until: 0 };
  if (bucket.until > Date.now()) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  let body: { code?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = normalizeVipCode(String(body.code || ""));
  if (!code) {
    bucket.n += 1;
    if (bucket.n >= 5) {
      bucket.until = Date.now() + 15 * 60_000;
      bucket.n = 0;
    }
    attempts.set(ip, bucket);
    return NextResponse.json({ error: "Invalid VIP code" }, { status: 400 });
  }

  try {
    const db = getDb();
    await ensureSchema(db);
    const vipHash = hashVipCode(code);
    const found = await db.execute({
      sql: `SELECT id, vip_code_enc, unlocked FROM sessions WHERE vip_code_hash = ? LIMIT 1`,
      args: [vipHash],
    });
    const row = found.rows[0] as Record<string, unknown> | undefined;
    if (!row) {
      bucket.n += 1;
      if (bucket.n >= 5) {
        bucket.until = Date.now() + 15 * 60_000;
        bucket.n = 0;
      }
      attempts.set(ip, bucket);
      return NextResponse.json({ error: "Invalid VIP code" }, { status: 404 });
    }

    attempts.delete(ip);
    const sid = String(row.id);
    const now = nowSec();
    await db.execute({
      sql: `UPDATE sessions SET unlocked = 1, updated_at = ? WHERE id = ?`,
      args: [now, sid],
    });

    const vipCode =
      unsealVipCode(
        row.vip_code_enc == null ? null : String(row.vip_code_enc)
      ) || code;

    const token = sealSessionPayload({
      sid,
      unlocked: true,
      ts: Date.now(),
    });

    const res = NextResponse.json({
      ok: true,
      paywallEnabled: true,
      isUnlocked: true,
      sessionId: sid,
      vipCode,
    });
    res.cookies.set(SESSION_COOKIE, token, cookieOptions());
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
