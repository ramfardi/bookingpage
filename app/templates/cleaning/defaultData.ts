// app/templates/cleaning/defaultData.ts

export const defaultData = {
  businessName: "Cleaning Service",

  services: ["Home Cleaning", "Deep Cleaning"],
  
	landing: {
	  header1: "Spotless",
	  header2: "Spaces",
	  subheader1: "Reliable home and office cleaning you can trust",
	  subheader2: "Book a professional clean in minutes — simple and hassle-free.",
	},

	
	heroImage: "/images/cleaning.jpg",

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
