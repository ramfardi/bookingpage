"use client";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

import { Poppins } from "next/font/google";
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
      question: "کد QR برای چه استفاده می‌شود؟",
      answer:
        "کدهای QR به مشتریان اجازه می‌دهند تنها با اسکن کردن کد با دوربین تلفن همراه، فوراً یک وب‌سایت، صفحه رزرو، منو، فرم تماس، صفحه پرداخت یا شبکه اجتماعی را باز کنند."
    },
    {
      question: "آیا می‌توان کد QR را روی کارت ویزیت چاپ کرد؟",
      answer:
        "بله. کدهای QR معمولاً روی کارت‌های ویزیت چاپ می‌شوند تا مشتریان بتوانند با اسکن آن فوراً وارد وب‌سایت، صفحه رزرو یا اطلاعات تماس شما شوند."
    },
    {
      question: "اندازه مناسب کد QR برای چاپ چقدر است؟",
      answer:
        "برای اسکن مطمئن، معمولاً عرض کد QR باید حداقل ۲ تا ۳ سانتی‌متر باشد. فایل‌های PNG با کیفیت بالا یا SVG باعث می‌شوند کد هنگام چاپ واضح باقی بماند."
    },
    {
      question: "آیا می‌توان لوگوی شرکت را داخل کد QR قرار داد؟",
      answer:
        "بله. با استفاده از سطح تصحیح خطای بالا می‌توان لوگو را در مرکز کد QR قرار داد بدون اینکه قابلیت اسکن آن از بین برود."
    },
    {
      question: "آیا کدهای QR منقضی می‌شوند؟",
      answer:
        "کدهای QR معمولی منقضی نمی‌شوند. تا زمانی که لینک مقصد فعال باشد کد همچنان کار خواهد کرد."
    },
    {
      question: "کسب‌وکارها کد QR را کجا قرار می‌دهند؟",
      answer:
        "کسب‌وکارها معمولاً کد QR را روی ویترین فروشگاه، بروشورها، منوها، بسته‌بندی محصولات، پوسترها و کارت‌های ویزیت قرار می‌دهند."
    },
    {
      question: "تفاوت PNG و SVG چیست؟",
      answer:
        "PNG تصویر با کیفیت بالا است، در حالی که SVG گرافیک برداری است و می‌توان آن را بدون افت کیفیت در هر اندازه‌ای چاپ کرد."
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


      ctx.drawImage(qrCanvas, 0, 350, size, size);

      // Business Name (top)
      if (businessName) {
        ctx.fillStyle = "#000000";
        ctx.font = "bold 80px Arial";
        ctx.textAlign = "center";
        ctx.fillText(businessName, size / 2, 120);
      }
	  
	  // Services block (between name and QR)
		if (services) {
		  const serviceList = services.split(",");
		  ctx.font = "55px Arial";
		  ctx.fillStyle = "#333333";
		  ctx.textAlign = "center";

		  let serviceY = 180;

		  serviceList.forEach((service) => {
			ctx.fillText(service.trim(), size / 2, serviceY);
			serviceY += 70;
		  });
		}


      // Phone & Email (bottom)
      ctx.font = "60px Arial";
      ctx.fillStyle = "#000000";
      let bottomY = size + 260;

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
		  const y = 200 + size / 2 - logoSize / 2;

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

  let bottomY = 720;

  if (phone) {
    ctx.fillText(phone, cardWidth / 2, bottomY);
    bottomY += 40;
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
  <main dir="rtl" className={`${poppins.className} min-h-screen bg-white px-6 py-24 flex justify-center`}>

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
          ساخت رایگان کد QR برای کسب‌وکارها
        </h1>

        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          در چند ثانیه یک کد QR حرفه‌ای برای کسب‌وکار خود بسازید. می‌توانید نام شرکت، شماره تلفن،
          ایمیل و حتی لوگوی خود را داخل کد قرار دهید.
        </p>

        {/* INPUT SECTION */}
        <div className="mt-12 bg-gray-50 p-8 rounded-2xl border space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700">
              لینک وب‌سایت (الزامی)
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
                            نام کسب‌وکار (اختیاری)
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
			خدمات (اختیاری – با ویرگول جدا کنید)
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
                شماره تلفن (اختیاری)
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
                ایمیل (اختیاری)
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
            {loading ? "در حال ساخت..." : "ساخت کد QR"}
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
			  
			  <button
			  onClick={downloadBusinessCard}
			  className="rounded-xl bg-purple-600 text-white px-6 py-3 font-semibold hover:bg-purple-700 transition"
			>
			  Download Vertical Business Card (Print Ready)
			</button>

            </div>
          </div>
        )}

