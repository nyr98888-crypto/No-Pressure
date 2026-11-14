import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/db";
import { unlockSessionPaid } from "@/lib/lemonUnlock";
import { lemonWebhookSecret } from "@/lib/paywall";

function verifySignature(raw: string, signature: string | null): boolean {
  const secret = lemonWebhookSecret();
  if (!secret || !signature) return false;
  const digest = createHmac("sha256", secret).update(raw).digest("hex");
  try {
    const a = Buffer.from(digest);
    const b = Buffer.from(signature.trim());
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Tamper-proof Lemon Squeezy webhook.
 * Verifies X-Signature (HMAC-SHA256) over the raw body.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature =
    req.headers.get("x-signature") || req.headers.get("X-Signature");

  if (!verifySignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    meta?: {
      event_name?: string;
      custom_data?: { session_id?: string };
    };
    data?: {
      id?: string | number;
      attributes?: { status?: string };
    };
  };

  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = payload.meta?.event_name || "";
  const status = payload.data?.attributes?.status || "";

  if (eventName !== "order_created" || status !== "paid") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const sessionId = String(payload.meta?.custom_data?.session_id || "").trim();
  const orderId = String(payload.data?.id || "").trim();

  if (!sessionId || !orderId) {
    return NextResponse.json(
      { error: "Missing session_id or order id" },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    await ensureSchema(db);
    const result = await unlockSessionPaid(db, { sessionId, orderId });
    return NextResponse.json({
      ok: true,
      duplicate: Boolean(result.duplicate),
      sessionId: result.sessionId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    if (/UNIQUE/i.test(message)) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
