// app/templates/hairsalon/defaultData.ts

export const defaultData = {
  businessName: "Hair Salon",

  services: ["Haircut", "Beard Trim"],

  pricing: {
    title: "Pricing",
    plans: [
      {
        name: "Haircut",
        price: "$35",
        features: ["Wash included"],
      },
    ],
  },

  deposit: {
    enabled: false,
  },

  booking: {
    is_external: true,
    bookingLink: "https://vagaro.com",
  },

  email: {},

  about: {
    title: "About Us",
    description: "Professional hair services.",
    highlights: ["10+ years experience"],
  },
};
