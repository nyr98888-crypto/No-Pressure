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
      expires_at INTEGER NOT NULL
    )
  `);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_dares_expires ON dares(expires_at)`
  );
}

export async function wipeExpired(db: Client = getDb()) {
  const now = Math.floor(Date.now() / 1000);
  await db.execute({
    sql: `DELETE FROM dares WHERE expires_at <= ?`,
    args: [now],
  });
}
