"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BusinessType =
  | "Hairdresser"
  | "Cleaning"
  | "Massage"
  | "Personal Trainer"
  | "Beauty"
  | "Home Services";

export default function ServicePriceCalculatorPage() {
  const router = useRouter();

  const [businessType, setBusinessType] = useState<BusinessType>("Hairdresser");

  const [serviceTime, setServiceTime] = useState<number>(60);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(2000);
  const [hourlyGoal, setHourlyGoal] = useState<number>(60);
  const [customersPerMonth, setCustomersPerMonth] = useState<number>(80);
  const [suppliesCost, setSuppliesCost] = useState<number>(10);
  const [profitMargin, setProfitMargin] = useState<number>(30);

  const [calculated, setCalculated] = useState(false);

  const presets: Record<BusinessType, any> = {
    Hairdresser: {
      time: 45,
      hourly: 70,
      supplies: 12,
      margin: 35,
    },
    Cleaning: {
      time: 120,
      hourly: 50,
      supplies: 15,
      margin: 25,
    },
    Massage: {
      time: 60,
      hourly: 80,
      supplies: 10,
      margin: 40,
    },
    "Personal Trainer": {
      time: 60,
      hourly: 75,
      supplies: 5,
      margin: 35,
    },
    Beauty: {
      time: 75,
      hourly: 90,
      supplies: 20,
      margin: 40,
    },
    "Home Services": {
      time: 120,
      hourly: 85,
      supplies: 30,
      margin: 30,
    },
  };

  const applyPreset = (type: BusinessType) => {
    const preset = presets[type];
    setServiceTime(preset.time);
    setHourlyGoal(preset.hourly);
    setSuppliesCost(preset.supplies);
    setProfitMargin(preset.margin);
  };

  const laborCost = (serviceTime / 60) * hourlyGoal;
  const overheadPerService = monthlyExpenses / customersPerMonth;

  const baseCost = laborCost + overheadPerService + suppliesCost;

  const recommendedPrice = baseCost * (1 + profitMargin / 100);
  const budgetPrice = recommendedPrice * 0.85;
  const premiumPrice = recommendedPrice * 1.25;

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
  setOpenFaq(openFaq === index ? null : index);
};
const faqs = [
  {
    question: "How much should I charge for house cleaning services?",
    answer:
      "House cleaning rates typically range based on location, experience, and job type. Many cleaners charge per hour (e.g., $25–$60/hour) or per job (flat rate). A pricing calculator helps you determine the right price by factoring in time, costs, and profit margin."
  },
  {
    question: "Should I charge hourly or per house for cleaning?",
    answer:
      "Many cleaning businesses calculate costs hourly but charge customers a fixed price per job. Flat pricing is easier for clients to understand and helps you earn more as you become more efficient."
  },
  {
    question: "What factors affect cleaning service pricing?",
    answer:
      "Pricing depends on property size, number of rooms, level of dirt, type of cleaning (standard, deep clean, move-out), travel time, and supply costs. A calculator combines these factors to give a consistent price."
  },
  {
    question: "How do I price deep cleaning services?",
    answer:
      "Deep cleaning usually costs more than regular cleaning because it takes longer and requires more effort. Many businesses charge 1.5x to 2x their standard cleaning rate for deep cleaning jobs."
  },
  {
    question: "How do I avoid underpricing my cleaning services?",
    answer:
      "Make sure to include all hidden costs such as travel time, cleaning supplies, taxes, and time spent communicating with clients. Underpricing often happens when these are not considered."
  },
  {
    question: "Do I need to adjust cleaning prices based on location?",
    answer:
      "Yes. Cleaning rates vary by city, cost of living, and local competition. Use the calculator to find a base price, then adjust based on your market demand."
  },
  {
    question: "Can a pricing calculator help grow my cleaning business?",
    answer:
      "Yes. Consistent and profitable pricing helps you avoid losses, build trust with clients, and scale your business. It also makes it easier to standardize your services and train staff."
  },
  {
    question: "How often should I update my cleaning service prices?",
    answer:
      "You should review your prices regularly, especially when supply costs increase or demand grows. Many cleaning businesses update pricing every 3–6 months."
  }
];

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
		  Free Cleaning Pricing Calculator
		</h1>

		<p className="mt-6 text-xl text-gray-600 leading-relaxed">
		  Find the right price for house cleaning, deep cleaning, move-out
		  cleaning, and Airbnb turnover services. Calculate labor, supplies,
		  overhead, and profit margins in seconds.
		</p>
		
		<div className="mt-6 flex flex-wrap gap-3">

  <span className="bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm font-medium">
    Residential Cleaning
  </span>

  <span className="bg-green-50 text-green-700 px-3 py-2 rounded-full text-sm font-medium">
    Deep Cleaning
  </span>

  <span className="bg-purple-50 text-purple-700 px-3 py-2 rounded-full text-sm font-medium">
    Move-Out Cleaning
  </span>

  <span className="bg-orange-50 text-orange-700 px-3 py-2 rounded-full text-sm font-medium">
    Airbnb Cleaning
  </span>

