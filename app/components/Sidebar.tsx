"use client";

import {
    LayoutDashboard,
    Users,
    BookOpen,
    Megaphone,
    CalendarDays,
    PartyPopper,
    Settings,
    LogOut,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserRole = "admin" | "teacher" | "student";

export default function Sidebar() {
    const [schoolName, setSchoolName] = useState("");
    const [userRole, setUserRole] = useState<UserRole | null>(null);

    useEffect(() => {
        async function getUserDetails() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                return;
            }

            const { data: membership, error: membershipError } =
                await supabase
                    .from("school_users")
                    .select("school_id, role")
                    .eq("user_id", user.id)
                    .eq("status", "active")
                    .limit(1)
                    .maybeSingle();

            if (membershipError || !membership) {
                console.error(
                    "Could not load school membership:",
                    membershipError
                );
                return;
            }

            setUserRole(membership.role as UserRole);

            const { data: school, error: schoolError } =
                await supabase
                    .from("schools")
                    .select("school_name")
                    .eq("id", membership.school_id)
                    .single();

            if (schoolError || !school) {
                console.error(
                    "Could not load school:",
                    schoolError
                );
                return;
            }

            setSchoolName(school.school_name);
        }

        getUserDetails();
    }, []);

    const dashboardPath =
        userRole === "admin"
            ? "/admin/dashboard"
            : userRole === "teacher"
                ? "/teacher/dashboard"
                : "/student/dashboard";

    return (
        <aside className="w-64 h-screen bg-white shadow-md p-6 flex flex-col">

            {/* School name */}
            <h2 className="text-xl font-bold text-emerald-800 mb-8">
                {schoolName || "VidyaCamp"}
            </h2>

            {/* Navigation */}
            <nav className="space-y-2">

                {/* Dashboard */}
                <Link
                    href={dashboardPath}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50"
                >
                    <LayoutDashboard size={20} />
                    Dashboard
                </Link>

                {/* Admin-only navigation */}
                {userRole === "admin" && (
                    <>
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50"
                        >
                            <Users size={20} />
                            People
                        </Link>

                        <Link
                            href="/classes"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50"
                        >
                            <Settings size={20} />
                            Classes & Sections
                        </Link>

                        <Link
                            href="/admin/academic-years"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50"
                        >
                            <CalendarDays size={20} />
                            Academic Years
                        </Link>
                    </>
                )}

                {/* Homework */}
                <Link
                    href="/homework"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50"
                >
                    <BookOpen size={20} />
                    Homework
                </Link>

                {/* Notices */}
                <Link
                    href="/notices"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50"
                >
                    <Megaphone size={20} />
                    Notices
                </Link>

                {/* Events */}
                <Link
                    href="/events"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50"
                >
                    <PartyPopper size={20} />
                    Events
                </Link>

                {/* Timetable */}
                <Link
                    href="/timetable"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50"
                >
                    <CalendarDays size={20} />
                    Timetable
                </Link>

            </nav>

            {/* Logout */}
            <div className="mt-auto">
                <button
                    type="button"
                    onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = "/login";
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>

        </aside>
    );
}