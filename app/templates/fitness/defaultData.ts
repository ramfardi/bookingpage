// app/templates/fitness/defaultData.ts

export const defaultData = {
  businessName: "Fitness & Training Studio",

  heroImage: "/images/fitness.png",

  landing: {
    header1: "Fitness &",
    header2: "Training",
    subheader1:
      "Personalized fitness, training, and wellness programs",
    subheader2:
      "Book your session in minutes with certified trainers",
  },

  about: {
    title: "About Our Fitness & Training Studio",
    description:
      "We provide personalized fitness and training programs designed to help you build strength, improve health, and achieve your goals safely and effectively.",
    highlights: [
      "Certified personal trainers",
      "Customized workout plans",
      "All fitness levels welcome",
    ],
    gallery: [], // ✅ IMPORTANT: always include this
  },

  services: [
    // Personal Training
    "Personal Training Session",
    "One-on-One Training",
    "Small Group Training",
    "Strength Training",
    "Weight Loss Training",

    // Fitness Classes
    "Yoga Class",
    "Pilates Class",
    "HIIT Training",
    "Functional Training",
    "Bootcamp Class",

    // Wellness & Recovery
    "Stretching Session",
    "Mobility Training",
    "Recovery Session",
    "Sports Massage",

    // Coaching & Assessment
    "Fitness Assessment",
    "Body Composition Analysis",
    "Posture Assessment",

    // Specialty Training
    "Senior Fitness Training",
    "Prenatal / Postnatal Fitness",
    "Athletic Performance Training",

    // Consultations
    "Fitness Consultation",
    "Nutrition & Lifestyle Consultation",
  ],

  pricing: {
    title: "Training Prices",
    subtitle: "Flexible plans with transparent pricing",
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
