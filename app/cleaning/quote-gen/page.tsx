"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CleaningGetQuotePage from "@/components/CleaningGetQuotePage";

export default function CleaningQuoteGeneratorPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");

  // 🔥 pricing per type
  const [pricePerSqft, setPricePerSqft] = useState({
    apartment: 0.12,
    townhouse: 0.14,
    house: 0.16,
    commercial: 0.18,
  });

  const [minimumPrice, setMinimumPrice] = useState(80);

  const [generatedLink, setGeneratedLink] = useState("");
  const [editLink, setEditLink] = useState("");

  const [previewData, setPreviewData] = useState<any>(null);

  const updatePrice = (type: string, value: number) => {
    setPricePerSqft((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // 🚀 MAIN FEATURE
  const generateQuoteLink = async () => {
    const siteId = crypto.randomUUID().slice(0, 8);
    const editToken = crypto.randomUUID().slice(0, 16);

    const payload = {
      siteId,
      editToken,
      businessName,
      pricePerSqft,
      minimumPrice,
    };

    const res = await fetch("/api/cleaning/quote-gen/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    const publicUrl = `https://${data.subdomain}.simplebookme.com`;
    const editUrl = `/cleaning/quote-gen/${siteId}/edit?token=${editToken}`;

    setGeneratedLink(publicUrl);
    setEditLink(editUrl);

    // 🔥 set preview
    setPreviewData({
      businessName,
      pricePerSqft,
      minimumPrice,
    });
  };

  return (
    <main className="min-h-screen bg-white px-6 py-24 flex justify-center">
      <div className="w-full max-w-5xl">

        <h1 className="text-4xl font-bold text-gray-900">
          Instant Cleaning Quote Link Generator
        </h1>

        <p className="mt-4 text-gray-600">
          Let your customers get an instant cleaning quote before contacting you.
          Share a link and save hours of back-and-forth messaging.
        </p>

        {/* INPUT */}
        <div className="mt-10 bg-gray-50 p-8 rounded-2xl border space-y-6">

          {/* BUSINESS */}
          <input
            type="text"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          />

          {/* PRICING */}
          <div>
            <label className="block font-medium mb-4">
              Price Per Square Foot ($)
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {Object.keys(pricePerSqft).map((type) => (
                <div key={type} className="space-y-1">
                  <span className="text-sm text-gray-600 capitalize">
                    {type}
                  </span>

                  <input
                    type="number"
                    step="0.01"
                    value={pricePerSqft[type as keyof typeof pricePerSqft]}
                    onChange={(e) =>
                      updatePrice(type, Number(e.target.value))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              ))}

            </div>
          </div>

          {/* MIN PRICE */}
          <div>
            <label className="block font-medium mb-2">
              Minimum Price ($)
            </label>

            <input
              type="number"
              value={minimumPrice}
              onChange={(e) => setMinimumPrice(Number(e.target.value))}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <button
            onClick={generateQuoteLink}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
          >
            Generate Instant Quote Link
          </button>
        </div>

        {/* RESULT */}
        {generatedLink && (
          <div className="mt-10 p-6 border rounded-2xl bg-white shadow-sm space-y-6">

            {/* PUBLIC LINK */}
            <div>
              <p className="text-sm text-gray-500">Public Link</p>

              <div className="flex items-center gap-2">
                <a
                  href={generatedLink}
                  target="_blank"
                  className="text-indigo-600 break-all text-sm flex-1"
                >
                  {generatedLink}
                </a>

                <button
                  onClick={() => navigator.clipboard.writeText(generatedLink)}
                  className="px-3 py-1 text-xs bg-gray-100 rounded-md"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* EDIT LINK */}
            <div>
              <p className="text-sm text-gray-500">Edit Link (Private)</p>

              <p className="text-red-500 text-xs">
                Do NOT share this link publicly
              </p>

              <div className="flex items-center gap-2">
                <a
                  href={editLink}
                  target="_blank"
                  className="text-indigo-600 break-all text-sm flex-1"
                >
                  {editLink}
                </a>

                <button
                  onClick={() => navigator.clipboard.writeText(editLink)}
                  className="px-3 py-1 text-xs bg-gray-100 rounded-md"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* PREVIEW */}
            <div className="pt-6 border-t">
              <p className="text-sm text-gray-500 mb-4">
                Live Preview
              </p>

              <CleaningGetQuotePage data={previewData} />
            </div>

            {/* QR */}
            <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-gray-600">
                Turn this into a QR code
              </p>

              <a
                href={`/qr-code-generator?url=${encodeURIComponent(generatedLink)}`}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg"
              >
                Generate QR Code
              </a>
            </div>

          </div>
        )}

		{/* SEO CONTENT */}
		<div className="mt-20 space-y-6 text-gray-700 leading-relaxed">

		  <h2 className="text-2xl font-semibold text-gray-900">
			Why Use a Cleaning Quote Link?
		  </h2>

		  <p>
			Providing accurate pricing for cleaning services can be time-consuming, especially when every job is different. Instead of going back and forth asking about property size, number of rooms, or specific requirements, a cleaning quote link allows your clients to generate a personalized estimate instantly. This saves time, reduces friction, and makes your business look more professional.
		  </p>

		  <p>
			With a single link, customers can input their details and receive a clear quote based on your pricing structure. This helps filter serious inquiries, reduces repetitive communication, and allows you to focus on high-quality leads that are ready to book.
		  </p>

		  <h2 className="text-2xl font-semibold text-gray-900">
			Benefits of Using a Quote Generator
		  </h2>

		  <p>
			A cleaning quote generator improves both efficiency and customer experience. Instead of manually calculating prices for each inquiry, your pricing rules are applied automatically. This ensures consistency across all quotes and avoids undercharging or overcharging clients.
		  </p>

		  <p>
			It also increases conversion rates. When customers receive an instant estimate, they are more likely to move forward compared to waiting for a response. Fast responses build trust and position your business as reliable and organized.
		  </p>

		  <p>
			Another major advantage is scalability. Whether you receive 5 inquiries or 50 per day, the system handles them effortlessly without increasing your workload.
		  </p>

		  <h2 className="text-2xl font-semibold text-gray-900">
			Different Types of Cleaning Pricing
		  </h2>

		  <p>
			Cleaning services can be priced in several ways depending on the type of job. One common approach is hourly pricing, where clients are charged based on the time required to complete the work. This works well for flexible or unpredictable jobs.
		  </p>

		  <p>
			Flat-rate pricing is another popular option, especially for standard services like apartment cleaning or recurring home cleaning. In this model, you set a fixed price based on property size, number of bedrooms, or predefined service packages.
		  </p>

		  <p>
			For larger or more complex jobs, such as deep cleaning, move-in/move-out cleaning, or commercial spaces, pricing is often customized. These quotes may depend on factors like square footage, level of dirt, special requests, or additional services such as carpet cleaning or window washing.
		  </p>

		  <p>
			Many successful cleaning businesses use a hybrid approach, combining base pricing with add-ons. For example, a standard cleaning fee plus optional extras like inside oven cleaning, fridge cleaning, or pet hair removal.
		  </p>

		  <h2 className="text-2xl font-semibold text-gray-900">
			Why Pricing Should Vary by Job
		  </h2>

		  <p>
			Not all cleaning jobs are the same, and pricing should reflect the actual effort required. A small apartment with minimal furniture is very different from a large house that hasn’t been cleaned in months. Charging the same price for both can lead to lost profits or unhappy customers.
		  </p>

		  <p>
			Factors such as property size, number of rooms, condition of the space, and specific client requests all impact the time and effort needed. By adjusting your pricing based on these variables, you ensure fairness for both you and your clients.
		  </p>

		  <p>
			A quote generator helps standardize this process by applying consistent rules. This reduces guesswork and ensures every client receives a fair and accurate estimate.
		  </p>

		  <h2 className="text-2xl font-semibold text-gray-900">
			How to Use Your Cleaning Quote Link
		  </h2>

		  <p>
			Once your quote link is created, you can share it anywhere your clients interact with your business. Add it to your Instagram bio, include it in your Google Business Profile, or send it directly through text messages and messaging apps when clients inquire about your services.
		  </p>

		  <p>
			You can also turn your quote link into a QR code and place it on flyers, business cards, or storefront signage. This allows potential customers to scan and receive a quote instantly without needing to contact you first.
		  </p>

		  <h2 className="text-2xl font-semibold text-gray-900">
			From Quote to Booking
		  </h2>

		  <p>
			A quote generator is a powerful first step in your sales process. Once customers receive their estimate, the next step is converting that interest into a confirmed booking. Many businesses combine quote tools with a booking page to streamline the entire workflow.
		  </p>

		  <p>
			By offering both instant quotes and easy booking options, you create a seamless experience that increases trust, improves efficiency, and helps grow your cleaning business.
		  </p>

		</div>


        {/* CTA */}
        <div className="mt-16 p-8 bg-gray-50 rounded-2xl text-center">
          <h3 className="text-2xl font-semibold text-gray-900">
            Want to Turn Quotes into Bookings?
          </h3>

          <p className="mt-4 text-gray-600">
            Create a full booking website and let customers instantly book after getting their quote.
          </p>

          <button
            onClick={() => router.push("/setup")}
            className="mt-6 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700"
          >
            Create Your Booking Website
          </button>
        </div>

      </div>
    </main>
  );
}