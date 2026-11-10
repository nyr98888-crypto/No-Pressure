import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";
import { nanoid } from "nanoid";

export async function GET(req: Request) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const result = await db.execute({
      sql: "SELECT * FROM bets WHERE id = ?",
      args: [id],
    });

    const bet = result.rows[0];
    if (!bet) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    return NextResponse.json(bet);
  } catch {
    return NextResponse.json({ error: "Failed to fetch bet" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const { creatorName, claim, stake } = await req.json();

    if (!creatorName || !claim || !stake) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const id = nanoid(6);
    await db.execute({
      sql: `INSERT INTO bets (id, creator_name, claim, stake, status) VALUES (?, ?, ?, ?, 'PENDING')`,
      args: [id, creatorName.trim(), claim.trim(), stake.trim()],
    });

    return NextResponse.json({ id, url: `/${id}` });
  } catch {
    return NextResponse.json({ error: "Failed to create bet" }, { status: 500 });
  }
}
