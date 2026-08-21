"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SyntheticEvent } from "react";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [emailValidation, setEmailValidation] = useState("");
    const [password, setPassword] = useState("");
    const [passwordValidation, setPasswordValidation] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleLogin(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        setEmailValidation("");
        setPasswordValidation("");
        setLoginError("");

        let hasError = false;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            setEmailValidation("Please enter a valid email address.");
            hasError = true;
        }

        if (password.trim() === "") {
            setPasswordValidation("Please enter a valid password.");
            hasError = true;
        }

        if (hasError) {
            return;
        }

        setIsSubmitting(true);

        const {
            data,
            error,
        } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setIsSubmitting(false);
            setLoginError(error.message);
            return;
        }

        if (!data.user) {
            setIsSubmitting(false);
            setLoginError("Login failed. Please try again.");
            return;
        }

        const { data: membership, error: membershipError } =
            await supabase
                .from("school_users")
                .select("role, status")
                .eq("user_id", data.user.id)
                .eq("status", "active")
                .limit(1)
                .maybeSingle();

        if (membershipError) {
            console.error(
                "Could not load user role:",
                membershipError
            );

            setIsSubmitting(false);
            setLoginError("Could not load your account role. Please try again.");
            return;
        }

        if (!membership) {
            setIsSubmitting(false);
            setLoginError(
                "Your account is not associated with an active school."
            );
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

        if (membership.role === "student") {
            router.push("/student/dashboard");
            return;
        }

        setIsSubmitting(false);
        setLoginError("Your account has an invalid role.");
    }

    return (
        <main className="min-h-screen bg-emerald-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <form noValidate onSubmit={handleLogin}>
                    <h1 className="text-3xl font-bold text-center mb-6">
                        Login Page
                    </h1>

                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium mb-2"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Enter Email address"
                            className="w-full border rounded-md p-3"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        {emailValidation && (
                            <p className="text-red-500 text-sm mt-1">
                                {emailValidation}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium mb-2 mt-4"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter Password"
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