"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import CleaningGetQuotePage from "@/components/CleaningGetQuotePage";

type Building = "apartment" | "townhouse" | "house" | "commercial";
type Service = "standard" | "deep" | "move";
type Condition = "normal" | "moderate" | "heavy";
type Frequency = "once" | "weekly" | "biweekly" | "monthly";
type Extra = "oven" | "fridge" | "windows" | "petHair";

type QuoteSettings = {
  currency: string;
  serviceMultipliers: Record<Service, number>;
  conditionMultipliers: Record<Condition, number>;
  frequencyDiscounts: Record<Frequency, number>;
  extraPrices: Record<Extra, number>;
};

type EditForm = {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  serviceArea: string;
  availabilityUrl: string;
  bookingUrl: string;
  pricePerSqft: Record<Building, number>;
  minimumPrice: number;
  quoteSettings: QuoteSettings;
};

const BUILDINGS: { id: Building; label: string }[] = [
  { id: "apartment", label: "Condo / Apartment" },
  { id: "townhouse", label: "Townhouse" },
  { id: "house", label: "Detached home" },
  { id: "commercial", label: "Office / Commercial" },
];
const SERVICES: { id: Service; label: string }[] = [
  { id: "standard", label: "Standard cleaning" },
  { id: "deep", label: "Deep cleaning" },
  { id: "move", label: "Move-in / move-out" },
];
const CONDITIONS: { id: Condition; label: string }[] = [
  { id: "normal", label: "Generally tidy" },
  { id: "moderate", label: "Extra attention" },
  { id: "heavy", label: "Heavy buildup" },
];
const FREQUENCIES: { id: Frequency; label: string }[] = [
  { id: "once", label: "One-time" },
  { id: "weekly", label: "Weekly" },
  { id: "biweekly", label: "Every 2 weeks" },
  { id: "monthly", label: "Monthly" },
];
const EXTRAS: { id: Extra; label: string }[] = [
  { id: "oven", label: "Inside oven" },
  { id: "fridge", label: "Inside fridge" },
  { id: "windows", label: "Interior windows" },
  { id: "petHair", label: "Extra pet hair" },
];

