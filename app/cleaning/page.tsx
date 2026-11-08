import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  FileText,
  Link2,
  Play,
  Settings2,
} from "lucide-react";

/**
 * FILE: app/cleaning/page.tsx
 *
 * Media files live in /public, but URLs start at / (not /public).
 * Leave any value as "" to use the designed placeholder instead.
 *
 * After recording your demo:
 *   1. Save public/videos/cleaning-quote-demo.mp4
 *   2. Set DEMO_VIDEO to "/videos/cleaning-quote-demo.mp4"
 *
 * Optional real product screenshots:
 *   public/images/cleaning/customer-quote.webp
 *   public/images/cleaning/pricing-editor.webp
 */
const DEMO_VIDEO = "/videos/cleaning-quote-demo.mp4";
const CUSTOMER_SCREENSHOT = "/images/cleaning/customer-quote.png";
const EDITOR_SCREENSHOT = "/images/cleaning/pricing-editor.png";

const QUOTE_URL = "/cleaning/quote-gen";

export const metadata: Metadata = {
  title: "Cleaning Quote Generator for Your Business | SimpleBookMe",
  description:
    "Create a branded cleaning quote page with your own rates. Share one link so customers can estimate cleaning prices online. Simple setup, one-time price.",
  alternates: { canonical: "https://simplebookme.com/cleaning" },
};

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

function CustomerPreview() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-medium text-indigo-600">EXAMPLE CUSTOMER VIEW</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">Get a cleaning estimate</p>
        </div>
        <ClipboardList className="h-6 w-6 text-slate-400" aria-hidden="true" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-200 px-3 py-3">
          <p className="text-xs text-slate-500">Property type</p>
          <p className="mt-1 text-sm font-medium text-slate-900">House</p>
        </div>
        <div className="rounded-lg border border-slate-200 px-3 py-3">
          <p className="text-xs text-slate-500">Size</p>
          <p className="mt-1 text-sm font-medium text-slate-900">1,500 sq ft</p>
        </div>
        <div className="col-span-2 rounded-lg border border-slate-200 px-3 py-3">
          <p className="text-xs text-slate-500">Service</p>
          <p className="mt-1 text-sm font-medium text-slate-900">Standard cleaning</p>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between rounded-xl bg-indigo-50 px-4 py-4">
        <div>
          <p className="text-xs font-medium text-indigo-700">Illustrative estimate</p>
          <p className="mt-1 text-xs text-slate-500">Your rates determine the amount</p>
        </div>
        <p className="text-2xl font-semibold tracking-tight text-slate-900">$240</p>
      </div>
    </div>
  );
}

function EditorPreview() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-medium text-indigo-600">EXAMPLE BUSINESS VIEW</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">Your pricing, your rules</p>
        </div>
        <Settings2 className="h-6 w-6 text-slate-400" aria-hidden="true" />
      </div>
      <div className="space-y-3">
        {[
          { label: "Apartment", value: "$0.12 / sq ft" },
          { label: "Townhouse", value: "$0.14 / sq ft" },
          { label: "House", value: "$0.16 / sq ft" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
          >
            <span className="text-sm text-slate-700">{item.label}</span>
            <span className="text-sm font-medium text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Check className="h-4 w-4 text-indigo-600" aria-hidden="true" />
        Example rates — customize them to fit your business
      </p>
    </div>
  );
}

function ScreenshotPanel({
  src,
  alt,
  kind,
}: {
  src: string;
  alt: string;
  kind: "customer" | "editor";
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#f7f8fb] p-4 sm:p-7">
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={1100}
          height={850}
          className="h-auto w-full rounded-xl border border-slate-200 bg-white shadow-sm"
          sizes="(max-width: 1024px) 100vw, 45vw"
        />
      ) : kind === "customer" ? (
        <CustomerPreview />
      ) : (
        <EditorPreview />
      )}
    </div>
  );
}

