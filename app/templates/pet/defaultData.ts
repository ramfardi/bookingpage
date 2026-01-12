// app/templates/pet-services/defaultData.ts

export const defaultData = {
  businessName: "Pet Care Services",

  heroImage: "/images/pet.png",

  landing: {
    header1: "Trusted",
    header2: "Pet Care",
    subheader1:
      "Professional care, grooming, and training services for your pets",
    subheader2:
      "Book trusted pet professionals online with flexible scheduling",
  },

  about: {
    title: "About Our Pet Care Services",
    description:
      "We provide loving, reliable, and professional pet care services designed to keep your pets happy, healthy, and safe.",
    highlights: [
      "Experienced pet professionals",
      "Safe & caring environment",
      "Trusted by pet owners",
    ],
    gallery: [], // ✅ IMPORTANT: always include this
  },

  services: [
    // Grooming
    "Pet Grooming",
    "Dog Grooming",
    "Cat Grooming",
    "Bath & Brush",
    "Nail Trimming",

    // Walking & Sitting
    "Dog Walking",
    "Pet Sitting",
    "In-Home Pet Sitting",
    "Overnight Pet Sitting",

    // Boarding
    "Pet Boarding",
    "Dog Boarding",
    "Cat Boarding",

    // Training
    "Dog Training",
    "Puppy Training",
    "Behavior Training",

    // Health & Wellness
    "Pet Health Check",
    "Medication Administration",
    "Senior Pet Care",

    // Specialty
    "Pet Transportation",
    "Pet Taxi Service",

    // Consultations
    "Pet Care Consultation",
    "Training Consultation",
  ],

  pricing: {
    title: "Pricing",
    subtitle: "Clear and transparent pricing for all pet services",
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
