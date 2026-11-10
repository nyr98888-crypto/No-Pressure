import BetActions from "@/components/BetActions";
import { db, ensureSchema } from "@/lib/db";
import type { Bet } from "@/lib/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getBet(id: string): Promise<Bet | null> {
  await ensureSchema();
  const result = await db.execute({
    sql: "SELECT * FROM bets WHERE id = ?",
    args: [id],
  });
  return (result.rows[0] as unknown as Bet | undefined) ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const bet = await getBet(id);

  if (!bet) {
    return { title: "Bet not found | BET YOU LOSE" };
  }

  return {
    title: `BET YOU LOSE — ${bet.claim}`,
    description: `${bet.creator_name} bets: ${bet.claim}. Stake: ${bet.stake}`,
    openGraph: {
      title: "BET YOU LOSE. PAY UP.",
      description: `"${bet.claim}" — Stake: ${bet.stake}`,
    },
  };
}

async function BetContent({ params }: PageProps) {
  const { id } = await params;
  const bet = await getBet(id);
  if (!bet) return notFound();

  return (
    <div className="w-full max-w-md border-2 border-red-600 bg-zinc-950 p-6 text-center shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
      <h1 className="text-3xl font-black uppercase text-red-500">BET YOU LOSE</h1>
      <p className="mb-6 text-sm font-bold tracking-widest text-yellow-400">PAY UP.</p>

      <div className="mb-6 space-y-2 border border-zinc-800 bg-zinc-900 p-4 text-left">
        <p className="text-xs uppercase tracking-wider text-zinc-500">Challenger</p>
        <p className="text-lg font-bold text-white">{bet.creator_name}</p>

        <p className="mt-4 text-xs uppercase tracking-wider text-zinc-500">The Challenge</p>
        <p className="text-xl font-extrabold text-red-400">&quot;{bet.claim}&quot;</p>

        <p className="mt-4 text-xs uppercase tracking-wider text-zinc-500">Stakes</p>
        <p className="text-lg font-bold text-yellow-400">{bet.stake}</p>
      </div>

      <BetActions bet={bet} />
    </div>
  );
}

function BetFallback() {
  return (
    <div className="w-full max-w-md border-2 border-red-600 bg-zinc-950 p-6 text-center shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
      <h1 className="text-3xl font-black uppercase text-red-500">BET YOU LOSE</h1>
      <p className="mb-6 text-sm font-bold tracking-widest text-yellow-400">PAY UP.</p>
      <p className="text-sm uppercase tracking-wider text-zinc-500">Loading challenge...</p>
    </div>
  );
}

export default function BetPage({ params }: PageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12 font-mono text-white">
      <Suspense fallback={<BetFallback />}>
        <BetContent params={params} />
      </Suspense>
    </main>
  );
}
