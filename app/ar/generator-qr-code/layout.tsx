import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مولد رمز QR مجاني (تحميل PNG و SVG) | SimpleBookMe",
  description:
    "أنشئ رموز QR عالية الدقة لموقعك الإلكتروني أو صفحة الحجز أو مراجعات Google أو وسائل التواصل الاجتماعي. قم بتنزيل ملفات PNG قابلة للطباعة أو ملفات SVG قابلة للتكبير لاستخدامها في بطاقات العمل والمواد التسويقية.",
  keywords: [
    "مولد رمز QR",
    "مولد رمز QR مجاني",
    "رمز QR لبطاقة العمل",
    "رمز QR قابل للطباعة",
    "تحميل رمز QR بصيغة PNG",
    "تحميل رمز QR بصيغة SVG",
    "رمز QR لموقع ويب",
    "رمز QR لرابط الحجز",
    "مولد رمز QR للأعمال",
  ],
  alternates: {
    canonical: "https://simplebookme.com/ar/generator-qr-code",
    languages: {
      en: "https://simplebookme.com/qr-code-generator",
      fr: "https://simplebookme.com/fr/generateur-code-qr",
      es: "https://simplebookme.com/es/generador-codigo-qr",
      ar: "https://simplebookme.com/ar/generator-qr-code",
    },
  },
  openGraph: {
    title: "مولد رمز QR مجاني (تحميل PNG و SVG)",
    description:
      "أنشئ رموز QR عالية الدقة جاهزة للطباعة لبطاقات العمل والمنشورات والمواقع الإلكترونية. قم بتنزيلها بصيغة PNG أو SVG.",
    url: "https://simplebookme.com/ar/generator-qr-code",
    siteName: "SimpleBookMe",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "مولد رمز QR مجاني",
    description:
      "أنشئ رموز QR قابلة للطباعة بصيغتي PNG و SVG لعملك.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function QRCodeGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}