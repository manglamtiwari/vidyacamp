
import { NextRequest, NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";
import {
    createClient,
    type SupabaseClient,
} from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

type ProvisionResult = {
    studentId: string;
    studentName: string;
    success: boolean;
    credentials?: {
        schoolCode: string;
        username: string;
        temporaryPassword: string;
    };
    error?: string;
};

function isEligibleClass(className: string): boolean {
    const normalized = className.trim().toLowerCase();

    if (/\b(nursery|lkg|ukg|kg|kindergarten)\b/.test(normalized)) {
        return false;
    }

    return /\b(10|[1-9])\b/.test(normalized);
}

function createUsername(schoolCode: string, admissionNo: string): string {
    const cleanSchoolCode = schoolCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const cleanAdmissionNo = admissionNo.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (!cleanSchoolCode || !cleanAdmissionNo) {
        throw new Error("School code or admission number is invalid.");
    }

    return `${cleanSchoolCode}-${cleanAdmissionNo}`;
}

// async function provisionStudentAccount(
//     adminClient: ReturnType<typeof createClient>,
async function provisionStudentAccount(
    adminClient: SupabaseClient<any, "public", any>,
    studentId: string,
    schoolId: string,
    schoolCode: string
): Promise<ProvisionResult> {
    let createdAuthUserId: string | null = null;
    let createdMembershipId: string | null = null;

    try {
        const { data: student, error: studentError } = await adminClient
            .from("students")
            .select(
                "id, school_id, admission_no, name, class_id, user_id, login_username, is_active"
            )
            .eq("id", studentId)
            .eq("school_id", schoolId)
            .maybeSingle();

        if (studentError || !student) {
            throw new Error("Student not found in your school.");
        }

        if (!student.is_active) {
            throw new Error("Cannot create an account for an inactive student.");
        }

        if (student.user_id || student.login_username) {
            throw new Error("This student already has login details.");
        }

        if (!student.class_id) {
            throw new Error("Assign a class before creating an account.");
        }

        const { data: classData, error: classError } = await adminClient
            .from("classes")
            .select("name")
            .eq("id", student.class_id)
            .eq("school_id", schoolId)
            .single();

        if (classError || !classData) {
            throw new Error("Could not verify the student's class.");
        }

        if (!isEligibleClass(classData.name)) {
            throw new Error(
                "Student accounts are available for Classes 1–10 only."
            );
        }

        const username = createUsername(schoolCode, student.admission_no);

        const syntheticEmail =
            `student.${student.id}@accounts.maruticamp.invalid`;

        const temporaryPassword =
            crypto.randomBytes(12).toString("base64url") + "A1!";

        const { data: authData, error: createAuthError } =
            await adminClient.auth.admin.createUser({
                email: syntheticEmail,
                password: temporaryPassword,
                email_confirm: true,
                user_metadata: {
                    role: "student",
                    school_id: schoolId,
                    student_id: student.id,
                    must_change_password: true,
                },
            });

        if (createAuthError || !authData.user) {
            throw new Error(
                createAuthError?.message ||
                "Could not create the student login account."
            );
        }

        createdAuthUserId = authData.user.id;

        const { data: newMembership, error: membershipError } =
            await adminClient
                .from("school_users")
                .insert({
                    school_id: schoolId,
                    user_id: createdAuthUserId,
                    role: "student",
                    status: "active",
                })
                .select("id")
                .single();

        if (membershipError || !newMembership) {
            throw new Error(
                membershipError?.message ||
                "Could not create student school membership."
            );
        }

        createdMembershipId = newMembership.id;

        // Link only if another request has not already linked this student.
        const { data: updatedStudent, error: updateError } =
            await adminClient
                .from("students")
                .update({
                    user_id: createdAuthUserId,
                    login_username: username,
                    must_change_password: true,
                })
                .eq("id", student.id)
                .eq("school_id", schoolId)
                .is("user_id", null)
                .is("login_username", null)
                .select("id")
                .maybeSingle();

        if (updateError || !updatedStudent) {
            throw new Error(
                updateError?.message ||
                "Student account could not be linked. Please try again."
            );
        }

        return {
            studentId: student.id,
            studentName: student.name,
            success: true,
            credentials: {
                schoolCode,
                username,
                temporaryPassword,
            },
        };
    } catch (error) {
        console.error(`Account generation failed for ${studentId}:`, error);

        if (createdMembershipId) {
            await adminClient
                .from("school_users")
                .delete()
                .eq("id", createdMembershipId);
        }

        if (createdAuthUserId) {
            await adminClient.auth.admin.deleteUser(createdAuthUserId);
        }

        return {
            studentId,
            studentName: "",
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Student account could not be created.",
        };
    }
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

        // Support both the existing individual request and new bulk request.
        const isBulkRequest = Array.isArray(body.studentIds);

        const studentIds: string[] = isBulkRequest
            ? [...new Set(
                body.studentIds.filter(
                    (id: unknown): id is string =>
                        typeof id === "string" && id.trim().length > 0
                )
            )]
            : typeof body.studentId === "string"
                ? [body.studentId]
                : [];

        if (studentIds.length === 0) {
            return NextResponse.json(
                { error: "At least one valid student ID is required." },
                { status: 400 }
            );
        }

        if (studentIds.length > 100) {
            return NextResponse.json(
                { error: "You can generate accounts for up to 100 students at a time." },
                { status: 400 }
            );
        }

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

        const { data: school, error: schoolError } = await adminClient
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

        // Process separately so one failure does not cancel other students.
        const results: ProvisionResult[] = [];

        for (const studentId of studentIds) {
            const result = await provisionStudentAccount(
                adminClient,
                studentId,
                schoolId,
                school.school_code
            );

            results.push(result);
        }

        if (!isBulkRequest) {
            const result = results[0];

            if (!result.success) {
                return NextResponse.json(
                    { error: result.error },
                    { status: 400 }
                );
            }

            // Keep the existing individual response format unchanged.
            return NextResponse.json({
                success: true,
                message: "Student account created successfully.",
                credentials: {
                    studentName: result.studentName,
                    ...result.credentials,
                },
            });
        }

        const successful = results.filter((result) => result.success);
        const failed = results.filter((result) => !result.success);

        return NextResponse.json({
            success: failed.length === 0,
            message: "Bulk student account generation completed.",
            summary: {
                total: results.length,
                successful: successful.length,
                failed: failed.length,
            },
            results,
        });
    } catch (error) {
        console.error("Student account generation request failed:", error);

        return NextResponse.json(
            { error: "Student account generation failed. Please try again." },
            { status: 500 }
        );
    }
}
