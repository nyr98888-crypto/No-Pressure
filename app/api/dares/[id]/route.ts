import { NextResponse } from "next/server";
import { ensureSchema, getDb, wipeExpired } from "@/lib/db";
import {
  LIMITS,
  assertSameOrigin,
  clientIp,
  rateLimit,
} from "@/lib/rateLimit";
import type { DareMode, DareRecord, DareStatus, HeatLevel } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

function rowToDare(row: Record<string, unknown>): DareRecord {
  return {
    id: String(row.id),
    sender_name: String(row.sender_name),
    target_name: row.target_name == null ? null : String(row.target_name),
    mode: String(row.mode) as DareMode,
    dare_text: row.dare_text == null ? null : String(row.dare_text),
    media_data: row.media_data == null ? null : String(row.media_data),
    proof_mode: row.proof_mode == null ? null : (String(row.proof_mode) as DareMode),
    proof_data: row.proof_data == null ? null : String(row.proof_data),
    level: Number(row.level) as HeatLevel,
    level_label: String(row.level_label),
    forfeit: row.forfeit == null ? null : String(row.forfeit),
    passes: Number(row.passes ?? 0),
    status: String(row.status) as DareStatus,
    created_at: Number(row.created_at),
    expires_at: Number(row.expires_at),
  };
}

async function loadDare(id: string) {
  const db = getDb();
  await ensureSchema(db);
  await wipeExpired(db);
  const now = Math.floor(Date.now() / 1000);
  const result = await db.execute({
    sql: `SELECT * FROM dares WHERE id = ? LIMIT 1`,
    args: [id],
  });
  const row = result.rows[0] as Record<string, unknown> | undefined;
  if (!row) return { kind: "missing" as const };
  if (Number(row.expires_at) <= now || String(row.status) === "wiped") {
    return { kind: "gone" as const };
  }
  return { kind: "ok" as const, dare: rowToDare(row) };
}

export async function GET(req: Request, ctx: Ctx) {
  const ip = clientIp(req);
  const rl = rateLimit(`read:${ip}`, LIMITS.readPerMin, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const { id } = await ctx.params;
  try {
    const loaded = await loadDare(id);
    if (loaded.kind === "missing") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (loaded.kind === "gone") {
      return NextResponse.json({ error: "Gone" }, { status: 410 });
    }
    return NextResponse.json(loaded.dare);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const ip = clientIp(req);
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }
  const rl = rateLimit(`update:${ip}`, LIMITS.updatePerHour, 60 * 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many updates" }, { status: 429 });
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

  const { id } = await ctx.params;
  const action = String(body.action || "");

  try {
    const loaded = await loadDare(id);
    if (loaded.kind === "missing") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (loaded.kind === "gone") {
      return NextResponse.json({ error: "Gone" }, { status: 410 });
    }

    const db = getDb();
    const dare = loaded.dare;

    if (action === "lock") {
      await db.execute({
        sql: `UPDATE dares SET status = 'locked' WHERE id = ?`,
        args: [id],
      });
    } else if (action === "chicken") {
      const nextLevel = Math.min(5, dare.level + 1) as HeatLevel;
      await db.execute({
        sql: `UPDATE dares SET passes = passes + 1, level = ?, status = 'open' WHERE id = ?`,
        args: [nextLevel, id],
      });
    } else if (action === "proof") {
      const proof_mode = String(body.proof_mode || "") as DareMode;
      const proof_data = String(body.proof_data || "");
      if (!["photo", "video", "voice"].includes(proof_mode) || !proof_data) {
        return NextResponse.json({ error: "Proof required" }, { status: 400 });
      }
      if (proof_data.length > LIMITS.maxPayloadBytes) {
        return NextResponse.json({ error: "Proof too large" }, { status: 413 });
      }
      await db.execute({
        sql: `UPDATE dares SET proof_mode = ?, proof_data = ?, status = 'proved' WHERE id = ?`,
        args: [proof_mode, proof_data, id],
      });
    } else if (action === "certify") {
      await db.execute({
        sql: `UPDATE dares SET status = 'certified' WHERE id = ?`,
        args: [id],
      });
    } else if (action === "cap") {
      await db.execute({
        sql: `UPDATE dares SET status = 'capped', proof_mode = NULL, proof_data = NULL WHERE id = ?`,
        args: [id],
      });
    } else if (action === "wipe") {
      await db.execute({
        sql: `DELETE FROM dares WHERE id = ?`,
        args: [id],
      });
      return NextResponse.json({ ok: true, wiped: true });
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const refreshed = await loadDare(id);
    if (refreshed.kind !== "ok") {
      return NextResponse.json({ error: "Gone" }, { status: 410 });
    }
    return NextResponse.json(refreshed.dare);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
