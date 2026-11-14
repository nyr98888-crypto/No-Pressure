import { NextResponse } from "next/server";
import { containsBlockedTerms } from "@/lib/blocklist";
import { ensureSchema, getDb, wipeExpired } from "@/lib/db";
import { makeDareId } from "@/lib/id";
import {
  LIMITS,
  assertSameOrigin,
  clientIp,
  rateLimit,
} from "@/lib/rateLimit";
import type { DareMode, HeatLevel } from "@/lib/types";

export async function GET(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`read:${ip}`, LIMITS.readPerMin, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  try {
    const db = getDb();
    await ensureSchema(db);
    await wipeExpired(db);
    const url = new URL(req.url);
    if (url.searchParams.get("live") === "1") {
      const now = Math.floor(Date.now() / 1000);
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
  const rl = rateLimit(`create:${ip}`, LIMITS.createPerHour, 60 * 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many creates" }, { status: 429 });
  }

  const raw = await req.text();
  if (raw.length > LIMITS.maxPayloadBytes) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
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

  const sender_name = String(body.sender_name || "").trim().slice(0, 40);
  const target_name = body.target_name
    ? String(body.target_name).trim().slice(0, 40)
    : null;
  const mode = String(body.mode || "") as DareMode;
  const dare_text = body.dare_text ? String(body.dare_text).slice(0, 500) : null;
  const media_data = body.media_data ? String(body.media_data) : null;
  const level = Number(body.level) as HeatLevel;
  const level_label = String(body.level_label || `Level ${level}`).slice(0, 40);
  const forfeit = body.forfeit ? String(body.forfeit).slice(0, 200) : null;

  if (!sender_name) {
    return NextResponse.json({ error: "Sender required" }, { status: 400 });
  }
  if (!["video", "photo", "voice", "text"].includes(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }
  if (![1, 2, 3, 4, 5].includes(level)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }
  if (dare_text && containsBlockedTerms(dare_text)) {
    return NextResponse.json({ error: "Blocked content" }, { status: 400 });
  }
  if (forfeit && containsBlockedTerms(forfeit)) {
    return NextResponse.json({ error: "Blocked content" }, { status: 400 });
  }
  if (mode === "text" && !dare_text) {
    return NextResponse.json({ error: "Dare text required" }, { status: 400 });
  }
  if (mode !== "text" && !media_data) {
    return NextResponse.json({ error: "Media required" }, { status: 400 });
  }
  if (media_data && media_data.length > LIMITS.maxPayloadBytes) {
    return NextResponse.json({ error: "Media too large" }, { status: 413 });
  }

  try {
    const db = getDb();
    await ensureSchema(db);
    await wipeExpired(db);

    const id = makeDareId();
    const created_at = Math.floor(Date.now() / 1000);
    const expires_at = created_at + 86400;

    await db.execute({
      sql: `INSERT INTO dares (
        id, sender_name, target_name, mode, dare_text, media_data,
        proof_mode, proof_data, level, level_label, forfeit, passes, status, created_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, 0, 'open', ?, ?)`,
      args: [
        id,
        sender_name,
        target_name,
        mode,
        dare_text,
        media_data,
        level,
        level_label,
        forfeit,
        created_at,
        expires_at,
      ],
    });

    return NextResponse.json({ id, expires_at });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
