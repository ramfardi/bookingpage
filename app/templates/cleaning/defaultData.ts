// app/templates/cleaning/defaultData.ts

export const defaultData = {
  businessName: "Cleaning Service",

  heroImage: "/images/cleaning.jpg",

  landing: {
    header1: "Professional",
    header2: "Cleaning",
    subheader1:
      "Reliable home and office cleaning services you can trust",
    subheader2:
      "Book a cleaner in minutes with flexible scheduling",
  },

	about: {
	  title: "About Our Cleaning Service",
	  description:
		"We provide high-quality residential and commercial cleaning using eco-friendly products and trained professionals.",
	  highlights: [
		"Fully insured",
		"Eco-friendly products",
		"Trusted & background-checked staff",
	  ],
	  gallery: [], // ✅ IMPORTANT: always include this
	},


  services: [
    "Standard Home Cleaning",
    "Deep Cleaning",
    "Move-in / Move-out Cleaning",
    "Office Cleaning",
    "Post-Construction Cleaning",
    "Airbnb Cleaning",
  ],

  pricing: {
    title: "Cleaning Prices",
    subtitle: "Simple and transparent pricing",
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
