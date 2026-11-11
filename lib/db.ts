import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const SCHEMA = `
CREATE TABLE IF NOT EXISTS bets (
  id TEXT PRIMARY KEY,
  challenge_text TEXT NOT NULL DEFAULT '',
  stake_text TEXT NOT NULL DEFAULT '',
  status TEXT DEFAULT 'pending_approval',
  creator_name TEXT DEFAULT 'Challenger',
  opponent_name TEXT,
  winner TEXT,
  paid_receipt BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);
`;

let schemaReady: Promise<void> | null = null;

async function migrateLegacyColumns() {
  const info = await db.execute("PRAGMA table_info(bets)");
  const cols = new Set(info.rows.map((row) => String(row.name)));

  if (cols.has("claim") && !cols.has("challenge_text")) {
    await db.execute("ALTER TABLE bets RENAME COLUMN claim TO challenge_text");
  }
  if (cols.has("stake") && !cols.has("stake_text")) {
    await db.execute("ALTER TABLE bets RENAME COLUMN stake TO stake_text");
  }
  if (!cols.has("challenge_text") && !cols.has("claim")) {
    await db.execute(
      "ALTER TABLE bets ADD COLUMN challenge_text TEXT NOT NULL DEFAULT ''"
    );
  }
  if (!cols.has("stake_text") && !cols.has("stake")) {
    await db.execute(
      "ALTER TABLE bets ADD COLUMN stake_text TEXT NOT NULL DEFAULT ''"
    );
  }

  await db.execute(
    `UPDATE bets SET status = 'pending_approval' WHERE status IN ('PENDING', 'pending')`
  );
  await db.execute(
    `UPDATE bets SET status = 'locked' WHERE status IN ('LOCKED', 'accepted')`
  );
  await db.execute(
    `UPDATE bets SET status = 'resolved' WHERE status IN ('RESOLVED', 'settled')`
  );
}

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.execute(SCHEMA);
      await migrateLegacyColumns();
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}
