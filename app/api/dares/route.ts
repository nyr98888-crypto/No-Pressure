import { NextResponse } from "next/server";
import { ensureSchema, getDb, nowSec, wipeExpired } from "@/lib/db";
import { makeCreatorToken, makeDareId } from "@/lib/id";
import { mediaKindForMode, validateMediaDataUrl } from "@/lib/mediaGuard";
import {
  LIMITS,
  assertSameOrigin,
  clientIp,
  rateLimit,
} from "@/lib/rateLimit";
import { FREE_DARE_LIMIT, isPaywallEnabled } from "@/lib/paywall";
import {
  assertClientChallengeOrAllow,
  ensurePublicSession,
} from "@/lib/session";
import { parseCreatePayload } from "@/lib/validateDare";

export async function GET(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`read:${ip}`, LIMITS.readPerMin, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  try {
    const db = getDb();
    await ensureSchema(db);
    await wipeExpired(db);
    const url = new URL(req.url);
    if (url.searchParams.get("live") === "1") {
      const now = nowSec();
      const result = await db.execute({
        sql: `SELECT COUNT(*) as c FROM dares WHERE expires_at > ? AND status != 'wiped'`,
        args: [now],
      });
      const count = Number(result.rows[0]?.c ?? 0);
      return NextResponse.json({ count });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }

  const ct = (req.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 415 }
    );
  }

  // PoW / X-NP-Client — fail-open when no challenge issued yet
  const challenge = assertClientChallengeOrAllow(req);
  if (!challenge.ok) {
    return NextResponse.json(
      { error: challenge.error },
      { status: challenge.status }
    );
  }

  const rl = rateLimit(
    `create:${ip}`,
    LIMITS.mutatePerWindow,
    LIMITS.mutateWindowMs
  );
  if (!rl.ok) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const raw = await req.text();
  if (raw.length > LIMITS.maxPayloadBytes) {
    return NextResponse.json({ error: "Payload Too Large" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body._hp) {
    return NextResponse.json({ error: "Rejected" }, { status: 400 });
  }

  const parsed = parseCreatePayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  if (parsed.media_data) {
    const check = validateMediaDataUrl(
      parsed.media_data,
      mediaKindForMode(parsed.mode)
    );
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
  }

  try {
    const db = getDb();
    await ensureSchema(db);
    await wipeExpired(db);

    // Atomic free-quota / level gate only when PAYWALL_ENABLED=true
    let sessionId: string | null = null;
    if (isPaywallEnabled()) {
      const { body: session } = await ensurePublicSession();
      sessionId = session.sessionId;
      if (!session.isUnlocked) {
        if (parsed.level >= 4) {
          return NextResponse.json(
            { error: "Unlock required for Inferno levels", code: "PAYWALL" },
            { status: 402 }
          );
        }
        if (session.dareCount >= FREE_DARE_LIMIT) {
          return NextResponse.json(
            { error: "Free dare limit reached", code: "PAYWALL" },
            { status: 402 }
          );
        }
      }
    }

    const id = makeDareId();
    const creatorToken = makeCreatorToken();
    const created_at = nowSec();
    const expires_at = created_at + 86400;

    await db.execute({
      sql: `INSERT INTO dares (
        id, sender_name, target_name, mode, dare_text, media_data,
        proof_mode, proof_data, level, level_label, forfeit, passes, status,
        created_at, expires_at, creator_token
      ) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, 0, 'open', ?, ?, ?)`,
      args: [
        id,
        parsed.sender_name,
        parsed.target_name,
        parsed.mode,
        parsed.dare_text,
        parsed.media_data,
        parsed.level,
        parsed.level_label,
        parsed.forfeit,
        created_at,
        expires_at,
        creatorToken,
      ],
    });

    if (sessionId) {
      await db.execute({
        sql: `UPDATE sessions SET dare_count = dare_count + 1, updated_at = ? WHERE id = ?`,
        args: [created_at, sessionId],
      });
    }

    return NextResponse.json({ id, expires_at, creatorToken });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
