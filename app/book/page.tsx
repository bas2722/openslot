"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function BookContent() {
  const searchParams = useSearchParams();

  const lesson = searchParams.get("lesson") || "Golf Lesson";

  // example dates (keep your logic if you already had one)
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);

    return {
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      value: date.toISOString().split("T")[0],
    };
  });

  return (
    <main className="min-h-screen bg-gray-200 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Select a Date
        </h1>

        <p className="text-gray-700 mb-6">
          Choose a date for your {lesson}.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {dates.map((date) => (
            <Link
              key={date.value}
              href={`/book/time?date=${date.value}&lesson=${encodeURIComponent(
                lesson
              )}`}
              className="block"
            >
              <div className="border-2 border-gray-500 rounded-xl p-4 text-center hover:bg-gray-100 transition cursor-pointer">
                {date.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookContent />
    </Suspense>
  );
}