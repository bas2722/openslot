"use client";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DetailsPage() {
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get("date");
  const selectedTime = searchParams.get("time");
  const router = useRouter();
  const selectedLesson = searchParams.get("lesson") || "Golf Lesson";
  const selectedResourceId = searchParams.get("resource_id");
  const selectedResourceName =
  searchParams.get("resource_name") || "Selected Resource";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });



  return (
    <main className="min-h-screen bg-gray-200 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Your Information
        </h1>

        <div className="mb-6 space-y-1">
  <p className="text-gray-700">
    Resource: <span className="font-semibold">{selectedResourceName}</span>
  </p>
  <p className="text-gray-700">
    Lesson: <span className="font-semibold">{selectedLesson}</span>
  </p>
  <p className="text-gray-700">
    Date: <span className="font-semibold">{selectedDate}</span>
  </p>
  <p className="text-gray-700">
    Time: <span className="font-semibold">{selectedTime}</span>
  </p>
</div>

        <div className="space-y-4">
          <input
            className="w-full border-2 border-gray-500 rounded-xl p-3 text-gray-900 placeholder-gray-500"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="w-full border-2 border-gray-500 rounded-xl p-3 text-gray-900 placeholder-gray-500"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            className="w-full border-2 border-gray-500 rounded-xl p-3 text-gray-900 placeholder-gray-500"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <textarea
            className="w-full border-2 border-gray-500 rounded-xl p-3 text-gray-900 placeholder-gray-500 min-h-28"
            placeholder="Notes for the instructor"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <button
  onClick={async () => {
    if (!form.name.trim()) {
      alert("Name is required.");
      return;
    }

    if (!form.email.trim()) {
      alert("Email is required.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Phone is required.");
      return;
    }

    const booking = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      notes: form.notes,
      date: selectedDate,
      time: selectedTime,
      lesson: selectedLesson,
      resource_id: selectedResourceId,
      resource_name: selectedResourceName,
      status: "Confirmed",
      payment_status: "pending",
    };

    const { error } = await supabase.from("bookings").insert([booking]);

    if (error) {
      if (error.message.includes("unique_resource_time")) {
        alert("That time is unavailable. Please choose another time.");
      } else {
        alert("Error saving booking: " + error.message);
      }
      return;
    }

    router.push(
      `/book/confirmation?date=${selectedDate}&time=${selectedTime}&name=${encodeURIComponent(
        form.name
      )}&lesson=${encodeURIComponent(
        selectedLesson
      )}&resource_name=${encodeURIComponent(selectedResourceName)}`
    );
  }}
  className="w-full bg-blue-600 text-white rounded-xl p-3 font-semibold hover:bg-blue-700 transition"
>
  Continue to Payment
</button>
        </div>
      </div>
    </main>
  );
}