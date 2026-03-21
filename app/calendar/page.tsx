"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];



export default function AvailabilityGeneratorPage() {
  const router = useRouter();

  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]);
  
    const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
  setOpenFaq(openFaq === index ? null : index);
};
const faqs = [
  {
    question: "What is an Instagram story availability calendar?",
    answer:
      "An Instagram story availability calendar is a visual schedule that shows your working hours, available time slots, and services in a clean, shareable format designed specifically for Instagram Stories."
  },
  {
    question: "Why should I post my availability on Instagram Stories?",
    answer:
      "Posting your availability makes it easy for customers to see when you are free and encourages faster bookings. It reduces back-and-forth messages and helps clients take action immediately."
  },
  {
    question: "Who should use an availability calendar?",
    answer:
      "Availability calendars are ideal for service-based businesses such as hairstylists, nail artists, cleaners, barbers, personal trainers, and freelancers who take bookings on a weekly basis."
  },
  {
    question: "How often should I post my weekly availability?",
    answer:
      "Most businesses post their availability at the start of the week and update it as slots fill. Consistent posting helps customers stay informed and increases booking opportunities."
  },
  {
    question: "Can I customize my availability calendar design?",
    answer:
      "Yes. You can customize colors, fonts, services, and layout to match your brand and create a professional-looking Instagram story that stands out."
  },
  {
    question: "What size should the calendar be for Instagram Stories?",
    answer:
      "Instagram Stories are optimized for a 9:16 aspect ratio, typically 1080×1920 pixels. This ensures your calendar looks sharp and fills the screen properly on mobile devices."
  },
  {
    question: "Can I include booking links or contact information?",
    answer:
      "Yes. You can include your booking link, phone number, or Instagram handle so customers know exactly how to book after viewing your availability."
  }
];

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [servicePrices, setServicePrices] = useState<
  { name: string; price: string }[]
>([{ name: "", price: "" }]);

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };
  
  const updateServicePrice = (
  index: number,
  field: "name" | "price",
  value: string
) => {
  const updated = [...servicePrices];
  updated[index][field] = value;
  setServicePrices(updated);
};

