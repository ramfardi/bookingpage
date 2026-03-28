import { getAvailability } from "../../lib/availabilityStore";

// 🔥 REQUIRED for dynamic data
export const dynamic = "force-dynamic";

export default async function AvailabilityPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  // ✅ unwrap params (Next.js 15 requirement)
  const { siteId } = await params;

  const data = getAvailability(siteId);

  if (!data) {
    return <div className="p-10">Not found</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="max-w-xl w-full bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-center">
          {data.businessName || "Availability"}
        </h1>

        <div className="mt-6 space-y-4">
          {data.selectedDays.map((day: string) => (
            <div
              key={day}
              className="flex justify-between border p-4 rounded-lg"
            >
              <span className="font-medium">{day}</span>
              <span className="text-indigo-600">
                {data.dayTimes[day].start} - {data.dayTimes[day].end}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}