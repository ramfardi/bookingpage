import { Suspense } from "react";
import type { Metadata } from "next";
import SuccessClient from "./success-client";

// Stripe return page: never index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SuccessClient />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-medium">
        Finalizing payment…
      </p>
    </div>
  );
}
