import { Resend } from "resend";
import { CUSTOMER_CONFIG } from "@/app/lib/customerConfig";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const {
      customerKey,
      service,
      preferred_date,
      preferred_time,
      customer_email,
    } = await req.json();

    const customer = CUSTOMER_CONFIG[customerKey];

    if (!customer) {
      return Response.json({ error: "Customer not found" }, { status: 400 });
    }

    if (!customer.email?.bookingNotifications) {
      return Response.json(
        { error: "Booking email not configured" },
        { status: 400 }
      );
    }

    /* ===============================
       1️⃣ PROVIDER EMAIL (you / hairdresser)
       =============================== */
    await resend.emails.send({
      from: "Booking <booking@simplebookme.com>",
      to: customer.email.bookingNotifications,
      replyTo: customer_email, // provider can reply to client
      subject: `New booking request – ${customer.businessName}`,
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${preferred_date}</p>
        <p><strong>Time:</strong> ${preferred_time}</p>
        <p><strong>Client email:</strong> ${customer_email}</p>
      `,
    });

    /* ===============================
       2️⃣ CUSTOMER CONFIRMATION EMAIL
       =============================== */
    await resend.emails.send({
      from: "Booking <booking@simplebookme.com>",
      to: customer_email, // 🔴 THIS IS THE CONFIRMATION
      replyTo:
        customer.email.replyTo ??
        customer.email.bookingNotifications,
      subject: `We received your booking request`,
      html: `
        <h2>Booking request received</h2>
        <p>Thanks for booking with <strong>${customer.businessName}</strong>.</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${preferred_date}</p>
        <p><strong>Time:</strong> ${preferred_time}</p>
        <p>We’ll contact you shortly.</p>
      `,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Failed to send booking emails" },
      { status: 500 }
    );
  }
}
