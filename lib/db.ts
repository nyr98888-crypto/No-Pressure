import "server-only";

import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

export function getDb(): Client {
  if (client) return client;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  }
  client = createClient({ url, authToken });
  return client;
}

async function tryAlter(db: Client, sql: string) {
  try {
    await db.execute(sql);
  } catch {
    /* column already exists or unsupported — never fail boot */
  }
}

export async function ensureSchema(db: Client = getDb()) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS dares (
      id TEXT PRIMARY KEY,
      sender_name TEXT NOT NULL,
      target_name TEXT,
      mode TEXT NOT NULL,
      dare_text TEXT,
      media_data TEXT,
      proof_mode TEXT,
      proof_data TEXT,
      level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 5),
      level_label TEXT NOT NULL,
      forfeit TEXT,
      passes INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      creator_token TEXT,
      device_hash TEXT,
      reports INTEGER NOT NULL DEFAULT 0
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      device_hash TEXT,
      vip_code_hash TEXT,
      vip_code_enc TEXT,
      lemon_order_id TEXT UNIQUE,
      unlocked INTEGER NOT NULL DEFAULT 0,
      dare_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      hits TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_dares_expires ON dares(expires_at)`
  );
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_sessions_vip_hash ON sessions(vip_code_hash)`
  );

  await tryAlter(db, `ALTER TABLE dares ADD COLUMN creator_token TEXT`);
  await tryAlter(db, `ALTER TABLE dares ADD COLUMN device_hash TEXT`);
  await tryAlter(db, `ALTER TABLE dares ADD COLUMN reports INTEGER NOT NULL DEFAULT 0`);
  await tryAlter(db, `ALTER TABLE sessions ADD COLUMN device_hash TEXT`);
  await tryAlter(db, `ALTER TABLE sessions ADD COLUMN vip_code_hash TEXT`);
  await tryAlter(db, `ALTER TABLE sessions ADD COLUMN vip_code_enc TEXT`);
  await tryAlter(db, `ALTER TABLE sessions ADD COLUMN lemon_order_id TEXT`);
  await tryAlter(db, `ALTER TABLE sessions ADD COLUMN unlocked INTEGER NOT NULL DEFAULT 0`);
  await tryAlter(db, `ALTER TABLE sessions ADD COLUMN dare_count INTEGER NOT NULL DEFAULT 0`);
}

export async function wipeExpired(db: Client = getDb()) {
  const now = Math.floor(Date.now() / 1000);
  await db.execute({
    sql: `DELETE FROM dares WHERE expires_at <= ?`,
    args: [now],
  });
}

export function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}
