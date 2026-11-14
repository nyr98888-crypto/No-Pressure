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
);

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
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  hits TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dares_expires ON dares(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_vip_hash ON sessions(vip_code_hash);
