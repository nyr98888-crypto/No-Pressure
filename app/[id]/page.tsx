import CasinoBetScreen from "@/components/CasinoBetScreen";
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
  if (!bet) return { title: "Bet not found | BET YOU LOSE" };
  return {
    title: `BET YOU LOSE — ${bet.challenge_text}`,
    description: bet.challenge_text,
    openGraph: {
      title: "BET YOU LOSE: PAY UP",
      description: bet.challenge_text,
    },
  };
}

async function BetLoader({ params }: PageProps) {
  const { id } = await params;
  const bet = await getBet(id);
  if (!bet) return notFound();
  return <CasinoBetScreen bet={bet} />;
}

export default function BetPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
          <p className="font-black uppercase tracking-widest text-red-500">BET YOU LOSE</p>
        </main>
      }
    >
      <BetLoader params={params} />
    </Suspense>
  );
}
