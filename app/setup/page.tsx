"use client";

import { useState } from "react";

export default function SetupPage() {
  const [form, setForm] = useState({
    businessName: "",
    email: "",
    heroImage: ""
  });

  async function handleContinue() {
    await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        config: {
          businessName: form.businessName,
          heroImage: form.heroImage
        }
      })
    });
  }

  return (
    <div className="max-w-xl mx-auto py-20">
      <h1 className="text-3xl font-bold">Set up your booking site</h1>

      <input
        placeholder="Business name"
        onChange={(e) => setForm({ ...form, businessName: e.target.value })}
      />

      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <button onClick={handleContinue}>
        Continue to payment
      </button>
    </div>
  );
}
