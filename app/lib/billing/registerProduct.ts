
import "server-only";

import { getBillingDb } from "./db";

import {
  getBillingProduct,
  type ProductKey,
} from "./products";

import {
  createActivationToken,
  hashActivationToken,
  getActivationUrl,
} from "./tokens";

type RegisterProductInput = {
  productKey: ProductKey;
  resourceId: string;
  email: string;
};

type RegisterProductResult = {
  created: boolean;
  productKey: ProductKey;
  resourceId: string;
  trialStartedAt: string;
  trialEndsAt: string;
  activationUrl: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export async function registerProduct({
  productKey,
  resourceId,
  email,
}: RegisterProductInput): Promise<RegisterProductResult> {

  const product = getBillingProduct(productKey);

  const cleanResourceId = resourceId.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (
    !/^[a-zA-Z0-9_-]{4,128}$/.test(
      cleanResourceId
    )
  ) {
    throw new Error("Invalid resource ID.");
  }

  if (
    cleanEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      cleanEmail
    )
  ) {
    throw new Error(
      "A valid customer email is required."
    );
  }

  const activationToken = createActivationToken(
    productKey,
    cleanResourceId
  );

  const activationTokenHash =
    hashActivationToken(activationToken);

  const supabase = getBillingDb();

  // Try to create a new trial record.
  const { data, error } = await supabase
    .from("product_activations")
    .insert({
      product_key: productKey,
      resource_id: cleanResourceId,
      customer_email: cleanEmail,
      activation_token_hash: activationTokenHash,
    })
    .select("trial_started_at")
    .single();

  let trialStartedAt: string;
  let created = false;

  if (!error && data) {
    trialStartedAt = data.trial_started_at;
    created = true;
  } else if (error?.code === "23505") {
    // Record already exists. Do not restart its trial.
    const { data: existing, error: lookupError } =
      await supabase
        .from("product_activations")
        .select(
          "customer_email, activation_token_hash, trial_started_at"
        )
        .eq("product_key", productKey)
        .eq("resource_id", cleanResourceId)
        .maybeSingle();

    if (lookupError || !existing) {
      throw new Error(
        "Could not recover the existing billing record."
      );
    }

    if (
      existing.customer_email !== cleanEmail
    ) {
      throw new Error(
        "This page already has a different billing email."
      );
    }

    if (
      existing.activation_token_hash !==
      activationTokenHash
    ) {
      throw new Error(
        "Activation token configuration does not match the existing record."
      );
    }

    trialStartedAt = existing.trial_started_at;
  } else {
    console.error(
      "Billing registration error:",
      error
    );

    throw new Error(
      "Unable to register the product for billing."
    );
  }

  const startTime = new Date(
    trialStartedAt
  ).getTime();

  if (!Number.isFinite(startTime)) {
    throw new Error(
      "Invalid trial start date in billing record."
    );
  }

  const trialEndsAt = new Date(
    startTime + product.trialDays * DAY_MS
  ).toISOString();

  return {
    created,
    productKey,
    resourceId: cleanResourceId,
    trialStartedAt,
    trialEndsAt,
    activationUrl: getActivationUrl(
      activationToken
    ),
  };
}
