"use client";

import { useState } from "react";
import { templates } from "@/app/templates";
import type { CustomerConfig } from "@/app/lib/customerConfig";

export default function SetupPage() {
  const [templateId, setTemplateId] =
    useState<"hairsalon" | "cleaning">("hairsalon");

  const [form, setForm] = useState({
    businessName: "",
    email: "",
    subdomain: "",
  });

  async function handleContinue() {
    const template = templates[templateId];

    const siteConfig: CustomerConfig = {
      siteId: crypto.randomUUID(),
      templateId,
      ...template.defaultData,
      businessName: form.businessName,

      subdomain: form.subdomain.toLowerCase(), // 👈 store subdomain

      email: {
        bookingNotifications: form.email,
        replyTo: form.email,
      },
      trial: {
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        isPaid: false,
      },
    };

    const res = await fetch("/api/create-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteConfig),
    });

    const { siteId } = await res.json();

    // 👇 preview stays siteId-based
    window.location.href = `/site/${siteId}`;
  }

  return (
    <div className="max-w-xl mx-auto py-20 space-y-4">
      <h1 className="text-3xl font-bold">Set up your booking site</h1>

      <select
        className="w-full border p-2"
        value={templateId}
        onChange={(e) =>
          setTemplateId(e.target.value as "hairsalon" | "cleaning")
        }
      >
        <option value="hairsalon">Hair Salon</option>
        <option value="cleaning">Cleaning</option>
      </select>

      <input
        className="w-full border p-2"
        placeholder="Business name"
        onChange={(e) =>
          setForm({ ...form, businessName: e.target.value })
        }
      />

      <input
        className="w-full border p-2"
        placeholder="Email"
        type="email"
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <div>
        <input
          className="w-full border p-2"
          placeholder="yourbusiness"
          onChange={(e) =>
            setForm({ ...form, subdomain: e.target.value })
          }
        />
        <p className="text-sm text-gray-500 mt-1">
          Your site will be live at:{" "}
          <b>{form.subdomain || "yourbusiness"}.simplebookme.com</b>
        </p>
      </div>

      <button
        className="w-full bg-black text-white py-3"
        onClick={handleContinue}
      >
        Create website
      </button>
    </div>
  );
}