const addServiceRow = () => {
  if (servicePrices.length >= 5) return;
  setServicePrices([...servicePrices, { name: "", price: "" }]);
};

  const generateImage = () => {
    const width = 1080;
    const height = 1920;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = "#111827";
    ctx.font = "bold 80px Arial";
    ctx.textAlign = "center";

    if (businessName) {
      ctx.fillText(businessName, width / 2, 140);
    } else {
      ctx.fillText("Weekly Availability", width / 2, 140);
    }

    // Subtitle
    ctx.font = "40px Arial";
    ctx.fillStyle = "#6b7280";
    ctx.fillText("Book Your Appointment", width / 2, 220);

    // Cards
    let startY = 300;
    const cardHeight = 140;
    const gap = 20;

    DAYS.forEach((day) => {
      const isOpen = selectedDays.includes(day);

      // Card background
      ctx.fillStyle = isOpen ? "#ffffff" : "#e5e7eb";
      ctx.strokeStyle = "#e5e7eb";

      const x = 80;
      const y = startY;
      const w = width - 160;
      const h = cardHeight;

      // Rounded rect
      const radius = 30;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      // Day text
      ctx.fillStyle = "#111827";
      ctx.font = "bold 48px Arial";
      ctx.textAlign = "left";
      ctx.fillText(day, x + 40, y + 70);

      // Time / Closed
      ctx.textAlign = "right";
      ctx.font = "40px Arial";

      if (isOpen) {
        ctx.fillStyle = "#4f46e5";
        ctx.fillText(`${startTime} - ${endTime}`, x + w - 40, y + 75);
      } else {
        ctx.fillStyle = "#9ca3af";
        ctx.fillText("Closed", x + w - 40, y + 75);
      }

      startY += cardHeight + gap;
    });

    // Bottom info
// ==============================
// SERVICES WITH PRICES (NEW)
// ==============================

const validServices = servicePrices.filter(
  (s) => s.name.trim() && s.price.trim()
);

if (validServices.length > 0) {
  ctx.textAlign = "center";
  ctx.font = "40px Arial";
  ctx.fillStyle = "#111827";

  let servicesY = startY + 40; // right after the last day card

  validServices.forEach((s) => {
    ctx.fillText(`${s.name} - ${s.price}`, width / 2, servicesY);
    servicesY += 50;
  });
}
/* ==============================
   CONTACT INFO
   ============================== */

let bottomY = height - 200;

ctx.textAlign = "center";
ctx.font = "36px Arial";
ctx.fillStyle = "#374151";

if (phone) {
  ctx.fillText(phone, width / 2, bottomY);
  bottomY += 50;
}

if (email) {
  ctx.fillText(email, width / 2, bottomY);
}

    // CTA
    ctx.font = "bold 50px Arial";
    ctx.fillStyle = "#111827";
    ctx.fillText("Book Now", width / 2, height - 80);

    const dataUrl = canvas.toDataURL("image/png");
    setImageUrl(dataUrl);
  };

  const downloadImage = () => {
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "availability-story.png";
    link.click();
  };
  
  const downloadFlyer = async () => {


  const size = 1080;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Title
  if (businessName) {
    ctx.fillStyle = "#000000";
    ctx.font = "bold 60px Poppins";
    ctx.textAlign = "center";
    ctx.fillText(businessName, size / 2, 100);
  }


  // Services + price
  const validServices = servicePrices.filter(
    (s) => s.name && s.price
  );

  ctx.font = "36px Arial";
  ctx.fillStyle = "#333333";

  let y = 750;

  validServices.forEach((s) => {
    ctx.fillText(`${s.name} - ${s.price}`, size / 2, y);
    y += 45;
  });

  // CTA
  ctx.font = "bold 40px Arial";
  ctx.fillStyle = "#000000";
  ctx.fillText("Scan to Book", size / 2, size - 80);

  const dataUrl = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "qr-flyer.png";
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
          Availability Calendar Generator (Instagram Ready)
        </h1>

        <p className="mt-4 text-gray-600">
          Create a beautiful weekly availability image to share on Instagram,
          WhatsApp, or your booking page.
        </p>

        {/* INPUT */}
        <div className="mt-10 bg-gray-50 p-8 rounded-2xl border space-y-6">

          {/* Days */}
          <div>
            <label className="block font-medium mb-2">Select Available Days</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-lg border ${
                    selectedDays.includes(day)
                      ? "bg-indigo-600 text-white"
                      : "bg-white"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-2 w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-2 w-full border rounded-lg px-4 py-3"
              />
            </div>
          </div>

          {/* Optional */}
          <input
            type="text"
            placeholder="Business Name (optional)"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          />

          <input
            type="text"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          />

          <input
            type="text"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          />

          <button
            onClick={generateImage}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
          >
            Generate Instagram Story
          </button>
        </div>
		
		<div>
  <label className="block text-sm font-medium text-gray-700">
    Services with Prices (Optional)
  </label>

  <div className="space-y-3 mt-2">
    {servicePrices.map((item, index) => (
      <div key={index} className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Service (e.g. Haircut)"
          value={item.name}
          onChange={(e) =>
            updateServicePrice(index, "name", e.target.value)
          }
          className="rounded-lg border px-3 py-2"
        />

        <input
          type="text"
          placeholder="Price (e.g. $25)"
          value={item.price}
          onChange={(e) =>
            updateServicePrice(index, "price", e.target.value)
          }
          className="rounded-lg border px-3 py-2"
        />
      </div>
    ))}
  </div>

  {servicePrices.length < 5 && (
    <button
      onClick={addServiceRow}
      className="mt-3 text-sm text-indigo-600 hover:underline"
    >
      + Add another service
    </button>
  )}
</div>

        {/* PREVIEW */}
        {imageUrl && (
          <div className="mt-12 text-center">
            <img
              src={imageUrl}
              className="mx-auto w-64 rounded-xl border"
            />

            <button
              onClick={downloadImage}
              className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Download PNG
            </button>
			

          </div>
        )}
		
		{/* SEO CONTENT */}
<div className="mt-20 space-y-6 text-gray-700 leading-relaxed">

  <h2 className="text-2xl font-semibold text-gray-900">
    Why Use a Weekly Availability Calendar?
  </h2>

  <p>
    A weekly availability calendar makes it easy for customers to instantly see when you are available and book your services without unnecessary back-and-forth messages. Instead of answering the same questions repeatedly, you can share a clear visual schedule that communicates your availability in seconds.
  </p>

  <p>
    This is especially powerful for service-based businesses like hairstylists, cleaners, nail artists, barbers, and freelancers. By posting your availability regularly, you create urgency, improve communication, and increase bookings directly from platforms like Instagram.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Designed for Instagram & Fast Booking
  </h2>

  <p>
    Our generator creates Instagram Story-ready calendars in a perfect 1080×1920 format, allowing you to share your weekly schedule with just one tap. The output is a high-quality PNG image that looks clean, professional, and easy to read on mobile devices.
  </p>

  <p>
    Because it is optimized for social media, your availability becomes a powerful marketing tool. Customers can quickly view your open slots and take action immediately, helping you fill your schedule faster.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Flexible and Customizable for Any Business
  </h2>

  <ul className="list-disc pl-6 space-y-3">
    <li>Choose any combination of days in the week to match your schedule.</li>
    <li>Closed days are automatically greyed out for clear visibility.</li>
    <li>Add unlimited services with pricing directly on the calendar.</li>
    <li>Optionally include your business name, phone number, and email.</li>
    <li>Generate clean, professional PNG images ready for sharing.</li>
  </ul>

  <p>
    This flexibility allows you to create a calendar that truly reflects your business. Whether you offer multiple services or have varying availability each week, you can customize everything in seconds.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Fast, Simple, and Effective
  </h2>

  <p>
    The tool is designed to be fast and easy to use. You can generate a complete weekly availability calendar in just a few seconds without any design skills. No complicated setup, no editing software, and no wasted time.
  </p>

  <p>
    By combining speed, clarity, and professional design, this availability calendar helps you communicate better with your customers, reduce friction in booking, and ultimately grow your business more efficiently.
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
            Want Live Booking Instead of Static Availability?
          </h3>

          <p className="mt-4 text-gray-600">
            Create a booking website where clients can see real-time availability and book instantly.
          </p>

          <button
            onClick={() => router.push("/setup")}
            className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold"
          >
            Create Booking Website
          </button>
        </div>

      </div>
    </main>
  );
}