// app/templates/hairsalon/defaultData.ts

export const defaultData = {
  businessName: "Hair Salon",

  services: ["Haircut", "Beard Trim"],
  
	landing: {
	  header1: "Luxury",
	  header2: "Hair",
	  subheader1: "Personalized cuts, color, and treatments by expert stylists",
	  subheader2: "Effortless online booking for a premium salon experience.",
	},
	
	heroImage: "/images/hair.jpg",


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
    is_external: false,
    bookingLink: "https://vagaro.com",
  },

  email: {},

  about: {
    title: "About Us",
    description: "Professional hair services.",
    highlights: ["10+ years experience"],
  },
};
