
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Student = Record<string, any>;

function Detail({
    label,
    value,
}: {
    label: string;
    value: unknown;
}) {
    const displayValue =
        value === null || value === undefined || value === ""
            ? "Not provided"
            : typeof value === "boolean"
                ? value
                    ? "Yes"
                    : "No"
                : Array.isArray(value)
                    ? value.join(", ") || "Not provided"
                    : String(value);

    return (
        <div className="min-w-0">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 break-words font-medium text-gray-900">
                {displayValue}
            </p>
        </div>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
                {title}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {children}
            </div>
        </section>
    );
}

function formatDateTime(value: unknown) {
    if (!value) return "Not provided";

    const date = new Date(String(value));

    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
    }).format(date);
}

function formatDate(value: unknown) {
    if (!value) return "Not provided";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return String(value);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

export default function StudentProfilePage() {
    const params = useParams();
    const router = useRouter();

    const studentId = params.id as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadStudent() {
            setIsLoading(true);
            setErrorMessage("");

            const { data, error } = await supabase
                .from("students")
                .select("*")
                .eq("id", studentId)
                .maybeSingle();

            if (!isMounted) return;

            if (error) {
                console.error("Error loading student:", error);
                setErrorMessage("Unable to load the student profile.");
                setStudent(null);
            } else if (!data) {
                setErrorMessage("Student not found.");
                setStudent(null);
                // } else {
                //     setStudent(data);
                // }


            } else {
                const [
                    classResult,
                    sectionResult,
                    academicYearResult,
                    houseResult,
                ] = await Promise.all([
                    data.class_id
                        ? supabase
                            .from("classes")
                            .select("name")
                            .eq("id", data.class_id)
                            .eq("school_id", data.school_id)
                            .maybeSingle()
                        : Promise.resolve({ data: null }),

                    data.section_id
                        ? supabase
                            .from("sections")
                            .select("name")
                            .eq("id", data.section_id)
                            .eq("school_id", data.school_id)
                            .maybeSingle()
                        : Promise.resolve({ data: null }),

                    data.academic_year_id
                        ? supabase
                            .from("academic_years")
                            .select("name")
                            .eq("id", data.academic_year_id)
                            .eq("school_id", data.school_id)
                            .maybeSingle()
                        : Promise.resolve({ data: null }),

                    data.house_id
                        ? supabase
                            .from("houses")
                            .select("name")
                            .eq("id", data.house_id)
                            .eq("school_id", data.school_id)
                            .maybeSingle()
                        : Promise.resolve({ data: null }),
                ]);

                if (!isMounted) return;

                setStudent({
                    ...data,
                    class_name: classResult.data?.name,
                    section_name: sectionResult.data?.name,
                    academic_year_name: academicYearResult.data?.name,
                    house_name: houseResult.data?.name,
                });
            }




            setIsLoading(false);
        }

        if (studentId) {
            loadStudent();
        } else {
            setErrorMessage("Invalid student ID.");
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [studentId]);

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="rounded-xl border border-gray-200 bg-white p-8">
                    <p className="text-gray-500">Loading student profile...</p>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="p-6">
                <div className="rounded-xl border border-gray-200 bg-white p-8">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Student Profile
                    </h1>
                    <p className="mt-3 text-red-600">
                        {errorMessage || "Student not found."}
                    </p>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mt-5 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                    >
                        Back
                    </button>
                </div>
            </div>
        );
    }

    const fullName = student.name || "Student Profile";

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Page heading */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                    {student.photo_url ? (
                        <img
                            src={student.photo_url}
                            alt={fullName}
                            className="h-16 w-16 shrink-0 rounded-full border border-gray-200 object-cover"
                        />
                    ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xl font-semibold text-emerald-700">
                            {fullName.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div className="min-w-0">
                        <h1 className="break-words text-2xl font-bold text-gray-900">
                            {fullName}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Admission No.: {student.admission_no || "Not provided"}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Status:{" "}
                            <span
                                className={
                                    student.is_active
                                        ? "font-medium text-emerald-700"
                                        : "font-medium text-red-600"
                                }
                            >
                                {student.is_active ? "Active" : "Inactive"}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            router.push(`/admin/students/${studentId}/edit`)
                        }
                        className="rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
                    >
                        Edit Profile
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-700 transition hover:bg-gray-50"
                    >
                        Back
                    </button>
                </div>
            </div>

            {/* Personal information */}
            <Section title="Personal Information">
                <Detail label="Full Name" value={student.name} />
                <Detail label="Registration No." value={student.registration_no} />
                <Detail label="Admission No." value={student.admission_no} />
                <Detail label="Date of Birth" value={formatDate(student.date_of_birth)} />
                <Detail label="Gender" value={student.gender} />
                <Detail label="Blood Group" value={student.blood_group} />
                <Detail label="Nationality" value={student.nationality} />
                <Detail label="Religion" value={student.religion} />
                <Detail label="Category" value={student.category} />
                <Detail label="Caste" value={student.caste} />
                <Detail label="Mother Tongue" value={student.mother_tongue} />
                <Detail label="Aadhaar Number" value={student.aadhaar_number} />
                <Detail label="APAAR ID" value={student.apaar_id} />
            </Section>

            {/* Contact information */}
            <Section title="Contact Information">
                <Detail label="Student Email" value={student.student_email} />
                <Detail label="Student Phone" value={student.student_phone} />
                <Detail
                    label="Alternate Phone"
                    value={student.student_alternate_phone}
                />
                <Detail label="Current Address" value={student.current_address} />
                <Detail
                    label="Permanent Address"
                    value={student.permanent_address}
                />
            </Section>

            {/* Academic information */}
            <Section title="Academic Information">
                <Detail label="Roll Number" value={student.roll_number} />
                {/* <Detail label="Class ID" value={student.class_id} />
                <Detail label="Section ID" value={student.section_id} />
                <Detail label="Academic Year ID" value={student.academic_year_id} />
                <Detail label="House ID" value={student.house_id} /> */}
                <Detail label="Class" value={student.class_name} />
                <Detail label="Section" value={student.section_name} />
                <Detail label="Academic Year" value={student.academic_year_name} />
                <Detail label="House" value={student.house_name} />
                <Detail label="Stream" value={student.stream} />
                <Detail
                    label="Elective Subjects"
                    value={student.elective_subjects}
                />
                <Detail label="Student Status" value={student.status} />
                <Detail label="Active Account" value={student.is_active} />
                <Detail label="Admission Date" value={formatDate(student.admission_date)} />
                <Detail label="Admission Type" value={student.admission_type} />
            </Section>

            {/* Parent information */}
            <Section title="Parent Information">
                <Detail label="Parent Name" value={student.parent_name} />
                <Detail label="Parent Phone" value={student.parent_phone} />
                <Detail label="Parent Email" value={student.parent_email} />

                <Detail label="Father's Name" value={student.father_name} />
                <Detail label="Father's Phone" value={student.father_phone} />
                <Detail
                    label="Father's Alternate Phone"
                    value={student.father_alternate_phone}
                />
                <Detail label="Father's Email" value={student.father_email} />
                <Detail
                    label="Father's Occupation"
                    value={student.father_occupation}
                />
                <Detail
                    label="Father's Qualification"
                    value={student.father_qualification}
                />
                <Detail
                    label="Father's Aadhaar"
                    value={student.father_aadhaar_number}
                />
                <Detail
                    label="Father's Annual Income"
                    value={student.father_annual_income}
                />

                <Detail label="Mother's Name" value={student.mother_name} />
                <Detail label="Mother's Phone" value={student.mother_phone} />
                <Detail
                    label="Mother's Alternate Phone"
                    value={student.mother_alternate_phone}
                />
                <Detail label="Mother's Email" value={student.mother_email} />
                <Detail
                    label="Mother's Occupation"
                    value={student.mother_occupation}
                />
                <Detail
                    label="Mother's Qualification"
                    value={student.mother_qualification}
                />
                <Detail
                    label="Mother's Aadhaar"
                    value={student.mother_aadhaar_number}
                />
                <Detail
                    label="Mother's Annual Income"
                    value={student.mother_annual_income}
                />
            </Section>

            {/* Guardian information */}
            <Section title="Guardian Information">
                <Detail label="Guardian Type" value={student.guardian_type} />
                <Detail label="Guardian Name" value={student.guardian_name} />
                <Detail label="Relationship" value={student.guardian_relation} />
                <Detail label="Guardian Phone" value={student.guardian_phone} />
                <Detail
                    label="Guardian Alternate Phone"
                    value={student.guardian_alternate_phone}
                />
                <Detail label="Guardian Email" value={student.guardian_email} />
                <Detail
                    label="Guardian Occupation"
                    value={student.guardian_occupation}
                />
                <Detail
                    label="Guardian Qualification"
                    value={student.guardian_qualification}
                />
                <Detail
                    label="Guardian Address"
                    value={student.guardian_address}
                />
                <Detail
                    label="Primary Guardian"
                    value={student.is_primary_guardian}
                />
            </Section>

            {/* Emergency contact */}
            <Section title="Emergency Contact">
                <Detail
                    label="Contact Type"
                    value={student.emergency_contact_type}
                />
                <Detail
                    label="Contact Name"
                    value={student.emergency_contact_name}
                />
                <Detail
                    label="Relationship"
                    value={student.emergency_contact_relation}
                />
                <Detail
                    label="Phone"
                    value={student.emergency_contact_phone}
                />
                <Detail
                    label="Alternate Phone"
                    value={student.emergency_contact_alternate_phone}
                />
                <Detail
                    label="Email"
                    value={student.emergency_contact_email}
                />
                <Detail
                    label="Address"
                    value={student.emergency_contact_address}
                />
            </Section>

            {/* Medical information */}
            <Section title="Medical Information">
                <Detail label="Allergies" value={student.allergies} />
                <Detail
                    label="Medical Conditions"
                    value={student.medical_conditions}
                />
                <Detail label="Medications" value={student.medications} />
                <Detail label="Disabilities" value={student.disabilities} />
                <Detail
                    label="Dietary Restrictions"
                    value={student.dietary_restrictions}
                />
                <Detail
                    label="Special Health Instructions"
                    value={student.special_health_instructions}
                />
                <Detail label="Doctor's Name" value={student.doctor_name} />
                <Detail label="Doctor's Phone" value={student.doctor_phone} />
                <Detail label="Doctor's Address" value={student.doctor_address} />
                <Detail
                    label="Insurance Provider"
                    value={student.insurance_provider}
                />
                <Detail
                    label="Insurance Policy No."
                    value={student.insurance_policy_no}
                />
            </Section>

            {/* Previous school */}
            <Section title="Previous School Information">
                <Detail
                    label="Previous School"
                    value={student.previous_school_name}
                />
                <Detail
                    label="Previous Class"
                    value={student.previous_school_class}
                />
                <Detail
                    label="Previous Board"
                    value={student.previous_school_board}
                />
                <Detail
                    label="Transfer Certificate No."
                    value={student.previous_school_tc_no}
                />
            </Section>

            {/* Transport */}
            <Section title="Transport Information">
                <Detail label="Uses Transport" value={student.uses_transport} />
                <Detail label="Transport Route" value={student.transport_route} />
                <Detail label="Transport Stop" value={student.transport_stop} />
                <Detail label="Pickup Point" value={student.pickup_point} />
                <Detail label="Drop Point" value={student.drop_point} />
                <Detail label="Transport Fee" value={student.transport_fee} />
                <Detail
                    label="Transport Start Date"
                    value={student.transport_start_date}
                />
                <Detail
                    label="Transport End Date"
                    value={student.transport_end_date}
                />
            </Section>

            {/* Hostel */}
            <Section title="Hostel Information">
                <Detail label="Uses Hostel" value={student.uses_hostel} />
                <Detail label="Hostel Name" value={student.hostel_name} />
                <Detail label="Hostel Block" value={student.hostel_block} />
                <Detail label="Hostel Room No." value={student.hostel_room_no} />
                <Detail label="Hostel Join Date" value={student.hostel_join_date} />
                <Detail
                    label="Hostel Leave Date"
                    value={student.hostel_leave_date}
                />
            </Section>

            {/* Fees and bank information */}
            <Section title="Fees & Bank Information">
                <Detail label="Fee Category" value={student.fee_category} />
                <Detail label="Concession Type" value={student.concession_type} />
                <Detail
                    label="Concession Percentage"
                    value={student.concession_percentage}
                />
                <Detail label="Scholarship Name" value={student.scholarship_name} />
                <Detail
                    label="Scholarship Amount"
                    value={student.scholarship_amount}
                />
                <Detail label="Bank Name" value={student.bank_name} />
                <Detail
                    label="Bank Account No."
                    value={student.bank_account_no}
                />
                <Detail label="IFSC Code" value={student.ifsc} />
            </Section>

            {/* Additional information */}
            <Section title="Additional Information">
                <Detail label="Remarks" value={student.remarks} />
                <Detail label="Created At" value={formatDateTime(student.created_at)} />
                <Detail label="Last Updated" value={formatDateTime(student.last_updated)} />
            </Section>
        </div>
    );
}
