"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NoticesPage() {
    const [notices, setNotices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getNotices() {
            const { data, error } = await supabase
                .from("notices")
                .select("*")
                // .order("created_at", { ascending: true });
                .order("publish_date", {
                    ascending: true,
                    nullsFirst: false,
                });

            if (error) {
                console.error("Could not load notices:", error);
                setLoading(false);
                return;
            }

            setNotices(data || []);
            setLoading(false);
        }

        getNotices();
    }, []);



    const handleDelete = async (id: string) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this notice?"
        );

        if (!confirmed) {
            return;
        }


        const { error } = await supabase
            .from("notices")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Could not delete Notice:", error);
            alert("Could not delete Notice. Please try again.");
            return;
        }

        console.log("Notice deleted successfully");

        setNotices((current) =>
            current.filter((item) => item.id !== id)
        );
    };



    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">
                        Notices
                    </h1>

                    <p className="text-gray-600 mt-1">
                        Manage school notices and announcements.
                    </p>
                </div>

                <Link
                    href="/notices/new"
                    className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition"
                >
                    + Add Notice
                </Link>
            </div>

            <div className="mt-6 space-y-4">
                {
                    loading ? (
                        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                            <p className="text-gray-500 mt-4">Loading notices...</p>
                        </div>
                    ) : notices.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                No notices yet
                            </h2>

                            <p className="text-gray-500 mt-2">
                                Create your first notice to get started.
                            </p>
                        </div>
                    ) : (
                        notices.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-sm p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            {item.title}
                                        </h2>

                                        <p className="text-gray-600 mt-3">
                                            {item.content}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {item.publish_date ? (
                                            <p className="text-sm font-medium text-emerald-700">
                                                Publish date:{" "}
                                                {new Date(
                                                    item.publish_date
                                                ).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        ) : (
                                            <p className="text-sm font-medium text-gray-500">
                                                No publish date
                                            </p>
                                        )}

                                        <Link
                                            href={`/notices/${item.id}/edit`}
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
                            </div>
                        ))
                    )}
            </div>
        </div>
    );
}