"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CalculadoraPresupuestoPublicidadPage() {
  const router = useRouter();

  const [pricePerVisit, setPricePerVisit] = useState<number>(80);
  const [visitsPerMonth, setVisitsPerMonth] = useState<number>(60);
  const [costPerService, setCostPerService] = useState<number>(25);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "¿Cuánto debería gastar una pequeña empresa en publicidad?",
      answer:
        "La mayoría de las pequeñas empresas de servicios gastan entre el 10% y el 20% de sus ingresos mensuales en publicidad. Los negocios con mayores márgenes de beneficio pueden invertir más porque retienen más ganancias por cada venta."
    },
    {
      question: "¿Qué porcentaje de ingresos debería destinarse al marketing?",
      answer:
        "Las empresas establecidas suelen gastar entre el 10% y el 15% de sus ingresos. Los negocios nuevos o enfocados en crecimiento pueden invertir temporalmente entre el 15% y el 25% para ganar visibilidad y atraer clientes."
    },
    {
      question: "¿Es demasiado gastar el 20% en publicidad?",
      answer:
        "Depende de tu margen de beneficio y de tus objetivos de crecimiento. Si las campañas son rentables y los márgenes son fuertes, el 20% puede ser sostenible. Si los márgenes son bajos, es mejor mantenerse cerca del 10%."
    },
    {
      question: "¿Cómo sé si mi presupuesto publicitario está funcionando?",
      answer:
        "Debes medir el costo por cliente potencial, el costo por cliente reservado y el retorno total de la inversión publicitaria (ROAS). Si la publicidad genera más ingresos de los que cuesta, entonces está funcionando."
    },
    {
      question: "¿Las empresas nuevas deberían gastar más en publicidad?",
      answer:
        "Los negocios nuevos suelen invertir más al principio para ganar visibilidad. Sin embargo, el gasto siempre debe medirse y estar alineado con expectativas realistas de beneficio."
    },
    {
      question: "¿Cómo debería dividir mi presupuesto publicitario?",
      answer:
        "Muchas empresas de servicios dividen su presupuesto entre Google Ads (búsquedas con alta intención) y redes sociales (conciencia de marca y remarketing). Probar campañas pequeñas primero ayuda a identificar el canal más rentable."
    }
  ];

  const [calculated, setCalculated] = useState<boolean>(false);

  const monthlyRevenue = pricePerVisit * visitsPerMonth;
  const monthlyServiceCost = costPerService * visitsPerMonth;
  const monthlyProfitBeforeAds = monthlyRevenue - monthlyServiceCost;

  const profitMargin = monthlyProfitBeforeAds / monthlyRevenue;

  let recommendedAdBudget = 0;

  if (profitMargin >= 0.5) {
    recommendedAdBudget = monthlyRevenue * 0.2;
  } else if (profitMargin >= 0.3) {
    recommendedAdBudget = monthlyRevenue * 0.15;
  } else {
    recommendedAdBudget = monthlyRevenue * 0.1;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-24 flex justify-center">
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
          Calculadora de Presupuesto Publicitario para Pequeñas Empresas
        </h1>

        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          Esta calculadora te ayuda a entender cuánto puedes gastar de forma
          segura en publicidad basándote en los números reales de tu negocio.
          Sin jerga de marketing — solo matemáticas simples de negocio.
        </p>

        <div className="mt-12 bg-gray-50 p-8 rounded-2xl border">

          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Introduce los datos de tu negocio
          </h2>

          <div className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio promedio por visita ($)
              </label>
              <input
                type="number"
                value={pricePerVisit}
                onChange={(e) => setPricePerVisit(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Número promedio de visitas por mes
              </label>
              <input
                type="number"
                value={visitsPerMonth}
                onChange={(e) => setVisitsPerMonth(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Coste por servicio ($)
              </label>
              <input
                type="number"
                value={costPerService}
                onChange={(e) => setCostPerService(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border px-4 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Incluye materiales, suministros, salarios de asistentes, etc.
              </p>
            </div>

          </div>

          <button
            onClick={() => setCalculated(true)}
            className="mt-8 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
          >
            Calcular presupuesto publicitario recomendado
          </button>

          {calculated && (
            <div className="mt-10 space-y-4 text-gray-800">

              <p>
                <strong>Ingresos mensuales estimados:</strong>{" "}
                ${monthlyRevenue.toFixed(0)}
              </p>

              <p>
                <strong>Costes mensuales de servicio:</strong>{" "}
                ${monthlyServiceCost.toFixed(0)}
              </p>

              <p>
                <strong>Beneficio mensual antes de publicidad:</strong>{" "}
                ${monthlyProfitBeforeAds.toFixed(0)}
              </p>

              <p className="text-indigo-700 text-lg font-semibold">
                Presupuesto mensual recomendado para publicidad: $
                {recommendedAdBudget.toFixed(0)}
              </p>

            </div>
          )}

        </div>

        <div className="mt-16 space-y-8 text-gray-700 leading-relaxed">

          <h2 className="text-2xl font-semibold text-gray-900">
            Cómo funciona esta recomendación
          </h2>

          <p>
            En lugar de adivinar cuánto gastar en publicidad, esta calculadora
            utiliza tu margen de beneficio real. Las empresas con mayores
            márgenes pueden invertir más en publicidad porque conservan más
            ganancias de cada venta.
          </p>

          <p>
            Para la mayoría de las pequeñas empresas de servicios, gastar entre
            el 10% y el 20% de los ingresos mensuales en publicidad se considera
            sostenible.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900">
            Por qué la publicidad debe basarse en beneficios
          </h2>

          <p>
            Muchos propietarios gastan demasiado esperando crecer o gastan muy
            poco por miedo. Ninguno de los dos enfoques es estratégico.
          </p>

          <p>
            Cuando el presupuesto publicitario se basa en beneficios reales,
            el crecimiento se vuelve predecible en lugar de arriesgado.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900">
            Cómo usar este presupuesto
          </h2>

          <ul className="list-disc pl-6 space-y-3">
            <li>Dividir entre Google Ads y redes sociales</li>
            <li>Probar campañas pequeñas primero</li>
            <li>Medir cuidadosamente las nuevas reservas</li>
            <li>Aumentar el gasto solo cuando sea rentable</li>
          </ul>

        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Preguntas frecuentes
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

        <div className="mt-16 p-8 bg-gray-50 rounded-2xl text-center">
          <h3 className="text-2xl font-semibold text-gray-900">
            Convierte tu publicidad en reservas reales
          </h3>

          <p className="mt-4 text-gray-600">
            Combina un presupuesto inteligente con un sitio web de reservas
            online para maximizar conversiones.
          </p>

          <button
            onClick={() => router.push("/setup")}
            className="mt-6 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
          >
            Crear mi página de reservas
          </button>
        </div>

      </div>
    </main>
  );
}