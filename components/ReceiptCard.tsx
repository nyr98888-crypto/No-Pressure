"use client";

import type { Bet } from "@/lib/types";

type ReceiptCardProps = {
  bet: Bet;
};

export default function ReceiptCard({ bet }: ReceiptCardProps) {
  const winnerName =
    bet.winner === "CREATOR" ? bet.creator_name || "Winner" : bet.opponent_name || "Opponent";
  const loserName =
    bet.winner === "CREATOR" ? bet.opponent_name || "Opponent" : bet.creator_name || "Challenger";

  function handlePrint() {
    window.print();
  }

  async function handleDownload() {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 16;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 48px monospace";
    ctx.fillText("BET YOU LOSE", 60, 100);

    ctx.fillStyle = "#eab308";
    ctx.font = "bold 36px monospace";
    ctx.fillText("OFFICIAL RECEIPT", 60, 160);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "24px monospace";
    ctx.fillText("CLAIM", 60, 260);
    ctx.fillStyle = "#f4f4f5";
    ctx.font = "bold 32px monospace";
    wrapText(ctx, `"${bet.challenge_text}"`, 60, 310, 680, 40);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "24px monospace";
    ctx.fillText("STAKE", 60, 460);
    ctx.fillStyle = "#eab308";
    ctx.font = "bold 36px monospace";
    ctx.fillText(bet.stake_text, 60, 510);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "24px monospace";
    ctx.fillText("WINNER", 60, 600);
    ctx.fillStyle = "#22c55e";
    ctx.font = "bold 40px monospace";
    ctx.fillText(winnerName || "Winner", 60, 655);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "24px monospace";
    ctx.fillText("OWES", 60, 740);
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 40px monospace";
    ctx.fillText(loserName || "Loser", 60, 795);

    ctx.fillStyle = "#71717a";
    ctx.font = "20px monospace";
    ctx.fillText(`Receipt #${bet.id}`, 60, 920);
    ctx.fillText("PAY UP.", 60, 955);

    const link = document.createElement("a");
    link.download = `bet-you-lose-${bet.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="space-y-4 print:space-y-0">
      <div
        id="receipt"
        className="border-2 border-red-600 bg-zinc-950 p-5 text-left shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-2xl font-black uppercase tracking-tight text-red-500">
              Bet You Lose
            </p>
            <p className="font-bold tracking-widest text-yellow-400">OFFICIAL RECEIPT</p>
          </div>
          <p className="text-xs text-zinc-500">#{bet.id}</p>
        </div>

        <div className="space-y-3 border-y border-dashed border-zinc-700 py-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">Claim</p>
            <p className="text-lg font-extrabold text-zinc-100">&quot;{bet.challenge_text}&quot;</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">Stake</p>
            <p className="text-lg font-bold text-yellow-400">{bet.stake_text}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">Winner</p>
              <p className="text-base font-black text-green-400">{winnerName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">Pays Up</p>
              <p className="text-base font-black text-red-400">{loserName}</p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
          Pay Up.
        </p>
      </div>

      <div className="flex gap-2 print:hidden">
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 bg-yellow-400 py-3 font-black uppercase tracking-wider text-black hover:bg-yellow-500"
        >
          Download Receipt
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 border border-zinc-700 bg-zinc-900 py-3 font-black uppercase tracking-wider text-white hover:border-red-500"
        >
          Print
        </button>
      </div>
    </div>
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}
