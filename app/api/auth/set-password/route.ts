import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const verifiedUserId =
            cookieStore.get("teacher_verified")?.value;

        if (!verifiedUserId) {
            return NextResponse.json(
                {
                    error:
                        "Teacher verification is required before creating a password.",
                },
                { status: 403 }
            );
        }

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

        if (verifiedUserId !== user.id) {
            return NextResponse.json(
                { error: "Verification session is invalid." },
                { status: 403 }
            );
        }

        const body = await request.json();
        const password = body.password;

        if (!password || password.length < 6) {
            return NextResponse.json(
                {
                    error:
                        "Password must be at least 6 characters.",
                },
                { status: 400 }
            );
        }

        const { error: updateError } =
            await supabase.auth.updateUser({
                password,
            });

        if (updateError) {
            return NextResponse.json(
                { error: updateError.message },
                { status: 400 }
            );
        }

        cookieStore.delete("teacher_verified");

        return NextResponse.json({
            success: true,
            message: "Password created successfully.",
        });
    } catch (error) {
        console.error(
            "Could not set teacher password:",
            error
        );

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}