export default function CleaningLandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 antialiased">
      {/* Minimal navigation: keep the focus on the quote generator. */}
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-950">
            
          </Link>
          <div className="flex items-center gap-5">
            <a
              href="#how-it-works"
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:inline"
            >
              How it works
            </a>
            <Link
              href={QUOTE_URL}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              Create your page <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero photo: public/images/cleaning.jpg */}
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/cleaning.jpg')" }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,16,34,0.96)_0%,rgba(8,16,34,0.89)_48%,rgba(8,16,34,0.50)_100%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.23em] text-indigo-200">
              Built for cleaning businesses
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.65rem]">
              Cleaning estimates, without the back-and-forth.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
              Set your own prices, create a professional cleaning quote page,
              and share one link. Customers can see an estimated price before
              they get in touch.
            </p>
            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link
                href={QUOTE_URL}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-indigo-50 sm:w-auto"
              >
                Create my quote page <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#demo"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
              >
                <Play className="h-4 w-4" aria-hidden="true" /> See how it works
              </a>
            </div>
            <p className="mt-6 text-sm text-slate-300">
              Customize your rates <span className="mx-2 text-slate-500">·</span>
              Share a link <span className="mx-2 text-slate-500">·</span>
              No coding required
            </p>
          </div>
        </div>
      </section>

      {/* Video is deliberately click-to-play, not an autoplaying background. */}
      <section id="demo" className="border-t border-slate-100 bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Quick walkthrough
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              See the whole process in under a minute.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              From setting your prices to sharing a quote link, see how the
              generator works before you create your own page.
            </p>
            <Link href={QUOTE_URL} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
              Start creating <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-[0_15px_45px_rgba(15,23,42,0.09)]">
            {DEMO_VIDEO ? (
<video
  className="aspect-video w-full object-cover bg-slate-950"
  src={DEMO_VIDEO}
  poster="/images/cleaning/video-thumbnail.png"
  controls
  playsInline
  preload="metadata"
>
  Your browser does not support HTML video.
</video>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center px-6 text-center text-white">
                <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/10">
                  <Play className="ml-1 h-7 w-7" aria-hidden="true" />
                </span>
                <p className="text-lg font-semibold">Product walkthrough</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                  Video placeholder — add your screen recording when ready.
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  public/videos/cleaning-quote-demo.mp4
                </p>
              </div>
            )}
          </div>
        </div>
      </section>


{/* HOW IT WORKS */}
<section
  id="how-it-works"
  className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-white via-slate-50/50 to-white py-24 sm:py-28"
>
  <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
    {/* Heading */}
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
        Three simple steps
      </p>

<h2 className="mt-4 text-4xl font-bold tracking-tight leading-[1.25] text-slate-950 sm:text-5xl">
  Create it once.

  <span className="block pb-3 pt-1 leading-[1.3] bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
    Share it anywhere.
  </span>
