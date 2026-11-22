"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const GOOGLE_ADS_ID = "AW-17894933160";

/*
 * Privacy: never load the Google Ads tag on private pages.
 * gtag('config') reports the full page URL to Google, and these URLs
 * contain private keys (edit ?token=..., activation tokens, the editor's
 * site ID). Business owners are the only visitors here, so Ads loses
 * nothing: conversions are on /setup and /success, which keep the tag.
 *
 * Keep in sync with the private routes in next.config.mjs headers().
 */
const PRIVATE_ROUTES: RegExp[] = [
  /^\/site(\/|$)/, // editor + preview
  /^\/(availability|pricing_page|cleaning\/quote-gen)\/[^/]+\/edit\/?$/, // edit links
  /^\/activate(\/|$)/,
  /^\/product-activation(\/|$)/,
];

export function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTES.some((route) => route.test(pathname));
}

export default function GoogleAdsTag() {
  const pathname = usePathname() || "/";

  if (isPrivateRoute(pathname)) {
    return null;
  }

  return (
    <>
      <Script
        id="google-ads-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ dataLayer.push(arguments); }
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
