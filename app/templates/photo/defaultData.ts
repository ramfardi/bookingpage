// app/templates/photography/defaultData.ts

export const defaultData = {
  businessName: "Photography Services",

  heroImage: "/images/photography.png",

  landing: {
    header1: "Professional",
    header2: "Photography",
    subheader1:
      "High-quality photography services for personal, business, and events",
    subheader2:
      "Book your photo session online with experienced photographers",
  },

  about: {
    title: "About Our Photography Services",
    description:
      "We provide professional photography services focused on capturing authentic moments with creativity, precision, and high-end equipment.",
    highlights: [
      "Experienced photographers",
      "Professional equipment",
      "High-resolution edited photos",
    ],
    gallery: [], // ✅ IMPORTANT: always include this
  },

  services: [
    // Portrait & Personal
    "Portrait Photography",
    "Family Photography",
    "Couples Photography",
    "Lifestyle Photography",

    // Events
    "Event Photography",
    "Wedding Photography",
    "Engagement Photography",
    "Birthday & Party Photography",

    // Business & Commercial
    "Corporate Photography",
    "Product Photography",
    "Brand Photography",
    "Real Estate Photography",

    // Media & Content
    "Content Creation Photography",
    "Social Media Photography",
    "Headshot Photography",

    // Specialty
    "Drone Photography",
    "Outdoor Photography",

    // Consultations
    "Photography Consultation",
  ],

  pricing: {
    title: "Pricing",
    subtitle: "Simple and transparent photography packages",
  },

  booking: {
    is_external: false,
    bookingLink: "",
  },

  deposit: {
    enabled: false,
    amount: "",
    stripeProductId: "",
  },

  email: {},
};
