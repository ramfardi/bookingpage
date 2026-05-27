"use client";

import { useEffect, useState } from "react";
import { templates } from "@/app/templates";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import imageCompression from "browser-image-compression";
import { supabaseBrowser } from "@/app/lib/supabase-browser";
const scheduleDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildTimeSlots(startHour: string, endHour: string) {
  const [startH, startM] = startHour.split(":").map(Number);
  const [endH, endM] = endHour.split(":").map(Number);

  const start = startH * 60 + startM;
  const end = endH * 60 + endM;

  const slots: string[] = [];

  for (let t = start; t < end; t += 30) {
    const h = Math.floor(t / 60);
    const m = t % 60;

    slots.push(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    );
  }

  return slots;
}



/* ---------------- TYPES ---------------- */

type ServiceItem = {
  id: string;
  name: string;
  enabled: boolean;
  price?: string;
};

type Step = "basic" | "content" | "services" | "booking" | "schedule" | "review";

/* ---------------- ACCENT CLASSES (SAFE FOR TAILWIND) ---------------- */

const accentClass = {
  hairsalon: {
    text: "text-indigo-600",
    bg: "bg-indigo-600",
  },
  cleaning: {
    text: "text-emerald-600",
    bg: "bg-emerald-600",
  },
  beauty: {
    text: "text-emerald-600",
    bg: "bg-emerald-600",
  },
  
    fitness: {
    text: "text-emerald-600",
    bg: "bg-emerald-600",
  },
  
      home: {
    text: "text-emerald-600",
    bg: "bg-emerald-600",
  },
  
        auto: {
    text: "text-emerald-600",
    bg: "bg-emerald-600",
  },
  
          accounting: {
    text: "text-emerald-600",
    bg: "bg-emerald-600",
  },
  
            pet: {
    text: "text-emerald-600",
    bg: "bg-emerald-600",
  },
  
              photo: {
    text: "text-emerald-600",
    bg: "bg-emerald-600",
  },
};

/* ---------------- COMPONENT ---------------- */

export default function SetupPage() {
  const [templateId, setTemplateId] =
    useState<"hairsalon" | "cleaning" | "beauty" | "fitness" | "home" | "auto" |"accounting" | "pet" | "photo">("hairsalon");

  const template = templates[templateId];
  const accent = accentClass[templateId];

  const [step, setStep] = useState<Step>("basic");

  /* ---------------- BASIC ---------------- */
  
  const [form, setForm] = useState({
    businessName: "",
    email: "",
    subdomain: "",
  });
  
  const [schedule, setSchedule] = useState({
  enabled: true,
  startHour: "08:00",
  endHour: "20:00",
  intervalMinutes: 30,
  days: {
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
    Sun: [],
  } as Record<string, string[]>,
});

function toggleTime(day: string, time: string) {
  const current = schedule.days[day] || [];
  const exists = current.includes(time);

  setSchedule({
    ...schedule,
    days: {
      ...schedule.days,
      [day]: exists
        ? current.filter((t) => t !== time)
        : [...current, time].sort(),
    },
  });
};

const [testimonials, setTestimonials] = useState({
  enabled: false,
  googleReviewLink: "",
  reviews: [
    { name: "", text: "" },
    { name: "", text: "" },
    { name: "", text: "" },
  ],
});

const [contact, setContact] = useState({
  address: "",
  email: "",
  phone: "",
});

const [socialLinks, setSocialLinks] = useState({
  instagram: "",
  tiktok: "",
  x: "",
  linkedin: "",
});

const [uploading, setUploading] = useState(false);

/* ---------------- CONTENT ---------------- */

	const [useDefaultHero, setUseDefaultHero] = useState(true);
	const [useDefaultAbout, setUseDefaultAbout] = useState(true);
	
	const [createdSiteId, setCreatedSiteId] = useState<string | null>(null);
	const [createdSubdomain, setCreatedSubdomain] = useState<string | null>(null);

	const [landing, setLanding] = useState(template.defaultData.landing);

	const [about, setAbout] = useState<{
	  title: string;
	  description: string;
	  highlights: string[];
	  gallery: string[];
	}>({
	  ...template.defaultData.about,
	  gallery: [],
	});


  /* ---------------- SERVICES ---------------- */

  const [services, setServices] = useState<ServiceItem[]>([]);

  /* ---------------- BOOKING ---------------- */

const [booking, setBooking] = useState<{
  is_external: boolean;
  bookingLink: string;
}>({
  is_external: template.defaultData.booking.is_external,
  bookingLink: template.defaultData.booking.bookingLink ?? "",
});


  const [deposit, setDeposit] = useState(template.defaultData.deposit);

  /* ---------------- RESET ON TEMPLATE CHANGE ---------------- */

  useEffect(() => {
    setLanding(template.defaultData.landing);
    setAbout({
  title: template.defaultData.about.title,
  description: template.defaultData.about.description,
  highlights: template.defaultData.about.highlights ?? [],
  gallery: [],
});


    setServices(
      template.defaultData.services.map((s: string) => ({
        id: crypto.randomUUID(),
        name: s,
        enabled: false,
      }))
    );

    setBooking(template.defaultData.booking);
    setDeposit(template.defaultData.deposit);
  }, [templateId]);
  
  useEffect(() => {
  const sessionId =
    localStorage.getItem("setup_session") ||
    crypto.randomUUID();

  localStorage.setItem("setup_session", sessionId);

  fetch("/api/setup-track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId,
      step,
      templateId,
    }),
  });
}, [step, templateId]);

  /* ---------------- SUBMIT ---------------- */

