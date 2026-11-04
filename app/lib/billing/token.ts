
import "server-only";

import {
  createHash,
  createHmac,
} from "node:crypto";

import type { ProductKey } from "./products";

function getActivationSecret(): string {
  const secret =
    process.env.BILLING_ACTIVATION_SECRET;

  if (!secret || secret.length < 64) {
    throw new Error(
      "BILLING_ACTIVATION_SECRET must be a securely generated 64-character hex string."
    );
  }

  if (!/^[a-fA-F0-9]{64}$/.test(secret)) {
    throw new Error(
      "BILLING_ACTIVATION_SECRET has an invalid format."
    );
  }

  return secret;
}

// Generate a stable, secure, product-specific token.
export function createActivationToken(
  productKey: ProductKey,
  resourceId: string
): string {
  const secret = getActivationSecret();

  const message = JSON.stringify([
    "simplebookme-activation-v1",
    productKey,
    resourceId,
  ]);

  return createHmac("sha256", secret)
    .update(message)
    .digest("hex");
}

// Never store the actual activation token in Supabase.
export function hashActivationToken(
  token: string
): string {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    throw new Error("Invalid activation token.");
  }

  return createHash("sha256")
    .update(token)
    .digest("hex");
}

// Generate a URL for activation emails.
export function getActivationUrl(
  token: string
): string {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    throw new Error("Invalid activation token.");
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL;

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured."
    );
  }

  const url = new URL(
    `/activate/${encodeURIComponent(token)}`,
    baseUrl
  );

  if (
    !["https:", "http:"].includes(url.protocol)
  ) {
    throw new Error("Invalid application URL.");
  }

  return url.toString();
}
