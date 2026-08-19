"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
    const [eventTitle, setEventTitle] = useState("");
    const [eventDescription, setEventDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [location, setLocation] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const router = useRouter();
    const today = new Date().toISOString().split("T")[0];

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!eventTitle.trim()) {
            alert("Event title cannot be empty.");
            return;
        }

        if (!eventDate) {
            alert("Event date is required.");
            return;
        }

        setIsSaving(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            console.error("No logged-in user found.");
            setIsSaving(false);
            return;
        }

        const { data: school, error: schoolError } = await supabase
            .from("schools")
            .select("id")
            .eq("owner_user_id", user.id)
            .single();

        if (schoolError || !school) {
            console.error(
                "Could not find school:",
                schoolError
            );
            setIsSaving(false);
            return;
        }

        const { error: eventError } = await supabase
            .from("events")
            .insert({
                school_id: school.id,
                title: eventTitle.trim(),
                description: eventDescription.trim() || null,
                event_date: eventDate,
                start_time: startTime || null,
                end_time: endTime || null,
                location: location.trim() || null,
                created_by: user.id,
            });

        setIsSaving(false);

        if (eventError) {
            console.error(
                "Could not save event:",
                eventError
            );
            alert("Could not save event. Please try again.");
            return;
        }

        console.log("Event saved successfully!");
        router.push("/events");
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1 className="text-3xl font-bold">
                Add Event
            </h1>

            <p className="text-gray-600 mt-1">
                Create a new school event.
            </p>

            <div className="mt-6">
                <label
                    htmlFor="eventTitle"
                    className="block text-sm font-medium mb-2"
                >
                    Event Title{" "}
                    <span className="text-red-500">*</span>
                </label>

                <input
                    id="eventTitle"
                    type="text"
                    value={eventTitle}
                    onChange={(e) =>
                        setEventTitle(e.target.value)
                    }
                    placeholder="e.g. Annual Sports Day"
                    required
                    className="w-full border rounded-md p-3"
                />
            </div>

            <div className="mt-6">
                <label
                    htmlFor="description"
                    className="block text-sm font-medium mb-2"
                >
                    Description
                </label>

                <textarea
                    id="description"
                    value={eventDescription}
                    onChange={(e) =>
                        setEventDescription(e.target.value)
                    }
                    placeholder="Enter event details..."
                    rows={5}
                    className="w-full border rounded-md p-3"
                />
            </div>

            <div className="mt-6">
                <label
                    htmlFor="eventDate"
                    className="block text-sm font-medium mb-2"
                >
                    Event Date{" "}
                    <span className="text-red-500">*</span>
                </label>

                <input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) =>
                        setEventDate(e.target.value)
                    }
                    min={today}
                    onClick={(e) => {
                        e.currentTarget.showPicker();
                    }}
                    required
                    className="w-full border rounded-md p-3"
                />
            </div>

            <div className="mt-6">
                <label
                    htmlFor="startTime"
                    className="block text-sm font-medium mb-2"
                >
                    Start Time
                </label>

                <input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) =>
                        setStartTime(e.target.value)
                    }
                    onClick={(e) => {
                        e.currentTarget.showPicker();
                    }}
                    className="w-full border rounded-md p-3"
                />
            </div>

            <div className="mt-6">
                <label
                    htmlFor="endTime"
                    className="block text-sm font-medium mb-2"
                >
                    End Time
                </label>

                <input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) =>
                        setEndTime(e.target.value)
                    }
                    onClick={(e) => {
                        e.currentTarget.showPicker();
                    }}
                    className="w-full border rounded-md p-3"
                />
            </div>

            <div className="mt-6">
                <label
                    htmlFor="location"
                    className="block text-sm font-medium mb-2"
                >
                    Location
                </label>

                <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) =>
                        setLocation(e.target.value)
                    }
                    placeholder="e.g. School Auditorium"
                    className="w-full border rounded-md p-3"
                />
            </div>

            <div className="flex justify-end gap-3 mt-8">
                <button
                    type="button"
                    onClick={() => router.push("/events")}
                    className="px-5 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? "Saving..." : "Save Event"}
                </button>
            </div>
        </form>
    );
}