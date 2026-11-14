import { HomeApp } from "@/components/HomeApp";

/**
 * Render HomeApp immediately — do NOT gate the shell behind Suspense.
 * A stuck Suspense fallback ("Loading No Pressure…") is what users saw when
 * hydration was blocked; the client UI must mount on first paint.
 */
export default function HomePage() {
  return <HomeApp />;
}
