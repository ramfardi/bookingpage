// app/templates/beauty/defaultData.ts

export const defaultData = {
  businessName: "Beauty & Wellness Studio",

  heroImage: "/images/beauty.png",

  landing: {
    header1: "Beauty &",
    header2: "Wellness",
    subheader1:
      "Professional beauty, wellness, and personal care services",
    subheader2:
      "Book your appointment in minutes with trusted specialists",
  },

  about: {
    title: "About Our Beauty & Wellness Studio",
    description:
      "We offer high-quality beauty and wellness services delivered by certified professionals in a relaxing and hygienic environment.",
    highlights: [
      "Certified professionals",
      "Premium products",
      "Clean & relaxing atmosphere",
    ],
    gallery: [], // ✅ IMPORTANT: always include this
  },

  services: [
    // Nails
    "Manicure",
    "Pedicure",
    "Gel Manicure",
    "Gel Pedicure",
    "Acrylic Nails",
    "Nail Extensions",
    "Nail Art",
    "Polish Change",

    // Skincare & Facials
    "Classic Facial",
    "Deep Cleansing Facial",
    "Anti-Aging Facial",
    "Hydrating Facial",
    "Chemical Peel",

    // Massage & Wellness
    "Relaxation Massage",
    "Deep Tissue Massage",
    "Hot Stone Massage",
    "Aromatherapy Massage",

    // Brows & Lashes
    "Eyebrow Shaping",
    "Eyebrow Tinting",
    "Eyelash Extensions",
    "Lash Lift & Tint",

    // Hair Removal
    "Waxing",
    "Facial Waxing",
    "Body Waxing",

    // Makeup & Events
    "Makeup Application",
    "Bridal Makeup",
    "Special Occasion Makeup",

    // Consultations
    "Beauty Consultation",
    "Skin Consultation",
  ],

  pricing: {
    title: "Service Prices",
    subtitle: "Transparent pricing with no hidden fees",
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
