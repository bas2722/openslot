"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Resource = {
  id: string;
  name: string;
  type: string;
  created_at: string;
};

type AvailabilityRule = {
  id: string;
  resource_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
};

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SettingsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("Instructor");

  const [selectedResource, setSelectedResource] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");

  const [availabilityRules, setAvailabilityRules] = useState<
    AvailabilityRule[]
  >([]);

  const fetchResources = async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Error loading resources: " + error.message);
      return;
    }

    setResources(data || []);
  };

  const loadAvailability = async (resourceId: string) => {
    if (!resourceId) {
      setAvailabilityRules([]);
      return;
    }

    const { data, error } = await supabase
      .from("resource_availability")
      .select("*")
      .eq("resource_id", resourceId)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      alert("Error loading availability: " + error.message);
      return;
    }

    setAvailabilityRules(data || []);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const addResource = async () => {
    if (!name.trim()) {
      alert("Please enter a resource name.");
      return;
    }

    const { error } = await supabase.from("resources").insert([
      {
        name,
        type,
      },
    ]);

    if (error) {
      alert("Error adding resource: " + error.message);
      return;
    }

    setName("");
    setType("Instructor");
    fetchResources();
  };

  const addAvailability = async () => {
    if (!selectedResource || dayOfWeek === "" || !startTime || !endTime || !duration) {
      alert("Fill out all fields");
      return;
    }

    if (endTime <= startTime) {
      alert("End time must be after start time.");
      return;
    }

    if (Number(duration) <= 0) {
      alert("Slot duration must be greater than 0.");
      return;
    }

    const numericDayOfWeek = Number(dayOfWeek);

    const hasOverlap = availabilityRules.some((rule) => {
      return (
        rule.day_of_week === numericDayOfWeek &&
        startTime < rule.end_time &&
        endTime > rule.start_time
      );
    });

    if (hasOverlap) {
      alert("This availability overlaps with an existing rule.");
      return;
    }

    const { error } = await supabase.from("resource_availability").insert([
      {
        resource_id: selectedResource,
        day_of_week: numericDayOfWeek,
        start_time: startTime,
        end_time: endTime,
        slot_duration_minutes: Number(duration),
      },
    ]);

    if (error) {
      alert("Error saving availability: " + error.message);
      return;
    }

    alert("Availability saved");

    setDayOfWeek("");
    setStartTime("");
    setEndTime("");
    setDuration("");

    loadAvailability(selectedResource);
  };

  const deleteAvailability = async (id: string) => {
    const { error } = await supabase
      .from("resource_availability")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error deleting availability: " + error.message);
      return;
    }

    loadAvailability(selectedResource);
  };

  const deleteResource = async (id: string) => {
    const confirmDelete = confirm("Delete this resource and all its availability?");
    if (!confirmDelete) return;

    const { error: availabilityError } = await supabase
      .from("resource_availability")
      .delete()
      .eq("resource_id", id);

    if (availabilityError) {
      alert("Error deleting availability: " + availabilityError.message);
      return;
    }

    const { data, error: resourceError } = await supabase
      .from("resources")
      .delete()
      .eq("id", id)
      .select();

    if (resourceError) {
      alert("Error deleting resource: " + resourceError.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("Delete was blocked. Check Supabase RLS delete policy for resources.");
      return;
    }

    if (selectedResource === id) {
      setSelectedResource("");
      setAvailabilityRules([]);
    }

    fetchResources();
  };

  return (
    <main className="min-h-screen bg-gray-200 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>

        <p className="text-gray-700 mb-6">
          Add instructors, simulator bays, or other bookable resources.
        </p>

        <div className="border-2 border-gray-400 rounded-xl p-4 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Add Resource</h2>

          <input
            className="w-full border-2 border-gray-500 rounded-xl p-3 text-gray-900 placeholder-gray-500"
            placeholder="Name, e.g. Coach Mike or Bay 1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="w-full border-2 border-gray-500 rounded-xl p-3 text-gray-900"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option>Instructor</option>
            <option>Simulator Bay</option>
            <option>Fitting Bay</option>
            <option>Practice Room</option>
          </select>

          <button
            onClick={addResource}
            className="w-full bg-blue-600 text-white rounded-xl p-3 font-semibold hover:bg-blue-700 transition"
          >
            Add Resource
          </button>
        </div>

        <div className="border-2 border-gray-400 rounded-xl p-4 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Set Availability
          </h2>

          <select
            className="w-full border-2 border-gray-500 rounded-xl p-3 text-gray-900"
            value={selectedResource}
            onChange={(e) => {
              setSelectedResource(e.target.value);
              loadAvailability(e.target.value);
            }}
          >
            <option value="">Select Resource</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            className="w-full border-2 border-gray-500 rounded-xl p-3 text-gray-900"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
          >
            <option value="">Select Day</option>
            <option value="0">Sunday</option>
            <option value="1">Monday</option>
            <option value="2">Tuesday</option>
            <option value="3">Wednesday</option>
            <option value="4">Thursday</option>
            <option value="5">Friday</option>
            <option value="6">Saturday</option>
          </select>

          <select
            className="w-full border-2 border-gray-500 rounded-xl p-3 text-gray-900"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          >
            <option value="">Select Start Time</option>
            <option value="06:00">6:00 AM</option>
            <option value="07:00">7:00 AM</option>
            <option value="08:00">8:00 AM</option>
            <option value="09:00">9:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="13:00">1:00 PM</option>
            <option value="14:00">2:00 PM</option>
            <option value="15:00">3:00 PM</option>
            <option value="16:00">4:00 PM</option>
            <option value="17:00">5:00 PM</option>
            <option value="18:00">6:00 PM</option>
            <option value="19:00">7:00 PM</option>
            <option value="20:00">8:00 PM</option>
            <option value="21:00">9:00 PM</option>
          </select>

          <select
            className="w-full border-2 border-gray-500 rounded-xl p-3 text-gray-900"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          >
            <option value="">Select End Time</option>
            <option value="07:00">7:00 AM</option>
            <option value="08:00">8:00 AM</option>
            <option value="09:00">9:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="13:00">1:00 PM</option>
            <option value="14:00">2:00 PM</option>
            <option value="15:00">3:00 PM</option>
            <option value="16:00">4:00 PM</option>
            <option value="17:00">5:00 PM</option>
            <option value="18:00">6:00 PM</option>
            <option value="19:00">7:00 PM</option>
            <option value="20:00">8:00 PM</option>
            <option value="21:00">9:00 PM</option>
            <option value="22:00">10:00 PM</option>
          </select>

          <select
            className="w-full border-2 border-gray-500 rounded-xl p-3 text-gray-900"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="">Select Slot Duration</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
            <option value="120">120 minutes</option>
          </select>

          <button
            onClick={addAvailability}
            className="w-full bg-green-600 text-white rounded-xl p-3 font-semibold hover:bg-green-700 transition"
          >
            Save Availability
          </button>
        </div>

        <div className="border-2 border-gray-400 rounded-xl p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Existing Availability
          </h2>

          {!selectedResource ? (
            <p className="text-gray-700">
              Select a resource above to view availability.
            </p>
          ) : availabilityRules.length === 0 ? (
            <p className="text-gray-700">No availability added yet.</p>
          ) : (
            <div className="space-y-3">
              {availabilityRules.map((rule) => (
                <div
                  key={rule.id}
                  className="border-2 border-gray-300 rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {days[rule.day_of_week]}: {formatTime(rule.start_time)} –{" "}
                      {formatTime(rule.end_time)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {rule.slot_duration_minutes} minute slots
                    </p>
                  </div>

                  <button
                    onClick={() => deleteAvailability(rule.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Current Resources
          </h2>

          {resources.length === 0 && (
            <p className="text-gray-700">No resources yet.</p>
          )}

          {resources.map((resource) => (
            <div
              key={resource.id}
              className="border-2 border-gray-500 rounded-xl p-4"
            >
              <p className="text-gray-900 font-semibold">{resource.name}</p>
              <p className="text-gray-700">{resource.type}</p>

              <button
                onClick={() => deleteResource(resource.id)}
                className="mt-3 bg-red-600 text-white px-3 py-2 rounded-xl hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}