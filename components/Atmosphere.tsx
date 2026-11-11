import type { ReactNode } from "react";

export default function Atmosphere({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div
        aria-hidden
        className="ambient-glow pointer-events-none absolute left-1/2 top-[32%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(159,18,57,0.45)_0%,rgba(127,29,29,0.18)_40%,transparent_70%)] blur-2xl"
      />
      <div aria-hidden className="dot-matrix pointer-events-none absolute inset-0" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-full max-w-[420px] rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),_0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-7 ${className}`}
    >
      {children}
    </div>
  );
}

export function BrandHeader() {
  return (
    <header className="mb-8 text-center">
      <h1 className="bg-gradient-to-b from-white via-white to-red-400 bg-clip-text text-4xl font-black tracking-tighter text-transparent drop-shadow-[0_0_28px_rgba(244,63,94,0.35)] sm:text-[2.75rem]">
        BET YOU LOSE
      </h1>
      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span className="text-[11px] font-semibold tracking-[0.22em] text-amber-300">
          PAY UP.
        </span>
      </div>
    </header>
  );
}