{/* SEO CONTENT */}
<div className="mt-20 space-y-6 text-gray-700 leading-relaxed">

  <h2 className="text-2xl font-semibold text-gray-900">
    چرا از کد QR اختصاصی برای کسب‌وکار استفاده کنیم؟
  </h2>

  <p>
    استفاده از کد QR اختصاصی باعث افزایش اعتماد مشتریان و بالا رفتن
    میزان اسکن می‌شود. زمانی که مشتریان نام کسب‌وکار و لوگوی شما را
    داخل کد QR مشاهده می‌کنند، احساس حرفه‌ای بودن و امنیت بیشتری
    خواهند داشت. کدهای QR معمولی اغلب ظاهری عمومی و ناشناس دارند،
    اما یک کد QR سفارشی می‌تواند هویت برند شما را تقویت کرده و
    اعتبار کسب‌وکارتان را افزایش دهد.
  </p>

  <p>
    امروزه بسیاری از کسب‌وکارها از کدهای QR برای لینک رزرو آنلاین،
    منوی دیجیتال رستوران، صفحه نظرات گوگل، فرم‌های تماس،
    شبکه‌های اجتماعی و حتی کمپین‌های تبلیغاتی استفاده می‌کنند.
    وقتی برند خود را به کد QR اضافه می‌کنید، حتی اگر تصویر کد
    توسط دیگران به اشتراک گذاشته شود، هویت کسب‌وکار شما نیز
    همراه آن منتقل خواهد شد.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    نکات مهم برای ساخت کد QR مؤثر
  </h2>

  <ul className="list-disc pl-6 space-y-3">
    <li>از متن‌های واضح مانند «برای رزرو اسکن کنید» استفاده کنید.</li>
    <li>قبل از چاپ، کد QR را حتماً تست کنید.</li>
    <li>کد را در جایی قرار دهید که مشتریان به‌راحتی آن را ببینند.</li>
    <li>برای چاپ از فایل‌های با کیفیت بالا استفاده کنید.</li>
    <li>کنتراست مناسب بین رنگ‌ها را حفظ کنید تا اسکن آسان‌تر شود.</li>
  </ul>

  <p>
    ابزار ما کدهای QR با کیفیت بالا و مناسب چاپ تولید می‌کند
    که حاشیه‌های استاندارد دارند و روی اکثر گوشی‌های هوشمند
    به‌راحتی اسکن می‌شوند. همچنین امکان دانلود فایل SVG وجود دارد
    که بدون افت کیفیت در هر اندازه‌ای قابل استفاده است و برای
    بنرها، تابلوهای فروشگاهی و چاپ‌های بزرگ ایده‌آل است.
  </p>

  <p>
    فرقی نمی‌کند صاحب سالن زیبایی باشید، یک کسب‌وکار خدماتی
    مثل نظافت داشته باشید، رستوران اداره کنید یا در حوزه
    املاک فعالیت کنید؛ یک کد QR حرفه‌ای می‌تواند ارتباط
    با مشتریان را سریع‌تر کرده و نرخ تبدیل مشتری را افزایش دهد.
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
    به یک وب‌سایت رزرو برای اتصال به کد QR خود نیاز دارید؟
  </h3>

  <p className="mt-4 text-gray-600">
    یک وب‌سایت رزرو حرفه‌ای ایجاد کنید و کدهای QR بسازید تا مشتریان
    بتوانند تنها با اسکن کردن، فوراً وارد صفحه رزرو شده و وقت خود را ثبت کنند.
  </p>

  <button
    onClick={() => router.push("/setup")}
    className="mt-6 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
  >
    ساخت وب‌سایت رزرو
  </button>
</div>

      </div>
    </main>
  );
}
