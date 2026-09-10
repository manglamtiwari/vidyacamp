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

        const {
            name,
            employeeId,
            phone,
            email,
            dob,
        } = body;

        if (!name?.trim()) {
            return NextResponse.json(
                { error: "Teacher name is required" },
                { status: 400 }
            );
        }

        if (!email?.trim()) {
            return NextResponse.json(
                { error: "Teacher email is required" },
                { status: 400 }
            );
        }

        if (!dob) {
            return NextResponse.json(
                { error: "Teacher date of birth is required." },
                { status: 400 }
            );
        }

        // Check for duplicate Employee ID before creating the Auth account
        if (employeeId?.trim()) {
            const { data: existingTeacher, error: existingTeacherError } =
                await supabase
                    .from("teachers")
                    .select("id")
                    .eq("school_id", membership.school_id)
                    .eq("employee_id", employeeId.trim())
                    .maybeSingle();

            if (existingTeacherError) {
                console.error(
                    "Could not check Employee ID:",
                    existingTeacherError
                );

                return NextResponse.json(
                    {
                        error:
                            "Could not verify Employee ID. Please try again.",
                    },
                    { status: 500 }
                );
            }

            if (existingTeacher) {
                return NextResponse.json(
                    {
                        error:
                            "This Employee ID is already being used by another teacher in this school.",
                    },
                    { status: 400 }
                );
            }
        }

        // Supabase secret key — server only
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SECRET_KEY!
        );

        const origin = new URL(request.url).origin;

        // Create Auth user without sending an invitation email
        const { data: userData, error: userCreateError } =
            await supabaseAdmin.auth.admin.createUser({
                email: email.trim(),
                email_confirm: true,
                user_metadata: {
                    name: name.trim(),
                    school_id: membership.school_id,
                },
            });

        if (userCreateError) {
            return NextResponse.json(
                { error: userCreateError.message },
                { status: 400 }
            );
        }

        const authUser = userData.user;

        // Create teacher record
        const { error: teacherError } =
            await supabase
                .from("teachers")
                .insert({
                    school_id: membership.school_id,
                    user_id: authUser.id,
                    employee_id: employeeId?.trim() || null,
                    name: name.trim(),
                    phone: phone?.trim() || null,
                    email: email.trim(),
                    dob: dob || null,
                    is_active: true,
                });

        if (teacherError) {
            // Remove Auth user if teacher record could not be created
            await supabaseAdmin.auth.admin.deleteUser(
                authUser.id
            );

            if (teacherError.code === "23505") {
                return NextResponse.json(
                    {
                        error:
                            "This Employee ID is already being used by another teacher in this school.",
                    },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: teacherError.message },
                { status: 400 }
            );
        }

        // Create school membership
        const { error: schoolUserError } =
            await supabase
                .from("school_users")
                .insert({
                    school_id: membership.school_id,
                    user_id: authUser.id,
                    role: "teacher",
                    status: "active",
                });

        if (schoolUserError) {
            // Remove teacher record and Auth user if membership creation fails
            await supabase
                .from("teachers")
                .delete()
                .eq("user_id", authUser.id);

            await supabaseAdmin.auth.admin.deleteUser(
                authUser.id
            );

            return NextResponse.json(
                { error: schoolUserError.message },
                { status: 400 }
            );
        }

        // Send password setup email only after all teacher records are created
        const { error: resetEmailError } =
            await supabaseAdmin.auth.resetPasswordForEmail(
                email.trim(),
                {
                    redirectTo: `${origin}/auth/confirm`,
                }
            );

        if (resetEmailError) {
            // Remove teacher membership and teacher record
            await supabase
                .from("school_users")
                .delete()
                .eq("user_id", authUser.id)
                .eq("school_id", membership.school_id);

            await supabase
                .from("teachers")
                .delete()
                .eq("user_id", authUser.id);

            // Remove Auth user
            await supabaseAdmin.auth.admin.deleteUser(
                authUser.id
            );

            return NextResponse.json(
                { error: resetEmailError.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Password setup email sent successfully.",
        });
    } catch (error) {
        console.error("Invite teacher error:", error);

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}