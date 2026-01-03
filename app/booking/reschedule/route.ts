import { verifyToken, signToken } from "@/app/lib/bookingTokens";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return new Response("Invalid link", { status: 400 });

  return new Response(`
    <form method="POST">
      <h2>Propose new time</h2>
      <input type="date" name="date" required />
      <input type="time" name="time" required />
      <input type="hidden" name="token" value="${token}" />
      <button type="submit">Send to client</button>
    </form>
  `, { headers: { "Content-Type": "text/html" }});
}

export async function POST(req: Request) {
  const form = await req.formData();
  const token = form.get("token") as string;

  const data = verifyToken(token);

  const newToken = signToken({
    ...data,
    preferred_date: form.get("date"),
    preferred_time: form.get("time"),
  });

  await resend.emails.send({
    from: "Booking <booking@simplebookme.com>",
    to: data.customer_email,
    subject: "New time proposed",
    html: `
      <p>A new time has been proposed.</p>
      <a href="https://simplebookme.com/api/booking/confirm?token=${newToken}">
        Accept new time
      </a>
    `,
  });

  return new Response("Proposal sent.");
}
