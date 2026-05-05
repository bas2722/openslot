"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  date: string;
  time: string;
  lesson: string;
  status: string;
  payment_status: string;
  created_at: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      alert("Error loading bookings: " + error.message);
      return;
    }

    setBookings(data || []);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const markAsPaid = async (id: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ payment_status: "paid" })
      .eq("id", id);

    if (error) {
      alert("Error updating payment: " + error.message);
      return;
    }

    fetchBookings();
  };

  const deleteBooking = async (id: string) => {
    const confirmDelete = confirm("Delete this booking?");
    if (!confirmDelete) return;

    const { data, error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      alert("Error deleting booking: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("Delete was blocked. Check Supabase RLS delete policy for bookings.");
      return;
    }

    fetchBookings();
  };

  const days = Array.from({ length: 7 }).map((_, i) => {
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
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-700">Upcoming lesson bookings</p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-2">
            <p className="text-gray-900 font-semibold">
              {bookings.length} total
            </p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {days.map((day) => {
            const dayBookings = bookings.filter(
              (booking) => booking.date === day.value
            );

            return (
              <div
                key={day.value}
                className="border-2 border-gray-400 rounded-xl min-h-64 p-3"
              >
                <h2 className="text-gray-900 font-semibold mb-3">
                  {day.label}
                </h2>

                <div className="space-y-3">
                  {dayBookings.length === 0 && (
                    <p className="text-gray-500 text-sm">No bookings</p>
                  )}

                  {dayBookings.map((booking) => {
                    const paymentStatus =
                      booking.payment_status?.toLowerCase() || "pending";
                    const isPaid = paymentStatus === "paid";

                    return (
                      <div
                        key={booking.id}
                        className="bg-blue-100 border border-blue-400 rounded-lg p-3 text-center"
                      >
                        <p className="text-gray-900 font-semibold whitespace-nowrap">
                          {booking.time.replace("\n", " ").trim()}
                        </p>

                        <p className="text-gray-800 text-sm mt-2">
                          {booking.name}
                        </p>

                        <p className="text-gray-700 text-sm">
                          {booking.lesson}
                        </p>

                        <div className="mt-3 flex justify-center">
                          <span
                            className={`inline-flex items-center justify-center text-center text-xs px-3 py-1 rounded-full font-semibold ${
                              isPaid
                                ? "bg-green-200 text-green-800"
                                : "bg-yellow-200 text-yellow-800"
                            }`}
                          >
                            {isPaid ? "Paid" : "Payment Pending"}
                          </span>
                        </div>

                        {!isPaid && (
                          <button
                            type="button"
                            onClick={() => markAsPaid(booking.id)}
                            className="mt-3 w-full bg-green-600 text-white text-sm rounded-lg p-2 hover:bg-green-700 transition cursor-pointer"
                          >
                            Mark as Paid
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteBooking(booking.id)}
                          className="mt-2 w-full bg-red-600 text-white text-sm rounded-lg p-2 hover:bg-red-700 transition cursor-pointer"
                        >
                          Delete Booking
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <Link href="/" className="block mt-6">
          <div className="w-full bg-blue-600 text-white rounded-xl p-3 font-semibold text-center hover:bg-blue-700 transition">
            Back to Booking Page
          </div>
        </Link>
      </div>
    </main>
  );
}