async function uploadGalleryImage(file: File) {
  try {
    setUploading(true);

    const isVideo = file.type.startsWith("video/");
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const fileToUpload = isVideo
      ? file
      : await imageCompression(file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1600,
        });

    const { error } = await supabaseBrowser.storage
      .from("gallery")
      .upload(fileName, fileToUpload);

    if (error) {
      console.error(error);
      alert("Upload failed");
      return;
    }

    const { data } = supabaseBrowser.storage
      .from("gallery")
      .getPublicUrl(fileName);

    setAbout((prev) => ({
      ...prev,
      gallery: [...prev.gallery, data.publicUrl],
    }));
  } finally {
    setUploading(false);
  }
}

  async function handleCreate() {
    const siteConfig: CustomerConfig = {
      siteId: crypto.randomUUID(),
      templateId,

      businessName: form.businessName,
      subdomain: form.subdomain.toLowerCase(),

      heroImage: template.defaultData.heroImage,

      landing,
      about,
	  beforeAfter: [],
	  

      services: services
        .filter((s) => s.enabled)
        .map((s) => s.name),

      pricing: {
        title: "Pricing",
        rows: services
          .filter((s) => s.enabled && s.price)
          .map((s) => ({
            id: crypto.randomUUID(),
            name: s.name,
            price: s.price!,
          })),
      },

      booking,
      deposit,
	  
		schedule,
		testimonials,
		contact,
		socialLinks,
	  
	    isPaid: true,
  paidAt: new Date().toISOString(),
		
      email: {
        bookingNotifications: form.email,
        replyTo: form.email,
      },

    };

    const res = await fetch("/api/create-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteConfig),
    });
	
	if (!res.ok) {
	  const err = await res.json();

	  if (res.status === 409) {
		alert("This subdomain is already taken. Please choose another one.");
		return;
	  }

	  alert("Failed to create website. Please try again.");
	  return;
	}

	const { siteId } = await res.json();
	
	await fetch("/api/send-site-created-email", {
	  method: "POST",
	  headers: { "Content-Type": "application/json" },
	  body: JSON.stringify({
		email: form.email,
		siteId,
		subdomain: form.subdomain.toLowerCase(),
	  }),
	});

	setCreatedSiteId(siteId);
	setCreatedSubdomain(form.subdomain.toLowerCase());
  }

  /* ---------------- UI HELPERS ---------------- */

	const steps: Step[] = ["basic", "content", "services", "booking", "schedule", "review"];

  function StepIndicator() {
    return (
      <div className="flex justify-between mb-12 text-sm font-medium">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`flex-1 text-center ${
              step === s ? accent.text : "text-gray-400"
            }`}
          >
            {i + 1}. {s}
          </div>
        ))}
      </div>
    );
  }

  function nextStep() {
    setStep(steps[steps.indexOf(step) + 1]);
  }

  function prevStep() {
    setStep(steps[steps.indexOf(step) - 1]);
  }

  /* ---------------- RENDER ---------------- */
