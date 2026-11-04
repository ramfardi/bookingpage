"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CleaningGetQuotePage from "@/components/CleaningGetQuotePage";

type BuildingType = "apartment" | "townhouse" | "house" | "commercial";
type CleaningType = "standard" | "deep" | "move";
type Condition = "normal" | "moderate" | "heavy";
type Frequency = "once" | "weekly" | "biweekly" | "monthly";
type ExtraKey = "oven" | "fridge" | "windows" | "petHair";

const BUILDING_LABELS: Record<BuildingType, string> = {
  apartment: "Condo / Apartment", townhouse: "Townhouse", house: "Detached home", commercial: "Office / Commercial",
};
const SERVICES: Record<CleaningType, string> = { standard: "Standard clean", deep: "Deep clean", move: "Move-in / move-out" };
const CONDITIONS: Record<Condition, string> = { normal: "Generally tidy", moderate: "Extra attention", heavy: "Heavy buildup" };
const FREQUENCIES: Record<Frequency, string> = { once: "One-time", weekly: "Weekly", biweekly: "Every 2 weeks", monthly: "Monthly" };
const EXTRAS: Record<ExtraKey, string> = { oven: "Inside oven", fridge: "Inside fridge", windows: "Interior windows", petHair: "Extra pet hair" };
const BUILDING_IDS: BuildingType[] = ["apartment", "townhouse", "house", "commercial"];
const SERVICE_IDS: CleaningType[] = ["standard", "deep", "move"];
const CONDITION_IDS: Condition[] = ["normal", "moderate", "heavy"];
const FREQUENCY_IDS: Frequency[] = ["once", "weekly", "biweekly", "monthly"];
const EXTRA_IDS: ExtraKey[] = ["oven", "fridge", "windows", "petHair"];

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";
const sectionClass = "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

function normalizedUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    if (!(["https:", "http:"].includes(parsed.protocol))) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

const seoSections = [
  {
    title: "Why Use a Cleaning Quote Link?",
    paragraphs: [
      "Providing pricing for cleaning services can be time-consuming when every property is different. A shareable quote link lets your customers enter their property size and cleaning requirements to receive an immediate estimate based on your own rates.",
      "Instead of repeatedly answering the same questions, you can send one link through Instagram, your Google Business Profile, text messages, or your website. Customers get a clear starting price before requesting an appointment.",
    ],
  },
  {
    title: "Benefits of Using a Quote Generator",
    paragraphs: [
      "A quote generator applies your pricing rules consistently. Your customers can compare standard and deep cleaning, select optional extras, and see how recurring service can change the estimate.",
      "The form can also gather useful job details such as approximate location, bedrooms, bathrooms, cleaning condition, and preferred date. You review the request and confirm the final quote rather than starting from scratch.",
    ],
  },
  {
    title: "Different Types of Cleaning Pricing",
    paragraphs: [
      "Cleaning jobs can be priced by the hour, square footage, room count, or service package. This generator starts with a property-specific square-foot rate and lets you adjust estimates using service multipliers and extras.",
      "For larger or more complicated jobs, such as move-out or heavily soiled properties, you can use the result as an initial estimate and confirm pricing after reviewing the customer's details.",
    ],
  },
  {
    title: "Why Pricing Should Vary by Job",
    paragraphs: [
      "A small, regularly cleaned condo differs from a large detached home needing a deep clean. Property size, service type, frequency, and extra tasks can all affect the effort required.",
      "Customizable rates and add-on prices help you reflect those differences, while a minimum charge can protect smaller jobs from being priced too low.",
    ],
  },
  {
    title: "How to Use Your Cleaning Quote Link",
    paragraphs: [
      "Create your personalized link, share it on social media, send it to customers who ask for a quote, or add it to your Google Business Profile and business website.",
      "You can also turn the link into a QR code for flyers, cards, and other printed materials. The private edit link should be kept secure so only you can change your business settings.",
    ],
  },
  {
    title: "From Quote to Booking",
    paragraphs: [
      "Customers can select a preferred appointment date, provide contact details, and prepare an email request to your business. A preferred date is not a confirmed booking; you still decide whether to accept the job.",
      "If you already use a SimpleBookMe availability page, you can link it from the quote form. Automatic notifications and live appointment blocking require additional integration with your backend.",
    ],
  },
];

export default function CleaningQuoteGeneratorPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [availabilityUrl, setAvailabilityUrl] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Original fields and starting rates are retained for existing backend compatibility.
  const [pricePerSqft, setPricePerSqft] = useState<Record<BuildingType, number>>({
    apartment: 0.12, townhouse: 0.14, house: 0.16, commercial: 0.18,
  });
  const [minimumPrice, setMinimumPrice] = useState(80);

  // New optional settings. The create / get / edit APIs need to retain these fields in data JSON.
  const [serviceMultipliers, setServiceMultipliers] = useState<Record<CleaningType, number>>({ standard: 1, deep: 1.5, move: 1.7 });
  const [conditionMultipliers, setConditionMultipliers] = useState<Record<Condition, number>>({ normal: 1, moderate: 1.15, heavy: 1.3 });
  const [frequencyDiscounts, setFrequencyDiscounts] = useState<Record<Frequency, number>>({ once: 0, weekly: 15, biweekly: 10, monthly: 5 });
  const [extraPrices, setExtraPrices] = useState<Record<ExtraKey, number>>({ oven: 30, fridge: 25, windows: 40, petHair: 20 });

  const [generatedLink, setGeneratedLink] = useState("");
  const [editLink, setEditLink] = useState("");
  const [activationUrl, setActivationUrl] = useState("");
	const [trialEndsAt, setTrialEndsAt] = useState("");
	const [emailSent, setEmailSent] = useState<boolean | null>(null);
	const [emailWarning, setEmailWarning] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"public" | "private" | "">("");

  const previewData = useMemo(() => ({
    businessName: businessName.trim() || "Your Cleaning Business",
    businessEmail: businessEmail.trim(),
    businessPhone: businessPhone.trim(),
    serviceArea: serviceArea.trim(),
    availabilityUrl: normalizedUrl(availabilityUrl),
    bookingUrl: normalizedUrl(bookingUrl),
    pricePerSqft,
    minimumPrice,
    quoteSettings: { currency, serviceMultipliers, conditionMultipliers, frequencyDiscounts, extraPrices },
  }), [businessName, businessEmail, businessPhone, serviceArea, availabilityUrl, bookingUrl, pricePerSqft, minimumPrice, currency, serviceMultipliers, conditionMultipliers, frequencyDiscounts, extraPrices]);

  const updatePrice = (type: BuildingType, value: number) => {
    setPricePerSqft((old) => ({ ...old, [type]: Math.max(0, value || 0) }));
  };

  async function generateQuoteLink() {
    setError("");
    if (!businessName.trim()) { setError("Please enter your business name."); return; }
if (
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    businessEmail.trim()
  )
) {
  setError("Please enter a valid business email address.");
  return;
}
    if (availabilityUrl.trim() && !normalizedUrl(availabilityUrl)) { setError("Please enter a valid availability link."); return; }
    if (bookingUrl.trim() && !normalizedUrl(bookingUrl)) { setError("Please enter a valid booking link."); return; }

    setSaving(true);
    try {
      const siteId = crypto.randomUUID().slice(0, 8);
      const editToken = crypto.randomUUID().slice(0, 16);
      const payload = {
        siteId,
        editToken,
        businessName: businessName.trim(),
        pricePerSqft,
        minimumPrice,
        // The original five fields above are unchanged. The rest are additive.
        businessEmail: previewData.businessEmail,
        businessPhone: previewData.businessPhone,
        serviceArea: previewData.serviceArea,
        availabilityUrl: previewData.availabilityUrl,
        bookingUrl: previewData.bookingUrl,
        quoteSettings: previewData.quoteSettings,
      };
      const res = await fetch("/api/cleaning/quote-gen/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.subdomain) {
        throw new Error(typeof json.error === "string" ? json.error : "Unable to create your link. Please try again.");
      }
setGeneratedLink(
  `https://${json.subdomain}.simplebookme.com`
);

setEditLink(
  `/cleaning/quote-gen/${siteId}/edit?token=${encodeURIComponent(editToken)}`
);

setActivationUrl(
  typeof json.activationUrl === "string"
    ? json.activationUrl
    : ""
);

setTrialEndsAt(
  typeof json.trialEndsAt === "string"
    ? json.trialEndsAt
    : ""
);

setEmailSent(json.emailSent === true);

setEmailWarning(
  typeof json.emailWarning === "string"
    ? json.emailWarning
    : ""
);

setCopied("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create the link.");
    } finally {
      setSaving(false);
    }
  }

  async function copyText(text: string, which: "public" | "private") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
    } catch {
      setError("Couldn't copy automatically. Please copy the link manually.");
    }
  }

  const absoluteEditLink = editLink && typeof window !== "undefined" ? `${window.location.origin}${editLink}` : editLink;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white px-4 py-12 text-slate-900 sm:px-6 lg:py-16">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">A smarter way to answer "How much?"</span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">Your cleaning quote link, made simple.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">Create a beautiful instant estimate for your customers. Customize your prices, share one link, and make it easier for people to request cleaning.</p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
          <div className="space-y-5">
            <section className={sectionClass}>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">01</span>
                <div><h2 className="font-bold text-slate-900">Business information</h2><p className="text-xs text-slate-500">What customers will see on your quote page.</p></div>
              </div>
              <div className="space-y-4">
                <div><label htmlFor="owner-name" className={labelClass}>Business name *</label><input id="owner-name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} maxLength={100} placeholder="e.g. Bright Home Cleaning" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label htmlFor="owner-email" className={labelClass}>Contact email *</label><input
  id="owner-email"
  type="email"
  required
  value={businessEmail}
  onChange={(e) => setBusinessEmail(e.target.value)}
  className={inputClass}
  placeholder="hello@yourbusiness.com"
  maxLength={160}
