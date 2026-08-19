"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NewNoticePage() {
    const [noticeTitle, setNoticeTitle] = useState("");
    const [noticeContent, setNoticeContent] = useState("");
    const [publishDate, setPublishDate] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const router = useRouter();
    const today = new Date().toISOString().split("T")[0];

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!noticeTitle.trim()) {
            alert("Notice title cannot be empty.");
            return;
        }

        if (!noticeContent.trim()) {
            alert("Notice content cannot be empty.");
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
            console.error("Could not find school:", schoolError);
            setIsSaving(false);
            return;
        }

        const { error: noticeError } = await supabase
            .from("notices")
            .insert({
                school_id: school.id,
                title: noticeTitle.trim(),
                content: noticeContent.trim(),
                publish_date: publishDate || null,
                created_by: user.id,
            });

        setIsSaving(false);

        if (noticeError) {
            console.error("Could not save notice:", noticeError);
            alert("Could not save notice. Please try again.");
            return;
        }

        console.log("Notice saved successfully!");
        router.push("/notices");
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1 className="text-3xl font-bold">
                Add Notice
            </h1>

            <p className="text-gray-600 mt-1">
                Create a new school notice.
            </p>

            <div className="mt-6">
                <label
                    htmlFor="title"
                    className="block text-sm font-medium mb-2"
                >
                    Notice Title <span className="text-red-500">*</span>
                </label>

                <input
                    id="title"
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="e.g. Parent Teacher Meeting"
                    required
                    className="w-full border rounded-md p-3"
                />
            </div>

            <div className="mt-6">
                <label
                    htmlFor="content"
                    className="block text-sm font-medium mb-2"
                >
                    Notice Content <span className="text-red-500">*</span>
                </label>

                <textarea
                    id="content"
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    placeholder="Enter notice details..."
                    rows={6}
                    required
                    className="w-full border rounded-md p-3"
                />
            </div>

            <div className="mt-6">
                <label
                    htmlFor="publishDate"
                    className="block text-sm font-medium mb-2"
                >
                    Publish Date
                </label>

                <input
                    id="publishDate"
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
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
                    onClick={() => router.push("/notices")}
                    className="px-5 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >

                    {isSaving ? "Saving..." : "Save Notice"}
                </button>
            </div>
        </form>
    );
}