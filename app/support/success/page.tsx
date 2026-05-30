export default function SupportSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4">
          Message Sent
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for contacting SimpleBookMe support.
          We have received your message and will get back to you shortly.
        </p>

        <a
          href="/"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Return Home
        </a>
      </div>
    </main>
  );
}