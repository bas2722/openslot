"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Resource = {
  id: string;
  name: string;
  type: string;
};

export default function ResourcePage() {
  const searchParams = useSearchParams();
  const lesson = searchParams.get("lesson") || "Golf Lesson";

  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    async function fetchResources() {
      const { data } = await supabase.from("resources").select("*");
      setResources(data || []);
    }

    fetchResources();
  }, []);

  return (
    <main className="min-h-screen bg-gray-200 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Choose Instructor / Bay
        </h1>

        <div className="space-y-3">
          {resources.map((resource) => (
            <Link
              key={resource.id}
              href={`/book?lesson=${encodeURIComponent(
                lesson
              )}&resource_id=${resource.id}&resource_name=${encodeURIComponent(
                resource.name
              )}`}
              className="block"
            >
              <div className="border-2 border-gray-500 p-4 rounded-xl hover:bg-blue-100 cursor-pointer transition">
                <p className="text-gray-900 font-semibold">
                  {resource.name}
                </p>
                <p className="text-gray-700 text-sm">
                  {resource.type}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}