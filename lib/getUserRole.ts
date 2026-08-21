import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "teacher" | "student";

export async function getUserRole(): Promise<UserRole | null> {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: membership, error } = await supabase
        .from("school_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Could not load user role:", error);
        return null;
    }

    if (
        membership?.role !== "admin" &&
        membership?.role !== "teacher" &&
        membership?.role !== "student"
    ) {
        return null;
    }

    return membership.role;
}