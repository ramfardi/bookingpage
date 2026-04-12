type Props = {
  data: any;
};

export default function AvailabilityPage({ data }: Props) {
  const allDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const selectedDays: string[] = data?.selectedDays || [];

const hours = Array.from({ length: 17 }, (_, i) => {
  const hour = 8 + i;
  const normalized = hour === 24 ? 0 : hour; // convert 24 → 00 for midnight
  return `${normalized.toString().padStart(2, "0")}:00`;
});

const toNumber = (time: string) => {
  if (!time) return -1;

  // supports "08:00"
  if (time.includes(":")) {
    return parseInt(time.split(":")[0], 10);
  }

  // supports "8 AM / PM"
  const [h, period] = time.split(" ");
  let hour = parseInt(h, 10);

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return hour;
};

const isAvailable = (day: string, hour: string) => {
  if (!selectedDays.includes(day)) return false;

  const start = data?.dayTimes?.[day]?.start;
  const end = data?.dayTimes?.[day]?.end;

  if (!start || !end) return false;

  const h = toNumber(hour);
  const s = toNumber(start);
  const e = toNumber(end);

  return h >= s && h <= e;
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
                {allDays.map((day) => (
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
                  {allDays.map((day) => {
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
{/* LEGEND */}
<div className="flex items-center justify-center gap-6 mt-6 text-sm">
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 bg-green-500 rounded" />
    <span className="text-gray-600">Available</span>
  </div>

  <div className="flex items-center gap-2">
    <div className="w-4 h-4 bg-gray-200 rounded" />
    <span className="text-gray-600">Busy</span>
  </div>
</div>
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