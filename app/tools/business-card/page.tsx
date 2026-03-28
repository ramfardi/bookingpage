"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import Link from "next/link";

function drawEmailIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  ctx.strokeRect(x, y, 22, 16);

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 11, y + 8);
  ctx.lineTo(x + 22, y);
  ctx.stroke();

  ctx.restore();
}

function drawInstagramIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  const size = 22;
  const r = 6;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + size - r, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + r);
  ctx.lineTo(x + size, y + size - r);
  ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
  ctx.lineTo(x + r, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x + size - 6, y + 6, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();

  ctx.restore();
}

export default function BusinessCardPage() {
  const [businessName, setBusinessName] = useState("");
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [address, setAddress] = useState("");
  const [qrLink, setQrLink] = useState("");

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

const faqs = [
  {
    question: "What size should a business card be?",
    answer:
      "The standard business card size is 3.5 × 2 inches (89 × 51 mm). This is the most widely accepted size by printers and ensures your card fits perfectly in wallets and card holders."
  },
  {
    question: "What resolution is best for printing business cards?",
    answer:
      "For sharp, professional printing, business cards should be designed at 300 DPI. For a 3.5 × 2 inch card, this equals 1050 × 600 pixels. Lower resolutions may result in blurry text or QR codes."
  },
  {
    question: "Can I add a QR code to my business card?",
    answer:
      "Yes. QR codes are a powerful way to let customers instantly access your website, booking page, or contact details by scanning with their phone. They are commonly used on modern business cards."
  },
  {
    question: "What should I include on a business card?",
    answer:
      "A good business card typically includes your business name, your name, phone number, email, and optionally your address or social media handle. Keep it clean and avoid overcrowding."
  },
  {
    question: "How do I make my business card look professional?",
    answer:
      "Use clear fonts, proper spacing, and consistent alignment. Avoid too many colors or elements. A clean layout with strong contrast (black on white) often looks more professional than overly complex designs."
  },
  {
    question: "Is it better to include social media like Instagram?",
    answer:
      "Yes, especially for service-based businesses like salons, cleaning, or fitness. Including your Instagram handle helps customers see your work and builds trust."
  },
  {
    question: "Where should I place the QR code on the card?",
    answer:
      "QR codes are usually placed on the right side or back of the card. Make sure there is enough white space around it so it can be scanned easily."
  },
  {
    question: "What are common mistakes to avoid when designing a business card?",
    answer:
      "Avoid using very small text, low-resolution images, poor contrast, or overcrowding too much information. Also make sure important content is not too close to the edges to prevent cutting during printing."
  },
  {
    question: "Can I print this business card at home?",
    answer:
      "Yes, but for best results use high-quality cardstock and a good printer. For a more professional finish, it is recommended to use a printing service."
  },
  {
    question: "Should I use PNG or PDF for printing?",
    answer:
      "High-resolution PNG works well for most cases, but many professional printers prefer PDF format. If available, always choose the format recommended by your printing service."
  }
];

  const generateCard = async () => {
    const width = 1050;
    const height = 600;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const padding = 60;
    const leftWidth = 650;

    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftWidth, 60);
    ctx.lineTo(leftWidth, height - 60);
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";

    let y = 100;

    if (businessName) {
      ctx.font = "bold 52px Arial";
      ctx.fillText(businessName, padding, y);
      y += 70;
    }

    if (name) {
      ctx.font = "bold 38px Arial";
      ctx.fillText(name, padding, y);
      y += 55;
    }

    ctx.font = "28px Arial";
    ctx.fillStyle = "#000";

    const textOffset = 40;

    if (phone) {
      ctx.fillText(`☎ ${phone}`, padding, y);
      y += 45;
    }

    if (email) {
      drawEmailIcon(ctx, padding, y - 16);
      ctx.fillText(email, padding + textOffset, y);
      y += 45;
    }

    if (instagram) {
      drawInstagramIcon(ctx, padding, y - 18);
      ctx.fillText(instagram, padding + textOffset, y);
      y += 45;
    }

    if (address) {
      ctx.font = "24px Arial";
      ctx.fillText(address, padding, height - 60);
    }

    if (qrLink) {
      const qrCanvas = document.createElement("canvas");

      await QRCode.toCanvas(qrCanvas, qrLink, {
        width: 300,
        margin: 1,
      });

      const qrSize = 260;
      const qrX = leftWidth + (width - leftWidth) / 2 - qrSize / 2;
      const qrY = height / 2 - qrSize / 2;

      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.fillText("BOOK NOW", qrX + qrSize / 2, qrY + qrSize + 30);
    }

    const url = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = url;
    link.download = "business-card.png";
    link.click();
  };

  return (
    <main className="min-h-screen bg-white px-6 py-20 flex justify-center">
      <div className="max-w-2xl w-full">

        <h1 className="text-3xl font-bold mb-8">
          Free Business Card Generator (Print Ready 3.5″ × 2″ with QR Code)
        </h1>

        <div className="space-y-4">

          <input placeholder="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full border p-3 rounded" />
          <input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-3 rounded" />
          <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border p-3 rounded" />
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-3 rounded" />
          <input placeholder="Instagram (e.g. @handle)" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="w-full border p-3 rounded" />
          <input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border p-3 rounded" />
          <input placeholder="QR Link (booking / website)" value={qrLink} onChange={(e) => setQrLink(e.target.value)} className="w-full border p-3 rounded" />

          <button onClick={generateCard} className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800">
            Generate Business Card
          </button>
        </div>

{/* SEO CONTENT */}
<div className="mt-20 space-y-6 text-gray-700 leading-relaxed">

  <h2 className="text-2xl font-semibold text-gray-900">
    Why a Professional Business Card Still Matters
  </h2>

  <p>
    A business card remains one of the most effective and trusted tools for
    networking and customer acquisition. Whether you are meeting clients in
    person, attending events, or promoting your services locally, a well-designed
    business card creates a lasting first impression. Unlike digital messages
    that can be ignored or forgotten, a physical card provides a tangible reminder
    of your business.
  </p>

  <p>
    For service-based businesses such as salons, cleaning services, contractors,
    and fitness professionals, business cards help establish credibility and make
    it easy for customers to contact you later. A clean, professional design shows
    attention to detail and builds trust instantly.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Benefits of Adding a QR Code to Your Business Card
  </h2>

  <p>
    Modern business cards go beyond just contact information. By adding a QR code,
    you allow customers to instantly access your booking page, website, portfolio,
    or social media with a simple scan. This removes friction and significantly
    increases the chances of converting a potential customer into a paying client.
  </p>

  <p>
    QR-enabled business cards are especially powerful for businesses that rely on
    quick bookings or online engagement. Instead of asking customers to manually
    type your website, they can scan and take action within seconds.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Best Practices for Designing a Business Card
  </h2>

  <ul className="list-disc pl-6 space-y-3">
    <li>Keep your design clean and avoid overcrowding with too much text.</li>
    <li>Use high-contrast colors for readability and print clarity.</li>
    <li>Include only essential information: name, business, contact details.</li>
    <li>Make sure your QR code has enough spacing for easy scanning.</li>
    <li>Use high-resolution (300 DPI) designs for professional printing.</li>
  </ul>

  <p>
    A simple and well-structured layout often performs better than overly complex
    designs. Focus on clarity, spacing, and readability to ensure your card looks
    professional in any setting.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Who Should Use This Business Card Generator?
  </h2>

  <p>
    This tool is designed for small businesses and independent professionals who
    want a quick, professional solution without hiring a designer. It is ideal for
    hairstylists, barbers, cleaners, freelancers, real estate agents, consultants,
    and anyone offering services locally or online.
  </p>

  <p>
    With print-ready dimensions, integrated QR code generation, and a clean layout,
    you can create a business card that not only looks professional but also helps
    drive real customer actions such as bookings, inquiries, and website visits.
  </p>

</div>

        {/* FAQ BELOW FORM */}
        <div className="mt-20">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition"
                >
                  <span className="font-medium text-gray-900">
                    {faq.question}
                  </span>

                  <span className={`text-xl transform transition ${openFaq === index ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>

                {openFaq === index && (
                  <div className="px-6 py-4 text-gray-600 bg-white">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 bg-gray-50 rounded-2xl text-center">
          <h3 className="text-2xl font-semibold text-gray-900">
            Need a Booking Website to Attach to Your QR?
          </h3>

          <p className="mt-4 text-gray-600">
            Create a professional booking website and generate QR codes
            that allow customers to scan and book instantly.
          </p>

          <button
            onClick={() => router.push("/setup")}
            className="mt-6 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
          >
            Create Your Booking Website
          </button>
        </div>

      </div>
    </main>
  );
}