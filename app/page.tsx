"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [hovered, setHovered] = useState<string | null>(null);

  const lessons = [
    { name: "30 Minute Lesson", price: "$60" },
    { name: "60 Minute Lesson", price: "$100" },
  ];

  return (
    <main className="min-h-screen bg-gray-200 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">OpenSlot</h1>

        <p className="text-gray-600 mb-6">Book your golf lesson</p>

        <div className="space-y-4">
          {lessons.map((lesson) => {
            const isHovered = hovered === lesson.name;

            return (
              <Link
                key={lesson.name}
href={`/book/resource?lesson=${encodeURIComponent(lesson.name)}`}                className="block"
              >
                <div
                  onMouseEnter={() => setHovered(lesson.name)}
                  onMouseLeave={() => setHovered(null)}
                  className={`border-2 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    isHovered
                      ? "bg-blue-100 border-blue-500 shadow-md"
                      : "bg-white border-gray-900"
                  }`}
                >
                  <h2 className="font-semibold text-gray-900">
                    {lesson.name}
                  </h2>
                  <p className="text-gray-700">{lesson.price}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}