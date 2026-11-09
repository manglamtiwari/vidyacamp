
// // import { NextRequest, NextResponse } from "next/server";
// // import { createClient } from "@supabase/supabase-js";




// // export async function GET(request: NextRequest) {
// //     try {
// //         const authorization = request.headers.get("Authorization");

// //         if (!authorization?.startsWith("Bearer ")) {
// //             return NextResponse.json(
// //                 { error: "Unauthorized." },
// //                 { status: 401 }
// //             );
// //         }

// //         const token = authorization.substring(7);

// //         const authClient = createClient(
// //             process.env.NEXT_PUBLIC_SUPABASE_URL!,
// //             process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// //         );

// //         const { data: authData, error: authError } =
// //             await authClient.auth.getUser(token);

// //         if (authError || !authData.user) {
// //             return NextResponse.json(
// //                 { error: "Invalid session." },
// //                 { status: 401 }
// //             );
// //         }

// //         const adminClient = createClient(
// //             process.env.NEXT_PUBLIC_SUPABASE_URL!,
// //             process.env.SUPABASE_SECRET_KEY!,
// //             {
// //                 auth: {
// //                     persistSession: false,
// //                     autoRefreshToken: false,
// //                 },
// //             }
// //         );

// //         const { data: membership, error: membershipError } =
// //             await adminClient
// //                 .from("school_users")
// //                 .select("id")
// //                 .eq("user_id", authData.user.id)
// //                 .eq("role", "student")
// //                 .eq("status", "active")
// //                 .maybeSingle();

// //         if (membershipError || !membership) {
// //             return NextResponse.json(
// //                 { error: "Active student membership not found." },
// //                 { status: 403 }
// //             );
// //         }

// //         const { data: student, error: studentError } =
// //             await adminClient
// //                 .from("students")
// //                 .select("must_change_password")
// //                 .eq("user_id", authData.user.id)
// //                 .eq("is_active", true)
// //                 .maybeSingle();

// //         if (studentError || !student) {
// //             return NextResponse.json(
// //                 { error: "Student record not found." },
// //                 { status: 403 }
// //             );
// //         }

// //         return NextResponse.json({
// //             mustChangePassword: student.must_change_password,
// //         });
// //     } catch (error) {
// //         console.error("Student password status check failed:", error);

// //         return NextResponse.json(
// //             { error: "Unable to check password status." },
// //             { status: 500 }
// //         );
// //     }
// // }



// // export async function POST(request: NextRequest) {
// //     try {
// //         const authorization = request.headers.get("Authorization");

// //         if (!authorization?.startsWith("Bearer ")) {
// //             return NextResponse.json(
// //                 { error: "Unauthorized." },
// //                 { status: 401 }
// //             );
// //         }

// //         const token = authorization.substring(7);

// //         // Verify the logged-in user.
// //         const authClient = createClient(
// //             process.env.NEXT_PUBLIC_SUPABASE_URL!,
// //             process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// //         );

// //         const { data: authData, error: authError } =
// //             await authClient.auth.getUser(token);

// //         if (authError || !authData.user) {
// //             return NextResponse.json(
// //                 { error: "Invalid session. Please log in again." },
// //                 { status: 401 }
// //             );
// //         }

// //         const userId = authData.user.id;

// //         // Server-only admin client.
// //         const adminClient = createClient(
// //             process.env.NEXT_PUBLIC_SUPABASE_URL!,
// //             process.env.SUPABASE_SECRET_KEY!,
// //             {
// //                 auth: {
// //                     persistSession: false,
// //                     autoRefreshToken: false,
// //                 },
// //             }
// //         );

// //         // Confirm active student membership.
// //         const { data: membership, error: membershipError } =
// //             await adminClient
// //                 .from("school_users")
// //                 .select("id")
// //                 .eq("user_id", userId)
// //                 .eq("role", "student")
// //                 .eq("status", "active")
// //                 .maybeSingle();

// //         if (membershipError || !membership) {
// //             return NextResponse.json(
// //                 { error: "Active student membership not found." },
// //                 { status: 403 }
// //             );
// //         }

// //         // Confirm that this student must change their password.
// //         const { data: student, error: studentError } =
// //             await adminClient
// //                 .from("students")
// //                 .select("id")
// //                 .eq("user_id", userId)
// //                 .eq("is_active", true)
// //                 .eq("must_change_password", true)
// //                 .maybeSingle();

// //         if (studentError || !student) {
// //             return NextResponse.json(
// //                 { error: "Student password setup could not be verified." },
// //                 { status: 403 }
// //             );
// //         }

// //         // Mark first-login password setup as complete.
// //         // const { data: updatedStudent, error: updateError } =
// //         //     await adminClient
// //         //         .from("students")
// //         //         .update({ must_change_password: false })
// //         //         .eq("id", student.id)
// //         //         .eq("user_id", userId)
// //         //         .eq("must_change_password", true)
// //         //         .select("id")
// //         //         .maybeSingle();

