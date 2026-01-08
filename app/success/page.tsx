import { Suspense } from "react";
import SuccessClient from "./success-client";

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
