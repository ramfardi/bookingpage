
import "server-only";

import {
  createHmac,
  createHash,
} from "node:crypto";

import type { ProductKey } from "./products";

/* ============================================
   BILLING ACTIVATION SECRET
============================================ */

function getActivationSecret(): string {
  const secret =
    process.env.BILLING_ACTIVATION_SECRET?.trim();

  if (
    !secret ||
    !/^[a-fA-F0-9]{64}$/.test(secret)
  ) {
    throw new Error(
      "BILLING_ACTIVATION_SECRET must be a 64-character hexadecimal secret."
    );
  }

  return secret;
}

/* ============================================
   GENERATE ACTIVATION TOKEN

   Deterministic token derived from:
   - Product type
   - Resource ID
   - Server-side secret

   The same product and resource always
   produce the same token.
============================================ */

export function createActivationToken(
  productKey: ProductKey,
  resourceId: string
): string {
  if (!resourceId.trim()) {
    throw new Error("Invalid resource ID.");
  }

  const secret = getActivationSecret();

  return createHmac("sha256", secret)
    .update(
      JSON.stringify([
        "simplebookme-activation-v1",
        productKey,
        resourceId,
      ])
    )
    .digest("hex");
}

/* ============================================
   HASH TOKEN FOR DATABASE LOOKUP

   We store only the hash of the activation
   token in Supabase.
============================================ */

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

/* ============================================
   GENERATE ACTIVATION URL

   Example:
   https://simplebookme.com/activate/<token>
============================================ */

export function getActivationUrl(
  token: string
): string {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    throw new Error("Invalid activation token.");
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured."
    );
  }

  return new URL(
    `/activate/${token}`,
    appUrl
  ).toString();
}
