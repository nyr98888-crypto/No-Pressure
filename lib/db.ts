import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const SCHEMA = `
CREATE TABLE IF NOT EXISTS bets (
  id TEXT PRIMARY KEY,
  creator_name TEXT NOT NULL,
  claim TEXT NOT NULL,
  stake TEXT NOT NULL,
  opponent_name TEXT,
  status TEXT DEFAULT 'PENDING',
  winner TEXT,
  paid_receipt BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);
`;

let schemaReady: Promise<void> | null = null;

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = db
      .execute(SCHEMA)
      .then(() => undefined)
      .catch((error) => {
        schemaReady = null;
        throw error;
      });
  }
  return schemaReady;
}
