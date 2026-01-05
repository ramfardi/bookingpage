// app/templates/cleaning/defaultData.ts

export const defaultData = {
  businessName: "Cleaning Service",

  services: ["Home Cleaning", "Deep Cleaning"],

  pricing: {
    title: "Pricing",
    plans: [
      {
        name: "Standard Cleaning",
        price: "$80",
        features: ["Kitchen", "Bathroom"],
      },
    ],
  },

  deposit: {
    enabled: false,
  },

  booking: {
    is_external: false,
  },

  email: {},

  about: {
    title: "About Us",
    description: "Professional cleaning services.",
    highlights: ["Eco friendly"],
  },
};
