import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email, siteId, subdomain } = await req.json();

    if (!email || !siteId || !subdomain) {
      return NextResponse.json(
        { error: "Missing email, siteId, or subdomain" },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: "SimpleBookMe <onboarding@simplebookme.com>",
      to: email,
      subject: "Your SimpleBookMe website is ready 🎉",
      html: siteCreatedEmailHtml({ siteId, subdomain }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to send site created email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

function siteCreatedEmailHtml({
  siteId,
  subdomain,
}: {
  siteId: string;
  subdomain: string;
}) {
  const publicUrl = `https://${subdomain}.simplebookme.com`;
  const privateUrl = `https://simplebookme.com/site/${siteId}?mode=preview`;

  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Your booking website is ready 🎉</h2>

    <p>Your website has been created successfully.</p>

    <p>
      <strong>Public website:</strong><br/>
      <a href="${publicUrl}">${publicUrl}</a>
    </p>

    <p>
      <strong>Private edit link:</strong><br/>
      <a href="${privateUrl}">${privateUrl}</a>
    </p>

    <p style="color:#dc2626;">
      Save this private link. Anyone with this link may be able to edit your website.
      Share only the public website link with customers.
    </p>

    <p>
      You can use the private link anytime to view, test, and edit your website.
    </p>

    <p>— SimpleBookMe Team</p>
  </div>
  `;
}