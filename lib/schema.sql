CREATE TABLE IF NOT EXISTS bets (
  id TEXT PRIMARY KEY,               -- Short nano-id (e.g. 'k8s9x2')
  creator_name TEXT NOT NULL,
  claim TEXT NOT NULL,               -- "Dan won't finish the 10k run"
  stake TEXT NOT NULL,               -- "Dinner at Taizu"
  opponent_name TEXT,
  status TEXT DEFAULT 'PENDING',     -- 'PENDING' | 'LOCKED' | 'RESOLVED'
  winner TEXT,                       -- 'CREATOR' | 'OPPONENT'
  paid_receipt BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);
