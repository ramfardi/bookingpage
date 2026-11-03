"use client";

import { useMemo, useState } from "react";

type Props = { data: any; compact?: boolean };
type BuildingType = "apartment" | "townhouse" | "house" | "commercial";
type CleaningType = "standard" | "deep" | "move";
type Condition = "normal" | "moderate" | "heavy";
type Frequency = "once" | "weekly" | "biweekly" | "monthly";
type ExtraKey = "oven" | "fridge" | "windows" | "petHair";

type QuoteSettings = {
  currency?: string;
  serviceMultipliers?: Partial<Record<CleaningType, number>>;
  conditionMultipliers?: Partial<Record<Condition, number>>;
  frequencyDiscounts?: Partial<Record<Frequency, number>>;
  extraPrices?: Partial<Record<ExtraKey, number>>;
};

const BUILDINGS: { id: BuildingType; label: string; icon: string; image: string; description: string }[] = [
  { id: "apartment", label: "Condo / Apartment", icon: "🏢", image: "/images/cleaning_quote/apartment.webp", description: "Condo or apartment" },
  { id: "townhouse", label: "Townhouse", icon: "🏘️", image: "/images/cleaning_quote/townhouse.webp", description: "Multi-level attached home" },
  { id: "house", label: "Detached home", icon: "🏡", image: "/images/cleaning_quote/house.webp", description: "Single-family house" },
  { id: "commercial", label: "Office / Commercial", icon: "🏬", image: "/images/cleaning_quote/commercial.webp", description: "Business or workspace" },
];
const DEFAULT_SQFT: Record<BuildingType, number> = {
  apartment: 800, townhouse: 1200, house: 2000, commercial: 3000,
};
const DEFAULT_RATES: Record<BuildingType, number> = {
  apartment: 0.12, townhouse: 0.14, house: 0.16, commercial: 0.18,
};
const SERVICE_OPTIONS: { id: CleaningType; name: string; description: string }[] = [
  { id: "standard", name: "Standard cleaning", description: "Routine cleaning and upkeep" },
  { id: "deep", name: "Deep cleaning", description: "More detailed, intensive cleaning" },
  { id: "move", name: "Move-in / move-out", description: "Thorough empty-home cleaning" },
];
const FREQUENCY_OPTIONS: { id: Frequency; label: string }[] = [
  { id: "once", label: "One-time" }, { id: "weekly", label: "Weekly" },
  { id: "biweekly", label: "Every 2 weeks" }, { id: "monthly", label: "Monthly" },
];
const CONDITION_OPTIONS: { id: Condition; label: string }[] = [
  { id: "normal", label: "Generally tidy" },
  { id: "moderate", label: "Needs extra attention" },
  { id: "heavy", label: "Heavy buildup" },
];
const EXTRAS: { id: ExtraKey; label: string; description: string }[] = [
  { id: "oven", label: "Inside oven", description: "Detailed oven cleaning" },
  { id: "fridge", label: "Inside fridge", description: "Shelves and interior" },
  { id: "windows", label: "Interior windows", description: "Accessible interior glass" },
  { id: "petHair", label: "Extra pet hair", description: "Additional fur removal" },
];

const FALLBACK_MULTIPLIERS: Record<CleaningType, number> = { standard: 1, deep: 1.5, move: 1.7 };
const FALLBACK_CONDITIONS: Record<Condition, number> = { normal: 1, moderate: 1.15, heavy: 1.3 };
const FALLBACK_DISCOUNTS: Record<Frequency, number> = { once: 0, weekly: 15, biweekly: 10, monthly: 5 };
const FALLBACK_EXTRAS: Record<ExtraKey, number> = { oven: 30, fridge: 25, windows: 40, petHair: 20 };

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const secondaryButton = "rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";
const primaryButton = "rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50";

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function PropertyCard({
  item, selected, onSelect,
}: {
  item: (typeof BUILDINGS)[number]; selected: boolean; onSelect: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`overflow-hidden rounded-2xl border text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        selected ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100" : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
      }`}
    >
      <div className="relative flex h-24 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 sm:h-28">
        <span aria-hidden className="text-4xl">{item.icon}</span>
        {/* Place your own images in public/images/cleaning_quote/ later. Missing files show the icon above. */}
        <img
          src={item.image}
          alt=""
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        />
        {selected && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-sm" aria-hidden>✓</span>
        )}
      </div>
      <div className="p-3">
        <div className="text-sm font-semibold text-slate-900">{item.label}</div>
        <div className="mt-0.5 text-xs text-slate-500">{item.description}</div>
      </div>
    </button>
  );
}

