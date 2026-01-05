// app/lib/customerConfig.ts

export type PricingPlan = {
  name: string;
  price: string;
  description?: string;
  features: string[];
};

export type CustomerConfig = {
  siteId: string;

  templateId: "hairsalon" | "cleaning";

  businessName: string;

  services: string[];

  pricing: {
    title: string;
    subtitle?: string;
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

  trial: {
    expiresAt: string;
    isPaid: boolean;
  };
};
