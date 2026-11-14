import { NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/db";
import { unlockSessionPaid } from "@/lib/lemonUnlock";
import { isPaywallTestMode } from "@/lib/paywall";
import {
  SESSION_COOKIE,
  cookieOptions,
  ensurePublicSession,
  sealSessionPayload,
} from "@/lib/session";

/**
 * Test-mode unlock simulator — 403 unless PAYWALL_TEST_MODE=true.
 * Runs the same Turso unlock + VIP mint as a paid Lemon order.
 */
export async function POST() {
  if (!isPaywallTestMode()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { body, setCookie } = await ensurePublicSession();
    const db = getDb();
    await ensureSchema(db);

    const orderId = `sim_${Date.now()}_${body.sessionId.slice(0, 8)}`;
    const result = await unlockSessionPaid(db, {
      sessionId: body.sessionId,
      orderId,
    });

    const token = sealSessionPayload({
      sid: result.sessionId,
      unlocked: true,
      ts: Date.now(),
    });

    const res = NextResponse.json({
      ok: true,
      isUnlocked: true,
      sessionId: result.sessionId,
      vipCode: result.vipCode,
      orderId: result.orderId,
      duplicate: Boolean(result.duplicate),
    });
    res.cookies.set(SESSION_COOKIE, token, cookieOptions());
    // Prefer unlock token over ensure cookie
    if (setCookie) {
      /* already overwritten */
    }
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
