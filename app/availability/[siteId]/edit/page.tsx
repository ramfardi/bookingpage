"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useSearchParams, useParams } from "next/navigation";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type Contact = {
  email: string;
  phone: string;
  address: string;
};

type AvailabilityData = {
  siteId: string;
  editToken?: string;
  businessName: string;
  selectedDays: string[];
  dayTimes: Record<string, { start: string; end: string }>;
  contact: Contact;
  logoDataUrl: string;
};

export default function EditPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const siteId =
    typeof params.siteId === "string" ? params.siteId : "";
  const token = searchParams.get("token");

  const [data, setData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState("");
  const [message, setMessage] = useState("");

  const logoInput = useRef<HTMLInputElement>(null);
  const logoRequest = useRef(0);
  const saveInProgress = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    // Invalidate any image processing from the previous page.
    ++logoRequest.current;
    setLogoLoading(false);
    setLogoError("");
    setMessage("");
    setData(null);
    setError("");
    setLoading(true);

    async function load() {
      if (!siteId || !token) {
        setError("This edit link is missing its site ID or access token.");
        setLoading(false);
        return;
      }

      try {
        const query = new URLSearchParams({ siteId, token });

        const res = await fetch(`/api/availability/get?${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await res.json().catch(() => null);

        if (!res.ok || !result) {
          throw new Error(
            result?.error || "Could not load your availability page."
          );
        }

        // Compatibility with your current GET response.
        // The API must also validate the token on the server.
        if (result.editToken != null && result.editToken !== token) {
          throw new Error("This edit link is not authorized.");
        }

        if (
          !Array.isArray(result.selectedDays) ||
          !result.dayTimes ||
          typeof result.dayTimes !== "object"
        ) {
          throw new Error("The saved availability data is invalid.");
        }

        const dayTimes: AvailabilityData["dayTimes"] = {};

        for (const day of DAYS) {
          dayTimes[day] = {
            start: result.dayTimes[day]?.start || "09:00",
            end: result.dayTimes[day]?.end || "17:00",
          };
        }

        if (controller.signal.aborted) return;

        setData({
          siteId,
          businessName: result.businessName || "",
          selectedDays: DAYS.filter((day) =>
            result.selectedDays.includes(day)
          ),
          dayTimes,
          contact: {
            email: result.contact?.email || "",
            phone: result.contact?.phone || "",
            address: result.contact?.address || "",
          },
          logoDataUrl: result.logoDataUrl || "",
        });
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : "Could not load page."
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();

    return () => {
      controller.abort();
      ++logoRequest.current;
    };
  }, [siteId, token]);

  function updateContact(field: keyof Contact, value: string) {
    setMessage("");
    setData((prev) =>
      prev
        ? {
            ...prev,
            contact: { ...prev.contact, [field]: value },
          }
        : prev
    );
  }

  function toggleDay(day: string) {
    setMessage("");
    setData((prev) => {
      if (!prev) return prev;

      const selected = new Set(prev.selectedDays);

      if (selected.has(day)) {
        selected.delete(day);
      } else {
        selected.add(day);
      }

      return {
        ...prev,
        selectedDays: DAYS.filter((item) => selected.has(item)),
      };
    });
  }

  function updateTime(
    day: string,
    field: "start" | "end",
    value: string
  ) {
    setMessage("");
    setData((prev) =>
      prev
        ? {
            ...prev,
            dayTimes: {
              ...prev.dayTimes,
              [day]: {
                ...(prev.dayTimes[day] || {
                  start: "09:00",
                  end: "17:00",
                }),
                [field]: value,
              },
            },
          }
        : prev
    );
  }

  async function handleLogoChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const request = ++logoRequest.current;
    setLogoLoading(true);
    setLogoError("");
    setMessage("");

    try {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        throw new Error("Choose a JPG, PNG, or WebP image.");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Choose an image smaller than 5 MB.");
      }

      const url = URL.createObjectURL(file);

      try {
        const img = new Image();

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () =>
            reject(new Error("This image could not be opened."));
          img.src = url;
        });

        const scale = Math.min(
          1,
          512 / Math.max(img.naturalWidth, img.naturalHeight)
        );

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(
          1,
          Math.round(img.naturalWidth * scale)
        );
        canvas.height = Math.max(
          1,
          Math.round(img.naturalHeight * scale)
        );

        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Image processing is unavailable.");
        }

        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        const logoDataUrl = canvas.toDataURL("image/webp", 0.85);

        if (logoDataUrl.length > 350_000) {
          throw new Error(
            "The resized logo is still too large. Choose a simpler image."
          );
        }

        if (request === logoRequest.current) {
          setData((prev) => (prev ? { ...prev, logoDataUrl } : prev));
        }
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (request === logoRequest.current) {
        setLogoError(
          err instanceof Error ? err.message : "Could not load logo."
        );

        if (logoInput.current) logoInput.current.value = "";
      }
    } finally {
      if (request === logoRequest.current) setLogoLoading(false);
    }
  }

  function removeLogo() {
    ++logoRequest.current;
    setLogoLoading(false);
    setLogoError("");
    setMessage("");
    setData((prev) => (prev ? { ...prev, logoDataUrl: "" } : prev));

    if (logoInput.current) logoInput.current.value = "";
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!data || !token || logoLoading || saveInProgress.current) {
      return;
    }

    setError("");
    setMessage("");
    saveInProgress.current = true;
    setSaving(true);

    try {
      const res = await fetch("/api/availability/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          siteId,
          editToken: token,
          businessName: data.businessName.trim(),
          contact: {
            email: data.contact.email.trim(),
            phone: data.contact.phone.trim(),
            address: data.contact.address.trim(),
          },
        }),
      });

      const result = await res.json().catch(() => null);

      if (
        !res.ok ||
        result?.success === false ||
        result?.error ||
        result?.persisted === false
      ) {
        throw new Error(
          result?.error ||
            "Your changes could not be saved permanently. Please try again."
        );
      }

      setMessage("Changes saved.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save changes."
      );
    } finally {
      saveInProgress.current = false;
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-10 text-center">Loading…</div>;
  }

  if (!data) {
    return (
      <div role="alert" className="p-10 text-center text-red-600">
        {error || "Availability not found."}
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Edit Availability
      </h1>

      <p className="mt-2 text-sm text-gray-600">
        Update your schedule and public business details.
      </p>

      <form onSubmit={handleSave} className="mt-6">
        <fieldset disabled={saving} className="space-y-8">
          <section className="space-y-4 rounded-2xl border bg-gray-50 p-5">
            <h2 className="text-lg font-semibold">Business details</h2>

            <label className="block text-sm font-medium">
              Business name
              <input
                type="text"
                autoComplete="organization"
                maxLength={100}
                value={data.businessName}
                onChange={(e) => {
                  const value = e.target.value;
                  setMessage("");
                  setData((prev) =>
                    prev ? { ...prev, businessName: value } : prev
                  );
                }}
                className="mt-2 w-full rounded-lg border bg-white px-3 py-2"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Email (optional)
                <input
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={data.contact.email}
                  onChange={(e) => updateContact("email", e.target.value)}
                  className="mt-2 w-full rounded-lg border bg-white px-3 py-2"
                />
              </label>

              <label className="block text-sm font-medium">
                Phone number (optional)
                <input
                  type="tel"
                  autoComplete="tel"
                  maxLength={50}
                  value={data.contact.phone}
                  onChange={(e) => updateContact("phone", e.target.value)}
                  className="mt-2 w-full rounded-lg border bg-white px-3 py-2"
                />
              </label>
            </div>

            <label className="block text-sm font-medium">
              Address (optional)
              <textarea
                autoComplete="street-address"
                rows={2}
                maxLength={500}
                value={data.contact.address}
                onChange={(e) => updateContact("address", e.target.value)}
                className="mt-2 w-full rounded-lg border bg-white px-3 py-2"
              />
            </label>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium">
                Business logo (optional)
              </label>

              <p id="logo-help" className="mt-1 text-xs text-gray-500">
                JPG, PNG, or WebP, up to 5 MB.
              </p>

              <input
                ref={logoInput}
                id="logo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-describedby="logo-help"
                onChange={handleLogoChange}
                className="mt-3 block w-full text-sm"
              />

              {logoLoading && (
                <p role="status" className="mt-2 text-sm">
                  Preparing logo…
                </p>
              )}

              {logoError && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {logoError}
                </p>
              )}

              {data.logoDataUrl && (
                <div className="mt-4 flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.logoDataUrl}
                    alt="Business logo preview"
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-xl border bg-white p-2 object-contain"
                  />

                  <button
                    type="button"
                    onClick={removeLogo}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove logo
                  </button>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Available days</h2>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DAYS.map((day) => {
                const active = data.selectedDays.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleDay(day)}
                    className={`rounded-lg border px-3 py-2 ${
                      active ? "bg-indigo-600 text-white" : "bg-white"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Hours</h2>

            {data.selectedDays.map((day) => (
              <div
                key={day}
                className="grid grid-cols-2 items-center gap-3 rounded-lg border p-3 sm:grid-cols-3"
              >
                <span className="col-span-2 font-medium sm:col-span-1">
                  {day}
                </span>

                <input
                  type="time"
                  required
                  aria-label={`${day} start time`}
                  value={data.dayTimes[day].start}
                  onChange={(e) =>
                    updateTime(day, "start", e.target.value)
                  }
                  className="min-w-0 rounded border px-2 py-2"
                />

                <input
                  type="time"
                  required
                  aria-label={`${day} end time`}
                  value={data.dayTimes[day].end}
                  onChange={(e) =>
                    updateTime(day, "end", e.target.value)
                  }
                  className="min-w-0 rounded border px-2 py-2"
                />
              </div>
            ))}
          </section>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="rounded-lg bg-green-50 p-3 text-green-700"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || logoLoading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving…"
              : logoLoading
                ? "Preparing logo…"
                : "Save Changes"}
          </button>
        </fieldset>
      </form>
    </main>
  );
}