"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { templates } from "@/app/templates";

type TemplateId =
  | "hairsalon"
  | "cleaning"
  | "beauty"
  | "fitness"
  | "home"
  | "auto"
  | "accounting"
  | "pet"
  | "photo";

type PresetId = TemplateId | "custom";

type Contact = {
  email: string;
  phone: string;
  address: string;
};

type PricingRow = {
  id: string;
  name: string;
  price: string;
  description?: string;
};

type PricingData = {
  businessName: string;
  templateId: PresetId;
  currency: string;
  pricing: {
    title: string;
    rows: PricingRow[];
  };
  contact: Contact;
  logoUrl: string;
  logoDataUrl: string;
  bookingUrl: string;
  notes: string;
};

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

const CURRENCIES = [
  "CAD",
  "USD",
  "GBP",
  "EUR",
  "AUD",
  "NZD",
  "ZAR",
  "PHP",
  "SGD",
  "INR",
  "AED",
];

const inputClass =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeBookingUrl(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) return "";

  if (
    /^[a-z][a-z0-9+.-]*:/i.test(trimmed) &&
    !/^https?:\/\//i.test(trimmed)
  ) {
    return null;
  }

  try {
    const url = new URL(
      /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`
    );

    if (
      !["http:", "https:"].includes(url.protocol) ||
      !url.hostname.includes(".") ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function safeLogo(data: PricingData): string {
  const uploadedLogo = normalizeBookingUrl(data.logoUrl);

  if (uploadedLogo) return uploadedLogo;

  return /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(
    data.logoDataUrl
  )
    ? data.logoDataUrl
    : "";
}

function parsePricingData(value: unknown): PricingData {
  if (
    !isRecord(value) ||
    !isRecord(value.pricing) ||
    !Array.isArray(value.pricing.rows)
  ) {
    throw new Error("The saved pricing data is invalid.");
  }

  const seenIds = new Set<string>();

  const rows = value.pricing.rows.map((row): PricingRow => {
    if (
      !isRecord(row) ||
      typeof row.name !== "string" ||
      typeof row.price !== "string"
    ) {
      throw new Error("The saved service list is invalid.");
    }

    let id = text(row.id);

    if (!id || seenIds.has(id)) {
      id = crypto.randomUUID();
    }

    seenIds.add(id);

    return {
      id,
      name: row.name,
      price: row.price,
	  description: text(row.description),
    };
  });

  const contact = isRecord(value.contact) ? value.contact : {};

  const preset = PRESETS.find(
    (item) => item.value === value.templateId
  );

  return {
    businessName: text(value.businessName),
    templateId: preset?.value ?? "custom",
    currency: text(value.currency) || "CAD",
    pricing: {
      title: text(value.pricing.title) || "Services & Pricing",
      rows,
    },
    contact: {
      email: text(contact.email),
      phone: text(contact.phone),
      address: text(contact.address),
    },
    logoUrl: text(value.logoUrl),
    logoDataUrl: text(value.logoDataUrl),
    bookingUrl: text(value.bookingUrl),
    notes: text(value.notes),
  };
}

function LoadingState() {
  return (
    <div role="status" className="p-10 text-center text-slate-500">
      Loading pricing page…
    </div>
  );
}

export default function EditPricingPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <EditPricingRoute />
    </Suspense>
  );
}

function EditPricingRoute() {
  const params = useParams();
  const searchParams = useSearchParams();

  const siteId =
    typeof params.siteId === "string" ? params.siteId : "";

  const token = searchParams.get("token") || "";

  // Remount the editor if the page ID or token changes.
  return (
    <PricingEditor
      key={JSON.stringify([siteId, token])}
      siteId={siteId}
      token={token}
    />
  );
}

function PricingEditor({
  siteId,
  token,
}: {
  siteId: string;
  token: string;
}) {
  const [data, setData] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState("");
  const [message, setMessage] = useState("");
  const [presetToLoad, setPresetToLoad] =
    useState<PresetId>("custom");

  const logoInput = useRef<HTMLInputElement>(null);
  const logoRequest = useRef(0);
  const logoBusy = useRef(false);
  const saveInProgress = useRef(false);
  const saveController = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      if (!siteId || !token) {
        setError("This edit link is missing its page ID or access token.");
        setLoading(false);
        return;
      }

      try {
        const query = new URLSearchParams({ siteId, token });

        const response = await fetch(`/api/pricing_page/get?${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const result: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            isRecord(result) && typeof result.error === "string"
              ? result.error
              : "Could not load your pricing page."
          );
        }

        const savedData = parsePricingData(result);

        if (controller.signal.aborted) return;

        setData(savedData);
        setPresetToLoad(savedData.templateId);
      } catch (failure) {
        if (!controller.signal.aborted) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not load your pricing page."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      controller.abort();
      saveController.current?.abort();
      ++logoRequest.current;
      logoBusy.current = false;
    };
  }, [siteId, token]);

  function clearFeedback() {
    setMessage("");
    setError("");
  }

  function updateField(
    field: "businessName" | "currency" | "bookingUrl" | "notes",
    value: string
  ) {
    clearFeedback();

    setData((previous) =>
      previous ? { ...previous, [field]: value } : previous
    );
  }

  function updateContact(field: keyof Contact, value: string) {
    clearFeedback();

    setData((previous) =>
      previous
        ? {
            ...previous,
            contact: {
              ...previous.contact,
              [field]: value,
            },
          }
        : previous
    );
  }

  function updateService(
    id: string,
    field: "name" | "price"| "description",
    value: string
  ) {
    clearFeedback();

    setData((previous) =>
      previous
        ? {
            ...previous,
            pricing: {
              ...previous.pricing,
              rows: previous.pricing.rows.map((row) =>
                row.id === id ? { ...row, [field]: value } : row
              ),
            },
          }
        : previous
    );
  }

  function addService() {
    clearFeedback();

    const row: PricingRow = {
      id: crypto.randomUUID(),
      name: "",
      price: "",
    };

    setData((previous) =>
      previous
        ? {
            ...previous,
            pricing: {
              ...previous.pricing,
              rows: [...previous.pricing.rows, row],
            },
          }
        : previous
    );
  }

  function removeService(id: string) {
    clearFeedback();

    setData((previous) =>
      previous
        ? {
            ...previous,
            pricing: {
              ...previous.pricing,
              rows: previous.pricing.rows.filter(
                (row) => row.id !== id
              ),
            },
          }
        : previous
    );
  }

  function loadPreset() {
    if (!data) return;

    if (
      data.pricing.rows.length > 0 &&
      !window.confirm(
        "Replace your current service list and prices? Business details and your logo will stay unchanged."
      )
    ) {
      return;
    }

    const rows: PricingRow[] =
      presetToLoad === "custom"
        ? []
        : templates[presetToLoad].defaultData.services.map(
            (name: string) => ({
              id: crypto.randomUUID(),
              name,
              price: "",
            })
          );

    clearFeedback();

    setData((previous) =>
      previous
        ? {
            ...previous,
            templateId: presetToLoad,
            pricing: {
              ...previous.pricing,
              rows,
            },
          }
        : previous
    );
  }

  async function handleLogoChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || saveInProgress.current) return;

    const request = ++logoRequest.current;

    logoBusy.current = true;
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

      const objectUrl = URL.createObjectURL(file);

      try {
        const image = new Image();

        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () =>
            reject(new Error("This image could not be opened."));
          image.src = objectUrl;
        });

        const scale = Math.min(
          1,
          512 / Math.max(image.naturalWidth, image.naturalHeight)
        );

        const canvas = document.createElement("canvas");

        canvas.width = Math.max(
          1,
          Math.round(image.naturalWidth * scale)
        );

        canvas.height = Math.max(
          1,
          Math.round(image.naturalHeight * scale)
        );

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Image processing is unavailable.");
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const logoDataUrl = canvas.toDataURL("image/webp", 0.85);

        if (
          !/^data:image\/(?:png|jpeg|webp);base64,/.test(logoDataUrl)
        ) {
          throw new Error("This image could not be converted.");
        }

        if (logoDataUrl.length > 350_000) {
          throw new Error(
            "The resized logo is still too large. Choose a simpler image."
          );
        }

        if (request !== logoRequest.current) return;

        setData((previous) =>
          previous
            ? {
                ...previous,
                // Clear the uploaded URL so the new logo takes priority.
                logoUrl: "",
                logoDataUrl,
              }
            : previous
        );
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (failure) {
      if (request === logoRequest.current) {
        setLogoError(
          failure instanceof Error
            ? failure.message
            : "Could not prepare the logo."
        );
      }
    } finally {
      if (request === logoRequest.current) {
        logoBusy.current = false;
        setLogoLoading(false);
      }
    }
  }

  function removeLogo() {
    ++logoRequest.current;
    logoBusy.current = false;
    setLogoLoading(false);
    setLogoError("");
    clearFeedback();

    setData((previous) =>
      previous
        ? { ...previous, logoUrl: "", logoDataUrl: "" }
        : previous
    );

    if (logoInput.current) {
      logoInput.current.value = "";
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !data ||
      !token ||
      logoBusy.current ||
      saveInProgress.current
    ) {
      return;
    }

    clearFeedback();

    if (!data.businessName.trim()) {
      setError("Enter your business name.");
      return;
    }

    if (!data.pricing.title.trim()) {
      setError("Enter a heading for your pricing list.");
      return;
    }

    if (!data.pricing.rows.length) {
      setError("Add at least one service.");
      return;
    }

    if (
      data.pricing.rows.some(
        (row) => !row.name.trim() || !row.price.trim()
      )
    ) {
      setError(
        "Enter a name and price for every service, or remove unused services. You can use ‘Contact for quote’ as a price."
      );
      return;
    }

    const email = data.contact.email.trim();

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    const bookingUrl = normalizeBookingUrl(data.bookingUrl);

    if (bookingUrl === null) {
      setError(
        "Enter a valid booking link, such as example.com/book, or leave it blank."
      );
      return;
    }

    const cleanedData: PricingData = {
      ...data,
      businessName: data.businessName.trim(),
      currency: data.currency.trim(),
      bookingUrl,
      notes: data.notes.trim(),
      pricing: {
        title: data.pricing.title.trim(),
        rows: data.pricing.rows.map((row) => ({
          id: row.id,
          name: row.name.trim(),
          price: row.price.trim(),
		  description: row.description?.trim() || "",
        })),
      },
      contact: {
        email,
        phone: data.contact.phone.trim(),
        address: data.contact.address.trim(),
      },
      // Always include both fields to preserve or explicitly remove a logo.
      logoUrl: data.logoUrl,
      logoDataUrl: data.logoDataUrl,
    };

    const controller = new AbortController();
    saveController.current = controller;
    saveInProgress.current = true;
    setSaving(true);

    try {
      const response = await fetch("/api/pricing_page/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          siteId,
          editToken: token,
          data: cleanedData,
        }),
      });

      const result: unknown = await response.json().catch(() => null);

      if (
        !response.ok ||
        !isRecord(result) ||
        result.success !== true ||
        result.error ||
        result.persisted === false
      ) {
        throw new Error(
          isRecord(result) && typeof result.error === "string"
            ? result.error
            : "Your changes could not be saved. Please try again."
        );
      }

      if (controller.signal.aborted) return;

      setData(cleanedData);
      setMessage("Changes saved.");
    } catch (failure) {
      if (!controller.signal.aborted) {
        setError(
          failure instanceof Error
            ? failure.message
            : "Could not save changes."
        );
      }
    } finally {
      saveInProgress.current = false;

      if (!controller.signal.aborted) {
        setSaving(false);
      }
    }
  }

  if (loading) return <LoadingState />;

  if (!data) {
    return (
      <div role="alert" className="p-10 text-center text-red-600">
        {error || "Pricing page not found."}
      </div>
    );
  }

  const logo = safeLogo(data);

  const currencyOptions = Array.from(
    new Set([...CURRENCIES, data.currency])
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit pricing page
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Update your services, prices, and public business details.
            </p>
          </div>

          <a
            href={`/pricing_page/${encodeURIComponent(siteId)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            View public page
          </a>
        </header>

        <form onSubmit={handleSave} className="mt-6">
          <fieldset
            disabled={saving}
            className="min-w-0 space-y-6 disabled:opacity-75"
          >
            {/* BUSINESS DETAILS */}
            <section className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold">
                Business details
              </h2>

              <label className="block text-sm font-medium">
                Business name *
                <input
                  className={inputClass}
                  autoComplete="organization"
                  maxLength={120}
                  required
                  value={data.businessName}
                  onChange={(event) =>
                    updateField("businessName", event.target.value)
                  }
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Email (optional)
                  <input
                    type="email"
                    className={inputClass}
                    autoComplete="email"
                    maxLength={254}
                    value={data.contact.email}
                    onChange={(event) =>
                      updateContact("email", event.target.value)
                    }
                  />
                </label>

                <label className="block text-sm font-medium">
                  Phone number (optional)
                  <input
                    type="tel"
                    className={inputClass}
                    autoComplete="tel"
                    maxLength={50}
                    value={data.contact.phone}
                    onChange={(event) =>
                      updateContact("phone", event.target.value)
                    }
                  />
                </label>
              </div>

              <label className="block text-sm font-medium">
                Address (optional)
                <textarea
                  className={inputClass}
                  autoComplete="street-address"
                  rows={2}
                  maxLength={500}
                  value={data.contact.address}
                  onChange={(event) =>
                    updateContact("address", event.target.value)
                  }
                />
              </label>

              <label className="block text-sm font-medium">
                Booking link (optional)
                <input
                  type="text"
                  inputMode="url"
                  className={inputClass}
                  maxLength={2048}
                  placeholder="yourbusiness.com/book"
                  value={data.bookingUrl}
                  onChange={(event) =>
                    updateField("bookingUrl", event.target.value)
                  }
                />

                <span className="mt-2 block text-xs font-normal text-slate-500">
                  The Book now button opens this link. Leave it empty
                  to hide the button.
                </span>
              </label>

              {/* LOGO */}
              <div>
                <label htmlFor="logo" className="block text-sm font-medium">
                  Business logo (optional)
                </label>

                <p id="logo-help" className="mt-1 text-xs text-slate-500">
                  JPG, PNG, or WebP, up to 5 MB. Your existing logo stays
                  unless you replace or remove it.
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

                {(data.logoUrl || data.logoDataUrl) && (
                  <div className="mt-4 flex items-center gap-4">
                    {logo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo}
                        alt="Business logo preview"
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-xl border bg-white p-2 object-contain"
                      />
                    )}

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

            {/* SERVICES */}
            <section className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold">
                Services & pricing
              </h2>

              <div className="grid gap-4 sm:grid-cols-[1fr_130px]">
                <label className="block text-sm font-medium">
                  Price list heading *
                  <input
                    className={inputClass}
                    required
                    maxLength={100}
                    value={data.pricing.title}
                    onChange={(event) => {
                      const title = event.target.value;
                      clearFeedback();

                      setData((previous) =>
                        previous
                          ? {
                              ...previous,
                              pricing: {
                                ...previous.pricing,
                                title,
                              },
                            }
                          : previous
                      );
                    }}
                  />
                </label>

                <label className="block text-sm font-medium">
                  Currency
                  <select
                    className={inputClass}
                    value={data.currency}
                    onChange={(event) =>
                      updateField("currency", event.target.value)
                    }
                  >
                    {currencyOptions.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <label
                  htmlFor="preset"
                  className="block text-sm font-medium"
                >
                  Replace service list with a preset
                </label>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <select
                    id="preset"
                    className="min-w-0 flex-1 rounded-lg border bg-white px-3 py-2"
                    value={presetToLoad}
                    onChange={(event) =>
                      setPresetToLoad(event.target.value as PresetId)
                    }
                  >
                    {PRESETS.map((preset) => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={loadPreset}
                    className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                  >
                    Load preset
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-600">
                  Loading a preset replaces the service list. Enter your
                  own prices and remove services you do not offer.
                </p>
              </div>

              <div className="space-y-3">
                {data.pricing.rows.map((row, index) => (
                  <div
                    key={row.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-slate-500">
                        Service {index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeService(row.id)}
                        aria-label={`Remove ${row.name || "service"}`}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-sm font-medium">
                        Service name *
                        <input
                          className={inputClass}
                          maxLength={160}
                          value={row.name}
                          placeholder="Service name"
                          onChange={(event) =>
                            updateService(
                              row.id,
                              "name",
                              event.target.value
                            )
                          }
                        />
                      </label>
					  
					  <label className="mt-3 block text-sm font-medium">
					  Service notes (optional)

					  <textarea
						className={inputClass}
						rows={2}
						maxLength={500}
						value={row.description ?? ""}
						placeholder="Additional details about this service"
						onChange={(event) =>
						  updateService(
							row.id,
							"description",
							event.target.value
						  )
						}
					  />
					</label>

                      <label className="block text-sm font-medium">
                        Price ({data.currency}) *
                        <input
                          className={inputClass}
                          maxLength={100}
                          value={row.price}
                          placeholder="50, From 80, or Contact for quote"
                          onChange={(event) =>
                            updateService(
                              row.id,
                              "price",
                              event.target.value
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {data.pricing.rows.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  Add a service or load a preset to get started.
                </p>
              )}

              <button
                type="button"
                onClick={addService}
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                + Add your own service
              </button>

              <label className="block text-sm font-medium">
                Pricing notes (optional)
                <textarea
                  className={inputClass}
                  rows={3}
                  maxLength={2000}
                  value={data.notes}
                  placeholder="e.g. Taxes are extra. Final pricing depends on service requirements."
                  onChange={(event) =>
                    updateField("notes", event.target.value)
                  }
                />
              </label>
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