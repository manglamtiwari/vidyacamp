"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/getUserRole";

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        async function redirectToRoleDashboard() {
            const role = await getUserRole();

            if (!role) {
                router.replace("/login");
                return;
            }

            router.replace(`/${role}/dashboard`);
        }

        redirectToRoleDashboard();
    }, [router]);

    return (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>

            <p className="text-gray-500 mt-4">
                Loading dashboard...
            </p>
        </div>
    );
}