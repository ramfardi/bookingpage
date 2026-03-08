"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdvertisingBudgetCalculatorPage() {
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
      "La mayoría de los pequeños negocios de servicios gastan entre el 10% y el 20% de sus ingresos mensuales en publicidad. Las empresas con márgenes de beneficio más altos pueden invertir más con seguridad porque retienen más ganancias de cada venta."
  },
  {
    question: "¿Qué porcentaje de los ingresos debería destinarse al marketing?",
    answer:
      "Las empresas establecidas suelen gastar entre el 10% y el 15% de sus ingresos. Los negocios nuevos o enfocados en crecimiento pueden invertir temporalmente entre el 15% y el 25% para aumentar su visibilidad y atraer clientes."
  },
  {
    question: "¿Es demasiado gastar el 20% en publicidad?",
    answer:
      "Depende de tu margen de beneficio y de tus objetivos de crecimiento. Si las campañas son rentables y los márgenes son sólidos, un 20% puede ser sostenible. Si los márgenes son bajos, el gasto debería mantenerse más cerca del 10%."
  },
  {
    question: "¿Cómo sé si mi presupuesto de publicidad está funcionando?",
    answer:
      "Debes medir el costo por cliente potencial (lead), el costo por cliente que reserva y el retorno total de la inversión publicitaria (ROAS). Si tu publicidad genera más ingresos de los que cuesta, tus campañas están funcionando."
  },
  {
    question: "¿Deberían los negocios nuevos gastar más en publicidad?",
    answer:
      "Los negocios nuevos suelen invertir más al principio para ganar visibilidad. Sin embargo, el gasto siempre debe medirse y basarse en expectativas realistas de beneficio."
  },
  {
    question: "¿Cómo debería dividir mi presupuesto de publicidad?",
    answer:
      "Los negocios de servicios suelen dividir su presupuesto entre Google Ads (búsquedas con alta intención) y redes sociales (conocimiento de marca y remarketing). Probar campañas pequeñas primero ayuda a identificar el canal más rentable."
  }
];

  const [calculated, setCalculated] = useState<boolean>(false);

  const monthlyRevenue = pricePerVisit * visitsPerMonth;
  const monthlyServiceCost = costPerService * visitsPerMonth;
  const monthlyProfitBeforeAds = monthlyRevenue - monthlyServiceCost;

  // Safe advertising recommendation logic:
  // Recommend 10%–20% of revenue depending on margin
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
      ← Volver a la Guía de Negocios
    </Link>
  </div>

  <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
    Calculadora de Presupuesto Publicitario para Pequeñas Empresas
  </h1>

  <p className="mt-6 text-lg text-gray-600 leading-relaxed">
    Esta calculadora te ayuda a entender cuánto puedes gastar de forma segura
    en publicidad basándote en los números reales de tu negocio.
    Sin términos complicados de marketing — solo matemáticas simples de negocio.
  </p>

  {/* Calculator Box */}
  <div className="mt-12 bg-gray-50 p-8 rounded-2xl border">

    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
      Ingresa los Datos de tu Negocio
    </h2>

    <div className="space-y-6">

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Precio Promedio por Visita ($)
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
          Número Promedio de Visitas por Mes
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
          Costo por Servicio ($)
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
      Calcular Presupuesto Publicitario Recomendado
    </button>

    {calculated && (
      <div className="mt-10 space-y-4 text-gray-800">

        <p>
          <strong>Ingresos Mensuales Estimados:</strong>{" "}
          ${monthlyRevenue.toFixed(0)}
        </p>

        <p>
          <strong>Costos Totales Mensuales del Servicio:</strong>{" "}
          ${monthlyServiceCost.toFixed(0)}
        </p>

        <p>
          <strong>Beneficio Mensual Antes de Publicidad:</strong>{" "}
          ${monthlyProfitBeforeAds.toFixed(0)}
        </p>

        <p className="text-indigo-700 text-lg font-semibold">
          Presupuesto Publicitario Mensual Recomendado: $
          {recommendedAdBudget.toFixed(0)}
        </p>

      </div>
    )}

  </div>


 {/* Educational Content */}

