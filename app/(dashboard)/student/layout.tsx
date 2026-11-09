/*
|--------------------------------------------------------------------------
| Student Layout – Authentication & Access Protection
|--------------------------------------------------------------------------
|
| Purpose:
| This layout protects all routes inside the student dashboard section.
|
| Responsibilities:
| 1. Verifies that the currently logged-in user has the student role.
| 2. Checks whether the student has an active authenticated session.
| 3. Verifies the student's must_change_password status through the
|    student password verification API.
| 4. Redirects students with temporary passwords to the password-change
|    page before allowing access to the student dashboard.
| 5. Allows students with permanent passwords to access student pages.
| 6. Redirects users with invalid roles to their respective dashboards.
| 7. Redirects unauthenticated users to the login page.
|
| Important:
| The password-change page is located outside the student dashboard
| route folder, so it does not get caught in a redirect loop.
|
| Security Note:
| This layout provides frontend route protection. Student API routes
| must also independently verify authentication, role, and permissions.
|
|--------------------------------------------------------------------------
*/


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserRole } from "@/lib/getUserRole";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function checkStudentAccess() {
            try {
                const role = await getUserRole();

                if (!isMounted) return;

                if (role !== "student") {
                    router.replace(
                        role ? `/${role}/dashboard` : "/login"
                    );
                    return;
                }

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

                setHasAccess(true);
            } catch (error) {
                console.error(
                    "Student access check failed:",
                    error
                );

                router.replace("/login");
            } finally {
                if (isMounted) {
                    setIsChecking(false);
                }
            }
        }

        checkStudentAccess();

        return () => {
            isMounted = false;
        };
    }, [router]);

    if (isChecking || !hasAccess) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>

                <p className="text-gray-500 mt-4">
                    Checking student access...
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
