
// // "use client";

// // import { useState } from "react";
// // import { useRouter } from "next/navigation";
// // import { createClient } from "@/lib/supabase/client";

// // const supabase = createClient();

// // export default function StudentChangePasswordPage() {
// //     const router = useRouter();

// //     const [password, setPassword] = useState("");
// //     const [confirmPassword, setConfirmPassword] = useState("");
// //     const [error, setError] = useState("");
// //     const [isSubmitting, setIsSubmitting] = useState(false);

// //     async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
// //         e.preventDefault();
// //         setError("");

// //         if (password.length < 8) {
// //             setError("Password must contain at least 8 characters.");
// //             return;
// //         }

// //         if (!/[A-Z]/.test(password) ||
// //             !/[a-z]/.test(password) ||
// //             !/[0-9]/.test(password) ||
// //             !/[^A-Za-z0-9]/.test(password)) {
// //             setError(
// //                 "Password must include uppercase, lowercase, number and special character."
// //             );
// //             return;
// //         }

// //         if (password !== confirmPassword) {
// //             setError("Passwords do not match.");
// //             return;
// //         }

// //         setIsSubmitting(true);

// //         try {
// //             const { error: passwordError } =
// //                 await supabase.auth.updateUser({ password });

// //             if (passwordError) {
// //                 throw passwordError;
// //             }

// //             const { data: sessionData } =
// //                 await supabase.auth.getSession();

// //             const accessToken = sessionData.session?.access_token;

// //             if (!accessToken) {
// //                 throw new Error("Session expired. Please log in again.");
// //             }

// //             const response = await fetch(
// //                 "/api/auth/student/change-password-complete",
// //                 {
// //                     method: "POST",
// //                     headers: {
// //                         Authorization: `Bearer ${accessToken}`,
// //                     },
// //                 }
// //             );

// //             const result = await response.json();

// //             if (!response.ok) {
// //                 throw new Error(
// //                     result.error || "Could not complete password setup."
// //                 );
// //             }

// //             router.replace("/student/dashboard");
// //         } catch (err) {
// //             console.error("Password change failed:", err);
// //             setError(
// //                 err instanceof Error
// //                     ? err.message
// //                     : "Could not change password."
// //             );
// //         } finally {
// //             setIsSubmitting(false);
// //         }
// //     }

// //     return (
// //         // <div className="min-h-[70vh] flex items-center justify-center">
// //           <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
// //             <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md">
// //                 <h1 className="text-2xl font-bold text-gray-800">
// //                     Set Your New Password
// //                 </h1>

// //                 <p className="text-gray-500 mt-2 mb-6">
// //                     Please create a permanent password to continue.
// //                 </p>

// //                 <form onSubmit={handleSubmit}>
// //                     <label className="block text-sm font-medium mb-2">
// //                         New Password
// //                     </label>

// //                     <input
// //                         type="password"
// //                         className="w-full border rounded-md p-3 mb-4"
// //                         value={password}
// //                         onChange={(e) => setPassword(e.target.value)}
// //                         required
// //                     />

// //                     <label className="block text-sm font-medium mb-2">
// //                         Confirm New Password
// //                     </label>

// //                     <input
// //                         type="password"
// //                         className="w-full border rounded-md p-3 mb-4"
// //                         value={confirmPassword}
// //                         onChange={(e) => setConfirmPassword(e.target.value)}
// //                         required
// //                     />

// //                     {error && (
// //                         <p className="text-red-600 text-sm mb-4">
// //                             {error}
// //                         </p>
// //                     )}

// //                     <button
// //                         type="submit"
// //                         disabled={isSubmitting}
// //                         className="w-full bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700 disabled:opacity-50"
// //                     >
// //                         {isSubmitting ? "Saving..." : "Set New Password"}
// //                     </button>
// //                 </form>
// //             </div>
// //         </div>
// //     );
// // }























// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { createClient } from "@/lib/supabase/client";

// const supabase = createClient();

// export default function StudentChangePasswordPage() {
//     const router = useRouter();

//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [error, setError] = useState("");
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [isCheckingAccess, setIsCheckingAccess] = useState(true);
//     const [hasAccess, setHasAccess] = useState(false);

//     // Verify that the student is logged in and still needs
//     // to change their temporary password.
//     useEffect(() => {
//         let isMounted = true;

//         async function checkPasswordAccess() {
//             try {
//                 const {
//                     data: { session },
//                 } = await supabase.auth.getSession();

//                 if (!session?.access_token) {
//                     router.replace("/login");
//                     return;
//                 }

//                 const response = await fetch(
//                     "/api/auth/student/change-password-complete",
//                     {
//                         method: "GET",
//                         headers: {
//                             Authorization: `Bearer ${session.access_token}`,
//                         },
//                         cache: "no-store",
//                     }
//                 );

