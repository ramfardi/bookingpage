import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ساخت رایگان QR کد (دانلود PNG و SVG) | SimpleBookMe",
  description:
    "به راحتی QR کد با کیفیت بالا برای وب‌سایت، صفحه رزرو، صفحه نظرات گوگل یا شبکه‌های اجتماعی بسازید. فایل‌های PNG قابل چاپ یا SVG مقیاس‌پذیر برای کارت ویزیت و مواد تبلیغاتی دانلود کنید.",
  keywords: [
    "ساخت QR کد",
    "ساخت QR کد رایگان",
    "QR کد برای کارت ویزیت",
    "دانلود QR کد PNG",
    "دانلود QR کد SVG",
    "QR کد برای وب سایت",
    "QR کد برای لینک رزرو",
    "ساخت QR کد برای کسب و کار",
    "تولید QR کد",
  ],
  alternates: {
    canonical: "https://simplebookme.com/fa/generator-qr-code",
  },
  openGraph: {
    title: "ساخت رایگان QR کد (دانلود PNG و SVG)",
    description:
      "QR کد با کیفیت بالا برای کارت ویزیت، بروشور، وب‌سایت و صفحات رزرو ایجاد کنید. دانلود در فرمت PNG یا SVG.",
    url: "https://simplebookme.com/fa/generator-qr-code",
    siteName: "SimpleBookMe",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ساخت رایگان QR کد",
    description:
      "به راحتی QR کد قابل چاپ در فرمت PNG و SVG برای کسب‌وکار خود ایجاد کنید.",
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