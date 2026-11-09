
"use client";

import { createClient } from "@/lib/supabase/client";
import { getCurrentSchoolMembership } from "@/lib/getCurrentSchoolMembership";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SyntheticEvent } from "react";
import { isValidEmail } from "@/lib/validations";

const supabase = createClient();

export default function LoginPage() {
    const router = useRouter();

    const [identifier, setIdentifier] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [identifierValidation, setIdentifierValidation] = useState("");
    const [usernameValidation, setUsernameValidation] = useState("");
    const [passwordValidation, setPasswordValidation] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEmailLogin = identifier.includes("@");

    async function handleLogin(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        setIdentifierValidation("");
        setUsernameValidation("");
        setPasswordValidation("");
        setLoginError("");

        const loginId = identifier.trim();
        let hasError = false;

        if (!loginId) {
            setIdentifierValidation("Please enter your email or school code.");
            hasError = true;
        } else if (isEmailLogin && !isValidEmail(loginId)) {
            setIdentifierValidation("Please enter a valid email address.");
            hasError = true;
        }

        if (!isEmailLogin && !username.trim()) {
            setUsernameValidation("Please enter your username.");
            hasError = true;
        }

        if (!password.trim()) {
            setPasswordValidation("Please enter your password.");
            hasError = true;
        }

        if (hasError) return;

        setIsSubmitting(true);

        try {
            let loginEmail = loginId;

            // Student login: resolve school code + username to internal email.
            if (!isEmailLogin) {
                const response = await fetch("/api/auth/student-login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        schoolCode: loginId,
                        username: username.trim(),
                    }),
                });

                const result = await response.json();

                if (!response.ok || !result.email) {
                    setLoginError(
                        result.error || "Invalid login details."
                    );
                    setIsSubmitting(false);
                    return;
                }

                loginEmail = result.email;
            }

            // Authenticate using Supabase.
            const { data, error } =
                await supabase.auth.signInWithPassword({
                    email: loginEmail,
                    password,
                });

            if (error || !data.user) {
                setLoginError("Invalid login details. Please try again.");
                setIsSubmitting(false);
                return;
            }

            // Identify the user's active school membership.
            const {
                membership,
                error: membershipError,
            } = await getCurrentSchoolMembership();

            if (membershipError || !membership) {
                await supabase.auth.signOut();
                setLoginError(
                    membershipError || "Could not load your membership."
                );
                setIsSubmitting(false);
                return;
            }

            if (membership.role === "admin") {
                router.push("/admin/dashboard");
                return;
            }

            if (membership.role === "teacher") {
                router.push("/teacher/dashboard");
                return;
            }

            // if (membership.role === "student") {
            //     router.push("/student/dashboard");
            //     return;
            // }

            if (membership.role === "student") {
    // Get the authenticated student's session.
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        await supabase.auth.signOut();
        setLoginError("Session not found. Please try again.");
        setIsSubmitting(false);
        return;
    }

    // Check whether the student must change the temporary password.
    const response = await fetch(
        "/api/auth/student/change-password-complete",
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        await supabase.auth.signOut();
        setLoginError(
            result.error || "Could not verify student account."
        );
        setIsSubmitting(false);
        return;
    }

    if (result.mustChangePassword) {
        router.replace("/student/change-password");
        return;
    }

    router.replace("/student/dashboard");
    return;
}

            if (membership.role === "parent") {
                router.push("/parent/dashboard");
                return;
            }

            await supabase.auth.signOut();
            setLoginError("Your account has an invalid role.");
            setIsSubmitting(false);
        } catch (error) {
            console.error("Login failed:", error);
            setLoginError("Unable to login. Please try again.");
            setIsSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-emerald-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <form noValidate onSubmit={handleLogin}>
                    <h1 className="text-3xl font-bold text-center mb-6">
                        Login
                    </h1>

                    <div className="mb-4">
                        <label
                            htmlFor="identifier"
                            className="block text-sm font-medium mb-2"
                        >
                            Email / School Code
                        </label>

                        <input
                            id="identifier"
                            type="text"
                            placeholder="Enter email or school code"
                            className="w-full border rounded-md p-3"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                        />

                        {identifierValidation && (
                            <p className="text-red-500 text-sm mt-1">
                                {identifierValidation}
                            </p>
                        )}
                    </div>

                    {!isEmailLogin && identifier.trim() !== "" && (
                        <div className="mb-4">
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium mb-2"
                            >
                                Student Username
                            </label>

                            <input
                                id="username"
                                type="text"
                                placeholder="Enter student username"
                                className="w-full border rounded-md p-3"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                            {usernameValidation && (
                                <p className="text-red-500 text-sm mt-1">
                                    {usernameValidation}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mb-4">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium mb-2"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter password"
                            className="w-full border rounded-md p-3"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        {passwordValidation && (
                            <p className="text-red-500 text-sm mt-1">
                                {passwordValidation}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        {loginError && (
                            <p className="mb-3 text-red-500 text-sm text-center">
                                {loginError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Logging in..." : "Login"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
