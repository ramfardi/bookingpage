"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  useEffect(() => {
    async function run() {
      if (!sessionId) return;

      const res = await fetch(
        `/api/stripe/session?session_id=${sessionId}`
      );

      if (!res.ok) return;

      const { subdomain } = await res.json();

      if (subdomain) {
        window.location.href = `https://${subdomain}.simplebookme.com`;
      }
    }

    run();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-medium">
        Payment successful 🎉 Redirecting to your website…
      </p>
    </div>
  );
}

