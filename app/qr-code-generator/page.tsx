"use client";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});


import { useState, useRef } from "react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function QRCodeGeneratorPage() {
  const router = useRouter();
  const [services, setServices] = useState("");


  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [inputUrl, setInputUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [svgData, setSvgData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
  setOpenFaq(openFaq === index ? null : index);
};
const faqs = [
  {
    question: "What is a QR code used for?",
    answer:
      "QR codes allow customers to instantly open a website, booking page, menu, contact form, payment page, or social media profile by scanning the code with their phone camera."
  },
  {
    question: "Can I print QR codes on business cards?",
    answer:
      "Yes. QR codes are commonly printed on business cards so customers can scan and instantly visit your website, booking page, or contact details without typing a web address."
  },
  {
    question: "What size should a QR code be for printing?",
    answer:
      "For reliable scanning, printed QR codes should usually be at least 2–3 cm wide. High-resolution PNG or scalable SVG files ensure the QR code remains sharp and readable when printed."
  },
  {
    question: "Can I add my logo inside a QR code?",
    answer:
      "Yes. QR codes can safely include a logo in the center if they are generated with high error correction. This helps maintain scannability while adding professional branding."
  },
  {
    question: "Do QR codes expire?",
    answer:
      "Standard QR codes do not expire. As long as the destination link remains active, the QR code will continue to work indefinitely."
  },
  {
    question: "Where should businesses place QR codes?",
    answer:
      "Businesses often place QR codes on storefront windows, flyers, menus, product packaging, posters, and business cards so customers can quickly access websites, booking pages, or promotions."
  },
  {
    question: "What is the difference between PNG and SVG QR codes?",
    answer:
      "PNG files are high-resolution images suitable for most uses, while SVG files are vector graphics that can be scaled infinitely without losing quality. SVG is ideal for large prints like banners or signage."
  }
];

  const generateQR = async () => {
    if (!inputUrl) return;

    setLoading(true);

    try {
      const size = 2000;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      canvas.width = size;
      canvas.height = size + 400; // extra space for text

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Generate QR
      const qrCanvas = document.createElement("canvas");
	await QRCode.toCanvas(qrCanvas, inputUrl, {
	  width: size,
	  margin: 6,
	  errorCorrectionLevel: "H",
	  color: {
		dark: "#000000",
		light: "#ffffff",
	  },
	});
	const font = new FontFace(
	  "GreatVibes",
	  "url(https://fonts.gstatic.com/s/greatvibes/v17/RWmMoKWR9v4ksMfaWd_JN9XFiaQ.woff2)"
	);

	await font.load();
	document.fonts.add(font);

      ctx.drawImage(qrCanvas, 0, 350, size, size);

      // Business Name (top)
      if (businessName) {
        ctx.fillStyle = "#000000";
        ctx.font = "bold 140px GreatVibes";
        ctx.textAlign = "center";
        ctx.fillText(businessName, size / 2, 320);
      }
	  
	  // Services block (between name and QR)
		if (services) {
		  const serviceList = services.split("|");
		  ctx.font = "70px Playfair";
		  ctx.fillStyle = "#333333";
		  ctx.textAlign = "center";

		  let serviceY = 450;

		  serviceList.forEach((service) => {
			ctx.fillText(service.trim(), size / 2, serviceY);
			serviceY += 70;
		  });
		}


      // Phone & Email (bottom)
      ctx.font = "80px Playfair";
      ctx.fillStyle = "#000000";
      let bottomY = size + 220;

      if (phone) {
        ctx.fillText(phone, size / 2, bottomY);
        bottomY += 80;
      }

      if (email) {
        ctx.fillText(email, size / 2, bottomY);
      }


	// Logo in center (optional)
	if (logoFile) {
	  const logoImg = new Image();
	  const reader = new FileReader();

	  await new Promise<void>((resolve) => {
		reader.onload = () => {
		  logoImg.src = reader.result as string;
		};

		logoImg.onload = () => {
		  const logoSize = size * 0.18; // smaller = safer
		  const x = size / 2 - logoSize / 2;
		  const y = 200 + size / 2 - logoSize / 4;

		  // Large white background for safety
		  ctx.fillStyle = "#ffffff";
		  ctx.fillRect(
			x - 40,
			y - 40,
			logoSize + 80,
			logoSize + 80
		  );

		  ctx.drawImage(logoImg, x, y, logoSize, logoSize);
		  resolve();
		};

		reader.readAsDataURL(logoFile);
	  });
	}


      const png = canvas.toDataURL("image/png");
      setPngDataUrl(png);

      const svg = await QRCode.toString(inputUrl, {
        type: "svg",
        margin: 4,
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
    link.download = "branded-business-qr.png";
    link.click();
  };
  
  const downloadBusinessCard = async () => {
  if (!inputUrl) return;

  const cardWidth = 600;
  const cardHeight = 850;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = cardWidth;
  canvas.height = cardHeight;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, cardWidth, cardHeight);

  // Business Name
  if (businessName) {
    ctx.fillStyle = "#000000";
    ctx.font = "bold 40px Poppins";
    ctx.textAlign = "center";
    ctx.fillText(businessName, cardWidth / 2, 80);
  }

  // Services
  if (services) {
    const serviceList = services.split(",");
    ctx.font = "26px Poppins";
    ctx.fillStyle = "#444444";

    let y = 130;
    serviceList.forEach((service) => {
      ctx.fillText(service.trim(), cardWidth / 2, y);
      y += 35;
    });
  }

  // Generate QR smaller for card
const qrCanvas = document.createElement("canvas");

await QRCode.toCanvas(qrCanvas, inputUrl, {
  width: 400,
  margin: 6,
  errorCorrectionLevel: "H",
});

const qrX = 100;
const qrY = 250;
const qrSize = 400;

ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

// Add logo inside QR (if exists)
if (logoFile) {
  const logoImg = new Image();
  const reader = new FileReader();

  await new Promise<void>((resolve) => {
    reader.onload = () => {
      logoImg.src = reader.result as string;
    };

    logoImg.onload = () => {
      const logoSize = qrSize * 0.2; // 20% safe
      const x = qrX + qrSize / 2 - logoSize / 2;
      const y = qrY + qrSize / 2 - logoSize / 2;

      // White background for safety
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        x - 15,
        y - 15,
        logoSize + 30,
        logoSize + 30
      );

      ctx.drawImage(logoImg, x, y, logoSize, logoSize);
      resolve();
    };

    reader.readAsDataURL(logoFile);
  });
}

  // Phone & Email
  ctx.font = "28px Arial";
  ctx.fillStyle = "#000000";

  let bottomY = 600;

  if (phone) {
    ctx.fillText(phone, cardWidth / 2, bottomY);
    bottomY += 80;
  }

  if (email) {
    ctx.fillText(email, cardWidth / 2, bottomY);
  }

  const dataUrl = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "vertical-business-card.png";
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
  <main className={`${poppins.className} min-h-screen bg-white px-6 py-24 flex justify-center`}>

    {/* Structured Data - Tool Schema */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "QR Code Generator",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "description":
            "Free QR code generator for creating high-resolution printable QR codes for business cards, booking pages, and marketing materials.",
          "url": "https://simplebookme.com/qr-code-generator"
        }),
      }}
    />
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
          Free Branded QR Code Generator for Businesses
        </h1>

        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          Create a professional QR code with your business branding in seconds.
          Add your company name, phone number, email address, and even upload
          your logo to place inside the QR code. Perfect for business cards,
          flyers, storefront windows, product packaging, restaurant tables,
          and booking pages.
        </p>

        {/* INPUT SECTION */}
        <div className="mt-12 bg-gray-50 p-8 rounded-2xl border space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website Link (Required)
            </label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
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
		  
		  <div>
		  <label className="block text-sm font-medium text-gray-700">
			Services (Optional – separate by comma)
		  </label>
		  <input
			type="text"
			value={services}
			onChange={(e) => setServices(e.target.value)}
			placeholder="Haircut, Beard Trim, Coloring"
			className="mt-2 w-full rounded-lg border px-4 py-3"
		  />
		</div>


          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone (Optional)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-lg border px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email (Optional)
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Logo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setLogoFile(e.target.files ? e.target.files[0] : null)
              }
              className="mt-2"
            />
          </div>

          <button
            onClick={generateQR}
            className="rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
          >
            {loading ? "Generating..." : "Generate Branded QR Code"}
          </button>
        </div>

        {/* PREVIEW */}
        {pngDataUrl && (
          <div className="mt-12 text-center">

            <img
              src={pngDataUrl}
              alt="Generated Branded QR Code"
              className="mx-auto w-64 border rounded-xl"
            />

            <div className="mt-6 flex justify-center gap-4 flex-wrap">
              <button
                onClick={downloadPNG}
                className="rounded-xl bg-green-600 text-white px-6 py-3 font-semibold hover:bg-green-700 transition"
              >
                Download PNG
              </button>

              <button
                onClick={downloadSVG}
                className="rounded-xl bg-gray-800 text-white px-6 py-3 font-semibold hover:bg-gray-900 transition"
              >
                Download SVG
              </button>
			  
{/* 
<button
  onClick={downloadBusinessCard}
  className="rounded-xl bg-purple-600 text-white px-6 py-3 font-semibold hover:bg-purple-700 transition"
>
  Download Vertical Business Card (Print Ready)
</button>
*/}

            </div>
          </div>
        )}

        {/* SEO CONTENT */}
        <div className="mt-20 space-y-6 text-gray-700 leading-relaxed">

          <h2 className="text-2xl font-semibold text-gray-900">
            Why Use a Branded QR Code?
          </h2>

          <p>
            A branded QR code builds trust and increases scan rates. When
            customers see your business name and logo integrated into the QR,
            it feels professional and secure. Generic QR codes often look
            anonymous, but a custom QR design reinforces brand identity and
            improves credibility.
          </p>

          <p>
            Businesses today use QR codes for booking links, digital menus,
            Google review pages, contact forms, social media, and promotions.
            Adding your branding ensures that even if someone shares your QR
            image, your business identity travels with it.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900">
            Best Practices for High-Converting QR Codes
          </h2>

          <ul className="list-disc pl-6 space-y-3">
            <li>Use clear call-to-action text like “Scan to Book Now”.</li>
            <li>Always test your QR before printing.</li>
            <li>Place it where customers naturally look.</li>
            <li>Use high-resolution files for printing.</li>
            <li>Ensure strong contrast for easy scanning.</li>
          </ul>

          <p>
            Our generator creates print-safe, high-resolution QR codes with
            proper margins to ensure maximum compatibility across smartphones.
            The optional SVG format allows unlimited scaling without quality
            loss, perfect for large banners or storefront signage.
          </p>

          <p>
            Whether you are a salon owner, cleaning business, restaurant,
            real estate agent, coach, or service provider, a professional QR
            code can streamline customer interaction and increase conversions.
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
