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
      question: "À quoi sert un code QR ?",
      answer:
        "Les codes QR permettent aux clients d’ouvrir instantanément un site web, une page de réservation, un menu, un formulaire de contact, une page de paiement ou un profil sur les réseaux sociaux simplement en scannant le code avec l’appareil photo de leur téléphone."
    },
    {
      question: "Peut-on imprimer des codes QR sur des cartes de visite ?",
      answer:
        "Oui. Les codes QR sont souvent imprimés sur les cartes de visite afin que les clients puissent scanner et visiter instantanément votre site web, votre page de réservation ou vos coordonnées sans taper une adresse web."
    },
    {
      question: "Quelle taille doit avoir un code QR pour l’impression ?",
      answer:
        "Pour un scan fiable, les codes QR imprimés doivent généralement mesurer au moins 2 à 3 cm de large. Les fichiers PNG haute résolution ou les fichiers SVG garantissent que le code QR reste net et lisible lors de l’impression."
    },
    {
      question: "Puis-je ajouter mon logo à l’intérieur d’un code QR ?",
      answer:
        "Oui. Les codes QR peuvent inclure un logo au centre lorsqu’ils sont générés avec une correction d’erreur élevée. Cela permet de conserver la lisibilité tout en ajoutant une image de marque professionnelle."
    },
    {
      question: "Les codes QR expirent-ils ?",
      answer:
        "Les codes QR standards n’expirent pas. Tant que le lien de destination reste actif, le code QR continuera de fonctionner indéfiniment."
    },
    {
      question: "Où les entreprises doivent-elles placer des codes QR ?",
      answer:
        "Les entreprises placent souvent des codes QR sur les vitrines, les flyers, les menus, les emballages produits, les affiches et les cartes de visite afin que les clients puissent accéder rapidement à des sites web, des pages de réservation ou des promotions."
    },
    {
      question: "Quelle est la différence entre un code QR PNG et SVG ?",
      answer:
        "Les fichiers PNG sont des images haute résolution adaptées à la plupart des usages, tandis que les fichiers SVG sont des graphiques vectoriels pouvant être agrandis à l’infini sans perte de qualité. Le SVG est idéal pour les grandes impressions comme les bannières ou les panneaux."
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
    link.download = "qr-code-entreprise.png";
    link.click();
  };

  const downloadSVG = () => {
    if (!svgData) return;
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-code-entreprise.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className={`${poppins.className} min-h-screen bg-white px-6 py-24 flex justify-center`}>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Générateur de Code QR",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description":
              "Générateur gratuit de codes QR haute résolution pour cartes de visite, pages de réservation et supports marketing.",
            "url": "https://simplebookme.com/fr/generateur-code-qr"
          }),
        }}
      />

      <div className="w-full max-w-4xl">

        <div className="mb-8">
          <Link
            href="/guide"
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Retour au Guide Business
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Générateur Gratuit de Codes QR Personnalisés pour Entreprises
        </h1>

        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          Créez un code QR professionnel avec l’identité de votre entreprise en
          quelques secondes. Ajoutez le nom de votre entreprise, votre numéro de
          téléphone, votre email et même votre logo au centre du code QR.
          Parfait pour les cartes de visite, flyers, vitrines, emballages
          produits, tables de restaurant et pages de réservation.
        </p>

        <div className="mt-12 bg-gray-50 p-8 rounded-2xl border space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lien du site web (Requis)
            </label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://votresite.com"
              className="mt-2 w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom de l'entreprise (Optionnel)
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
              Services (Optionnel – séparés par des virgules)
            </label>
            <input
              type="text"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="Coupe de cheveux, Barbe, Coloration"
              className="mt-2 w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Téléphone (Optionnel)
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
                Email (Optionnel)
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
              Télécharger un logo (Optionnel)
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
            {loading ? "Génération..." : "Générer le Code QR"}
          </button>
        </div>
{/* PREVIEW */}
{pngDataUrl && (
  <div className="mt-12 text-center">

    <img
      src={pngDataUrl}
      alt="Code QR généré"
      className="mx-auto w-64 border rounded-xl"
    />

    <div className="mt-6 flex justify-center gap-4 flex-wrap">
      <button
        onClick={downloadPNG}
        className="rounded-xl bg-green-600 text-white px-6 py-3 font-semibold hover:bg-green-700 transition"
      >
        Télécharger PNG
      </button>

      <button
        onClick={downloadSVG}
        className="rounded-xl bg-gray-800 text-white px-6 py-3 font-semibold hover:bg-gray-900 transition"
      >
        Télécharger SVG
      </button>
    </div>
  </div>
)}

{/* SEO TEXT */}
<div className="mt-20 space-y-6 text-gray-700 leading-relaxed">

  <h2 className="text-2xl font-semibold text-gray-900">
    Pourquoi utiliser un code QR personnalisé ?
  </h2>

  <p>
    Un code QR personnalisé renforce la confiance et augmente le taux de
    scan. Lorsque les clients voient le nom et le logo de votre entreprise
    intégrés dans le code QR, cela paraît plus professionnel et sécurisé.
  </p>

  <p>
    Aujourd’hui, les entreprises utilisent des codes QR pour les liens de
    réservation, les menus numériques, les pages d’avis Google, les
    formulaires de contact, les réseaux sociaux et les promotions.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Bonnes pratiques pour les codes QR
  </h2>

  <ul className="list-disc pl-6 space-y-3">
    <li>Ajoutez un appel à l’action clair comme “Scannez pour réserver”.</li>
    <li>Testez toujours votre code QR avant l’impression.</li>
    <li>Placez-le dans un endroit visible.</li>
    <li>Utilisez des fichiers haute résolution.</li>
    <li>Assurez un contraste fort pour un scan facile.</li>
  </ul>

</div>

{/* FAQ */}
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
    Besoin d’un site de réservation pour votre code QR ?
  </h3>

  <p className="mt-4 text-gray-600">
    Créez un site de réservation professionnel et générez des codes QR
    permettant aux clients de réserver instantanément.
  </p>

  <button
    onClick={() => router.push("/setup")}
    className="mt-6 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
  >
    Créer votre site de réservation
  </button>
</div>
      </div>
	  
    </main>
  );
}