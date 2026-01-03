import { Resend } from "resend";

export async function GET() {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const result = await resend.emails.send({
      from: "Booking Test <booking@simplebookme.com>",
      to: "myvisualrf@gmail.com", // put your real email here
      subject: "Resend test – it works 🎉",
      html: "<p>If you received this, Resend + Vercel are working.</p>",
    });

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ success: false, error }, { status: 500 });
  }
}
