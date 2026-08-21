"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/getUserRole";

export default function AdminDashboardPage() {
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

            if (role !== "admin") {
                router.replace(`/${role}/dashboard`);
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
                Admin Dashboard
            </h1>

            <p className="text-gray-600 mt-1">
                Manage your school from here.
            </p>

            <div className="mt-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Welcome, Admin
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Your school management dashboard is ready.
                    </p>
                </div>
            </div>
        </div>
    );
}