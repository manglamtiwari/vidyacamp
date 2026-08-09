"use client";

import {
    LayoutDashboard,
    BookOpen,
    Megaphone,
    CalendarDays,
    PartyPopper,
    LogOut,
} from "lucide-react";

import Link from "next/link";

export default function Sidebar() {
    return (
        <aside className="w-64 h-screen bg-white shadow-md p-6 flex flex-col">

            {/* School name */}
            <h2 className="text-xl font-bold text-emerald-800 mb-8">
                VidyaCamp
            </h2>

            {/* Navigation */}
            <nav className="space-y-2">

                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50"
                >
                    <LayoutDashboard size={20} />
                    Dashboard
                </Link>

                <Link
                    href="/homework"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50"
                >
                    <BookOpen size={20} />
                    Homework
                </Link>

                <Link
                    href="/notices"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50"
                >
                    <Megaphone size={20} />
                    Notices
                </Link>

                <Link
                    href="/timetable"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50"
                >
                    <CalendarDays size={20} />
                    Timetable
                </Link>

                <Link
                    href="/events"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50"
                >
                    <PartyPopper size={20} />
                    Events
                </Link>

            </nav>

            {/* Logout */}
            <div className="mt-auto">
                <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50">
                    <LogOut size={20} />
                    Logout
                </button>
            </div>

        </aside>
    );
}