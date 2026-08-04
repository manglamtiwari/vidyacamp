"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
export default function RegisterPage() {
    const router = useRouter();
    const [schoolName, setSchoolName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [emailValidation, setEmailValidation] = useState("");
    const [schoolNameValidation, setSchoolNameValidation] = useState("");

    async function handleRegisterButton() {
        let hasError = false;

        if (schoolName.trim() === "") {
            setSchoolNameValidation("Providing School name is mandatory.");
            hasError = true;
        } else {
            setSchoolNameValidation("");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            setEmailValidation("Please enter a valid email address.");
            hasError = true;
        } else {
            setEmailValidation("");
        }

        const handlePasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?]).{8,}$/;

        if (!handlePasswordRegex.test(password)) {
            setPasswordError(
                "Password must be as per below criteria.");
            hasError = true;
        } else {
            setPasswordError("");
        }

        if (hasError) {
            return;
        }

        // Register a new user in Supabase Authentication.
        // On success, returns the created user in `data.user`.
        // On failure, returns an error object describing why registration failed.
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        // Handle any errors returned by the Supabase Authentication API
        if (error) {
            setEmailValidation(error.message);
            return;
        }

        // Ensure a valid user object was returned before continuing
        // This block is checking whether Supabase successfully returned a user object.
        // Stop if the authenticated user was not created successfully
        if (!data.user) {
            setEmailValidation("Registration failed. Please try again.");
            return;
        }

        const user = data.user;

        // Insert a new school record into the "schools" table
        // and associate it with the authenticated user
        const { error: schoolError } = await supabase
            .from("schools")
            .insert({
                school_name: schoolName,
                owner_user_id: user.id,
            });

        // Handle any database errors while inserting the school
        if (schoolError) {
            console.error(schoolError);
            return;
        }

        // post successful registration, redirect the user to the login page
        router.push("/login");

        // console.log("All validations passed."); dont uncomment

    }
    return (
        <main className="min-h-screen bg-emerald-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6">
                    Register School
                </h1>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        School Name
                    </label>

                    <input
                        type="text"
                        placeholder="Enter school name"
                        className="w-full border rounded-md p-3"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                    />{schoolNameValidation && (
                        <p className="text-red-500 text-sm mt-1">
                            {schoolNameValidation}
                        </p>
                    )}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 mt-4">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter email"
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
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter password"
                            className="w-full border rounded-md p-3"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {passwordError && (
                            <p className="text-red-500 text-sm mt-1">
                                {passwordError}
                            </p>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Password must be at least 8 characters and include an uppercase letter,
                        a lowercase letter, a number, and a special character.

                    </p>
                    <button
                        className="w-full bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700 mt-4"
                        onClick={handleRegisterButton}
                    >
                        Register
                    </button>
                </div>
            </div>
        </main>
    );
}