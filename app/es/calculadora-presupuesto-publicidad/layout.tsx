import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculadora de Presupuesto Publicitario para Pequeñas Empresas | SimpleBookMe",
  description:
    "Calculadora gratuita de presupuesto publicitario para pequeñas empresas de servicios. Estima cuánto deberías gastar en publicidad según el precio de tu servicio, visitas mensuales y margen de beneficio.",
  keywords: [
    "calculadora presupuesto publicidad",
	"presupuesto de publicidad",
    "calculadora presupuesto marketing",
    "presupuesto publicidad pequeña empresa",
    "cuánto gastar en publicidad",
    "presupuesto marketing negocio local",
    "presupuesto google ads",
    "calculadora marketing pequeñas empresas",
    "herramienta planificación marketing negocio",
  ],
  alternates: {
    canonical:
      "https://simplebookme.com/es/calculadora-presupuesto-publicidad",
  },
  openGraph: {
    title: "Calculadora de Presupuesto Publicitario para Pequeñas Empresas",
    description:
      "Calcula un presupuesto publicitario seguro y rentable basado en los números reales de tu negocio. Diseñado para negocios de servicios locales.",
    url: "https://simplebookme.com/es/calculadora-presupuesto-publicidad",
    siteName: "SimpleBookMe",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Calculadora de Presupuesto Publicitario",
    description:
      "Calculadora gratuita de presupuesto de marketing para propietarios de pequeñas empresas.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CalculadoraPresupuestoPublicidadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}