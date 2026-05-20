"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import HomePage from "@/components/HomePage";
import type { CustomerConfig, ScheduleDay } from "@/app/lib/customerConfig";

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

  /* ---------------- NORMALIZE PRICING ---------------- */
  const normalizedItems =
    customer?.pricing?.items?.length
      ? customer.pricing.items
      : customer?.pricing?.rows?.length
      ? customer.pricing.rows.map((row: any) => ({
          label: row?.name || "",
          description: row?.includes || "",
          price: row?.price || "",
        }))
      : customer?.services?.length
      ? customer.services.map((service: string) => ({
          label: service,
          description: "",
          price: "",
        }))
      : [];

  /* ---------------- ENSURE ITEMS EXIST ---------------- */
  useEffect(() => {
    if (!customer) return;

    if (customer.pricing?.items?.length) return;

    if (normalizedItems.length === 0) return;

    setCustomer((prev) => ({
      ...prev!,
      pricing: {
        ...prev!.pricing,
        items: normalizedItems,
      },
    }));
  }, [customer]);

  if (!customer) {
    return <div className="p-10">Loading editor…</div>;
  }

  /* ---------------- SAVE ---------------- */
async function saveChanges() {
  if (!siteId || !customer) return;

  setSaving(true);

  const cleanedItems = normalizedItems.filter(
    (item: any) => item.label?.trim()
  );

  const updatedCustomer = {
    ...customer,

    services: cleanedItems.map((item: any) => item.label),

    pricing: {
      ...customer.pricing,
      title: customer.pricing?.title || "Pricing",

      items: cleanedItems.map((item: any) => ({
        label: item.label,
        description: item.description || "",
        price: item.price || "",
      })),

      rows: cleanedItems.map((item: any) => ({
        id: crypto.randomUUID(),
        name: item.label,
        price: item.price || "",
        includes: item.description || "",
      })),
    },
  };

  const res = await fetch(`/api/site/${siteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: updatedCustomer,
    }),
  });

  setSaving(false);

  if (!res.ok) {
    const text = await res.text();
    console.error("Save failed:", text);
    alert("Save failed. Please try again.");
    return;
  }

  setCustomer(updatedCustomer);
  alert("Changes saved");
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

          {/* -------- SERVICES & PRICING -------- */}
          <section className="mb-8">
            <h3 className="font-medium mb-3">Services & Pricing</h3>

            {normalizedItems.map((item: any, index: number) => (
              <div
                key={index}
                className="border rounded-md p-3 mb-3 space-y-2"
              >
                {/* Service name */}
                <input
                  className="w-full border rounded-md p-2"
                  placeholder="Service name"
                  value={item.label ?? ""}
                  onChange={(e) => {
                    const items = [...normalizedItems];
                    items[index] = {
                      ...items[index],
                      label: e.target.value,
                    };

                    setCustomer({
                      ...customer,
                      pricing: {
                        ...customer.pricing,
                        items,
                      },
                    });
                  }}
                />

                {/* Description */}
                <textarea
                  className="w-full border rounded-md p-2 text-sm"
                  rows={2}
                  placeholder="Service description"
                  value={item.description ?? ""}
                  onChange={(e) => {
                    const items = [...normalizedItems];
                    items[index] = {
                      ...items[index],
                      description: e.target.value,
                    };

                    setCustomer({
                      ...customer,
                      pricing: {
                        ...customer.pricing,
                        items,
                      },
                    });
                  }}
                />

                {/* Price + Remove */}
                <div className="flex gap-2 items-center">
                  <input
                    className="flex-1 border rounded-md p-2"
                    placeholder="Price (e.g. $50)"
                    value={item.price ?? ""}
                    onChange={(e) => {
                      const items = [...normalizedItems];
                      items[index] = {
                        ...items[index],
                        price: e.target.value,
                      };

                      setCustomer({
                        ...customer,
                        pricing: {
                          ...customer.pricing,
                          items,
                        },
                      });
                    }}
                  />

                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700 px-2"
                    onClick={() => {
                      if (!confirm("Remove this service?")) return;

                      const items = [...normalizedItems];
                      items.splice(index, 1);

                      setCustomer({
                        ...customer,
                        pricing: {
                          ...customer.pricing,
                          items,
                        },
                      });
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="text-sm text-indigo-600 font-medium"
              onClick={() =>
                setCustomer({
                  ...customer,
                  pricing: {
                    ...customer.pricing,
                    items: [
                      ...normalizedItems,
                      {
                        label: "New service",
                        description: "",
                        price: "",
                      },
                    ],
                  },
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
			
			<div className="mt-4 space-y-3">
  <h4 className="text-sm font-medium text-gray-700">
    Bullet points
  </h4>

  {(customer.about.highlights || []).map((highlight, index) => (
    <div key={index} className="flex gap-2">
      <input
        className="flex-1 border rounded-md p-2 text-sm"
        placeholder="Example: 10+ years experience"
        value={highlight}
        onChange={(e) => {
          const updated = [...(customer.about.highlights || [])];
          updated[index] = e.target.value;

          setCustomer({
            ...customer,
            about: {
              ...customer.about,
              highlights: updated,
            },
          });
        }}
      />

      <button
        type="button"
        className="text-red-600 px-2"
        onClick={() => {
          setCustomer({
            ...customer,
            about: {
              ...customer.about,
              highlights: (customer.about.highlights || []).filter(
                (_, i) => i !== index
              ),
            },
          });
        }}
      >
        ✕
      </button>
    </div>
  ))}

  <button
    type="button"
    className="text-sm text-indigo-600 font-medium"
    onClick={() => {
      setCustomer({
        ...customer,
        about: {
          ...customer.about,
          highlights: [
            ...(customer.about.highlights || []),
            "",
          ],
        },
      });
    }}
  >
    + Add bullet point
  </button>
</div>
			
			
          </section>
		  
		  
		  <section className="mb-8">
  <h3 className="font-medium mb-3">Gallery</h3>

  {(customer.about.gallery || []).map((url, index) => (
    <div key={index} className="flex gap-2 mb-2">
      <input
        className="flex-1 border rounded-md p-2"
        placeholder="Google Drive image link"
        value={url}
        onChange={(e) => {
          const updated = [...(customer.about.gallery || [])];
          updated[index] = e.target.value;

          setCustomer({
            ...customer,
            about: {
              ...customer.about,
              gallery: updated,
            },
          });
        }}
      />

      <button
        type="button"
        className="text-red-600 px-2"
        onClick={() => {
          setCustomer({
            ...customer,
            about: {
              ...customer.about,
              gallery: (customer.about.gallery || []).filter(
                (_, i) => i !== index
              ),
            },
          });
        }}
      >
        ✕
      </button>
    </div>
  ))}

  <button
    type="button"
    className="text-indigo-600 text-sm font-medium"
    onClick={() => {
      setCustomer({
        ...customer,
        about: {
          ...customer.about,
          gallery: [
            ...(customer.about.gallery || []),
            "",
          ],
        },
      });
    }}
  >
    + Add image
  </button>
</section>


{/* Testimonials */}
<section className="mb-8">
  <h3 className="font-medium mb-3">Testimonials</h3>

  <label className="flex items-center gap-2 mb-4">
    <input
      type="checkbox"
      checked={customer.testimonials?.enabled ?? false}
      onChange={(e) =>
        setCustomer({
          ...customer,
          testimonials: {
            enabled: e.target.checked,
            googleReviewLink:
              customer.testimonials?.googleReviewLink || "",
            reviews:
              customer.testimonials?.reviews || [
                { name: "", text: "" },
                { name: "", text: "" },
                { name: "", text: "" },
              ],
          },
        })
      }
    />
    Enable testimonials section
  </label>

  <div className="mb-6">
    <label className="block text-sm text-gray-600 mb-1">
      Google review link
    </label>

    <input
      className="w-full border rounded-md p-2"
      placeholder="https://g.page/r/..."
      value={customer.testimonials?.googleReviewLink || ""}
      onChange={(e) =>
        setCustomer({
          ...customer,
          testimonials: {
            enabled:
              customer.testimonials?.enabled ?? true,
            googleReviewLink: e.target.value,
            reviews:
              customer.testimonials?.reviews || [],
          },
        })
      }
    />
  </div>

  {[0, 1, 2].map((index) => {
    const review =
      customer.testimonials?.reviews?.[index] || {
        name: "",
        text: "",
      };

    return (
      <div
        key={index}
        className="border rounded-xl p-4 mb-4 bg-white"
      >
        <div className="font-medium text-sm mb-3">
          Review #{index + 1}
        </div>

        <input
          className="w-full border rounded-md p-2 mb-3"
          placeholder="Customer name"
          value={review.name}
          onChange={(e) => {
            const updated = [
              ...(customer.testimonials?.reviews || [
                { name: "", text: "" },
                { name: "", text: "" },
                { name: "", text: "" },
              ]),
            ];

            updated[index] = {
              ...updated[index],
              name: e.target.value,
            };

            setCustomer({
              ...customer,
              testimonials: {
                enabled:
                  customer.testimonials?.enabled ?? true,
                googleReviewLink:
                  customer.testimonials?.googleReviewLink ||
                  "",
                reviews: updated,
              },
            });
          }}
        />

        <textarea
          className="w-full border rounded-md p-2 text-sm"
          rows={4}
          placeholder="Customer review"
          value={review.text}
          onChange={(e) => {
            const updated = [
              ...(customer.testimonials?.reviews || [
                { name: "", text: "" },
                { name: "", text: "" },
                { name: "", text: "" },
              ]),
            ];

            updated[index] = {
              ...updated[index],
              text: e.target.value,
            };

            setCustomer({
              ...customer,
              testimonials: {
                enabled:
                  customer.testimonials?.enabled ?? true,
                googleReviewLink:
                  customer.testimonials?.googleReviewLink ||
                  "",
                reviews: updated,
              },
            });
          }}
        />

        <button
          type="button"
          className="mt-3 text-sm text-red-600"
          onClick={() => {
            const updated = [
              ...(customer.testimonials?.reviews || [
                { name: "", text: "" },
                { name: "", text: "" },
                { name: "", text: "" },
              ]),
            ];

            updated[index] = {
              name: "",
              text: "",
            };

            setCustomer({
              ...customer,
              testimonials: {
                enabled:
                  customer.testimonials?.enabled ?? true,
                googleReviewLink:
                  customer.testimonials?.googleReviewLink ||
                  "",
                reviews: updated,
              },
            });
          }}
        >
          Remove review
        </button>
      </div>
    );
  })}
</section>




{/* Schedule */}
<section className="mb-8">
  <h3 className="font-medium mb-3">Schedule</h3>

  {(() => {
    const scheduleDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

    function buildTimeSlots(startHour: string, endHour: string) {
      const [startH, startM] = startHour.split(":").map(Number);
      const [endH, endM] = endHour.split(":").map(Number);

      const start = startH * 60 + startM;
      const end = endH * 60 + endM;

      const slots: string[] = [];

      for (let t = start; t < end; t += 30) {
        const h = Math.floor(t / 60);
        const m = t % 60;

        slots.push(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        );
      }

      return slots;
    }

function getSchedule() {
  const currentCustomer = customer!;

  return {
    enabled: currentCustomer.schedule?.enabled ?? true,
    startHour: currentCustomer.schedule?.startHour || "08:00",
    endHour: currentCustomer.schedule?.endHour || "20:00",
    intervalMinutes: currentCustomer.schedule?.intervalMinutes || 30,
        days: {
          Mon: currentCustomer.schedule?.days?.Mon || [],
          Tue: currentCustomer.schedule?.days?.Tue || [],
          Wed: currentCustomer.schedule?.days?.Wed || [],
          Thu: currentCustomer.schedule?.days?.Thu || [],
          Fri: currentCustomer.schedule?.days?.Fri || [],
          Sat: currentCustomer.schedule?.days?.Sat || [],
          Sun: currentCustomer.schedule?.days?.Sun || [],
        },
      };
    }

    const schedule = getSchedule();
    const slots = buildTimeSlots(schedule.startHour, schedule.endHour);

	function updateSchedule(nextSchedule: CustomerConfig["schedule"]) {
	  if (!customer) return;

	  setCustomer({
		...customer,
		schedule: nextSchedule,
	  } as CustomerConfig);
	}

    function toggleTime(day: string, time: string) {
      const current = schedule.days[day as keyof typeof schedule.days] || [];
      const exists = current.includes(time);

      updateSchedule({
        ...schedule,
        days: {
          ...schedule.days,
          [day]: exists
            ? current.filter((t) => t !== time)
            : [...current, time].sort(),
        },
      });
    }

    return (
      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={schedule.enabled}
            onChange={(e) =>
              updateSchedule({
                ...schedule,
                enabled: e.target.checked,
              })
            }
          />
          Enable schedule page
        </label>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">
              Start time
            </label>
            <input
              type="time"
              step={1800}
              className="w-full border rounded-md p-2"
              value={schedule.startHour}
              onChange={(e) =>
                updateSchedule({
                  ...schedule,
                  startHour: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">
              End time
            </label>
            <input
              type="time"
              step={1800}
              className="w-full border rounded-md p-2"
              value={schedule.endHour}
              onChange={(e) =>
                updateSchedule({
                  ...schedule,
                  endHour: e.target.value,
                })
              }
            />
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Click the time blocks when you are available. Green means available.
        </p>

        {scheduleDays.map((day) => (
          <div key={day} className="border rounded-md p-3 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{day}</div>

              <button
                type="button"
                className="text-xs text-indigo-600 font-medium"
                onClick={() =>
                  updateSchedule({
                    ...schedule,
                    days: {
                      ...schedule.days,
                      [day]: slots,
                    },
                  })
                }
              >
                Select all
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => {
                const selected = schedule.days[day].includes(slot);

                return (
                  <button
                    key={`${day}-${slot}`}
                    type="button"
                    onClick={() => toggleTime(day, slot)}
                    className={`rounded-md border px-2 py-2 text-xs transition ${
                      selected
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="mt-2 text-xs text-gray-500"
              onClick={() =>
                updateSchedule({
                  ...schedule,
                  days: {
                    ...schedule.days,
                    [day]: [],
                  },
                })
              }
            >
              Clear {day}
            </button>
          </div>
        ))}
      </div>
    );
  })()}
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