"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getUserRole } from "@/lib/getUserRole";

type Teacher = {
    id: string;
    employee_id: string | null;
    name: string;
    phone: string | null;
    email: string | null;
    is_active: boolean;
};

type Student = {
    id: string;
    admission_no: string;
    name: string;
    student_phone: string | null;
    parent_name: string | null;
    parent_phone: string | null;
    is_active: boolean;
};

type Tab = "teachers" | "students";

export default function AdminUsersPage() {
    const router = useRouter();

    const [activeTab, setActiveTab] =
        useState<Tab>("teachers");

    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const [isCheckingAccess, setIsCheckingAccess] =
        useState(true);

    const [isLoading, setIsLoading] =
        useState(true);

    const [isSaving, setIsSaving] =
        useState(false);

    const [showTeacherForm, setShowTeacherForm] =
        useState(false);

    const [teacherName, setTeacherName] =
        useState("");

    const [employeeId, setEmployeeId] =
        useState("");

    const [teacherPhone, setTeacherPhone] =
        useState("");

    const [teacherEmail, setTeacherEmail] =
        useState("");

    // =========================================================
    // ADMIN ACCESS CHECK
    // =========================================================

    useEffect(() => {
        async function checkAdminAccess() {
            const role = await getUserRole();

            if (role !== "admin") {
                if (role === "teacher") {
                    router.replace("/teacher/dashboard");
                } else if (role === "student") {
                    router.replace("/student/dashboard");
                } else {
                    router.replace("/login");
                }

                return;
            }

            setIsCheckingAccess(false);
        }

        checkAdminAccess();
    }, [router]);

    // =========================================================
    // LOAD PEOPLE
    // =========================================================

    async function loadPeople() {
        setIsLoading(true);

        const [teachersResult, studentsResult] =
            await Promise.all([
                supabase
                    .from("teachers")
                    .select(
                        "id, employee_id, name, phone, email, is_active"
                    )
                    .order("name"),

                supabase
                    .from("students")
                    .select(
                        "id, admission_no, name, student_phone, parent_name, parent_phone, is_active"
                    )
                    .order("name"),
            ]);

        if (teachersResult.error) {
            console.error(
                "Could not load teachers:",
                teachersResult.error
            );
        }

        if (studentsResult.error) {
            console.error(
                "Could not load students:",
                studentsResult.error
            );
        }

        setTeachers(teachersResult.data || []);
        setStudents(studentsResult.data || []);

        setIsLoading(false);
    }

    useEffect(() => {
        if (!isCheckingAccess) {
            loadPeople();
        }
    }, [isCheckingAccess]);

    // =========================================================
    // ADD TEACHER
    // =========================================================

    async function handleAddTeacher(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!teacherName.trim()) {
            alert("Teacher name cannot be empty.");
            return;
        }

        setIsSaving(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            console.error("No logged-in user found.");
            setIsSaving(false);
            return;
        }

        const {
            data: membership,
            error: membershipError,
        } = await supabase
            .from("school_users")
            .select("school_id, role")
            .eq("user_id", user.id)
            .eq("status", "active")
            .eq("role", "admin")
            .limit(1)
            .maybeSingle();

        if (membershipError || !membership) {
            console.error(
                "Could not find admin school membership:",
                membershipError
            );

            setIsSaving(false);

            alert(
                "Could not determine your school. Please try again."
            );

            return;
        }

        const { error: teacherError } =
            await supabase
                .from("teachers")
                .insert({
                    school_id:
                        membership.school_id,
                    employee_id:
                        employeeId.trim() || null,
                    name: teacherName.trim(),
                    phone:
                        teacherPhone.trim() || null,
                    email:
                        teacherEmail.trim() || null,
                });

        setIsSaving(false);

        if (teacherError) {
            console.error(
                "Could not save teacher:",
                teacherError
            );

            if (teacherError.code === "23505") {
                alert(
                    "This Employee ID is already being used in this school."
                );
            } else {
                alert(
                    "Could not save teacher. Please try again."
                );
            }

            return;
        }

        setTeacherName("");
        setEmployeeId("");
        setTeacherPhone("");
        setTeacherEmail("");

        setShowTeacherForm(false);

        await loadPeople();
    }

    function handleCancelTeacher() {
        setTeacherName("");
        setEmployeeId("");
        setTeacherPhone("");
        setTeacherEmail("");

        setShowTeacherForm(false);
    }

    // =========================================================
    // ACCESS CHECK SCREEN
    // =========================================================

    if (isCheckingAccess) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>

                <p className="text-gray-500 mt-4">
                    Checking access...
                </p>
            </div>
        );
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div>
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        People
                    </h1>

                    <p className="text-gray-600 mt-1">
                        Manage teachers and students in your school.
                    </p>
                </div>

                {!showTeacherForm && (
                    <button
                        type="button"
                        onClick={() => {
                            if (
                                activeTab ===
                                "teachers"
                            ) {
                                setShowTeacherForm(
                                    true
                                );
                            } else {
                                alert(
                                    "Student creation will be added next."
                                );
                            }
                        }}
                        className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition"
                    >
                        + Add{" "}
                        {activeTab === "teachers"
                            ? "Teacher"
                            : "Student"}
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-8 border-b">
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab("teachers");
                        setShowTeacherForm(false);
                    }}
                    className={`px-5 py-3 font-medium ${
                        activeTab ===
                        "teachers"
                            ? "border-b-2 border-emerald-600 text-emerald-700"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Teachers ({teachers.length})
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setActiveTab("students");
                        setShowTeacherForm(false);
                    }}
                    className={`px-5 py-3 font-medium ${
                        activeTab ===
                        "students"
                            ? "border-b-2 border-emerald-600 text-emerald-700"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Students ({students.length})
                </button>
            </div>

            {/* Add Teacher Form */}
            {showTeacherForm &&
                activeTab === "teachers" && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                        <h2 className="text-xl font-semibold">
                            Add Teacher
                        </h2>

                        <p className="text-gray-500 mt-1">
                            Add teacher information to your school.
                        </p>

                        <form
                            onSubmit={
                                handleAddTeacher
                            }
                            className="mt-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Teacher Name */}
                                <div>
                                    <label
                                        htmlFor="teacherName"
                                        className="block text-sm font-medium mb-2"
                                    >
                                        Teacher Name{" "}
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        id="teacherName"
                                        type="text"
                                        value={
                                            teacherName
                                        }
                                        onChange={(e) =>
                                            setTeacherName(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. Rahul Sharma"
                                        required
                                        className="w-full border rounded-md p-3"
                                    />
                                </div>

                                {/* Employee ID */}
                                <div>
                                    <label
                                        htmlFor="employeeId"
                                        className="block text-sm font-medium mb-2"
                                    >
                                        Employee ID
                                    </label>

                                    <input
                                        id="employeeId"
                                        type="text"
                                        value={
                                            employeeId
                                        }
                                        onChange={(e) =>
                                            setEmployeeId(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. EMP-101"
                                        className="w-full border rounded-md p-3"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label
                                        htmlFor="teacherPhone"
                                        className="block text-sm font-medium mb-2"
                                    >
                                        Phone
                                    </label>

                                    <input
                                        id="teacherPhone"
                                        type="tel"
                                        value={
                                            teacherPhone
                                        }
                                        onChange={(e) =>
                                            setTeacherPhone(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. 9876543210"
                                        className="w-full border rounded-md p-3"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="teacherEmail"
                                        className="block text-sm font-medium mb-2"
                                    >
                                        Email
                                    </label>

                                    <input
                                        id="teacherEmail"
                                        type="email"
                                        value={
                                            teacherEmail
                                        }
                                        onChange={(e) =>
                                            setTeacherEmail(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. teacher@school.com"
                                        className="w-full border rounded-md p-3"
                                    />
                                </div>
                            </div>

                            {/* Form Buttons */}
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={
                                        handleCancelTeacher
                                    }
                                    className="px-5 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving
                                        ? "Saving..."
                                        : "Save Teacher"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

            {/* People List */}
            {!showTeacherForm && (
                <>
                    {isLoading ? (
                        <div className="bg-white rounded-xl shadow-sm p-10 text-center mt-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>

                            <p className="text-gray-500 mt-4">
                                Loading people...
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm mt-6 overflow-hidden">
                            {/* Teachers */}
                            {activeTab ===
                            "teachers" ? (
                                teachers.length ===
                                0 ? (
                                    <div className="p-10 text-center text-gray-500">
                                        No teachers found.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="text-left p-4">
                                                        Employee ID
                                                    </th>

                                                    <th className="text-left p-4">
                                                        Name
                                                    </th>

                                                    <th className="text-left p-4">
                                                        Phone
                                                    </th>

                                                    <th className="text-left p-4">
                                                        Email
                                                    </th>

                                                    <th className="text-left p-4">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {teachers.map(
                                                    (
                                                        teacher
                                                    ) => (
                                                        <tr
                                                            key={
                                                                teacher.id
                                                            }
                                                            className="border-t"
                                                        >
                                                            <td className="p-4">
                                                                {teacher.employee_id ||
                                                                    "-"}
                                                            </td>

                                                            <td className="p-4 font-medium">
                                                                {
                                                                    teacher.name
                                                                }
                                                            </td>

                                                            <td className="p-4">
                                                                {teacher.phone ||
                                                                    "-"}
                                                            </td>

                                                            <td className="p-4">
                                                                {teacher.email ||
                                                                    "-"}
                                                            </td>

                                                            <td className="p-4">
                                                                {teacher.is_active
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            ) : (
                                /* Students */
                                students.length ===
                                0 ? (
                                    <div className="p-10 text-center text-gray-500">
                                        No students found.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="text-left p-4">
                                                        Admission No.
                                                    </th>

                                                    <th className="text-left p-4">
                                                        Name
                                                    </th>

                                                    <th className="text-left p-4">
                                                        Student Phone
                                                    </th>

                                                    <th className="text-left p-4">
                                                        Parent Name
                                                    </th>

                                                    <th className="text-left p-4">
                                                        Parent Phone
                                                    </th>

                                                    <th className="text-left p-4">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {students.map(
                                                    (
                                                        student
                                                    ) => (
                                                        <tr
                                                            key={
                                                                student.id
                                                            }
                                                            className="border-t"
                                                        >
                                                            <td className="p-4">
                                                                {
                                                                    student.admission_no
                                                                }
                                                            </td>

                                                            <td className="p-4 font-medium">
                                                                {
                                                                    student.name
                                                                }
                                                            </td>

                                                            <td className="p-4">
                                                                {
                                                                    student.student_phone ||
                                                                    "-"
                                                                }
                                                            </td>

                                                            <td className="p-4">
                                                                {
                                                                    student.parent_name ||
                                                                    "-"
                                                                }
                                                            </td>

                                                            <td className="p-4">
                                                                {
                                                                    student.parent_phone ||
                                                                    "-"
                                                                }
                                                            </td>

                                                            <td className="p-4">
                                                                {student.is_active
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}