//                 if (!response.ok) {
//                     router.replace("/login");
//                     return;
//                 }

//                 const result = await response.json();

//                 if (!isMounted) return;

//                 // Permanent password already created.
//                 if (!result.mustChangePassword) {
//                     router.replace("/student/dashboard");
//                     return;
//                 }

//                 setHasAccess(true);

//             } catch (err) {
//                 console.error("Password page access check failed:", err);
//                 router.replace("/login");
//             } finally {
//                 if (isMounted) {
//                     setIsCheckingAccess(false);
//                 }
//             }
//         }

//         checkPasswordAccess();

//         return () => {
//             isMounted = false;
//         };
//     }, [router]);

//     async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//         e.preventDefault();
//         setError("");

//         if (password.length < 8) {
//             setError("Password must contain at least 8 characters.");
//             return;
//         }

//         if (
//             !/[A-Z]/.test(password) ||
//             !/[a-z]/.test(password) ||
//             !/[0-9]/.test(password) ||
//             !/[^A-Za-z0-9]/.test(password)
//         ) {
//             setError(
//                 "Password must include uppercase, lowercase, number and special character."
//             );
//             return;
//         }

//         if (password !== confirmPassword) {
//             setError("Passwords do not match.");
//             return;
//         }

//         setIsSubmitting(true);

//         try {
//             const { error: passwordError } =
//                 await supabase.auth.updateUser({ password });

//             if (passwordError) {
//                 throw passwordError;
//             }

//             const { data: sessionData } =
//                 await supabase.auth.getSession();

//             const accessToken = sessionData.session?.access_token;

//             if (!accessToken) {
//                 throw new Error("Session expired. Please log in again.");
//             }

//             const response = await fetch(
//                 "/api/auth/student/change-password-complete",
//                 {
//                     method: "POST",
//                     headers: {
//                         Authorization: `Bearer ${accessToken}`,
//                     },
//                 }
//             );

//             const result = await response.json();

//             if (!response.ok) {
//                 throw new Error(
//                     result.error || "Could not complete password setup."
//                 );
//             }

//             router.replace("/student/dashboard");

//         } catch (err) {
//             console.error("Password change failed:", err);

//             setError(
//                 err instanceof Error
//                     ? err.message
//                     : "Could not change password."
//             );
//         } finally {
//             setIsSubmitting(false);
//         }
//     }

//     // Show loading while verifying access.
//     if (isCheckingAccess) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-emerald-50">
//                 <p className="text-gray-500">
//                     Checking access...
//                 </p>
//             </div>
//         );
//     }

//     // Do not display the password form without permission.
//     if (!hasAccess) {
//         return null;
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
//             <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md">
//                 <h1 className="text-2xl font-bold text-gray-800">
//                     Set Your New Password
//                 </h1>

//                 <p className="text-gray-500 mt-2 mb-6">
//                     Please create a permanent password to continue.
//                 </p>

//                 <form onSubmit={handleSubmit}>
//                     <label className="block text-sm font-medium mb-2">
//                         New Password
//                     </label>

//                     <input
//                         type="password"
//                         className="w-full border rounded-md p-3 mb-4"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         required
//                     />

//                     <label className="block text-sm font-medium mb-2">
//                         Confirm New Password
//                     </label>

//                     <input
//                         type="password"
//                         className="w-full border rounded-md p-3 mb-4"
//                         value={confirmPassword}
//                         onChange={(e) => setConfirmPassword(e.target.value)}
//                         required
//                     />

//                     {error && (
//                         <p className="text-red-600 text-sm mb-4">
//                             {error}
//                         </p>
//                     )}

//                     <button
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="w-full bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700 disabled:opacity-50"
//                     >
//                         {isSubmitting ? "Saving..." : "Set New Password"}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// }

















// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { createClient } from "@/lib/supabase/client";

// const supabase = createClient();

// export default function StudentChangePasswordPage() {
//     const router = useRouter();

//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [error, setError] = useState("");
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [isCheckingAccess, setIsCheckingAccess] = useState(true);
//     const [hasAccess, setHasAccess] = useState(false);

//     // Check whether the student still needs to change the password.
//     const checkPasswordAccess = useCallback(async () => {
//         try {
//             const {
//                 data: { session },
//             } = await supabase.auth.getSession();

//             if (!session?.access_token) {
//                 router.replace("/login");
//                 return false;
//             }

//             const response = await fetch(
//                 "/api/auth/student/change-password-complete",
//                 {
//                     method: "GET",
//                     headers: {
//                         Authorization: `Bearer ${session.access_token}`,
//                     },
//                     cache: "no-store",
//                 }
//             );

//             const result = await response.json();