// //         // Complete password setup atomically.
// // // The database function locks the student record and
// // // prevents duplicate completion from multiple tabs.
// // const { data: completed, error: updateError } =
// //     await adminClient.rpc(
// //         "complete_student_password_setup",
// //         {
// //             p_user_id: userId,
// //         }
// //     );

// // if (updateError) {
// //     console.error("Student password completion failed:", updateError);

// //     return NextResponse.json(
// //         { error: "Could not complete password setup." },
// //         { status: 500 }
// //     );
// // }

// // if (!completed) {
// //     return NextResponse.json(
// //         {
// //             success: true,
// //             alreadyCompleted: true,
// //             message: "Password setup was already completed.",
// //         },
// //         { status: 200 }
// //     );
// // }

// //         if (updateError || !updatedStudent) {
// //             console.error("Student password flag update failed:", updateError);

// //             return NextResponse.json(
// //                 { error: "Could not complete password setup." },
// //                 { status: 500 }
// //             );
// //         }

// //         return NextResponse.json({
// //             success: true,
// //             message: "Password setup completed.",
// //         });
// //     } catch (error) {
// //         console.error("Student password completion failed:", error);

// //         return NextResponse.json(
// //             { error: "Unable to complete password setup." },
// //             { status: 500 }
// //         );
// //     }
// // }
























// import { NextRequest, NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// export async function GET(request: NextRequest) {
//     try {
//         const authorization = request.headers.get("Authorization");

//         if (!authorization?.startsWith("Bearer ")) {
//             return NextResponse.json(
//                 { error: "Unauthorized." },
//                 { status: 401 }
//             );
//         }

//         const token = authorization.substring(7);

//         const authClient = createClient(
//             process.env.NEXT_PUBLIC_SUPABASE_URL!,
//             process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//         );

//         const { data: authData, error: authError } =
//             await authClient.auth.getUser(token);

//         if (authError || !authData.user) {
//             return NextResponse.json(
//                 { error: "Invalid session." },
//                 { status: 401 }
//             );
//         }

//         const adminClient = createClient(
//             process.env.NEXT_PUBLIC_SUPABASE_URL!,
//             process.env.SUPABASE_SECRET_KEY!,
//             {
//                 auth: {
//                     persistSession: false,
//                     autoRefreshToken: false,
//                 },
//             }
//         );

//         const { data: membership, error: membershipError } =
//             await adminClient
//                 .from("school_users")
//                 .select("id")
//                 .eq("user_id", authData.user.id)
//                 .eq("role", "student")
//                 .eq("status", "active")
//                 .maybeSingle();

//         if (membershipError || !membership) {
//             return NextResponse.json(
//                 { error: "Active student membership not found." },
//                 { status: 403 }
//             );
//         }

//         const { data: student, error: studentError } =
//             await adminClient
//                 .from("students")
//                 .select("must_change_password")
//                 .eq("user_id", authData.user.id)
//                 .eq("is_active", true)
//                 .maybeSingle();

//         if (studentError || !student) {
//             return NextResponse.json(
//                 { error: "Student record not found." },
//                 { status: 403 }
//             );
//         }

//         return NextResponse.json({
//             mustChangePassword: student.must_change_password,
//         });
//     } catch (error) {
//         console.error("Student password status check failed:", error);

//         return NextResponse.json(
//             { error: "Unable to check password status." },
//             { status: 500 }
//         );
//     }
// }

// export async function POST(request: NextRequest) {
//     try {
//         const authorization = request.headers.get("Authorization");

//         if (!authorization?.startsWith("Bearer ")) {
//             return NextResponse.json(
//                 { error: "Unauthorized." },
//                 { status: 401 }
//             );
//         }

//         const token = authorization.substring(7);

//         // Verify the logged-in user.
//         const authClient = createClient(
//             process.env.NEXT_PUBLIC_SUPABASE_URL!,
//             process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//         );

//         const { data: authData, error: authError } =
//             await authClient.auth.getUser(token);

//         if (authError || !authData.user) {
//             return NextResponse.json(
//                 { error: "Invalid session. Please log in again." },
//                 { status: 401 }
//             );
//         }

//         const userId = authData.user.id;

//         // Server-only admin client.
//         const adminClient = createClient(
//             process.env.NEXT_PUBLIC_SUPABASE_URL!,
//             process.env.SUPABASE_SECRET_KEY!,
//             {
//                 auth: {
//                     persistSession: false,
//                     autoRefreshToken: false,
//                 },
//             }
//         );

//         // Confirm active student membership.
//         const { data: membership, error: membershipError } =
//             await adminClient
//                 .from("school_users")
//                 .select("id")
//                 .eq("user_id", userId)
//                 .eq("role", "student")
//                 .eq("status", "active")
//                 .maybeSingle();

