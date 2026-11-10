import { ImageResponse } from "next/og";
import { db, ensureSchema } from "@/lib/db";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await ensureSchema();
  const { id } = await params;
  const result = await db.execute({
    sql: "SELECT * FROM bets WHERE id = ?",
    args: [id],
  });

  const bet = result.rows[0] as unknown as
    | { claim?: string; stake?: string }
    | undefined;
  const claim = bet?.claim || "I bet you lose.";
  const stake = bet?.stake || "Bragging rights";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
          padding: "60px",
          justifyContent: "space-between",
          border: "12px solid #ef4444",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "36px",
              fontWeight: 900,
              color: "#ef4444",
              letterSpacing: "2px",
            }}
          >
            BET YOU LOSE.
          </span>
          <span style={{ fontSize: "28px", fontWeight: 800, color: "#eab308" }}>
            PAY UP.
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", margin: "40px 0" }}>
          <span
            style={{
              fontSize: "24px",
              color: "#a1a1aa",
              textTransform: "uppercase",
            }}
          >
            The Claim
          </span>
          <span
            style={{
              fontSize: "54px",
              fontWeight: 800,
              lineHeight: 1.1,
              color: "#f4f4f5",
            }}
          >
            &quot;{claim}&quot;
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "2px solid #27272a",
            paddingTop: "24px",
          }}
        >
          <span style={{ fontSize: "32px", color: "#ffffff" }}>
            Stake: <strong style={{ color: "#ef4444" }}>{stake}</strong>
          </span>
          <span style={{ fontSize: "24px", color: "#71717a" }}>
            Tap to Accept Challenge
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
