"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NewHomeworkPage() {
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [homeworkSummary, setHomeworkSummary] = useState("");
    const [homeworkDescription, setHomeworkDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const router = useRouter();
    const today = new Date().toISOString().split("T")[0];

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!homeworkSummary.trim()) {
            alert("Homework summary cannot be empty.");
            return;
        }
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            console.error("No logged-in user found.");
            return;
        }

        const { data: school, error: schoolError } = await supabase
            .from("schools")
            .select("id")
            .eq("owner_user_id", user.id)
            .single();

        if (schoolError || !school) {
            console.error("Could not find school:", schoolError);
            return;
        }

        const { error: homeworkError } = await supabase
            .from("homework")
            .insert({
                school_id: school.id,
                class: selectedClass,
                section: selectedSection,
                subject: selectedSubject,
                summary: homeworkSummary.trim(),
                description: homeworkDescription,
                due_date: dueDate || null,
                created_by: user.id,
            });

        if (homeworkError) {
            console.error("Could not save homework:", homeworkError);
            return;
        }

        console.log("Homework saved successfully!");
        router.push("/homework");
    }
    return (
        <form onSubmit={handleSubmit}>
            <h1 className="text-3xl font-bold">
                Add Homework
            </h1>

            <p className="text-gray-600 mt-1">
                Create a new homework assignment.
            </p>
            <div className="mt-6">
                <label htmlFor="class" className="block text-sm font-medium mb-2">
                    Class <span className="text-red-500">*</span>
                </label>

                <select
                    id="class"
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="w-full border rounded-md p-3"
                    required
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
                    className="w-full border rounded-md p-3"
                    required
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
                    className="block text-sm font-medium mb-2">
                    Homework Summary <span className="text-red-500">*</span>
                </label>

                <input
                    id="summary"
                    type="text"
                    value={homeworkSummary}
                    onChange={(e) => setHomeworkSummary(e.target.value)}
                    placeholder="e.g. Complete Chapter 3 exercises"
                    className="w-full border rounded-md p-3"
                    required
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
                    placeholder="Enter homework details..."
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
                    Save Homework
                </button>
            </div>
        </form>


    );
}