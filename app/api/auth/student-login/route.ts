
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const schoolCode =
            typeof body.schoolCode === "string"
                ? body.schoolCode.trim().toUpperCase()
                : "";

        const username =
            typeof body.username === "string"
                ? body.username.trim().toUpperCase()
                : "";

        if (!schoolCode || !username) {
            return NextResponse.json(
                { error: "School Code and Username are required." },
                { status: 400 }
            );
        }

        const adminClient = createClient(
            supabaseUrl,
            supabaseSecretKey,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                },
            }
        );

        // Find the school.
        const { data: school, error: schoolError } =
            await adminClient
                .from("schools")
                .select("id")
                .eq("school_code", schoolCode)
                .maybeSingle();

        if (schoolError || !school) {
            return NextResponse.json(
                { error: "Invalid School Code, Username or Password." },
                { status: 401 }
            );
        }

        // Find an active student with a generated login.
        const { data: student, error: studentError } =
            await adminClient
                .from("students")
                .select("id, user_id")
                .eq("school_id", school.id)
                .eq("login_username", username)
                .eq("is_active", true)
                .not("user_id", "is", null)
                .maybeSingle();

        if (studentError || !student?.user_id) {
            return NextResponse.json(
                { error: "Invalid School Code, Username or Password." },
                { status: 401 }
            );
        }

        // Verify active student membership.
        const { data: membership, error: membershipError } =
            await adminClient
                .from("school_users")
                .select("id")
                .eq("school_id", school.id)
                .eq("user_id", student.user_id)
                .eq("role", "student")
                .eq("status", "active")
                .maybeSingle();

        if (membershipError || !membership) {
            return NextResponse.json(
                { error: "Invalid School Code, Username or Password." },
                { status: 401 }
            );
        }

        // Retrieve the internal synthetic Auth email.
        const { data: authData, error: authError } =
            await adminClient.auth.admin.getUserById(student.user_id);

        const expectedEmail =
            `student.${student.id}@accounts.maruticamp.invalid`;

        if (
            authError ||
            !authData.user ||
            authData.user.email !== expectedEmail
        ) {
            return NextResponse.json(
                { error: "Student login is not configured correctly." },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { email: expectedEmail },
            {
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (error) {
        console.error("Student login lookup failed:", error);

        return NextResponse.json(
            { error: "Unable to process student login." },
            { status: 500 }
        );
    }
}
