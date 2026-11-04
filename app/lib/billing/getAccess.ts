
import "server-only";

import { getBillingDb } from "./db";

import {
  getBillingProduct,
  type ProductKey,
} from "./products";

export type ProductAccessStatus =
  | "trial"
  | "paid"
  | "expired"
  | "unregistered";

export type ProductAccessResult = {
  allowed: boolean;
  status: ProductAccessStatus;
  trialEndsAt: string | null;
  daysRemaining: number;
};

type GetAccessInput = {
  productKey: ProductKey;
  resourceId: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getProductAccess({
  productKey,
  resourceId,
}: GetAccessInput): Promise<ProductAccessResult> {

  const product = getBillingProduct(productKey);

  const cleanResourceId = resourceId.trim();

  if (!cleanResourceId) {
    throw new Error("Missing resource ID.");
  }

  const supabase = getBillingDb();

  const { data, error } = await supabase
    .from("product_activations")
    .select("trial_started_at, paid_at")
    .eq("product_key", productKey)
    .eq("resource_id", cleanResourceId)
    .maybeSingle();

  if (error) {
    console.error(
      "Billing access lookup failed:",
      error
    );

    throw new Error(
      "Unable to check product access."
    );
  }

  if (!data) {
    return {
      allowed: false,
      status: "unregistered",
      trialEndsAt: null,
      daysRemaining: 0,
    };
  }

  const startedAt = new Date(
    data.trial_started_at
  ).getTime();

  if (!Number.isFinite(startedAt)) {
    throw new Error(
      "Invalid trial start date."
    );
  }

  const trialEndsAt = new Date(
    startedAt + product.trialDays * DAY_MS
  );

  const now = Date.now();

  const remainingMs =
    trialEndsAt.getTime() - now;

  const daysRemaining = Math.max(
    0,
    Math.ceil(remainingMs / DAY_MS)
  );

  // A confirmed payment overrides trial expiration.
  if (data.paid_at !== null) {
    return {
      allowed: true,
      status: "paid",
      trialEndsAt: trialEndsAt.toISOString(),
      daysRemaining: 0,
    };
  }

  // The trial is still active.
  if (remainingMs > 0) {
    return {
      allowed: true,
      status: "trial",
      trialEndsAt: trialEndsAt.toISOString(),
      daysRemaining,
    };
  }

  // Trial expired, no payment.
  return {
    allowed: false,
    status: "expired",
    trialEndsAt: trialEndsAt.toISOString(),
    daysRemaining: 0,
  };
}