<div className="mt-16 space-y-8 text-gray-700 leading-relaxed">

  <h2 className="text-2xl font-semibold text-gray-900">
    Cómo Funciona Esta Recomendación
  </h2>

  <p>
    En lugar de adivinar cuánto gastar en publicidad, esta calculadora
    utiliza tu margen de beneficio real. Los negocios con márgenes más
    altos pueden invertir más en publicidad porque conservan más
    ganancias de cada venta.
  </p>

  <p>
    Para la mayoría de los pequeños negocios de servicios, gastar entre
    el 10% y el 20% de los ingresos mensuales en publicidad se considera
    sostenible. Si tu margen de beneficio es menor, deberías gastar más
    cerca del 10%. Si tu margen es alto, puedes invertir de forma más
    agresiva.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Por Qué la Publicidad Debe Basarse en el Beneficio — No en la Emoción
  </h2>

  <p>
    Muchos dueños de negocios gastan demasiado en publicidad esperando
    crecer rápidamente, o gastan demasiado poco por miedo. Ninguno de
    estos enfoques es estratégico. El enfoque correcto es una inversión
    controlada y sostenible.
  </p>

  <p>
    Cuando tu presupuesto publicitario se basa en beneficios reales,
    el crecimiento se vuelve predecible en lugar de arriesgado.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Cómo Usar Este Presupuesto
  </h2>

  <ul className="list-disc pl-6 space-y-3">
    <li>Dividirlo entre Google Ads y redes sociales</li>
    <li>Probar primero campañas pequeñas</li>
    <li>Registrar cuidadosamente las nuevas reservas</li>
    <li>Aumentar el gasto solo cuando sea rentable</li>
  </ul>

  <h2 className="text-2xl font-semibold text-gray-900">
    Ejemplos Reales: Cómo la Publicidad Varía Según la Industria
  </h2>

  <p>
    No todos los negocios de servicios deberían abordar la publicidad
    de la misma manera. Un salón de belleza, una empresa de limpieza
    y un contratista de servicios para el hogar operan con diferentes
    estructuras de precios, márgenes y comportamientos de clientes.
    Comprender estas diferencias ayuda a asignar el presupuesto
    publicitario de manera más estratégica.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Ejemplo de Salón de Belleza
  </h2>

  <p>
    Un salón de belleza puede cobrar $80 por visita y atender
    a 120 clientes al mes, generando $9,600 en ingresos mensuales.
    Con una fuerte base de clientes recurrentes y horarios relativamente
    predecibles, los salones suelen depender tanto de Google Ads
    (para personas que buscan “salón de belleza cerca de mí”)
    como de Instagram para marketing visual.
  </p>

  <p>
    Debido a que los salones dependen mucho de clientes recurrentes,
    su estrategia publicitaria se centra en atraer clientes nuevos
    que puedan regresar cada 4–8 semanas. Esto hace que el valor
    de vida del cliente sea alto, lo que permite gastar de forma
    segura entre el 15% y el 20% de los ingresos en publicidad
    si los márgenes lo permiten.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Ejemplo de Empresa de Limpieza
  </h2>

  <p>
    Una empresa de limpieza residencial puede cobrar $150 por trabajo
    y completar 60 trabajos al mes, generando $9,000 en ingresos.
    Los servicios de limpieza suelen tener costos operativos más
    altos debido a la mano de obra y los suministros, lo que puede
    reducir los márgenes de beneficio en comparación con los salones.
  </p>

  <p>
    Las empresas de limpieza suelen beneficiarse más de Google Ads
    porque los clientes buscan con alta intención
    (por ejemplo, “servicio de limpieza de casas cerca de mí”).
    Su estrategia publicitaria debe centrarse en la eficiencia del
    costo por cliente potencial. Debido a que los márgenes pueden
    ser más ajustados, gastar entre el 10% y el 15% de los ingresos
    en publicidad suele ser más seguro a menos que la eficiencia
    operativa sea muy alta.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Ejemplo de Clínica de Belleza
  </h2>

  <p>
    Una clínica estética puede cobrar entre $250 y $400 por tratamiento
    y realizar 40 tratamientos al mes. Incluso con menos citas,
    los ingresos pueden superar los $10,000 mensuales debido al
    precio más alto de los servicios.
  </p>

  <p>
    Las clínicas de belleza suelen tener mayores márgenes por visita,
    lo que permite invertir más agresivamente en publicidad.
    La publicidad en redes sociales, el marketing con influencers
    y el contenido visual funcionan especialmente bien en este sector.
    Debido al alto valor de vida del cliente, gastar entre el
    15% y el 20% de los ingresos en publicidad puede ser sostenible
    si la retención de clientes es fuerte.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Ejemplo de Servicios para el Hogar (Plomería, Electricidad, HVAC)
  </h2>

  <p>
    Una empresa de plomería o HVAC podría completar 30 trabajos al mes
    con un promedio de $400 por trabajo, generando $12,000 en ingresos.
    Estos servicios suelen tener un alto valor por trabajo,
    pero una demanda menos predecible.
  </p>

  <p>
    Las empresas de servicios para el hogar dependen en gran medida
    de la publicidad basada en búsquedas, como Google Ads y anuncios
    de servicios locales. Debido a que cada trabajo puede generar
    un beneficio significativo, incluso un pequeño número de clientes
    potenciales puede justificar el gasto publicitario. Sin embargo,
    debido a los mayores costos de mano de obra y equipos,
    mantener un control disciplinado del presupuesto es fundamental.
    Gastar entre el 10% y el 15% de los ingresos suele ser adecuado
    a menos que los márgenes sean muy altos.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Diferencias Clave en la Estrategia Publicitaria
  </h2>

  <p>
    Los salones de belleza y las clínicas estéticas se benefician
    de clientes recurrentes, lo que aumenta el valor a largo plazo
    de cada cliente. Esto permite invertir de forma ligeramente
    más agresiva en marketing.
  </p>

  <p>
    Las empresas de limpieza y los servicios para el hogar suelen
    depender de búsquedas inmediatas con alta intención y deben
    controlar cuidadosamente el costo por cliente potencial.
    Su estrategia debe priorizar el retorno medible de la inversión
    publicitaria en lugar del reconocimiento general de marca.
  </p>

  <p>
    En resumen, márgenes más altos y mayor valor de vida del cliente
    permiten una publicidad más agresiva. Márgenes más bajos requieren
    un control más estricto de los costos. El presupuesto adecuado
    no es universal — depende del modelo de tu negocio.
  </p>

</div>
		
		{/* FAQ Section */}
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
    Convierte la Publicidad en Reservas Reales
  </h3>

  <p className="mt-4 text-gray-600">
    Combina un presupuesto publicitario inteligente con un sitio web
    de reservas online para maximizar las conversiones y reducir
    oportunidades perdidas.
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
