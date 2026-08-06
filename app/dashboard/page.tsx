"use client";

export default function DashboardPage() {
    return (
        <main className="flex min-h-screen bg-emerald-50 items-center justify-center">
            <div className=" bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="flex text-2xl font-bold items-center justify-center">Welcome to the Dashboard</h1>

                <div className="grid grid-cols-2 gap-8 mt-8">
                    <div className = "bg-emerald-600 p-8 items-center justify-center rounded-lg">
                        <button className = "text-white text-lg">
                        Homework
                        </button>
                        </div>
                    
                    <button>Notices</button>
                

                
                    <button>Timetable</button>
                    <button>Events</button>
                </div>

            </div>
        </main>
    )
}