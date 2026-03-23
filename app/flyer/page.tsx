"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// =========================
// 🎨 TEMPLATES WITH LAYOUT
// =========================
const templates = [
  {
    name: "Soft Peach",
    file: "/templates/flyer1.png",
    layout: {
      circle: { x: 540, y: 370 },
      rect: { x: 470, y: 910 },
      tag: { x: 200, y: 1420 },
      contact: { x: 720, y: 1600 },
    },
  },
  {
    name: "Flower pink",
    file: "/templates/flyer2.png",
    layout: {
      circle: { x: 540, y: 350 },
      rect: { x: 470, y: 900 },
      tag: { x: 220, y: 1400 },
      contact: { x: 700, y: 1447 },
    },
  },
  
    {
    name: "Flower violet",
    file: "/templates/flyer3.png",
    layout: {
      circle: { x: 540, y: 350 },
      rect: { x: 470, y: 900 },
      tag: { x: 220, y: 1400 },
      contact: { x: 700, y: 1520 },
    },
  },
      {
    name: "Beauty1",
    file: "/templates/beauty1.png",
    layout: {
      circle: { x: 540, y: 330 },
      rect: { x: 470, y: 800 },
      tag: { x: 600, y: 1000 },
      contact: { x: 418, y: 1600 },
    },
  },
        {
    name: "HairSalon1",
    file: "/templates/hairsalon1.png",
    layout: {
      circle: { x: 540, y: 330 },
      rect: { x: 460, y: 820 },
      tag: { x: 610, y: 1000 },
      contact: { x: 423, y: 1600 },
    },
  },
];

