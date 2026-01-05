export const runtime = "nodejs";

import { verifyToken, signToken } from "@/app/lib/bookingTokens";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

/* ======================
   GET – Show reschedule form
====================== */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");

  if (!token) {
    return new Response("Invalid link", { status: 400 });
  }

  try {
    verifyToken(token);
  } catch {
    return new Response("Invalid or expired link", { status: 400 });
  }

  return new Response(
    `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; padding: 40px;">
        <h2>Propose new appointment time</h2>
        <form method="POST">
          <label>
            Date:<br />
            <input type="date" name="date" required />
          </label><br /><br />
          <label>
            Time:<br />
            <input type="time" name="time" required />
          </label><br /><br />
          <input type="hidden" name="token" value="${token}" />
          <button type="submit">Send to client</button>
        </form>
      </body>
    </html>
    `,
    { headers: { "Content-Type": "text/html" } }
  );
}

/* ======================
   POST – Send proposal to client
====================== */
export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const token = form.get("token")?.toString();
    const date = form.get("date")?.toString();
    const time = form.get("time")?.toString();

    if (!token || !date || !time) {
      return new Response("Invalid request", { status: 400 });
    }

    const data = verifyToken(token);

    // 🔐 Ensure required fields exist
    if (!data.siteId || !data.customer_email) {
      return new Response("Invalid token", { status: 400 });
    }

    // 🔁 Re-sign token with updated time
    const newToken = signToken({
      ...data,
      preferred_date: date,
      preferred_time: time,
    });

    const confirmUrl =
      `https://simplebookme.com/api/booking/confirm?token=${encodeURIComponent(
        newToken
      )}`;

    await resend.emails.send({
      from: "Booking <booking@simplebookme.com>",
      to: data.customer_email,
      subject: "New appointment time proposed",
      html: `
        <h2>New time proposed</h2>
        <p>A new appointment time has been suggested:</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p>
          <a href="${confirmUrl}" style="
            display:inline-block;
            padding:12px 18px;
            background:#4f46e5;
            color:white;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
          ">
            Accept new time
          </a>
        </p>
        <p style="font-size:12px;color:#666;">
          If this link expires, please request another proposal.
        </p>
      `,
    });

    return new Response(
      "New time proposal sent to client.",
      { status: 200 }
    );
  } catch (err) {
    console.error("Reschedule error:", err);
    return new Response("Invalid or expired link.", { status: 400 });
  }
}
