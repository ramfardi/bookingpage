"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/*
 * Site-wide footer for simplebookme.com (rendered by app/layout.tsx,
 * never on customer subdomains). Server-rendered plain <a href> links,
 * so crawlers can discover every public marketing page from any page.
 *
 * Hidden on private pages and on pages a business shares with its
 * own customers (they show that business, not SimpleBookMe).
 */
const HIDDEN_ROUTES: RegExp[] = [
  /^\/site(\/|$)/, // editor + preview
  /^\/(availability|pricing_page|cleaning\/quote-gen)\/[^/]+(\/.*)?$/, // a business's shared pages + edit links
  /^\/activate(\/|$)/,
  /^\/product-activation(\/|$)/,
  /^\/(booking|gallery|schedule)(\/|$)/, // customer-site pages
];

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Booking website builder" },
      { href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About" },
      { href: "/support", label: "Support" },
      { href: "/setup", label: "Get started" },
    ],
  },
  {
    title: "Industries",
    links: [
      { href: "/cleaning", label: "Cleaning businesses" },
      { href: "/beauty", label: "Beauty & salons" },
      { href: "/home_services", label: "Home services" },
    ],
  },
  {
    title: "Business guides",
    links: [
      { href: "/guide", label: "All guides" },
      { href: "/guide/google-business", label: "Add your business to Google Maps" },
      { href: "/guide/business-email", label: "Professional business email" },
      { href: "/guide/pricing-guide", label: "How to price your services" },
      { href: "/guide/payment-methods", label: "How to accept payments" },
      { href: "/guide/getting-first-clients", label: "Get your first clients" },
      { href: "/guide/advertising-small-business", label: "Advertising for small businesses" },
    ],
  },
  {
    title: "Free tools",
    links: [
      { href: "/tools", label: "All free tools" },
      { href: "/qr-code-generator", label: "QR code generator" },
      { href: "/google_review_qr", label: "Google review QR code" },
      { href: "/instagram_setup", label: "Instagram booking link" },
      { href: "/availability", label: "Availability calendar" },
      { href: "/service-price-calculator", label: "Service price calculator" },
      { href: "/cleaning-pricing-calculator", label: "Cleaning pricing calculator" },
      { href: "/advertising-budget-calculator", label: "Advertising budget calculator" },
      { href: "/flyer", label: "Promo flyer generator" },
      { href: "/tools/business-card", label: "Business card generator" },
    ],
  },
];

export default function MarketingFooter() {
  const pathname = usePathname() || "/";

  if (HIDDEN_ROUTES.some((route) => route.test(pathname))) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-semibold text-slate-900">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-indigo-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-sm text-slate-500 sm:flex-row">
          <Link href="/" className="font-extrabold text-slate-900">
            Simple<span className="text-indigo-600">BookMe</span>
          </Link>
          <p>© {new Date().getFullYear()} SimpleBookMe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
