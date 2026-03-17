"use client";

import { Poppins } from "next/font/google";
import { useState } from "react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import Link from "next/link";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function GoogleReviewQRPage() {
  const router = useRouter();

  const [inputUrl, setInputUrl] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [svgData, setSvgData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {
    if (!inputUrl) return;

    setLoading(true);

    try {
      const size = 1200;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = size;
      canvas.height = size + 200;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const qrCanvas = document.createElement("canvas");

      await QRCode.toCanvas(qrCanvas, inputUrl, {
        width: size,
        margin: 4,
        errorCorrectionLevel: "H",
      });

      ctx.drawImage(qrCanvas, 0, 200, size, size);

      // Business Name
      if (businessName) {
        ctx.fillStyle = "#000000";
        ctx.font = "bold 60px Poppins";
        ctx.textAlign = "center";
        ctx.fillText(businessName, size / 2, 100);
      }

      const png = canvas.toDataURL("image/png");
      setPngDataUrl(png);

      const svg = await QRCode.toString(inputUrl, {
        type: "svg",
      });

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
    link.download = "google-review-qr.png";
    link.click();
  };

  const downloadSVG = () => {
    if (!svgData) return;
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "google-review-qr.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className={`${poppins.className} min-h-screen bg-white px-6 py-24 flex justify-center`}>
      <div className="w-full max-w-4xl">

        <div className="mb-8">
          <Link href="/tools" className="text-sm text-indigo-600 hover:underline">
            ← Back to Tools
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900">
          Google Review QR Code Generator
        </h1>

        <p className="mt-6 text-lg text-gray-600">
          Generate a QR code that sends customers directly to your Google review page.
          Perfect for business cards, receipts, storefronts, and packaging.
        </p>

        {/* INPUT */}
        <div className="mt-10 bg-gray-50 p-8 rounded-2xl border space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Google Review Link
            </label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste your Google review link"
              className="mt-2 w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Name (Optional)
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3"
            />
          </div>

          <button
            onClick={generateQR}
            className="rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700"
          >
            {loading ? "Generating..." : "Generate QR Code"}
          </button>

        </div>

        {/* RESULT */}
        {pngDataUrl && (
          <div className="mt-12 text-center">
            <img src={pngDataUrl} className="mx-auto w-64 border rounded-xl" />

            <div className="mt-6 flex justify-center gap-4">
              <button onClick={downloadPNG} className="bg-green-600 text-white px-6 py-3 rounded-xl">
                Download PNG
              </button>

              <button onClick={downloadSVG} className="bg-gray-800 text-white px-6 py-3 rounded-xl">
                Download SVG
              </button>
            </div>
          </div>
        )}

        {/* HOW TO GET LINK */}
        <div className="mt-20 space-y-6 text-gray-700">

          <h2 className="text-2xl font-semibold text-gray-900">
            How to Get Your Google Review Link
          </h2>

          <ol className="list-decimal pl-6 space-y-3">
            <li>Search your business name on Google.</li>
            <li>Click on your Google Business profile.</li>
            <li>Click “Ask for reviews”.</li>
            <li>Copy the review link provided by Google.</li>
            <li>Paste it into the generator above.</li>
          </ol>

          <h2 className="text-2xl font-semibold text-gray-900">
            Where to Use Your Review QR Code
          </h2>

          <ul className="list-disc pl-6 space-y-2">
            <li>Business cards</li>
            <li>Receipts and invoices</li>
            <li>Storefront windows</li>
            <li>Packaging</li>
            <li>Flyers and posters</li>
          </ul>

          <p>
            Adding a QR code for reviews makes it extremely easy for customers
            to leave feedback, increasing your rating and improving trust.
          </p>

        </div>

        {/* CTA */}
        <div className="mt-16 p-8 bg-gray-50 rounded-2xl text-center">
          <h3 className="text-2xl font-semibold text-gray-900">
            Want More Customers From Google?
          </h3>

          <p className="mt-4 text-gray-600">
            Create a booking website and combine it with QR codes to turn visitors into paying customers.
          </p>

          <button
            onClick={() => router.push("/setup")}
            className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl"
          >
            Create Your Booking Website
          </button>
        </div>

      </div>
    </main>
  );
}