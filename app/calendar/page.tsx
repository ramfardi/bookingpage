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

  // QR
  const qrCanvas = document.createElement("canvas");

  await QRCode.toCanvas(qrCanvas, inputUrl, {
    width: 500,
    margin: 4,
  });

  ctx.drawImage(qrCanvas, size / 2 - 250, 200, 500, 500);

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