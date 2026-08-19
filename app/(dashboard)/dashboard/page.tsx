"use client";

import { BookOpen, Megaphone, PartyPopper, CalendarDays } from "lucide-react";
import Link from "next/link";


export default function DashboardPage() {

    return (
        <main className="flex min-h-screen bg-emerald-50 items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">

                {/* Heading */}
                <h1 className="text-3xl font-bold text-center  mb-4">
                    Welcome to the Dashboard
                </h1>

                <p className="text-xl rounded-lg text-center mb-8">
                    Select an option to get started.
                </p>

                {/* Cards */}
                <div className="grid grid-cols-2 gap-6 text-emerald-800">

                    <Link href="/homework" className="flex flex-col items-center bg-emerald-50 p-8 rounded-lg shadow-md text-2xl font-semibold hover:bg-emerald-200 hover:scale-105 transition">
                        <div className="flex flex-col items-center">

                            <div className="flex rounded-full bg-emerald-100 w-32 h-32 justify-center items-center mb-4">
                                <BookOpen size={64} />
                            </div>
                            <span>Homework</span>
                            <div className="text-black text-sm mt-2">
                                View and manage homework
                            </div>

                        </div>
                    </Link>

                    <Link href="/notices" className="flex flex-col items-center bg-emerald-50 p-8 rounded-lg shadow-md text-2xl font-semibold hover:bg-emerald-200 hover:scale-105 transition">
                        <div className="flex flex-col items-center">
                            <div className="flex rounded-full bg-emerald-100 w-32 h-32 justify-center items-center mb-4">
                                <Megaphone size={64} />
                            </div>
                            <span>Notices</span>
                            <div className="text-black text-sm mt-2">
                                Check important notices and announcements
                            </div>
                        </div>
                    </Link>

                    <div className="flex flex-col items-center bg-emerald-50 p-8 rounded-lg shadow-md text-2xl font-semibold">
                        <div className="flex rounded-full bg-emerald-100 w-32 h-32 justify-center items-center mb-4">
                            <CalendarDays size={64} />
                        </div>
                        <span>Timetable</span>
                        <div className="text-black text-sm mt-2">
                            View class timetable
                        </div>
                    </div>

                    <Link href="/events" className="flex flex-col items-center bg-emerald-50 p-8 rounded-lg shadow-md text-2xl font-semibold hover:bg-emerald-200 hover:scale-105 transition">
                        <div className="flex flex-col items-center">
                            <div className="flex rounded-full bg-emerald-100 w-32 h-32 justify-center items-center mb-4">
                                <PartyPopper size={64} />
                            </div>
                            <span>Events</span>
                            <div className="text-black text-sm mt-2">
                                Discover upcoming events and activities
                            </div>
                        </div>
                    </Link>

                </div>

            </div>
        </main>
    )
}