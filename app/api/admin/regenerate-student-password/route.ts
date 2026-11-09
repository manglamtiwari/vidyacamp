import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

function generateTemporaryPassword() {
    return crypto.randomBytes(12).toString("base64url") + "A1!";
}

export async function POST(request: NextRequest) {
    const authorization = request.headers.get("authorization");

    const token = authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : null;

    if (!token) {
        return NextResponse.json(
            { error: "Authentication required." },
            { status: 401 }
        );
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    const adminClient = createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    try {
        const body = await request.json();
        const studentId = body.studentId;

        if (typeof studentId !== "string" || !studentId.trim()) {
            return NextResponse.json(
                { error: "Valid student ID is required." },
                { status: 400 }
            );
        }

        // Verify the requesting user.
        const {
            data: { user },
            error: authError,
        } = await authClient.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                { error: "Invalid or expired session." },
                { status: 401 }
            );
        }

        // Verify active school admin membership.
        const { data: membership, error: membershipError } =
            await adminClient
                .from("school_users")
                .select("school_id")
                .eq("user_id", user.id)
                .eq("role", "admin")
                .eq("status", "active")
                .limit(1)
                .maybeSingle();

        if (membershipError || !membership) {
            return NextResponse.json(
                { error: "Active school admin access not found." },
                { status: 403 }
            );
        }

        const schoolId = membership.school_id;

        // Find the student only inside this admin's school.
        const { data: student, error: studentError } =
            await adminClient
                .from("students")
                .select(
                    "id, school_id, name, user_id, login_username, must_change_password, is_active"
                )
                .eq("id", studentId)
                .eq("school_id", schoolId)
                .maybeSingle();

        if (studentError || !student) {
            return NextResponse.json(
                { error: "Student not found in your school." },
                { status: 404 }
            );
        }

        if (!student.is_active) {
            return NextResponse.json(
                { error: "Activate the student before resetting credentials." },
                { status: 400 }
            );
        }

        if (!student.user_id || !student.login_username) {
            return NextResponse.json(
                { error: "This student does not have a login account yet." },
                { status: 400 }
            );
        }

        // Verify that the linked Auth account belongs to this student.
        const { data: authData, error: authUserError } =
            await adminClient.auth.admin.getUserById(student.user_id);

        const authUser = authData?.user;

        const expectedEmail =
            `student.${student.id}@accounts.maruticamp.invalid`;

        if (
            authUserError ||
            !authUser ||
            authUser.email !== expectedEmail ||
            authUser.user_metadata?.role !== "student" ||
            authUser.user_metadata?.student_id !== student.id
        ) {
            return NextResponse.json(
                { error: "The linked student Auth account could not be verified." },
                { status: 400 }
            );
        }

        // Get the school code.
        const { data: school, error: schoolError } =
            await adminClient
                .from("schools")
                .select("school_code")
                .eq("id", schoolId)
                .single();

        if (schoolError || !school?.school_code) {
            return NextResponse.json(
                { error: "School code is not configured." },
                { status: 400 }
            );
        }

        const temporaryPassword = generateTemporaryPassword();

        // Mark the student as requiring a password change.
        const { data: updatedStudent, error: studentUpdateError } =
            await adminClient
                .from("students")
                .update({ must_change_password: true })
                .eq("id", student.id)
                .eq("school_id", schoolId)
                .eq("user_id", student.user_id)
                .select("id")
                .maybeSingle();

        if (studentUpdateError || !updatedStudent) {
            throw new Error(
                studentUpdateError?.message ||
                "Could not update the student's password setup status."
            );
        }

        // Replace the password on the EXISTING Auth user.
        const { error: passwordUpdateError } =
            await adminClient.auth.admin.updateUserById(
                student.user_id,
                {
                    password: temporaryPassword,
                    user_metadata: {
                        ...authUser.user_metadata,
                        must_change_password: true,
                    },
                }
            );

        if (passwordUpdateError) {
            // Restore the previous database flag if the Auth update fails.
            await adminClient
                .from("students")
                .update({
                    must_change_password:
                        student.must_change_password ?? false,
                })
                .eq("id", student.id)
                .eq("school_id", schoolId)
                .eq("user_id", student.user_id);

            throw passwordUpdateError;
        }

        return NextResponse.json({
            success: true,
            message: "Temporary password regenerated successfully.",
            credentials: {
                studentId: student.id,
                studentName: student.name,
                schoolCode: school.school_code,
                username: student.login_username,
                temporaryPassword,
            },
        });
    } catch (error) {
        console.error("Student password regeneration failed:", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not regenerate the student's password.",
            },
            { status: 500 }
        );
    }
}
