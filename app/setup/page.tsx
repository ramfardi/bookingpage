"use client";

import { useEffect, useState } from "react";
import { templates } from "@/app/templates";
import type { CustomerConfig } from "@/app/lib/customerConfig";

/* ---------------- TYPES ---------------- */

type ServiceItem = {
  id: string;
  name: string;
  enabled: boolean;
  price?: string;
};

type Step = "basic" | "content" | "services" | "booking" | "review";

/* ---------------- ACCENT CLASSES (SAFE FOR TAILWIND) ---------------- */

const accentClass = {
  hairsalon: {
    text: "text-indigo-600",
    bg: "bg-indigo-600",
  },
  cleaning: {
    text: "text-emerald-600",
    bg: "bg-emerald-600",
  },
};

/* ---------------- COMPONENT ---------------- */

export default function SetupPage() {
  const [templateId, setTemplateId] =
    useState<"hairsalon" | "cleaning">("hairsalon");

  const template = templates[templateId];
  const accent = accentClass[templateId];

  const [step, setStep] = useState<Step>("basic");

  /* ---------------- BASIC ---------------- */

  const [form, setForm] = useState({
    businessName: "",
    email: "",
    subdomain: "",
  });

/* ---------------- CONTENT ---------------- */

	const [useDefaultHero, setUseDefaultHero] = useState(true);
	const [useDefaultAbout, setUseDefaultAbout] = useState(true);

	const [landing, setLanding] = useState(template.defaultData.landing);

	const [about, setAbout] = useState<{
	  title: string;
	  description: string;
	  highlights: string[];
	  gallery: string[];
	}>({
	  ...template.defaultData.about,
	  gallery: [],
	});


  /* ---------------- SERVICES ---------------- */

  const [services, setServices] = useState<ServiceItem[]>([]);

  /* ---------------- BOOKING ---------------- */

  const [booking, setBooking] = useState(template.defaultData.booking);
  const [deposit, setDeposit] = useState(template.defaultData.deposit);

  /* ---------------- RESET ON TEMPLATE CHANGE ---------------- */

  useEffect(() => {
    setLanding(template.defaultData.landing);
    setAbout({
  title: template.defaultData.about.title,
  description: template.defaultData.about.description,
  highlights: template.defaultData.about.highlights ?? [],
  gallery: [],
});


    setServices(
      template.defaultData.services.map((s: string) => ({
        id: crypto.randomUUID(),
        name: s,
        enabled: true,
      }))
    );

    setBooking(template.defaultData.booking);
    setDeposit(template.defaultData.deposit);
  }, [templateId]);

  /* ---------------- SUBMIT ---------------- */

  async function handleCreate() {
    const siteConfig: CustomerConfig = {
      siteId: crypto.randomUUID(),
      templateId,

      businessName: form.businessName,
      subdomain: form.subdomain.toLowerCase(),

      heroImage: template.defaultData.heroImage,

      landing,
      about,

      services: services
        .filter((s) => s.enabled)
        .map((s) => s.name),

      pricing: {
        title: "Pricing",
        rows: services
          .filter((s) => s.enabled && s.price)
          .map((s) => ({
            id: crypto.randomUUID(),
            name: s.name,
            price: s.price!,
          })),
      },

      booking,
      deposit,

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
    window.location.href = `/site/${siteId}`;
  }

  /* ---------------- UI HELPERS ---------------- */

  const steps: Step[] = ["basic", "content", "services", "booking", "review"];

  function StepIndicator() {
    return (
      <div className="flex justify-between mb-12 text-sm font-medium">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`flex-1 text-center ${
              step === s ? accent.text : "text-gray-400"
            }`}
          >
            {i + 1}. {s}
          </div>
        ))}
      </div>
    );
  }

  function nextStep() {
    setStep(steps[steps.indexOf(step) + 1]);
  }

  function prevStep() {
    setStep(steps[steps.indexOf(step) - 1]);
  }

  /* ---------------- RENDER ---------------- */

  return (
    <div className="max-w-2xl mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        Set up your booking site
      </h1>

      <StepIndicator />

      {/* BASIC */}
      {step === "basic" && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Basic information</h2>
          <p className="text-gray-500 text-sm">
            This information is used to create your website and receive bookings.
          </p>

          <select
            className="w-full border p-3 rounded-md"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value as any)}
          >
            <option value="hairsalon">Hair Salon</option>
            <option value="cleaning">Cleaning</option>
          </select>

          <input
            className="w-full border p-3 rounded-md"
            placeholder="Business name"
            value={form.businessName}
            onChange={(e) =>
              setForm({ ...form, businessName: e.target.value })
            }
          />

          <input
            className="w-full border p-3 rounded-md"
            placeholder="Booking email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <div>
            <input
              className="w-full border p-3 rounded-md"
              placeholder="yourbusiness"
              value={form.subdomain}
              onChange={(e) =>
                setForm({ ...form, subdomain: e.target.value })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Live at: {form.subdomain || "yourbusiness"}.simplebookme.com
            </p>
          </div>
        </section>
      )}

      {/* CONTENT */}
      {step === "content" && (
<section className="space-y-8">
  <h2 className="text-xl font-semibold">Hero & About</h2>
  <p className="text-sm text-gray-500">
    This content appears on your homepage and About page.
  </p>

  {/* ---------------- HERO ---------------- */}
  <div className="space-y-4">
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        className="w-5 h-5"
        checked={useDefaultHero}
        onChange={(e) => {
          setUseDefaultHero(e.target.checked);
          if (e.target.checked) {
            setLanding(template.defaultData.landing);
          }
        }}
      />
      Use default hero text
    </label>

    {Object.entries(landing).map(([key, value]) => (
      <input
        key={key}
        className="w-full border p-3 rounded-md"
        disabled={useDefaultHero}
        placeholder={key}
        value={value}
        onChange={(e) =>
          setLanding({ ...landing, [key]: e.target.value })
        }
      />
    ))}
  </div>

  {/* ---------------- ABOUT ---------------- */}
  <div className="space-y-4 pt-6 border-t">
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        className="w-5 h-5"
        checked={useDefaultAbout}
        onChange={(e) => {
          setUseDefaultAbout(e.target.checked);
          if (e.target.checked) {
            setAbout({
              ...template.defaultData.about,
              gallery: [],
            });
          }
        }}
      />
      Use default About content
    </label>

    <input
      className="w-full border p-3 rounded-md"
      placeholder="About title"
      disabled={useDefaultAbout}
      value={about.title}
      onChange={(e) =>
        setAbout({ ...about, title: e.target.value })
      }
    />

    <textarea
      className="w-full border p-3 rounded-md"
      rows={4}
      placeholder="About description"
      disabled={useDefaultAbout}
      value={about.description}
      onChange={(e) =>
        setAbout({ ...about, description: e.target.value })
      }
    />

    <textarea
      className="w-full border p-3 rounded-md"
      rows={3}
      placeholder={`Highlights (one per line)\nExample:\n10+ years experience\nCertified professionals`}
      disabled={useDefaultAbout}
      value={about.highlights.join("\n")}
      onChange={(e) =>
        setAbout({
          ...about,
          highlights: e.target.value
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        })
      }
    />
  </div>

  {/* ---------------- GALLERY ---------------- */}
	  <div className="space-y-4 pt-6 border-t">
		<h3 className="text-lg font-semibold">Sample work gallery</h3>
		<p className="text-sm text-gray-500">
		  Add image URLs showing your work. Uploads will be supported later.
		</p>

		{about.gallery.map((url, index) => (
		  <div key={index} className="flex gap-3">
			<input
			  className="flex-1 border p-3 rounded-md"
			  placeholder="https://image-url.jpg"
			  value={url}
			  onChange={(e) => {
				const updated = [...about.gallery];
				updated[index] = e.target.value;
				setAbout({ ...about, gallery: updated });
			  }}
			/>

			<button
			  type="button"
			  className="text-red-500"
			  onClick={() =>
				setAbout({
				  ...about,
				  gallery: about.gallery.filter((_, i) => i !== index),
				})
			  }
			>
			  Remove
			</button>
		  </div>
		))}

		<button
		  type="button"
		  className="text-indigo-600 font-medium"
		  onClick={() =>
			setAbout({
			  ...about,
			  gallery: [...about.gallery, ""],
			})
		  }
		>
		  + Add image
		</button>
	  </div>
	</section>

      )}

      {/* SERVICES */}
      {step === "services" && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Services & Pricing</h2>
          <p className="text-gray-500 text-sm">
            Select services you offer and enter prices.
          </p>

          {services.map((s) => (
            <div
              key={s.id}
              className="flex gap-3 items-center border p-3 rounded-md"
            >
              <input
                type="checkbox"
                checked={s.enabled}
                onChange={() =>
                  setServices((prev) =>
                    prev.map((x) =>
                      x.id === s.id ? { ...x, enabled: !x.enabled } : x
                    )
                  )
                }
              />

              <input
                className="flex-1 font-medium"
                value={s.name}
                onChange={(e) =>
                  setServices((prev) =>
                    prev.map((x) =>
                      x.id === s.id ? { ...x, name: e.target.value } : x
                    )
                  )
                }
              />

              {s.enabled && (
                <input
                  className="w-28 border p-2 rounded-md"
                  placeholder="Price"
                  value={s.price ?? ""}
                  onChange={(e) =>
                    setServices((prev) =>
                      prev.map((x) =>
                        x.id === s.id
                          ? { ...x, price: e.target.value }
                          : x
                      )
                    )
                  }
                />
              )}
            </div>
          ))}

          <button
            onClick={() =>
              setServices((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  name: "",
                  enabled: true,
                },
              ])
            }
            className={accent.text}
          >
            + Add service
          </button>
        </section>
      )}


