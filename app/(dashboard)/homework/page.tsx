"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HomeworkPage() {
    const [homework, setHomework] = useState<any[]>([]);

    useEffect(() => {
        async function getHomework() {
            const { data, error } = await supabase
                .from("homework")
                .select("*")
                .order("due_date", { ascending: true });

            if (error) {
                console.error("Could not load homework:", error);
                return;
            }

            setHomework(data || []);
        }

        getHomework();
    }, []);

    const handleDelete = async (id: string) => {

        const confirmed = window.confirm(
        "Are you sure you want to delete this homework?"
    );

    if (!confirmed) {
        return;
    }

    
        const { error } = await supabase
            .from("homework")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Could not delete homework:", error);
            return;
        }

        console.log("Homework deleted successfully");

        setHomework((current) =>
            current.filter((item) => item.id !== id)
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">
                        Homework
                    </h1>

                    <p className="text-gray-600 mt-1">
                        Manage homework assignments for your classes.
                    </p>
                </div>

                <Link
                    href="/homework/new"
                    className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition"
                >
                    + Add Homework
                </Link>
            </div>

            <div className="mt-6 space-y-4">
                {homework.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            No homework assignments yet
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Create your first homework assignment to get started.
                        </p>
                    </div>
                ) : (
                    homework.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl shadow-sm p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {item.summary}
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Class {item.class} · Section {item.section} · {item.subject}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <p className="text-sm font-medium text-emerald-700">
                                        Due: {new Date(item.due_date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>

                                    <Link
                                        href={`/homework/${item.id}/edit`}
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