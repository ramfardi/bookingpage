import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const {
    clientEmail,
    clientName,
    service,
    date,
    time,
    replyTo,
  } = await req.json();

  await resend.emails.send({
    from: "Booking <booking@simplebookme.com>",
    to: clientEmail,
    replyTo: replyTo || "support@simplebookme.com",
    subject: "Your booking request is received",
    html: `
      <h2>Booking Confirmation</h2>
      <p>Hi ${clientName},</p>
      <p>Your request for <strong>${service}</strong> has been received.</p>
      <p><strong>Date:</strong> ${date}<br/>
         <strong>Time:</strong> ${time}</p>
      <p>We’ll contact you shortly.</p>
      <hr/>
      <p style="font-size:12px;color:#666">
        Sent via SimpleBookMe
      </p>
    `,
  });

  return Response.json({ success: true });
}
