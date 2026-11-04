
export const BILLING_PRODUCTS = {
  cleaning_quote: {
    name: "Cleaning Quote Generator",
    trialDays: 14,
    stripePriceEnv: "STRIPE_PRICE_CLEANING_QUOTE",
  },

  // Add future products here:
  //
  // availability: {
  //   name: "Availability Page",
  //   trialDays: 14,
  //   stripePriceEnv: "STRIPE_PRICE_AVAILABILITY",
  // },
  //
  // pricing_page: {
  //   name: "Pricing Page",
  //   trialDays: 14,
  //   stripePriceEnv: "STRIPE_PRICE_PRICING",
  // },

} as const;

export type ProductKey = keyof typeof BILLING_PRODUCTS;

export function isProductKey(
  value: unknown
): value is ProductKey {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(
      BILLING_PRODUCTS,
      value
    )
  );
}

export function getBillingProduct(
  productKey: ProductKey
) {
  return BILLING_PRODUCTS[productKey];
}
