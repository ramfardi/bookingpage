"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import HomePage from "@/components/HomePage";
import type { CustomerConfig } from "@/app/lib/customerConfig";

export default function SitePage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const pathname = usePathname();
  const isEditor = pathname.startsWith("/site/");

  const [siteId, setSiteId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerConfig | null>(null);
  const [saving, setSaving] = useState(false);

  /* ---------------- RESOLVE PARAMS ---------------- */
  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setSiteId(resolved.siteId);
    }
    resolveParams();
  }, [params]);

  /* ---------------- LOAD SITE DATA ---------------- */
  useEffect(() => {
    if (!siteId) return;

    async function load() {
      const res = await fetch(`/api/site/${siteId}`);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      }
    }

    load();
  }, [siteId]);

  if (!customer) {
    return <div className="p-10">Loading editor…</div>;
  }

  /* ---------------- SAVE ---------------- */
  async function saveChanges() {
    if (!siteId) return;

    setSaving(true);
    await fetch(`/api/site/${siteId}`, {
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

          {/* -------- HERO -------- */}
          <section className="mb-8">
            <h3 className="font-medium mb-3">Hero</h3>

            <input
              className="w-full border rounded-md p-2 mb-2"
              placeholder="Main headline"
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

            <input
              className="w-full border rounded-md p-2 mb-2"
              placeholder="Second headline"
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

            <input
              className="w-full border rounded-md p-2 mb-2"
              placeholder="Subheader line 1"
              value={customer.landing.subheader1}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  landing: {
                    ...customer.landing,
                    subheader1: e.target.value,
                  },
                })
              }
            />

            <input
              className="w-full border rounded-md p-2"
              placeholder="Subheader line 2"
              value={customer.landing.subheader2}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  landing: {
                    ...customer.landing,
                    subheader2: e.target.value,
                  },
                })
              }
            />
          </section>

          {/* -------- SERVICES -------- */}
          <section className="mb-8">
            <h3 className="font-medium mb-3">Services</h3>

            {customer.services.map((service, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  className="flex-1 border rounded-md p-2"
                  value={service}
                  onChange={(e) => {
                    const services = [...customer.services];
                    services[index] = e.target.value;
                    setCustomer({ ...customer, services });
                  }}
                />
                <button
                  className="text-red-500"
                  onClick={() =>
                    setCustomer({
                      ...customer,
                      services: customer.services.filter(
                        (_, i) => i !== index
                      ),
                    })
                  }
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              className="text-sm text-indigo-600"
              onClick={() =>
                setCustomer({
                  ...customer,
                  services: [...customer.services, "New service"],
                })
              }
            >
              + Add service
            </button>
          </section>

          {/* -------- ABOUT -------- */}
          <section className="mb-8">
            <h3 className="font-medium mb-3">About</h3>

            <input
              className="w-full border rounded-md p-2 mb-2"
              placeholder="About title"
              value={customer.about.title}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  about: {
                    ...customer.about,
                    title: e.target.value,
                  },
                })
              }
            />

            <textarea
              className="w-full border rounded-md p-2 mb-2"
              rows={4}
              placeholder="About description"
              value={customer.about.description}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  about: {
                    ...customer.about,
                    description: e.target.value,
                  },
                })
              }
            />
          </section>

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
