// app/templates/accounting/defaultData.ts

export const defaultData = {
  businessName: "Accounting & Tax Services",

  heroImage: "/images/accounting.png",

  landing: {
    header1: "Trusted",
    header2: "Accounting",
    subheader1:
      "Professional accounting, bookkeeping, and tax services for individuals and businesses",
    subheader2:
      "Book your consultation online with experienced accountants",
  },

  about: {
    title: "About Our Accounting & Tax Services",
    description:
      "We provide accurate, reliable, and compliant accounting and tax services to help you manage finances, reduce risk, and stay compliant.",
    highlights: [
      "Certified accountants",
      "Tax-compliant & up to date",
      "Transparent pricing",
    ],
    gallery: [], // ✅ IMPORTANT: always include this
  },

  services: [
    // Accounting & Bookkeeping
    "Accounting Services",
    "Bookkeeping",
    "Monthly Financial Reporting",
    "Accounts Payable & Receivable",
    "Payroll Services",

    // Tax Services
    "Personal Tax Preparation",
    "Business Tax Preparation",
    "Corporate Tax Filing",
    "Sales Tax / VAT Filing",
    "Tax Planning & Optimization",

    // Business Services
    "Financial Statement Preparation",
    "Cash Flow Analysis",
    "Budgeting & Forecasting",
    "Business Advisory",

    // Compliance & Audit
    "Tax Compliance Review",
    "Audit Preparation Support",
    "CRA / IRS Correspondence Support",

    // Consulting
    "Accounting Consultation",
    "Tax Consultation",
  ],

  pricing: {
    title: "Pricing",
    subtitle: "Clear and transparent pricing for all services",
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
