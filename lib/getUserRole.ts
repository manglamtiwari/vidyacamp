import { getCurrentSchoolMembership } from "@/lib/getCurrentSchoolMembership";

export type UserRole = "admin" | "teacher" | "student";

export async function getUserRole(): Promise<UserRole | null> {
    const { membership, error } =
        await getCurrentSchoolMembership();

    if (error || !membership) {
        console.error(
            "Could not load user role:",
            error
        );

        return null;
    }

    return membership.role;
}
