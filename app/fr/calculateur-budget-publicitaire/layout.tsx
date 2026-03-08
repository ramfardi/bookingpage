import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculateur de budget publicitaire pour petites entreprises | SimpleBookMe",
  description:
    "Calculateur gratuit de budget publicitaire pour les petites entreprises de services. Estimez combien dépenser en publicité selon le prix de votre service, vos visites mensuelles et votre marge bénéficiaire.",
  keywords: [
    "calculateur budget publicitaire",
    "calculateur budget marketing",
    "budget publicité petite entreprise",
    "combien dépenser en publicité",
    "budget publicité entreprise locale",
    "calculateur budget google ads",
    "planification marketing petite entreprise",
    "calcul budget publicité",
  ],
  alternates: {
    canonical: "https://simplebookme.com/fr/calculateur-budget-publicitaire",
  },
  openGraph: {
    title: "Calculateur de budget publicitaire pour petites entreprises",
    description:
      "Calculez un budget publicitaire rentable basé sur les chiffres réels de votre entreprise. Conçu pour les entrepreneurs et les entreprises de services locales.",
    url: "https://simplebookme.com/fr/calculateur-budget-publicitaire",
    siteName: "SimpleBookMe",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Calculateur de budget publicitaire",
    description:
      "Calculateur gratuit de budget marketing pour les petites entreprises.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CalculateurBudgetPublicitaireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}