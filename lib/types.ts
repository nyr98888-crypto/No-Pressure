export type BetStatus = "pending_approval" | "locked" | "resolved";
export type BetWinner = "CREATOR" | "OPPONENT";

export type Bet = {
  id: string;
  challenge_text: string;
  stake_text: string;
  status: BetStatus;
  creator_name?: string | null;
  opponent_name?: string | null;
  winner?: BetWinner | null;
  paid_receipt?: boolean | number;
  created_at?: string;
  resolved_at?: string | null;
};

export type CreateBetPayload = {
  challenge_text: string;
  stake_text: string;
  status?: "pending_approval";
};
