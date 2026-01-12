// app/templates/automotive/defaultData.ts

export const defaultData = {
  businessName: "Automotive Services",

  heroImage: "/images/auto.png",

  landing: {
    header1: "Trusted",
    header2: "Auto Services",
    subheader1:
      "Professional automotive care, maintenance, and repair services",
    subheader2:
      "Book your auto service online with fast and reliable technicians",
  },

  about: {
    title: "About Our Automotive Services",
    description:
      "We provide reliable automotive services performed by certified technicians using quality parts and modern equipment.",
    highlights: [
      "Certified auto technicians",
      "Quality parts & equipment",
      "Honest and transparent pricing",
    ],
    gallery: [], // ✅ IMPORTANT: always include this
  },

  services: [
    // Detailing & Wash
    "Car Detailing",
    "Interior Detailing",
    "Exterior Detailing",
    "Mobile Car Wash",
    "Hand Wash & Wax",

    // Maintenance
    "Oil Change",
    "Fluid Check & Top-Up",
    "Battery Replacement",
    "Brake Inspection",

    // Repair
    "Auto Repair",
    "Engine Diagnostics",
    "Brake Repair",
    "Suspension Repair",

    // Tires
    "Tire Services",
    "Tire Change",
    "Tire Rotation",
    "Wheel Balancing",

    // Inspections
    "Vehicle Inspection",
    "Pre-Purchase Inspection",
    "Safety Inspection",

    // Specialty
    "Window Tinting",
    "Headlight Restoration",

    // Consultations
    "Automotive Consultation",
  ],

  pricing: {
    title: "Pricing",
    subtitle: "Clear pricing with no hidden fees",
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
