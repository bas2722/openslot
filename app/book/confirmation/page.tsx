"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();

  const name = searchParams.get("name");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const lesson = searchParams.get("lesson") || "Golf Lesson";
  const resource = searchParams.get("resource_name") || "Selected Resource";
  const paymentStatus = searchParams.get("payment_status") || "Pending";

  return (
    <main className="min-h-screen bg-gray-200 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Confirmed
        </h1>

        <p className="text-gray-700 mb-6">
          Thanks{name ? `, ${name}` : ""}. Your lesson is booked.
        </p>

        <div className="border-2 border-gray-500 rounded-xl p-4 mb-6 space-y-2">
          <p className="text-gray-900 font-semibold">{resource}</p>
          <p className="text-gray-700">{lesson}</p>
          <p className="text-gray-700">Date: {date}</p>
          <p className="text-gray-700">Time: {time}</p>
          <p className="text-gray-700">Status: Confirmed</p>
          <p className="text-gray-700">Payment: {paymentStatus}</p>
        </div>

        <Link href="/" className="block">
          <div className="w-full bg-blue-600 text-white rounded-xl p-3 font-semibold text-center hover:bg-blue-700 transition">
            Book Another Lesson
          </div>
        </Link>
      </div>
    </main>
  );
}