export default function PromoFlyerPage() {
  const router = useRouter();

  // ✅ USE INDEX (IMPORTANT)
  const [selectedIndex, setSelectedIndex] = useState(0);

    const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
  setOpenFaq(openFaq === index ? null : index);
};
const faqs = [
  {
    question: "What is a promo flyer generator?",
    answer:
      "A promo flyer generator helps you quickly create professional promotional images for your business. You can design flyers with discounts, services, and contact details without needing any graphic design skills."
  },
  {
    question: "Can I customize the discount percentage on the flyer?",
    answer:
      "Yes. You can enter any promotion percentage such as 10%, 20%, or even custom offers like 'Buy 1 Get 1 Free'. This allows you to create flexible promotions based on your business needs."
  },
  {
    question: "Can I include my phone number and email on the flyer?",
    answer:
      "Yes. You can add your phone number and email so customers can easily contact you after seeing your promotion. This helps increase response rates and conversions."
  },
  {
    question: "Can I specify the duration of the promotion?",
    answer:
      "Yes. You can include a time frame such as 'Valid until Sunday' or specific dates. This creates urgency and encourages customers to act quickly."
  },
  {
    question: "Can I add multiple services to the flyer?",
    answer:
      "Yes. You can list one or multiple services included in the promotion, such as haircuts, cleaning packages, or beauty treatments, making your offer clear and attractive."
  },
  {
    question: "Is the flyer ready for Instagram and social media?",
    answer:
      "Yes. The flyer is generated in a high-quality PNG format optimized for Instagram and social media. It is sized perfectly for mobile viewing, making it easy to post as a story or share with your audience instantly."
  },
  {
    question: "Do I need design experience to create a flyer?",
    answer:
      "No. The tool is designed to be simple and fast, allowing you to generate professional-looking promotional flyers in seconds without any design skills."
  }
];

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

    // ✅ SELECT TEMPLATE
    const selectedTemplate = templates[selectedIndex];
    const layout = selectedTemplate.layout;

    const baseImg = new Image();
    baseImg.src = selectedTemplate.file;
    await baseImg.decode();

    ctx.drawImage(baseImg, 0, 0, width, height);

    // =========================
    // 🎯 COORDINATES FROM TEMPLATE
    // =========================
    const circleX = layout.circle.x;
    const circleY = layout.circle.y;

    const rectX = layout.rect.x;
    const rectY = layout.rect.y;

    const tagX = layout.tag.x;
    const tagY = layout.tag.y;

    const contactX = layout.contact.x;
    const contactY = layout.contact.y;

    // =========================
    // % OFF
    // =========================
    ctx.textAlign = "center";
    ctx.fillStyle = "#1f2937";

    ctx.font = "bold 140px Playfair";
    ctx.fillText(`${percentage}%`, circleX, circleY);

    ctx.fillText("OFF", circleX, circleY + 130);

    // =========================
    // PERIOD
    // =========================
    ctx.font = "bold 60px Arial";
    ctx.fillStyle = "#1f2937";

    ctx.fillText(period, rectX, rectY);

    // =========================
    // EXTRA
    // =========================
    ctx.font = "bold 50px Arial";
    ctx.fillStyle = "#6b7280";

    ctx.fillText(extra, tagX, tagY);

    // =========================
    // CONTACT
    // =========================
    ctx.font = "36px Arial";
    ctx.fillStyle = "#1f2937";

    let y = contactY;

    if (phone) {
      ctx.fillText(phone, contactX + 100, y);
    }

    if (email) {
      ctx.fillText(email, contactX + 100, y + 230);
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
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              className="mt-2 w-full border rounded-lg px-4 py-3"
            >
              {templates.map((t, i) => (
                <option key={i} value={i}>
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

{/* SEO CONTENT */}
<div className="mt-20 space-y-6 text-gray-700 leading-relaxed">

  <h2 className="text-2xl font-semibold text-gray-900">
    Why Use a Promo Flyer Generator?
  </h2>

  <p>
    A promo flyer generator helps you create professional, high-converting promotional content in seconds without needing design skills. Instead of spending time on complex tools, you can instantly generate clean, visually appealing flyers that highlight your offers, services, and contact details.
  </p>

  <p>
    This is especially valuable for service-based businesses like salons, cleaners, barbers, and freelancers who rely on consistent promotion. A well-designed flyer clearly communicates your offer and encourages customers to take action immediately.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Powerful Features for Flexible Promotions
  </h2>

  <ul className="list-disc pl-6 space-y-3">
    <li>Enter any promotion percentage such as 10%, 20%, or custom offers.</li>
    <li>Add one or multiple services included in the promotion.</li>
    <li>Include a clear time frame like “Valid this week” or specific dates.</li>
    <li>Add your phone number and email for direct customer contact.</li>
    <li>Generate Instagram-ready flyers in high-quality PNG format.</li>
  </ul>

  <p>
    These features allow you to fully customize your promotion and create a flyer that reflects your business. Whether you are running a limited-time discount or promoting new services, you can adapt the flyer to your exact needs.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Designed for Social Media and Fast Sharing
  </h2>

  <p>
    The generated flyer is optimized for Instagram and mobile viewing, making it easy to post as a story or share with your audience instantly. The PNG format ensures high quality and sharp visuals across all devices and platforms.
  </p>

  <p>
    Because it is designed for quick sharing, you can create and publish promotions in minutes. This allows you to react to slow booking periods, fill empty slots, and keep your audience engaged.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    How to Use Promo Flyers Effectively
  </h2>

  <ul className="list-disc pl-6 space-y-3">
    <li>Post your flyer on Instagram Stories at least 2–3 times per week.</li>
    <li>Use urgency with time-limited offers to increase conversions.</li>
    <li>Update your promotion regularly to keep content fresh.</li>
    <li>Share flyers in DMs or groups to reach existing customers.</li>
    <li>Combine flyers with booking links for faster action.</li>
  </ul>

  <p>
    Consistency is key. Businesses that regularly post promotional flyers stay top-of-mind and generate more bookings over time. Even small updates to your offers can significantly increase engagement.
  </p>

  <p>
    With a fast, flexible, and easy-to-use flyer generator, you can create professional promotions anytime and turn your social media into a powerful booking channel.
  </p>

</div>
				{/* FAQ Section */}
<div className="mt-20">
  <h2 className="text-3xl font-bold text-gray-900 mb-8">
    FAQ
  </h2>

  <div className="space-y-4">
    {faqs.map((faq, index) => (
      <div
        key={index}
        className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm"
      >
        <button
          onClick={() => toggleFaq(index)}
          className="w-full flex justify-between items-center text-left"
        >
          <span className="text-lg font-medium text-gray-900">
            {faq.question}
          </span>

          <span
            className={`text-2xl font-bold transition-transform duration-300 ${
              openFaq === index ? "rotate-45" : ""
            }`}
          >
            +
          </span>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            openFaq === index ? "max-h-96 mt-4" : "max-h-0"
          }`}
        >
          <p className="text-gray-700 leading-relaxed">
            {faq.answer}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>
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