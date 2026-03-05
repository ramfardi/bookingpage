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