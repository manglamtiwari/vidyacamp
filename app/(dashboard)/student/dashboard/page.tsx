"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/getUserRole";

export default function StudentDashboardPage() {
    const router = useRouter();

    const [isCheckingAccess, setIsCheckingAccess] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        async function checkAccess() {
            const role = await getUserRole();

            console.log("ROLE FROM HELPER:", role);

            if (!role) {
                router.replace("/login");
                return;
            }

            if (role !== "student") {
                router.replace(`/${role}/dashboard`);
                return;
            }

            const {
                data: { session },
            } = await createClient().auth.getSession();

            if (!session?.access_token) {
                router.replace("/login");
                return;
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
                return;
            }

            if (result.mustChangePassword) {
                router.replace("/student/change-password");
                return;
            }



            setHasAccess(true);
            setIsCheckingAccess(false);
        }

        checkAccess();
    }, [router]);

    if (isCheckingAccess) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>

                <p className="text-gray-500 mt-4">
                    Checking access...
                </p>
            </div>
        );
    }

    if (!hasAccess) {
        return null;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold">
                Student Dashboard
            </h1>

            <p className="text-gray-600 mt-1">
                View your school information from here.
            </p>

            <div className="mt-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Welcome, Student
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Your student dashboard is ready.
                    </p>
                </div>
            </div>
        </div>
    );
}