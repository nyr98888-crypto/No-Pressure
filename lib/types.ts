export type BetStatus = "PENDING" | "LOCKED" | "RESOLVED";
export type BetWinner = "CREATOR" | "OPPONENT";

export type Bet = {
  id: string;
  creator_name: string;
  claim: string;
  stake: string;
  opponent_name: string | null;
  status: BetStatus;
  winner: BetWinner | null;
  paid_receipt: boolean | number;
  created_at: string;
  resolved_at: string | null;
};
