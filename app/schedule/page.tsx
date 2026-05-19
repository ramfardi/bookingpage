"use client";

import { useEffect, useMemo, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";


const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type ScheduleDay = (typeof dayLabels)[number];

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function SchedulePage() {
  const [customer, setCustomer] = useState<CustomerConfig | LandingConfig | null>(null);
  const [mode, setMode] = useState<"sales" | "client">("sales");

  useEffect(() => {
    async function load() {
      const result = await getCustomerConfigFromHost(window.location.hostname);
      setCustomer(result.config);
      setMode(result.mode);
    }

    load();
  }, []);

  if (!customer || mode !== "client") return null;

  const customerConfig = customer as CustomerConfig;

const schedule = {
  enabled: customerConfig.schedule?.enabled ?? false,
  startHour: customerConfig.schedule?.startHour || "08:00",
  endHour: customerConfig.schedule?.endHour || "20:00",
  intervalMinutes: customerConfig.schedule?.intervalMinutes || 30,
  days: {
    Mon: customerConfig.schedule?.days?.Mon || [],
    Tue: customerConfig.schedule?.days?.Tue || [],
    Wed: customerConfig.schedule?.days?.Wed || [],
    Thu: customerConfig.schedule?.days?.Thu || [],
    Fri: customerConfig.schedule?.days?.Fri || [],
    Sat: customerConfig.schedule?.days?.Sat || [],
    Sun: customerConfig.schedule?.days?.Sun || [],
  },
};

  const slots = useMemo(() => {
    const start = timeToMinutes(schedule.startHour || "08:00");
    const end = timeToMinutes(schedule.endHour || "20:00");
    const interval = schedule.intervalMinutes || 30;

    const result: string[] = [];
    for (let t = start; t < end; t += interval) {
      result.push(minutesToTime(t));
    }

    return result;
  }, [schedule.startHour, schedule.endHour, schedule.intervalMinutes]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Weekly Schedule
          </h1>
          <p className="mt-3 text-gray-600">
            Available times for {customerConfig.businessName}
          </p>
        </div>

        {!schedule.enabled ? (
          <div className="text-center bg-white rounded-2xl shadow p-10">
            <p className="text-gray-500">Schedule is not available yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-3xl shadow border p-4">
            <div
              className="grid gap-2 text-sm"
              style={{
                gridTemplateColumns: `90px repeat(${slots.length}, minmax(70px, 1fr))`,
              }}
            >
              <div className="font-semibold text-gray-600">Day</div>

              {slots.map((slot) => (
                <div key={slot} className="text-center text-xs text-gray-500">
                  {slot}
                </div>
              ))}

              {dayLabels.map((day) => (
                <>
                  <div key={`${day}-label`} className="font-semibold text-gray-800 py-2">
                    {day}
                  </div>

                  {slots.map((slot) => {
					const available = schedule.days[day].includes(slot);

                    return (
                      <div
                        key={`${day}-${slot}`}
                        className={`h-9 rounded-lg ${
                          available
                            ? "bg-emerald-500"
                            : "bg-gray-200"
                        }`}
                        title={`${day} ${slot} ${
                          available ? "Available" : "Busy"
                        }`}
                      />
                    );
                  })}
                </>
              ))}
            </div>

            <div className="mt-6 flex gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-emerald-500 rounded" />
                Available
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-gray-200 rounded" />
                Busy
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}