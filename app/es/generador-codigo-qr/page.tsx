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
    question: "¿Para qué se utiliza un código QR?",
    answer:
      "Los códigos QR permiten a los clientes abrir instantáneamente un sitio web, una página de reservas, un menú, un formulario de contacto, una página de pago o un perfil de redes sociales escaneando el código con la cámara de su teléfono."
  },
  {
    question: "¿Puedo imprimir códigos QR en tarjetas de presentación?",
    answer:
      "Sí. Los códigos QR se imprimen comúnmente en tarjetas de presentación para que los clientes puedan escanearlos y visitar instantáneamente tu sitio web, página de reservas o datos de contacto sin tener que escribir una dirección web."
  },
  {
    question: "¿Qué tamaño debe tener un código QR para imprimir?",
    answer:
      "Para un escaneo confiable, los códigos QR impresos normalmente deben tener al menos 2–3 cm de ancho. Los archivos PNG de alta resolución o SVG escalables garantizan que el código QR se mantenga nítido y legible al imprimir."
  },
  {
    question: "¿Puedo añadir mi logotipo dentro de un código QR?",
    answer:
      "Sí. Los códigos QR pueden incluir un logotipo en el centro si se generan con una corrección de errores alta. Esto ayuda a mantener la capacidad de escaneo mientras añade una imagen de marca profesional."
  },
  {
    question: "¿Los códigos QR expiran?",
    answer:
      "Los códigos QR estándar no expiran. Mientras el enlace de destino permanezca activo, el código QR seguirá funcionando indefinidamente."
  },
  {
    question: "¿Dónde deberían colocar los negocios los códigos QR?",
    answer:
      "Los negocios suelen colocar códigos QR en vitrinas, volantes, menús, empaques de productos, carteles y tarjetas de presentación para que los clientes puedan acceder rápidamente a sitios web, páginas de reserva o promociones."
  },
  {
    question: "¿Cuál es la diferencia entre códigos QR en formato PNG y SVG?",
    answer:
      "Los archivos PNG son imágenes de alta resolución adecuadas para la mayoría de los usos, mientras que los archivos SVG son gráficos vectoriales que pueden escalarse infinitamente sin perder calidad. SVG es ideal para impresiones grandes como pancartas o señalización."
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
  <main className={`${poppins.className} min-h-screen bg-white px-6 py-24 flex justify-center`}>

    {/* Structured Data - Tool Schema */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Generador de Códigos QR",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description":
        "Generador gratuito de códigos QR para crear códigos QR imprimibles de alta resolución para tarjetas de presentación, páginas de reserva y materiales de marketing.",
      "url": "https://simplebookme.com/es/generador-codigo-qr"
    }),
  }}
/>

