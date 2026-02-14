"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function QRCodeGeneratorPage() {
  const router = useRouter();

  const [inputUrl, setInputUrl] = useState("");
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [svgData, setSvgData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {
    if (!inputUrl) return;

    setLoading(true);

    try {
      // Generate high-resolution PNG
      const png = await QRCode.toDataURL(inputUrl, {
        width: 2000,
        margin: 4,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      // Generate SVG
      const svg = await QRCode.toString(inputUrl, {
        type: "svg",
        margin: 4,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      setPngDataUrl(png);
      setSvgData(svg);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const downloadPNG = () => {
    if (!pngDataUrl) return;

    const link = document.createElement("a");
    link.href = pngDataUrl;
    link.download = "business-qr-code.png";
    link.click();
  };

  const downloadSVG = () => {
    if (!svgData) return;

    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "business-qr-code.svg";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-white px-6 py-24 flex justify-center">
      <div className="w-full max-w-4xl">

        <div className="mb-8">
          <Link
            href="/guide"
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Back to Business Guide
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Free QR Code Generator (PNG & SVG Download)
        </h1>

        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          Generate a high-resolution QR code for your website, booking page,
          Google reviews, or social media. Download it as a print-ready PNG
          or scalable SVG format.
        </p>

        {/* Input Section */}
        <div className="mt-12 bg-gray-50 p-8 rounded-2xl border">

          <label className="block text-sm font-medium text-gray-700">
            Paste Your Link Below
          </label>

          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="mt-3 w-full rounded-lg border px-4 py-3"
          />

          <button
            onClick={generateQR}
            className="mt-6 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
          >
            {loading ? "Generating..." : "Generate QR Code"}
          </button>

        </div>

        {/* QR Preview & Downloads */}
        {pngDataUrl && (
          <div className="mt-12 text-center">

            <img
              src={pngDataUrl}
              alt="Generated QR Code"
              className="mx-auto w-64 h-64 border rounded-xl"
            />

            <p className="mt-4 text-gray-600">
              Print-safe QR code with proper margin and high resolution.
            </p>

            <div className="mt-6 flex justify-center gap-4 flex-wrap">

              <button
                onClick={downloadPNG}
                className="rounded-xl bg-green-600 text-white px-6 py-3 font-semibold hover:bg-green-700 transition"
              >
                Download PNG (High Resolution)
              </button>

              <button
                onClick={downloadSVG}
                className="rounded-xl bg-gray-800 text-white px-6 py-3 font-semibold hover:bg-gray-900 transition"
              >
                Download SVG (Vector Format)
              </button>

            </div>

          </div>
        )}

        {/* SEO Content */}
        <div className="mt-20 space-y-8 text-gray-700 leading-relaxed">

          <h2 className="text-2xl font-semibold text-gray-900">
            When Should You Use PNG vs SVG?
          </h2>

          <p>
            Use PNG if you're uploading the QR code to social media,
            sending it by email, or printing small business cards.
          </p>

          <p>
            Use SVG if you're working with a designer, printing large banners,
            or want perfect scaling without quality loss.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900">
            Best Uses for Business QR Codes
          </h2>

          <ul className="list-disc pl-6 space-y-3">
            <li>Business cards</li>
            <li>Flyers & brochures</li>
            <li>Window signage</li>
            <li>Product packaging</li>
            <li>Direct link to booking page</li>
          </ul>

        </div>

        {/* CTA */}
        <div className="mt-16 p-8 bg-gray-50 rounded-2xl text-center">
          <h3 className="text-2xl font-semibold text-gray-900">
            Need a Booking Link to Attach?
          </h3>

          <p className="mt-4 text-gray-600">
            Create your booking website and generate a QR code that
            lets customers scan and book instantly.
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
