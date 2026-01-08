"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import HomePage from "@/components/HomePage";
import type { CustomerConfig } from "@/app/lib/customerConfig";

export default function SitePage({
  params,
}: {
  params: { siteId: string };
}) {
  const pathname = usePathname();
  const isEditor = pathname.startsWith("/site/");

  const [customer, setCustomer] = useState<CustomerConfig | null>(null);
  const [saving, setSaving] = useState(false);

  /* ---------------- LOAD SITE DATA ---------------- */
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/site/${params.siteId}`);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      }
    }
    load();
  }, [params.siteId]);

  if (!customer) {
    return <div className="p-10">Loading editor…</div>;
  }

  /* ---------------- SAVE ---------------- */
  async function saveChanges() {
    setSaving(true);
    await fetch(`/api/site/${params.siteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
    });
    setSaving(false);
  }

  return (
    <div className="flex h-screen">
      {/* ================= LEFT: EDITOR ================= */}
      {isEditor && (
        <aside className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-6">
            Edit your website
          </h2>

          {/* HERO EDIT */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Main headline
            </label>
            <input
              className="w-full border rounded-md p-2"
              value={customer.landing.header1}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  landing: {
                    ...customer.landing,
                    header1: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Second headline
            </label>
            <input
              className="w-full border rounded-md p-2"
              value={customer.landing.header2}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  landing: {
                    ...customer.landing,
                    header2: e.target.value,
                  },
                })
              }
            />
          </div>

          <button
            onClick={saveChanges}
            disabled={saving}
            className="w-full bg-indigo-600 text-white py-2 rounded-md font-medium disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </aside>
      )}

      {/* ================= RIGHT: LIVE PREVIEW ================= */}
      <main className="flex-1 overflow-y-auto">
        <HomePage activeCustomer={customer} />
      </main>
    </div>
  );
}
