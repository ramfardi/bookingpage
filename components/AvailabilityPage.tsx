type Props = {
  data: any;
};

export default function AvailabilityPage({ data }: Props) {
  const days: string[] = data?.selectedDays || [];

  // Generate hours (8 AM → 8 PM)
  const hours = Array.from({ length: 13 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  // Helper to check if hour is inside range
  const isAvailable = (day: string, hour: string) => {
    const start = data?.dayTimes?.[day]?.start;
    const end = data?.dayTimes?.[day]?.end;

    if (!start || !end) return false;

    return hour >= start && hour < end;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 flex justify-center">
      <div className="max-w-5xl w-full space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {data.businessName || "Availability"}
          </h1>

          <p className="text-gray-500 text-sm">
            Weekly availability schedule
          </p>

          <div className="inline-block mt-2 px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full">
            Updated in real-time
          </div>
        </div>

        {/* GRID CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border overflow-x-auto">

          <table className="w-full border-collapse text-sm">

            {/* HEADER ROW */}
            <thead>
              <tr>
                <th className="p-2 text-left text-gray-500">Time</th>
                {days.map((day) => (
                  <th key={day} className="p-2 text-center text-gray-700 font-medium">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {hours.map((hour) => (
                <tr key={hour}>
                  {/* TIME COLUMN */}
                  <td className="p-2 text-gray-500">{hour}</td>

                  {/* DAY CELLS */}
                  {days.map((day) => {
                    const available = isAvailable(day, hour);

                    return (
                      <td key={day + hour} className="p-1">
                        <div
                          className={`h-8 rounded-md ${
                            available
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

          </table>

          {/* FOOTER */}
          <div className="mt-6 pt-6 border-t text-center space-y-2">
            <p className="text-sm text-gray-500">
              Contact to book an appointment
            </p>

            <p className="text-xs text-gray-400">
              Powered by SimpleBookMe
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}