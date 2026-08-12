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

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body.email || "").trim();

    const businessName = String(
      body.businessName || "your business"
    )
      .trim()
      .slice(0, 150);

    const publicUrl = String(body.publicUrl || "").trim();
    const privateUrl = String(body.privateUrl || "").trim();
/*
const activationUrl = String(
  body.activationUrl || ""
).trim();
*/

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          error: "Missing RESEND_API_KEY.",
        },
        {
          status: 500,
        }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error: "Invalid email address.",
        },
        {
          status: 400,
        }
      );
    }

if (
  !isValidUrl(publicUrl) ||
  !isValidUrl(privateUrl)
) {
      return NextResponse.json(
        {
          error: "Invalid website links.",
        },
        {
          status: 400,
        }
      );
    }

    const safeBusinessName = escapeHtml(businessName);
    const safePublicUrl = escapeHtml(publicUrl);
    const safePrivateUrl = escapeHtml(privateUrl);
    //const safeActivationUrl = escapeHtml(activationUrl);

    const { data, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "SimpleBookMe <support@simplebookme.com>",

      to: email,

      subject: `Your SimpleBookMe website is ready — ${businessName}`,

      html: `
        <div
          style="
            max-width:640px;
            margin:0 auto;
            padding:8px;
            font-family:Arial,sans-serif;
            line-height:1.6;
            color:#111827;
          "
        >
          <h2 style="margin-bottom:8px;">
            Your SimpleBookMe website is ready
          </h2>

          <p>
            Your website for
            <strong>${safeBusinessName}</strong>
            has been created successfully.
          </p>

          <div
            style="
              margin:20px 0;
              padding:16px;
              border:1px solid #e5e7eb;
              border-radius:12px;
              background:#f9fafb;
            "
          >
            <p style="margin-top:0;">
              <strong>Public website link:</strong><br />

              <a href="${safePublicUrl}">
                ${safePublicUrl}
              </a>
            </p>

            <p>
              <strong>Private edit link:</strong><br />

              <a href="${safePrivateUrl}">
                ${safePrivateUrl}
              </a>
            </p>

<!--
<p style="margin-bottom:0;">
  <strong>Activation link:</strong><br />

  <a href="${safeActivationUrl}">
    ${safeActivationUrl}
  </a>
</p>
-->
          </div>

          <div
            style="
              margin-top:20px;
              padding:16px;
              border:1px solid #facc15;
              border-radius:12px;
              background:#fefce8;
              color:#713f12;
            "
          >
            <strong>Important: check your Spam or Junk folder</strong>

            <p style="margin-bottom:0;">
              Your first booking notification may occasionally arrive
              in Spam or Junk. Please check those folders for emails
              from <strong>SimpleBookMe</strong> or
              <strong>booking@simplebookme.com</strong>.

              If you find one there, mark it as
              <strong>Not spam</strong> and add the sender to your
              contacts. This can help future appointment notifications
              reach your inbox.
            </p>
          </div>

          <h3 style="margin-top:28px;">
            Recommended next steps
          </h3>

          <ol style="padding-left:22px;">
            <li style="margin-bottom:10px;">
              Open your public website and make sure your business
              information, services, prices, photos and contact details
              are correct.
            </li>

            <li style="margin-bottom:10px;">
              Submit a test appointment using a different email address.
            </li>

            <li style="margin-bottom:10px;">
              Confirm that the booking notification reaches the business
              email address you entered during setup.
            </li>

            <li style="margin-bottom:10px;">
              Check Spam or Junk if the test booking does not appear in
              your inbox.
            </li>

            <li style="margin-bottom:10px;">
              If a SimpleBookMe booking email is in Spam, open it and
              select <strong>Not spam</strong>.
            </li>

            <li style="margin-bottom:10px;">
              Confirm that the appointment date, time, service, client
              name and client message are correct before approving the
              appointment.
            </li>

            <li style="margin-bottom:10px;">
              Keep your private edit link somewhere safe. Anyone with
              that link may be able to edit your website.
            </li>

            <li style="margin-bottom:10px;">
              Share only your public website link with customers.
            </li>
          </ol>

<div
  style="
    margin-top:24px;
    padding:16px;
    border-radius:12px;
    background:#ecfdf5;
    color:#065f46;
  "
>
  <strong>Your website is free to use</strong>

  <p style="margin-bottom:0;">
    Your SimpleBookMe website does not expire after 7 days.
    You can continue using your public website and private edit
    link as long as you need them.

    Online booking and email notifications are subject to
    current monthly usage limits.
  </p>
</div>

          <div
            style="
              margin-top:20px;
              padding:14px;
              border-radius:10px;
              background:#fef2f2;
              color:#991b1b;
            "
          >
            <strong>Keep your private edit link private.</strong>

            <div style="margin-top:4px;">
              Do not share it with customers. Share only the public
              website link.
            </div>
          </div>

          <p style="margin-top:28px;">
            Thank you,<br />
            SimpleBookMe
          </p>
        </div>
      `,

      text: `
Your SimpleBookMe website is ready

Your website for ${businessName} has been created successfully.

PUBLIC WEBSITE LINK
${publicUrl}

PRIVATE EDIT LINK
${privateUrl}


IMPORTANT: CHECK SPAM OR JUNK

Your first booking notification may occasionally arrive in Spam or Junk.

Please check those folders for emails from SimpleBookMe or:
booking@simplebookme.com

If you find one there, mark it as "Not spam" and add the sender to your contacts.
This can help future appointment notifications reach your inbox.

RECOMMENDED NEXT STEPS

1. Open your public website and confirm that your business information, services, prices, photos and contact details are correct.

2. Submit a test appointment using a different email address.

3. Confirm that the booking notification reaches the business email address you entered during setup.

4. Check Spam or Junk if the test booking does not appear in your inbox.

5. If a SimpleBookMe email is in Spam, open it and mark it as "Not spam."

6. Confirm that the appointment date, time, service, client name and client message are correct before approving it.

7. Keep your private edit link somewhere safe.

8. Share only your public website link with customers.

YOUR WEBSITE IS FREE TO USE

You can continue using your public website and private edit link as long as you need them.

Online booking and email notifications are subject to current monthly usage limits. 

IMPORTANT

Do not share your private edit link with customers.
Share only the public website link.

Thank you,
SimpleBookMe
      `.trim(),
    });

    if (error) {
      console.error("Website links email error:", error);

      return NextResponse.json(
        {
          error: "Failed to send website links email.",
          details: error.message,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "Website links email accepted by Resend:",
      data?.id
    );

    return NextResponse.json({
      ok: true,
      emailId: data?.id,
    });
  } catch (error) {
    console.error(
      "Send website links route error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unexpected email error.",
      },
      {
        status: 500,
      }
    );
  }
}