//         if (membershipError || !membership) {
//             return NextResponse.json(
//                 { error: "Active student membership not found." },
//                 { status: 403 }
//             );
//         }

//         // Complete password setup atomically using the database RPC.
//         const { data: completed, error: updateError } =
//             await adminClient.rpc(
//                 "complete_student_password_setup",
//                 {
//                     p_user_id: userId,
//                 }
//             );

//         if (updateError) {
//             console.error(
//                 "Student password completion failed:",
//                 updateError
//             );

//             return NextResponse.json(
//                 { error: "Could not complete password setup." },
//                 { status: 500 }
//             );
//         }

//         // A previous tab may already have completed the setup.
//         if (!completed) {
//             return NextResponse.json(
//                 {
//                     success: true,
//                     alreadyCompleted: true,
//                     message: "Password setup was already completed.",
//                 },
//                 { status: 200 }
//             );
//         }

//         return NextResponse.json({
//             success: true,
//             message: "Password setup completed.",
//         });
//     } catch (error) {
//         console.error("Student password completion failed:", error);

//         return NextResponse.json(
//             { error: "Unable to complete password setup." },
//             { status: 500 }
//         );
//     }
// }






























import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        }
    );
}

async function verifyStudent(token: string) {
    const authClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await authClient.auth.getUser(token);

    if (error || !data.user) {
        return null;
    }

    const adminClient = createAdminClient();

    const { data: membership, error: membershipError } =
        await adminClient
            .from("school_users")
            .select("id")
            .eq("user_id", data.user.id)
            .eq("role", "student")
            .eq("status", "active")
            .maybeSingle();

    if (membershipError || !membership) {
        return null;
    }

    return {
        userId: data.user.id,
        adminClient,
    };
}

// Check whether the student still needs to change their password.
export async function GET(request: NextRequest) {
    try {
        const authorization = request.headers.get("Authorization");

        if (!authorization?.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Unauthorized." },
                { status: 401 }
            );
        }

        const verified = await verifyStudent(
            authorization.substring(7)
        );

        if (!verified) {
            return NextResponse.json(
                { error: "Invalid student session." },
                { status: 403 }
            );
        }

        const { data: student, error } = await verified.adminClient
            .from("students")
            .select("must_change_password")
            .eq("user_id", verified.userId)
            .eq("is_active", true)
            .maybeSingle();

        if (error || !student) {
            return NextResponse.json(
                { error: "Student record not found." },
                { status: 403 }
            );
        }

        return NextResponse.json({
            mustChangePassword: student.must_change_password,
        });
    } catch (error) {
        console.error("Student password status check failed:", error);

        return NextResponse.json(
            { error: "Unable to check password status." },
            { status: 500 }
        );
    }
}

// Claim, complete, or release a password-change attempt.
export async function POST(request: NextRequest) {
    try {
        const authorization = request.headers.get("Authorization");

        if (!authorization?.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Unauthorized." },
                { status: 401 }
            );
        }

        const verified = await verifyStudent(
            authorization.substring(7)
        );

        if (!verified) {
            return NextResponse.json(
                { error: "Invalid student session." },
                { status: 403 }
            );
        }

        const body = await request.json();

        const { action, claimToken } = body;

        if (
            !["claim", "complete", "release"].includes(action) ||
            typeof claimToken !== "string" ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                claimToken
            )
        ) {
            return NextResponse.json(
                { error: "Invalid password setup request." },
                { status: 400 }
            );
        }

        const { adminClient, userId } = verified;

        let functionName: string;

        if (action === "claim") {
            functionName = "claim_student_password_setup";
        } else if (action === "complete") {
            functionName = "complete_student_password_setup";
        } else {
            functionName = "release_student_password_setup";
        }

        const { data, error } = await adminClient.rpc(functionName, {
            p_user_id: userId,
            p_claim_token: claimToken,
        });

        if (error) {
            console.error(
                `Student password ${action} failed:`,
                error
            );

            return NextResponse.json(
                { error: "Could not process password setup." },
                { status: 500 }
            );
        }

        if (!data) {
            if (action === "claim") {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Password change is already in progress in another tab. Please wait.",
                    },
                    { status: 409 }
                );
            }

            return NextResponse.json(
                {
                    success: false,
                    error:
                        action === "complete"
                            ? "Password setup could not be completed. Please try again."
                            : "Password change lock could not be released.",
                },
                { status: 409 }
            );
        }

        return NextResponse.json({
            success: true,
            action,
            message:
                action === "claim"
                    ? "Password change reserved."
                    : action === "complete"
                    ? "Password setup completed."
                    : "Password change lock released.",
        });
    } catch (error) {
        console.error("Student password setup API failed:", error);

        return NextResponse.json(
            { error: "Unable to process password setup." },
            { status: 500 }
        );
    }
}