const DEFAULTS: EditForm = {
  businessName: "",
  businessEmail: "",
  businessPhone: "",
  serviceArea: "",
  availabilityUrl: "",
  bookingUrl: "",
  pricePerSqft: { apartment: 0.12, townhouse: 0.14, house: 0.16, commercial: 0.18 },
  minimumPrice: 80,
  quoteSettings: {
    currency: "USD",
    serviceMultipliers: { standard: 1, deep: 1.5, move: 1.7 },
    conditionMultipliers: { normal: 1, moderate: 1.15, heavy: 1.3 },
    frequencyDiscounts: { once: 0, weekly: 15, biweekly: 10, monthly: 5 },
    extraPrices: { oven: 30, fridge: 25, windows: 40, petHair: 20 },
  },
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";
const sectionClass = "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

function nonnegativeNumber(value: unknown, fallback: number): number {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function mergeNumbers<K extends string>(defaults: Record<K, number>, saved: unknown): Record<K, number> {
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return { ...defaults };
  const values = saved as Record<string, unknown>;
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as K[]) {
    result[key] = nonnegativeNumber(values[key], defaults[key]);
  }
  return result;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizedUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function readSavedForm(data: Record<string, unknown>): EditForm {
  const rawSettings =
    data.quoteSettings && typeof data.quoteSettings === "object" && !Array.isArray(data.quoteSettings)
      ? (data.quoteSettings as Record<string, unknown>)
      : {};
  return {
    businessName: asText(data.businessName),
    businessEmail: asText(data.businessEmail),
    businessPhone: asText(data.businessPhone),
    serviceArea: asText(data.serviceArea),
    availabilityUrl: asText(data.availabilityUrl),
    bookingUrl: asText(data.bookingUrl),
    pricePerSqft: mergeNumbers(DEFAULTS.pricePerSqft, data.pricePerSqft),
    minimumPrice: nonnegativeNumber(data.minimumPrice, DEFAULTS.minimumPrice),
    quoteSettings: {
      currency: asText(rawSettings.currency) || "USD",
      serviceMultipliers: mergeNumbers(DEFAULTS.quoteSettings.serviceMultipliers, rawSettings.serviceMultipliers),
      conditionMultipliers: mergeNumbers(DEFAULTS.quoteSettings.conditionMultipliers, rawSettings.conditionMultipliers),
      frequencyDiscounts: mergeNumbers(DEFAULTS.quoteSettings.frequencyDiscounts, rawSettings.frequencyDiscounts),
      extraPrices: mergeNumbers(DEFAULTS.quoteSettings.extraPrices, rawSettings.extraPrices),
    },
  };
}

function EditCleaningQuoteContent() {
  const { siteId } = useParams<{ siteId: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState<EditForm>(DEFAULTS);
  const [originalData, setOriginalData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setLoadError("");
      setMessage(null);

      if (!siteId || !token) {
        setLoadError("The private edit link is missing a site ID or edit token.");
        setLoading(false);
        return;
      }

      try {
		const res = await fetch(
		  `/api/cleaning/quote-gen/get?siteId=${encodeURIComponent(siteId)}&token=${encodeURIComponent(token)}`,
		  {
			cache: "no-store",
			signal: controller.signal,
		  }
		);
        if (!res.ok) throw new Error(res.status === 404 ? "This quote page was not found." : "Unable to load this quote page.");

        const data: unknown = await res.json();
        if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid quote data returned.");
        const saved = data as Record<string, unknown>;

        // Retained for compatibility with your current GET API.
        // The UPDATE API must also check the token on the server.
        if (saved.editToken !== token) throw new Error("This private edit link is invalid.");

        if (controller.signal.aborted) return;
        setOriginalData(saved);
        setForm(readSavedForm(saved));
      } catch (error) {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof Error ? error.message : "Unable to load this quote page.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [siteId, token]);

  const previewData = useMemo(() => ({
    ...originalData,
    ...form,
    businessName: form.businessName.trim() || "Your Cleaning Business",
    availabilityUrl: normalizedUrl(form.availabilityUrl),
    bookingUrl: normalizedUrl(form.bookingUrl),
  }), [originalData, form]);

  const currency = form.quoteSettings.currency;

  function updateField<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  function updateRate(key: Building, value: number) {
    setForm((prev) => ({
      ...prev,
      pricePerSqft: { ...prev.pricePerSqft, [key]: Math.max(0, value || 0) },
    }));
    setMessage(null);
  }

  function updateSetting(group: "serviceMultipliers", key: Service, value: number): void;
  function updateSetting(group: "conditionMultipliers", key: Condition, value: number): void;
  function updateSetting(group: "frequencyDiscounts", key: Frequency, value: number): void;
  function updateSetting(group: "extraPrices", key: Extra, value: number): void;
  function updateSetting(
    group: "serviceMultipliers" | "conditionMultipliers" | "frequencyDiscounts" | "extraPrices",
    key: string,
    value: number
  ) {
    const maximum = group === "frequencyDiscounts" ? 100 : Infinity;
    const safeValue = Math.min(maximum, Math.max(0, value || 0));
    setForm((prev) => ({
      ...prev,
      quoteSettings: {
        ...prev.quoteSettings,
        [group]: { ...prev.quoteSettings[group], [key]: safeValue },
      },
    }));
    setMessage(null);
  }

  async function handleSave() {
    setMessage(null);
    if (saving) return;
    if (!siteId || !token) {
      setMessage({ kind: "error", text: "Your private edit token is missing." });
      return;
    }
    if (!form.businessName.trim()) {
      setMessage({ kind: "error", text: "Please enter your business name." });
      return;
    }
    if (form.businessEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.businessEmail.trim())) {
      setMessage({ kind: "error", text: "Please enter a valid business email address." });
      return;
    }
    if (form.availabilityUrl.trim() && !normalizedUrl(form.availabilityUrl)) {
      setMessage({ kind: "error", text: "Please enter a valid availability link." });
      return;
    }
    if (form.bookingUrl.trim() && !normalizedUrl(form.bookingUrl)) {
      setMessage({ kind: "error", text: "Please enter a valid booking link." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        siteId,
        editToken: token,
        businessName: form.businessName.trim(),
        pricePerSqft: form.pricePerSqft,
        minimumPrice: form.minimumPrice,
        businessEmail: form.businessEmail.trim(),
        businessPhone: form.businessPhone.trim(),
        serviceArea: form.serviceArea.trim(),
        availabilityUrl: normalizedUrl(form.availabilityUrl),
        bookingUrl: normalizedUrl(form.bookingUrl),
        quoteSettings: form.quoteSettings,
      };

      const res = await fetch("/api/cleaning/quote-gen/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || result?.error) {
        throw new Error(typeof result?.error === "string" ? result.error : "Your changes could not be saved.");
      }
      setMessage({ kind: "success", text: "Changes saved. Your updated pricing is ready for customers." });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save changes." });
    } finally {
      setSaving(false);
    }
  }

  const subdomain = asText(originalData.subdomain);
  const publicLink = /^[a-z0-9-]{3,60}$/.test(subdomain)
    ? `https://${subdomain}.simplebookme.com`
    : `/cleaning/quote-gen/${encodeURIComponent(siteId || "")}`;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center"><div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /><p className="text-sm text-slate-600">Loading your quote settings...</p></div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Unable to open edit page</h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-slate-600">{loadError}</p>
          <p className="mt-3 text-xs text-slate-500">Please use the complete private edit link you received when creating the quote page.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white px-4 py-10 text-slate-900 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Private editor</span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Edit your cleaning quote</h1>
            <p className="mt-2 text-sm text-slate-500">Customize your rates and contact details. See updates instantly before saving.</p>
          </div>
          <a href={publicLink} target="_blank" rel="noopener noreferrer" className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-slate-50">View public quote ↗</a>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
          <div className="space-y-5">
            <section className={sectionClass}>
              <div className="mb-5"><h2 className="text-lg font-bold">01 · Business information</h2><p className="mt-1 text-xs text-slate-500">Details customers will see and use to contact you.</p></div>
              <div className="space-y-4">
                <div><label htmlFor="edit-business" className={labelClass}>Business name *</label><input id="edit-business" maxLength={100} value={form.businessName} onChange={(e) => updateField("businessName", e.target.value)} className={inputClass} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label htmlFor="edit-email" className={labelClass}>Business email</label><input id="edit-email" type="email" maxLength={160} placeholder="hello@yourbusiness.com" value={form.businessEmail} onChange={(e) => updateField("businessEmail", e.target.value)} className={inputClass} /></div>
                  <div><label htmlFor="edit-phone" className={labelClass}>Phone (optional)</label><input id="edit-phone" type="tel" maxLength={40} placeholder="Business phone number" value={form.businessPhone} onChange={(e) => updateField("businessPhone", e.target.value)} className={inputClass} /></div>
                </div>
                <p className="text-xs leading-5 text-slate-500">Adding an email lets customers open a prefilled quote request in their email app. Requests are not automatically sent yet.</p>
                <div><label htmlFor="edit-area" className={labelClass}>Service area</label><input id="edit-area" maxLength={140} placeholder="e.g. Vancouver and North Shore" value={form.serviceArea} onChange={(e) => updateField("serviceArea", e.target.value)} className={inputClass} /></div>
                <div><label htmlFor="edit-currency" className={labelClass}>Currency</label>
                  <select id="edit-currency" className={inputClass} value={currency} onChange={(e) => { setForm((prev) => ({ ...prev, quoteSettings: { ...prev.quoteSettings, currency: e.target.value } })); setMessage(null); }}>
                    <option value="USD">USD — US dollar</option><option value="CAD">CAD — Canadian dollar</option><option value="GBP">GBP — British pound</option><option value="EUR">EUR — Euro</option><option value="AUD">AUD — Australian dollar</option><option value="ZAR">ZAR — South African rand</option><option value="PHP">PHP — Philippine peso</option>
                  </select>
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <div className="mb-5"><h2 className="text-lg font-bold">02 · Base prices</h2><p className="mt-1 text-xs text-slate-500">Set the price per square foot for each property type.</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                {BUILDINGS.map(({ id, label }) => (
                  <div key={id}><label htmlFor={`edit-rate-${id}`} className={labelClass}>{label}</label>
                    <input id={`edit-rate-${id}`} type="number" min="0" step="0.01" value={form.pricePerSqft[id]} onChange={(e) => updateRate(id, Number(e.target.value))} className={inputClass} />
                    <p className="mt-1 text-xs text-slate-400">{currency} per sq ft</p>
                  </div>
                ))}
              </div>
              <div className="mt-4"><label htmlFor="edit-minimum" className={labelClass}>Minimum job price ({currency})</label><input id="edit-minimum" type="number" min="0" step="1" value={form.minimumPrice} onChange={(e) => updateField("minimumPrice", Math.max(0, Number(e.target.value) || 0))} className={inputClass} /></div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Base estimate = maximum of square footage × rate, or your minimum job price.</p>
            </section>

            <section className={sectionClass}>
              <div className="mb-5"><h2 className="text-lg font-bold">03 · Customize cleaning options</h2><p className="mt-1 text-xs text-slate-500">These rules affect the instant estimate in your public form.</p></div>
              <div className="space-y-3">
                <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-800">Cleaning type multipliers</summary>
                  <p className="mt-2 text-xs text-slate-500">Example: 1.50 means a 50% increase over standard cleaning.</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {SERVICES.map(({ id, label }) => <div key={id}><label htmlFor={`service-${id}`} className={labelClass}>{label}</label><input id={`service-${id}`} type="number" min="0" max="10" step="0.05" value={form.quoteSettings.serviceMultipliers[id]} onChange={(e) => updateSetting("serviceMultipliers", id, Number(e.target.value))} className={inputClass} /></div>)}
                  </div>
                </details>
                <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-800">Cleaning condition multipliers</summary>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {CONDITIONS.map(({ id, label }) => <div key={id}><label htmlFor={`condition-${id}`} className={labelClass}>{label}</label><input id={`condition-${id}`} type="number" min="0" max="10" step="0.05" value={form.quoteSettings.conditionMultipliers[id]} onChange={(e) => updateSetting("conditionMultipliers", id, Number(e.target.value))} className={inputClass} /></div>)}
                  </div>
                </details>
                <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-800">Recurring cleaning discounts</summary>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {FREQUENCIES.map(({ id, label }) => <div key={id}><label htmlFor={`frequency-${id}`} className={labelClass}>{label} (%)</label><input id={`frequency-${id}`} type="number" min="0" max="100" step="1" value={form.quoteSettings.frequencyDiscounts[id]} onChange={(e) => updateSetting("frequencyDiscounts", id, Number(e.target.value))} className={inputClass} /></div>)}
                  </div>
                </details>
                <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-800">Optional extra prices</summary>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {EXTRAS.map(({ id, label }) => <div key={id}><label htmlFor={`extra-${id}`} className={labelClass}>{label} ({currency})</label><input id={`extra-${id}`} type="number" min="0" step="1" value={form.quoteSettings.extraPrices[id]} onChange={(e) => updateSetting("extraPrices", id, Number(e.target.value))} className={inputClass} /></div>)}
                  </div>
                </details>
              </div>
            </section>

            <section className={sectionClass}>
              <div className="mb-5"><h2 className="text-lg font-bold">04 · Appointments & links</h2><p className="mt-1 text-xs text-slate-500">Help customers move from estimates toward a booking.</p></div>
              <div className="space-y-4">
                <div><label htmlFor="edit-availability" className={labelClass}>Availability page link</label><input id="edit-availability" type="text" placeholder="https://your-availability-page..." value={form.availabilityUrl} onChange={(e) => updateField("availabilityUrl", e.target.value)} className={inputClass} /></div>
                <div><label htmlFor="edit-booking" className={labelClass}>Booking page link</label><input id="edit-booking" type="text" placeholder="https://your-booking-page..." value={form.bookingUrl} onChange={(e) => updateField("bookingUrl", e.target.value)} className={inputClass} /></div>
                <p className="text-xs leading-5 text-slate-500">Customers can choose a preferred date in the quote form. Linking an availability page does not yet check free slots or reserve an appointment.</p>
              </div>
            </section>

            <section className="rounded-3xl bg-slate-900 p-5 shadow-lg sm:p-6">
              <h2 className="text-lg font-bold text-white">Ready to publish your changes?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">Your preview updates immediately, but your public quote page only changes after you save.</p>
              {message && <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-sm ${message.kind === "success" ? "bg-emerald-900/50 text-emerald-100" : "bg-rose-900/60 text-rose-100"}`}>{message.text}</p>}
              <button type="button" onClick={handleSave} disabled={saving} className="mt-5 w-full rounded-xl bg-indigo-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving changes..." : "Save changes →"}</button>
              <p className="mt-3 text-center text-xs text-slate-400">Keep your private edit link safe. Anyone with that link may be able to change this page.</p>
            </section>
          </div>

          <aside className="lg:sticky lg:top-5">
            <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Live customer preview</h2><p className="mt-1 text-xs text-slate-500">Try the form with your current rates and extras.</p></div><span className="whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Live preview</span></div>
            <div className="max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <CleaningGetQuotePage compact data={previewData} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function EditCleaningQuotePage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">Loading editor...</main>}>
      <EditCleaningQuoteContent />
    </Suspense>
  );
}