//             if (!response.ok) {
//                 router.replace("/login");
//                 return false;
//             }

//             // if (!result.mustChangePassword) {
//             //     setHasAccess(false);
//             //     router.replace("/student/dashboard");
//             //     return false;
//             // }

//             if (!result.mustChangePassword) {
//                 setHasAccess(false);
//                 window.location.replace("/student/dashboard");
//                 return false;
//             }


//             setHasAccess(true);
//             return true;
//         } catch (err) {
//             console.error("Password access check failed:", err);
//             router.replace("/login");
//             return false;
//         }
//     }, [router]);

//     // Check on opening, periodically, and whenever the tab becomes active.
//     useEffect(() => {
//         let isMounted = true;

//         async function initialCheck() {
//             await checkPasswordAccess();

//             if (isMounted) {
//                 setIsCheckingAccess(false);
//             }
//         }

//         initialCheck();

//         const interval = window.setInterval(() => {
//             if (document.visibilityState === "visible") {
//                 checkPasswordAccess();
//             }
//         }, 2000);

//         const handleTabFocus = () => {
//             if (document.visibilityState === "visible") {
//                 checkPasswordAccess();
//             }
//         };

//         window.addEventListener("focus", handleTabFocus);
//         document.addEventListener("visibilitychange", handleTabFocus);

//         return () => {
//             isMounted = false;
//             window.clearInterval(interval);
//             window.removeEventListener("focus", handleTabFocus);
//             document.removeEventListener(
//                 "visibilitychange",
//                 handleTabFocus
//             );
//         };
//     }, [checkPasswordAccess]);

//     async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//         e.preventDefault();
//         setError("");

//         if (isSubmitting) return;

//         // Recheck access immediately before changing the Auth password.
//         const stillNeedsPasswordChange = await checkPasswordAccess();

//         if (!stillNeedsPasswordChange) {
//             return;
//         }

//         if (password.length < 8) {
//             setError("Password must contain at least 8 characters.");
//             return;
//         }

//         if (
//             !/[A-Z]/.test(password) ||
//             !/[a-z]/.test(password) ||
//             !/[0-9]/.test(password) ||
//             !/[^A-Za-z0-9]/.test(password)
//         ) {
//             setError(
//                 "Password must include uppercase, lowercase, number and special character."
//             );
//             return;
//         }

//         if (password !== confirmPassword) {
//             setError("Passwords do not match.");
//             return;
//         }

//         setIsSubmitting(true);

//         try {
//             const { error: passwordError } =
//                 await supabase.auth.updateUser({ password });

//             if (passwordError) {
//                 throw passwordError;
//             }

//             const {
//                 data: { session },
//             } = await supabase.auth.getSession();

//             const accessToken = session?.access_token;

//             if (!accessToken) {
//                 throw new Error("Session expired. Please log in again.");
//             }

//             const response = await fetch(
//                 "/api/auth/student/change-password-complete",
//                 {
//                     method: "POST",
//                     headers: {
//                         Authorization: `Bearer ${accessToken}`,
//                     },
//                 }
//             );

//             const result = await response.json();

//             if (!response.ok) {
//                 throw new Error(
//                     result.error || "Could not complete password setup."
//                 );
//             }

//             setHasAccess(false);
//             router.replace("/student/dashboard");
//         } catch (err) {
//             console.error("Password change failed:", err);

//             setError(
//                 err instanceof Error
//                     ? err.message
//                     : "Could not change password."
//             );
//         } finally {
//             setIsSubmitting(false);
//         }
//     }

//     if (isCheckingAccess || !hasAccess) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-emerald-50">
//                 <p className="text-gray-500">
//                     Checking password setup...
//                 </p>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
//             <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md">
//                 <h1 className="text-2xl font-bold text-gray-800">
//                     Set Your New Password
//                 </h1>

//                 <p className="text-gray-500 mt-2 mb-6">
//                     Please create a permanent password to continue.
//                 </p>

//                 <form onSubmit={handleSubmit}>
//                     <label className="block text-sm font-medium mb-2">
//                         New Password
//                     </label>

//                     <input
//                         type="password"
//                         className="w-full border rounded-md p-3 mb-4"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         required
//                     />

//                     <label className="block text-sm font-medium mb-2">
//                         Confirm New Password
//                     </label>

//                     <input
//                         type="password"
//                         className="w-full border rounded-md p-3 mb-4"
//                         value={confirmPassword}
//                         onChange={(e) => setConfirmPassword(e.target.value)}
//                         required
//                     />

//                     {error && (
//                         <p className="text-red-600 text-sm mb-4">
//                             {error}
//                         </p>
//                     )}

//                     <button
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="w-full bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700 disabled:opacity-50"
//                     >
//                         {isSubmitting ? "Saving..." : "Set New Password"}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// }























