import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Verify that the logged-in user is an active admin
        const { data: membership, error: membershipError } =
            await supabase
                .from("school_users")
                .select("school_id")
                .eq("user_id", user.id)
                .eq("role", "admin")
                .eq("status", "active")
                .maybeSingle();

        if (membershipError || !membership) {
            return NextResponse.json(
                { error: "Admin access required." },
                { status: 403 }
            );
        }

        const body = await request.json();

        const teacherId = body.teacherId;
        const newEmail =
            body.email?.trim().toLowerCase();

        if (!teacherId || !newEmail) {
            return NextResponse.json(
                {
                    error:
                        "Teacher ID and email are required.",
                },
                { status: 400 }
            );
        }

        // Get teacher from the admin's school
        const { data: teacher, error: teacherError } =
            await supabase
                .from("teachers")
                .select("id, user_id, email")
                .eq("id", teacherId)
                .eq("school_id", membership.school_id)
                .maybeSingle();

        if (teacherError || !teacher) {
            return NextResponse.json(
                { error: "Teacher not found." },
                { status: 404 }
            );
        }

        if (!teacher.user_id) {
            return NextResponse.json(
                {
                    error:
                        "This teacher does not have an Auth account.",
                },
                { status: 400 }
            );
        }

        const oldEmail =
            teacher.email?.trim().toLowerCase() || "";

        // No change required
        if (oldEmail === newEmail) {
            return NextResponse.json({
                success: true,
                message: "Email is already up to date.",
            });
        }

        // Server-only Supabase admin client
        const supabaseAdmin =
            createSupabaseAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SECRET_KEY!
            );

        // Update Supabase Auth
        const { error: authError } =
            await supabaseAdmin.auth.admin.updateUserById(
                teacher.user_id,
                {
                    email: newEmail,
                    email_confirm: true,
                }
            );

        if (authError) {
            console.error(
                "Failed to update Auth email:",
                authError
            );

            return NextResponse.json(
                {
                    error:
                        authError.message ||
                        "Could not update authentication email.",
                },
                { status: 400 }
            );
        }

        // Update teachers.email
        const { error: teacherUpdateError } =
            await supabase
                .from("teachers")
                .update({
                    email: newEmail,
                })
                .eq("id", teacher.id)
                .eq("school_id", membership.school_id);

        if (teacherUpdateError) {
            console.error(
                "Failed to update teacher email:",
                teacherUpdateError
            );

            // Roll Auth email back if database update fails
            if (oldEmail) {
                await supabaseAdmin.auth.admin.updateUserById(
                    teacher.user_id,
                    {
                        email: oldEmail,
                        email_confirm: true,
                    }
                );
            }

            return NextResponse.json(
                {
                    error:
                        "Could not update teacher email. The email change was rolled back.",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Teacher email updated successfully.",
        });
    } catch (error) {
        console.error(
            "Update teacher email error:",
            error
        );

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}