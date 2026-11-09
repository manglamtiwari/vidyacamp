
import { supabase } from "@/lib/supabase/client";

export type UserRole =
    | "admin"
    | "teacher"
    | "student";

export type SchoolMembership = {
    school_id: string;
    role: UserRole;
    status: string;
};

export async function getCurrentSchoolMembership(): Promise<{
    membership: SchoolMembership | null;
    error: string | null;
}> {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            membership: null,
            error: "Please log in to continue.",
        };
    }

    const { data, error } = await supabase
        .from("school_users")
        .select("school_id, role, status")
        .eq("user_id", user.id)
        .eq("status", "active");

    if (error) {
        console.error(
            "Could not load school memberships:",
            error
        );

        return {
            membership: null,
            error: "Could not load your school membership.",
        };
    }

    if (!data || data.length === 0) {
        return {
            membership: null,
            error: "No active school membership found.",
        };
    }

    if (data.length > 1) {
        return {
            membership: null,
            error: "Multiple school memberships found. Please contact your administrator.",
        };
    }

    const membership = data[0];

    if (
        membership.role !== "admin" &&
        membership.role !== "teacher" &&
        membership.role !== "student"
    ) {
        return {
            membership: null,
            error: "Invalid account role.",
        };
    }

    return {
        membership: membership as SchoolMembership,
        error: null,
    };
}