"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function StudentChangePasswordPage() {
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingAccess, setIsCheckingAccess] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    // Check whether the student still needs to change the password.
    const checkPasswordAccess = useCallback(async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.access_token) {
                router.replace("/login");
                return false;
            }

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
                router.replace("/login");
                return false;
            }

            if (!result.mustChangePassword) {
                setHasAccess(false);
                window.location.replace("/student/dashboard");
                return false;
            }

            setHasAccess(true);
            return true;
        } catch (err) {
            console.error("Password access check failed:", err);
            router.replace("/login");
            return false;
        }
    }, [router]);

    // Check on opening, periodically, and whenever the tab becomes active.
    useEffect(() => {
        let isMounted = true;

        async function initialCheck() {
            await checkPasswordAccess();

            if (isMounted) {
                setIsCheckingAccess(false);
            }
        }

        initialCheck();

        const interval = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                checkPasswordAccess();
            }
        }, 2000);

        const handleTabFocus = () => {
            if (document.visibilityState === "visible") {
                checkPasswordAccess();
            }
        };

        window.addEventListener("focus", handleTabFocus);
        document.addEventListener("visibilitychange", handleTabFocus);

        return () => {
            isMounted = false;
            window.clearInterval(interval);
            window.removeEventListener("focus", handleTabFocus);
            document.removeEventListener(
                "visibilitychange",
                handleTabFocus
            );
        };
    }, [checkPasswordAccess]);

    // Send claim, complete, or release requests to the server.
    async function sendPasswordAction(
        action: "claim" | "complete" | "release",
        accessToken: string,
        claimToken: string
    ) {
        const response = await fetch(
            "/api/auth/student/change-password-complete",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    action,
                    claimToken,
                }),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || "Password setup request failed."
            );
        }

        return result;
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        if (isSubmitting) return;

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[^A-Za-z0-9]/.test(password)
        ) {
            setError(
                "Password must include uppercase, lowercase, number and special character."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        let claimToken: string | null = null;
        let accessToken: string | null = null;
        let passwordUpdated = false;

        try {
            // Verify that password setup is still required.
            const stillNeedsChange = await checkPasswordAccess();

            if (!stillNeedsChange) {
                return;
            }

            const {
                data: { session },
            } = await supabase.auth.getSession();

            accessToken = session?.access_token ?? null;

            if (!accessToken) {
                throw new Error("Session expired. Please log in again.");
            }

            // Generate a unique token for this browser tab.
            claimToken = crypto.randomUUID();

            // Reserve the password-change process before updating Auth.
            await sendPasswordAction(
                "claim",
                accessToken,
                claimToken
            );

            // Only the tab that owns the claim can proceed.
            const { error: passwordError } =
                await supabase.auth.updateUser({ password });

            if (passwordError) {
                throw passwordError;
            }

            passwordUpdated = true;

            // Get the latest session after the Auth password update.
            const {
                data: { session: updatedSession },
            } = await supabase.auth.getSession();

            const latestAccessToken =
                updatedSession?.access_token || accessToken;

            // Complete the database setup using the same claim token.
            await sendPasswordAction(
                "complete",
                latestAccessToken,
                claimToken
            );

            setHasAccess(false);
            window.location.replace("/student/dashboard");
        } catch (err) {
            console.error("Password change failed:", err);

            // If Auth password update failed, release the claim.
            if (claimToken && accessToken && !passwordUpdated) {
                try {
                    await sendPasswordAction(
                        "release",
                        accessToken,
                        claimToken
                    );
                } catch (releaseError) {
                    console.error(
                        "Could not release password-change lock:",
                        releaseError
                    );
                }
            }

            // If Auth changed but completion failed, check whether
            // another request already completed the database update.
            if (passwordUpdated) {
                const completed = !(await checkPasswordAccess());

                if (completed) {
                    return;
                }

                setError(
                    "Your password was updated, but setup could not be finalized. Please try again later or contact your school administrator."
                );
            } else {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Could not change password."
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isCheckingAccess || !hasAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-emerald-50">
                <p className="text-gray-500">
                    Checking password setup...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
            <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-800">
                    Set Your New Password
                </h1>

                <p className="text-gray-500 mt-2 mb-6">
                    Please create a permanent password to continue.
                </p>

                <form onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium mb-2">
                        New Password
                    </label>

                    <input
                        type="password"
                        className="w-full border rounded-md p-3 mb-4"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />

                    <label className="block text-sm font-medium mb-2">
                        Confirm New Password
                    </label>

                    <input
                        type="password"
                        className="w-full border rounded-md p-3 mb-4"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />

                    {error && (
                        <p className="text-red-600 text-sm mb-4">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : "Set New Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
