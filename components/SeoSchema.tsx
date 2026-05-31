import { CustomerConfig }
from "@/app/lib/customerConfig";

export default function SeoSchema({
  customer,
}: {
  customer: CustomerConfig;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",

    name: customer.businessName,

    description:
      customer.about.description,

    telephone:
      customer.contact?.phone,

    email:
      customer.contact?.email,

    address: {
      "@type": "PostalAddress",

      streetAddress:
        customer.contact?.address,

      addressLocality:
        customer.contact?.city,

      addressRegion:
        customer.contact?.province,

      addressCountry:
        customer.contact?.country,
    },

    url:
      `https://${customer.subdomain}.simplebookme.com`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}