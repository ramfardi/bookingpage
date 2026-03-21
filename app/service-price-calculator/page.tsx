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
    question: "What is a service price calculator?",
    answer:
      "A service price calculator helps you estimate how much to charge for your services based on factors like time, costs, experience, and desired profit. It removes guesswork and helps you price your work confidently."
  },
  {
    question: "How do I calculate the right price for my service?",
    answer:
      "You should consider your hourly rate, material costs, travel time, overhead expenses, and desired profit margin. A calculator simplifies this by combining all factors into a clear recommended price."
  },
  {
    question: "Should I charge hourly or per service?",
    answer:
      "It depends on your business. Hourly pricing works well for variable jobs, while fixed pricing is better for standardized services. Many businesses calculate internally using hourly rates and then present a fixed price to customers."
  },
  {
    question: "How do I avoid underpricing my services?",
    answer:
      "Include all hidden costs such as travel, tools, taxes, and time spent communicating with clients. Many businesses underprice because they only consider the core service time and ignore overhead."
  },
  {
    question: "Can this calculator help increase my profits?",
    answer:
      "Yes. By clearly factoring in costs and margins, a pricing calculator ensures you are not leaving money on the table and helps you maintain consistent and profitable pricing across all jobs."
  },
  {
    question: "Should I adjust my pricing based on location?",
    answer:
      "Yes. Pricing can vary significantly depending on your local market, competition, and customer expectations. The calculator provides a base price, but you can adjust it to fit your area."
  },
  {
    question: "How often should I update my service prices?",
    answer:
      "You should review your pricing regularly, especially when your costs change, your experience increases, or demand grows. Many businesses update prices every few months to stay competitive and profitable."
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
          Service Price Calculator
        </h1>

		<p className="mt-6 text-lg text-gray-600 leading-relaxed">
		Pricing services correctly is essential for building a profitable and sustainable business. 
		Many service providers choose prices based on competitors or guesswork, but the most reliable 
		approach is to base pricing on real business numbers. This calculator helps you estimate the 
		right price for your services by considering the time required to complete the service, your 
		desired hourly income, monthly business expenses, and supply costs. It then applies your target 
		profit margin to recommend realistic pricing tiers. The result is a clear pricing structure that 
		helps ensure your services cover costs, generate profit, and support long-term business growth.
		</p>

        {/* Calculator */}

        <div className="mt-12 bg-gray-50 p-8 rounded-2xl border">

          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Enter Your Business Details
          </h2>

          <div className="space-y-6">

            {/* Business Type */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Type
              </label>

              <select
                value={businessType}
                onChange={(e) => {
                  const type = e.target.value as BusinessType;
                  setBusinessType(type);
                  applyPreset(type);
                }}
                className="mt-2 w-full rounded-lg border px-4 py-2"
              >
                <option>Hairdresser</option>
                <option>Cleaning</option>
                <option>Massage</option>
                <option>Personal Trainer</option>
                <option>Beauty</option>
                <option>Home Services</option>
              </select>
            </div>

            {/* Service Time */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Time (minutes)
              </label>

              <input
                type="number"
                value={serviceTime}
                onChange={(e) => setServiceTime(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border px-4 py-2"
              />
            </div>

            {/* Hourly Goal */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Desired Hourly Income ($)
              </label>

              <input
                type="number"
                value={hourlyGoal}
                onChange={(e) => setHourlyGoal(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border px-4 py-2"
              />
            </div>

            {/* Monthly Expenses */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Monthly Business Expenses ($)
              </label>

              <input
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border px-4 py-2"
              />
            </div>

            {/* Customers */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customers Per Month
              </label>

              <input
                type="number"
                value={customersPerMonth}
                onChange={(e) => setCustomersPerMonth(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border px-4 py-2"
              />
            </div>

            {/* Supplies */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Supplies Cost Per Service ($)
              </label>

              <input
                type="number"
                value={suppliesCost}
                onChange={(e) => setSuppliesCost(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border px-4 py-2"
              />
            </div>

            {/* Profit Margin */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Desired Profit Margin (%)
              </label>

              <input
                type="number"
                value={profitMargin}
                onChange={(e) => setProfitMargin(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border px-4 py-2"
              />
            </div>

          </div>

          <button
            onClick={() => setCalculated(true)}
            className="mt-8 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
          >
            Calculate Service Price
          </button>

          {calculated && (
            <div className="mt-10 space-y-4">

              <p>
                <strong>Labor Cost:</strong> ${laborCost.toFixed(2)}
              </p>

              <p>
                <strong>Overhead Per Service:</strong> $
                {overheadPerService.toFixed(2)}
              </p>

              <p>
                <strong>Supplies Cost:</strong> ${suppliesCost.toFixed(2)}
              </p>

              <hr className="my-4"/>

              <p className="text-gray-700">
                <strong>Budget Price:</strong> ${budgetPrice.toFixed(2)}
              </p>

              <p className="text-indigo-700 text-lg font-semibold">
                Recommended Price: ${recommendedPrice.toFixed(2)}
              </p>

              <p className="text-gray-700">
                <strong>Premium Price:</strong> ${premiumPrice.toFixed(2)}
              </p>

            </div>
          )}

        </div>
		
		{/* SEO CONTENT */}
<div className="mt-20 space-y-6 text-gray-700 leading-relaxed">

  <h2 className="text-2xl font-semibold text-gray-900">
    Why Use a Service Price Calculator?
  </h2>

  <p>
    Pricing your services correctly is one of the most important factors in running a successful business. Many service providers undercharge because they forget to include hidden costs such as travel time, materials, overhead, and taxes. A service price calculator removes guesswork and helps you set prices that are both competitive and profitable.
  </p>

  <p>
    Whether you are a cleaner, hairstylist, contractor, freelancer, or consultant, having a structured way to calculate pricing ensures consistency across all jobs. Instead of guessing each time, you can rely on a repeatable system that reflects your true costs and desired income.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    How to Calculate Your Service Price (Example)
  </h2>

  <p>
    A simple way to price your services is to combine your hourly rate, job time, costs, and profit margin. Here is a practical example:
  </p>

  <ul className="list-disc pl-6 space-y-3">
    <li>Your desired hourly rate: $50/hour</li>
    <li>Estimated job time: 2 hours</li>
    <li>Material and travel costs: $20</li>
    <li>Profit margin: 20%</li>
  </ul>

  <p>
    Step 1: Calculate labor cost → 50 × 2 = $100  
    Step 2: Add expenses → 100 + 20 = $120  
    Step 3: Add profit margin → 120 × 1.20 = $144  
  </p>

  <p>
    Final service price: <strong>$144</strong>
  </p>

  <p>
    This method ensures that every job covers your time, expenses, and profit. Without this structure, many businesses unknowingly lose money or struggle to grow.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900">
    Best Practices for Pricing Your Services
  </h2>

  <ul className="list-disc pl-6 space-y-3">
    <li>Always include hidden costs like travel, tools, and admin time.</li>
    <li>Use consistent formulas instead of guessing prices.</li>
    <li>Adjust pricing based on demand and experience.</li>
    <li>Round prices for cleaner customer presentation.</li>
    <li>Test different price points to maximize profit and conversions.</li>
  </ul>

  <p>
    A well-structured pricing strategy not only protects your profitability but also builds trust with customers. When your pricing is clear and consistent, clients are more likely to book your services with confidence.
  </p>

  <p>
    Use this service price calculator to instantly generate accurate, professional pricing that helps you grow your business and avoid undercharging.
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