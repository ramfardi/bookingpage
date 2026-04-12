type Props = {
  data: any;
};

const HOURS = [
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AvailabilityPage({ data }: Props) {
  // Example expected structure:
  // data.availability = {
  //   Mon: ["8 AM", "9 AM"],
  //   Tue: ["10 AM"],
  // }

  const availability = data.availability || {};

  const isAvailable = (day: string, hour: string) => {
    return availability?.[day]?.includes(hour);
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      await navigator.share({
        title: "My Availability",
        text: "Check my availability",
        url,
      });
    } catch {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 flex justify-center">
      <div className="w-full max-w-5xl space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {data.businessName || "Availability"}
          </h1>

          <p className="text-gray-500">
            Weekly availability schedule
          </p>

          <button
            onClick={handleShare}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
          >
            🔗 Share Calendar
          </button>
        </div>

        {/* CALENDAR CARD */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 overflow-x-auto">

          {/* GRID */}
          <div className="min-w-[700px]">

            {/* DAYS HEADER */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div></div>
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-600"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* HOURS + CELLS */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-8 gap-2 mb-2 items-center"
              >
                {/* HOUR LABEL */}
                <div className="text-xs text-gray-500 text-right pr-2">
                  {hour}
                </div>

                {/* CELLS */}
                {DAYS.map((day) => {
                  const available = isAvailable(day, hour);

                  return (
                    <div
                      key={day + hour}
                      className={`h-10 rounded-md flex items-center justify-center text-xs font-medium
                        ${
                          available
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                    >
                      {available ? "Available" : ""}
                    </div>
                  );
                })}
              </div>
            ))}

          </div>

          {/* FOOTER */}
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-sm text-gray-500">
              Contact to book an appointment
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Powered by SimpleBookMe
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}