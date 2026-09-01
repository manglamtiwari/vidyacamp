 "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getUserRole } from "@/lib/getUserRole";
import { validatePhone, validateEmail } from "@/lib/validations";

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
    student_email: string | null;
    student_phone: string | null;
    parent_name: string | null;
    parent_phone: string | null;
    parent_email: string | null;
    date_of_birth: string | null;
    gender: string | null;
    class_id: string | null;
    section_id: string | null;
    is_active: boolean;
};

type SchoolClass = {
    id: string;
    name: string;
};

type SchoolSection = {
    id: string;
    class_id: string;
    name: string;
};

type Tab = "teachers" | "students";

function formatDateOfBirth(date: string | null) {
    if (!date) return "-";

    const parts = date.split("-");
    if (parts.length !== 3) return date;

    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
}

export default function AdminUsersPage() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<Tab>("teachers");
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [sections, setSections] = useState<SchoolSection[]>([]);

    const [isCheckingAccess, setIsCheckingAccess] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [showTeacherForm, setShowTeacherForm] = useState(false);
    const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
    const [teacherName, setTeacherName] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [teacherPhone, setTeacherPhone] = useState("");
    const [teacherEmail, setTeacherEmail] = useState("");

    const [showStudentForm, setShowStudentForm] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [admissionNo, setAdmissionNo] = useState("");
    const [studentName, setStudentName] = useState("");
    const [studentEmail, setStudentEmail] = useState("");
    const [studentPhone, setStudentPhone] = useState("");
    const [parentName, setParentName] = useState("");
    const [parentPhone, setParentPhone] = useState("");
    const [parentEmail, setParentEmail] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("");
    const [studentClassId, setStudentClassId] = useState("");
    const [studentSectionId, setStudentSectionId] = useState("");

    // =========================================================
    // ADMIN ACCESS
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
    // LOAD PEOPLE + CURRENT YEAR CLASSES/SECTIONS
    // =========================================================

    async function getAdminSchoolId() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Your session has expired. Please log in again.");
        }

        const { data: membership, error } = await supabase
            .from("school_users")
            .select("school_id")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .eq("status", "active")
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        if (!membership) {
            throw new Error("Could not find your active school membership.");
        }

        return membership.school_id;
    }

    async function loadPeople() {
        setIsLoading(true);

        try {
            const schoolId = await getAdminSchoolId();

            const [
                teachersResult,
                studentsResult,
                yearResult,
            ] = await Promise.all([
                supabase
                    .from("teachers")
                    .select("id, employee_id, name, phone, email, is_active")
                    .eq("school_id", schoolId)
                    .order("name"),

                supabase
                    .from("students")
                    .select(
                        "id, admission_no, name, student_email, student_phone, parent_name, parent_phone, parent_email, date_of_birth, gender, class_id, section_id, is_active"
                    )
                    .eq("school_id", schoolId)
                    .order("name"),

                supabase
                    .from("academic_years")
                    .select("id")
                    .eq("school_id", schoolId)
                    .eq("is_current", true)
                    .eq("is_active", true)
                    .maybeSingle(),
            ]);

            if (teachersResult.error) throw teachersResult.error;
            if (studentsResult.error) throw studentsResult.error;
            if (yearResult.error) throw yearResult.error;

            let classData: SchoolClass[] = [];
            let sectionData: SchoolSection[] = [];

            if (yearResult.data) {
                const { data, error } = await supabase
                    .from("classes")
                    .select("id, name")
                    .eq("school_id", schoolId)
                    .eq("academic_year_id", yearResult.data.id)
                    .eq("is_active", true)
                    .order("display_order")
                    .order("name");

                if (error) throw error;

                classData = data || [];

                const classIds = classData.map((item) => item.id);

                if (classIds.length > 0) {
                    const { data: sectionRows, error: sectionError } =
                        await supabase
                            .from("sections")
                            .select("id, class_id, name")
                            .eq("school_id", schoolId)
                            .eq("is_active", true)
                            .in("class_id", classIds)
                            .order("display_order")
                            .order("name");

                    if (sectionError) throw sectionError;

                    sectionData = sectionRows || [];
                }
            }

            setTeachers(teachersResult.data || []);
            setStudents(studentsResult.data || []);
            setClasses(classData);
            setSections(sectionData);
        } catch (error) {
            console.error("Could not load people:", error);
            alert("Could not load people. Please refresh and try again.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!isCheckingAccess) {
            loadPeople();
        }
    }, [isCheckingAccess]);

    // =========================================================
    // TEACHER FORM
    // =========================================================

    function resetTeacherForm() {
        setTeacherName("");
        setEmployeeId("");
        setTeacherPhone("");
        setTeacherEmail("");
        setEditingTeacherId(null);
        setShowTeacherForm(false);
    }

    async function handleSaveTeacher(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!teacherName.trim()) {
            alert("Teacher name cannot be empty.");
            return;
        }

        const teacherPhoneError = validatePhone(teacherPhone, "Teacher phone number");
        if (teacherPhoneError) {
            alert(teacherPhoneError);
            return;
        }

        const teacherEmailError = validateEmail(teacherEmail, "Teacher email");
        if (teacherEmailError) {
            alert(teacherEmailError);
            return;
        }

        setIsSaving(true);

        try {
            if (editingTeacherId) {
                const { error } = await supabase
                    .from("teachers")
                    .update({
                        employee_id: employeeId.trim() || null,
                        name: teacherName.trim(),
                        phone: teacherPhone.trim() || null,
                        email: teacherEmail.trim() || null,
                    })
                    .eq("id", editingTeacherId);

                if (error) throw error;

                alert("Teacher updated successfully.");
                resetTeacherForm();
                await loadPeople();
                return;
            }

            const schoolId = await getAdminSchoolId();

            const { error } = await supabase
                .from("teachers")
                .insert({
                    school_id: schoolId,
                    employee_id: employeeId.trim() || null,
                    name: teacherName.trim(),
                    phone: teacherPhone.trim() || null,
                    email: teacherEmail.trim() || null,
                });

            if (error) {
                if (error.code === "23505") {
                    alert(
                        "This Employee ID is already being used in this school."
                    );
                    return;
                }
                throw error;
            }

            alert("Teacher added successfully.");
            resetTeacherForm();
            await loadPeople();
        } catch (error) {
            console.error("Could not save teacher:", error);
            alert("Could not save teacher. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    function handleEditTeacher(teacher: Teacher) {
        setEditingTeacherId(teacher.id);
        setTeacherName(teacher.name);
        setEmployeeId(teacher.employee_id || "");
        setTeacherPhone(teacher.phone || "");
        setTeacherEmail(teacher.email || "");
        setShowTeacherForm(true);

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleDeactivateTeacher(teacher: Teacher) {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${teacher.name}?`
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("teachers")
            .update({ is_active: false })
            .eq("id", teacher.id);

        if (error) {
            console.error("Could not deactivate teacher:", error);
            alert("Could not deactivate teacher. Please try again.");
            return;
        }

        alert("Teacher has been deactivated.");
        await loadPeople();
    }

    async function handleRestoreTeacher(teacher: Teacher) {
        const confirmed = window.confirm(
            `Reactivate ${teacher.name}?`
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("teachers")
            .update({ is_active: true })
            .eq("id", teacher.id);

        if (error) {
            console.error("Could not reactivate teacher:", error);
            alert("Could not reactivate teacher. Please try again.");
            return;
        }

        alert("Teacher has been reactivated.");
        await loadPeople();
    }

    // =========================================================
    // STUDENT FORM
    // =========================================================

    function resetStudentForm() {
        setAdmissionNo("");
        setStudentName("");
        setStudentEmail("");
        setStudentPhone("");
        setParentName("");
        setParentPhone("");
        setParentEmail("");
        setDateOfBirth("");
        setGender("");
        setStudentClassId("");
        setStudentSectionId("");
        setEditingStudentId(null);
        setShowStudentForm(false);
    }

    function getSectionsForSelectedClass() {
        return sections.filter(
            (section) => section.class_id === studentClassId
        );
    }

    function validateStudentDetails() {
        const studentPhoneError = validatePhone(studentPhone, "Student phone number");
        if (studentPhoneError) { alert(studentPhoneError); return false; }

        const parentPhoneError = validatePhone(parentPhone, "Parent phone number");
        if (parentPhoneError) { alert(parentPhoneError); return false; }

        const studentEmailError = validateEmail(studentEmail, "Student email");
        if (studentEmailError) { alert(studentEmailError); return false; }

        const parentEmailError = validateEmail(parentEmail, "Parent email");
        if (parentEmailError) { alert(parentEmailError); return false; }

        return true;
    }

    async function handleSaveStudent(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!admissionNo.trim()) {
            alert("Admission number cannot be empty.");
            return;
        }

        if (!studentName.trim()) {
            alert("Student name cannot be empty.");
            return;
        }

        if (!validateStudentDetails()) return;

        setIsSaving(true);

        try {
            if (editingStudentId) {
                const { error } = await supabase
                    .from("students")
                    .update({
                        admission_no: admissionNo.trim(),
                        name: studentName.trim(),
                        student_email: studentEmail.trim() || null,
                        student_phone: studentPhone.trim() || null,
                        parent_name: parentName.trim() || null,
                        parent_phone: parentPhone.trim() || null,
                        parent_email: parentEmail.trim() || null,
                        date_of_birth: dateOfBirth || null,
                        gender: gender || null,
                        class_id: studentClassId || null,
                        section_id: studentSectionId || null,
                    })
                    .eq("id", editingStudentId);

                if (error) {
                    if (error.code === "23505") {
                        alert(
                            "This Admission No. is already being used in this school."
                        );
                        return;
                    }
                    throw error;
                }

                alert("Student updated successfully.");
                resetStudentForm();
                await loadPeople();
                return;
            }

            const schoolId = await getAdminSchoolId();

            const { error } = await supabase
                .from("students")
                .insert({
                    school_id: schoolId,
                    admission_no: admissionNo.trim(),
                    name: studentName.trim(),
                    student_email: studentEmail.trim() || null,
                    student_phone: studentPhone.trim() || null,
                    parent_name: parentName.trim() || null,
                    parent_phone: parentPhone.trim() || null,
                    parent_email: parentEmail.trim() || null,
                    date_of_birth: dateOfBirth || null,
                    gender: gender || null,
                    class_id: studentClassId || null,
                    section_id: studentSectionId || null,
                    is_active: true,
                });

            if (error) {
                if (error.code === "23505") {
                    alert(
                        "This Admission No. is already being used in this school."
                    );
                    return;
                }
                throw error;
            }

            alert("Student added successfully.");
            resetStudentForm();
            await loadPeople();
        } catch (error) {
            console.error("Could not save student:", error);
            alert("Could not save student. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    function handleEditStudent(student: Student) {
        setEditingStudentId(student.id);
        setAdmissionNo(student.admission_no);
        setStudentName(student.name);
        setStudentEmail(student.student_email || "");
        setStudentPhone(student.student_phone || "");
        setParentName(student.parent_name || "");
        setParentPhone(student.parent_phone || "");
        setParentEmail(student.parent_email || "");
        setDateOfBirth(student.date_of_birth || "");
        setGender(student.gender || "");
        setStudentClassId(student.class_id || "");
        setStudentSectionId(student.section_id || "");
        setShowStudentForm(true);

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleDeactivateStudent(student: Student) {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${student.name}?`
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("students")
            .update({ is_active: false })
            .eq("id", student.id);

        if (error) {
            console.error("Could not deactivate student:", error);
            alert("Could not deactivate student. Please try again.");
            return;
        }

        alert("Student has been deactivated.");
        await loadPeople();
    }

    async function handleRestoreStudent(student: Student) {
        const confirmed = window.confirm(
            `Reactivate ${student.name}?`
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("students")
            .update({ is_active: true })
            .eq("id", student.id);

        if (error) {
            console.error("Could not reactivate student:", error);
            alert("Could not reactivate student. Please try again.");
            return;
        }

        alert("Student has been reactivated.");
        await loadPeople();
    }

    // =========================================================
    // ACCESS SCREEN
    // =========================================================

    if (isCheckingAccess) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Checking access...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">People</h1>
                    <p className="text-gray-600 mt-1">
                        Manage teachers and students in your school.
                    </p>
                </div>

                {!showTeacherForm && !showStudentForm && (
                    <button
                        type="button"
                        onClick={() => {
                            if (activeTab === "teachers") {
                                resetStudentForm();
                                setShowTeacherForm(true);
                            } else {
                                resetTeacherForm();
                                setShowStudentForm(true);
                            }
                        }}
                        className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition"
                    >
                        + Add {activeTab === "teachers" ? "Teacher" : "Student"}
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-8 border-b">
                <button
                    type="button"
                    onClick={() => {
                        resetTeacherForm();
                        resetStudentForm();
                        setActiveTab("teachers");
                    }}
                    className={`px-5 py-3 font-medium ${
                        activeTab === "teachers"
                            ? "border-b-2 border-emerald-600 text-emerald-700"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Teachers ({teachers.length})
                </button>

                <button
                    type="button"
                    onClick={() => {
                        resetTeacherForm();
                        resetStudentForm();
                        setActiveTab("students");
                    }}
                    className={`px-5 py-3 font-medium ${
                        activeTab === "students"
                            ? "border-b-2 border-emerald-600 text-emerald-700"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Students ({students.length})
                </button>
            </div>

            {/* =====================================================
                TEACHER FORM
            ====================================================== */}
            {showTeacherForm && activeTab === "teachers" && (
                <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                    <h2 className="text-xl font-semibold">
                        {editingTeacherId ? "Edit Teacher" : "Add Teacher"}
                    </h2>

                    <p className="text-gray-500 mt-1">
                        {editingTeacherId
                            ? "Update teacher information."
                            : "Add teacher information to your school."}
                    </p>

                    <form onSubmit={handleSaveTeacher} className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Teacher Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={teacherName}
                                    onChange={(e) => setTeacherName(e.target.value)}
                                    placeholder="e.g. Rahul Sharma"
                                    required
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Employee ID
                                </label>
                                <input
                                    type="text"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    placeholder="e.g. EMP-101"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={teacherPhone}
                                    onChange={(e) =>
                                        setTeacherPhone(
                                            e.target.value.replace(/\D/g, "").slice(0, 10)
                                        )
                                    }
                                    placeholder="e.g. 9876543210"
                                    className="w-full border rounded-md p-3"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter exactly 10 digits. Numbers may start with 5–9.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={teacherEmail}
                                    onChange={(e) => setTeacherEmail(e.target.value)}
                                    placeholder="e.g. teacher@school.com"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                type="button"
                                onClick={resetTeacherForm}
                                className="px-5 py-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {isSaving
                                    ? "Saving..."
                                    : editingTeacherId
                                        ? "Update Teacher"
                                        : "Save Teacher"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* =====================================================
                STUDENT FORM
            ====================================================== */}
            {showStudentForm && activeTab === "students" && (
                <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                    <h2 className="text-xl font-semibold">
                        {editingStudentId ? "Edit Student" : "Add Student"}
                    </h2>

                    <p className="text-gray-500 mt-1">
                        {editingStudentId
                            ? "Update student information."
                            : "Add student information to your school."}
                    </p>

                    <form onSubmit={handleSaveStudent} className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Admission No. <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={admissionNo}
                                    onChange={(e) => setAdmissionNo(e.target.value)}
                                    placeholder="e.g. ADM-1001"
                                    required
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Student Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    placeholder="e.g. Rahul Sharma"
                                    required
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Student Email
                                </label>
                                <input
                                    type="email"
                                    value={studentEmail}
                                    onChange={(e) => setStudentEmail(e.target.value)}
                                    placeholder="e.g. student@email.com"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Student Phone
                                </label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={studentPhone}
                                    onChange={(e) =>
                                        setStudentPhone(
                                            e.target.value.replace(/\D/g, "").slice(0, 10)
                                        )
                                    }
                                    placeholder="e.g. 9876543210"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Parent Name
                                </label>
                                <input
                                    type="text"
                                    value={parentName}
                                    onChange={(e) => setParentName(e.target.value)}
                                    placeholder="e.g. Rajesh Sharma"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Parent Phone
                                </label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={parentPhone}
                                    onChange={(e) =>
                                        setParentPhone(
                                            e.target.value.replace(/\D/g, "").slice(0, 10)
                                        )
                                    }
                                    placeholder="e.g. 9876543210"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Parent Email
                                </label>
                                <input
                                    type="email"
                                    value={parentEmail}
                                    onChange={(e) => setParentEmail(e.target.value)}
                                    placeholder="e.g. parent@email.com"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Gender
                                </label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full border rounded-md p-3 bg-white"
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Class
                                </label>
                                <select
                                    value={studentClassId}
                                    onChange={(e) => {
                                        setStudentClassId(e.target.value);
                                        setStudentSectionId("");
                                    }}
                                    className="w-full border rounded-md p-3 bg-white"
                                >
                                    <option value="">Not assigned</option>
                                    {classes.map((schoolClass) => (
                                        <option
                                            key={schoolClass.id}
                                            value={schoolClass.id}
                                        >
                                            {schoolClass.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Section
                                </label>
                                <select
                                    value={studentSectionId}
                                    onChange={(e) => setStudentSectionId(e.target.value)}
                                    disabled={!studentClassId}
                                    className="w-full border rounded-md p-3 bg-white disabled:bg-gray-100"
                                >
                                    <option value="">Not assigned</option>
                                    {getSectionsForSelectedClass().map((section) => (
                                        <option key={section.id} value={section.id}>
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                type="button"
                                onClick={resetStudentForm}
                                className="px-5 py-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {isSaving
                                    ? "Saving..."
                                    : editingStudentId
                                        ? "Update Student"
                                        : "Save Student"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* =====================================================
                LIST
            ====================================================== */}
            {!showTeacherForm && !showStudentForm && (
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
                            {activeTab === "teachers" ? (
                                teachers.length === 0 ? (
                                    <div className="p-10 text-center text-gray-500">
                                        No teachers found.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="text-left p-4">Employee ID</th>
                                                    <th className="text-left p-4">Name</th>
                                                    <th className="text-left p-4">Phone</th>
                                                    <th className="text-left p-4">Email</th>
                                                    <th className="text-left p-4">Status</th>
                                                    <th className="text-right p-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {teachers.map((teacher) => (
                                                    <tr key={teacher.id} className="border-t">
                                                        <td className="p-4">
                                                            {teacher.employee_id || "-"}
                                                        </td>
                                                        <td className="p-4 font-medium">
                                                            {teacher.name}
                                                        </td>
                                                        <td className="p-4">
                                                            {teacher.phone || "-"}
                                                        </td>
                                                        <td className="p-4">
                                                            {teacher.email || "-"}
                                                        </td>
                                                        <td className="p-4">
                                                            <span
                                                                className={
                                                                    teacher.is_active
                                                                        ? "text-emerald-700"
                                                                        : "text-gray-500"
                                                                }
                                                            >
                                                                {teacher.is_active
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleEditTeacher(teacher)
                                                                    }
                                                                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                                                                >
                                                                    Edit
                                                                </button>

                                                                {teacher.is_active ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDeactivateTeacher(
                                                                                teacher
                                                                            )
                                                                        }
                                                                        className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                                                                    >
                                                                        Deactivate
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleRestoreTeacher(
                                                                                teacher
                                                                            )
                                                                        }
                                                                        className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                                                    >
                                                                        Activate
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            ) : students.length === 0 ? (
                                <div className="p-10 text-center text-gray-500">
                                    No students found.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1500px]">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left p-4">Admission No.</th>
                                                <th className="text-left p-4">Student Name</th>
                                                <th className="text-left p-4">Student Email</th>
                                                <th className="text-left p-4">Student Phone</th>
                                                <th className="text-left p-4">Parent Name</th>
                                                <th className="text-left p-4">Parent Phone</th>
                                                <th className="text-left p-4">Parent Email</th>
                                                <th className="text-left p-4">Date of Birth</th>
                                                <th className="text-left p-4">Gender</th>
                                                <th className="text-left p-4">Class</th>
                                                <th className="text-left p-4">Section</th>
                                                <th className="text-left p-4">Status</th>
                                                <th className="text-right p-4">Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {students.map((student) => {
                                                const classItem = classes.find(
                                                    (item) => item.id === student.class_id
                                                );
                                                const sectionItem = sections.find(
                                                    (item) => item.id === student.section_id
                                                );

                                                return (
                                                    <tr key={student.id} className="border-t">
                                                        <td className="p-4">
                                                            {student.admission_no}
                                                        </td>
                                                        <td className="p-4 font-medium">
                                                            {student.name}
                                                        </td>
                                                        <td className="p-4">
                                                            {student.student_email || "-"}
                                                        </td>
                                                        <td className="p-4">
                                                            {student.student_phone || "-"}
                                                        </td>
                                                        <td className="p-4">
                                                            {student.parent_name || "-"}
                                                        </td>
                                                        <td className="p-4">
                                                            {student.parent_phone || "-"}
                                                        </td>
                                                        <td className="p-4">
                                                            {student.parent_email || "-"}
                                                        </td>
                                                        <td className="p-4">
                                                            {formatDateOfBirth(student.date_of_birth)}
                                                        </td>
                                                        <td className="p-4">
                                                            {student.gender || "-"}
                                                        </td>
                                                        <td className="p-4">
                                                            {classItem?.name || "-"}
                                                        </td>
                                                        <td className="p-4">
                                                            {sectionItem?.name || "-"}
                                                        </td>
                                                        <td className="p-4">
                                                            <span
                                                                className={
                                                                    student.is_active
                                                                        ? "text-emerald-700"
                                                                        : "text-gray-500"
                                                                }
                                                            >
                                                                {student.is_active
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleEditStudent(student)
                                                                    }
                                                                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                                                                >
                                                                    Edit
                                                                </button>

                                                                {student.is_active ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDeactivateStudent(
                                                                                student
                                                                            )
                                                                        }
                                                                        className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                                                                    >
                                                                        Deactivate
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleRestoreStudent(
                                                                                student
                                                                            )
                                                                        }
                                                                        className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                                                    >
                                                                        Activate
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}