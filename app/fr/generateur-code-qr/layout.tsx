import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Générateur Gratuit de Code QR (Téléchargement PNG & SVG) | SimpleBookMe",
  description:
    "Générez des codes QR haute résolution pour votre site web, page de réservation, avis Google ou réseaux sociaux. Téléchargez des fichiers PNG imprimables ou SVG vectoriels pour cartes de visite et supports marketing.",
  keywords: [
    "générateur de code QR",
    "code QR gratuit",
	"créer un qr code carte de visite gratuit",
    "code QR carte de visite",
    "code QR imprimable",
    "téléchargement code QR PNG",
    "téléchargement code QR SVG",
    "code QR pour site web",
    "code QR lien de réservation",
    "générateur code QR entreprise",
  ],
  alternates: {
    canonical: "https://simplebookme.com/fr/generateur-code-qr",
  },
  openGraph: {
    title: "Générateur Gratuit de Code QR (PNG & SVG)",
    description:
      "Créez des codes QR haute résolution prêts pour l’impression pour cartes de visite, flyers et sites web. Téléchargement en PNG ou SVG.",
    url: "https://simplebookme.com/fr/generateur-code-qr",
    siteName: "SimpleBookMe",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Générateur Gratuit de Code QR",
    description:
      "Générez des codes QR imprimables en format PNG et SVG pour votre entreprise.",
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