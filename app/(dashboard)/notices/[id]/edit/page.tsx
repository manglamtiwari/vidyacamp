"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditNoticePage() {

    const params = useParams();
    const noticeId = params.id as string;


    const [noticeTitle, setNoticeTitle] = useState("");
    const [noticeContent, setNoticeContent] = useState("");
    const [publishDate, setPublishDate] = useState("");
    const router = useRouter();
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        async function getNotice() {
            const { data, error } = await supabase
                .from("notices")
                .select("*")
                .eq("id", noticeId)
                .single();

            if (error) {
                console.error("Could not load notice:", error);
                return;
            }

            setNoticeTitle(data.title);
            setNoticeContent(data.content);
            setPublishDate(data.publish_date || "");
        }
        getNotice();
    }, [noticeId]);

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!noticeTitle.trim()) {
            alert("Notice title cannot be empty.");
            return;
        }

        if (!noticeContent.trim()) {
            alert("Notice content cannot be empty.");
            return;
        }

        const { error } = await supabase
            .from("notices")
            .update({
                title: noticeTitle.trim(),
                content: noticeContent.trim(),
                publish_date: publishDate || null,
            })
            .eq("id", noticeId);

        if (error) {
            console.error("Could not update notice:", error);
            return;
        }

        console.log("Notice updated successfully");
        router.push("/notices");

    }
    return (
        <form onSubmit={handleUpdate}>
            <h1 className="text-3xl font-bold">
                Edit Notice
            </h1>

            <p className="text-gray-600 mt-1">
                Update the details of this notice.
            </p>

            <div className="mt-6">
                <label
                    htmlFor="noticeTitle"
                    className="block text-sm font-medium mb-2"
                >
                    Notice Title <span className="text-red-500">*</span>
                </label>
                <input
                    id="noticeTitle"
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
                    className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition"
                >
                    Update Notice
                </button>
            </div>

        </form>
    );

}