</h2>

      <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600">
        Build your cleaning quote page, customize your pricing,
        and give customers a simple way to estimate their cleaning costs.
      </p>
    </div>

    {/* Three steps */}
    <div className="mt-16 grid gap-6 md:grid-cols-3">
      {[
        {
          number: "01",
          icon: Settings2,
          title: "Set your rates",
          body: "Choose your property types, set your cleaning rates, and customize services, cleaning frequency, and optional extras. Make the calculator work for your business.",
          color: "indigo",
          iconBg: "bg-indigo-100",
          iconText: "text-indigo-600",
          border: "hover:border-indigo-200",
          gradient: "from-indigo-50/80 to-white",
          numberColor: "text-indigo-500",
        },
        {
          number: "02",
          icon: Link2,
          title: "Get your link",
          body: "Create a dedicated quote page with your business details and branding. Share your link through Instagram, your website, Google Business Profile, or directly with customers.",
          color: "violet",
          iconBg: "bg-violet-100",
          iconText: "text-violet-600",
          border: "hover:border-violet-200",
          gradient: "from-violet-50/80 to-white",
          numberColor: "text-violet-500",
        },
        {
          number: "03",
          icon: Clock3,
          title: "Let customers estimate",
          body: "Customers select their property type, square footage, cleaning service, and extras. Your calculator instantly displays an estimated price based on the rates you configured.",
          color: "emerald",
          iconBg: "bg-emerald-100",
          iconText: "text-emerald-600",
          border: "hover:border-emerald-200",
          gradient: "from-emerald-50/80 to-white",
          numberColor: "text-emerald-500",
        },
      ].map((step) => {
        const Icon = step.icon;

        return (
          <div
            key={step.number}
            className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br ${step.gradient} ${step.border} p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-9`}
          >
            {/* Step number */}
            <span
              className={`absolute right-7 top-6 text-5xl font-bold tracking-tighter opacity-20 ${step.numberColor}`}
            >
              {step.number}
            </span>

            {/* Large icon */}
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-2xl ${step.iconBg} ${step.iconText} transition-transform duration-300 group-hover:scale-110`}
            >
              <Icon
                className="h-10 w-10"
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            {/* Text */}
            <h3 className="mt-9 text-2xl font-bold tracking-tight text-slate-950">
              {step.title}
            </h3>

            <p className="mt-4 text-base leading-8 text-slate-600">
              {step.body}
            </p>

            {/* Decorative accent */}
            <div
              className={`mt-9 h-1 w-12 rounded-full ${step.iconBg} transition-all duration-300 group-hover:w-24`}
            />
          </div>
        );
      })}
    </div>

    {/* Closing message */}
    <div className="mt-12 text-center">
      <p className="text-base font-medium text-slate-600">
        No coding required. Just configure, create, and share.
      </p>

      <a
        href="/cleaning/quote-gen"
        className="mt-6 inline-flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200/70 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl"
      >
        Create your quote page
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </a>
    </div>
  </div>
</section>


      {/* Real screenshots are optional: polished mock previews show until you add files. */}
      <section className="bg-[#fcfcfd] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              One link, two simple views
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Easy for you. Clear for customers.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              You control the rates. Your customers get a straightforward way
              to estimate their cleaning cost.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <article>
              <ScreenshotPanel
                src={EDITOR_SCREENSHOT}
                alt="Business owner editing cleaning service prices"
                kind="editor"
              />
              <h3 className="mt-5 text-lg font-semibold">Your business settings</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Configure property types, prices, and extras from your private editing page.
              </p>
            </article>
            <article>
              <ScreenshotPanel
                src={CUSTOMER_SCREENSHOT}
                alt="Customer filling out the cleaning quote form"
                kind="customer"
              />
              <h3 className="mt-5 text-lg font-semibold">Your customer’s quote page</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Customers enter their cleaning details and see a price estimate.
              </p>
            </article>
          </div>
        </div>
      </section>



      {/* Primary conversion point. */}
      <section className="bg-indigo-50/60 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to make quoting easier?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-600">
            Create a professional quote page for your cleaning business and
            share it with customers in minutes.
          </p>
          <div className="mt-8">
            <Link href={QUOTE_URL} className={primaryButton}>
              Create my cleaning quote page <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">$9.99 USD one-time activation</p>
        </div>
      </section>

      {/* The requested brief single row of other products. */}
      <section className="border-t border-slate-100 bg-white py-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="mb-5 text-sm font-semibold text-slate-900">More tools from SimpleBookMe</p>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                href: "/setup",
                icon: CalendarDays,
                name: "Free booking website",
                note: "A simple site for customers to book appointments.",
              },
              {
                href: "/availability",
                icon: Clock3,
                name: "Availability page",
                note: "Share your current working schedule.",
              },
              {
                href: "/pricing_page",
                icon: FileText,
                name: "Pricing page",
                note: "Publish a clear, editable service price list.",
              },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30"
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">
                      {tool.name}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {tool.note}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-indigo-600" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-7">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} SimpleBookMe</span>
          <Link href="/" className="font-medium text-slate-600 hover:text-indigo-600">
            SimpleBookMe.com
          </Link>
        </div>
      </footer>
    </main>
  );
}