{/* ---------------- STEP: BOOKING ---------------- */}
{step === "booking" && (
  <section className="space-y-6">
    <h2 className="text-xl font-semibold">Booking</h2>
    <p className="text-sm text-gray-500">
      Choose how clients book appointments.
    </p>

    {/* INTERNAL */}
    <label className="flex items-center gap-3">
      <input
        type="radio"
        name="booking"
        checked={booking.mode === "internal"}
        onChange={() =>
          setBooking({ mode: "internal" })
        }
      />
      <span>
        Built-in booking system (email-based)
      </span>
    </label>

    {/* EXTERNAL */}
    <label className="flex items-center gap-3">
      <input
        type="radio"
        name="booking"
        checked={booking.mode === "external"}
        onChange={() =>
          setBooking({
            mode: "external",
            externalBookingUrl: "",
          })
        }
      />
      <span>
        External booking link (Vagaro, Fresha, Calendly, etc.)
      </span>
    </label>

    {/* 👇 THIS IS THE KEY PART */}
    {booking.mode === "external" && (
      <div className="space-y-2">
        <input
          className="w-full border p-3 rounded-md"
          placeholder="https://your-booking-platform.com"
          value={booking.externalBookingUrl || ""}
          onChange={(e) =>
            setBooking({
              ...booking,
              externalBookingUrl: e.target.value,
            })
          }
        />
        <p className="text-xs text-gray-500">
          Clients will be redirected to this link when they click
          “Book appointment”.
        </p>
      </div>
    )}
  </section>
)}


      {/* REVIEW */}
      {step === "review" && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Review</h2>
          <p><strong>Business:</strong> {form.businessName}</p>
          <p><strong>Website:</strong> {form.subdomain}.simplebookme.com</p>
          <p><strong>Services:</strong> {services.filter(s => s.enabled).length}</p>
        </section>
      )}

      {/* NAV */}
      <div className="flex justify-between pt-10">
        {step !== "basic" && (
          <button onClick={prevStep} className="text-gray-600">
            ← Back
          </button>
        )}

        {step !== "review" ? (
          <button
            onClick={nextStep}
            className={`${accent.bg} text-white px-6 py-3 rounded-md`}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleCreate}
            className={`${accent.bg} text-white px-6 py-3 rounded-md`}
          >
            Create website
          </button>
        )}
      </div>
    </div>
  );
}