</div>

        {/* Calculator */}

        <div className="mt-12 bg-gray-50 p-8 rounded-2xl border">

          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Enter Your Business Details
          </h2>

          <div className="space-y-6">

            {/* Business Type */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                🧹 Business Type
              </label>

              <select
                value={businessType}
                onChange={(e) => {
                  const type = e.target.value as BusinessType;
                  setBusinessType(type);
                  applyPreset(type);
                }}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option>Cleaning</option>
              </select>
            </div>

            {/* Service Time */}

            <div>
			<label className="flex items-center gap-2 text-sm font-medium text-gray-700">
			  ⏱️ Service Time (minutes)
			</label>

<input
  type="range"
  min="30"
  max="480"
  step="15"
  value={serviceTime}
  onChange={(e) => setServiceTime(Number(e.target.value))}
  className="w-full mt-3"
/>

<div className="flex justify-between text-sm text-gray-500 mt-1">
  <span>30 min</span>
  <span className="font-semibold text-indigo-700">
    {serviceTime} min
  </span>
  <span>8 hrs</span>
</div>
            </div>

            {/* Hourly Goal */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                💵 Desired Hourly Income ($)
              </label>

<input
  type="range"
  min="20"
  max="150"
  step="5"
  value={hourlyGoal}
  onChange={(e) => setHourlyGoal(Number(e.target.value))}
  className="w-full mt-3"
/>

<div className="flex justify-between text-sm text-gray-500 mt-1">
  <span>$20/hr</span>
  <span className="font-semibold text-indigo-700">
    ${hourlyGoal}/hr
  </span>
  <span>$150/hr</span>
</div>
            </div>

            {/* Monthly Expenses */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                📋 Monthly Business Expenses ($)
              </label>

              <input
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Customers */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                👥 Customers Per Month
              </label>

              <input
                type="number"
                value={customersPerMonth}
                onChange={(e) => setCustomersPerMonth(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Supplies */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                🧴 Supplies Cost Per Service ($)
              </label>

              <input
                type="number"
                value={suppliesCost}
                onChange={(e) => setSuppliesCost(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Profit Margin */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                📈 Desired Profit Margin (%)
              </label>

<input
  type="range"
  min="0"
  max="60"
  step="1"
  value={profitMargin}
  onChange={(e) => setProfitMargin(Number(e.target.value))}
  className="w-full mt-3"
/>

<div className="flex justify-between text-sm text-gray-500 mt-1">
  <span>0%</span>
  <span className="font-semibold text-indigo-700">
    {profitMargin}%
  </span>
  <span>60%</span>
</div>

<div className="mt-3">

  {profitMargin < 15 && (
    <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">
      🔴 Low Profit Margin
    </div>
  )}

  {profitMargin >= 15 && profitMargin < 25 && (
    <div className="bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg p-3">
      🟡 Fair Profit Margin
    </div>
  )}

  {profitMargin >= 25 && (
    <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3">
      🟢 Healthy Profit Margin
    </div>
  )}

</div>
            </div>

          </div>
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
		  <div className="bg-white border rounded-xl p-4 text-center">
			<div className="text-xs text-gray-500">Time</div>
			<div className="font-bold">{serviceTime} min</div>
		  </div>

		  <div className="bg-white border rounded-xl p-4 text-center">
			<div className="text-xs text-gray-500">Hourly Goal</div>
			<div className="font-bold">${hourlyGoal}</div>
		  </div>

		  <div className="bg-white border rounded-xl p-4 text-center">
			<div className="text-xs text-gray-500">Expenses</div>
			<div className="font-bold">${monthlyExpenses}</div>
		  </div>

		  <div className="bg-white border rounded-xl p-4 text-center">
			<div className="text-xs text-gray-500">Margin</div>
			<div className="font-bold">{profitMargin}%</div>
		  </div>
		</div>
          <button
            onClick={() => setCalculated(true)}
            className="mt-8 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
          >
            Calculate Service Price
          </button>

{calculated && (
  <div className="mt-10">

    <div className="grid md:grid-cols-3 gap-4">

      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
        <div className="text-sm text-gray-600">
          Budget Price
        </div>
        <div className="text-3xl font-bold text-green-700">
          ${budgetPrice.toFixed(2)}
        </div>
      </div>

      <div className="bg-indigo-50 border-2 border-indigo-500 rounded-xl p-5">
        <div className="text-sm text-gray-600">
          Recommended Price
        </div>
        <div className="text-4xl font-bold text-indigo-700">
          ${recommendedPrice.toFixed(2)}
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
        <div className="text-sm text-gray-600">
          Premium Price
        </div>
        <div className="text-3xl font-bold text-purple-700">
          ${premiumPrice.toFixed(2)}
        </div>
      </div>

    </div>

    <div className="mt-6 bg-white border rounded-xl p-5">
      <h3 className="font-semibold text-lg mb-4">
        Cost Breakdown
      </h3>

      <div className="space-y-2">

        <div className="flex justify-between">
          <span>Labor Cost</span>
          <span>${laborCost.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Overhead Per Service</span>
          <span>${overheadPerService.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Supplies Cost</span>
          <span>${suppliesCost.toFixed(2)}</span>
        </div>

      </div>
    </div>

  </div>
)}

        </div>
		
{/* SEO CONTENT */}
<div className="mt-20 space-y-6 text-gray-700 leading-relaxed">

  <h2 className="text-2xl font-semibold text-gray-900">
    Why Use a Cleaning Service Price Calculator?
  </h2>

  <p>
    Pricing cleaning services correctly is essential for maintaining profitability and long-term growth. Many cleaning businesses undercharge because they overlook important factors such as travel time, cleaning supplies, equipment costs, and unpaid administrative work. A cleaning service price calculator removes guesswork and helps you set prices that accurately reflect your time, effort, and business expenses.
  </p>

  <p>
    Whether you offer residential cleaning, deep cleaning, move-out cleaning, or office cleaning, having a consistent pricing system ensures you charge fairly for every job. Instead of adjusting prices manually for each client, you can rely on a structured approach that keeps your business sustainable and competitive.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    How to Calculate Cleaning Service Prices (Example)
  </h2>

  <p>
    A simple and effective way to price cleaning services is by combining your hourly rate, job duration, and additional costs. Here is a realistic example for a standard home cleaning job:
  </p>

  <ul className="list-disc pl-6 space-y-3">
    <li>Your target hourly rate: $45/hour</li>
    <li>Estimated cleaning time: 3 hours</li>
    <li>Supplies and travel costs: $25</li>
    <li>Desired profit margin: 25%</li>
  </ul>

  <p>
    Step 1: Calculate labor cost → 45 × 3 = $135  
    Step 2: Add expenses → 135 + 25 = $160  
    Step 3: Apply profit margin → 160 × 1.25 = $200  
  </p>

  <p>
    Final cleaning service price: <strong>$200</strong>
  </p>

  <p>
    This method ensures that every cleaning job covers your time, supplies, and business overhead while generating profit. Without a structured approach, many cleaners end up working long hours with minimal returns.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Best Practices for Pricing Cleaning Services
  </h2>

  <ul className="list-disc pl-6 space-y-3">
    <li>Account for travel time and fuel costs between jobs.</li>
    <li>Include cleaning supplies, equipment wear, and replacements.</li>
    <li>Adjust pricing based on property size and condition.</li>
    <li>Charge higher rates for deep cleaning or move-out services.</li>
    <li>Offer clear, fixed pricing to make booking easier for clients.</li>
  </ul>

  <p>
    A clear and consistent pricing strategy helps build trust with customers and ensures your business remains profitable. Clients are more likely to book when pricing is transparent and professionally structured.
  </p>

  <p>
    Use this cleaning service price calculator to generate accurate pricing, avoid undercharging, and grow your cleaning business with confidence.
  </p>

</div>
	<div className="mt-16 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">

  <h3 className="font-semibold text-lg text-gray-900">
    Trusted By Residential Cleaners
  </h3>

  <p className="text-gray-600 mt-2">
    Designed for residential cleaning, move-out cleaning,
    deep cleaning, Airbnb turnovers and maid services.
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
            Turn Your Pricing Strategy Into Bookings
          </h3>

          <p className="mt-4 text-gray-600">
            Once you know the right price, create a booking website and let
            customers schedule appointments instantly.
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