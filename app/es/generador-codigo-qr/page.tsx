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

  const generateQR = async () => {
    if (!inputUrl) return;

    setLoading(true);

    try {
      const size = 2000;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      canvas.width = size;
      canvas.height = size + 400;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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

      if (businessName) {
        ctx.fillStyle = "#000000";
        ctx.font = "bold 80px Arial";
        ctx.textAlign = "center";
        ctx.fillText(businessName, size / 2, 120);
      }

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

      if (logoFile) {
        const logoImg = new Image();
        const reader = new FileReader();

        await new Promise<void>((resolve) => {
          reader.onload = () => {
            logoImg.src = reader.result as string;
          };

          logoImg.onload = () => {
            const logoSize = size * 0.18;
            const x = size / 2 - logoSize / 2;
            const y = 200 + size / 2 - logoSize / 2;

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x - 40, y - 40, logoSize + 80, logoSize + 80);

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
    link.download = "codigo-qr-negocio.png";
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

    if (businessName) {
      ctx.fillStyle = "#000000";
      ctx.font = "bold 40px Poppins";
      ctx.textAlign = "center";
      ctx.fillText(businessName, cardWidth / 2, 80);
    }

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

    if (logoFile) {
      const logoImg = new Image();
      const reader = new FileReader();

      await new Promise<void>((resolve) => {
        reader.onload = () => {
          logoImg.src = reader.result as string;
        };

        logoImg.onload = () => {
          const logoSize = qrSize * 0.2;
          const x = qrX + qrSize / 2 - logoSize / 2;
          const y = qrY + qrSize / 2 - logoSize / 2;

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x - 15, y - 15, logoSize + 30, logoSize + 30);

          ctx.drawImage(logoImg, x, y, logoSize, logoSize);
          resolve();
        };

        reader.readAsDataURL(logoFile);
      });
    }

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
    link.download = "tarjeta-negocio-qr.png";
    link.click();
  };

  const downloadSVG = () => {
    if (!svgData) return;
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "codigo-qr-negocio.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className={`${poppins.className} min-h-screen bg-white px-6 py-24 flex justify-center`}>
      <div className="w-full max-w-4xl">

        <div className="mb-8">
          <Link
            href="/es/guide"
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Volver a la guía empresarial
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Generador Gratis de Códigos QR para Negocios
        </h1>

        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          Crea un código QR profesional con la imagen de tu negocio en segundos.
          Añade el nombre de tu empresa, teléfono, correo electrónico e incluso
          sube tu logotipo para colocarlo dentro del código QR.
        </p>

        {/* INPUT SECTION */}

        <div className="mt-12 bg-gray-50 p-8 rounded-2xl border space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Enlace del sitio web (obligatorio)
            </label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://tusitio.com"
              className="mt-2 w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del negocio (opcional)
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
              Servicios (opcional – separados por coma)
            </label>
            <input
              type="text"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="Corte de pelo, Barba, Color"
              className="mt-2 w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teléfono (opcional)
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
                Correo electrónico (opcional)
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
              Subir logotipo (opcional)
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
            {loading ? "Generando..." : "Generar código QR"}
          </button>

        </div>

      </div>
    </main>
  );
}