if (createdSiteId && createdSubdomain) {
  const privateUrl = `${window.location.origin}/site/${createdSiteId}?mode=preview`;
  const publicUrl = `https://${createdSubdomain}.simplebookme.com`;

  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      <div className="bg-white rounded-3xl shadow-xl border p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Your website is ready 🎉
        </h1>

        <p className="mt-4 text-gray-600">
          Save this private link. You can use it anytime to view and edit your website.
        </p>

        <div className="mt-8 text-left">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Private edit link
          </label>

          <div className="flex gap-2">
            <input
              readOnly
              value={privateUrl}
              className="flex-1 border rounded-xl p-3 text-sm bg-gray-50"
            />

            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(privateUrl)}
              className="bg-indigo-600 text-white px-4 rounded-xl font-semibold"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="mt-6 text-left">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Public website
          </label>

          <input
            readOnly
            value={publicUrl}
            className="w-full border rounded-xl p-3 text-sm bg-gray-50"
          />
        </div>

        <p className="mt-6 text-sm text-red-600">
          Do not share the private edit link with customers. Share only the public website link.
        </p>

        <button
          type="button"
onClick={() => {
  window.location.href = `https://${createdSubdomain}.simplebookme.com`;
}}
          className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
        >
          View your website
        </button>
      </div>
    </div>
  );
}
  return (
    <div className="max-w-2xl mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        Set up your booking site
      </h1>

      <StepIndicator />

      {/* BASIC */}
      {step === "basic" && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Basic information</h2>
          <p className="text-gray-500 text-sm">
            This information is used to create your website and receive bookings.
          </p>

          <select
            className="w-full border p-3 rounded-md"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value as any)}
          >
            <option value="hairsalon">Hair Salon</option>
            <option value="cleaning">Cleaning</option>
			<option value="beauty">Beauty</option>
			<option value="fitness">Fitness</option>
			<option value="home">Home Services</option>
			<option value="auto">Automotive Services</option>
			<option value="accounting">Accounting Services</option>
			<option value="pet">Pet Services</option>
			<option value="photo">Photography Services</option>
          </select>

		<div>
		  <input
			className="w-full border p-3 rounded-md"
			placeholder="Business name"
			value={form.businessName}
			onChange={(e) =>
			  setForm({ ...form, businessName: e.target.value })
			}
		  />

		  <p className="text-xs text-gray-500 mt-1">
			this name will appear on your website and booking pages
		  </p>
		</div>

		<div>
		  <input
			className="w-full border p-3 rounded-md"
			placeholder="Booking email"
			type="email"
			value={form.email}
			onChange={(e) =>
			  setForm({ ...form, email: e.target.value })
			}
		  />

		  <p className="text-xs text-gray-500 mt-1">
			customers booking requests will be sent to this email
		  </p>
		</div>

          <div>
            <input
              className="w-full border p-3 rounded-md"
              placeholder="yourbusiness"
              value={form.subdomain}
              onChange={(e) =>
                setForm({ ...form, subdomain: e.target.value })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              will be live at: {form.subdomain || "yourbusiness"}.simplebookme.com
            </p>
          </div>
        </section>
      )}

      {/* CONTENT */}
      {step === "content" && (
<section className="space-y-8">
  <h2 className="text-xl font-semibold">Hero & About</h2>
  <p className="text-sm text-gray-500">
    This content appears on your homepage and About page.
  </p>

  {/* ---------------- HERO ---------------- */}
  <div className="space-y-4">
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        className="w-5 h-5"
        checked={useDefaultHero}
        onChange={(e) => {
          setUseDefaultHero(e.target.checked);
          if (e.target.checked) {
            setLanding(template.defaultData.landing);
          }
        }}
      />
      Use default hero text
    </label>

    {Object.entries(landing).map(([key, value]) => (
      <input
        key={key}
        className="w-full border p-3 rounded-md"
        disabled={useDefaultHero}
        placeholder={key}
        value={value}
        onChange={(e) =>
          setLanding({ ...landing, [key]: e.target.value })
        }
      />
    ))}
  </div>

  {/* ---------------- ABOUT ---------------- */}
  <div className="space-y-4 pt-6 border-t">
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        className="w-5 h-5"
        checked={useDefaultAbout}
        onChange={(e) => {
          setUseDefaultAbout(e.target.checked);
          if (e.target.checked) {
            setAbout({
              ...template.defaultData.about,
              gallery: [],
            });
          }
        }}
      />
      Use default About content
    </label>

    <input
      className="w-full border p-3 rounded-md"
      placeholder="About title"
      disabled={useDefaultAbout}
      value={about.title}
      onChange={(e) =>
        setAbout({ ...about, title: e.target.value })
      }
    />

    <textarea
      className="w-full border p-3 rounded-md"
      rows={4}
      placeholder="About description"
      disabled={useDefaultAbout}
      value={about.description}
      onChange={(e) =>
        setAbout({ ...about, description: e.target.value })
      }
    />

<div className="space-y-3">
  <label className="text-sm font-medium text-gray-700">
    Bullet points
  </label>

  {about.highlights.map((highlight, index) => (
    <div key={index} className="flex gap-2">
      <input
        className="flex-1 border p-3 rounded-md"
        placeholder="Example: 10+ years experience"
        disabled={useDefaultAbout}
        value={highlight}
        onChange={(e) => {
          const updated = [...about.highlights];
          updated[index] = e.target.value;

          setAbout({
            ...about,
            highlights: updated,
          });
        }}
      />

      <button
        type="button"
        className="text-red-500 px-2"
        onClick={() => {
          setAbout({
            ...about,
            highlights: about.highlights.filter(
              (_, i) => i !== index
            ),
          });
        }}
      >
        Remove
      </button>
    </div>
  ))}

  <button
    type="button"
    disabled={useDefaultAbout}
    className="text-indigo-600 font-medium"
    onClick={() =>
      setAbout({
        ...about,
        highlights: [...about.highlights, ""],
      })
    }
  >
    + Add bullet point
  </button>
</div>
  </div>

{/* ---------------- GALLERY ---------------- */}
<div className="space-y-4 pt-6 border-t">
  <h3 className="text-lg font-semibold">
    Sample work gallery
  </h3>

  <p className="text-sm text-gray-500 leading-relaxed">
    Add photos/clips showing your work, portfolio, completed projects,
    business space, or services.

    <br />
    <br />

    You can either:
    <br />
    • Upload images directly using the uploader below
    <br />
    • OR paste image links manually (Google Drive still works)

    <br />
    <br />

    <strong>For Google Drive links:</strong>
    <br />
    1. Upload your image to Google Drive
    <br />
    2. Right-click the image → Share
    <br />
    3. Change access to <strong>Anyone with the link</strong>
    <br />
    4. Copy the share link and paste it below

    <br />
    <br />

    Your images will appear in a beautiful gallery on your website.
  </p>

  {/* ---------------- DIRECT UPLOAD ---------------- */}
  <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
    <input
      type="file"
      accept="image/*,video/*"
      multiple
      onChange={async (e) => {
        const files = Array.from(e.target.files || []);

        for (const file of files) {
          await uploadGalleryImage(file);
        }
      }}
      className="block w-full text-sm text-gray-600
      file:mr-4 file:rounded-xl file:border-0
      file:bg-indigo-600 file:px-4 file:py-2
      file:text-white hover:file:bg-indigo-700"
    />

    <p className="mt-3 text-sm text-gray-500">
      Upload Clips/images
    </p>

    {uploading && (
      <p className="mt-3 text-sm text-indigo-600">
        Uploading files...
      </p>
    )}
  </div>

  {/* ---------------- PREVIEW GRID ---------------- */}
  {about.gallery.length > 0 && (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {about.gallery.map((url, index) => (
        <div
          key={index}
          className="relative rounded-xl overflow-hidden border bg-white"
        >
          <img
            src={url}
            alt={`Gallery ${index}`}
            className="h-32 w-full object-cover"
          />

          <button
            type="button"
            className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-lg px-2 py-1 text-xs shadow"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              setAbout({
                ...about,
                gallery: about.gallery.filter((_, i) => i !== index),
              });
            }}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )}

  {/* ---------------- MANUAL URL INPUTS ---------------- */}
  <div className="space-y-3">
    <p className="text-sm font-medium text-gray-700">
      Add image links manually
    </p>

    {about.gallery.map((url, index) => (
      <div key={index} className="flex gap-3">
        <input
          className="flex-1 border p-3 rounded-md"
          placeholder="https://image-url.jpg"
          value={url}
          onChange={(e) => {
            const updated = [...about.gallery];
            updated[index] = e.target.value;

            setAbout({
              ...about,
              gallery: updated,
            });
          }}
        />

        <button
          type="button"
          className="text-red-500"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            setAbout({
              ...about,
              gallery: about.gallery.filter((_, i) => i !== index),
            });
          }}
        >
          Remove
        </button>
      </div>
    ))}

    <button
      type="button"
      className="text-indigo-600 font-medium"
      onClick={() =>
        setAbout({
          ...about,
          gallery: [...about.gallery, ""],
        })
      }
    >
      + Add image link
    </button>
  </div>
