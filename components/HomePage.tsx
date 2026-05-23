"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";
import { useRouter } from "next/navigation";

import { ArrowRight, Instagram } from "lucide-react";

import { FaInstagram, FaTiktok, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function HomePage({
  activeCustomer,
}: {
  activeCustomer?: CustomerConfig;
}) {
  const router = useRouter();

  const [customer, setCustomer] = useState<
    CustomerConfig | LandingConfig | null
  >(null);

  const [customerKey, setCustomerKey] = useState<string | null>(null);
  const [mode, setMode] = useState<"sales" | "client">("sales");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const [typedSubheader1, setTypedSubheader1] = useState("");
  const [typedSubheader2, setTypedSubheader2] = useState("");
  
  const [typedHeader1, setTypedHeader1] = useState("");
  const [typedHeader2, setTypedHeader2] = useState("");
  
useEffect(() => {
  if (!customer) return;

  const text1 = customer.landing.header1 || "";
  const text2 = customer.landing.header2 || "";

  setTypedHeader1("");
  setTypedHeader2("");

  let i = 0;
  let j = 0;

  const interval1 = setInterval(() => {
    i++;
    setTypedHeader1(text1.slice(0, i));

    if (i >= text1.length) {
      clearInterval(interval1);

      const interval2 = setInterval(() => {
        j++;
        setTypedHeader2(text2.slice(0, j));

        if (j >= text2.length) {
          clearInterval(interval2);
        }
      }, 100);
    }
  }, 80);

  return () => clearInterval(interval1);
}, [customer]);

  useEffect(() => {
    if (activeCustomer) {
      setCustomer(activeCustomer);
      setMode("client");
    }
  }, [activeCustomer]);

  useEffect(() => {
    async function load() {
      const hostname = window.location.hostname;
      const result = await getCustomerConfigFromHost(hostname);

      setCustomer(result.config);
      setMode(result.mode);
      setCustomerKey(result.key);
    }

    load();
  }, []);
  

  
  useEffect(() => {
  if (!customer) return;

  const landing = customer.landing;
  const text1 = landing.subheader1 || "";
  const text2 = landing.subheader2 || "";

  setTypedSubheader1("");
  setTypedSubheader2("");

  let i = 0;
  let j = 0;

  const interval1 = setInterval(() => {
    i++;

    setTypedSubheader1(text1.slice(0, i));

    if (i >= text1.length) {
      clearInterval(interval1);

      const interval2 = setInterval(() => {
        j++;

        setTypedSubheader2(text2.slice(0, j));

        if (j >= text2.length) {
          clearInterval(interval2);
        }
      }, 35);
    }
  }, 30);

  return () => {
    clearInterval(interval1);
  };
}, [customer, mode]);

  if (!customer) return null;

  const landing = customer.landing;

  function handleBookAppointment() {
    if (mode !== "client") {
      router.push("/setup");
      return;
    }

    const customerConfig = customer as CustomerConfig;
    const booking = customerConfig.booking;

    if (booking?.is_external && booking.bookingLink) {
      window.location.href = booking.bookingLink;
      return;
    }
	router.push("/booking");
  }

return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "SimpleBookMe",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description:
            "Booking website builder for cleaners, salons, home services, and independent businesses.",
          url: "https://simplebookme.com",
          image: "https://simplebookme.com/images/og-home.jpg",

          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "CAD",
          },

          creator: {
            "@type": "Organization",
            name: "SimpleBookMe",
            url: "https://simplebookme.com",
          },
        }),
      }}
    />

    <main className="min-h-screen w-full flex flex-col">
      {/* ================= HERO ================= */}
      {/*<section
        className="relative min-h-[90vh] pt-20 flex items-center justify-center text-center text-white"
        style={{
          backgroundImage: `url(${
            mode === "sales"
              ? (customer as LandingConfig).heroImage
              : (customer as CustomerConfig).heroImage
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >*/}
	  
	  <section className="relative min-h-[90vh] pt-20 flex items-center justify-center text-center text-white overflow-hidden">
		  {mode === "sales" ? (
			<video
			  autoPlay
			  muted
			  loop
			  playsInline
			  className="absolute inset-0 w-full h-full object-cover"
			>
			  <source src="/videos/landing_page_clip.mp4" type="video/mp4" />
			</video>
		  ) : (
			<div
			  className="absolute inset-0 bg-cover bg-center"
			  style={{
				backgroundImage: `url(${(customer as CustomerConfig).heroImage})`,
			  }}
			/>
		  )}
        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl px-6"
        >
          {landing && (
<>
  {/* OVERLAY WRAPPER (important for readability) */}
<div className="relative z-10 max-w-5xl px-6 text-center">
  <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white min-h-[180px]">
    
    <span>
      {typedHeader1}
    </span>

    {" "}

    <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
      {typedHeader2}
    </span>

    <span className="animate-pulse text-white">|</span>
  </h1>
</div>

<div className="mt-6 max-w-3xl mx-auto text-center">
  <p className="text-lg md:text-xl text-gray-100 leading-relaxed min-h-[32px]">
    {typedSubheader1}
    <span className="animate-pulse">|</span>
  </p>

  <p className="mt-3 text-base md:text-lg text-indigo-200 font-semibold min-h-[28px]">
    {typedSubheader2}
  </p>
</div>

</>
          )}

          <div className="mt-10 flex justify-center">
{mode === "client" ? (
  <div className="flex flex-col items-center gap-6">
    <button
      onClick={handleBookAppointment}
      className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
    >
      Book appointment
    </button>
  </div>
) : (
<div className="flex flex-col items-center gap-5">

  {/* PRIMARY CTA */}
<button
  onClick={() => router.push("/setup")}
  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-10 py-4 font-semibold text-white shadow-[0_10px_40px_rgba(99,102,241,0.45)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_15px_50px_rgba(99,102,241,0.6)]"
>
  {/* Glow effect */}
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-white/10" />

  {/* Shine animation */}
  <div className="absolute -left-20 top-0 h-full w-16 rotate-12 bg-white/20 blur-xl transition-all duration-700 group-hover:left-[120%]" />

  {/* Content */}
  <div className="relative flex items-center gap-3">
    <span className="text-lg">
      Create Yours Now
    </span>

    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
  </div>
</button>

  {/* SECONDARY CTA */}
  {/*<button
    onClick={() => router.push("/instagram_setup")}
    className="flex items-center gap-2 rounded-2xl bg-white text-gray-900 px-10 py-4 font-semibold border shadow-sm hover:bg-gray-50 hover:shadow-md transition-all"
  >
    <Instagram className="w-5 h-5 text-pink-500" />
    Create your Instagram bio link
  </button>*/}
  
    {/* FREE TOOL CTA */}
  {/*<button
    onClick={() => router.push("/availability")}
    className="flex items-center gap-2 rounded-2xl bg-indigo-50 text-indigo-700 px-10 py-4 font-semibold border border-indigo-200 shadow-sm hover:bg-indigo-100 hover:shadow-md transition-all"
  >
    <ArrowRight className="w-5 h-5" />
    Create availability page

    <span className="ml-2 text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
      FREE
    </span>
  </button>*/}

</div>
)}
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>
{mode === "client" &&
  (customer as CustomerConfig).testimonials?.enabled && (
    <section className="bg-white px-6 py-20 border-t">
      <div className="max-w-6xl mx-auto">
        <div className="h-px bg-gray-200 mb-14" />

        <div className="text-center mb-10">
		<h2 className="text-4xl font-semibold italic text-gray-900 font-serif">
		  testimonials
		</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {(customer as CustomerConfig).testimonials?.reviews
            .filter((r) => r.name || r.text)
            .map((r, i) => (
              <div
                key={i}
                className="w-full max-w-sm rounded-2xl bg-gray-50 border p-6 shadow-sm text-center"
              >
                <div className="text-yellow-400 text-lg">
                  ★★★★★
                </div>

			<p className="mt-4 text-gray-700 text-lg italic font-medium leading-relaxed">
			  “{r.text}”
			</p>

                <p className="mt-5 font-semibold text-gray-900">
                  {r.name}
                </p>
              </div>
            ))}
        </div>

		{(customer as CustomerConfig).testimonials?.googleReviewLink && (
		  <div className="mt-12 flex flex-col items-center justify-center">
			
			{/* QR CODE */}
			<div className="rounded-3xl bg-white border p-4 shadow-lg mb-5">
			  <img
				src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
				  (customer as CustomerConfig).testimonials
					?.googleReviewLink || ""
				)}`}
				alt="Google review QR code"
				className="w-40 h-40"
			  />

			  <p className="mt-3 text-sm text-gray-500 text-center">
				Scan to leave a review
			  </p>
			</div>

			{/* REVIEW BUTTON */}
			<a
			  href={(customer as CustomerConfig).testimonials?.googleReviewLink}
			  target="_blank"
			  rel="noopener noreferrer"
			  className="inline-flex items-center gap-3 rounded-xl bg-indigo-600 text-white px-7 py-3 font-semibold hover:bg-indigo-700 transition shadow-md"
			>
<div className="bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
  <span
    className="font-bold text-lg leading-none"
    style={{
      background:
        "conic-gradient(#4285F4 0deg 90deg, #34A853 90deg 180deg, #FBBC05 180deg 270deg, #EA4335 270deg 360deg)",
      WebkitBackgroundClip: "text",
      color: "transparent",
    }}
  >
    G
  </span>
</div>
			  Leave us a review 😊
			</a>
		  </div>
		)}
      </div>
    </section>
  )}
  
  
  {mode === "client" &&
  ((customer as CustomerConfig).contact?.address ||
    (customer as CustomerConfig).contact?.email ||
    (customer as CustomerConfig).contact?.phone) && (
    <section className="bg-white px-6 py-20 border-t">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-stretch">
        {(customer as CustomerConfig).contact?.address && (
          <div className="rounded-3xl overflow-hidden border shadow-sm min-h-[320px]">
            <iframe
              title="Business location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                (customer as CustomerConfig).contact?.address || ""
              )}&output=embed`}
              className="w-full h-full min-h-[320px]"
              loading="lazy"
            />
          </div>
        )}

        <div className="rounded-3xl border shadow-sm p-8 bg-gray-50 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Contact us
          </h2>

          {(customer as CustomerConfig).contact?.address && (
            <p className="text-gray-700 mb-4">
              <strong>Address:</strong><br />
              {(customer as CustomerConfig).contact?.address}
            </p>
          )}

          {(customer as CustomerConfig).contact?.email && (
            <p className="text-gray-700 mb-4">
              <strong>Email:</strong><br />
              <a
                href={`mailto:${(customer as CustomerConfig).contact?.email}`}
                className="text-indigo-600"
              >
                {(customer as CustomerConfig).contact?.email}
              </a>
            </p>
          )}

          {(customer as CustomerConfig).contact?.phone && (
            <p className="text-gray-700">
              <strong>Phone:</strong><br />
              <a
                href={`tel:${(customer as CustomerConfig).contact?.phone}`}
                className="text-indigo-600"
              >
                {(customer as CustomerConfig).contact?.phone}
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  )}
  
  
  {/* SOCIAL LINKS */}
{mode === "client" &&
  (
    (customer as CustomerConfig).socialLinks?.instagram ||
    (customer as CustomerConfig).socialLinks?.tiktok ||
    (customer as CustomerConfig).socialLinks?.x ||
    (customer as CustomerConfig).socialLinks?.linkedin
  ) && (
    <div className="mt-8 pt-6 pb-16 border-t">
      <h3 className="font-semibold text-gray-900 mb-4 text-center">
        Follow us
      </h3>

      <div className="flex flex-wrap gap-3 justify-center">
        {(customer as CustomerConfig).socialLinks?.instagram && (
          <a
            href={(customer as CustomerConfig).socialLinks?.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-pink-50 text-pink-600 px-4 py-2 font-medium hover:bg-pink-100 transition"
          >
            <FaInstagram className="text-xl" />
            Instagram
          </a>
        )}

        {(customer as CustomerConfig).socialLinks?.tiktok && (
          <a
            href={(customer as CustomerConfig).socialLinks?.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-100 text-black px-4 py-2 font-medium hover:bg-gray-200 transition"
          >
            <FaTiktok className="text-xl" />
            TikTok
          </a>
        )}

        {(customer as CustomerConfig).socialLinks?.x && (
          <a
            href={(customer as CustomerConfig).socialLinks?.x}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-2 font-medium hover:bg-gray-900 transition"
          >
            <FaXTwitter className="text-xl" />
            X
          </a>
        )}

        {(customer as CustomerConfig).socialLinks?.linkedin && (
          <a
            href={(customer as CustomerConfig).socialLinks?.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-50 text-blue-700 px-4 py-2 font-medium hover:bg-blue-100 transition"
          >
            <FaLinkedin className="text-xl" />
            LinkedIn
          </a>
        )}
      </div>
    </div>
)}
  
      {/* ================= SALES ONLY ================= */}
      {mode === "sales" && (
        <>

		  
		  
		  {/* -------- FEATURE SHOWCASE -------- */}
<section className="w-full bg-gradient-to-b from-white to-indigo-50 py-32 overflow-hidden">
  <div className="mx-auto max-w-7xl px-6 space-y-32">


    {/* booking */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
    >

      {/* TEXT FIRST */}
      <div className="order-2 lg:order-1">
        <p className="text-indigo-600 font-semibold uppercase tracking-[0.25em] mb-6">
          EASY BOOKING
        </p>

        <blockquote className="text-4xl md:text-5xl leading-tight font-light italic text-gray-900">
          “Let customers book with you and choose your services.”
        </blockquote>

        <p className="mt-8 text-lg text-gray-600 leading-relaxed max-w-xl">
          Your clients can select the service and time and book via email,
          you can confirm or modify the booking. Alternatively, you can use other booking systems like Fresha or Vagaro. 
        </p>
      </div>

      {/* IMAGE */}
      <div className="relative order-1 lg:order-2">
        <div className="absolute inset-0 bg-purple-200 blur-3xl opacity-30 rounded-full"></div>

        <div className="relative rounded-3xl overflow-hidden border border-white/40 shadow-2xl bg-white">
          <img
            src="/images/book.png"
            alt="Quote generator feature"
            className="w-full object-cover"
          />
        </div>
      </div>
    </motion.div>


    {/* schedule */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
    >

      {/* LEFT IMAGE */}
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-200 blur-3xl opacity-30 rounded-full"></div>

        <div className="relative rounded-3xl overflow-hidden border border-white/40 shadow-2xl bg-white">
          <img
            src="/images/schedule.png"
            alt="Availability feature"
            className="w-full object-cover"
          />
        </div>
      </div>

      {/* RIGHT TEXT */}
      <div>
        <p className="text-indigo-600 font-semibold uppercase tracking-[0.25em] mb-6">
          LIVE AVAILABILITY
        </p>

        <blockquote className="text-4xl md:text-5xl leading-tight font-light italic text-gray-900">
          “Share your weekly schedule with customers instantly.”
        </blockquote>

        <p className="mt-8 text-lg text-gray-600 leading-relaxed max-w-xl">
          Create a beautiful public availability page that updates in real time (update it anytime).
          Perfect for cleaners, stylists, handymen, and independent service businesses.
        </p>
      </div>
    </motion.div>


    {/* Pricing */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
    >

      {/* TEXT FIRST */}
      <div className="order-2 lg:order-1">
        <p className="text-indigo-600 font-semibold uppercase tracking-[0.25em] mb-6">
          CLEAR PRICING
        </p>

        <blockquote className="text-4xl md:text-5xl leading-tight font-light italic text-gray-900">
          “Share your pricing with the custmers, update it anytime”
        </blockquote>

        <p className="mt-8 text-lg text-gray-600 leading-relaxed max-w-xl">
          Add services from an extensive list based on your service catagory or add yours, share your pricing with the clients and adjust it anytime.
        </p>
      </div>

      {/* IMAGE */}
      <div className="relative order-1 lg:order-2">
        <div className="absolute inset-0 bg-purple-200 blur-3xl opacity-30 rounded-full"></div>

        <div className="relative rounded-3xl overflow-hidden border border-white/40 shadow-2xl bg-white">
          <img
            src="/images/price.png"
            alt="Quote generator feature"
            className="w-full object-cover"
          />
        </div>
      </div>
    </motion.div>



    {/* Testimonial */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
    >

      {/* LEFT IMAGE */}
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-200 blur-3xl opacity-30 rounded-full"></div>

        <div className="relative rounded-3xl overflow-hidden border border-white/40 shadow-2xl bg-white">
          <img
            src="/images/testi.png"
            alt="Availability feature"
            className="w-full object-cover"
          />
        </div>
      </div>

      {/* RIGHT TEXT */}
      <div>
        <p className="text-indigo-600 font-semibold uppercase tracking-[0.25em] mb-6">
          INSTANT TRUST
        </p>

        <blockquote className="text-4xl md:text-5xl leading-tight font-light italic text-gray-900">
          “Let customers see your testimonials —
          build trust instantly.”
        </blockquote>

        <p className="mt-8 text-lg text-gray-600 leading-relaxed max-w-xl">
          Your clients can see the link and QR code for your Google Review,
          or any other review link that you have.
        </p>
      </div>
    </motion.div>


  </div>
</section>
		  
	          {/* -------- FEATURES -------- */}
          <section className="w-full bg-gradient-to-b from-white to-indigo-50 py-32">
            <div className="mx-auto max-w-6xl px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900">
                  Everything you need to book smarter
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Launch a professional booking website in seconds — no setup required.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Use your existing booking system",
                    desc: "Connect Vagaro, Fresha, or any booking system you already use.",
                  },
                  {
                    title: "Built-in email booking",
                    desc: "Clients book via email with automatic confirmation and calendar invites (.ics).",
                  },
                  {
                    title: "One-time setup. No monthly fees.",
                    desc: "Pay once and keep using it — no subscriptions.",
                  },
                ].map((f) => (
                  <motion.div
                    key={f.title}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="rounded-2xl bg-white p-8 shadow-md border hover:shadow-xl"
                  >
                    <h3 className="text-xl font-semibold text-gray-900">
                      {f.title}
                    </h3>
                    <p className="mt-3 text-gray-600">
                      {f.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>	  
		  

			{/*
			<section className="bg-white py-28">
			  <div className="mx-auto max-w-5xl px-8 text-center">
				<h2 className="text-3xl font-bold text-gray-900">
				  How to use SimpleBookMe
				</h2>
				<p className="mt-4 text-lg text-gray-600">
				  A quick walkthrough showing how to create your site and accept bookings.
				</p>

				<div className="mt-12 aspect-video rounded-2xl bg-gray-100 border flex items-center justify-center text-gray-400 text-sm">
				  Demo video coming soon

				  <iframe
					className="absolute inset-0 w-full h-full"
					src="https://www.youtube.com/embed/VIDEO_ID"
					title="How to use SimpleBookMe"
					frameBorder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				  />
				</div>
			  </div>
			</section>
			*/}


          {/* -------- FAQ -------- */}
          <section className="bg-gray-50 py-28">
            <div className="mx-auto max-w-4xl px-8">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
                Frequently asked questions
              </h2>

              <div className="space-y-4">
                {[
                  {
                    q: "What is the cost?",
                    a: "SimpleBookMe is currently free.",
                  },
                  {
                    q: "Can I use my existing booking system?",
                    a: "Yes. You can link any external booking system or use the built-in email booking.",
                  },
                  {
                    q: "Do my clients need to create an account?",
                    a: "No. Clients book using email only.",
                  },
				  {
					  q: "Can I customize my website later?",
					  a: "Yes. You can edit your website content, services, pricing, and booking options at any time.",
					},
					{
					  q: "Do I get my own booking website link?",
					  a: "Yes. You get a unique booking website link that you can share with your clients.",
					},
					{
				  q: "Can I use pre-built services based on my category?",
				  a: "Yes. You can start with pre-built services based on your business category and customize them anytime.",
				},

                ].map((item, i) => (
                  <div
                    key={item.q}
                    className="rounded-xl bg-white border"
                  >
                    <button
                      onClick={() =>
                        setOpenFaq(openFaq === i ? null : i)
                      }
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <span className="font-semibold text-gray-900">
                        {item.q}
                      </span>
                      <span className="text-2xl font-light">
                        {openFaq === i ? "−" : "+"}
                      </span>
                    </button>

                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 pb-6 text-gray-600"
                        >
                          {item.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* -------- FOOTER -------- */}
          <footer className="bg-white border-t py-12 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} SimpleBookMe — All rights reserved.
          </footer>
        </>
      )}
    </main>
  </>
);
}
