import { Suspense } from "react";
import { HomeApp } from "@/components/HomeApp";

/**
 * Suspense boundary required by Next.js cacheComponents when the client tree
 * reads time (today key). Fallback is empty so we never stick on a loading screen.
 */
export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeApp />
    </Suspense>
  );
}
