import { getAvailability } from "../../lib/availabilityStore";

// 🔥 REQUIRED for dynamic data
export const dynamic = "force-dynamic";

export default async function AvailabilityPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;

  const data = getAvailability(siteId);

  if (!data) {
    return <div className="p-10 text-center">Not found</div>;
  }

  // ✅ Get today's day name (for highlight)
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 flex justify-center">
      <div className="max-w-xl w-full space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {data.businessName || "Availability"}
          </h1>

          <p className="text-gray-500 text-sm">
            Weekly availability schedule
          </p>

          {/* subtle badge */}
          <div className="inline-block mt-2 px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full">
            Updated in real-time
          </div>
        </div>

        {/* CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">

          {/* DAYS */}
          <div className="space-y-3">
            {data.selectedDays.map((day: string) => {
              const isToday = day === today;

              return (
                <div
                  key={day}
                  className={`flex justify-between items-center p-4 rounded-lg border transition
                    ${
                      isToday
                        ? "bg-indigo-50 border-indigo-200"
                        : "bg-gray-50 hover:bg-gray-100"
                    }
                  `}
                >
                  <span
                    className={`font-medium ${
                      isToday ? "text-indigo-700" : "text-gray-800"
                    }`}
                  >
                    {day}
                    {isToday && (
                      <span className="ml-2 text-xs text-indigo-500">
                        (Today)
                      </span>
                    )}
                  </span>

                  <span className="text-indigo-600 font-medium">
                    {data.dayTimes[day].start} - {data.dayTimes[day].end}
                  </span>
                </div>
              );
            })}
          </div>

          {/* CTA / CONTACT */}
          <div className="mt-6 pt-6 border-t text-center space-y-3">
            <p className="text-sm text-gray-500">
              Contact to book an appointment
            </p>

            {/* subtle trust line */}
            <p className="text-xs text-gray-400">
              Powered by SimpleBookMe
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}