</div>
	  
	  
	</section>
      )}

      {/* SERVICES */}
	{step === "services" && (
	  <section className="space-y-6">
		<h2 className="text-xl font-semibold">Services & Pricing</h2>
		<p className="text-gray-500 text-sm">
		  Select services you offer and enter prices.
		</p>

		{services.map((s) => (
		  <div
			key={s.id}
			className="flex gap-3 items-center border p-3 rounded-md"
		  >
			{/* Enable / Disable */}
			<input
			  type="checkbox"
			  checked={s.enabled}
			  onChange={() =>
				setServices((prev) =>
				  prev.map((x) =>
					x.id === s.id ? { ...x, enabled: !x.enabled } : x
				  )
				)
			  }
			/>

			{/* Service name */}
			<input
			  className="flex-1 font-medium"
			  value={s.name}
			  onChange={(e) =>
				setServices((prev) =>
				  prev.map((x) =>
					x.id === s.id ? { ...x, name: e.target.value } : x
				  )
				)
			  }
			/>

			{/* Price */}
			{s.enabled && (
			  <input
				className="w-28 border p-2 rounded-md"
				placeholder="Price"
				value={s.price ?? ""}
				onChange={(e) =>
				  setServices((prev) =>
					prev.map((x) =>
					  x.id === s.id
						? { ...x, price: e.target.value }
						: x
					)
				  )
				}
			  />
			)}

			{/* ❌ REMOVE (mobile-safe) */}
			<button
			  type="button"
			  aria-label="Remove service"
			  className="ml-1 text-red-500 text-lg font-semibold px-2 py-1"
			  onClick={(e) => {
				e.preventDefault();
				e.stopPropagation(); // ✅ critical for mobile
				setServices((prev) =>
				  prev.filter((x) => x.id !== s.id)
				);
			  }}
			>
			  ×
			</button>
		  </div>
		))}

		{/* Add service */}
		<button
		  type="button"
		  onClick={() =>
			setServices((prev) => [
			  ...prev,
			  {
				id: crypto.randomUUID(),
				name: "",
				enabled: true,
			  },
			])
		  }
		  className={accent.text}
		>
		  + Add service
		</button>
	  </section>
	)}



		{/* ---------------- STEP: BOOKING ---------------- */}
		{step === "booking" && (
		  <section className="space-y-6">
			<h2 className="text-xl font-semibold">Booking</h2>
			<p className="text-sm text-gray-500">
			  Choose how clients book appointments.
			</p>

			{/* INTERNAL */}
			<label className="flex items-center gap-3">
			  <input
				type="radio"
				name="booking"
				checked={!booking.is_external}
				onChange={() =>
				  setBooking({
					is_external: false,
					bookingLink: "",
				  })
				}
			  />
			  <span>Built-in booking (email-based)</span>
			</label>

			{/* EXTERNAL */}
			<label className="flex items-center gap-3">
			  <input
				type="radio"
				name="booking"
				checked={booking.is_external}
				onChange={() =>
				  setBooking({
					is_external: true,
					bookingLink: booking.bookingLink,
				  })
				}
			  />
			  <span>
				External booking link (Vagaro, Fresha, Calendly, etc.)
			  </span>
			</label>

			{booking.is_external && (
			  <input
				className="w-full border p-3 rounded-md"
				placeholder="https://your-booking-platform.com"
				value={booking.bookingLink}
				onChange={(e) =>
				  setBooking({
					is_external: true,
					bookingLink: e.target.value,
				  })
				}
			  />
			)}
		  </section>
		)}

