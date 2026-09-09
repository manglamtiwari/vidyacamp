"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSaving(true);

        try {
           
            const response = await fetch(
                "/api/auth/set-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        password,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setError(
                    result.error ||
                    "Could not create your password."
                );
                return;
            }

            alert("Password created successfully. You can now log in.");

            const supabase = createClient();

            await supabase.auth.signOut();

            router.replace("/login");
        } catch (error) {
            console.error("Could not set password:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
                <h1 className="text-2xl font-bold text-gray-800 text-center">
                    Create Your Password
                </h1>

                <p className="text-gray-500 text-center mt-2">
                    Set a password for your teacher account.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Confirm password"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-emerald-600 text-white rounded-lg py-2.5 font-medium hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {isSaving
                            ? "Saving..."
                            : "Create Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}