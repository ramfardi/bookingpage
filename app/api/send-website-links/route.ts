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

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body.email || "").trim();
    const businessName = String(body.businessName || "your business").trim();
    const publicUrl = String(body.publicUrl || "").trim();
    const privateUrl = String(body.privateUrl || "").trim();
    const activationUrl = String(body.activationUrl || "").trim();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY." },
        { status: 500 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    if (
      !isValidUrl(publicUrl) ||
      !isValidUrl(privateUrl) ||
      !isValidUrl(activationUrl)
    ) {
      return NextResponse.json(
        { error: "Invalid website links." },
        { status: 400 }
      );
    }

    const safeBusinessName = escapeHtml(businessName);
    const safePublicUrl = escapeHtml(publicUrl);
    const safePrivateUrl = escapeHtml(privateUrl);
    const safeActivationUrl = escapeHtml(activationUrl);

    const { error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "SimpleBookMe <support@simplebookme.com>",
      to: email,
      subject: `Your SimpleBookMe website links for ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>Your website is ready 🎉</h2>

          <p>
            Your SimpleBookMe website for <strong>${safeBusinessName}</strong>
            has been created.
          </p>

          <p>
            <strong>Public website link:</strong><br />
            <a href="${safePublicUrl}">${safePublicUrl}</a>
          </p>

          <p>
            <strong>Private edit link:</strong><br />
            <a href="${safePrivateUrl}">${safePrivateUrl}</a>
          </p>

          <p>
            <strong>Activation link:</strong><br />
            <a href="${safeActivationUrl}">${safeActivationUrl}</a>
          </p>

          <div style="margin-top: 20px; padding: 14px; border-radius: 12px; background: #fff7ed; color: #9a3412;">
            You can use your website for one week. After that, please activate it
            to keep it online. If it is not activated, the website may be removed
            and you may lose access to your links.
          </div>

          <p style="color:#b91c1c;">
            Do not share the private edit link with customers. Share only the public website link.
          </p>

          <p>SimpleBookMe</p>
        </div>
      `,
      text: `
Your website is ready!

Business: ${businessName}

Public website link:
${publicUrl}

Private edit link:
${privateUrl}

Activation link:
${activationUrl}

You can use your website for one week. After that, please activate it to keep it online.
If it is not activated, the website may be removed and you may lose access to your links.

Do not share the private edit link with customers. Share only the public website link.

SimpleBookMe
      `,
    });

    if (error) {
      console.error("Website links email error:", error);

      return NextResponse.json(
        { error: "Failed to send website links email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Send website links route error:", error);

    return NextResponse.json(
      { error: "Unexpected email error." },
      { status: 500 }
    );
  }
}