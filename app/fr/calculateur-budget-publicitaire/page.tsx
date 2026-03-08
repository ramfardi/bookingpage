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
    question: "Combien une petite entreprise devrait-elle dépenser en publicité ?",
    answer:
      "La plupart des petites entreprises de services consacrent entre 10 % et 20 % de leur chiffre d'affaires mensuel à la publicité. Les entreprises avec des marges bénéficiaires plus élevées peuvent investir davantage, car elles conservent plus de profit sur chaque vente."
  },
  {
    question: "Quel pourcentage du chiffre d'affaires doit être consacré au marketing ?",
    answer:
      "Les entreprises établies dépensent généralement entre 10 % et 15 % de leur chiffre d'affaires. Les entreprises en phase de croissance ou plus récentes peuvent temporairement investir entre 15 % et 25 % afin d'augmenter leur visibilité et attirer des clients."
  },
  {
    question: "Est-ce que 20 % est trop pour la publicité ?",
    answer:
      "Cela dépend de votre marge et de vos objectifs de croissance. Si les campagnes sont rentables et que les marges sont solides, 20 % peut être soutenable. Si les marges sont faibles, il est préférable de rester plus proche de 10 %."
  },
  {
    question: "Comment savoir si mon budget publicitaire fonctionne ?",
    answer:
      "Suivez le coût par prospect, le coût par client acquis et le retour sur les dépenses publicitaires (ROAS). Si votre publicité génère plus de revenus qu'elle ne coûte, vos campagnes fonctionnent."
  },
  {
    question: "Les nouvelles entreprises devraient-elles dépenser plus en publicité ?",
    answer:
      "Les nouvelles entreprises investissent souvent davantage au début afin de gagner en visibilité. Cependant, les dépenses doivent toujours être mesurées et alignées avec des attentes réalistes de rentabilité."
  },
  {
    question: "Comment répartir mon budget publicitaire ?",
    answer:
      "Les entreprises de services répartissent souvent leur budget entre Google Ads (recherches avec forte intention) et les réseaux sociaux (notoriété et reciblage). Tester de petites campagnes au départ aide à identifier le canal le plus rentable."
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
            href="/guide"
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Back to Business Guide
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Calculateur de budget publicitaire pour petites entreprises
        </h1>

        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
 Ce calculateur vous aide à déterminer combien vous pouvez dépenser
  en publicité en toute sécurité en fonction des chiffres réels de votre entreprise.
  Pas de jargon marketing — seulement des calculs simples pour votre entreprise.
        </p>

        {/* Calculator Box */}
        <div className="mt-12 bg-gray-50 p-8 rounded-2xl border">

          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Entrez les informations de votre entreprise
          </h2>

<div className="space-y-6">

  <div>
    <label className="block text-sm font-medium text-gray-700">
      Prix moyen par visite ($)
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
      Nombre moyen de visites par mois
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
      Votre coût par visite de service ($)
    </label>
    <input
      type="number"
      value={costPerService}
      onChange={(e) => setCostPerService(Number(e.target.value))}
      className="mt-2 w-full rounded-lg border px-4 py-2"
    />
    <p className="text-xs text-gray-500 mt-1">
      Incluez les matériaux, fournitures, salaires des assistants, etc.
    </p>

</div>

</div>

<button
  onClick={() => setCalculated(true)}
  className="mt-8 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
>
  Calculer le budget publicitaire recommandé
</button>

{calculated && (
  <div className="mt-10 space-y-4 text-gray-800">

    <p>
      <strong>Revenu mensuel estimé :</strong>{" "}
      ${monthlyRevenue.toFixed(0)}
    </p>

    <p>
      <strong>Coûts mensuels totaux des services :</strong>{" "}
      ${monthlyServiceCost.toFixed(0)}
    </p>

    <p>
      <strong>Bénéfice mensuel avant publicité :</strong>{" "}
      ${monthlyProfitBeforeAds.toFixed(0)}
    </p>

    <p className="text-indigo-700 text-lg font-semibold">
      Budget publicitaire mensuel recommandé : $
      {recommendedAdBudget.toFixed(0)}
    </p>

  </div>
)}

</div>

{/* Educational Content */}

<div className="mt-16 space-y-8 text-gray-700 leading-relaxed">

  <h2 className="text-2xl font-semibold text-gray-900">
    Comment cette recommandation fonctionne
  </h2>

  <p>
    Au lieu de deviner combien dépenser en publicité, ce calculateur
    utilise votre marge bénéficiaire réelle. Les entreprises avec des
    marges plus élevées peuvent investir davantage en publicité,
    car elles conservent plus de profit sur chaque vente.
  </p>

  <p>
    Pour la plupart des petites entreprises de services, dépenser
    entre 10 % et 20 % du revenu mensuel en publicité est considéré
    comme durable. Si votre marge bénéficiaire est plus faible,
    il est préférable de rester proche de 10 %. Si votre marge est élevée,
    vous pouvez investir plus agressivement.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Pourquoi la publicité doit être basée sur le profit — et non sur l'émotion
  </h2>

  <p>
    De nombreux propriétaires d'entreprise dépensent trop en publicité
    en espérant une croissance rapide, ou au contraire dépensent trop peu
    par peur. Aucune de ces approches n'est stratégique.
    La bonne approche consiste à investir de manière contrôlée et durable.
  </p>

  <p>
    Lorsque votre budget publicitaire est basé sur votre profit réel,
    la croissance devient prévisible plutôt que risquée.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Comment utiliser ce budget
  </h2>

  <ul className="list-disc pl-6 space-y-3">
    <li>Répartissez-le entre Google Ads et les réseaux sociaux</li>
    <li>Testez d'abord de petites campagnes</li>
    <li>Suivez attentivement les nouvelles réservations</li>
    <li>Augmentez le budget uniquement lorsque les campagnes sont rentables</li>
  </ul>

  <h2 className="text-2xl font-semibold text-gray-900">
    Exemples concrets : comment la publicité varie selon le secteur
  </h2>

  <p>
    Toutes les entreprises de services ne devraient pas aborder
    la publicité de la même manière. Un salon de coiffure,
    une entreprise de nettoyage et un entrepreneur en services
    à domicile fonctionnent avec des structures de prix,
    des marges et des comportements clients différents.
  </p>

  <p>
    Comprendre ces différences vous aide à répartir votre budget
    publicitaire de manière plus stratégique.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Exemple : Salon de coiffure
  </h2>

  <p>
    Un salon de coiffure peut facturer 80 $ par visite et servir
    120 clients par mois, générant environ 9 600 $ de revenu mensuel.
    Avec une clientèle fidèle et des rendez-vous relativement prévisibles,
    les salons utilisent souvent Google Ads
    (pour les recherches comme « salon de coiffure près de moi »)
    et Instagram pour le marketing visuel.
  </p>

  <p>
    Comme les salons dépendent fortement des clients récurrents,
    leur stratégie publicitaire consiste à attirer de nouveaux clients
    qui peuvent revenir toutes les 4 à 8 semaines.
    Cela augmente la valeur à long terme du client,
    ce qui permet de dépenser entre 15 % et 20 % du revenu
    en publicité si les marges le permettent.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Exemple : Entreprise de nettoyage
  </h2>

  <p>
    Une entreprise de nettoyage résidentiel peut facturer
    150 $ par service et réaliser 60 interventions par mois,
    générant environ 9 000 $ de revenu.
  </p>

  <p>
    Les services de nettoyage ont souvent des coûts opérationnels
    plus élevés en raison de la main-d'œuvre et des fournitures,
    ce qui peut réduire les marges bénéficiaires.
  </p>

  <p>
    Ces entreprises bénéficient généralement davantage de Google Ads,
    car les clients recherchent activement des services
    (par exemple « service de nettoyage maison près de moi »).
    Leur stratégie publicitaire doit se concentrer
    sur l'efficacité du coût par prospect.
  </p>

  <p>
    Comme les marges peuvent être plus serrées,
    dépenser entre 10 % et 15 % du revenu en publicité
    est souvent plus prudent.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Exemple : Clinique esthétique
  </h2>

  <p>
    Une clinique esthétique peut facturer entre 250 $ et 400 $
    par traitement et réaliser environ 40 traitements par mois.
    Même avec moins de rendez-vous,
    les revenus peuvent dépasser 10 000 $ par mois
    grâce aux prix plus élevés des services.
  </p>

  <p>
    Les cliniques esthétiques ont souvent des marges plus élevées,
    ce qui permet un investissement publicitaire plus agressif.
    La publicité sur les réseaux sociaux, le marketing d'influence
    et le contenu visuel fonctionnent particulièrement bien
    dans ce secteur.
  </p>

  <p>
    Comme la valeur à long terme du client est élevée,
    dépenser entre 15 % et 20 % du revenu en publicité
    peut être durable si la fidélisation des clients est forte.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Exemple : Services à domicile (plomberie, électricité, HVAC)
  </h2>

  <p>
    Une entreprise de plomberie ou de chauffage (HVAC)
    peut réaliser 30 interventions par mois à un prix moyen
    de 400 $ par service, générant environ 12 000 $ de revenu.
  </p>

  <p>
    Ces services ont souvent une valeur par intervention élevée,
    mais une demande parfois irrégulière.
  </p>

  <p>
    Les entreprises de services à domicile dépendent fortement
    de la publicité basée sur la recherche,
    comme Google Ads et les annonces de services locaux.
    Comme chaque intervention peut générer un profit important,
    même un petit nombre de prospects peut justifier
    les dépenses publicitaires.
  </p>

  <p>
    Cependant, en raison des coûts plus élevés
    de main-d'œuvre et d'équipement,
    un contrôle strict du budget est essentiel.
    Dépenser entre 10 % et 15 % du revenu
    est généralement approprié.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Principales différences dans la stratégie publicitaire
  </h2>

  <p>
    Les salons de coiffure et les cliniques esthétiques bénéficient
    de clients récurrents, ce qui augmente la valeur à long terme
    de chaque client et permet un investissement marketing
    légèrement plus agressif.
  </p>

  <p>
    Les entreprises de nettoyage et les services à domicile
    dépendent davantage de recherches immédiates à forte intention
    et doivent gérer attentivement leur coût par prospect.
  </p>

  <p>
    En résumé, des marges plus élevées et une valeur client
    plus importante permettent d'investir davantage en publicité.
    Des marges plus faibles nécessitent un contrôle
    plus strict des dépenses.
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
    Transformez votre publicité en vraies réservations
  </h3>

  <p className="mt-4 text-gray-600">
    Combinez un budget publicitaire intelligent avec un site de réservation
    en ligne pour maximiser les conversions et éviter de manquer des clients.
  </p>

  <button
    onClick={() => router.push("/setup")}
    className="mt-6 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
  >
    Créez votre site de réservation
  </button>
</div>

</div>
    </main>
  );
}
