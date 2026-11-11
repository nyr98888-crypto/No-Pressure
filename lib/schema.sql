CREATE TABLE IF NOT EXISTS bets (
  id TEXT PRIMARY KEY,
  challenge_text TEXT NOT NULL,
  stake_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending_approval', -- pending_approval | locked | resolved
  creator_name TEXT DEFAULT 'Challenger',
  opponent_name TEXT,
  winner TEXT,
  paid_receipt BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);
