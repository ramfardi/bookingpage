// app/templates/hairsalon/defaultData.ts

export const defaultData = {
  businessName: "Hair Salon",

  heroImage: "/images/hair.jpg",

  landing: {
    header1: "Luxury",
    header2: "Hair",
    subheader1:
      "Personalized cuts, color, and treatments by expert stylists",
    subheader2:
      "Effortless online booking for a premium salon experience.",
  },

  about: {
    title: "About Us",
    description: "Professional hair services.",
    highlights: ["10+ years experience"],
  },

  services: [
    "Haircut",
    "Beard Trim",
    "Hair Coloring",
    "Blow Dry",
    "Hair Treatment",
  ],

  pricing: {
    title: "Pricing",
    subtitle: "Transparent pricing for all services",
  },

  booking: {
    mode: "internal", // "internal" | "external"
    externalBookingUrl: "https://vagaro.com",
  },

  deposit: {
    enabled: false,
    amount: "",
    stripeProductId: "",
  },

  email: {},
};
