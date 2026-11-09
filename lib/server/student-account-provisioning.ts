
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

type StudentAccountResult = {
    studentId: string;
    studentName: string;
    schoolCode: string;
    username: string;
    temporaryPassword: string;
};

type ProvisionStudentAccountParams = {
    studentId: string;
    schoolId: string;
    schoolCode: string;
    adminClient: SupabaseClient;
};

function isEligibleClass(className: string): boolean {
    const normalized = className.trim().toLowerCase();

    if (/\b(nursery|lkg|ukg|kg|kindergarten)\b/.test(normalized)) {
        return false;
    }

    const match = normalized.match(/\b(10|[1-9])\b/);

    return Boolean(match);
}

function createUsername(
    schoolCode: string,
    admissionNo: string
): string {
    const cleanSchoolCode = schoolCode
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

    const cleanAdmissionNo = admissionNo
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

    if (!cleanSchoolCode || !cleanAdmissionNo) {
        throw new Error("School code or admission number is invalid.");
    }

    return `${cleanSchoolCode}-${cleanAdmissionNo}`;
}

function generateTemporaryPassword(): string {
    return crypto.randomBytes(12).toString("base64url") + "A1!";
}

export async function provisionStudentAccount({
    studentId,
    schoolId,
    schoolCode,
    adminClient,
}: ProvisionStudentAccountParams): Promise<StudentAccountResult> {
    let authUserId: string | null = null;
    let membershipId: string | null = null;
    let studentLinked = false;

    try {
        // 1. Fetch the student from the admin's school.
        const { data: student, error: studentError } = await adminClient
            .from("students")
            .select(
                "id, school_id, admission_no, name, class_id, user_id, login_username, is_active"
            )
            .eq("id", studentId)
            .eq("school_id", schoolId)
            .maybeSingle();

        if (studentError) throw studentError;

        if (!student) {
            throw new Error("Student not found in your school.");
        }

        if (!student.is_active) {
            throw new Error("Inactive students cannot receive accounts.");
        }

        if (student.user_id || student.login_username) {
            throw new Error("This student already has login details.");
        }

        if (!student.class_id) {
            throw new Error("Assign a class before creating a student account.");
        }

        if (!student.name || !student.admission_no) {
            throw new Error("Student name or admission number is missing.");
        }

        // 2. Verify the student's class belongs to this school.
        const { data: classData, error: classError } = await adminClient
            .from("classes")
            .select("name")
            .eq("id", student.class_id)
            .eq("school_id", schoolId)
            .maybeSingle();

        if (classError) throw classError;

        if (!classData) {
            throw new Error("Could not verify the student's class.");
        }

        if (!isEligibleClass(classData.name)) {
            throw new Error(
                "Student accounts are available for Classes 1–10 only."
            );
        }

        // 3. Generate the student's login credentials.
        const username = createUsername(schoolCode, student.admission_no);

        const syntheticEmail =
            `student.${student.id}@accounts.maruticamp.invalid`;

        const temporaryPassword = generateTemporaryPassword();

        // 4. Create the Supabase Auth account.
        const { data: authData, error: authError } =
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

        if (authError || !authData.user) {
            throw new Error(
                authError?.message || "Could not create student login."
            );
        }

        authUserId = authData.user.id;

        // 5. Create the student's school membership.
        const { data: membership, error: membershipError } =
            await adminClient
                .from("school_users")
                .insert({
                    school_id: schoolId,
                    user_id: authUserId,
                    role: "student",
                    status: "active",
                })
                .select("id")
                .single();

        if (membershipError || !membership) {
            throw new Error(
                membershipError?.message ||
                    "Could not create student school membership."
            );
        }

        membershipId = membership.id;

        // 6. Link the Auth account to the student record.
        const { data: updatedStudent, error: updateError } =
            await adminClient
                .from("students")
                .update({
                    user_id: authUserId,
                    login_username: username,
                    must_change_password: true,
                })
                .eq("id", student.id)
                .eq("school_id", schoolId)
                .is("user_id", null)
                .is("login_username", null)
                .select("id")
                .maybeSingle();

        if (updateError) throw updateError;

        if (!updatedStudent) {
            throw new Error(
                "Student account could not be linked. Please try again."
            );
        }

        studentLinked = true;

        // 7. Return credentials to the admin.
        return {
            studentId: student.id,
            studentName: student.name,
            schoolCode,
            username,
            temporaryPassword,
        };
    } catch (error) {
        // Roll back any partially created records.
        if (studentLinked && authUserId) {
            await adminClient
                .from("students")
                .update({
                    user_id: null,
                    login_username: null,
                    must_change_password: true,
                })
                .eq("id", studentId)
                .eq("school_id", schoolId)
                .eq("user_id", authUserId);
        }

        if (membershipId) {
            await adminClient
                .from("school_users")
                .delete()
                .eq("id", membershipId);
        }

        if (authUserId) {
            await adminClient.auth.admin.deleteUser(authUserId);
        }

        throw error;
    }
}
