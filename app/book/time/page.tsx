"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type AvailabilityRule = {
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
};

function formatTime(minutesFromMidnight: number) {
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getDayOfWeek(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

function generateTimeSlots(rule: AvailabilityRule) {
  const slots: string[] = [];

  const start = timeToMinutes(rule.start_time);
  const end = timeToMinutes(rule.end_time);
  const duration = rule.slot_duration_minutes;

  for (let current = start; current + duration <= end; current += duration) {
    slots.push(formatTime(current));
  }

  return slots;
}

export default function TimePage() {
  const searchParams = useSearchParams();

  const selectedDate = searchParams.get("date");
  const selectedLesson = searchParams.get("lesson") || "Golf Lesson";
  const selectedResourceId = searchParams.get("resource_id");
  const selectedResourceName =
    searchParams.get("resource_name") || "Selected Resource";

  const [times, setTimes] = useState<string[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedDate || !selectedResourceId) return;

      const dayOfWeek = getDayOfWeek(selectedDate);

      const { data, error } = await supabase
        .from("resource_availability")
        .select("start_time, end_time, slot_duration_minutes")
        .eq("resource_id", selectedResourceId)
        .eq("day_of_week", dayOfWeek);

      if (error) {
        alert("Error loading availability: " + error.message);
        return;
      }

      const generatedTimes =
        data?.flatMap((rule) => generateTimeSlots(rule)) || [];

      setTimes(generatedTimes);
    }

    fetchAvailability();
  }, [selectedDate, selectedResourceId]);

  useEffect(() => {
    async function fetchBookedTimes() {
      if (!selectedDate || !selectedResourceId) return;

      const { data, error } = await supabase
        .from("bookings")
        .select("time")
        .eq("date", selectedDate)
        .eq("resource_id", selectedResourceId);

      if (error) {
        alert("Error loading booked times: " + error.message);
        return;
      }

      setBookedTimes(data?.map((booking) => booking.time) || []);
    }

    fetchBookedTimes();
  }, [selectedDate, selectedResourceId]);

  return (
    <main className="min-h-screen bg-gray-200 text-gray-900 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-500 mb-2">
          Select a Time
        </h1>

        <div className="mb-6 space-y-1">
          <p className="text-gray-500">
            Resource: <span className="font-semibold">{selectedResourceName}</span>
          </p>
          <p className="text-gray-500">
            Lesson: <span className="font-semibold">{selectedLesson}</span>
          </p>
          <p className="text-gray-500">
            Date: <span className="font-semibold">{selectedDate}</span>
          </p>
        </div>

        {times.length === 0 && (
          <p className="text-gray-900">
            No availability has been set for this resource on this date.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {times.map((time) => {
            const isBooked = bookedTimes.includes(time);
            const isHovered = hovered === time;

            return (
              <div key={time} className="block">
                <div
                  onMouseEnter={() => setHovered(time)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    if (isBooked) return;

                    window.location.href = `/book/details?date=${selectedDate}&time=${encodeURIComponent(
                      time
                    )}&lesson=${encodeURIComponent(
                      selectedLesson
                    )}&resource_id=${selectedResourceId}&resource_name=${encodeURIComponent(
                      selectedResourceName
                    )}`;
                  }}
                  className={`border-2 p-4 rounded-xl text-center transition-all duration-200 ${
                    isBooked
                      ? "bg-red-100 border-gray-700 text-gray-600 cursor-not-allowed"
                      : isHovered
                      ? "bg-blue-100 border-blue-500 shadow-md cursor-pointer"
                      : "bg-white border-gray-900 cursor-pointer"
                  }`}
                >
                  <span className="font-semibold">{time}</span>
                  {isBooked && <p className="text-xs mt-1">Unavailable</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}