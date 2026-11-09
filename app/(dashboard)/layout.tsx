"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { createClient } from "@/lib/supabase/client";
import { getUserRole } from "@/lib/getUserRole";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const [isChecking, setIsChecking] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function checkDashboardAccess() {
            try {
                const role = await getUserRole();

                if (!isMounted) return;

                if (!role) {
                    router.replace("/login");
                    return;
                }

                // Only students require the first-login password check.
                if (role === "student") {
                    const supabase = createClient();

                    const {
                        data: { session },
                    } = await supabase.auth.getSession();

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

                    if (!response.ok) {
                        router.replace("/login");
                        return;
                    }

                    const result = await response.json();

                    if (!isMounted) return;

                    if (result.mustChangePassword) {
                        router.replace("/student/change-password");
                        return;
                    }
                }

                if (isMounted) {
                    setHasAccess(true);
                }
            } catch (error) {
                console.error("Dashboard access check failed:", error);
                router.replace("/login");
            } finally {
                if (isMounted) {
                    setIsChecking(false);
                }
            }
        }

        checkDashboardAccess();

        return () => {
            isMounted = false;
        };
    }, [router, pathname]);

    if (isChecking || !hasAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-emerald-50">
                <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">
                        Checking access...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-emerald-50">
            <Sidebar />

            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
