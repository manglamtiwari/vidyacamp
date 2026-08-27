import Sidebar from "../components/Sidebar";
import SessionTimeout from "./SessionTimeout";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-emerald-50">
            <SessionTimeout />

            <Sidebar />

            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}