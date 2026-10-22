import { notFound } from "next/navigation";
import { getPricing } from "../../lib/pricingStore";

export const dynamic = "force-dynamic";

type PricingRow = {
  id: string;
  name: string;
  price: string;
};

type PricingData = {
  businessName?: string;
  currency?: string;
  pricing?: {
    title?: string;
    rows?: PricingRow[];
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

/* Only allow HTTP or HTTPS links. */
function safeWebUrl(value?: string): string {
  const trimmed = value?.trim();

  if (!trimmed) return "";

  // Reject unsupported schemes.
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
      !url.hostname ||
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

function getLogo(data: PricingData): string {
  // The pricing creation form uploads to Supabase and saves logoUrl.
  const uploadedLogo = safeWebUrl(data.logoUrl);

  if (uploadedLogo) return uploadedLogo;

  // Also support the image format used by your availability page.
  const dataUrl = data.logoDataUrl?.trim() || "";

  return /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(
    dataUrl
  )
    ? dataUrl
    : "";
}

export default async function PublicPricingPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;

  // getPricing should return the saved data object, or null if not found.
  // Await supports either a synchronous store or an async Supabase store.
  const data: PricingData | null = await getPricing(siteId);

  if (!data) {
    notFound();
  }

  const businessName = data.businessName?.trim() || "Our services";
  const title = data.pricing?.title?.trim() || "Services & Pricing";
  const currency = data.currency?.trim() || "";

  const rows = (data.pricing?.rows ?? []).filter(
    (row) => row.name?.trim()
  );

  const email = data.contact?.email?.trim() || "";
  const phone = data.contact?.phone?.trim() || "";
  const address = data.contact?.address?.trim() || "";

  const phoneHref = phone.replace(/[^\d+]/g, "");
  const hasContact = Boolean(email || phone || address);

  const logo = getLogo(data);
  const bookingUrl = safeWebUrl(data.bookingUrl);
  const notes = data.notes?.trim() || "";

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* BUSINESS HEADER */}
        <header className="space-y-3 text-center">
          {logo && (
            <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border bg-white p-3 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo}
                alt={`${businessName} logo`}
                width={112}
                height={112}
                className="h-full w-full object-contain"
              />
            </div>
          )}

          <h1 className="break-words text-3xl font-bold text-gray-900">
            {businessName}
          </h1>

          <p className="break-words text-sm text-gray-500">
            {title}
          </p>
        </header>

        {/* SERVICES AND PRICES */}
        <section
          aria-labelledby="pricing-heading"
          className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2
              id="pricing-heading"
              className="break-words text-xl font-semibold text-gray-900"
            >
              {title}
            </h2>

            {currency && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                Prices in {currency}
              </span>
            )}
          </div>

          {rows.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {rows.map((row, index) => (
                <li
                  key={row.id || `service-${index}`}
                  className="flex items-start justify-between gap-4 py-4"
                >
                  <span className="min-w-0 flex-1 break-words font-medium text-gray-900">
                    {row.name}
                  </span>

                  <span className="max-w-[50%] break-words text-right font-semibold text-indigo-600">
                    {row.price?.trim() || "Contact for quote"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-gray-500">
              No prices have been posted yet.
            </p>
          )}

          {/* PRICING NOTES */}
          {notes && (
            <div className="mt-5 rounded-xl bg-gray-50 p-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                {notes}
              </p>
            </div>
          )}

          {/* BOOKING LINK */}
          {bookingUrl && (
            <div className="mt-6 border-t pt-6">
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-indigo-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-indigo-700"
              >
                Book now
              </a>
            </div>
          )}
        </section>

        {/* BUSINESS CONTACT */}
        {hasContact && (
          <section
            aria-labelledby="contact-heading"
            className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
          >
            <h2
              id="contact-heading"
              className="text-lg font-semibold text-gray-900"
            >
              Contact us
            </h2>

            {(phone || email) && (
              <div
                className={`grid gap-3 ${
                  phone && email ? "sm:grid-cols-2" : ""
                }`}
              >
                {phone && (
                  <a
                    href={`tel:${phoneHref}`}
                    className="flex min-w-0 flex-col items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-center text-white transition hover:bg-indigo-700"
                  >
                    <span className="font-semibold">Call</span>
                    <span className="mt-1 break-all text-sm">
                      {phone}
                    </span>
                  </a>
                )}

                {email && (
                  <a
                    href={`mailto:${encodeURIComponent(email)}`}
                    className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-center text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <span className="font-semibold">Email</span>
                    <span className="mt-1 break-all text-sm">
                      {email}
                    </span>
                  </a>
                )}
              </div>
            )}

            {address && (
              <div className={phone || email ? "border-t pt-4" : ""}>
                <p className="text-sm font-medium text-gray-900">
                  Address
                </p>

                <address className="mt-1 whitespace-pre-line break-words text-sm not-italic leading-6 text-gray-600">
                  {address}
                </address>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline"
                >
                  View on map
                </a>
              </div>
            )}

            {!bookingUrl && (
              <p className="border-t pt-4 text-center text-sm text-gray-500">
                Contact us to ask about our services or arrange an
                appointment.
              </p>
            )}
          </section>
        )}

        <footer className="pt-2 text-center">
          <a
            href="/"
            className="text-xs text-gray-400 transition hover:text-indigo-600"
          >
            Powered by SimpleBookMe
          </a>
        </footer>
      </div>
    </main>
  );
}