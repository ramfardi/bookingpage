"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import CleaningGetQuotePage from "@/components/CleaningGetQuotePage";

export default function EditCleaningQuotePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const siteId = params.siteId as string;
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);

  const [businessName, setBusinessName] = useState("");
  const [pricePerSqft, setPricePerSqft] = useState<any>({
    apartment: 0,
    townhouse: 0,
    house: 0,
    commercial: 0,
  });
  const [minimumPrice, setMinimumPrice] = useState(0);

  // 🔥 fetch existing data
  useEffect(() => {
    if (!siteId) return;

    fetch(`/api/cleaning/quote-gen/get?siteId=${siteId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((res) => {
        // 🔒 token check
        if (res.editToken !== token) {
          alert("Unauthorized");
          return;
        }

        setBusinessName(res.businessName || "");
        setPricePerSqft(res.pricePerSqft || {});
        setMinimumPrice(res.minimumPrice || 0);

        setLoading(false);
      })
      .catch(() => {
        alert("Quote not found");
      });
  }, [siteId, token]);

  const updatePrice = (type: string, value: number) => {
    setPricePerSqft((prev: any) => ({
      ...prev,
      [type]: value,
    }));
  };

  // 🔥 SAVE
  const handleSave = async () => {
    await fetch("/api/cleaning/quote-gen/update", {
      method: "POST",
      body: JSON.stringify({
        siteId,
        editToken: token,
        businessName,
        pricePerSqft,
        minimumPrice,
      }),
    });

    alert("Saved successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 flex justify-center">
      <div className="max-w-5xl w-full space-y-8">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Your Quote Page
          </h1>

          <p className="text-gray-500 text-sm">
            Update pricing and see changes instantly
          </p>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* LEFT: FORM */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">

            {/* BUSINESS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>

              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            {/* PRICING */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Price per Sq Ft ($)
              </label>

              <div className="grid grid-cols-2 gap-4">
                {Object.keys(pricePerSqft).map((type) => (
                  <div key={type}>
                    <span className="text-sm text-gray-600 capitalize">
                      {type}
                    </span>

                    <input
                      type="number"
                      step="0.01"
                      value={pricePerSqft[type]}
                      onChange={(e) =>
                        updatePrice(type, Number(e.target.value))
                      }
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* MIN PRICE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Price ($)
              </label>

              <input
                type="number"
                value={minimumPrice}
                onChange={(e) => setMinimumPrice(Number(e.target.value))}
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            {/* SAVE */}
            <button
              onClick={handleSave}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
            >
              Save Changes
            </button>

          </div>

          {/* RIGHT: LIVE PREVIEW */}
          <div className="border rounded-2xl overflow-hidden">
            <CleaningGetQuotePage
              data={{
                businessName,
                pricePerSqft,
                minimumPrice,
              }}
            />
          </div>

        </div>

      </div>
    </main>
  );
}