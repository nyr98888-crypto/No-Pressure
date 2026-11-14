import { Suspense } from "react";
import { DareView } from "@/components/DareView";

async function DarePageInner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DareView initialId={id} />;
}

export default function DarePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg p-8 text-center text-sm text-[#9aa3b8]">
          Loading dare…
        </div>
      }
    >
      <DarePageInner params={params} />
    </Suspense>
  );
}