export default function CleaningGetQuotePage({ data, compact = false }: Props) {
  const settings: QuoteSettings = data?.quoteSettings || {};
  const currency = settings.currency || "USD";
  const pricing = { ...DEFAULT_RATES, ...(data?.pricePerSqft || {}) };
  const minimumPrice = Math.max(0, Number(data?.minimumPrice ?? 80) || 0);
  const serviceMultipliers = { ...FALLBACK_MULTIPLIERS, ...(settings.serviceMultipliers || {}) };
  const conditionMultipliers = { ...FALLBACK_CONDITIONS, ...(settings.conditionMultipliers || {}) };
  const frequencyDiscounts = { ...FALLBACK_DISCOUNTS, ...(settings.frequencyDiscounts || {}) };
  const extraPrices = { ...FALLBACK_EXTRAS, ...(settings.extraPrices || {}) };
  const businessEmail = String(data?.businessEmail || "").trim();
  const businessPhone = String(data?.businessPhone || "").trim();
  const availabilityUrl = String(data?.availabilityUrl || "").trim();
  const bookingUrl = String(data?.bookingUrl || "").trim();

  const [step, setStep] = useState(1);
  const [type, setType] = useState<BuildingType>("house");
  const [sqft, setSqft] = useState(2000);
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [location, setLocation] = useState("");
  const [service, setService] = useState<CleaningType>("standard");
  const [condition, setCondition] = useState<Condition>("normal");
  const [frequency, setFrequency] = useState<Frequency>("once");
  const [emptyHome, setEmptyHome] = useState(false);
  const [extras, setExtras] = useState<ExtraKey[]>([]);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredWindow, setPreferredWindow] = useState("Flexible");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState("");
  const [copied, setCopied] = useState(false);

  const estimate = useMemo(() => {
    const rate = Math.max(0, Number(pricing[type]) || 0);
    const base = Math.max(Math.max(0, sqft) * rate, minimumPrice);
    const serviceTotal = base * Math.max(0, Number(serviceMultipliers[service]) || 0);
    const conditionTotal = serviceTotal * Math.max(0, Number(conditionMultipliers[condition]) || 0);
    const discount = conditionTotal * Math.min(100, Math.max(0, Number(frequencyDiscounts[frequency]) || 0)) / 100;
    const extraTotal = extras.reduce((sum, key) => sum + Math.max(0, Number(extraPrices[key]) || 0), 0);
    const total = Math.max(minimumPrice, conditionTotal - discount + extraTotal);
    return { base, serviceAndConditionAdjustment: conditionTotal - base, discount, extraTotal, total };
  }, [pricing, type, sqft, minimumPrice, serviceMultipliers, conditionMultipliers, frequencyDiscounts, extraPrices, service, condition, frequency, extras]);

  function chooseType(next: BuildingType) {
    setType(next);
    setSqft(DEFAULT_SQFT[next]);
    setValidationError("");
  }

  function goNext() {
    setValidationError("");
    if (step === 1 && !location.trim()) {
      setValidationError("Please enter your neighbourhood, city, or postal code.");
      return;
    }
    setStep((current) => Math.min(4, current + 1));
  }

  const requestSummary = [
    `Cleaning request for ${data?.businessName || "your cleaning business"}`,
    "",
    `Estimate: ${money(estimate.total, currency)} (subject to confirmation)`,
    `Property: ${BUILDINGS.find((b) => b.id === type)?.label}`,
    `Size: ${sqft} sq ft`,
    ...(type !== "commercial" ? [`Bedrooms: ${bedrooms}`, `Bathrooms: ${bathrooms}`] : []),
    `Location / postal code: ${location || "Not provided"}`,
    `Cleaning: ${SERVICE_OPTIONS.find((x) => x.id === service)?.name}`,
    `Condition: ${CONDITION_OPTIONS.find((x) => x.id === condition)?.label}`,
    `Home is empty: ${emptyHome ? "Yes" : "No"}`,
    `Frequency: ${FREQUENCY_OPTIONS.find((x) => x.id === frequency)?.label}`,
    `Extras: ${extras.length ? extras.map((x) => EXTRAS.find((e) => e.id === x)?.label).join(", ") : "None"}`,
    `Preferred date: ${preferredDate || "Flexible"}`,
    `Preferred arrival: ${preferredWindow}`,
    "",
    `Customer: ${customerName}`,
    `Email: ${customerEmail || "Not provided"}`,
    `Phone: ${customerPhone || "Not provided"}`,
    `Notes: ${notes || "None"}`,
    "",
    "This is an estimate and appointment request, not a confirmed booking.",
  ].join("\n");

  function sendRequest() {
    setValidationError("");
    if (!customerName.trim()) {
      setValidationError("Please enter your name.");
      return;
    }
    if (!customerEmail.trim() && !customerPhone.trim()) {
      setValidationError("Please provide an email address or phone number.");
      return;
    }
    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setValidationError("Please enter a valid email address.");
      return;
    }
    if (!businessEmail) {
      setValidationError("The cleaner has not configured an email address yet. Copy your request below instead.");
      return;
    }
    // Opens the customer's email app. Automatic sending/storage requires a future API endpoint.
    const subject = encodeURIComponent(`Cleaning request — ${customerName.trim()}`);
    const body = encodeURIComponent(requestSummary);
    window.location.href = `mailto:${businessEmail}?subject=${subject}&body=${body}`;
  }

  async function copyRequest() {
    try {
      await navigator.clipboard.writeText(requestSummary);
      setCopied(true);
    } catch {
      setValidationError("Unable to copy automatically. Please use your browser's copy option.");
    }
  }

  return (
    <section className={`${compact ? "rounded-2xl bg-slate-50 p-3 sm:p-4" : "min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 px-4 py-10 sm:px-6"}`}>
      <div className={`mx-auto w-full ${compact ? "max-w-2xl" : "max-w-2xl"}`}>
        <header className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-xl">✦</div>
          <h1 className={`${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"} font-bold tracking-tight text-slate-950`}>
            {data?.businessName || "Cleaning Quote"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">An easy estimate, tailored to your space.</p>
          {data?.serviceArea && <p className="mt-1 text-xs text-slate-400">Serving {data.serviceArea}</p>}
        </header>

        <div className="mb-5 grid grid-cols-4 gap-1.5" aria-label={`Step ${step} of 4`}>
          {["Property", "Cleaning", "Estimate", "Contact"].map((name, i) => (
            <div key={name}>
              <div className={`h-1.5 rounded-full ${step >= i + 1 ? "bg-indigo-600" : "bg-slate-200"}`} />
              <div className={`mt-2 text-center text-[11px] font-medium ${step === i + 1 ? "text-indigo-700" : "text-slate-400"}`}>{name}</div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Tell us about your property</h2>
                <p className="mt-1 text-sm text-slate-500">Start with the space you would like cleaned.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {BUILDINGS.map((building) => (
                  <PropertyCard key={building.id} item={building} selected={type === building.id} onSelect={() => chooseType(building.id)} />
                ))}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="cleaning-sqft" className="text-sm font-semibold text-slate-800">Approximate square footage</label>
                  <span className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-indigo-700">{sqft.toLocaleString()} sq ft</span>
                </div>
                <input id="cleaning-sqft" type="range" min={300} max={6000} step={50} value={Math.min(6000, Math.max(300, sqft))}
                  onChange={(e) => setSqft(Number(e.target.value))} className="mt-4 w-full accent-indigo-600" />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">300 sq ft</span>
                  <label className="flex items-center gap-2 text-xs text-slate-500">Or enter
                    <input aria-label="Exact square footage" type="number" min={1} max={100000} value={sqft}
                      onChange={(e) => setSqft(Math.max(0, Math.min(100000, Number(e.target.value) || 0)))}
                      className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-right text-sm text-slate-900" />
                  </label>
                </div>
              </div>
              {type !== "commercial" && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm font-semibold text-slate-700">Bedrooms
                    <select value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} className={`mt-2 ${inputClass}`}>
                      {[0,1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>{n === 8 ? "8+" : n}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-slate-700">Bathrooms
                    <select value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} className={`mt-2 ${inputClass}`}>
                      {[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>{n === 8 ? "8+" : n}</option>)}
                    </select>
                  </label>
                </div>
              )}
              <div>
                <label htmlFor="cleaning-location" className="block text-sm font-semibold text-slate-700">Neighbourhood, city or postal code <span className="text-rose-500">*</span></label>
                <input id="cleaning-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. North Vancouver or V7L" className={`mt-2 ${inputClass}`} maxLength={120} />
                <p className="mt-1.5 text-xs text-slate-500">No full street address needed for an estimate.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div><h2 className="text-xl font-bold text-slate-900">What kind of cleaning?</h2>
                <p className="mt-1 text-sm text-slate-500">Choose what you need. Your estimate updates automatically.</p></div>
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-slate-800">Cleaning type</legend>
                <div className="space-y-2">
                  {SERVICE_OPTIONS.map((option) => (
                    <button key={option.id} type="button" aria-pressed={service === option.id} onClick={() => setService(option.id)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition ${service === option.id ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"}`}>
                      <span><span className="block text-sm font-semibold text-slate-900">{option.name}</span><span className="block text-xs text-slate-500">{option.description}</span></span>
                      <span className={`ml-3 flex h-5 w-5 items-center justify-center rounded-full border text-xs ${service === option.id ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"}`}>{service === option.id && "✓"}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-slate-800">How often?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {FREQUENCY_OPTIONS.map((option) => (
                    <button key={option.id} type="button" aria-pressed={frequency === option.id} onClick={() => setFrequency(option.id)}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${frequency === option.id ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                      {option.label}
                      {Number(frequencyDiscounts[option.id]) > 0 && <span className="ml-1 text-[11px] text-emerald-700">−{frequencyDiscounts[option.id]}%</span>}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">Current condition
                  <select value={condition} onChange={(e) => setCondition(e.target.value as Condition)} className={`mt-2 ${inputClass}`}>
                    {CONDITION_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                  </select>
                </label>
                <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-700">
                  <input type="checkbox" checked={emptyHome} onChange={(e) => setEmptyHome(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
                  Property is empty / vacant
                </label>
              </div>
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-slate-800">Extras <span className="font-normal text-slate-400">(optional)</span></legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {EXTRAS.map((extra) => (
                    <label key={extra.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${extras.includes(extra.id) ? "border-indigo-500 bg-indigo-50" : "border-slate-200"}`}>
                      <input type="checkbox" checked={extras.includes(extra.id)} onChange={(e) => setExtras((old) => e.target.checked ? [...old, extra.id] : old.filter((id) => id !== extra.id))}
                        className="mt-1 h-4 w-4 accent-indigo-600" />
                      <span className="flex-1"><span className="block text-sm font-medium text-slate-900">{extra.label}</span>
                        <span className="block text-xs text-slate-500">{extra.description}</span></span>
                      <span className="text-xs font-semibold text-slate-700">+{money(Number(extraPrices[extra.id]), currency)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div><h2 className="text-xl font-bold text-slate-900">Your personalized estimate</h2>
                <p className="mt-1 text-sm text-slate-500">No commitment. The cleaner will confirm the final price.</p></div>
              <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-center text-white">
                <p className="text-sm text-indigo-100">Estimated cleaning price</p>
                <p className="mt-2 text-4xl font-bold tracking-tight">{money(estimate.total, currency)}</p>
                <p className="mt-2 text-xs text-indigo-100">Estimate only · final price may vary after review</p>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <div className="flex justify-between gap-3 text-slate-600"><span>Base ({sqft.toLocaleString()} sq ft)</span><span>{money(estimate.base, currency)}</span></div>
                <div className="flex justify-between gap-3 text-slate-600"><span>Cleaning type / condition</span><span>{estimate.serviceAndConditionAdjustment >= 0 ? "+" : "−"}{money(Math.abs(estimate.serviceAndConditionAdjustment), currency)}</span></div>
                {estimate.discount > 0 && <div className="flex justify-between gap-3 text-emerald-700"><span>Recurring service discount</span><span>−{money(estimate.discount, currency)}</span></div>}
                {estimate.extraTotal > 0 && <div className="flex justify-between gap-3 text-slate-600"><span>Selected extras</span><span>+{money(estimate.extraTotal, currency)}</span></div>}
                <div className="border-t border-slate-200 pt-2 text-xs text-slate-500">Minimum charges may apply. Taxes and travel fees, if any, are not included unless the cleaner confirms otherwise.</div>
              </div>
              <div className="space-y-3">
                <div><h3 className="text-base font-semibold text-slate-900">Preferred appointment <span className="font-normal text-slate-400">(optional)</span></h3>
                  <p className="mt-1 text-xs text-slate-500">Your selection is a request, not a confirmed reservation.</p></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">Preferred date
                    <input type="date" min={localToday()} value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} className={`mt-2 ${inputClass}`} />
                  </label>
                  <label className="text-sm font-medium text-slate-700">Arrival window
                    <select value={preferredWindow} onChange={(e) => setPreferredWindow(e.target.value)} className={`mt-2 ${inputClass}`}>
                      <option>Flexible</option><option>Morning (8 AM–12 PM)</option><option>Afternoon (12–5 PM)</option><option>Evening (5–9 PM)</option>
                    </select>
                  </label>
                </div>
                {/^https?:\/\//i.test(availabilityUrl) && (
                  <a href={availabilityUrl} target="_blank" rel="noopener noreferrer" className="inline-flex text-sm font-semibold text-indigo-700 underline underline-offset-2">View the cleaner’s published availability ↗</a>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div><h2 className="text-xl font-bold text-slate-900">Request this cleaning</h2>
                <p className="mt-1 text-sm text-slate-500">Share your details so the cleaner can follow up and confirm.</p></div>
              <div className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3">
                <span className="text-sm text-indigo-800">Your estimated price</span>
                <strong className="text-xl text-indigo-900">{money(estimate.total, currency)}</strong>
              </div>
              <div>
                <label htmlFor="quote-name" className="block text-sm font-semibold text-slate-700">Your name *</label>
                <input id="quote-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} autoComplete="name" className={`mt-2 ${inputClass}`} placeholder="Full name" maxLength={100} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><label htmlFor="quote-email" className="block text-sm font-semibold text-slate-700">Email</label>
                  <input id="quote-email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} autoComplete="email" className={`mt-2 ${inputClass}`} placeholder="you@example.com" maxLength={160} />
                </div>
                <div><label htmlFor="quote-phone" className="block text-sm font-semibold text-slate-700">Phone</label>
                  <input id="quote-phone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} autoComplete="tel" className={`mt-2 ${inputClass}`} placeholder="Your phone number" maxLength={40} />
                </div>
              </div>
              <p className="text-xs text-slate-500">Provide at least one: email or phone.</p>
              <div><label htmlFor="quote-notes" className="block text-sm font-semibold text-slate-700">Special instructions <span className="font-normal text-slate-400">(optional)</span></label>
                <textarea id="quote-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={`mt-2 ${inputClass}`} placeholder="Anything else the cleaner should know?" maxLength={1500} />
              </div>
              <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                {businessEmail ? "Clicking below opens your email app with the request ready to send. You must press Send there; this does not automatically book a slot." : "This business has not set an email address for requests yet. You can copy the quote details and contact them separately."}
              </p>
              {businessEmail ? (
                <button type="button" onClick={sendRequest} className={`${primaryButton} w-full`}>Continue to email request →</button>
              ) : (
                <button type="button" onClick={copyRequest} className={`${primaryButton} w-full`}>{copied ? "Request copied ✓" : "Copy quote request"}</button>
              )}
              {businessPhone && <p className="text-center text-xs text-slate-500">Or call the cleaner: <a className="font-semibold text-indigo-700 underline" href={`tel:${businessPhone.replace(/[^+\d]/g, "")}`}>{businessPhone}</a></p>}
              {/^https?:\/\//i.test(bookingUrl) && <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-sm font-semibold text-indigo-700 underline underline-offset-2">Visit booking page ↗</a>}
            </div>
          )}

          {validationError && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">{validationError}</p>}
          <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={() => { setValidationError(""); setStep((current) => Math.max(1, current - 1)); }} disabled={step === 1}
              className={`${secondaryButton} ${step === 1 ? "invisible" : ""}`}>← Back</button>
            {step < 4 ? <button type="button" onClick={goNext} className={primaryButton}>{step === 3 ? "Request this cleaning →" : "Continue →"}</button> : <span className="text-xs text-slate-400">Step 4 of 4</span>}
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-slate-400">Powered by <span className="font-semibold text-slate-500">SimpleBookMe</span></p>
      </div>
    </section>
  );
}
