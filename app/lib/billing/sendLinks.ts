
import "server-only";

import { Resend } from "resend";

import {
  getBillingProduct,
  type ProductKey,
} from "./products";

type SendProductLinksInput = {
  productKey: ProductKey;
  email: string;
  businessName: string;
  publicUrl: string;
  privateUrl: string;
  activationUrl: string;
  trialEndsAt: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendProductLinks({
  productKey,
  email,
  businessName,
  publicUrl,
  privateUrl,
  activationUrl,
  trialEndsAt,
}: SendProductLinksInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const resend = new Resend(apiKey);
  const product = getBillingProduct(productKey);

  const safeBusinessName = escapeHtml(businessName);
  const safeProductName = escapeHtml(product.name);
  const safePublicUrl = escapeHtml(publicUrl);
  const safePrivateUrl = escapeHtml(privateUrl);
  const safeActivationUrl = escapeHtml(activationUrl);

  const expiryDate = new Date(trialEndsAt);

  if (Number.isNaN(expiryDate.getTime())) {
    throw new Error("Invalid trial expiration date.");
  }

  const expiryText = expiryDate.toUTCString();

  const html = `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.7;
      color: #111827;
    ">

      <h2>Your ${safeProductName} is ready!</h2>

      <p>Hello ${safeBusinessName},</p>

      <p>
        Your SimpleBookMe page has been created
        successfully.
      </p>

      <p>
        You have a <strong>${product.trialDays}-day
        free trial</strong>, with no credit card required.
      </p>

      <p>
        <strong>Trial expires:</strong>
        ${escapeHtml(expiryText)}
      </p>

      <hr />

      <h3>Your public page</h3>

      <p>
        Share this link with customers:
      </p>

      <p>
        <a href="${safePublicUrl}">
          ${safePublicUrl}
        </a>
      </p>

      <h3>Your private editing link</h3>

      <p>
        Use this link to change your settings:
      </p>

      <p>
        <a href="${safePrivateUrl}">
          Edit Your Page
        </a>
      </p>

      <p style="color: #b91c1c;">
        Keep your private editing link secure.
        Do not share it with customers.
      </p>

      <hr />

      <h3>Activate your page</h3>

      <p>
        You can activate your page anytime during
        the trial to keep it available afterward.
      </p>

      <p>
        Activation requires only a one-time payment.
        There is no monthly subscription.
      </p>

      <p style="margin: 25px 0;">
        <a
          href="${safeActivationUrl}"
          style="
            background: #4f46e5;
            color: #ffffff;
            padding: 14px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
          "
        >
          Activate Your Page
        </a>
      </p>

      <p>
        If you need help, reply to this email.
      </p>

      <p>— SimpleBookMe Team</p>

    </div>
  `;

  const plainText = [
    `Your ${product.name} is ready!`,
    "",
    `Hello ${businessName},`,
    "",
    `Your ${product.trialDays}-day free trial has started.`,
    `Trial expires: ${expiryText}`,
    "",
    `Public page: ${publicUrl}`,
    `Private edit link: ${privateUrl}`,
    `Activation link: ${activationUrl}`,
    "",
    "Activation is a one-time payment.",
    "No monthly subscription.",
    "",
    "Keep your private edit link secure.",
    "",
    "SimpleBookMe Team",
  ].join("\n");

  const { error } = await resend.emails.send({
    from: "SimpleBookMe <onboarding@simplebookme.com>",
    to: email,
    subject: `Your ${product.name} is ready!`,
    html,
    text: plainText,
  });

  if (error) {
    throw new Error(
      `Resend email failed: ${error.message}`
    );
  }
}
