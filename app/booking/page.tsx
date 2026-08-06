"use client";

import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

type DirectBusinessContact = {
  businessName: string | null;
  phone: string | null;
  email: string | null;
};

export default function BookingPage() {
  const [customer, setCustomer] = useState<
    CustomerConfig | LandingConfig | null
  >(null);

  const [mode, setMode] = useState<"sales" | "client">("sales");

  const [customerKey, setCustomerKey] =
    useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  /*
   * False means the business received the request, but the
   * client acknowledgement email could not be sent.
   */
  const [clientEmailSent, setClientEmailSent] =
    useState(true);

  /*
   * Set when the site's email quota has been reached or when
   * quota checking is temporarily unavailable.
   */
  const [
    directBusinessContact,
    setDirectBusinessContact,
  ] = useState<DirectBusinessContact | null>(null);

  const [
    bookingUnavailableMessage,
    setBookingUnavailableMessage,
  ] = useState("");

  // Controlled service selection
  const [selectedService, setSelectedService] =
    useState<string>("");

  useEffect(() => {
    async function load() {
      const hostname = window.location.hostname;

      const result =
        await getCustomerConfigFromHost(hostname);

      setCustomer(result.config);
      setMode(result.mode);
      setCustomerKey(result.key);
    }

    load();
  }, []);

  useEffect(() => {
    if (!customer || mode !== "client") {
      return;
    }

    const customerConfig =
      customer as CustomerConfig;

    const services =
      customerConfig.services || [];

    if (
      selectedService &&
      !services.includes(selectedService)
    ) {
      setSelectedService("");
    }
  }, [customer, mode, selectedService]);

  // Loading state
  if (!customer) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading…
        </p>
      </main>
    );
  }

  // Booking page is client-only
  if (mode !== "client") {
    return null;
  }

  const customerConfig =
    customer as CustomerConfig;

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!customerKey || !selectedService) {
      return;
    }

    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      customerKey,

      service: selectedService,

      preferred_date:
        formData.get("preferred_date"),

      preferred_time:
        formData.get("preferred_time"),

      customer_email:
        formData.get("email"),

      // Optional customer information
      customer_name:
        formData.get("customer_name"),

      customer_message:
        formData.get("customer_message"),

      // Honeypot
      company:
        formData.get("company"),
    };

    try {
      const res = await fetch(
        "/api/send-booking-email",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      /*
       * Read the response before checking res.ok because the
       * quota response contains the public business contact.
       */
      const result = await res
        .json()
        .catch(() => null);

      /* =====================
         Email quota exhausted
      ===================== */

      if (
        result?.code ===
        "EMAIL_LIMIT_REACHED"
      ) {
        setBookingUnavailableMessage(
          result.error ||
            "Online booking requests are temporarily unavailable. Please contact the business directly."
        );

        setDirectBusinessContact({
          businessName:
            result.contact?.businessName ??
            customerConfig.businessName ??
            null,

          phone:
            result.contact?.phone ??
            customerConfig.contact?.phone ??
            null,

          email:
            result.contact?.email ??
            customerConfig.contact?.email ??
            null,
        });

        return;
      }

      /* =====================
         Quota service unavailable
      ===================== */

      if (
        result?.code ===
        "EMAIL_QUOTA_UNAVAILABLE"
      ) {
        setBookingUnavailableMessage(
          result.error ||
            "Online booking is temporarily unavailable. Please contact the business directly."
        );

        setDirectBusinessContact({
          businessName:
            result.contact?.businessName ??
            customerConfig.businessName ??
            null,

          phone:
            result.contact?.phone ??
            customerConfig.contact?.phone ??
            null,

          email:
            result.contact?.email ??
            customerConfig.contact?.email ??
            null,
        });

        return;
      }

      /* =====================
         Other API error
      ===================== */

      if (!res.ok || !result?.success) {
        throw new Error(
          result?.error ||
            "Booking request could not be sent."
        );
      }

      /*
       * The provider may receive the booking even when the
       * acknowledgement email to the client fails.
       */
      setClientEmailSent(
        result.clientEmailSent !== false
      );

      /* =====================
         Deposit redirect
      ===================== */

      const deposit =
        customerConfig.deposit;

      if (
        deposit?.enabled &&
        deposit.stripePaymentLink
      ) {
        window.location.href =
          deposit.stripePaymentLink;

        return;
      }

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Booking submission error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================
     Booking submitted
  ===================== */

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold">
            Request sent
          </h1>

          {clientEmailSent ? (
            <>
              <p className="mt-3 text-gray-600">
                Check your email for your
                booking-request receipt. You will
                receive a confirmation email and
                calendar invitation after the
                business approves the appointment.
              </p>

              <div className="mt-5 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
                <strong>
                  Please check your spam or junk
                  folder as well.
                </strong>{" "}
                Look for an email from
                SimpleBookMe or
                booking@simplebookme.com.
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
              <strong>
                The business received your booking
                request.
              </strong>

              <p className="mt-2">
                We could not send the receipt email
                to you. The business can still
                review and respond to your request.
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  /* =====================
     Quota reached fallback
  ===================== */

  if (directBusinessContact) {
    const phoneHref =
      directBusinessContact.phone
        ?.replace(/[^\d+]/g, "") ?? "";

    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-6 py-10">
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 max-w-xl w-full">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Contact the business directly
            </h1>

            <p className="mt-3 leading-7 text-gray-700">
              {bookingUnavailableMessage}
            </p>

            {directBusinessContact.businessName && (
              <p className="mt-5 text-lg font-semibold text-gray-900">
                {
                  directBusinessContact.businessName
                }
              </p>
            )}

            <div className="mt-5 flex flex-col gap-3">
              {directBusinessContact.phone && (
                <a
                  href={`tel:${phoneHref}`}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                >
                  Call{" "}
                  {
                    directBusinessContact.phone
                  }
                </a>
              )}

              {directBusinessContact.email && (
                <a
                  href={`mailto:${directBusinessContact.email}`}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-900 transition hover:bg-gray-50"
                >
                  Email{" "}
                  {
                    directBusinessContact.email
                  }
                </a>
              )}
            </div>

            {!directBusinessContact.phone &&
              !directBusinessContact.email && (
                <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  This business has not provided
                  public phone or email contact
                  information.
                </p>
              )}
          </div>
        </div>
      </main>
    );
  }

  /* =====================
     Normal booking form
  ===================== */

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-6 py-10">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-xl w-full">
        <h1 className="text-3xl font-bold text-center">
          Book an appointment
        </h1>

        <p className="mt-3 text-center text-gray-600">
          Request an appointment with{" "}
          {customerConfig.businessName}
        </p>

        {customerConfig.deposit?.enabled && (
          <p className="mt-4 text-center text-sm text-indigo-600 font-medium">
            {
              customerConfig.deposit
                .amountLabel
            }
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
        >
          {/* Honeypot */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
          />

          {/* Service */}
          <select
            name="service"
            required
            value={selectedService}
            onChange={(e) =>
              setSelectedService(
                e.target.value
              )
            }
            className="w-full border rounded-xl p-3"
          >
            <option value="">
              Select service
            </option>

            {(
              customerConfig.services || []
            ).map((service) => (
              <option
                key={service}
                value={service}
              >
                {service}
              </option>
            ))}
          </select>

          {/* Date */}
          <input
            type="date"
            name="preferred_date"
            required
            className="w-full border rounded-xl p-3"
          />

          {/* Time */}
          <input
            type="time"
            name="preferred_time"
            required
            className="w-full border rounded-xl p-3"
          />

          {/* Customer name */}
          <input
            type="text"
            name="customer_name"
            maxLength={100}
            autoComplete="name"
            placeholder="Your name (optional)"
            className="w-full border rounded-xl p-3"
          />

          {/* Customer email */}
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="Your email"
            className="w-full border rounded-xl p-3"
          />

          {/* Questions or special requests */}
          <textarea
            name="customer_message"
            maxLength={1000}
            rows={4}
            placeholder="Questions or special requests (optional)"
            className="w-full border rounded-xl p-3 resize-y"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Sending..."
              : "Request appointment"}
          </button>
        </form>
      </div>
    </main>
  );
}