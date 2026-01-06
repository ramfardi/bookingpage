// app/lib/customerConfig.ts

export type PricingRow = {
  id: string;          // stable key for React & future edits
  name: string;        // service name (e.g. "Haircut")
  price: string;       // string on purpose: "$60", "From $80", etc.
  includes?: string;   // optional description
};

export type PricingSection = {
  title: string;       // e.g. "Our Services & Pricing"
  subtitle?: string;   // optional helper text
  rows: PricingRow[];  // table rows
};


export type CustomerConfig = {
  siteId: string;

  templateId: "hairsalon" | "cleaning";

  businessName: string;
  
  subdomain?: string; // 👈 ADD THIS
  
    heroImage: string;

  landing: {
    header1: string;
    header2: string;
    subheader1: string;
    subheader2: string;
  };

  services: string[];

	pricing: PricingSection;

  deposit: {
    enabled: boolean;
    amountLabel?: string;
    stripePaymentLink?: string;
  };

booking: {
  mode: "internal" | "external";
  externalBookingUrl?: string;
};

  email?: {
    bookingNotifications?: string;
    replyTo?: string;
  };

	about: {
	  title: string;
	  description: string;
	  highlights: string[];
	  gallery?: string[];
	};


  trial: {
    expiresAt: string;
    isPaid: boolean;
  };
};
