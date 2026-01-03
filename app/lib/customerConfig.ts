// app/lib/customerConfig.ts

export type PricingPlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
};

export type CustomerConfig = {
  businessName: string;
  heroImage: string;
  bookingEmailForm: string;
  services: string[];

  landing: {
    header1: string;
    header2: string;
    subheader1: string;
    subheader2: string;
  };

  pricing: {
    title: string;
    subtitle: string;
    plans: PricingPlan[];
  };

  deposit: {
  enabled: boolean;
  amountLabel?: string;
  stripePaymentLink?: string;
  };
  
  booking: {
  is_external: boolean;
  bookingLink?: string;
  };
  
	email?: {
    bookingNotifications?: string;
    replyTo?: string;
  };

  about: {
    title: string;
    description: string;
    highlights: string[];
  };
};

export const CUSTOMER_CONFIG: Record<string, CustomerConfig> = {
  // =============================
  // Hairdresser example
  // =============================
  vida: {
    businessName: "Your Hair by Vida",
    heroImage: "/images/hair.jpg",
    bookingEmailForm: "https://formspree.io/f/xykyrayq",
    services: [
      "Haircut",
      "Beard trim",
      "Hair coloring",
      "Blow dry",
    ],

    landing: {
      header1: "Your Hair by",
      header2: "Vida",
      subheader1: "Professional Hair Services",
      subheader2: "Haircut | Coloring | Highlight | Balayage",

    },

    pricing: {
      title: "Pricing",
      subtitle: "Clear and simple pricing for every visit.",
      plans: [
        {
          name: "Haircut",
          price: "$35",
          description: "Standard haircut service",
          features: ["Wash included", "30–45 minutes"],
        },
        {
          name: "Haircut + Beard",
          price: "$50",
          description: "Complete grooming package",
          features: ["Wash included", "Beard shaping"],
        },
		        {
          name: "Blow dry",
          price: "$60",
          description: "Complete grooming package",
          features: ["Wash included", "Beard shaping"],
        },
      ],
    },
	
	deposit: {
  enabled: false,
  amountLabel: "$20 deposit required to confirm",
  stripePaymentLink: "https://buy.stripe.com/abc123",
	},
	
	booking: {
  is_external: true,
  bookingLink: "https://www.vagaro.com/yourhairbyvida",
	},
	
  email: {
    bookingNotifications: "myvisualrf@gmail.com",
    replyTo: "myvisualrf@gmail.com",
  },

    about: {
      title: "About Alex Hair Studio",
      description:
        "Alex Hair Studio is a locally owned salon offering modern hair services with a focus on quality and comfort.",
      highlights: [
        "10+ years of experience",
        "Modern techniques",
        "Friendly and relaxed atmosphere",
      ],
    },
  },

  // =============================
  // Handyman example
  // =============================
  johnfix: {
    businessName: "John the Handyman",
    heroImage: "/images/handyman.jpg",
    bookingEmailForm: "https://formspree.io/f/ab12cd34",
    services: [
      "General repair",
      "Furniture assembly",
      "Plumbing fix",
      "Electrical check",
    ],

    landing: {
      header1: "Book Trusted",
      header2: "Home Repairs",
      subheader1: "Reliable local handyman services.",
      subheader2: "Request a visit online in minutes.",
    },

    pricing: {
      title: "Service Rates",
      subtitle: "Transparent pricing for common services.",
      plans: [
        {
          name: "Basic Repair",
          price: "$60",
          description: "Minor home repairs",
          features: ["Up to 1 hour", "Tools included"],
        },
        {
          name: "Extended Visit",
          price: "$100",
          description: "Multiple tasks or larger jobs",
          features: ["Up to 2 hours", "Detailed inspection"],
        },
      ],
    },
	
		deposit: {
  enabled: true,
  amountLabel: "$10 deposit required to confirm",
  stripePaymentLink: "https://buy.stripe.com/abc123",
	},
	
		booking: {
  is_external: false,
  bookingLink: "https://vagaro.com/yourhairbyvida",
	},
	
	email: {
  bookingNotifications: "john@simplebookme.com",
},

    about: {
      title: "About John the Handyman",
      description:
        "John provides reliable and honest handyman services for homes and apartments, with a focus on quality work.",
      highlights: [
        "Fully insured",
        "Years of hands-on experience",
        "Friendly and professional",
      ],
    },
  },

  // =============================
  // Cleaning service example
  // =============================
  sarahclean: {
    businessName: "Sarah Cleaning",
    heroImage: "/images/cleaning.jpg",
    bookingEmailForm: "https://formspree.io/f/clean123",
    services: [
      "Home cleaning",
      "Deep cleaning",
      "Move-out cleaning",
    ],

    landing: {
      header1: "Book Professional",
      header2: "Cleaning Services",
      subheader1: "A cleaner home without the stress.",
      subheader2: "Request your cleaning appointment online.",
    },

    pricing: {
      title: "Cleaning Prices",
      subtitle: "Affordable and transparent pricing.",
      plans: [
        {
          name: "Standard Cleaning",
          price: "$80",
          description: "Regular home cleaning",
          features: ["Kitchen & bathroom", "Living areas"],
        },
        {
          name: "Deep Cleaning",
          price: "$150",
          description: "Thorough deep clean",
          features: ["All rooms", "Detailed attention"],
        },
      ],
    },
	
		deposit: {
  enabled: false,
  amountLabel: "$10 deposit required to confirm",
  stripePaymentLink: "https://buy.stripe.com/abc123",
	},
	
		booking: {
  is_external: false,
  bookingLink: "https://vagaro.com/yourhairbyvida",
	},
	
	email: {
  bookingNotifications: "sarah@simplebookme.com",
},

    about: {
      title: "About Sarah Cleaning",
      description:
        "Sarah Cleaning provides dependable and professional home cleaning services with attention to detail.",
      highlights: [
        "Eco-friendly products",
        "Experienced staff",
        "Flexible scheduling",
      ],
    },
  },
};
