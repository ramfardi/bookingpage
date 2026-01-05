"use client";

import { useState } from "react";
import { templates } from "@/app/templates";
import type { CustomerConfig } from "@/app/lib/customerConfig";

type PricingRow = {
  id: string;
  name: string;
  price: string;
  includes?: string;
};

export default function SetupPage() {
  const [templateId, setTemplateId] =
    useState<"hairsalon" | "cleaning">("hairsalon");

  const [form, setForm] = useState({
    businessName: "",
    email: "",
    subdomain: "",
  });

  const [landing, setLanding] = useState({
    header1: "",
    header2: "",
    subheader1: "",
    subheader2: "",
  });

  const [about, setAbout] = useState({
    title: "",
    description: "",
    highlights: [""],
  });

  const [services, setServices] = useState<string[]>([""]);

  const [pricing, setPricing] = useState<{
    title: string;
    subtitle: string;
    rows: PricingRow[];
  }>({
    title: "Our Services & Pricing",
    subtitle: "",
    rows: [
      {
        id: crypto.randomUUID(),
        name: "",
        price: "",
        includes: "",
      },
    ],
  });

  async function handleContinue() {
    const template = templates[templateId];

    const siteConfig: CustomerConfig = {
      siteId: crypto.randomUUID(),
      templateId,
      ...template.defaultData,

      businessName: form.businessName,
      subdomain: form.subdomain.toLowerCase(),

      landing: {
        ...template.defaultData.landing,
        ...landing,
      },

      about: {
        ...template.defaultData.about,
        ...about,
        highlights: about.highlights.filter(Boolean),
      },

      services: services.filter(Boolean),

      pricing: {
        title: pricing.title,
        subtitle: pricing.subtitle,
        rows: pricing.rows.filter(
          (r) => r.name.trim() && r.price.trim()
        ),
      },

      email: {
        bookingNotifications: form.email,
        replyTo: form.email,
      },

      trial: {
        expiresAt: new Date(
          Date.now() + 60 * 60 * 1000
        ).toISOString(),
        isPaid: false,
      },
    };

    const res = await fetch("/api/create-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteConfig),
    });

    const { siteId } = await res.json();
    window.location.href = `/site/${siteId}`;
  }

  return (
    <div className="max-w-2xl mx-auto py-20 px-4 space-y-14">
      <h1 className="text-3xl font-bold text-center">
        Set up your booking site
      </h1>

      {/* BASIC INFO */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic information</h2>

        <p className="text-sm text-gray-500">
          Choose your business type and provide basic details used across your website
          and booking emails.
        </p>

        <select
          className="w-full border p-2"
          value={templateId}
          onChange={(e) =>
            setTemplateId(e.target.value as any)
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
        <p className="text-sm text-gray-500">
          This name appears on your website and in booking communications with clients.
        </p>

        <input
          className="w-full border p-2"
          placeholder="Email"
          type="email"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />
        <p className="text-sm text-gray-500">
          This email is used to receive booking notifications and communicate with clients.
        </p>

        <input
          className="w-full border p-2"
          placeholder="yourbusiness"
          onChange={(e) =>
            setForm({ ...form, subdomain: e.target.value })
          }
        />
        <p className="text-sm text-gray-500">
          This will be your website address:
          <br />
          <b>{form.subdomain || "yourbusiness"}.simplebookme.com</b>
        </p>
      </section>

      {/* HERO / LANDING */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Hero section</h2>
        <p className="text-sm text-gray-500">
          This text appears at the top of your website and is the first thing visitors see.
        </p>

        <input
          className="w-full border p-2"
          placeholder="Main headline (first line)"
          onChange={(e) =>
            setLanding({ ...landing, header1: e.target.value })
          }
        />
        <input
          className="w-full border p-2"
          placeholder="Main headline (highlighted word)"
          onChange={(e) =>
            setLanding({ ...landing, header2: e.target.value })
          }
        />
        <input
          className="w-full border p-2"
          placeholder="Short description"
          onChange={(e) =>
            setLanding({ ...landing, subheader1: e.target.value })
          }
        />
        <input
          className="w-full border p-2"
          placeholder="Supporting sentence"
          onChange={(e) =>
            setLanding({ ...landing, subheader2: e.target.value })
          }
        />
      </section>

      {/* ABOUT */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">About</h2>
        <p className="text-sm text-gray-500">
          This content is shown on your “About” page and helps clients learn more
          about your business.
        </p>

        <input
          className="w-full border p-2"
          placeholder="About title"
          onChange={(e) =>
            setAbout({ ...about, title: e.target.value })
          }
        />

        <textarea
          className="w-full border p-2"
          placeholder="Brief description about your business"
          rows={3}
          onChange={(e) =>
            setAbout({ ...about, description: e.target.value })
          }
        />

        <p className="text-sm text-gray-500">
          Add short bullet points that highlight your experience, quality, or specialties.
        </p>

        {about.highlights.map((h, i) => (
          <input
            key={i}
            className="w-full border p-2"
            placeholder="Highlight"
            onChange={(e) => {
              const copy = [...about.highlights];
              copy[i] = e.target.value;
              setAbout({ ...about, highlights: copy });
            }}
          />
        ))}

        <button
          className="text-indigo-600 text-sm"
          onClick={() =>
            setAbout({
              ...about,
              highlights: [...about.highlights, ""],
            })
          }
        >
          + Add highlight
        </button>
      </section>

      {/* SERVICES */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Services</h2>
        <p className="text-sm text-gray-500">
          Add the services you offer. These will appear on your website and can
          be used for pricing and booking.
        </p>

        {services.map((s, i) => (
          <input
            key={i}
            className="w-full border p-2"
            placeholder="Service name"
            onChange={(e) => {
              const copy = [...services];
              copy[i] = e.target.value;
              setServices(copy);
            }}
          />
        ))}

        <button
          className="text-indigo-600 text-sm"
          onClick={() => setServices([...services, ""])}
        >
          + Add service
        </button>
      </section>

      {/* PRICING */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pricing</h2>
        <p className="text-sm text-gray-500">
          Add prices for your services. Each row represents one service and its price.
          Enter services in the order you want them to appear on your pricing page.
        </p>

        <input
          className="w-full border p-2"
          placeholder="Pricing section title"
          value={pricing.title}
          onChange={(e) =>
            setPricing({ ...pricing, title: e.target.value })
          }
        />

        <input
          className="w-full border p-2"
          placeholder="Subtitle (optional)"
          value={pricing.subtitle}
          onChange={(e) =>
            setPricing({ ...pricing, subtitle: e.target.value })
          }
        />

        {pricing.rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-2"
          >
            <input
              className="border p-2"
              placeholder="Service"
              onChange={(e) =>
                setPricing({
                  ...pricing,
                  rows: pricing.rows.map((r) =>
                    r.id === row.id
                      ? { ...r, name: e.target.value }
                      : r
                  ),
                })
              }
            />
            <input
              className="border p-2"
              placeholder="Price"
              onChange={(e) =>
                setPricing({
                  ...pricing,
                  rows: pricing.rows.map((r) =>
                    r.id === row.id
                      ? { ...r, price: e.target.value }
                      : r
                  ),
                })
              }
            />
            <input
              className="border p-2 md:col-span-2"
              placeholder="What's included (optional)"
              onChange={(e) =>
                setPricing({
                  ...pricing,
                  rows: pricing.rows.map((r) =>
                    r.id === row.id
                      ? { ...r, includes: e.target.value }
                      : r
                  ),
                })
              }
            />
          </div>
        ))}

        <button
          className="text-indigo-600 text-sm"
          onClick={() =>
            setPricing({
              ...pricing,
              rows: [
                ...pricing.rows,
                {
                  id: crypto.randomUUID(),
                  name: "",
                  price: "",
                  includes: "",
                },
              ],
            })
          }
        >
          + Add pricing row
        </button>
      </section>

      <p className="text-sm text-gray-500 text-center">
        Don’t worry — you can edit all of this later.
      </p>

      <button
        className="w-full bg-black text-white py-4 text-lg font-semibold"
        onClick={handleContinue}
      >
        Create website
      </button>
    </div>
  );
}
