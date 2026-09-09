"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmInvitePage() {
    const router = useRouter();

    const [message, setMessage] = useState(
        "Verifying your password setup link..."
    );
    const [isVerified, setIsVerified] = useState(false);
    const [employeeId, setEmployeeId] = useState("");
    const [dob, setDob] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function confirmPasswordSetup() {
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);

            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");
            const error = params.get("error");

            if (error) {
                setMessage(
                    "This password setup link is invalid or has expired."
                );
                return;
            }

            if (!accessToken || !refreshToken) {
                setMessage(
                    "Invalid invitation link."
                );
                return;
            }

            const supabase = createClient();

            const { error: sessionError } =
                await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });

            if (sessionError) {
                console.error(
                    "Could not establish invitation session:",
                    sessionError
                );

                setMessage(
                    "This password setup link is invalid or has expired."
                );
                return;
            }

            setMessage(
                "Please verify your details to continue."
            );
            setIsVerified(true);
        }

        confirmPasswordSetup();
    }, []);

    async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError("");
        setIsChecking(true);

        try {
            const response = await fetch(
                "/api/auth/verify-teacher",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        employeeId,
                        dob,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setError(
                    result.error ||
                    "Could not verify your details."
                );
                return;
            }

            router.replace("/set-password");
        } catch (error) {
            console.error(
                "Could not verify teacher:",
                error
            );

            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setIsChecking(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
                <h1 className="text-2xl font-bold text-gray-800 text-center">
                    Teacher Password Setup
                </h1>

                {!isVerified ? (
                    <p className="text-gray-500 mt-3 text-center">
                        {message}
                    </p>
                ) : (
                    <>
                        <p className="text-gray-500 mt-3 text-center">
                            Please verify your Employee ID and Date of Birth before creating your password.
                        </p>

                        <form
                            onSubmit={handleVerify}
                            className="mt-6 space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Employee ID
                                </label>

                                <input
                                    type="text"
                                    value={employeeId}
                                    onChange={(e) =>
                                        setEmployeeId(e.target.value)
                                    }
                                    placeholder="Enter your Employee ID"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth
                                </label>

                                <input
                                    type="date"
                                    value={dob}
                                    onChange={(e) =>
                                        setDob(e.target.value)
                                    }
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-600">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isChecking}
                                className="w-full bg-emerald-600 text-white rounded-lg py-2.5 font-medium hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {isChecking
                                    ? "Verifying..."
                                    : "Verify & Continue"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}