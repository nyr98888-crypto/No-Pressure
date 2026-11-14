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
);

CREATE INDEX IF NOT EXISTS idx_dares_expires ON dares(expires_at);
