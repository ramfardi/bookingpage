"use client";

/*
 * Place this file at app/pricing_page/page.tsx.
 * Uses the same templates, image compressor and Supabase client as app/setup.
 *
 * Future API contract:
 * POST /api/pricing_page/create
 * Request: { requestId: string, data: PricingData }
 * Success: { siteId: string, editToken: string }
 * Error:   { error: string } with a non-2xx status.
 * The server should generate the site ID and secret edit token, validate the
 * payload, and deduplicate retries using requestId. Never return edit tokens
 * from the public GET API. Future updates must verify the edit token server-side.
 *
 * Future routes: /pricing/[siteId] and /pricing/[siteId]/edit?token=...
 * This file builds the creation form; those routes and APIs are separate files.
 * Keep the complete data object (including logoUrl) when implementing updates.
 */

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { templates } from "@/app/templates";
import imageCompression from "browser-image-compression";
import { supabaseBrowser } from "@/app/lib/supabase-browser";

type TemplateId =
  | "hairsalon" | "cleaning" | "beauty" | "fitness" | "home"
  | "auto" | "accounting" | "pet" | "photo";
type PresetId = TemplateId | "custom";
type ServiceItem = { id: string; name: string; price: string; enabled: boolean };
type PricingData = {
  businessName: string;
  templateId: PresetId;
  currency: string;
  pricing: { title: string; rows: { id: string; name: string; price: string }[] };
  contact: { email: string; phone: string; address: string };
  logoUrl: string;
  bookingUrl: string;
  notes: string;
};
type CreatedLinks = { publicUrl: string; editUrl: string };

const PRESETS: { value: PresetId; label: string }[] = [
  { value: "hairsalon", label: "Hair Salon" },
  { value: "cleaning", label: "Cleaning" },
  { value: "beauty", label: "Beauty" },
  { value: "fitness", label: "Fitness" },
  { value: "home", label: "Home Services" },
  { value: "auto", label: "Automotive Services" },
  { value: "accounting", label: "Accounting Services" },
  { value: "pet", label: "Pet Services" },
  { value: "photo", label: "Photography Services" },
  { value: "custom", label: "Custom / start from scratch" },
];
const CURRENCIES = ["CAD", "USD", "GBP", "EUR", "AUD", "NZD", "ZAR", "PHP", "SGD", "INR", "AED"];
const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const secondaryClass = "rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50";

function presetServices(id: PresetId): ServiceItem[] {
  if (id === "custom") return [];
  return templates[id].defaultData.services.map((name: string, index: number) => ({
    id: `${id}-${index}`, name, price: "", enabled: false,
  }));
}

function normalizeBookingUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  // Reject other schemes instead of turning them into a misleading HTTPS URL.
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    throw new Error("Please enter an HTTP or HTTPS booking link.");
  }
  const url = new URL(candidate);
  if (!url.hostname.includes(".") || url.username || url.password) {
    throw new Error("Please enter a valid booking website, such as example.com/book.");
  }
  return url.href;
}

