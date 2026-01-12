// app/templates/hairsalon/defaultData.ts

export const defaultData = {
  businessName: "Hair Salon",

  heroImage: "/images/hair.jpg",

  landing: {
    header1: "Great Hair",
    header2: "with One Click",
    subheader1:
      "Personalized cuts, color, and treatments by expert stylists",
    subheader2:
      "Effortless online booking for a premium salon experience.",
  },

	about: {
	  title: "About Our Salon",
	  description:
		"We offer professional hair services tailored to your style, using premium products and experienced stylists.",
	  highlights: [
		"10+ years of experience",
		"Certified professional stylists",
		"Premium hair products",
	  ],
	  gallery: [],
	},


  services: [
  "Haircut",
  "Women's Haircut",
  "Men's Haircut",
  "Kids Haircut",

  "Beard Trim",
  "Beard Shaping",
  "Fade & Taper",

  "Blow Dry",
  "Blowout",
  "Hair Styling",
  "Updo / Formal Styling",

  "Hair Coloring",
  "Root Touch-Up",
  "Full Color",
  "Balayage",
  "Highlights",
  "Lowlights",
  "Toner / Gloss",
  "Color Correction",

  "Hair Treatment",
  "Deep Conditioning Treatment",
  "Keratin Treatment",
  "Olaplex / Bond Repair",
  "Scalp Treatment",
  "Hair Mask",

  "Bridal Hair",
  "Bridal Hair Trial",
  "Special Occasion Styling",

  "Hair Consultation",
  "Color Consultation",
  ],

  pricing: {
    title: "Pricing",
    subtitle: "Transparent pricing for all services",
  },

  booking: {
    is_external: false,
    bookingLink: "https://vagaro.com",
  },

  deposit: {
    enabled: false,
    amount: "",
    stripeProductId: "",
  },

  email: {},
};
