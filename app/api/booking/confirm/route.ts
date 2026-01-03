import { verifyToken } from "@/app/lib/bookingTokens";
import { createICS } from "@/lib/calendar";
import { Resend } from "resend";
import { CUSTOMER_CONFIG } from "@/app/lib/customerConfig";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  try {
    const token = new URL(req.url).searchParams.get("token");
    if (!token) throw new Error();

    const data = verifyToken(token);
    const customer = CUSTOMER_CONFIG[data.customerKey];

    const start = new Date(`${data.preferred_date}T${data.preferred_time}`);

    const ics = createICS({
      uid: data.eventUID,
      title: `Booking with ${customer.businessName}`,
      description: `Service: ${data.service}`,
      start,
    });

    const attachment = {
      filename: "booking.ics",
      content: Buffer.from(ics).toString("base64"),
    };

    // Send to CLIENT
    await resend.emails.send({
      from: "Booking <booking@simplebookme.com>",
      to: data.customer_email,
      subject: "Your appointment is confirmed",
      html: `<p>Your appointment is confirmed.</p>`,
      attachments: [attachment],
    });

    // Send to PROVIDER
    await resend.emails.send({
      from: "Booking <booking@simplebookme.com>",
      to: customer.email.bookingNotifications,
      subject: "Appointment confirmed",
      html: `<p>Appointment confirmed.</p>`,
      attachments: [attachment],
    });

    return new Response("Appointment confirmed. You may close this tab.");
  } catch {
    return new Response("Invalid or expired link.", { status: 400 });
  }
}
