import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const businessName = String(body.businessName || "Business").trim();
    const siteId = String(body.siteId || "").trim();
    const subdomain = String(body.subdomain || "").trim();
    const toEmail = String(body.toEmail || "").trim();

    const customerName = String(body.customerName || "").trim();
    const customerContact = String(body.customerContact || "").trim();
    const message = String(body.message || "").trim();
    const pageUrl = String(body.pageUrl || "").trim();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY." },
        { status: 500 }
      );
    }

    if (!isValidEmail(toEmail)) {
      return NextResponse.json(
        { error: "The business email is missing or invalid." },
        { status: 400 }
      );
    }

    if (!customerName || !customerContact || !message) {
      return NextResponse.json(
        { error: "Name, contact, and message are required." },
        { status: 400 }
      );
    }

    if (message.length < 10 || message.length > 2000) {
      return NextResponse.json(
        { error: "Message must be between 10 and 2000 characters." },
        { status: 400 }
      );
    }

    const safeBusinessName = escapeHtml(businessName);
    const safeCustomerName = escapeHtml(customerName);
    const safeCustomerContact = escapeHtml(customerContact);
	const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
    const safePageUrl = escapeHtml(pageUrl);
    const safeSubdomain = escapeHtml(subdomain);
    const safeSiteId = escapeHtml(siteId);

    const { error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "SimpleBookMe <support@simplebookme.com>",
      to: toEmail,
      subject: `New Instant Quote request for ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>New Instant Quote request</h2>

          <p>
            A visitor sent a quote request from your SimpleBookMe website.
          </p>

          <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb;">
            <p><strong>Business:</strong> ${safeBusinessName}</p>
            <p><strong>Customer name:</strong> ${safeCustomerName}</p>
            <p><strong>Customer contact:</strong> ${safeCustomerContact}</p>
            <p><strong>Message:</strong><br />${safeMessage}</p>
          </div>

          <p>
            <strong>Website page:</strong><br />
            ${safePageUrl ? `<a href="${safePageUrl}">${safePageUrl}</a>` : "Not provided"}
          </p>

          <p style="font-size: 12px; color: #6b7280;">
            Site ID: ${safeSiteId}<br />
            Subdomain: ${safeSubdomain}
          </p>
        </div>
      `,
      text: `
New Instant Quote request

Business: ${businessName}

Customer name:
${customerName}

Customer contact:
${customerContact}

Message:
${message}

Website page:
${pageUrl}

Site ID: ${siteId}
Subdomain: ${subdomain}
      `,
    });

    if (error) {
      console.error("Instant quote email error:", error);

      return NextResponse.json(
        { error: "Failed to send quote request." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Instant quote route error:", error);

    return NextResponse.json(
      { error: "Unexpected quote request error." },
      { status: 500 }
    );
  }
}