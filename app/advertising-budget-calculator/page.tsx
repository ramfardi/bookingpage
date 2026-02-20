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
    question: "How much should a small business spend on advertising?",
    answer:
      "Most small service businesses spend between 10% and 20% of monthly revenue on advertising. Businesses with higher profit margins can safely invest more because they retain more profit from each sale."
  },
  {
    question: "What percentage of revenue should go to marketing?",
    answer:
      "Established businesses typically spend 10–15% of revenue. Growth-focused or newer businesses may temporarily invest 15–25% to build visibility and attract customers."
  },
  {
    question: "Is 20% too much to spend on advertising?",
    answer:
      "It depends on your margin and growth goals. If campaigns are profitable and margins are strong, 20% can be sustainable. If margins are thin, spending should stay closer to 10%."
  },
  {
    question: "How do I know if my advertising budget is working?",
    answer:
      "Track cost per lead, cost per booked customer, and total return on ad spend (ROAS). If your advertising generates more revenue than it costs, your campaigns are working."
  },
  {
    question: "Should new businesses spend more on ads?",
    answer:
      "New businesses often invest more at the beginning to gain visibility. However, spending should always be measured and tied to realistic profit expectations."
  },
  {
    question: "How should I split my advertising budget?",
    answer:
      "Service businesses often split budgets between Google Ads (high intent searches) and social media (awareness and retargeting). Testing small campaigns first helps identify the most profitable channel."
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
          Advertising Budget Calculator for Small Businesses
        </h1>

        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          This calculator helps you understand how much you can safely spend
          on advertising based on your real business numbers.
          No marketing jargon — just simple business math.
        </p>

        {/* Calculator Box */}
        <div className="mt-12 bg-gray-50 p-8 rounded-2xl border">

          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Enter Your Business Details
          </h2>

          <div className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Average Price Per Visit ($)
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
                Average Number of Visits Per Month
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
                Your Cost Per Service Visit ($)
              </label>
              <input
                type="number"
                value={costPerService}
                onChange={(e) => setCostPerService(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border px-4 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include materials, supplies, assistant wages, etc.
              </p>
            </div>

          </div>

          <button
            onClick={() => setCalculated(true)}
            className="mt-8 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
          >
            Calculate Recommended Advertising Budget
          </button>

          {calculated && (
            <div className="mt-10 space-y-4 text-gray-800">

              <p>
                <strong>Estimated Monthly Revenue:</strong>{" "}
                ${monthlyRevenue.toFixed(0)}
              </p>

              <p>
                <strong>Total Monthly Service Costs:</strong>{" "}
                ${monthlyServiceCost.toFixed(0)}
              </p>

              <p>
                <strong>Monthly Profit Before Advertising:</strong>{" "}
                ${monthlyProfitBeforeAds.toFixed(0)}
              </p>

              <p className="text-indigo-700 text-lg font-semibold">
                Recommended Monthly Advertising Budget: $
                {recommendedAdBudget.toFixed(0)}
              </p>

            </div>
          )}

        </div>

        {/* Educational Content */}

        <div className="mt-16 space-y-8 text-gray-700 leading-relaxed">

          <h2 className="text-2xl font-semibold text-gray-900">
            How This Recommendation Works
          </h2>

          <p>
            Instead of guessing how much to spend on advertising, this calculator
            uses your real profit margin. Businesses with higher margins can
            safely invest more in advertising because they retain more profit
            from each sale.
          </p>

          <p>
            For most small service businesses, spending between 10% and 20%
            of monthly revenue on advertising is considered sustainable.
            If your profit margin is lower, you should spend closer to 10%.
            If your margin is high, you can invest more aggressively.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900">
            Why Advertising Should Be Based on Profit — Not Emotion
          </h2>

          <p>
            Many business owners either overspend on ads hoping for growth,
            or underspend because they are afraid. Neither approach is strategic.
            The right approach is controlled, sustainable investment.
          </p>

          <p>
            When your advertising budget is based on real profit,
            growth becomes predictable instead of risky.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900">
            How to Use This Budget
          </h2>

          <ul className="list-disc pl-6 space-y-3">
            <li>Split across Google Ads and social media</li>
            <li>Test small campaigns first</li>
            <li>Track new bookings carefully</li>
            <li>Increase spending only when profitable</li>
          </ul>
		  
		  <h2 className="text-2xl font-semibold text-gray-900">
  Real-World Examples: How Advertising Differs by Industry
</h2>

<p>
  Not all service businesses should approach advertising the same way.
  A hair salon, a cleaning company, and a home services contractor operate
  with different pricing structures, margins, and customer behavior patterns.
  Understanding these differences helps you allocate your advertising budget
  more strategically.
</p>


<h2 className="text-2xl font-semibold text-gray-900">
  Hair Salon Example
</h2>

<p>
  A hair salon may charge $80 per visit and serve 120 clients per month,
  generating $9,600 in monthly revenue. With strong repeat business and
  relatively predictable scheduling, salons often rely on both Google Ads
  (for people searching “hair salon near me”) and Instagram for visual
  marketing.
</p>

<p>
  Because salons depend heavily on repeat customers, their advertising
  strategy focuses on attracting first-time clients who may return every
  4–8 weeks. This makes customer lifetime value high, allowing them to
  safely spend 15–20% of revenue on advertising if margins support it.
</p>


<h2 className="text-2xl font-semibold text-gray-900">
  Cleaning Business Example
</h2>

<p>
  A residential cleaning company might charge $150 per job and complete
  60 jobs per month, generating $9,000 in revenue. Cleaning services
  often have higher operational costs due to labor and supplies,
  which can reduce profit margins compared to salons.
</p>

<p>
  Cleaning businesses typically benefit most from Google Ads because
  customers search with high intent (for example, “house cleaning service near me”).
  Their advertising strategy should focus on cost per lead efficiency.
  Because margins can be tighter, spending 10–15% of revenue on advertising
  is often safer unless operational efficiency is strong.
</p>


<h2 className="text-2xl font-semibold text-gray-900">
  Beauty Clinic Example
</h2>

<p>
  A beauty or aesthetic clinic may charge $250–$400 per treatment and
  perform 40 treatments per month. Even with fewer appointments,
  revenue can exceed $10,000 monthly due to higher service prices.
</p>

<p>
  Beauty clinics often have higher margins per visit, which allows
  more aggressive advertising investment. Social media advertising,
  influencer marketing, and visual content perform particularly well
  in this industry. Because customer lifetime value is high,
  spending 15–20% of revenue on advertising can be sustainable
  if client retention remains strong.
</p>


<h2 className="text-2xl font-semibold text-gray-900">
  Home Services Example (Plumbing, Electrical, HVAC)
</h2>

<p>
  A plumbing or HVAC company might complete 30 jobs per month at
  an average of $400 per job, generating $12,000 in revenue.
  These services often have high ticket value but inconsistent demand.
</p>

<p>
  Home services businesses typically depend heavily on search-based
  advertising like Google Ads and local service ads. Because each
  booked job can generate significant profit, even a small number
  of leads can justify advertising spend. However, due to higher
  labor and equipment costs, maintaining disciplined budget control
  is critical. Spending 10–15% of revenue is often appropriate unless
  margins are very strong.
</p>


<h2 className="text-2xl font-semibold text-gray-900">
  Key Differences in Advertising Strategy
</h2>

<p>
  Hair salons and beauty clinics benefit from repeat customers,
  making long-term customer value high. This allows for slightly
  more aggressive marketing investment.
</p>

<p>
  Cleaning and home service businesses often rely on immediate
  high-intent searches and must carefully manage cost per lead.
  Their strategy should prioritize measurable return on ad spend
  rather than broad brand awareness.
</p>

<p>
  In short, higher margins and higher lifetime value allow more
  aggressive advertising. Lower margins require tighter cost control.
  The right budget is not universal — it depends on your business model.
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
            Turn Advertising Into Real Bookings
          </h3>

          <p className="mt-4 text-gray-600">
            Combine smart budgeting with an online booking website to maximize
            conversion and reduce missed opportunities.
          </p>

          <button
            onClick={() => router.push("/setup")}
            className="mt-6 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
          >
            Create Your Booking Website
          </button>
        </div>


      </div>
    </main>
  );
}