/></div>
                  <div><label htmlFor="owner-phone" className={labelClass}>Phone (optional)</label><input id="owner-phone" type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} className={inputClass} placeholder="Your business number" maxLength={40} /></div>
                </div>
                <p className="text-xs leading-5 text-slate-500">Add an email to let customers open a prefilled quote request in their email app. Automated lead emails are not connected yet.</p>
                <div><label htmlFor="owner-area" className={labelClass}>Service area (optional)</label><input id="owner-area" value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} className={inputClass} maxLength={140} placeholder="e.g. Vancouver and North Shore" /></div>
                <div><label htmlFor="owner-currency" className={labelClass}>Currency</label>
                  <select id="owner-currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
                    <option value="USD">USD — US dollar</option><option value="CAD">CAD — Canadian dollar</option><option value="GBP">GBP — British pound</option><option value="EUR">EUR — Euro</option>
                    <option value="AUD">AUD — Australian dollar</option><option value="ZAR">ZAR — South African rand</option><option value="PHP">PHP — Philippine peso</option>
                  </select>
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">02</span>
                <div><h2 className="font-bold text-slate-900">Set your base prices</h2><p className="text-xs text-slate-500">Same square-foot pricing you already use.</p></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {BUILDING_IDS.map((id) => (
                  <div key={id}><label className={labelClass} htmlFor={`rate-${id}`}>{BUILDING_LABELS[id]}</label>
                    <div className="relative"><span className="pointer-events-none absolute left-3.5 top-3 text-sm text-slate-500">$</span>
                      <input id={`rate-${id}`} type="number" min="0" step="0.01" value={pricePerSqft[id]} onChange={(e) => updatePrice(id, Number(e.target.value))}
                        className={`${inputClass} pl-7`} /></div>
                    <p className="mt-1 text-[11px] text-slate-400">Per sq ft · {currency}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4"><label htmlFor="min-price" className={labelClass}>Minimum job price ({currency})</label>
                <input id="min-price" type="number" min="0" step="1" value={minimumPrice} onChange={(e) => setMinimumPrice(Math.max(0, Number(e.target.value) || 0))} className={inputClass} />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">For standard, one-time cleaning in normal condition, estimates use the greater of square footage × rate or your minimum price.</p>
            </section>

            <section className={sectionClass}>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">03</span>
                <div><h2 className="font-bold text-slate-900">Customize quote options</h2><p className="text-xs text-slate-500">Useful defaults — adjust to match your business.</p></div>
              </div>
              <div className="space-y-3">
                <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-800">Cleaning type multipliers <span className="float-right text-xs font-normal text-slate-500 group-open:hidden">Edit ▾</span></summary>
                  <p className="mb-3 mt-2 text-xs text-slate-500">1.50 means 50% more than standard cleaning.</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {SERVICE_IDS.map((id) => <label key={id} className="text-xs font-medium text-slate-600">{SERVICES[id]}
                      <input type="number" min="0" max="10" step="0.05" value={serviceMultipliers[id]} onChange={(e) => setServiceMultipliers((old) => ({ ...old, [id]: Math.max(0, Number(e.target.value) || 0) }))} className={`mt-1.5 ${inputClass}`} />
                    </label>)}
                  </div>
                </details>
                <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-800">Cleaning condition multipliers <span className="float-right text-xs font-normal text-slate-500 group-open:hidden">Edit ▾</span></summary>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {CONDITION_IDS.map((id) => <label key={id} className="text-xs font-medium text-slate-600">{CONDITIONS[id]}
                      <input type="number" min="0" max="10" step="0.05" value={conditionMultipliers[id]} onChange={(e) => setConditionMultipliers((old) => ({ ...old, [id]: Math.max(0, Number(e.target.value) || 0) }))} className={`mt-1.5 ${inputClass}`} />
                    </label>)}
                  </div>
                </details>
                <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-800">Recurring service discounts <span className="float-right text-xs font-normal text-slate-500 group-open:hidden">Edit ▾</span></summary>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {FREQUENCY_IDS.map((id) => <label key={id} className="text-xs font-medium text-slate-600">{FREQUENCIES[id]}
                      <div className="relative mt-1.5"><input type="number" min="0" max="100" step="1" value={frequencyDiscounts[id]} onChange={(e) => setFrequencyDiscounts((old) => ({ ...old, [id]: Math.min(100, Math.max(0, Number(e.target.value) || 0)) }))} className={`${inputClass} pr-7`} /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">%</span></div>
                    </label>)}
                  </div>
                </details>
                <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-800">Extra service prices <span className="float-right text-xs font-normal text-slate-500 group-open:hidden">Edit ▾</span></summary>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {EXTRA_IDS.map((id) => <label key={id} className="text-xs font-medium text-slate-600">{EXTRAS[id]}
                      <input type="number" min="0" step="1" value={extraPrices[id]} onChange={(e) => setExtraPrices((old) => ({ ...old, [id]: Math.max(0, Number(e.target.value) || 0) }))} className={`mt-1.5 ${inputClass}`} />
                    </label>)}
                  </div>
                </details>
              </div>
            </section>

            <section className={sectionClass}>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">04</span>
                <div><h2 className="font-bold text-slate-900">Connect your booking tools</h2><p className="text-xs text-slate-500">Optional links to pages you already have.</p></div>
              </div>
              <div className="space-y-4">
                <div><label htmlFor="owner-availability" className={labelClass}>Availability page link</label><input id="owner-availability" type="url" value={availabilityUrl} onChange={(e) => setAvailabilityUrl(e.target.value)} placeholder="https://your-availability-page..." className={inputClass} /></div>
                <div><label htmlFor="owner-booking" className={labelClass}>Booking page link</label><input id="owner-booking" type="url" value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} placeholder="https://your-booking-page..." className={inputClass} /></div>
                <p className="text-xs leading-5 text-slate-500">Customers can request a preferred date in the quote form and visit your existing calendar. This does not automatically check available slots or reserve an appointment yet.</p>
              </div>
            </section>

            <section className="rounded-3xl bg-slate-900 p-5 text-white shadow-lg sm:p-6">
              <h2 className="text-lg font-bold">Your shareable quote page is almost ready</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">Review the preview, then generate your public link and private edit link.</p>
              {error && <p role="alert" className="mt-4 rounded-xl bg-rose-900/40 p-3 text-sm text-rose-100">{error}</p>}
              <button type="button" disabled={saving || !!generatedLink} onClick={generateQuoteLink} className="mt-5 w-full rounded-xl bg-indigo-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? "Creating your link..." : "Generate Instant Quote Link →"}
              </button>
              <p className="mt-3 text-center text-xs text-slate-400">Your pricing rules stay editable through your private link, once the edit page supports the new settings.</p>
            </section>
          </div>

          <aside className="lg:sticky lg:top-5">
            <div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900">Customer preview</h2><p className="text-xs text-slate-500">Try all four steps before publishing. Form edits do not update an already-created link.</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Live preview</span></div>
            <div className="max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <CleaningGetQuotePage compact data={previewData} />
            </div>
          </aside>
        </div>


