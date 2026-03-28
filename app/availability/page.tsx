"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const DAYS = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
];

export default function AvailabilityGeneratorPage() {
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Monday","Tuesday","Wednesday","Thursday","Friday",
  ]);

  const [dayTimes, setDayTimes] = useState<
    Record<string, { start: string; end: string }>
  >({
    Monday: { start: "09:00", end: "17:00" },
    Tuesday: { start: "09:00", end: "17:00" },
    Wednesday: { start: "09:00", end: "17:00" },
    Thursday: { start: "09:00", end: "17:00" },
    Friday: { start: "09:00", end: "17:00" },
    Saturday: { start: "09:00", end: "17:00" },
    Sunday: { start: "09:00", end: "17:00" },
  });

  const [businessName, setBusinessName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [editLink, setEditLink] = useState("");

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const updateDayTime = (
    day: string,
    field: "start" | "end",
    value: string
  ) => {
    setDayTimes((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  // 🚀 MAIN FEATURE
const generateAvailabilityLink = async () => {
  const siteId = crypto.randomUUID().slice(0, 8);
  const editToken = crypto.randomUUID().slice(0, 16);

  const payload = {
    siteId,
    editToken,
    businessName,
    selectedDays,
    dayTimes,
  };

  const res = await fetch("/api/availability/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  const publicUrl = `https://${data.subdomain}.simplebookme.com`;
  const editUrl = `/availability/${siteId}/edit?token=${editToken}`;

  setGeneratedLink(publicUrl);
  setEditLink(editUrl);
};

  return (
    <main className="min-h-screen bg-white px-6 py-24 flex justify-center">
      <div className="w-full max-w-4xl">

        <h1 className="text-4xl font-bold text-gray-900">
          Live Availability Link Generator
        </h1>

        <p className="mt-4 text-gray-600">
          Create a shareable availability page your clients can view anytime.
        </p>

        {/* INPUT */}
        <div className="mt-10 bg-gray-50 p-8 rounded-2xl border space-y-6">

          {/* Days */}
          <div>
            <label className="block font-medium mb-2">
              Select Available Days
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-lg border ${
                    selectedDays.includes(day)
                      ? "bg-indigo-600 text-white"
                      : "bg-white"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div>
            <label className="block font-medium mb-2">
              Set Hours Per Day
            </label>

            <div className="space-y-4">
              {selectedDays.map((day) => (
                <div
                  key={day}
                  className="grid grid-cols-3 gap-4 items-center"
                >
                  <span className="font-medium">{day}</span>

                  <input
                    type="time"
                    value={dayTimes[day].start}
                    onChange={(e) =>
                      updateDayTime(day, "start", e.target.value)
                    }
                    className="border rounded-lg px-3 py-2"
                  />

                  <input
                    type="time"
                    value={dayTimes[day].end}
                    onChange={(e) =>
                      updateDayTime(day, "end", e.target.value)
                    }
                    className="border rounded-lg px-3 py-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Business */}
          <input
            type="text"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          />

          <button
            onClick={generateAvailabilityLink}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
          >
            Generate Live Availability Link
          </button>
        </div>

        {/* RESULT */}
        {generatedLink && (
          <div className="mt-10 p-6 border rounded-xl bg-white space-y-4">

            <div>
              <p className="text-sm text-gray-500">Public Link</p>
              <a
                href={generatedLink}
                target="_blank"
                className="text-indigo-600 break-all"
              >
                {generatedLink}
              </a>
            </div>

            <div>
              <p className="text-sm text-gray-500">Edit Link (Private)</p>
              <p className="text-red-500 text-xs mb-1">
                Do NOT share this link publicly
              </p>
              <a
                href={editLink}
                target="_blank"
                className="text-indigo-600 break-all"
              >
                {editLink}
              </a>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-500">
                💡 Use this link in:
              </p>
              <ul className="text-sm text-gray-600 list-disc pl-5 mt-2">
                <li>Instagram bio</li>
                <li>QR codes</li>
                <li>WhatsApp</li>
                <li>Google Business</li>
              </ul>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}