{/* SCHEDULE */}
{step === "schedule" && (
  <section className="space-y-6">
    <h2 className="text-xl font-semibold">Weekly schedule</h2>

    <p className="text-sm text-gray-500">
      Select the time blocks when you are available. Green means available.
    </p>

    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={schedule.enabled}
        onChange={(e) =>
          setSchedule({
            ...schedule,
            enabled: e.target.checked,
          })
        }
      />
      Show schedule page on my website
    </label>

    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-sm text-gray-600">Start time</label>
        <input
          type="time"
          step={1800}
          className="w-full border p-3 rounded-md"
          value={schedule.startHour}
          onChange={(e) =>
            setSchedule({
              ...schedule,
              startHour: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">End time</label>
        <input
          type="time"
          step={1800}
          className="w-full border p-3 rounded-md"
          value={schedule.endHour}
          onChange={(e) =>
            setSchedule({
              ...schedule,
              endHour: e.target.value,
            })
          }
        />
      </div>
    </div>

    <div className="space-y-5">
      {scheduleDays.map((day) => {
        const slots = buildTimeSlots(
          schedule.startHour,
          schedule.endHour
        );

        return (
          <div key={day} className="border rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{day}</h3>

              <button
                type="button"
                className="text-xs text-indigo-600 font-medium"
                onClick={() =>
                  setSchedule({
                    ...schedule,
                    days: {
                      ...schedule.days,
                      [day]: slots,
                    },
                  })
                }
              >
                Select all
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => {
                const selected =
                  schedule.days[day]?.includes(slot);

                return (
                  <button
                    key={`${day}-${slot}`}
                    type="button"
                    onClick={() => toggleTime(day, slot)}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      selected
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="mt-3 text-xs text-gray-500"
              onClick={() =>
                setSchedule({
                  ...schedule,
                  days: {
                    ...schedule.days,
                    [day]: [],
                  },
                })
              }
            >
              Clear {day}
            </button>
          </div>
        );
      })}
    </div>
  </section>
)}

{/* TESTIMONIALS */}
{step === "booking" && (
  <section className="space-y-6 border-t pt-8">
    <h2 className="text-xl font-semibold">Testimonials</h2>

    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={testimonials.enabled}
        onChange={(e) =>
          setTestimonials({
            ...testimonials,
            enabled: e.target.checked,
          })
        }
      />
      Show testimonials on my homepage
    </label>

    <input
      className="w-full border p-3 rounded-md"
      placeholder="Google review link"
      value={testimonials.googleReviewLink}
      onChange={(e) =>
        setTestimonials({
          ...testimonials,
          googleReviewLink: e.target.value,
        })
      }
    />

    {testimonials.reviews.map((review, index) => (
      <div key={index} className="border rounded-md p-4 space-y-3">
        <input
          className="w-full border p-3 rounded-md"
          placeholder="Reviewer name"
          value={review.name}
          onChange={(e) => {
            const updated = [...testimonials.reviews];
            updated[index].name = e.target.value;
            setTestimonials({ ...testimonials, reviews: updated });
          }}
        />

        <textarea
          className="w-full border p-3 rounded-md"
          rows={3}
          placeholder="Review text"
          value={review.text}
          onChange={(e) => {
            const updated = [...testimonials.reviews];
            updated[index].text = e.target.value;
            setTestimonials({ ...testimonials, reviews: updated });
          }}
        />
      </div>
    ))}
  </section>
)}
{/* CONTACT INFO */}
{step === "booking" && (
  <section className="space-y-6 border-t pt-8">
    <h2 className="text-xl font-semibold">Contact information</h2>

    <p className="text-sm text-gray-500">
      Optional. If provided, this will appear on your homepage below testimonials.
    </p>

    <input
      className="w-full border p-3 rounded-md"
      placeholder="Business address"
      value={contact.address}
      onChange={(e) =>
        setContact({
          ...contact,
          address: e.target.value,
        })
      }
    />

    <input
      className="w-full border p-3 rounded-md"
      placeholder="Contact email"
      type="email"
      value={contact.email}
      onChange={(e) =>
        setContact({
          ...contact,
          email: e.target.value,
        })
      }
    />

    <input
      className="w-full border p-3 rounded-md"
      placeholder="Phone number"
      value={contact.phone}
      onChange={(e) =>
        setContact({
          ...contact,
          phone: e.target.value,
        })
      }
    />
  </section>
)}

{/* SOCIAL LINKS */}
{step === "booking" && (
  <section className="space-y-6 border-t pt-8">
    <h2 className="text-xl font-semibold">Social media links</h2>

    <p className="text-sm text-gray-500">
      Optional. Add your social media links so visitors can follow or contact you.
    </p>

    <input
      className="w-full border p-3 rounded-md"
      placeholder="Instagram URL"
      value={socialLinks.instagram}
      onChange={(e) =>
        setSocialLinks({
          ...socialLinks,
          instagram: e.target.value,
        })
      }
    />

    <input
      className="w-full border p-3 rounded-md"
      placeholder="TikTok URL"
      value={socialLinks.tiktok}
      onChange={(e) =>
        setSocialLinks({
          ...socialLinks,
          tiktok: e.target.value,
        })
      }
    />

    <input
      className="w-full border p-3 rounded-md"
      placeholder="X / Twitter URL"
      value={socialLinks.x}
      onChange={(e) =>
        setSocialLinks({
          ...socialLinks,
          x: e.target.value,
        })
      }
    />

    <input
      className="w-full border p-3 rounded-md"
      placeholder="LinkedIn URL"
      value={socialLinks.linkedin}
      onChange={(e) =>
        setSocialLinks({
          ...socialLinks,
          linkedin: e.target.value,
        })
      }
    />
  </section>
)}

      {/* REVIEW */}
      {step === "review" && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Review</h2>
          <p><strong>Business:</strong> {form.businessName}</p>
          <p><strong>Website:</strong> {form.subdomain}.simplebookme.com</p>
          <p><strong>Services:</strong> {services.filter(s => s.enabled).length}</p>
        </section>
      )}

      {/* NAV */}
      <div className="flex justify-between pt-10">
        {step !== "basic" && (
          <button onClick={prevStep} className="text-gray-600">
            ← Back
          </button>
        )}

        {step !== "review" ? (
          <button
            onClick={nextStep}
            className={`${accent.bg} text-white px-6 py-3 rounded-md`}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleCreate}
            className={`${accent.bg} text-white px-6 py-3 rounded-md`}
          >
            Create website
          </button>
        )}
      </div>
    </div>
  );
}
