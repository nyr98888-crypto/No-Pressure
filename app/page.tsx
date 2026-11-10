"use client";

import { useState } from "react";

export default function Home() {
  const [creatorName, setCreatorName] = useState("");
  const [claim, setClaim] = useState("");
  const [stake, setStake] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorName, claim, stake }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create bet");
        return;
      }

      if (data.id) {
        setLink(`${window.location.origin}/${data.id}`);
      }
    } catch {
      setError("Failed to create bet");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12 font-mono text-white">
      <div className="w-full max-w-md border-2 border-red-600 bg-zinc-950 p-6 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tight text-red-500">
            BET YOU LOSE
          </h1>
          <p className="text-lg font-bold tracking-widest text-yellow-400">PAY UP.</p>
        </header>

        {!link ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">
                Your Name
              </label>
              <input
                required
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Nir"
                className="w-full border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">
                The Bet / Prediction
              </label>
              <input
                required
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                placeholder="Won't wake up before 7am for a week"
                className="w-full border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">
                The Stakes
              </label>
              <input
                required
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                placeholder="Dinner / 6-pack / $20"
                className="w-full border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 py-4 text-lg font-black uppercase tracking-wider text-black transition-transform hover:bg-red-700 active:translate-y-1 disabled:opacity-50"
            >
              {loading ? "Locking It In..." : "Generate Bet Link"}
            </button>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-sm text-zinc-400">Bet created. Drop this into WhatsApp:</p>
            <input
              readOnly
              value={link}
              className="w-full border border-zinc-700 bg-zinc-900 p-3 text-center font-bold text-yellow-400"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="w-full bg-yellow-400 py-3 font-black uppercase tracking-wider text-black hover:bg-yellow-500"
            >
              {copied ? "Copied!" : "Copy Link to Chat"}
            </button>
            <a
              href={link}
              className="block text-xs text-zinc-400 underline hover:text-white"
            >
              Open bet page
            </a>
            <button
              type="button"
              onClick={() => {
                setLink("");
                setCopied(false);
              }}
              className="mx-auto block text-xs text-zinc-500 underline"
            >
              Create another bet
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
