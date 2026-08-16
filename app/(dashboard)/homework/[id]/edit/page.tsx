"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditHomeworkPage() {
    const params = useParams();
    const homeworkId = params.id as string;

    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [homeworkSummary, setHomeworkSummary] = useState("");
    const [homeworkDescription, setHomeworkDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const router = useRouter();
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        async function getHomework() {
            const { data, error } = await supabase
                .from("homework")
                .select("*")
                .eq("id", homeworkId)
                .single();

            if (error) {
                console.error("Could not load homework:", error);
                return;
            }

            setSelectedClass(data.class);
            setSelectedSection(data.section);
            setSelectedSubject(data.subject);
            setHomeworkSummary(data.summary);
            setHomeworkDescription(data.description || "");
            setDueDate(data.due_date || "");
        }

        getHomework();
    }, [homeworkId]);

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!homeworkSummary.trim()) {
            alert("Homework summary cannot be empty.");
            return;
        }
        const { error } = await supabase
            .from("homework")
            .update({
                class: selectedClass,
                section: selectedSection,
                subject: selectedSubject,
                summary: homeworkSummary.trim(),
                description: homeworkDescription,
                due_date: dueDate || null,
            })
            .eq("id", homeworkId);


        if (error) {
            console.error("Could not update homework:", error);
            return;
        }

        console.log("Homework updated successfully");
        router.push("/homework");
    };

    return (
        <form onSubmit={handleUpdate}>
            <h1 className="text-3xl font-bold">
                Edit Homework
            </h1>

            <p className="text-gray-600 mt-1">
                Update this homework assignment.
            </p>

            <div className="mt-6">
                <label
                    htmlFor="class"
                    className="block text-sm font-medium mb-2"
                >
                    Class <span className="text-red-500">*</span>
                </label>

                <select
                    id="class"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    required
                    className="w-full border rounded-md p-3"
                >
                    <option value="">Select class</option>
                    <option value="1">Class 1</option>
                    <option value="2">Class 2</option>
                    <option value="3">Class 3</option>
                </select>
            </div>

            <div className="mt-6">
                <label
                    htmlFor="section"
                    className="block text-sm font-medium mb-2"
                >
                    Section
                </label>

                <select
                    id="section"
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full border rounded-md p-3"
                >
                    <option value="">Select section</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                </select>
            </div>

            <div className="mt-6">
                <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-2"
                >
                    Subject <span className="text-red-500">*</span>
                </label>

                <select
                    id="subject"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    required
                    className="w-full border rounded-md p-3"
                >
                    <option value="">Select subject</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="english">English</option>
                    <option value="science">Science</option>
                </select>
            </div>

            <div className="mt-6">
                <label
                    htmlFor="summary"
                    className="block text-sm font-medium mb-2"
                >
                    Homework Summary <span className="text-red-500">*</span>
                </label>

                <input
                    id="summary"
                    type="text"
                    value={homeworkSummary}
                    onChange={(e) => setHomeworkSummary(e.target.value)}
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
                    value={homeworkDescription}
                    onChange={(e) => setHomeworkDescription(e.target.value)}
                    rows={5}
                    className="w-full border rounded-md p-3"
                />
            </div>

            <div className="mt-6">
                <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium mb-2"
                >
                    Due Date
                </label>

                <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={today}
                    onClick={(e) => {
                        e.currentTarget.showPicker();
                    }}
                    className="w-full border rounded-md p-3"
                />
            </div>

            <div className="flex justify-end gap-3 mt-8">


                <button
                    type="button"
                    onClick={() => router.push("/homework")}
                    className="px-5 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition"
                >
                    Update Homework
                </button>
            </div>
        </form>
    );
}