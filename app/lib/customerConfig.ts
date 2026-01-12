// app/lib/customerConfig.ts

export type PricingRow = {
  id: string;          // stable key for React & future edits
  name: string;        // service name (e.g. "Haircut")
  price: string;       // string on purpose: "$60", "From $80", etc.
  includes?: string;   // optional description
};

export type PricingItem = {
  label: string;
  description?: string;
  price?: string;
};

export type PricingSection = {
  title: string;               // existing
  subtitle?: string;           // existing

  // ✅ OLD (keep working)
  rows?: PricingRow[];

  // ✅ NEW (editor-based)
  items?: PricingItem[];
};



export type CustomerConfig = {

  templateId: "hairsalon" | "cleaning" |"beauty" | "fitness" | "home" |"accounting" | "pet";

  businessName: string;
  
  siteId: string;
  subdomain?: string;

	isPaid?: boolean;
	paidAt?: string;

  
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
	  gallery?: string[];
	};
	

};
