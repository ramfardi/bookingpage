type Props = {
  data: {
    businessName?: string;
    currency?: string;
    pricing?: {
      title?: string;
      rows?: {
        id?: string;
        name: string;
        price: string;
      }[];
    };
    contact?: {
      email?: string;
      phone?: string;
      address?: string;
    };
    logoUrl?: string;
    logoDataUrl?: string;
    bookingUrl?: string;
    notes?: string;
  };
};

function safeWebUrl(value?: string): string {
  const trimmed = value?.trim() || "";

  if (!trimmed) return "";

  if (
    /^[a-z][a-z0-9+.-]*:/i.test(trimmed) &&
    !/^https?:\/\//i.test(trimmed)
  ) {
    return "";
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
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
}

export default function PricingPage({ data }: Props) {
  const businessName =
    data.businessName?.trim() || "Our services";

  const title =
    data.pricing?.title?.trim() || "Services & Pricing";

  const currency = data.currency?.trim() || "";
  const notes = data.notes?.trim() || "";

  const rows = (data.pricing?.rows ?? []).filter(
    (row) => row.name?.trim()
  );

  const email = data.contact?.email?.trim() || "";
  const phone = data.contact?.phone?.trim() || "";
  const address = data.contact?.address?.trim() || "";

  const phoneHref = phone.replace(/[^\d+]/g, "");
  const canCall = Boolean(phoneHref && /\d/.test(phoneHref));
  const hasContact = Boolean(email || phone || address);

  const bookingUrl = safeWebUrl(data.bookingUrl);

  // Support uploaded logos from the creation form and
  // embedded logos from the edit form.
  const uploadedLogo = safeWebUrl(data.logoUrl);

  const embeddedLogo =
    data.logoDataUrl &&
    /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(
      data.logoDataUrl
    )
      ? data.logoDataUrl
      : "";

  const logo = uploadedLogo || embeddedLogo;

  const initials = businessName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] || "")
    .join("")
    .toUpperCase();

  const focusClass =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* BUSINESS HEADER */}
        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-2 bg-gradient-to-r from-indigo-600 via-violet-500 to-sky-400" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logo}
                      alt={`${businessName} logo`}
                      width={80}
                      height={80}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-2xl font-semibold tracking-tight text-indigo-600">
                      {initials}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">
                    Services & pricing
                  </p>

                  <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                    {businessName}
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Explore our services and find what works for you.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  {rows.length}{" "}
                  {rows.length === 1 ? "service" : "services"}
                </span>

                {currency && (
                  <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                    Prices in {currency}
                  </span>
                )}
              </div>
            </div>

            {/* CONTACT AND BOOKING */}
            {(hasContact || bookingUrl) && (
              <div className="mt-6 flex flex-col gap-5 border-t border-slate-100 pt-6 lg:flex-row lg:items-center lg:justify-between">
                {(bookingUrl || phone || email) && (
                  <div className="flex min-w-0 flex-wrap gap-3">
                    {bookingUrl && (
                      <a
                        href={bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex flex-col justify-center rounded-xl bg-indigo-600 px-5 py-3 text-white transition hover:bg-indigo-700 ${focusClass}`}
                      >
                        <span className="text-sm font-semibold">
                          Book now ↗
                        </span>

                        <span className="mt-0.5 text-xs text-indigo-100">
                          Open booking page
                        </span>
                      </a>
                    )}

                    {canCall ? (
                      <a
                        href={`tel:${phoneHref}`}
                        className={`inline-flex min-w-0 flex-col justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 transition hover:border-indigo-200 hover:bg-indigo-50 ${focusClass}`}
                      >
                        <span className="text-sm font-semibold">
                          Call us
                        </span>

                        <span className="mt-0.5 break-all text-xs text-slate-500">
                          {phone}
                        </span>
                      </a>
                    ) : phone ? (
                      <div className="min-w-0 rounded-xl border border-slate-200 px-5 py-3">
                        <span className="block text-sm font-semibold">
                          Phone
                        </span>

                        <span className="mt-0.5 block break-all text-xs text-slate-500">
                          {phone}
                        </span>
                      </div>
                    ) : null}

                    {email && (
                      <a
                        href={`mailto:${encodeURIComponent(email)}`}
                        className={`inline-flex min-w-0 flex-col justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 transition hover:border-indigo-200 hover:bg-indigo-50 ${focusClass}`}
                      >
                        <span className="text-sm font-semibold">
                          Send an email
                        </span>

                        <span className="mt-0.5 break-all text-xs text-slate-500">
                          {email}
                        </span>
                      </a>
                    )}
                  </div>
                )}

                {address && (
                  <div className="min-w-0 max-w-md">
                    <address className="whitespace-pre-line break-words text-sm not-italic leading-6 text-slate-500">
                      {address}
                    </address>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-1 inline-block text-sm font-medium text-indigo-600 hover:underline ${focusClass}`}
                    >
                      View on map ↗
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* PRICE LIST */}
        <section
          aria-label={title}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <h2 className="min-w-0 break-words text-lg font-semibold tracking-tight">
              {title}
            </h2>

            {currency && (
              <p className="shrink-0 text-xs text-slate-500">
                All prices in {currency}
              </p>
            )}
          </div>

          {rows.length > 0 ? (
            <div className="px-6 sm:px-8">
              <div
                aria-hidden="true"
                className="flex justify-between gap-4 border-b border-slate-100 py-3 text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                <span>Service</span>
                <span>Price</span>
              </div>

              <dl className="divide-y divide-slate-100">
                {rows.map((row, index) => (
                  <div
                    key={`${row.id || "service"}-${index}`}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-4 py-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:gap-6"
                  >
                    <dt className="break-words text-sm font-medium leading-6 text-slate-800 sm:text-base">
                      {row.name.trim()}
                    </dt>

                    <dd className="break-words text-right text-sm font-semibold leading-6 text-indigo-700 sm:text-base">
                      {row.price?.trim() || "Contact for quote"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <div className="px-6 py-12 text-center sm:px-8">
              <p className="font-medium text-slate-700">
                No prices have been posted yet.
              </p>

              {(phone || email) && (
                <p className="mt-2 text-sm text-slate-500">
                  Contact us for service information and pricing.
                </p>
              )}
            </div>
          )}

          {/* NOTES */}
          {notes && (
            <div className="mx-6 mb-6 mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:mx-8">
              <h3 className="text-sm font-semibold text-slate-700">
                Pricing notes
              </h3>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">
                {notes}
              </p>
            </div>
          )}

          {/* BOOKING FOOTER */}
          {(bookingUrl || phone || email) && (
            <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700">
                  {bookingUrl
                    ? "Ready to book?"
                    : "Have a question about our services?"}
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {bookingUrl
                    ? "Choose your service and confirm your appointment on our booking website."
                    : "Contact us using the details above."}
                </p>
              </div>

              {bookingUrl && (
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-700 ${focusClass}`}
                >
                  Book now ↗
                </a>
              )}
            </div>
          )}
        </section>

        <footer className="pb-4 text-center text-xs text-slate-400">
          Powered by{" "}
          <a
            href="https://simplebookme.com"
            className="font-medium text-slate-500 transition hover:text-indigo-600"
          >
            SimpleBookMe
          </a>
        </footer>
      </div>
    </main>
  );
}