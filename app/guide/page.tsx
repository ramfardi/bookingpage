"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

const googleMapScreenshots = [
  { src: "/images/guide/google/step1.png", label: "Go to https://business.google.com/" },
  { src: "/images/guide/google/step3.png", label: "Add your buisiness name and catagory" },
  { src: "/images/guide/google/step4.png", label: "Add your buisiness location" },
  { src: "/images/guide/google/step5.png", label: "Add your contact information" },
];

const emailScreenshots = [
  { src: "/images/guide/email/step1.png", label: "Buy a domain name" },
  { src: "/images/guide/email/step2.png", label: "Choose Google Workspace plan" },
  { src: "/images/guide/email/step3.png", label: "Verify domain ownership" },
  { src: "/images/guide/email/step4.png", label: "Create custom email address" },
  { src: "/images/guide/email/step5.png", label: "Access email via Gmail" },
];

export default function BusinessGuidePage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<
    CustomerConfig | LandingConfig | null
  >(null);

  const [mode, setMode] = useState<"sales" | "client">("sales");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const hostname = window.location.hostname;
      const result = await getCustomerConfigFromHost(hostname);

      setCustomer(result.config);
      setMode(result.mode);
    }

    load();
  }, []);

  if (!customer) return null;

  /* =======================
     SALES BUSINESS GUIDE
     ======================= */
  if (mode === "sales") {
    return (
      <main className="min-h-screen bg-white px-6 py-24 flex justify-center">
        <div className="w-full max-w-5xl">
          {/* Hero */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Business Guide for Small Businesses
            </h1>

            <p className="mt-4 text-lg text-gray-600">
              Follow these visual step-by-step guides to get listed on Google,
              set up a professional email, and prepare your business for online bookings.
            </p>
          </div>

          {/* ================= Google Maps ================= */}
          <section className="mt-24">
            <h2 className="text-2xl font-semibold text-gray-900">
              1. Add Your Business to Google Maps
            </h2>

            <p className="mt-3 text-gray-600 max-w-3xl">
              Google Maps is the most important place for local customers to find you.
              Once listed, your business appears in Google Search and Maps with your
              phone number, hours, and directions.
            </p>

			<ol className="mt-6 space-y-4 list-decimal pl-6 text-gray-700">
			  <li>
				Open your web browser (Chrome, Edge, Safari) and go to{" "}
				<strong>google.com</strong>. Click <strong>Sign in</strong> in the top-right
				corner and sign in using a <strong>Gmail or Google account</strong>.
				If you don’t have one, click <strong>Create account</strong> and follow
				the instructions.
			  </li>

			  <li>
				After signing in, go to{" "}
				<strong>google.com/business</strong> and click the
				<strong> “Manage now”</strong> button. This starts the process of adding
				your business to Google Maps.
			  </li>

			  <li>
				Enter your <strong>business name</strong> exactly as customers know it,
				then click <strong>Next</strong>. Do not add extra words like city names
				or services unless they are part of your official business name.
			  </li>

			  <li>
				Choose the <strong>business category</strong> that best describes what
				you do (for example: Hair Salon, Cleaning Service, Massage Therapist),
				then click <strong>Next</strong>.
			  </li>

			  <li>
				When asked if customers visit your location, select:
				<ul className="list-disc pl-6 mt-2 space-y-1">
				  <li>
					<strong>Yes</strong> if customers come to you, then enter your full
					address.
				  </li>
				  <li>
					<strong>No</strong> if you go to customers, then enter the cities or
					areas you serve.
				  </li>
				</ul>
				Click <strong>Next</strong> to continue.
			  </li>

			  <li>
				Enter your <strong>phone number</strong> and, if you have one,
				your <strong>website</strong>. You can skip the website for now and
				add your booking website later. Click <strong>Next</strong>.
			  </li>

			  <li>
				Verify your business by choosing one of the available options
				(postcard, phone call, or email) and follow the on-screen instructions.
				After verification, your business will appear on Google Maps.
			  </li>
			</ol>


            {/* Screenshot carousel */}
			<div className="mt-10 flex gap-4 overflow-x-auto pb-4">
			  {googleMapScreenshots.map((img) => (
				<div
				  key={img.src}
				  className="min-w-[240px] cursor-pointer"
				  onClick={() => setLightbox(img.src)}
				>
				  <img
					src={img.src}
					alt={img.label}
					className="h-40 w-full object-cover rounded-xl border"
				  />
				  <p className="mt-2 text-sm text-center text-gray-600">
					{img.label}
				  </p>
				</div>
			  ))}
			</div>

            {/* Video placeholder (commented for later) */}
            {/*
            <div className="mt-8">
              YouTube video placeholder – Google Maps setup
            </div>
            */}
          </section>

          {/* ================= Business Email ================= */}
          <section className="mt-24">
            <h2 className="text-2xl font-semibold text-gray-900">
              2. Create a Professional Business Email
            </h2>

            <p className="mt-3 text-gray-600 max-w-3xl">
              A custom email like <strong>info@yourbusiness.com</strong> increases
              trust and is required for payments, bookings, and customer communication.
            </p>

			<ol className="mt-6 space-y-4 list-decimal pl-6 text-gray-700">
			  <li>
				Buy a <strong>domain name</strong> for your business. A domain is your
				website name, such as <strong>yourbusiness.com</strong>. You can buy a
				domain from providers like <strong>Namecheap</strong>,{" "}
				<strong>Google Domains</strong>, or <strong>GoDaddy</strong>. Choose a
				name that matches your business name as closely as possible.
			  </li>

			  <li>
				Go to <strong>workspace.google.com</strong> and click
				<strong> “Get started”</strong>. Sign in using your
				<strong> Gmail or Google account</strong>, then choose a Google Workspace
				plan to continue.
			  </li>

			  <li>
				When asked, enter the <strong>domain name</strong> you purchased.
				Google will ask you to <strong>verify ownership</strong>. This means
				proving that the domain belongs to you.
			  </li>

			  <li>
				To verify your domain, Google will give you a small piece of text
				(called a <strong>DNS record</strong>). Copy this text and paste it
				into the domain provider’s settings where you bought your domain
				(for example: Namecheap or GoDaddy). Then return to Google Workspace
				and click <strong>Verify</strong>.
			  </li>

			  <li>
				After verification is complete, create your business email address.
				Common examples are <strong>info@yourbusiness.com</strong>,
				<strong> bookings@yourbusiness.com</strong>, or
				<strong> support@yourbusiness.com</strong>.
			  </li>

			  <li>
				Access your business email by going to <strong>gmail.com</strong> and
				signing in with your new email address. You can use it on desktop,
				mobile, and in the Gmail app just like a normal Gmail account.
			  </li>
			</ol>


            {/* Screenshot carousel */}
            {/*<div className="mt-10 flex gap-4 overflow-x-auto pb-4">
              {emailScreenshots.map((img) => (
                <div
                  key={img.src}
                  className="min-w-[240px] cursor-pointer"
                  onClick={() => setLightbox(img.src)}
                >
                  <div className="rounded-xl border bg-gray-50 h-40 flex items-center justify-center text-gray-400">
                    Screenshot
                  </div>
                  <p className="mt-2 text-sm text-center text-gray-600">
                    {img.label}
                  </p>
                </div>
              ))}
            </div>*/}
          </section>

          {/* ================= CTA ================= */}
          <section className="mt-28 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Ready for Online Bookings?
            </h2>

            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              After customers find you on Google and trust your email,
              the next step is letting them book instantly — without phone calls.
            </p>

            <div className="mt-8">
              <button
                onClick={() => router.push("/setup")}
                className="rounded-xl bg-indigo-600 text-white px-10 py-4 font-semibold hover:bg-indigo-700 transition"
              >
                Create Your Booking Website
              </button>
            </div>
          </section>
        </div>

		{lightbox && (
		  <div
			className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
			onClick={() => setLightbox(null)}
		  >
			<img
			  src={lightbox}
			  alt="Screenshot"
			  className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
			  onClick={(e) => e.stopPropagation()}
			/>
		  </div>
		)}

      </main>
    );
  }

  /* =======================
     CLIENT MODE
     ======================= */
  return (
    <main className="min-h-screen px-6 py-24 text-center">
      <h1 className="text-3xl font-bold">Business Guide</h1>
      <p className="mt-4 text-gray-500">
        This guide is only visible on the main website.
      </p>
    </main>
  );
}
