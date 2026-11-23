/*
 * hreflang clusters (L1): pages that are translations of each other.
 *
 * Google only trusts hreflang when every page in a cluster lists all
 * the others (and itself). Before, only /es and /ar QR pages had partial
 * lists, so Google ignored them. Each page now uses the same full map,
 * plus x-default (the English page) for every other language.
 *
 * Use in a layout: alternates: { canonical, languages: QR_CODE_LANGUAGES }
 * If you add a translation, add it here and every page picks it up.
 */

const BASE = "https://simplebookme.com";

export const QR_CODE_LANGUAGES = {
  en: `${BASE}/qr-code-generator`,
  fr: `${BASE}/fr/generateur-code-qr`,
  es: `${BASE}/es/generador-codigo-qr`,
  fa: `${BASE}/fa/generator-qr-code`,
  ar: `${BASE}/ar/generator-qr-code`,
  "x-default": `${BASE}/qr-code-generator`,
};

export const AD_BUDGET_LANGUAGES = {
  en: `${BASE}/advertising-budget-calculator`,
  fr: `${BASE}/fr/calculateur-budget-publicitaire`,
  es: `${BASE}/es/calculadora-presupuesto-publicidad`,
  "x-default": `${BASE}/advertising-budget-calculator`,
};
