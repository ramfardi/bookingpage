"use client";

import { useState, useMemo } from "react";

type Props = {
  data: any;
};

export default function CleaningGetQuotePage({ data }: Props) {
  const buildingTypes = [
    "apartment",
    "townhouse",
    "house",
    "commercial",
  ];

  const displayNames: Record<string, string> = {
    apartment: "Apartment",
    townhouse: "Townhouse",
    house: "House",
    commercial: "Commercial",
  };

  // 🔥 price per sqft from backend
  const pricing = data?.pricePerSqft || {
    apartment: 0.12,
    townhouse: 0.14,
    house: 0.16,
    commercial: 0.18,
  };

  // 🔥 default sqft per type
  const defaultSqft: Record<string, number> = {
    apartment: 800,
    townhouse: 1200,
    house: 2000,
    commercial: 3000,
  };

  const [type, setType] = useState<string>("house");
  const [sqft, setSqft] = useState<number>(defaultSqft["house"]);

  // 🔥 update sqft when type changes
  const handleTypeChange = (t: string) => {
    setType(t);
    setSqft(defaultSqft[t]);
  };

  // 🔥 price calculation
  const price = useMemo(() => {
    const rate = pricing[type] || 0;
    const total = sqft * rate;
    const min = data?.minimumPrice || 0;

    return Math.max(total, min);
  }, [sqft, type, pricing, data]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 flex justify-center">
      <div className="max-w-xl w-full space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {data.businessName || "Cleaning Quote"}
          </h1>

          <p className="text-gray-500 text-sm">
            Get your cleaning price instantly
          </p>

          <div className="inline-block mt-2 px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full">
            Instant estimate
          </div>
        </div>

        {/* CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">

          {/* 1. BUILDING TYPE */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              1. Building Type
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {buildingTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`p-3 rounded-xl border text-sm font-medium transition ${
                    type === t
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {displayNames[t]}
                </button>
              ))}
            </div>
          </div>

          {/* 2. SQUARE FOOTAGE */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              2. Square Footage
            </h2>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>500</span>
              <span className="font-medium text-gray-800">
                {sqft.toLocaleString()} sq ft
              </span>
              <span>5000+</span>
            </div>

            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={sqft}
              onChange={(e) => setSqft(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* PRICE DISPLAY */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-2xl p-6 text-center space-y-2">

            <p className="text-sm opacity-90">
              Your Estimated Price
            </p>

            <h3 className="text-4xl font-bold">
              ${price.toFixed(2)}
            </h3>

            <p className="text-xs opacity-80">
              No hidden fees. Instant estimate.
            </p>
          </div>

          {/* FOOTER */}
          <div className="text-center text-xs text-gray-400 pt-2">
            Powered by SimpleBookMe
          </div>

        </div>

      </div>
    </main>
  );
}