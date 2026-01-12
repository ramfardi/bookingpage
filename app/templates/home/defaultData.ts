// app/templates/home-services/defaultData.ts

export const defaultData = {
  businessName: "Home & Trade Services",

  heroImage: "/images/home.png",

  landing: {
    header1: "Reliable",
    header2: "Home Services",
    subheader1:
      "Professional home repair, installation, and maintenance services",
    subheader2:
      "Book trusted technicians online with flexible scheduling",
  },

  about: {
    title: "About Our Home & Trade Services",
    description:
      "We provide dependable residential and commercial trade services delivered by licensed, insured, and experienced professionals.",
    highlights: [
      "Licensed & insured technicians",
      "Fast response times",
      "Upfront, transparent pricing",
    ],
    gallery: [], // ✅ IMPORTANT: always include this
  },

  services: [
    // Plumbing
    "Plumbing Repair",
    "Drain Cleaning",
    "Leak Detection & Repair",
    "Toilet Repair & Installation",
    "Faucet Repair & Replacement",
    "Water Heater Service",

    // Electrical
    "Electrical Services",
    "Electrical Repair",
    "Outlet & Switch Installation",
    "Lighting Installation",
    "Electrical Panel Upgrade",

    // Handyman
    "Handyman Services",
    "General Home Repairs",
    "Door & Window Repair",
    "Drywall Repair",

    // Appliance Repair
    "Appliance Repair",
    "Washer & Dryer Repair",
    "Refrigerator Repair",
    "Dishwasher Repair",

    // HVAC / AC
    "HVAC / AC Services",
    "Air Conditioning Repair",
    "Heating System Repair",
    "HVAC Maintenance",

    // Painting & Drywall
    "Interior Painting",
    "Exterior Painting",
    "Drywall Installation & Repair",

    // Furniture & Installation
    "Furniture Assembly",
    "TV Mounting",
    "Wall Mount Installation",

    // Smart Home
    "Smart Home Installation",
    "Smart Thermostat Installation",
    "Security Camera Installation",

    // Consultations
    "Home Service Consultation",
  ],

  pricing: {
    title: "Pricing",
    subtitle: "Fair and transparent pricing for every service",
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
