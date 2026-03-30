"use client";

import { useState } from "react";
import Link from "next/link";
const DAYS = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
];

export default function AvailabilityGeneratorPage() {
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Monday","Tuesday","Wednesday","Thursday","Friday",
  ]);

  const [dayTimes, setDayTimes] = useState<
    Record<string, { start: string; end: string }>
  >({
    Monday: { start: "09:00", end: "17:00" },
    Tuesday: { start: "09:00", end: "17:00" },
    Wednesday: { start: "09:00", end: "17:00" },
    Thursday: { start: "09:00", end: "17:00" },
    Friday: { start: "09:00", end: "17:00" },
    Saturday: { start: "09:00", end: "17:00" },
    Sunday: { start: "09:00", end: "17:00" },
  });

  const [businessName, setBusinessName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [editLink, setEditLink] = useState("");

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const updateDayTime = (
    day: string,
    field: "start" | "end",
    value: string
  ) => {
    setDayTimes((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  // 🚀 MAIN FEATURE
const generateAvailabilityLink = async () => {
  const siteId = crypto.randomUUID().slice(0, 8);
  const editToken = crypto.randomUUID().slice(0, 16);

  const payload = {
    siteId,
    editToken,
    businessName,
    selectedDays,
    dayTimes,
  };

  const res = await fetch("/api/availability/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  const publicUrl = `https://${data.subdomain}.simplebookme.com`;
  const editUrl = `/availability/${siteId}/edit?token=${editToken}`;

  setGeneratedLink(publicUrl);
  setEditLink(editUrl);
};

  return (
    <main className="min-h-screen bg-white px-6 py-24 flex justify-center">
      <div className="w-full max-w-4xl">

        <h1 className="text-4xl font-bold text-gray-900">
          Free Weekly Availability Link Generator
        </h1>

        <p className="mt-4 text-gray-600">
          Create a shareable weekly availability page for your business. 
Let clients see when you're available and contact or book instantly.
        </p>

        {/* INPUT */}
        <div className="mt-10 bg-gray-50 p-8 rounded-2xl border space-y-6">

          {/* Days */}
          <div>
            <label className="block font-medium mb-2">
              Select Available Days
            </label>

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

          {/* Hours */}
          <div>
            <label className="block font-medium mb-2">
              Set Hours Per Day
            </label>

            <div className="space-y-4">
              {selectedDays.map((day) => (
                <div
                  key={day}
                  className="grid grid-cols-3 gap-4 items-center"
                >
                  <span className="font-medium">{day}</span>

                  <input
                    type="time"
                    value={dayTimes[day].start}
                    onChange={(e) =>
                      updateDayTime(day, "start", e.target.value)
                    }
                    className="border rounded-lg px-3 py-2"
                  />

                  <input
                    type="time"
                    value={dayTimes[day].end}
                    onChange={(e) =>
                      updateDayTime(day, "end", e.target.value)
                    }
                    className="border rounded-lg px-3 py-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Business */}
          <input
            type="text"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          />

          <button
            onClick={generateAvailabilityLink}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
          >
            Generate Live Availability Link
          </button>
        </div>
		
		

{/* RESULT */}
{generatedLink && (
  <div className="mt-10 p-6 border rounded-2xl bg-white shadow-sm space-y-6">

    {/* PUBLIC LINK */}
    <div className="space-y-2">
      <p className="text-sm text-gray-500">Public Link</p>

      <div className="flex items-center gap-2">
        <a
          href={generatedLink}
          target="_blank"
          className="text-indigo-600 break-all text-sm flex-1"
        >
          {generatedLink}
        </a>

        <button
          onClick={() => navigator.clipboard.writeText(generatedLink)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Copy
        </button>
      </div>
    </div>

    {/* EDIT LINK */}
    <div className="space-y-2">
      <p className="text-sm text-gray-500">Edit Link (Private)</p>

      <p className="text-red-500 text-xs">
        Do NOT share this link publicly
      </p>

      <div className="flex items-center gap-2">
        <a
          href={editLink}
          target="_blank"
          className="text-indigo-600 break-all text-sm flex-1"
        >
          {editLink}
        </a>

        <button
          onClick={() => navigator.clipboard.writeText(editLink)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Copy
        </button>
      </div>
    </div>

    {/* SHARE IDEAS */}
    <div className="pt-4 border-t">
      <p className="text-sm text-gray-500 mb-2">
        💡 Use this link in:
      </p>

      <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
        <li>Instagram bio</li>
        <li>WhatsApp messages</li>
        <li>Google Business profile</li>
        <li>Business cards & flyers</li>
      </ul>
    </div>

    {/* QR CTA */}
    <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

      <p className="text-sm text-gray-600">
        Turn this into a scannable QR code for printing
      </p>

      <a
        href={`/qr-code-generator?url=${encodeURIComponent(generatedLink)}`}
        className="inline-block text-center px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
      >
        Generate QR Code
      </a>
    </div>

  </div>
)}
		
		{/* SEO CONTENT */}
<div className="mt-20 space-y-6 text-gray-700 leading-relaxed">

  <h2 className="text-2xl font-semibold text-gray-900">
    Why Use a Weekly Availability Link?
  </h2>

  <p>
    Sharing your availability with clients should be simple, fast, and professional. Instead of going back and forth with messages like “What time works for you?” or “Are you free tomorrow?”, a weekly availability link allows you to show your schedule instantly. Clients can view your working hours at a glance and contact or book you without confusion.
  </p>

  <p>
    This is especially useful for small service businesses that are not ready to use a full booking system but still want to appear organized and professional. By sharing a single link, you eliminate unnecessary communication, reduce missed opportunities, and make it easier for clients to take action.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Who Should Use an Availability Page?
  </h2>

  <p>
    This tool is designed for independent professionals and small businesses who need a simple way to communicate their schedule. Whether you are a cleaner, hairstylist, barber, nail technician, personal trainer, freelancer, or home service provider, having a clear availability page helps you attract and convert more clients.
  </p>

  <p>
    Many service providers rely on social media or messaging apps to manage bookings. An availability link acts as a central place where clients can always check your schedule, making your business look more structured and easier to work with.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    How to Create Your Availability Link
  </h2>

  <p>
    Creating your weekly availability page takes only a few seconds. Simply select the days you are available, set your working hours for each day, and generate your unique link. Once created, you can share this link anywhere online or offline.
  </p>

  <p>
    You can update your availability anytime, making it flexible for changing schedules. This is ideal for businesses with varying hours or part-time availability.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Best Ways to Share Your Availability
  </h2>

  <p>
    Once your availability link is created, there are many effective ways to share it and get more bookings. The easiest method is to place the link in your Instagram bio, allowing followers to instantly see when you are available. You can also send the link directly through text messages, WhatsApp, or email when clients inquire about your services.
  </p>

<p className="mt-6 text-gray-700 leading-relaxed">
  Another powerful method is turning your availability link into a QR code. With a QR code, clients can scan and access your schedule instantly from printed materials like business cards, flyers, posters, or even storefront displays. You can create a high-quality, printable QR code using{" "}
  <Link
    href="/qr-code-generator"
    className="text-indigo-600 font-medium hover:underline"
  >
    SimpleBookMe QR Code Generator
  </Link>{" "}
  and attach it to all your marketing materials.
</p>

  <p>
    QR codes are especially effective for in-person businesses because they remove friction. Instead of typing a link, customers simply scan and access your availability within seconds.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Availability Link vs Full Booking Website
  </h2>

  <p>
    An availability link is a simple and effective way to show your schedule, but it does not fully automate bookings. Clients still need to contact you to confirm a time. If you want a more advanced solution, a full booking website allows customers to select a time, confirm appointments, and receive automated confirmations.
  </p>

  <p>
    Many businesses start with an availability link and later upgrade to a complete booking system as they grow. This makes it a perfect first step for new or small businesses looking to improve their workflow without adding complexity.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Improve Your Business with Simple Tools
  </h2>

  <p>
    Using simple tools like availability links and QR codes can significantly improve how clients interact with your business. When customers can quickly see your schedule and access your services, they are more likely to book and less likely to move on to a competitor.
  </p>

  <p>
    By combining your availability page with tools like QR codes, social media, and direct messaging, you create a seamless experience that turns interest into real bookings.
  </p>

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