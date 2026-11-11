import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";
import { nanoid } from "nanoid";

export async function GET(req: Request) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const check = searchParams.get("check");

    if (check === "1" || check === "true") {
      await db.execute("SELECT 1");
      return NextResponse.json({ ok: true, connected: true });
    }

    if (id) {
      const result = await db.execute({
        sql: "SELECT * FROM bets WHERE id = ?",
        args: [id],
      });

      const bet = result.rows[0];
      if (!bet) {
        return NextResponse.json({ error: "Bet not found" }, { status: 404 });
      }

      return NextResponse.json(bet);
    }

    const result = await db.execute({
      sql: "SELECT * FROM bets ORDER BY created_at DESC LIMIT 20",
    });

    return NextResponse.json({ bets: result.rows });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch bets", connected: false },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const body = await req.json();

    const challenge_text = String(
      body.challenge_text ?? body.claim ?? ""
    ).trim();
    const stake_text = String(body.stake_text ?? body.stake ?? "").trim();

    if (!challenge_text || !stake_text) {
      return NextResponse.json(
        { error: "challenge_text and stake_text are required" },
        { status: 400 }
      );
    }

    const id = nanoid(6);
    const status = "pending_approval";

    await db.execute({
      sql: `INSERT INTO bets (id, challenge_text, stake_text, status, creator_name)
            VALUES (?, ?, ?, ?, ?)`,
      args: [id, challenge_text, stake_text, status, "Challenger"],
    });

    return NextResponse.json({
      id,
      url: `/${id}`,
      challenge_text,
      stake_text,
      status,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create bet" }, { status: 500 });
  }
}
