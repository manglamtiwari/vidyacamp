"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditEventPage() {
    const params = useParams();
    const eventId = params.id as string;

    const [eventTitle, setEventTitle] = useState("");
    const [eventDescription, setEventDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [location, setLocation] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const router = useRouter();
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        async function getEvent() {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("id", eventId)
                .single();

            

            if (error) {
                console.error("Could not load event:", error);
                setIsLoading(false);
                return;
            }

            setEventTitle(data.title || "");
            setEventDescription(data.description || "");
            setEventDate(data.event_date || "");
            setStartTime(data.start_time || "");
            setEndTime(data.end_time || "");
            setLocation(data.location || "");
            setIsLoading(false); 
        }

        getEvent();
    }, [eventId]);

    const handleUpdate = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!eventTitle.trim()) {
            alert("Event title cannot be empty.");
            return;
        }

        if (!eventDate) {
            alert("Event date is required.");
            return;
        }

        setIsUpdating(true);

        const { error } = await supabase
            .from("events")
            .update({
                title: eventTitle.trim(),
                description: eventDescription.trim() || null,
                event_date: eventDate,
                start_time: startTime || null,
                end_time: endTime || null,
                location: location.trim() || null,
            })
            .eq("id", eventId);

        setIsUpdating(false);

        if (error) {
            console.error("Could not update event:", error);
            alert("Could not update event. Please try again.");
            return;
        }

        console.log("Event updated successfully");
        router.push("/events");
    };
// loading code here 
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading event details...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleUpdate}>
            <h1 className="text-3xl font-bold">
                Edit Event
            </h1>

            <p className="text-gray-600 mt-1">
                Update the details of this event.
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
                    disabled={isUpdating}
                    className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUpdating ? "Updating..." : "Update Event"}
                </button>
            </div>
        </form>
    );
}