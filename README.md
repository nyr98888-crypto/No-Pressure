# No Pressure

Clean Next.js (App Router) PWA for social dares. Counters, streaks, squad standings, and juice stay **100% local**. Turso stores temporary `/d/[id]` share links that **self-wipe after 24 hours**. No payments.

## Setup

1. Copy `.env.example` → `.env` and set:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
2. `npm install`
3. `npm run db:init` (creates the `dares` table)
4. `npm run dev`

## Stack

- Next.js App Router + Tailwind CSS
- Obsidian glass UI (`#070A12` / `#0D1220`) + OneTap-style glossy 3D pills
- Web Audio synth + haptics (`useJuice`)
- Turso (`@libsql/client`) for ephemeral dare links only
