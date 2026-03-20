"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const templates = [
  { name: "Soft Peach", file: "/templates/flyer1.png" }
];

export default function PromoFlyerPage() {
  const router = useRouter();

  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].file);

  const [percentage, setPercentage] = useState("50");
  const [period, setPeriod] = useState("This Week Only");
  const [extra, setExtra] = useState("Haircut");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [imageUrl, setImageUrl] = useState<string | null>(null);

 const generateFlyer = async () => {
  const width = 1080;
  const height = 1920;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = width;
  canvas.height = height;

  const baseImg = new Image();
  baseImg.src = selectedTemplate;
  await baseImg.decode();

  ctx.drawImage(baseImg, 0, 0, width, height);

  // =========================
  // 🎯 ANCHOR POSITIONS (FIXED)
  // =========================
  const circleX = width / 2;
  const circleY = 370;

  const rectX = width / 2.3;
  const rectY = 910;

  const tagX = 200;
  const tagY = 1420;

  const contactX = width / 1.5;
  const contactY = 1600;
  
  	const font = new FontFace(
	  "GreatVibes",
	  "url(https://fonts.gstatic.com/s/greatvibes/v17/RWmMoKWR9v4ksMfaWd_JN9XFiaQ.woff2)"
	);

  // =========================
  // % OFF (CIRCLE CENTER)
  // =========================
  ctx.textAlign = "center";
  ctx.fillStyle = "#1f2937";

  ctx.font = "bold 140px Playfair";
  ctx.fillText(`${percentage}%`, circleX, circleY);

  ctx.font = "bold 140px Playfair";
  ctx.fillText("OFF", circleX, circleY + 130);

  // =========================
  // PERIOD (RECTANGLE CENTER)
  // =========================
  ctx.font = "bold 60px Arial";
  ctx.fillStyle = "#1f2937";
  ctx.fillText(period, rectX, rectY);

  // =========================
  // EXTRA (TAG CENTER)
  // =========================
 
  ctx.textAlign = "center";
  ctx.font = "bold 50px Arial";
  ctx.fillStyle = "#6b7280";

  ctx.fillText(extra, tagX, tagY);
  

  // =========================
  // CONTACT (BOTTOM CENTER)
  // =========================
  ctx.textAlign = "center";
  ctx.font = "36px Arial";
  ctx.fillStyle = "#1f2937";

  let y = contactY;

  if (phone) {
    ctx.fillText(phone, contactX+100, y);
  }

  if (email) {
    ctx.fillText(email, contactX+100, y+230);
  }

  // =========================
  // WATERMARK
  // =========================
  ctx.textAlign = "left";
  ctx.font = "26px Arial";
  ctx.fillStyle = "#9ca3af";

  ctx.fillText("simplebookme.com", 40, height - 40);

  const dataUrl = canvas.toDataURL("image/png");
  setImageUrl(dataUrl);
};

  const downloadImage = () => {
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "promo-flyer.png";
    link.click();
  };

  return (
    <main className="min-h-screen bg-white px-6 py-24 flex justify-center">
      <div className="w-full max-w-4xl">

        <div className="mb-8">
          <Link href="/tools" className="text-sm text-indigo-600 hover:underline">
            ← Back to Tools
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900">
          Promo Flyer Generator
        </h1>
		
<p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-3xl">
  Create professional promotional flyers in seconds without any design experience. This tool helps small service businesses design eye-catching offers for Instagram, TikTok, and social media. Simply enter your discount, time period, and contact details, and generate a clean, high-converting flyer ready to post. Each template is optimized for mobile viewing, ensuring your message is clear and engaging. Use it to promote limited-time offers, attract new clients, and increase bookings. Download high-resolution PNG images instantly and share them online or print them for your business.
</p>

        {/* INPUT */}
        <div className="mt-10 bg-gray-50 p-8 rounded-2xl border space-y-6">
		


          {/* TEMPLATE SELECT */}
          <div>
            <label className="block text-sm font-medium">
              Choose Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="mt-2 w-full border rounded-lg px-4 py-3"
            >
              {templates.map((t) => (
                <option key={t.file} value={t.file}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <input
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            placeholder="Discount %"
            className="w-full border rounded-lg px-4 py-3"
          />

          <input
            type="text"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="Time Period"
            className="w-full border rounded-lg px-4 py-3"
          />

          <input
            type="text"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder="Extra Info"
            className="w-full border rounded-lg px-4 py-3"
          />

          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="w-full border rounded-lg px-4 py-3"
          />

          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border rounded-lg px-4 py-3"
          />

          <button
            onClick={generateFlyer}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold"
          >
            Generate Flyer
          </button>
        </div>

        {/* PREVIEW */}
        {imageUrl && (
          <div className="mt-12 text-center">
            <img src={imageUrl} className="mx-auto w-72 rounded-xl border" />

            <button
              onClick={downloadImage}
              className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl"
            >
              Download PNG
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 p-8 bg-gray-50 rounded-2xl text-center">
          <h3 className="text-2xl font-semibold">
            Turn This Into a Booking Page
          </h3>

          <button
            onClick={() => router.push("/setup")}
            className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl"
          >
            Create Booking Website
          </button>
        </div>

      </div>
    </main>
  );
}