<div className="w-full max-w-4xl">

  <div className="mb-8">
    <Link
      href="/es/guide"
      className="text-sm text-indigo-600 hover:underline"
    >
      ← Volver a la Guía de Negocios
    </Link>
  </div>

  <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
    Generador Gratuito de Códigos QR con Marca para Negocios
  </h1>

  <p className="mt-6 text-lg text-gray-600 leading-relaxed">
    Crea un código QR profesional con la marca de tu negocio en segundos.
    Añade el nombre de tu empresa, número de teléfono, correo electrónico
    e incluso sube tu logotipo para colocarlo dentro del código QR.
    Perfecto para tarjetas de presentación, volantes, vitrinas,
    empaques de productos, mesas de restaurantes y páginas de reserva.
  </p>

  {/* INPUT SECTION */}
  <div className="mt-12 bg-gray-50 p-8 rounded-2xl border space-y-6">

    <div>
      <label className="block text-sm font-medium text-gray-700">
        Enlace del Sitio Web (Requerido)
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
        Nombre del Negocio (Opcional)
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
        Servicios (Opcional – separados por coma)
      </label>
      <input
        type="text"
        value={services}
        onChange={(e) => setServices(e.target.value)}
        placeholder="Corte de cabello, Barba, Coloración"
        className="mt-2 w-full rounded-lg border px-4 py-3"
      />
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Teléfono (Opcional)
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
          Correo Electrónico (Opcional)
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
        Subir Logotipo (Opcional)
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
      {loading ? "Generando..." : "Generar Código QR con Marca"}
    </button>
  </div>

  {/* PREVIEW */}
  {pngDataUrl && (
    <div className="mt-12 text-center">

      <img
        src={pngDataUrl}
        alt="Código QR generado"
        className="mx-auto w-64 border rounded-xl"
      />

      <div className="mt-6 flex justify-center gap-4 flex-wrap">
        <button
          onClick={downloadPNG}
          className="rounded-xl bg-green-600 text-white px-6 py-3 font-semibold hover:bg-green-700 transition"
        >
          Descargar PNG
        </button>

        <button
          onClick={downloadSVG}
          className="rounded-xl bg-gray-800 text-white px-6 py-3 font-semibold hover:bg-gray-900 transition"
        >
          Descargar SVG
        </button>

        <button
          onClick={downloadBusinessCard}
          className="rounded-xl bg-purple-600 text-white px-6 py-3 font-semibold hover:bg-purple-700 transition"
        >
          Descargar Tarjeta de Presentación Vertical (Lista para Imprimir)
        </button>

      </div>
    </div>
  )}
{/* SEO CONTENT */}
<div className="mt-20 space-y-6 text-gray-700 leading-relaxed">

  <h2 className="text-2xl font-semibold text-gray-900">
    ¿Por Qué Usar un Código QR con Marca?
  </h2>

  <p>
    Un código QR con marca genera confianza y aumenta la tasa de escaneo.
    Cuando los clientes ven el nombre y el logotipo de tu negocio integrados
    en el QR, se percibe como algo profesional y seguro. Los códigos QR
    genéricos suelen parecer anónimos, pero un diseño personalizado refuerza
    la identidad de tu marca y mejora la credibilidad.
  </p>

  <p>
    Hoy en día, los negocios utilizan códigos QR para enlaces de reservas,
    menús digitales, páginas de reseñas en Google, formularios de contacto,
    redes sociales y promociones. Añadir tu marca garantiza que, incluso si
    alguien comparte la imagen del QR, la identidad de tu negocio viajará
    junto con él.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Mejores Prácticas para Códigos QR que Generan Más Conversiones
  </h2>

  <ul className="list-disc pl-6 space-y-3">
    <li>Usa un llamado a la acción claro como “Escanea para Reservar Ahora”.</li>
    <li>Prueba siempre tu código QR antes de imprimirlo.</li>
    <li>Colócalo donde los clientes lo vean de forma natural.</li>
    <li>Usa archivos de alta resolución para imprimir.</li>
    <li>Asegura un buen contraste para facilitar el escaneo.</li>
  </ul>

  <p>
    Nuestro generador crea códigos QR de alta resolución y listos para
    impresión con márgenes adecuados para garantizar máxima compatibilidad
    en smartphones. El formato SVG opcional permite escalar el QR sin
    perder calidad, ideal para banners grandes o señalización en vitrinas.
  </p>

  <p>
    Ya seas propietario de un salón, negocio de limpieza, restaurante,
    agente inmobiliario, entrenador o proveedor de servicios, un código QR
    profesional puede simplificar la interacción con los clientes y aumentar
    las conversiones.
  </p>

</div>


{/* FAQ Section */}
<div className="mt-20">
  <h2 className="text-3xl font-bold text-gray-900 mb-8">
    Preguntas Frecuentes
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
    ¿Necesitas una Página de Reservas para Vincular a tu QR?
  </h3>

  <p className="mt-4 text-gray-600">
    Crea un sitio web profesional de reservas y genera códigos QR
    que permitan a los clientes escanear y reservar al instante.
  </p>

  <button
    onClick={() => router.push("/es/setup")}
    className="mt-6 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
  >
    Crear tu Sitio Web de Reservas
  </button>
</div>

</div>
    </main>
  );
}
