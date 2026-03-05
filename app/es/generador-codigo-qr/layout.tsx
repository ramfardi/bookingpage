import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generador Gratis de Códigos QR (Descarga PNG y SVG) | SimpleBookMe",
  description:
    "Genera códigos QR de alta resolución para tu sitio web, página de reservas, Google reviews o redes sociales. Descarga archivos PNG imprimibles o SVG escalables para tarjetas de presentación y material de marketing.",
  keywords: [
    "generador codigo qr",
    "generador codigo qr gratis",
    "codigo qr para tarjeta de negocio",
    "codigo qr imprimible",
    "codigo qr descargar png",
    "codigo qr descargar svg",
    "codigo qr para sitio web",
    "codigo qr para enlace de reservas",
    "generador codigo qr para negocios",
  ],
  alternates: {
    canonical: "https://simplebookme.com/es/generador-codigo-qr",
    languages: {
      en: "https://simplebookme.com/qr-code-generator",
      es: "https://simplebookme.com/es/generador-codigo-qr",
    },
  },
  openGraph: {
    title: "Generador Gratis de Códigos QR (PNG y SVG)",
    description:
      "Crea códigos QR listos para imprimir para tarjetas de presentación, folletos y sitios web. Descarga en formato PNG o SVG.",
    url: "https://simplebookme.com/es/generador-codigo-qr",
    siteName: "SimpleBookMe",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Generador Gratis de Códigos QR",
    description:
      "Genera códigos QR imprimibles en formato PNG o SVG para tu negocio.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function GeneradorCodigoQRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}