{generatedLink && (
  <section className="mt-10 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm sm:p-7">

    {/* HEADER */}
    <div className="mb-5">
      <h2 className="text-xl font-bold text-slate-900">
        Your links are ready!
      </h2>

      <p className="mt-1 text-sm text-slate-600">
        Your Cleaning Quote Page has been created successfully.
        Save your private edit link somewhere safe.
      </p>
    </div>

    {/* PUBLIC AND PRIVATE LINKS */}
    <div className="grid gap-4 lg:grid-cols-2">

      {/* PUBLIC LINK */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">
          Public quote link
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Share this link with your customers.
        </p>

        <a
          href={generatedLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block break-all text-sm text-indigo-700 underline underline-offset-2"
        >
          {generatedLink}
        </a>

        <button
          type="button"
          onClick={() => copyText(generatedLink, "public")}
          className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          {copied === "public"
            ? "Copied ✓"
            : "Copy public link"}
        </button>
      </div>

      {/* PRIVATE EDIT LINK */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">
          Private edit link
        </p>

        <p className="mt-1 text-xs text-rose-600">
          Keep this link private. Anyone with access may
          be able to modify your settings.
        </p>

        <a
          href={editLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block break-all text-sm text-indigo-700 underline underline-offset-2"
        >
          {absoluteEditLink}
        </a>

        <button
          type="button"
          onClick={() => copyText(absoluteEditLink, "private")}
          className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          {copied === "private"
            ? "Copied ✓"
            : "Copy private link"}
        </button>
      </div>
    </div>

    {/* 14-DAY FREE TRIAL */}
    {trialEndsAt && (
      <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <span className="text-xl">🎉</span>

          <div>
            <h3 className="font-bold text-indigo-950">
              Your 14-day free trial has started!
            </h3>

            <p className="mt-1 text-sm text-indigo-800">
              Your quote page is ready to share.
              No credit card is required during the trial.
            </p>

            <p className="mt-2 text-sm font-semibold text-indigo-900">
              Trial expires:{" "}
              {new Date(trialEndsAt).toLocaleDateString(
                undefined,
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
          </div>
        </div>
      </div>
    )}

    {/* RESEND EMAIL STATUS */}
    {emailSent === true && (
      <div
        role="status"
        className="mt-5 rounded-xl border border-emerald-200 bg-white p-4"
      >
        <p className="text-sm font-semibold text-emerald-800">
          ✓ Your links have been emailed!
        </p>

        <p className="mt-1 text-sm text-slate-600">
          We've submitted your public, private, and
          activation links for delivery to{" "}
          <span className="font-semibold">
            {businessEmail}
          </span>.
          Please check your inbox and spam folder.
        </p>
      </div>
    )}

    {emailSent === false && (
      <div
        role="alert"
        className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"
      >
        <p className="text-sm font-semibold text-amber-900">
          Your page was created, but the email could
          not be sent.
        </p>

        <p className="mt-1 text-sm text-amber-800">
          {emailWarning ||
            "Please save your public, private, and activation links manually."}
        </p>
      </div>
    )}

    {/* STRIPE ACTIVATION */}
    {activationUrl && (
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="max-w-xl">
            <h3 className="text-lg font-bold text-slate-900">
              Keep your Cleaning Quote Page active
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enjoy your 14-day free trial.
              Activate your page anytime with a
              one-time payment and keep using your
              existing public and private links.
            </p>

            <p className="mt-2 text-xs font-medium text-slate-500">
              No monthly subscription.
            </p>
          </div>

          <a
            href={activationUrl}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Activate Your Page →
          </a>
        </div>
      </div>
    )}

    {/* QR CODE GENERATOR */}
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200 pt-5">
      <p className="text-sm text-slate-600">
        Want a QR code for your new quote link?
      </p>

      <a
        href={`/qr-code-generator?url=${encodeURIComponent(
          generatedLink
        )}`}
        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        Generate QR Code
      </a>
    </div>

  </section>
)}


        <div className="mx-auto mt-20 max-w-4xl space-y-9 text-slate-700">
          {seoSections.map((section) => (
            <section key={section.title}><h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900">{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph} className="mb-3 text-base leading-8">{paragraph}</p>)}
            </section>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-4xl rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Want to turn quotes into bookings?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">Create a full booking website and give customers another way to request appointments.</p>
          <button type="button" onClick={() => router.push("/setup")} className="mt-6 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white transition hover:bg-indigo-700">Create Your Booking Website</button>
        </div>
      </div>
    </main>
  );
}
