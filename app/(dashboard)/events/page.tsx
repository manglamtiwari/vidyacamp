"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getEvents() {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .order("event_date", {
                    ascending: true,
                });

            if (error) {
                console.error("Could not load events:", error);
                setLoading(false);
                return;
            }

            setEvents(data || []);
            setLoading(false);
        }

        getEvents();
    }, []);

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this event?"
        );

        if (!confirmed) {
            return;
        }

        const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Could not delete event:", error);
            alert("Could not delete event. Please try again.");
            return;
        }

        console.log("Event deleted successfully");

        setEvents((current) =>
            current.filter((item) => item.id !== id)
        );
    };

    function formatTime(time: string) {
        const [hours, minutes] = time.split(":");

        const date = new Date();
        date.setHours(Number(hours), Number(minutes), 0, 0);

        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">
                        Events
                    </h1>

                    <p className="text-gray-600 mt-1">
                        Manage school events and activities.
                    </p>
                </div>

                <Link
                    href="/events/new"
                    className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition"
                >
                    + Add Event
                </Link>
            </div>

            <div className="mt-6 space-y-4">
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>

                        <p className="text-gray-500 mt-4">
                            Loading events...
                        </p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            No events yet
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Create your first event to get started.
                        </p>
                    </div>
                ) : (
                    events.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl shadow-sm p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {item.title}
                                    </h2>
                                </div>

                                <div className="flex items-center gap-4">
                                    <p className="text-sm font-medium text-emerald-700">
                                        {new Date(
                                            item.event_date
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>

                                    {item.start_time && (
                                        <p className="text-sm text-gray-500">
                                            {formatTime(item.start_time)}
                                            {item.end_time &&
                                                ` - ${formatTime(item.end_time)}`}
                                        </p>
                                    )}

                                    {item.location && (
                                        <p className="text-sm text-gray-500">
                                            {item.location}
                                        </p>
                                    )}

                                    <Link
                                        href={`/events/${item.id}/edit`}
                                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item.id)}
                                        className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {item.description && (
                                <p className="text-gray-600 mt-4">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    ))

                )}
            </div>
        </div>
    );
}