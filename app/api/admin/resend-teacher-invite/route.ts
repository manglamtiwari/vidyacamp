import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Check logged-in user
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

        // Check admin membership
        const { data: membership, error: membershipError } =
            await supabase
                .from("school_users")
                .select("school_id, role, status")
                .eq("user_id", user.id)
                .eq("role", "admin")
                .eq("status", "active")
                .maybeSingle();

        if (membershipError || !membership) {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const teacherId = body.teacherId;

        if (!teacherId) {
            return NextResponse.json(
                { error: "Teacher ID is required." },
                { status: 400 }
            );
        }

        // Get teacher and make sure they belong to this school
        const { data: teacher, error: teacherError } =
            await supabase
                .from("teachers")
                .select("id, user_id, email, name")
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
                { error: "This teacher does not have an Auth account." },
                { status: 400 }
            );
        }

        if (!teacher.email?.trim()) {
            return NextResponse.json(
                { error: "This teacher does not have an email address." },
                { status: 400 }
            );
        }

        // Supabase secret key — server only
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SECRET_KEY!
        );

        // Check the Auth user
        const { data: authUserData, error: authUserError } =
            await supabaseAdmin.auth.admin.getUserById(
                teacher.user_id
            );

        if (authUserError || !authUserData.user) {
            return NextResponse.json(
                { error: "Teacher Auth account could not be found." },
                { status: 404 }
            );
        }

        const authUser = authUserData.user;
        const origin = new URL(request.url).origin;

        // Send a fresh password setup email
        const { error: resetError } =
            await supabaseAdmin.auth.resetPasswordForEmail(
                authUser.email!,
                {
                    redirectTo: `${origin}/auth/confirm`,
                }
            );

        if (resetError) {
            return NextResponse.json(
                { error: resetError.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Password setup email sent successfully.",
        });

    } catch (error) {
        console.error(
            "Resend teacher password setup error:",
            error
        );

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}