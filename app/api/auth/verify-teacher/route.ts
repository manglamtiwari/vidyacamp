import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

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

        const body = await request.json();

        const employeeId = body.employeeId?.trim();
        const dob = body.dob;

        if (!employeeId || !dob) {
            return NextResponse.json(
                { error: "Employee ID and date of birth are required." },
                { status: 400 }
            );
        }

        const { data: teacher, error: teacherError } =
            await supabase
                .from("teachers")
                .select("id, employee_id, dob, user_id")
                .eq("user_id", user.id)
                .maybeSingle();

        if (teacherError) {
            console.error(
                "Could not verify teacher:",
                teacherError
            );

            return NextResponse.json(
                { error: "Could not verify teacher details." },
                { status: 500 }
            );
        }

        if (!teacher) {
            return NextResponse.json(
                { error: "Teacher account not found." },
                { status: 404 }
            );
        }

        if (
            teacher.employee_id !== employeeId ||
            teacher.dob !== dob
        ) {
            return NextResponse.json(
                { error: "Employee ID or date of birth is incorrect." },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();

        cookieStore.set("teacher_verified", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 10 * 60,
        });

        return NextResponse.json({
            success: true,
            message: "Teacher details verified successfully.",
        });
    } catch (error) {
        console.error(
            "Verify teacher error:",
            error
        );

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}