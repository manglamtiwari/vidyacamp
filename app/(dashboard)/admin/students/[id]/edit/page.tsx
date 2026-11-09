
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getUserRole } from "@/lib/getUserRole";
import { validatePhone, validateEmail } from "@/lib/validations";

type Student = Record<string, any>;

type AcademicYearOption = {
    id: string;
    name: string;
};

type ClassOption = {
    id: string;
    name: string;
    academic_year_id: string | null;
};

type SectionOption = {
    id: string;
    name: string;
    class_id: string;
};

type HouseOption = {
    id: string;
    name: string;
};

type StudentDocument = {
    id: string;
    school_id: string;
    student_id: string;
    document_type: string;
    document_name: string;
    file_path: string;
    file_size: number | null;
    mime_type: string | null;
    created_at: string;
};

type Field = {
    key: string;
    label: string;
    type?: "text" | "email" | "tel" | "number" | "date" | "textarea" | "select";
    options?: string[];
    readOnly?: boolean;
};

const sections: { title: string; fields: Field[] }[] = [
    {
        title: "Basic Information",
        fields: [
            { key: "name", label: "Student Name" },
            { key: "admission_no", label: "Admission Number" },
            { key: "registration_no", label: "Registration Number" },
            { key: "date_of_birth", label: "Date of Birth", type: "date" },
            { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
            { key: "blood_group", label: "Blood Group" },
            { key: "nationality", label: "Nationality" },
            { key: "religion", label: "Religion" },
            { key: "category", label: "Category" },
            { key: "caste", label: "Caste" },
            { key: "mother_tongue", label: "Mother Tongue" },
            { key: "aadhaar_number", label: "Aadhaar Number" },
            { key: "apaar_id", label: "APAAR ID" },
            { key: "photo_url", label: "Photo URL" },
        ],
    },
    {
        title: "Contact & Address",
        fields: [
            { key: "student_email", label: "Student Email", type: "email" },
            { key: "student_phone", label: "Student Phone", type: "tel" },
            { key: "student_alternate_phone", label: "Alternate Phone", type: "tel" },
            { key: "current_address", label: "Current Address", type: "textarea" },
            { key: "permanent_address", label: "Permanent Address", type: "textarea" },
        ],
    },
    {
        title: "Academic Information",
        fields: [


            { key: "academic_year_id", label: "Academic Year" },
            { key: "class_id", label: "Class" },
            { key: "section_id", label: "Section" },
            { key: "house_id", label: "House" },

            { key: "roll_number", label: "Roll Number" },
            { key: "stream", label: "Stream" },
            { key: "elective_subjects", label: "Elective Subjects (comma-separated)" },
            { key: "status", label: "Student Status", type: "select", options: ["Active", "Inactive", "Transferred", "Graduated"] },
            { key: "admission_date", label: "Admission Date", type: "date" },
            {
                key: "admission_type",
                label: "Admission Type",
                type: "select",
                options: ["New", "Transfer", "Re-admission"],
            },
        ],
    },
    {
        title: "Parent Information",
        fields: [
            { key: "parent_name", label: "Parent Name" },
            { key: "parent_phone", label: "Parent Phone", type: "tel" },
            { key: "parent_email", label: "Parent Email", type: "email" },
            { key: "father_name", label: "Father's Name" },
            { key: "father_phone", label: "Father's Phone", type: "tel" },
            { key: "father_alternate_phone", label: "Father's Alternate Phone", type: "tel" },
            { key: "father_email", label: "Father's Email", type: "email" },
            { key: "father_occupation", label: "Father's Occupation" },
            { key: "father_qualification", label: "Father's Qualification" },
            { key: "father_aadhaar_number", label: "Father's Aadhaar Number" },
            { key: "father_annual_income", label: "Father's Annual Income", type: "number" },
            { key: "mother_name", label: "Mother's Name" },
            { key: "mother_phone", label: "Mother's Phone", type: "tel" },
            { key: "mother_alternate_phone", label: "Mother's Alternate Phone", type: "tel" },
            { key: "mother_email", label: "Mother's Email", type: "email" },
            { key: "mother_occupation", label: "Mother's Occupation" },
            { key: "mother_qualification", label: "Mother's Qualification" },
            { key: "mother_aadhaar_number", label: "Mother's Aadhaar Number" },
            { key: "mother_annual_income", label: "Mother's Annual Income", type: "number" },
        ],
    },
    {
        title: "Guardian Information",
        fields: [
            { key: "guardian_type", label: "Guardian Type", type: "select", options: ["Father", "Mother", "Separate Guardian"] },
            { key: "guardian_name", label: "Guardian Name" },
            { key: "guardian_relation", label: "Guardian Relationship" },
            { key: "guardian_phone", label: "Guardian Phone", type: "tel" },
            { key: "guardian_alternate_phone", label: "Guardian Alternate Phone", type: "tel" },
            { key: "guardian_email", label: "Guardian Email", type: "email" },
            { key: "guardian_occupation", label: "Guardian Occupation" },
            { key: "guardian_qualification", label: "Guardian Qualification" },
            { key: "guardian_address", label: "Guardian Address", type: "textarea" },
            { key: "is_primary_guardian", label: "Primary Guardian", type: "select", options: ["true", "false"] },
        ],
    },
    {
        title: "Emergency Contact",
        fields: [
            { key: "emergency_contact_type", label: "Contact Type", type: "select", options: ["Father", "Mother", "Other"] },
            { key: "emergency_contact_name", label: "Contact Name" },
            { key: "emergency_contact_phone", label: "Contact Phone", type: "tel" },
            { key: "emergency_contact_alternate_phone", label: "Alternate Phone", type: "tel" },
            { key: "emergency_contact_email", label: "Contact Email", type: "email" },
            { key: "emergency_contact_relation", label: "Relationship" },
            { key: "emergency_contact_address", label: "Address", type: "textarea" },
        ],
    },
    {
        title: "Medical Information",
        fields: [
            { key: "allergies", label: "Allergies", type: "textarea" },
            { key: "medical_conditions", label: "Medical Conditions", type: "textarea" },
            { key: "medications", label: "Medications", type: "textarea" },
            { key: "disabilities", label: "Disabilities", type: "textarea" },
            { key: "dietary_restrictions", label: "Dietary Restrictions", type: "textarea" },
            { key: "special_health_instructions", label: "Special Health Instructions", type: "textarea" },
            { key: "doctor_name", label: "Doctor's Name" },
            { key: "doctor_phone", label: "Doctor's Phone", type: "tel" },
            { key: "doctor_address", label: "Doctor's Address", type: "textarea" },
            { key: "insurance_provider", label: "Insurance Provider" },
            { key: "insurance_policy_no", label: "Insurance Policy Number" },
        ],
    },
    {
        title: "Previous School & Admission",
        fields: [
            { key: "previous_school_name", label: "Previous School" },
            { key: "previous_school_class", label: "Previous Class" },
            { key: "previous_school_board", label: "Previous Board" },
            { key: "previous_school_tc_no", label: "Transfer Certificate Number" },
            { key: "remarks", label: "Remarks", type: "textarea" },
        ],
    },
    {
        title: "Transport Information",
        fields: [
            { key: "uses_transport", label: "Uses Transport", type: "select", options: ["true", "false"] },
            { key: "transport_route", label: "Transport Route" },
            { key: "transport_stop", label: "Transport Stop" },
            { key: "pickup_point", label: "Pickup Point" },
            { key: "drop_point", label: "Drop Point" },
            { key: "transport_fee", label: "Transport Fee", type: "number" },
            { key: "transport_start_date", label: "Transport Start Date", type: "date" },
            { key: "transport_end_date", label: "Transport End Date", type: "date" },
        ],
    },
    {
        title: "Hostel Information",
        fields: [
            { key: "uses_hostel", label: "Uses Hostel", type: "select", options: ["true", "false"] },
            { key: "hostel_name", label: "Hostel Name" },
            { key: "hostel_block", label: "Hostel Block" },
            { key: "hostel_room_no", label: "Hostel Room Number" },
            { key: "hostel_join_date", label: "Hostel Join Date", type: "date" },
            { key: "hostel_leave_date", label: "Hostel Leave Date", type: "date" },
        ],
    },
    {
        title: "Fees & Bank Information",
        fields: [
            { key: "fee_category", label: "Fee Category" },
            { key: "concession_type", label: "Concession Type" },
            { key: "concession_percentage", label: "Concession Percentage", type: "number" },
            { key: "scholarship_name", label: "Scholarship Name" },
            { key: "scholarship_amount", label: "Scholarship Amount", type: "number" },
            { key: "bank_account_no", label: "Bank Account Number" },
            { key: "bank_name", label: "Bank Name" },
            { key: "ifsc", label: "IFSC Code" },
        ],
    },
];

const numericFields = new Set([
    "father_annual_income",
    "mother_annual_income",
    "transport_fee",
    "concession_percentage",
    "scholarship_amount",
]);

const booleanFields = new Set([
    "is_primary_guardian",
    "uses_transport",
    "uses_hostel",
]);

const protectedFields = new Set([
    "id",
    "school_id",
    "created_at",
    "last_updated",
    "is_active",
]);

export default function StudentEditPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params.id as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [form, setForm] = useState<Student>({});
    const [documents, setDocuments] = useState<StudentDocument[]>([]);
    const [newDocuments, setNewDocuments] = useState<
        { id: string; name: string; file: File | null }[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [schoolId, setSchoolId] = useState("");
    const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);

    const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
    const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
    const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);
    const [houseOptions, setHouseOptions] = useState<HouseOption[]>([]);

    const loadDocuments = useCallback(async () => {
        const { data, error } = await supabase
            .from("student_documents")
            .select("*")
            .eq("student_id", studentId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        setDocuments((data || []) as StudentDocument[]);
    }, [studentId]);

    useEffect(() => {
        let cancelled = false;

        async function loadPage() {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const role = await getUserRole();

                if (role !== "admin") {
                    router.replace(
                        role === "teacher"
                            ? "/teacher/dashboard"
                            : role === "student"
                                ? "/student/dashboard"
                                : "/login"
                    );
                    return;
                }

                const {
                    data: { user },
                    error: authError,
                } = await supabase.auth.getUser();

                if (authError) throw authError;
                if (!user) throw new Error("Please log in again.");

                const { data: membership, error: membershipError } =
                    await supabase
                        .from("school_users")
                        .select("school_id")
                        .eq("user_id", user.id)
                        .eq("role", "admin")
                        .eq("status", "active")
                        .limit(1)
                        .maybeSingle();

                if (membershipError) throw membershipError;
                if (!membership) {
                    throw new Error("Active school membership not found.");
                }

                const { data, error } = await supabase
                    .from("students")
                    .select("*")
                    .eq("id", studentId)
                    .eq("school_id", membership.school_id)
                    .maybeSingle();

                if (error) throw error;
                if (!data) {
                    throw new Error(
                        "Student not found in your school, or you do not have permission to edit this record."
                    );
                }

                if (cancelled) return;

                const [
                    academicYearsResult,
                    classesResult,
                    sectionsResult,
                    housesResult,
                ] = await Promise.all([
                    supabase
                        .from("academic_years")
                        .select("id, name")
                        .eq("school_id", membership.school_id)
                        .order("name"),

                    supabase
                        .from("classes")
                        .select("id, name, academic_year_id")
                        .eq("school_id", membership.school_id)
                        .order("display_order"),

                    supabase
                        .from("sections")
                        .select("id, name, class_id")
                        .eq("school_id", membership.school_id)
                        .order("display_order"),

                    supabase
                        .from("houses")
                        .select("id, name")
                        .eq("school_id", membership.school_id)
                        .order("name"),
                ]);

                if (academicYearsResult.error) throw academicYearsResult.error;
                if (classesResult.error) throw classesResult.error;
                if (sectionsResult.error) throw sectionsResult.error;
                if (housesResult.error) throw housesResult.error;

                if (cancelled) return;

                setAcademicYears(academicYearsResult.data || []);
                setClassOptions(classesResult.data || []);
                setSectionOptions(sectionsResult.data || []);
                setHouseOptions(housesResult.data || []);


                setSchoolId(membership.school_id);
                setStudent(data);
                setSameAsCurrentAddress(
                    Boolean(
                        data.current_address &&
                        data.current_address === data.permanent_address
                    )
                );

                setForm({
                    ...data,
                    elective_subjects: Array.isArray(data.elective_subjects)
                        ? data.elective_subjects.join(", ")
                        : data.elective_subjects || "",
                });

                await loadDocuments();
            } catch (error) {
                console.error("Error loading student editor:", error);
                if (!cancelled) {
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "Could not load the student."
                    );
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        if (studentId) loadPage();

        return () => {
            cancelled = true;
        };
    }, [studentId, router, loadDocuments]);

    function updateField(key: string, value: unknown) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    function getDatabaseValue(key: string, value: unknown) {
        if (value === "" || value === undefined) return null;

        if (numericFields.has(key)) {
            return value === null ? null : Number(value);
        }

        if (booleanFields.has(key)) {
            return value === true || value === "true";
        }

        if (key === "elective_subjects") {
            const subjects = String(value)
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

            return subjects.length ? subjects : null;
        }

        if (key === "ifsc") {
            return String(value).trim().toUpperCase() || null;
        }

        return value;
    }

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!form.admission_no?.trim()) {
            alert("Admission number cannot be empty.");
            return;
        }

        if (!form.name?.trim()) {
            alert("Student name cannot be empty.");
            return;
        }

        for (const [key, label] of [
            ["student_phone", "Student phone"],
            ["parent_phone", "Parent phone"],
            ["father_phone", "Father's phone"],
            ["mother_phone", "Mother's phone"],
            ["guardian_phone", "Guardian phone"],
            ["emergency_contact_phone", "Emergency contact phone"],
        ]) {
            const value = String(form[key] || "");
            if (value.trim()) {
                const error = validatePhone(value, label);
                if (error) {
                    alert(error);
                    return;
                }
            }
        }

        for (const [key, label] of [
            ["student_email", "Student email"],
            ["parent_email", "Parent email"],
            ["father_email", "Father's email"],
            ["mother_email", "Mother's email"],
            ["guardian_email", "Guardian email"],
            ["emergency_contact_email", "Emergency contact email"],
        ]) {
            const value = String(form[key] || "");
            if (value.trim()) {
                const error = validateEmail(value, label);
                if (error) {
                    alert(error);
                    return;
                }
            }
        }

        setIsSaving(true);

        try {
            const update: Student = {};

            for (const section of sections) {
                for (const field of section.fields) {
                    if (field.readOnly || protectedFields.has(field.key)) continue;

                    update[field.key] = getDatabaseValue(
                        field.key,
                        form[field.key]
                    );
                }
            }

            // Keep the existing active/inactive flag unchanged.
            const { error } = await supabase
                .from("students")
                .update(update)
                .eq("id", studentId)
                .eq("school_id", schoolId);

            if (error) {
                if (error.code === "23505") {
                    throw new Error(
                        "That admission or registration number may already be in use."
                    );
                }
                throw error;
            }

            alert("Student updated successfully.");
            router.push(`/admin/students/${studentId}`);
            router.refresh();
        } catch (error) {
            console.error("Error saving student:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Could not save student changes."
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function uploadDocuments() {
        const pending = newDocuments.filter(
            (item) => item.name.trim() && item.file
        );

        if (!pending.length) {
            alert("Enter a document name and choose a file.");
            return;
        }

        if (
            newDocuments.some((item) => !item.name.trim() || !item.file) &&
            !window.confirm(
                "Some document rows are incomplete. Upload the completed rows only?"
            )
        ) {
            return;
        }

        setIsUploading(true);
        const successfulIds: string[] = [];

        try {
            for (const item of pending) {
                const file = item.file!;
                if (file.size > 10 * 1024 * 1024) {
                    alert(`${file.name} exceeds the 10 MB limit.`);
                    continue;
                }

                const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
                const path = `${schoolId}/${studentId}/${crypto.randomUUID()}-${safeName}`;

                const { error: uploadError } = await supabase.storage
                    .from("student-documents")
                    .upload(path, file, {
                        upsert: false,
                        contentType: file.type || "application/octet-stream",
                    });

                if (uploadError) {
                    console.error(uploadError);
                    alert(`Could not upload ${file.name}.`);
                    continue;
                }

                const { error: insertError } = await supabase
                    .from("student_documents")
                    .insert({
                        school_id: schoolId,
                        student_id: studentId,
                        document_type: "other",
                        document_name: item.name.trim(),
                        file_path: path,
                        file_size: file.size,
                        mime_type: file.type || null,
                    });

                if (insertError) {
                    await supabase.storage
                        .from("student-documents")
                        .remove([path]);
                    console.error(insertError);
                    alert(`Could not save the record for ${file.name}.`);
                    continue;
                }

                successfulIds.push(item.id);
            }

            setNewDocuments((current) =>
                current.filter((item) => !successfulIds.includes(item.id))
            );

            await loadDocuments();

            if (successfulIds.length) {
                alert(`${successfulIds.length} document(s) uploaded successfully.`);
            }
        } catch (error) {
            console.error("Document upload error:", error);
            alert("An error occurred while uploading documents.");
        } finally {
            setIsUploading(false);
        }
    }

    async function openDocument(path: string) {
        const { data, error } = await supabase.storage
            .from("student-documents")
            .createSignedUrl(path, 60);

        if (error || !data?.signedUrl) {
            alert("Could not open this document.");
            return;
        }

        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    }

    async function deleteDocument(document: StudentDocument) {
        if (!window.confirm(`Delete "${document.document_name}"?`)) return;

        try {
            const { error: storageError } = await supabase.storage
                .from("student-documents")
                .remove([document.file_path]);

            if (storageError) throw storageError;

            const { error: rowError } = await supabase
                .from("student_documents")
                .delete()
                .eq("id", document.id)
                .eq("student_id", studentId)
                .eq("school_id", schoolId);

            if (rowError) throw rowError;

            setDocuments((current) =>
                current.filter((item) => item.id !== document.id)
            );
            alert("Document deleted.");
        } catch (error) {
            console.error("Delete document error:", error);
            alert("Could not delete this document.");
        }
    }

    if (isLoading) {
        return <div className="p-6 text-gray-500">Loading student editor...</div>;
    }

    if (!student) {
        return (
            <div className="p-6">
                <div className="rounded-xl border bg-white p-6">
                    <p className="text-red-600">
                        {errorMessage || "Student could not be loaded."}
                    </p>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mt-4 rounded-lg border px-4 py-2"
                    >
                        Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Edit Student
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {student.name} · Admission No. {student.admission_no}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => router.push("/admin/users")}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                >
                    Back
                </button>

            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {sections.map((section) => (
                    <section
                        key={section.title}
                        className="rounded-xl border border-gray-200 bg-white p-5 md:p-6"
                    >
                        <h2 className="mb-6 border-b border-gray-100 pb-3 text-lg font-semibold text-gray-900">
                            {section.title}
                        </h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {section.fields.map((field) => {
                                const value = form[field.key];
                                const availableClasses = classOptions.filter(
                                    (item) =>
                                        !form.academic_year_id ||
                                        !item.academic_year_id ||
                                        item.academic_year_id === form.academic_year_id
                                );

                                const availableSections = sectionOptions.filter(
                                    (item) => item.class_id === form.class_id
                                );

                                return (
                                    <div
                                        key={field.key}
                                        className={
                                            field.type === "textarea"
                                                ? "md:col-span-2"
                                                : ""
                                        }
                                    >






                                        {field.key === "permanent_address" && (
                                            <div className="mb-3 flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="sameAsCurrentAddress"
                                                    checked={sameAsCurrentAddress}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setSameAsCurrentAddress(checked);

                                                        if (checked) {
                                                            updateField(
                                                                "permanent_address",
                                                                form.current_address || ""
                                                            );
                                                        }
                                                    }}
                                                    className="h-4 w-4"
                                                />

                                                <label
                                                    htmlFor="sameAsCurrentAddress"
                                                    className="text-sm font-medium text-gray-700"
                                                >
                                                    Same as Current Address
                                                </label>
                                            </div>
                                        )}










                                        <label
                                            htmlFor={field.key}
                                            className="mb-2 block text-sm font-medium text-gray-700"
                                        >
                                            {field.label}
                                        </label>

                                        {/* { field.type === "textarea" ? ( */}

                                        {field.key === "academic_year_id" ? (
                                            <select
                                                id={field.key}
                                                value={value ?? ""}
                                                onChange={(e) => {
                                                    updateField("academic_year_id", e.target.value);
                                                    updateField("class_id", "");
                                                    updateField("section_id", "");
                                                }}
                                                className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-emerald-500"
                                            >
                                                <option value="">Select Academic Year</option>
                                                {academicYears.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : field.key === "class_id" ? (
                                            <select
                                                id={field.key}
                                                value={value ?? ""}
                                                onChange={(e) => {
                                                    updateField("class_id", e.target.value);
                                                    updateField("section_id", "");
                                                }}
                                                className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-emerald-500"
                                            >
                                                <option value="">Select Class</option>
                                                {availableClasses.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : field.key === "section_id" ? (
                                            <select
                                                id={field.key}
                                                value={value ?? ""}
                                                onChange={(e) => updateField("section_id", e.target.value)}
                                                disabled={!form.class_id}
                                                className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-emerald-500 disabled:bg-gray-100"
                                            >
                                                <option value="">Select Section</option>
                                                {availableSections.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : field.key === "house_id" ? (
                                            <select
                                                id={field.key}
                                                value={value ?? ""}
                                                onChange={(e) => updateField("house_id", e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-emerald-500"
                                            >
                                                <option value="">Select House</option>
                                                {houseOptions.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : field.type === "textarea" ? (
                                            <textarea
                                                id={field.key}
                                                value={value ?? ""}
                                                onChange={(e) =>
                                                    updateField(
                                                        field.key,
                                                        e.target.value
                                                    )
                                                }
                                                rows={3}
                                                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                            />
                                        ) : field.type === "select" ? (
                                            <select
                                                id={field.key}
                                                value={
                                                    booleanFields.has(field.key)
                                                        ? String(value ?? false)
                                                        : value ?? ""
                                                }
                                                onChange={(e) =>
                                                    updateField(
                                                        field.key,
                                                        booleanFields.has(field.key)
                                                            ? e.target.value === "true"
                                                            : e.target.value
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-emerald-500"
                                            >
                                                <option value="">
                                                    Select {field.label}
                                                </option>
                                                {field.options?.map((option) => (
                                                    <option
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option === "true"
                                                            ? "Yes"
                                                            : option === "false"
                                                                ? "No"
                                                                : option}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                id={field.key}
                                                type={field.type || "text"}
                                                value={value ?? ""}
                                                onChange={(e) =>
                                                    updateField(
                                                        field.key,
                                                        e.target.value
                                                    )
                                                }
                                                min={
                                                    field.type === "number"
                                                        ? 0
                                                        : undefined
                                                }
                                                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}

                <section className="rounded-xl border border-gray-200 bg-white p-5 md:p-6">
                    <h2 className="mb-2 text-lg font-semibold text-gray-900">
                        Student Documents
                    </h2>
                    <p className="mb-5 text-sm text-gray-500">
                        Upload PDF, JPG, or PNG files up to 10 MB each.
                    </p>

                    <div className="space-y-4">
                        {documents.map((document) => (
                            <div
                                key={document.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4"
                            >
                                <div className="min-w-0">
                                    <p className="break-words font-medium text-gray-900">
                                        {document.document_name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {document.document_type} ·{" "}
                                        {document.file_size
                                            ? `${(document.file_size / 1024).toFixed(1)} KB`
                                            : "Size unavailable"}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openDocument(document.file_path)
                                        }
                                        className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                                    >
                                        View
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteDocument(document)}
                                        className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}

                        {documents.length === 0 && (
                            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                                No documents uploaded yet.
                            </p>
                        )}
                    </div>

                    <div className="mt-6 space-y-4 border-t border-gray-100 pt-5">
                        {newDocuments.map((item) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-1 items-end gap-3 md:grid-cols-2"
                            >
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Document Name
                                    </label>
                                    <input
                                        value={item.name}
                                        onChange={(e) =>
                                            setNewDocuments((current) =>
                                                current.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                            ...row,
                                                            name: e.target.value,
                                                        }
                                                        : row
                                                )
                                            )
                                        }
                                        placeholder="e.g. Transfer Certificate"
                                        className="w-full rounded-lg border border-gray-300 p-3"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            const file =
                                                e.currentTarget.files?.[0] || null;

                                            if (
                                                file &&
                                                file.size > 10 * 1024 * 1024
                                            ) {
                                                alert(
                                                    "File size must not exceed 10 MB."
                                                );
                                                e.currentTarget.value = "";
                                                return;
                                            }

                                            setNewDocuments((current) =>
                                                current.map((row) =>
                                                    row.id === item.id
                                                        ? { ...row, file }
                                                        : row
                                                )
                                            );
                                        }}
                                        className="min-w-0 flex-1 rounded-lg border border-gray-300 p-2 text-sm"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setNewDocuments((current) =>
                                                current.filter(
                                                    (row) => row.id !== item.id
                                                )
                                            )
                                        }
                                        className="rounded-lg border px-3 text-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setNewDocuments((current) => [
                                        ...current,
                                        {
                                            id: crypto.randomUUID(),
                                            name: "",
                                            file: null,
                                        },
                                    ])
                                }
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm hover:bg-gray-50"
                            >
                                + Add Document
                            </button>

                            <button
                                type="button"
                                disabled={
                                    isUploading ||
                                    !newDocuments.some(
                                        (item) => item.name.trim() && item.file
                                    )
                                }
                                onClick={uploadDocuments}
                                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isUploading ? "Uploading..." : "Upload Documents"}
                            </button>
                        </div>
                    </div>
                </section>

                <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-gray-200 bg-gray-50/95 py-4 backdrop-blur">

                    <button
                        type="button"
                        onClick={() => router.push("/admin/users")}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>



                    <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSaving ? "Saving Changes..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
