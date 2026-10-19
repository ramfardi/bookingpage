"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
const DAYS = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
];

export default function AvailabilityGeneratorPage() {
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Monday","Tuesday","Wednesday","Thursday","Friday",
  ]);
  const router = useRouter();

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
  const [contact, setContact] = useState({ email: "", phone: "", address: "" });
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const logoInput = useRef<HTMLInputElement>(null);
  const logoRequest = useRef(0);
  const submitting = useRef(false);
  
  

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const request = ++logoRequest.current;
    setLogoError("");
    setLogoLoading(true);
    try {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        throw new Error("Choose a JPG, PNG, or WebP image.");
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Choose an image smaller than 5 MB.");
      }
      const url = URL.createObjectURL(file);
      try {
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("This image could not be opened."));
          img.src = url;
        });
        const scale = Math.min(1, 512 / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Image processing is unavailable. Please try another browser.");
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        // A small data URL keeps the existing JSON request format.
        // The create API must explicitly validate and persist this new field.
        const result = canvas.toDataURL("image/webp", 0.85);
        if (result.length > 350_000) {
          throw new Error("This logo is too large after resizing. Please choose a simpler image.");
        }
        if (request === logoRequest.current) setLogoDataUrl(result);
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (request === logoRequest.current) {
        setLogoError(err instanceof Error ? err.message : "Could not load the logo.");
        if (logoInput.current) logoInput.current.value = "";
      }
    } finally {
      if (request === logoRequest.current) setLogoLoading(false);
    }
  }

  function removeLogo() {
    ++logoRequest.current;
    setLogoDataUrl("");
    setLogoError("");
    setLogoLoading(false);
    if (logoInput.current) logoInput.current.value = "";
  }

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

  async function generateAvailabilityLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || logoLoading) return;
    setError("");
    if (!selectedDays.length) {
      setError("Select at least one available day.");
      return;
    }
    submitting.current = true;
    setSaving(true);
    setGeneratedLink("");
    setEditLink("");
    try {
      const siteId = crypto.randomUUID().slice(0, 8);
      const editToken = crypto.randomUUID().slice(0, 16);
      const payload = {
        siteId,
        editToken,
        businessName: businessName.trim(),
        selectedDays,
        dayTimes,
        contact: {
          email: contact.email.trim(),
          phone: contact.phone.trim(),
          address: contact.address.trim(),
        },
        logoDataUrl,
		bookingUrl: bookingUrl.trim(),
      };
      const res = await fetch("/api/availability/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || typeof data?.subdomain !== "string") {
        throw new Error(data?.error || "Could not create your availability link. Please try again.");
      }
      setGeneratedLink(`https://${data.subdomain}.simplebookme.com`);
      setEditLink(`${window.location.origin}/availability/${siteId}/edit?token=${editToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

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
        <form onSubmit={generateAvailabilityLink} className="mt-10 bg-gray-50 p-8 rounded-2xl border">
          <fieldset disabled={saving} className="space-y-6 disabled:opacity-70">

          {/* Days */}
          <div>
            <label className="block font-medium mb-2">
              Select Available Days
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={selectedDays.includes(day)}
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
                    required
                    aria-label={`${day} start time`}
                    value={dayTimes[day].start}
                    onChange={(e) =>
                      updateDayTime(day, "start", e.target.value)
                    }
                    className="border rounded-lg px-3 py-2"
                  />

                  <input
                    type="time"
                    required
                    aria-label={`${day} end time`}
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

          {/* Business details */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900">Business details</h2>
            <p className="text-sm text-gray-600">
              Contact details and your logo are optional. Information entered here is intended for your public availability page.
            </p>
            <label className="block font-medium">
              Business name
              <input type="text" autoComplete="organization" maxLength={100}
                value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                className="mt-2 w-full border rounded-lg px-4 py-3 font-normal" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block font-medium">
                Email (optional)
                <input type="email" autoComplete="email" maxLength={254}
                  placeholder="hello@yourbusiness.com" value={contact.email}
                  onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))}
                  className="mt-2 w-full border rounded-lg px-4 py-3 font-normal" />
              </label>
              <label className="block font-medium">
                Phone number (optional)
                <input type="tel" autoComplete="tel" maxLength={50}
                  placeholder="Include your country code" value={contact.phone}
                  onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))}
                  className="mt-2 w-full border rounded-lg px-4 py-3 font-normal" />
              </label>
            </div>
			<label className="block font-medium">
			  Booking link (optional)

			  <input
				type="url"
				maxLength={2048}
				placeholder="https://your-booking-website.com"
				value={bookingUrl}
				onChange={(e) => setBookingUrl(e.target.value)}
				aria-describedby="booking-link-help"
				className="mt-2 w-full border rounded-lg px-4 py-3 font-normal"
			  />

			  <span
				id="booking-link-help"
				className="mt-2 block text-sm font-normal text-gray-500"
			  >
				Visitors can click an available hour to open this booking page.
				Include https:// at the beginning.
			  </span>
			</label>
            <label className="block font-medium">
              Address (optional)
              <textarea autoComplete="street-address" rows={2} maxLength={500}
                placeholder="Your business address" value={contact.address}
                onChange={(e) => setContact((prev) => ({ ...prev, address: e.target.value }))}
                className="mt-2 w-full border rounded-lg px-4 py-3 font-normal" />
            </label>
            <div>
              <label htmlFor="business-logo" className="block font-medium">Business logo (optional)</label>
              <p id="logo-help" className="mt-1 text-sm text-gray-600">JPG, PNG, or WebP, up to 5 MB.</p>
              <input ref={logoInput} id="business-logo" type="file"
                accept="image/jpeg,image/png,image/webp" aria-describedby="logo-help"
                onChange={handleLogoChange} className="mt-3 block w-full text-sm" />
              {logoLoading && <p role="status" className="mt-2 text-sm">Preparing logo…</p>}
              {logoError && <p role="alert" className="mt-2 text-sm text-red-600">{logoError}</p>}
              {logoDataUrl && (
                <div className="mt-4 flex items-center gap-4">
                  {/* A native image supports the locally processed data URL. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoDataUrl} alt="Business logo preview" width={96} height={96}
                    className="h-24 w-24 rounded-xl border bg-white p-2 object-contain" />
                  <button type="button" onClick={removeLogo} className="text-sm text-red-600 hover:underline">Remove logo</button>
                </div>
              )}
            </div>
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={saving || logoLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Creating your link…" : logoLoading ? "Preparing logo…" : "Generate Live Availability Link"}
          </button>
          </fieldset>
        </form>

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
          rel="noopener noreferrer"
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
          rel="noopener noreferrer"
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