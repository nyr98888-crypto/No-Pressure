import { Suspense } from "react";
import { HomeApp } from "@/components/HomeApp";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg p-8 text-center text-sm text-[#9aa3b8]">
          Loading No Pressure…
        </div>
      }
    >
      <HomeApp />
    </Suspense>
  );
}
