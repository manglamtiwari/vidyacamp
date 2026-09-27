"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function TeacherProfilePage() {
    const router = useRouter();

    const [teacher, setTeacher] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadTeacherProfile() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.replace("/login");
                return;
            }

            const { data, error } = await supabase
                .from("teachers")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (error) {
                console.error(
                    "Error loading teacher profile:",
                    error
                );
            } else {
                setTeacher(data);
            }

            setIsLoading(false);
        }

        loadTeacherProfile();
    }, [router]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>

                <p className="text-gray-500 mt-4">
                    Loading your profile...
                </p>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <p className="text-red-500">
                    Teacher profile not found.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Profile
                    </h1>

                    <p className="text-gray-600 mt-1">
                        View and manage your profile information.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        // router.push("/teacher/profile/edit")
                         router.push("/teacher/edit")
                    }
                    className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition"
                >
                    Edit Profile
                </button>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileField
                        label="Employee ID"
                        value={teacher.employee_id}
                    />

                    <ProfileField
                        label="Name"
                        value={teacher.name}
                    />

                    <ProfileField
                        label="Date of Birth"
                        value={teacher.dob}
                    />

                    <ProfileField
                        label="Gender"
                        value={teacher.gender}
                    />

                    <ProfileField
                        label="Blood Group"
                        value={teacher.blood_group}
                    />

                    <ProfileField
                        label="Phone"
                        value={teacher.phone}
                    />

                    <ProfileField
                        label="Email"
                        value={teacher.email}
                    />

                    <ProfileField
                        label="City"
                        value={teacher.city}
                    />

                    <ProfileField
                        label="State"
                        value={teacher.state}
                    />

                    <ProfileField
                        label="Country"
                        value={teacher.country}
                    />

                    <ProfileField
                        label="Nationality"
                        value={teacher.nationality}
                    />
                </div>
            </div>

            {/* Employment Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Employment Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileField
                        label="Designation"
                        value={teacher.designation}
                    />

                    <ProfileField
                        label="Department"
                        value={teacher.department}
                    />

                    <ProfileField
                        label="Role"
                        value={teacher.role}
                    />

                    <ProfileField
                        label="Joining Date"
                        value={teacher.joining_date}
                    />

                    <ProfileField
                        label="Resignation Date"
                        value={teacher.resignation_date}
                    />

                    <ProfileField
                        label="Status"
                        value={
                            teacher.is_active
                                ? "Active"
                                : "Inactive"
                        }
                    />

                    <ProfileField
                        label="Class Teacher Of"
                        value={teacher.class_teacher_of}
                    />
                </div>
            </div>

            {/* Education & Experience */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Education & Experience
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileField
                        label="Highest Qualification"
                        value={teacher.highest_qualification}
                    />

                    <ProfileField
                        label="Specialization"
                        value={teacher.specialization}
                    />

                    <ProfileField
                        label="Total Years of Experience"
                        value={
                            teacher.total_years_experience
                        }
                    />
                </div>
            </div>

            {/* Salary & Bank Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Salary & Bank Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileField
                        label="Basic Salary"
                        value={teacher.basic_salary}
                    />

                    <ProfileField
                        label="Bank Name"
                        value={teacher.bank_name}
                    />

                    <ProfileField
                        label="Bank Account No."
                        value={teacher.bank_account_no}
                    />

                    <ProfileField
                        label="IFSC Code"
                        value={teacher.ifsc_code}
                    />

                    <ProfileField
                        label="PAN Number"
                        value={
                            teacher.pan_number
                                ? "******" +
                                  teacher.pan_number.slice(-3)
                                : null
                        }
                    />

                    <ProfileField
                        label="PF Number"
                        value={teacher.pf_number}
                    />

                    <ProfileField
                        label="Tax ID"
                        value={teacher.tax_id}
                    />

                    <ProfileField
                        label="Aadhaar Number"
                        value={
                            teacher.aadhaar_number
                                ? "********" +
                                  teacher.aadhaar_number.slice(-4)
                                : null
                        }
                    />
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Emergency Contact
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileField
                        label="Contact Name"
                        value={
                            teacher.emergency_contact_name
                        }
                    />

                    <ProfileField
                        label="Relationship"
                        value={
                            teacher.emergency_contact_relation
                        }
                    />

                    <ProfileField
                        label="Phone"
                        value={
                            teacher.emergency_contact_phone
                        }
                    />

                    <ProfileField
                        label="Address"
                        value={
                            teacher.emergency_contact_address
                        }
                    />
                </div>
            </div>
        </div>
    );
}

function ProfileField({
    label,
    value,
}: {
    label: string;
    value: any;
}) {
    return (
        <div>
            <p className="text-sm text-gray-500 mb-1">
                {label}
            </p>

            <p className="text-gray-900">
                {value !== null &&
                value !== undefined &&
                value !== ""
                    ? String(value)
                    : "Not provided"}
            </p>
        </div>
    );
}