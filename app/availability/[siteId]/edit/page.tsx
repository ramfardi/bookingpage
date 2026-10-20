"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useSearchParams, useParams } from "next/navigation";

import {
  DAYS,
  HOURS,
  getAvailableHours,
  hourLabel,
  isSlotOverrides,
} from "@/app/lib/availabilitySlots";
import type { SlotOverrides } from "@/app/lib/availabilitySlots";
import { normalizeBookingUrl } from "@/app/lib/bookingUrl";

type Contact = {
  email: string;
  phone: string;
  address: string;
};

type AvailabilityData = {
  siteId: string;
  businessName: string;
  selectedDays: string[];
  dayTimes: Record<string, { start: string; end: string }>;
  contact: Contact;
  logoDataUrl: string;
  bookingUrl: string;
  slotOverrides: SlotOverrides;
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

        // The API also validates authorization on the server.
        if (result.editToken != null && result.editToken !== token) {
          throw new Error("This edit link is not authorized.");
        }

        if (
          !Array.isArray(result.selectedDays) ||
          !result.dayTimes ||
          typeof result.dayTimes !== "object" ||
          Array.isArray(result.dayTimes)
        ) {
          throw new Error("The saved availability data is invalid.");
        }

        const slotOverrides = result.slotOverrides ?? {};

        if (!isSlotOverrides(slotOverrides)) {
          throw new Error("The saved availability blocks are invalid.");
        }

        // Preserve the original hours as the baseline schedule.
        // Individual changes are stored separately in slotOverrides.
        const dayTimes: AvailabilityData["dayTimes"] = {};

        for (const day of DAYS) {
          dayTimes[day] = {
            start:
              typeof result.dayTimes[day]?.start === "string"
                ? result.dayTimes[day].start
                : "",
            end:
              typeof result.dayTimes[day]?.end === "string"
                ? result.dayTimes[day].end
                : "",
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
          bookingUrl: result.bookingUrl || "",
          slotOverrides,
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

  function clearFeedback() {
    setMessage("");
    setError("");
  }

  function updateContact(field: keyof Contact, value: string) {
    clearFeedback();

    setData((prev) =>
      prev
        ? {
            ...prev,
            contact: {
              ...prev.contact,
              [field]: value,
            },
          }
        : prev
    );
  }

  function toggleHour(day: string, hour: number) {
    clearFeedback();

    setData((prev) => {
      if (!prev) return prev;

      const dayIndex = DAYS.indexOf(day);
      if (dayIndex < 0) return prev;

      const currentlyAvailable =
        getAvailableHours(prev)[dayIndex].includes(hour);

      return {
        ...prev,
        slotOverrides: {
          ...prev.slotOverrides,
          [day]: {
            ...prev.slotOverrides[day],
            [String(hour)]: !currentlyAvailable,
          },
        },
      };
    });
  }

  async function handleLogoChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const request = ++logoRequest.current;
    setLogoLoading(true);
    setLogoError("");
    clearFeedback();

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
    clearFeedback();

    setData((prev) => (prev ? { ...prev, logoDataUrl: "" } : prev));

    if (logoInput.current) logoInput.current.value = "";
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!data || !token || logoLoading || saveInProgress.current) {
      return;
    }

    clearFeedback();

    const bookingUrl = normalizeBookingUrl(data.bookingUrl);

    if (bookingUrl === null) {
      setError(
        "Enter a valid booking URL beginning with https:// or http://."
      );
      return;
    }

    saveInProgress.current = true;
    setSaving(true);

    try {
      const res = await fetch("/api/availability/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          siteId,
          editToken: token,
          bookingUrl,
          businessName: data.businessName.trim(),
          contact: {
            email: data.contact.email.trim(),
            phone: data.contact.phone.trim(),
            address: data.contact.address.trim(),
          },
          slotOverrides: data.slotOverrides,
        }),
      });

      const result = await res.json().catch(() => null);

      if (
        !res.ok ||
        result?.success !== true ||
        result?.error ||
        result?.persisted === false
      ) {
        throw new Error(
          result?.error ||
            "Your changes could not be saved. Please try again."
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
    return (
      <div role="status" className="p-10 text-center text-slate-500">
        Loading…
      </div>
    );
  }

  if (!data) {
    return (
      <div role="alert" className="p-10 text-center text-red-600">
        {error || "Availability not found."}
      </div>
    );
  }

  const availableHoursByDay = getAvailableHours(data);

  const totalSlots = availableHoursByDay.reduce(
    (total, hours) => total + hours.length,
    0
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Edit availability
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Update your weekly schedule and public business details.
        </p>

        <form onSubmit={handleSave} className="mt-6">
          <fieldset
            disabled={saving}
            className="min-w-0 space-y-6 disabled:opacity-75"
          >
            {/* BUSINESS DETAILS */}
            <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Business details
              </h2>

              <label className="block text-sm font-medium">
                Business name
                <input
                  type="text"
                  autoComplete="organization"
                  maxLength={100}
                  value={data.businessName}
                  onChange={(e) => {
                    const businessName = e.target.value;
                    clearFeedback();

                    setData((prev) =>
                      prev ? { ...prev, businessName } : prev
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
                    onChange={(e) =>
                      updateContact("email", e.target.value)
                    }
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
                    onChange={(e) =>
                      updateContact("phone", e.target.value)
                    }
                    className="mt-2 w-full rounded-lg border bg-white px-3 py-2"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium">
                Booking link (optional)
                <input
                  type="url"
                  maxLength={2048}
                  placeholder="https://your-booking-website.com"
                  value={data.bookingUrl}
                  onChange={(e) => {
                    const bookingUrl = e.target.value;
                    clearFeedback();

                    setData((prev) =>
                      prev ? { ...prev, bookingUrl } : prev
                    );
                  }}
                  className="mt-2 w-full rounded-lg border bg-white px-3 py-2"
                />

                <span className="mt-2 block text-xs font-normal text-slate-500">
                  Visitors can click available hours to open this page.
                  Leave empty to disable booking links.
                </span>
              </label>

              <label className="block text-sm font-medium">
                Address (optional)
                <textarea
                  autoComplete="street-address"
                  rows={2}
                  maxLength={500}
                  value={data.contact.address}
                  onChange={(e) =>
                    updateContact("address", e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border bg-white px-3 py-2"
                />
              </label>

              <div>
                <label
                  htmlFor="logo"
                  className="block text-sm font-medium"
                >
                  Business logo (optional)
                </label>

                <p
                  id="logo-help"
                  className="mt-1 text-xs text-slate-500"
                >
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
                  <p
                    role="alert"
                    className="mt-2 text-sm text-red-600"
                  >
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

            {/* EDITABLE WEEKLY GRID */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Weekly availability
                  </h2>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    {totalSlots} hours available
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Click a block to add or remove one hour. This schedule
                  repeats every week. Click Save Changes when finished.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-3 w-3 rounded bg-emerald-400"
                    />
                    Available
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-3 w-3 rounded bg-slate-200"
                    />
                    Unavailable
                  </span>

                  <span>5 AM–9 PM</span>
                </div>
              </div>

              <div
                role="region"
                aria-label="Edit weekly hour blocks"
                tabIndex={0}
                className="overflow-x-auto p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 sm:p-5"
              >
                <table className="w-full min-w-[820px] table-fixed border-separate border-spacing-1">
                  <caption className="sr-only">
                    Toggle one-hour availability blocks from 5 AM to
                    9 PM, Monday through Sunday.
                  </caption>

                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="w-20 p-2 text-left text-xs font-medium text-slate-500"
                      >
                        Time
                      </th>

                      {DAYS.map((day, dayIndex) => (
                        <th
                          key={day}
                          scope="col"
                          className="pb-3 text-center"
                        >
                          <div className="rounded-xl bg-slate-50 px-2 py-3">
                            <span className="block text-sm font-semibold text-slate-700">
                              {day.slice(0, 3)}
                              <span className="sr-only">
                                {day.slice(3)}
                              </span>
                            </span>

                            <span className="mt-1 block text-[11px] font-normal text-slate-500">
                              {availableHoursByDay[dayIndex].length}h
                              available
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {HOURS.map((hour) => (
                      <tr key={hour}>
                        <th
                          scope="row"
                          className="p-2 text-left text-xs font-medium text-slate-500"
                        >
                          {hourLabel(hour)}
                        </th>

                        {DAYS.map((day, dayIndex) => {
                          const available =
                            availableHoursByDay[dayIndex].includes(hour);

                          const label = `${day}, ${hourLabel(
                            hour
                          )} to ${hourLabel(hour + 1)}`;

                          return (
                            <td key={day}>
                              <button
                                type="button"
                                aria-pressed={available}
                                aria-label={`${label}: ${
                                  available
                                    ? "available, click to remove"
                                    : "unavailable, click to add"
                                }`}
                                title={label}
                                onClick={() => toggleHour(day, hour)}
                                className={`flex h-16 w-full flex-col items-center justify-center rounded-xl border px-1 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed ${
                                  available
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100"
                                    : "border-slate-200 bg-slate-50 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50"
                                }`}
                              >
                                <span className="text-xs font-semibold">
                                  {available ? "Available" : "+ Add"}
                                </span>

                                <span className="mt-1 text-[10px]">
                                  {hourLabel(hour)}–{hourLabel(hour + 1)}
                                </span>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                Last block: 8 PM–9 PM. Scroll sideways on smaller screens.
              </p>
            </section>

            {/* SAVE STATUS */}
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || logoLoading}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving…"
                : logoLoading
                  ? "Preparing logo…"
                  : "Save Changes"}
            </button>
          </fieldset>
        </form>
      </div>
    </main>
  );
}