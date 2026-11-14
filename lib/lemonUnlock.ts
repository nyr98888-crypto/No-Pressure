import "server-only";

import type { Client } from "@libsql/client";
import { nowSec } from "@/lib/db";
import {
  generateVipCode,
  hashVipCode,
  sealVipCode,
  unsealVipCode,
} from "@/lib/vip";

export type UnlockResult = {
  ok: true;
  vipCode: string;
  sessionId: string;
  orderId: string;
  duplicate?: boolean;
};

/**
 * Idempotent unlock: unique lemon_order_id, mint VIP code, mark session unlocked.
 */
export async function unlockSessionPaid(
  db: Client,
  opts: { sessionId: string; orderId: string }
): Promise<UnlockResult> {
  const orderId = String(opts.orderId);
  const sessionId = String(opts.sessionId).slice(0, 64);

  const existingOrder = await db.execute({
    sql: `SELECT id, vip_code_enc FROM sessions WHERE lemon_order_id = ? LIMIT 1`,
    args: [orderId],
  });
  if (existingOrder.rows[0]) {
    const row = existingOrder.rows[0] as Record<string, unknown>;
    const code =
      unsealVipCode(
        row.vip_code_enc == null ? null : String(row.vip_code_enc)
      ) || "";
    return {
      ok: true,
      duplicate: true,
      vipCode: code,
      sessionId: String(row.id),
      orderId,
    };
  }

  const vipCode = generateVipCode();
  const vipHash = hashVipCode(vipCode);
  const vipEnc = sealVipCode(vipCode);
  const now = nowSec();

  // Ensure session row exists
  const found = await db.execute({
    sql: `SELECT id FROM sessions WHERE id = ? LIMIT 1`,
    args: [sessionId],
  });

  if (found.rows[0]) {
    await db.execute({
      sql: `UPDATE sessions SET
        unlocked = 1,
        lemon_order_id = ?,
        vip_code_hash = ?,
        vip_code_enc = ?,
        updated_at = ?
      WHERE id = ?`,
      args: [orderId, vipHash, vipEnc, now, sessionId],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO sessions (
        id, lemon_order_id, vip_code_hash, vip_code_enc, unlocked, dare_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 1, 0, ?, ?)`,
      args: [sessionId, orderId, vipHash, vipEnc, now, now],
    });
  }

  return { ok: true, vipCode, sessionId, orderId };
}