export default function PricingPage() {
  const [preset, setPreset] = useState<PresetId>("hairsalon");
  const [services, setServices] = useState<ServiceItem[]>(() => presetServices("hairsalon"));
  const [businessName, setBusinessName] = useState("");
  const [title, setTitle] = useState("Services & Pricing");
  const [currency, setCurrency] = useState("CAD");
  const [contact, setContact] = useState({ email: "", phone: "", address: "" });
  const [logoUrl, setLogoUrl] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [created, setCreated] = useState<CreatedLinks | null>(null);
  const uploadLock = useRef(false);
  const createLock = useRef(false);
  const lastRequest = useRef<{ serialized: string; requestId: string } | null>(null);
  const enabled = services.filter((service) => service.enabled);
  const locked = creating || uploading || Boolean(created);
  let previewBookingUrl = "";
  try { previewBookingUrl = normalizeBookingUrl(bookingUrl); } catch { /* Hide invalid links in preview. */ }

  function updateService(id: string, patch: Partial<ServiceItem>) {
    setServices((current) => current.map((service) => service.id === id ? { ...service, ...patch } : service));
  }

  function changePreset(next: PresetId) {
    if (next === preset) return;
    if (services.some((service) => service.enabled || service.price.trim()) &&
        !window.confirm("Replace this service list with the selected preset? Your business and contact details will stay.")) return;
    setPreset(next);
    setServices(presetServices(next));
    setError("");
  }

  async function uploadLogo(file: File) {
    if (uploadLock.current || createLock.current) return;
    setLogoError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setLogoError("Choose a JPG, PNG, or WebP image."); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLogoError("Choose an image smaller than 10 MB."); return;
    }
    uploadLock.current = true;
    setUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.4, maxWidthOrHeight: 800, useWebWorker: true,
      });
      const extension = compressed.type === "image/png" ? "png" : compressed.type === "image/webp" ? "webp" : "jpg";
      const path = `logos/pricing-${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabaseBrowser.storage
        .from("gallery").upload(path, compressed, { contentType: compressed.type, upsert: false });
      if (uploadError) throw new Error(uploadError.message);
      const { data } = supabaseBrowser.storage.from("gallery").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
    } catch {
      setLogoError("Logo upload failed. Please try again. Your previous logo has been kept.");
    } finally {
      uploadLock.current = false;
      setUploading(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createLock.current || uploadLock.current || created) return;
    setError("");
    if (!businessName.trim()) { setError("Enter your business name."); return; }
    if (!title.trim()) { setError("Enter a heading for your price list."); return; }
    if (!enabled.length) { setError("Select or add at least one service."); return; }
    if (enabled.some((service) => !service.name.trim() || !service.price.trim())) {
      setError("Enter a name and a price for every selected service. You can also use ‘Contact for quote’."); return;
    }
    if (contact.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      setError("Enter a valid contact email address."); return;
    }
    let normalizedUrl: string;
    try { normalizedUrl = normalizeBookingUrl(bookingUrl); }
    catch { setError("Enter a valid booking link, such as example.com/book, or leave it blank."); return; }
    const data: PricingData = {
      businessName: businessName.trim(), templateId: preset, currency,
      pricing: {
        title: title.trim(),
        rows: enabled.map(({ id, name, price }) => ({ id, name: name.trim(), price: price.trim() })),
      },
      contact: { email: contact.email.trim(), phone: contact.phone.trim(), address: contact.address.trim() },
      logoUrl, bookingUrl: normalizedUrl, notes: notes.trim(),
    };
    const serialized = JSON.stringify(data);
    if (lastRequest.current?.serialized !== serialized) {
      lastRequest.current = { serialized, requestId: crypto.randomUUID() };
    }
    createLock.current = true;
    setCreating(true);
    try {
      const response = await fetch("/api/pricing_page/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: lastRequest.current!.requestId, data }),
      });
      const result: unknown = await response.json().catch(() => null);
      const payload = result && typeof result === "object" ? result as Record<string, unknown> : null;
      if (!response.ok) {
        if (response.status === 404 || response.status === 405) {
          throw new Error("Creating links is not available yet. Please try again later.");
        }
        throw new Error(typeof payload?.error === "string" ? payload.error : "Unable to create your pricing page. Please try again.");
      }
      if (typeof payload?.siteId !== "string" || !payload.siteId ||
          typeof payload.editToken !== "string" || !payload.editToken) {
        throw new Error("The server did not return the page ID and edit token. Please retry to recover your links.");
      }
      const publicUrl = `${window.location.origin}/pricing_page/${encodeURIComponent(payload.siteId)}`;
      setCreated({ publicUrl, editUrl: `${publicUrl}/edit?token=${encodeURIComponent(payload.editToken)}` });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to create your pricing page. Please try again.");
    } finally {
      createLock.current = false;
      setCreating(false);
    }
  }

  async function copyLink(value: string) {
    try { await navigator.clipboard.writeText(value); setCopyMessage("Link copied."); }
    catch { setCopyMessage("Could not copy automatically. Select the link and copy it manually."); }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold text-indigo-600">SimpleBookMe</p>
          <h1 className="text-3xl font-bold tracking-tight">Create your pricing page</h1>
          <p className="mt-3 max-w-2xl text-gray-600">Choose your services, add your prices, and share one dedicated link with your clients.</p>
        </header>

        {created && (
          <section className="mb-8 space-y-4 rounded-2xl border border-green-200 bg-green-50 p-6" aria-live="polite">
            <h2 className="text-xl font-semibold">Your pricing page is ready</h2>
            <label className="block text-sm font-medium" htmlFor="public-link">Public pricing link</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input id="public-link" className={inputClass} readOnly value={created.publicUrl} onFocus={(event) => event.target.select()} />
              <button type="button" className={secondaryClass} onClick={() => copyLink(created.publicUrl)}>Copy link</button>
              <a className={secondaryClass} href={created.publicUrl} target="_blank" rel="noopener noreferrer">Open</a>
            </div>
            <label className="block text-sm font-medium" htmlFor="edit-link">Private edit link — save this for later</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input id="edit-link" className={inputClass} readOnly value={created.editUrl} onFocus={(event) => event.target.select()} />
              <button type="button" className={secondaryClass} onClick={() => copyLink(created.editUrl)}>Copy edit link</button>
              <a className={secondaryClass} href={created.editUrl} rel="noreferrer">Edit page</a>
            </div>
            <p className="text-sm text-gray-700">Anyone with the private edit link can change your page. Share only the public link with clients.</p>
            <p className="text-sm" role="status">{copyMessage}</p>
          </section>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-2">
          <form onSubmit={handleCreate} className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7">
            <fieldset disabled={locked} className="min-w-0 space-y-8 disabled:opacity-70">
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">1. Business details</h2>
                <label className="block space-y-1"><span className="text-sm font-medium">Business name *</span>
                  <input className={inputClass} value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your business name" required maxLength={120} autoComplete="organization" />
                </label>
                <div className="space-y-2">
                  <label htmlFor="pricing-logo" className="block text-sm font-medium">Logo (optional)</label>
                  <input id="pricing-logo" className="block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
                    const file = e.target.files?.[0]; e.target.value = ""; if (file) void uploadLogo(file);
                  }} />
                  <p className="text-xs text-gray-500">JPG, PNG, or WebP. Maximum 10 MB; images are compressed before uploading.</p>
                  {logoUrl && <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Business logo" className="h-16 w-16 rounded-lg border object-contain" />
                    <button type="button" className="text-sm text-red-600" onClick={() => setLogoUrl("")}>Remove logo</button>
                  </div>}
                </div>
              </section>

              <section className="space-y-4 border-t pt-6">
                <h2 className="text-xl font-semibold">2. Services & pricing</h2>
                <label className="block space-y-1"><span className="text-sm font-medium">Service preset</span>
                  <select className={inputClass} value={preset} onChange={(e) => changePreset(e.target.value as PresetId)}>
                    {PRESETS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <p className="text-sm text-gray-500">Select the services you offer and enter your own prices. You can rename or remove any service, or add your own.</p>
                <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                  <label className="block space-y-1"><span className="text-sm font-medium">Price list heading *</span>
                    <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} />
                  </label>
                  <label className="block space-y-1"><span className="text-sm font-medium">Currency</span>
                    <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                      {CURRENCIES.map((code) => <option key={code}>{code}</option>)}
                    </select>
                  </label>
                </div>
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className={`rounded-xl border p-3 ${service.enabled ? "border-indigo-200 bg-indigo-50/40" : "border-gray-200"}`}>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="h-4 w-4 shrink-0 accent-indigo-600" checked={service.enabled} aria-label={`Include ${service.name || "this service"}`} onChange={(e) => updateService(service.id, { enabled: e.target.checked })} />
                        <input className={`${inputClass} min-w-0 flex-1`} aria-label="Service name" value={service.name} placeholder="Service name" maxLength={160} onChange={(e) => updateService(service.id, { name: e.target.value })} />
                        <button type="button" className="shrink-0 p-2 text-xl text-red-600" aria-label={`Remove ${service.name || "service"}`} onClick={() => setServices((current) => current.filter((item) => item.id !== service.id))}>×</button>
                      </div>
                      {service.enabled && <label className="mt-3 block space-y-1"><span className="text-xs font-medium text-gray-600">Price ({currency}) *</span>
                        <input className={inputClass} value={service.price} maxLength={100} placeholder="e.g. 50, From 80, 40 / hour, or Contact for quote" onChange={(e) => updateService(service.id, { price: e.target.value })} />
                      </label>}
                    </div>
                  ))}
                </div>
                <button type="button" className="text-sm font-semibold text-indigo-600" onClick={() => setServices((current) => [...current, { id: crypto.randomUUID(), name: "", price: "", enabled: true }])}>+ Add your own service</button>
                <label className="block space-y-1"><span className="text-sm font-medium">Pricing notes (optional)</span>
                  <textarea className={inputClass} rows={3} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Taxes are extra. Final pricing depends on service requirements." />
                </label>
              </section>

              <section className="space-y-4 border-t pt-6">
                <h2 className="text-xl font-semibold">3. Contact & booking</h2>
                <p className="text-sm text-gray-500">Optional. These details will be visible on your public pricing page.</p>
                <label className="block space-y-1"><span className="text-sm font-medium">Email</span>
                  <input type="email" className={inputClass} autoComplete="email" maxLength={254} value={contact.email} onChange={(e) => setContact((current) => ({ ...current, email: e.target.value }))} />
                </label>
                <label className="block space-y-1"><span className="text-sm font-medium">Phone number</span>
                  <input type="tel" className={inputClass} autoComplete="tel" maxLength={50} value={contact.phone} onChange={(e) => setContact((current) => ({ ...current, phone: e.target.value }))} />
                </label>
                <label className="block space-y-1"><span className="text-sm font-medium">Address</span>
                  <textarea className={inputClass} rows={2} autoComplete="street-address" maxLength={500} value={contact.address} onChange={(e) => setContact((current) => ({ ...current, address: e.target.value }))} />
                </label>
                <label className="block space-y-1"><span className="text-sm font-medium">Booking page link</span>
                  <input type="text" inputMode="url" className={inputClass} maxLength={2048} value={bookingUrl} placeholder="yourbusiness.com/book" onChange={(e) => setBookingUrl(e.target.value)} />
                </label>
                <p className="text-xs text-gray-500">Use your SimpleBookMe booking page or another booking website.</p>
              </section>
            </fieldset>
            {uploading && <p role="status" className="mt-4 text-sm text-indigo-600">Uploading logo…</p>}
            {logoError && <p role="alert" className="mt-4 text-sm text-red-600">{logoError}</p>}
            {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {!created && <button type="submit" disabled={locked} className="mt-8 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
              {creating ? "Creating your link…" : "Create my pricing link"}
            </button>}
          </form>

          <aside className="min-w-0 lg:sticky lg:top-8">
            <div className="mb-3 flex items-center justify-between text-sm"><span className="font-semibold text-gray-600">Live preview</span><span className="text-gray-500">{enabled.length} services selected</span></div>
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="bg-indigo-600 px-6 py-8 text-center text-white">
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Business logo" className="mx-auto mb-4 h-20 w-20 rounded-xl bg-white p-2 object-contain" />
                )}
                <h2 className="break-words text-2xl font-bold">{businessName.trim() || "Your business name"}</h2>
                <p className="mt-2 break-words text-indigo-100">{title.trim() || "Services & Pricing"}</p>
              </div>
              <div className="p-6">
                <p className="mb-3 text-right text-xs font-medium text-gray-500">Prices in {currency}</p>
                {!enabled.length ? <p className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">Select a service or add your own to preview your price list.</p> : (
                  <ul className="divide-y divide-gray-100">
                    {enabled.map((service) => <li key={service.id} className="flex items-start justify-between gap-4 py-4">
                      <span className="min-w-0 flex-1 break-words font-medium">{service.name.trim() || "Service name"}</span>
                      <span className="max-w-[50%] break-words text-right text-indigo-700">{service.price.trim() || "Add a price"}</span>
                    </li>)}
                  </ul>
                )}
                {notes.trim() && <p className="mt-5 whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-4 text-sm text-gray-600">{notes}</p>}
                {previewBookingUrl && <a href={previewBookingUrl} target="_blank" rel="noopener noreferrer" className="mt-6 block rounded-xl bg-indigo-600 px-5 py-3 text-center font-semibold text-white hover:bg-indigo-700">Book now</a>}
                {(contact.email.trim() || contact.phone.trim() || contact.address.trim()) && <div className="mt-6 space-y-2 border-t pt-5 text-sm text-gray-600">
                  {contact.email.trim() && <p className="break-words"><span className="font-medium">Email: </span>{contact.email}</p>}
                  {contact.phone.trim() && <p className="break-words"><span className="font-medium">Phone: </span>{contact.phone}</p>}
                  {contact.address.trim() && <p className="whitespace-pre-wrap break-words"><span className="font-medium">Address: </span>{contact.address}</p>}
                </div>}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
