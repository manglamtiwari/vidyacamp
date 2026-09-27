"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function TeacherProfileEditPage() {
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

   
    async function handleSave() {
        if (!teacher) return;

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.replace("/login");
            return;
        }

        const { error } = await supabase.rpc(
            "update_my_teacher_profile",
            {
                p_name: teacher.name,
                p_dob: teacher.dob || null,
                p_gender: teacher.gender || null,
                p_blood_group: teacher.blood_group || null,
                p_phone: teacher.phone || null,
                p_email: teacher.email || null,
                p_city: teacher.city || null,
                p_state: teacher.state || null,
                p_country: teacher.country || null,
                p_nationality: teacher.nationality || null,

                p_bank_name: teacher.bank_name || null,
                p_bank_account_no: teacher.bank_account_no || null,
                p_ifsc_code: teacher.ifsc_code || null,
                p_pan_number: teacher.pan_number || null,
                p_aadhaar_number: teacher.aadhaar_number || null,

                p_emergency_contact_name:
                    teacher.emergency_contact_name || null,
                p_emergency_contact_relation:
                    teacher.emergency_contact_relation || null,
                p_emergency_contact_phone:
                    teacher.emergency_contact_phone || null,
                p_emergency_contact_address:
                    teacher.emergency_contact_address || null,
            }
        );

        if (error) {
            console.error("Profile update error:", error);
            alert(`Failed to save your profile.\n\n${error.message}`);
            return;
        }

        alert("Profile updated successfully.");
        router.push("/teacher/profile");
    }



    return (
        <div className="pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Edit Profile
                    </h1>

                    <p className="text-gray-600 mt-1">
                        Update your profile information.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        // router.push("/teacher/profile")
                        router.push("/teacher/profile")
                    }
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                    Back
                </button>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ReadOnlyField
                        label="Employee ID"
                        value={teacher.employee_id}
                    />

                    <EditableField
                        label="Name"
                        value={teacher.name}
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                name: value,
                            })
                        }
                    />

                    <EditableField
                        label="Date of Birth"
                        type="date"
                        value={teacher.dob || ""}
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                dob: value,
                            })
                        }
                    />

                    <div>
                        <label className="block text-sm text-gray-500 mb-1">
                            Gender
                        </label>

                        <select
                            value={teacher.gender || ""}
                            onChange={(e) =>
                                setTeacher({
                                    ...teacher,
                                    gender: e.target.value,
                                })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="">
                                Select gender
                            </option>
                            <option value="Male">
                                Male
                            </option>
                            <option value="Female">
                                Female
                            </option>
                            <option value="Other">
                                Other
                            </option>
                        </select>
                    </div>

                    <EditableField
                        label="Blood Group"
                        value={teacher.blood_group || ""}
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                blood_group: value,
                            })
                        }
                    />

                    <EditableField
                        label="Phone"
                        value={teacher.phone || ""}
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                phone: value,
                            })
                        }
                    />

                    <div>
                        <label className="block text-sm text-gray-500 mb-1">
                            Email
                        </label>

                        <input
                            type="email"
                            value={teacher.email || ""}
                            disabled
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                        />

                        <p className="text-xs text-gray-500 mt-1">
                            If you want to update your email address, please contact the school administrator.
                        </p>
                    </div>


                    <EditableField
                        label="City"
                        value={teacher.city || ""}
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                city: value,
                            })
                        }
                    />

                    <EditableField
                        label="State"
                        value={teacher.state || ""}
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                state: value,
                            })
                        }
                    />

                    <EditableField
                        label="Country"
                        value={teacher.country || ""}
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                country: value,
                            })
                        }
                    />

                    <EditableField
                        label="Nationality"
                        value={teacher.nationality || ""}
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                nationality: value,
                            })
                        }
                    />
                </div>
            </div>

            {/* Employment Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Employment Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ReadOnlyField
                        label="Designation"
                        value={teacher.designation}
                    />

                    <ReadOnlyField
                        label="Department"
                        value={teacher.department}
                    />

                    <ReadOnlyField
                        label="Role"
                        value={teacher.role}
                    />

                    <ReadOnlyField
                        label="Joining Date"
                        value={teacher.joining_date}
                    />

                    <ReadOnlyField
                        label="Resignation Date"
                        value={teacher.resignation_date}
                    />

                    <ReadOnlyField
                        label="Status"
                        value={
                            teacher.is_active
                                ? "Active"
                                : "Inactive"
                        }
                    />

                    <ReadOnlyField
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
                    <ReadOnlyField
                        label="Highest Qualification"
                        value={teacher.highest_qualification}
                    />

                    <ReadOnlyField
                        label="Specialization"
                        value={teacher.specialization}
                    />

                    <ReadOnlyField
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
                    <ReadOnlyField
                        label="Basic Salary"
                        value={teacher.basic_salary}
                    />

                    <EditableField
                        label="Bank Name"
                        value={teacher.bank_name || ""}
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                bank_name: value,
                            })
                        }
                    />

                    <EditableField
                        label="Bank Account No."
                        value={teacher.bank_account_no || ""}
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                bank_account_no: value,
                            })
                        }
                    />

                    <EditableField
                        label="IFSC Code"
                        value={teacher.ifsc_code || ""}
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                ifsc_code: value,
                            })
                        }
                    />

                    <EditableField
                        label="PAN Number"
                        value={teacher.pan_number || ""}
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                pan_number: value,
                            })
                        }
                    />

                    <ReadOnlyField
                        label="PF Number"
                        value={teacher.pf_number}
                    />

                    <ReadOnlyField
                        label="Tax ID"
                        value={teacher.tax_id}
                    />

                    <EditableField
                        label="Aadhaar Number"
                        value={teacher.aadhaar_number || ""}
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                aadhaar_number: value,
                            })
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
                    <EditableField
                        label="Emergency Contact Name"
                        value={
                            teacher.emergency_contact_name || ""
                        }
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                emergency_contact_name:
                                    value,
                            })
                        }
                    />

                    <EditableField
                        label="Emergency Contact Relation"
                        value={
                            teacher.emergency_contact_relation || ""
                        }
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                emergency_contact_relation:
                                    value,
                            })
                        }
                    />

                    <EditableField
                        label="Emergency Contact Phone"
                        value={
                            teacher.emergency_contact_phone || ""
                        }
                        onChange={(value) =>
                            setTeacher({
                                ...teacher,
                                emergency_contact_phone:
                                    value,
                            })
                        }
                    />

                    <div>
                        <label className="block text-sm text-gray-500 mb-1">

                            Emergency Contact Address
                        </label>

                        <textarea
                            value={
                                teacher.emergency_contact_address ||
                                ""
                            }
                            onChange={(e) =>
                                setTeacher({
                                    ...teacher,
                                    emergency_contact_address:
                                        e.target.value,
                                })
                            }
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() =>
                        // router.push("/teacher/profile")
                        router.push("/teacher/profile")
                    }
                    className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={handleSave}
                    className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}

function EditableField({
    label,
    value,
    onChange,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
}) {
    return (
        <div>
            <label className="block text-sm text-gray-500 mb-1">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
        </div>
    );
}

function ReadOnlyField({
    label,
    value,
}: {
    label: string;
    value: any;
}) {
    return (
        <div>
            <label className="block text-sm text-gray-500 mb-1">
                {label}
            </label>

            <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-600">
                {value !== null &&
                    value !== undefined &&
                    value !== ""
                    ? String(value)
                    : "Not provided"}
            </div>
        </div>
    );
}