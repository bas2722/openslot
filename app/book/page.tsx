"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function BookPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
const searchParams = useSearchParams();
const selectedLesson = searchParams.get("lesson") || "Golf Lesson";
const selectedResourceId = searchParams.get("resource_id");
const selectedResourceName = searchParams.get("resource_name") || "Selected Resource";  
return (
    <main className="min-h-screen bg-gray-200 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Select a Date
        </h1>

        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);

            const formatted = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            const isHovered = hoveredIndex === i;

            return (
              <Link
                key={i}
                href={`/book/time?date=${date
  .toISOString()
  .split("T")[0]}&lesson=${encodeURIComponent(
  selectedLesson
)}&resource_id=${selectedResourceId}&resource_name=${encodeURIComponent(
  selectedResourceName
)}`}
                className="block"
              >
                <div
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`border-2 p-4 rounded-xl text-center cursor-pointer transition-all duration-200 ${
                    isHovered
                      ? "bg-blue-100 border-blue-500 shadow-md"
                      : "bg-white border-gray-500"
                  }`}
                >
                  <span className="text-gray-900 font-semibold">
                    {formatted}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}