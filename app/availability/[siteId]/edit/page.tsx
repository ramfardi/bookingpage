"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";

export default function EditPage() {
  const params = useParams(); // ✅ correct
  const searchParams = useSearchParams();

  const siteId = params.siteId as string;
  const token = searchParams.get("token");

  const [data, setData] = useState<any>(null);

useEffect(() => {
  if (!siteId) return;

  fetch(`/api/availability/get?siteId=${siteId}`)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error("Not found");
      }
      return res.json();
    })
    .then((res) => {
      if (res.editToken !== token) {
        alert("Unauthorized");
        return;
      }

      setData(res);
    })
    .catch(() => {
      alert("Availability not found");
    });
}, [siteId, token]);

  if (!data) return <div className="p-10">Loading...</div>;

const DAYS = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
];

return (
  <main className="p-6 max-w-xl mx-auto">
    <h1 className="text-2xl font-bold">Edit Availability</h1>

    {/* 🔥 Toggle Days */}
    <div className="mt-6 grid grid-cols-2 gap-2">
      {DAYS.map((day) => {
        const isActive = data.selectedDays.includes(day);

        return (
          <button
            key={day}
            onClick={() => {
              setData((prev: any) => {
                const exists = prev.selectedDays.includes(day);

                return {
                  ...prev,
                  selectedDays: exists
                    ? prev.selectedDays.filter((d: string) => d !== day)
                    : [...prev.selectedDays, day],
                };
              });
            }}
            className={`px-3 py-2 rounded border ${
              isActive ? "bg-indigo-600 text-white" : "bg-white"
            }`}
          >
            {day}
          </button>
        );
      })}
    </div>

    {/* 🔥 Time Editing */}
    <div className="mt-6">
      {data.selectedDays.map((day: string) => (
        <div key={day} className="flex gap-3 mt-2 items-center">
          <span className="w-24">{day}</span>

          <input
            type="time"
            value={data.dayTimes[day]?.start || "09:00"}
            onChange={(e) =>
              setData((prev: any) => ({
                ...prev,
                dayTimes: {
                  ...prev.dayTimes,
                  [day]: {
                    ...(prev.dayTimes[day] || {}),
                    start: e.target.value,
                  },
                },
              }))
            }
            className="border px-2 py-1"
          />

          <input
            type="time"
            value={data.dayTimes[day]?.end || "17:00"}
            onChange={(e) =>
              setData((prev: any) => ({
                ...prev,
                dayTimes: {
                  ...prev.dayTimes,
                  [day]: {
                    ...(prev.dayTimes[day] || {}),
                    end: e.target.value,
                  },
                },
              }))
            }
            className="border px-2 py-1"
          />
        </div>
      ))}
    </div>

    {/* SAVE */}
    <button
      onClick={async () => {
        await fetch("/api/availability/update", {
          method: "POST",
          body: JSON.stringify(data),
        });

        alert("Saved!");
      }}
      className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded"
    >
      Save Changes
    </button>
  </main>
);
}