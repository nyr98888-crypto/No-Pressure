import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";

type PatchBody = {
  action?: "accept" | "resolve" | "mark_paid";
  opponentName?: string;
  winner?: "CREATOR" | "OPPONENT";
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const { id } = await params;
    const body = (await req.json()) as PatchBody;
    const { action, opponentName, winner } = body;

    const existing = await db.execute({
      sql: "SELECT * FROM bets WHERE id = ?",
      args: [id],
    });

    const bet = existing.rows[0] as unknown as
      | {
          status: string;
        }
      | undefined;

    if (!bet) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    if (action === "accept") {
      if (bet.status !== "PENDING") {
        return NextResponse.json({ error: "Bet already locked" }, { status: 400 });
      }
      if (!opponentName?.trim()) {
        return NextResponse.json({ error: "Opponent name required" }, { status: 400 });
      }

      await db.execute({
        sql: `UPDATE bets SET opponent_name = ?, status = 'LOCKED' WHERE id = ?`,
        args: [opponentName.trim(), id],
      });
    } else if (action === "resolve") {
      if (bet.status !== "LOCKED") {
        return NextResponse.json({ error: "Bet must be locked first" }, { status: 400 });
      }
      if (winner !== "CREATOR" && winner !== "OPPONENT") {
        return NextResponse.json({ error: "Invalid winner" }, { status: 400 });
      }

      await db.execute({
        sql: `UPDATE bets SET winner = ?, status = 'RESOLVED', resolved_at = CURRENT_TIMESTAMP WHERE id = ?`,
        args: [winner, id],
      });
    } else if (action === "mark_paid") {
      if (bet.status !== "RESOLVED") {
        return NextResponse.json({ error: "Bet must be resolved first" }, { status: 400 });
      }

      await db.execute({
        sql: `UPDATE bets SET paid_receipt = TRUE WHERE id = ?`,
        args: [id],
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await db.execute({
      sql: "SELECT * FROM bets WHERE id = ?",
      args: [id],
    });

    return NextResponse.json(updated.rows[0]);
  } catch {
    return NextResponse.json({ error: "Failed to update bet" }, { status: 500 });
  }
}
