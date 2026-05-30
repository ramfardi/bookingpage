export default function SupportPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-4xl font-bold text-center mb-2">
          Contact Support
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Need help with your booking website? Send us a message and we'll get
          back to you as soon as possible.
        </p>

        <form
          action="https://formspree.io/f/mnjrrwjv"
          method="POST"
          className="space-y-6"
        >
          {/* Anti-spam honeypot */}
          <input
            type="text"
            name="_gotcha"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Hidden metadata */}
          <input
            type="hidden"
            name="_subject"
            value="New SimpleBookMe Support Request"
          />

          <input
            type="hidden"
            name="source"
            value="simplebookme-support"
          />

          <input
            type="hidden"
            name="_next"
            value="https://simplebookme.com/support/success"
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Website Subdomain (Optional)
            </label>
            <input
              type="text"
              name="subdomain"
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="yourbusiness"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: yourbusiness.simplebookme.com
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              required
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Issue with bookings"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Message
            </label>
            <textarea
              name="message"
              required
              rows={6}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe your issue or question..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Send Message
          </button>
        </form>

        <div className="mt-10 border-t pt-6 text-center">
          <p className="font-medium">SimpleBookMe Support</p>
          <p className="text-gray-500">support@simplebookme.com</p>
          <p className="text-sm text-gray-400 mt-2">
            Typical response time: within 24 hours
          </p>
        </div>
      </div>
    </main>
  );
}