"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TeacherEditPage() {
    const params = useParams();
    const router = useRouter();

    const teacherId = params.id as string;
    const [teacher, setTeacher] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadTeacher() {
            const { data, error } = await supabase
                .from("teachers")
                .select("*")
                .eq("id", teacherId)
                .single();

            if (error) {
                console.error("Error loading teacher:", error);
            } else {
                setTeacher(data);
            }

            setIsLoading(false);
        }

        loadTeacher();
    }, [teacherId]);


    async function handleSave() {
        if (!teacher) return;

        const { error } = await supabase
            .from("teachers")
            .update({
                // Personal Information
                name: teacher.name,
                dob: teacher.dob || null,
                gender: teacher.gender || null,
                blood_group: teacher.blood_group || null,
                phone: teacher.phone || null,
                email: teacher.email || null,
                city: teacher.city || null,
                state: teacher.state || null,
                country: teacher.country || null,
                nationality: teacher.nationality || null,

                // Employment Information
                designation: teacher.designation || null,
                department: teacher.department || null,
                role: teacher.role || null,
                joining_date: teacher.joining_date || null,
                resignation_date: teacher.resignation_date || null,
                is_active: teacher.is_active,
                class_teacher_of: teacher.class_teacher_of || null,

                // Education & Experience
                highest_qualification:
                    teacher.highest_qualification || null,
                specialization: teacher.specialization || null,
                total_years_experience:
                    teacher.total_years_experience ?? null,

                // Salary Information
                basic_salary: teacher.basic_salary ?? null,
                pf_number: teacher.pf_number || null,
                tax_id: teacher.tax_id || null,

                // Emergency Contact
                emergency_contact_name:
                    teacher.emergency_contact_name || null,
                emergency_contact_relation:
                    teacher.emergency_contact_relation || null,
                emergency_contact_phone:
                    teacher.emergency_contact_phone || null,
                emergency_contact_address:
                    teacher.emergency_contact_address || null,
            })
            .eq("id", teacherId);

        if (error) {
            console.error("Error updating teacher:", error);
            alert("Failed to save teacher profile.");
            return;
        }

        alert("Teacher profile updated successfully.");
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Edit Teacher Profile
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Employee profile information
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    Back
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                {isLoading ? (
                    <p className="text-gray-500">Loading teacher profile...</p>
                ) : !teacher ? (
                    <p className="text-red-500">Teacher not found.</p>
                ) : (
                    <div className='bg-white rounded-xl border border-gray-200 p-6 mt-6'>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Personal Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">
                                    Employee ID
                                </label>
                                <input
                                    type="text"
                                    value={teacher.employee_id || ""}
                                    disabled
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={teacher.name || ""}
                                    onChange={(e) =>
                                        setTeacher({
                                            ...teacher,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 mb-1">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={teacher.dob || ""}
                                    onChange={(e) =>
                                        setTeacher({
                                            ...teacher,
                                            dob: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

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
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 mb-1">
                                    Blood Group
                                </label>
                                <input
                                    type="text"
                                    value={teacher.blood_group || ""}
                                    onChange={(e) =>
                                        setTeacher({
                                            ...teacher,
                                            blood_group: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    value={teacher.phone || ""}
                                    onChange={(e) =>
                                        setTeacher({
                                            ...teacher,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={teacher.email || ""}
                                    onChange={(e) =>
                                        setTeacher({
                                            ...teacher,
                                            email: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={teacher.city || ""}
                                    onChange={(e) =>
                                        setTeacher({
                                            ...teacher,
                                            city: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 mb-1">
                                    State
                                </label>
                                <input
                                    type="text"
                                    value={teacher.state || ""}
                                    onChange={(e) =>
                                        setTeacher({
                                            ...teacher,
                                            state: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 mb-1">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    value={teacher.country || ""}
                                    onChange={(e) =>
                                        setTeacher({
                                            ...teacher,
                                            country: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 mb-1">
                                    Nationality
                                </label>
                                <input
                                    type="text"
                                    value={teacher.nationality || ""}
                                    onChange={(e) =>
                                        setTeacher({
                                            ...teacher,
                                            nationality: e.target.value,
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>


                        </div>
                    </div>



                )}

                <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Employment Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Designation
                            </label>
                            <input
                                type="text"
                                value={teacher?.designation || ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        designation: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Department
                            </label>
                            <input
                                type="text"
                                value={teacher?.department || ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        department: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Role
                            </label>
                            <input
                                type="text"
                                value={teacher?.role || ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        role: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Joining Date
                            </label>
                            <input
                                type="date"
                                value={teacher?.joining_date || ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        joining_date: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Resignation Date
                            </label>
                            <input
                                type="date"
                                value={teacher?.resignation_date || ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        resignation_date: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Status
                            </label>
                            <select
                                value={teacher?.is_active ? "Active" : "Inactive"}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        is_active: e.target.value === "Active",
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Class Teacher Of
                            </label>
                            <input
                                type="text"
                                value={teacher?.class_teacher_of || ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        class_teacher_of: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Education & Experience
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Highest Qualification
                            </label>
                            <input
                                type="text"
                                value={teacher?.highest_qualification || ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        highest_qualification: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Specialization
                            </label>
                            <input
                                type="text"
                                value={teacher?.specialization || ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        specialization: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Total Years of Experience
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={teacher?.total_years_experience ?? ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        total_years_experience:
                                            e.target.value === ""
                                                ? null
                                                : Number(e.target.value),
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Salary & Bank Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Salary - Editable */}
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Basic Salary
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={teacher?.basic_salary ?? ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        basic_salary:
                                            e.target.value === ""
                                                ? null
                                                : Number(e.target.value),
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        {/* Bank Name - Disabled */}
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Bank Name
                            </label>
                            <input
                                type="text"
                                value={teacher?.bank_name || ""}
                                disabled
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                            />
                        </div>

                        {/* Bank Account No. - Disabled */}
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Bank Account No.
                            </label>
                            <input
                                type="text"
                                value={teacher?.bank_account_no || ""}
                                disabled
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                            />
                        </div>

                        {/* IFSC Code - Disabled */}
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                IFSC Code
                            </label>
                            <input
                                type="text"
                                value={teacher?.ifsc_code || ""}
                                disabled
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                            />
                        </div>

                        {/* PAN Number - Disabled & Masked */}
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                PAN Number
                            </label>
                            <input
                                type="text"
                                value={
                                    teacher?.pan_number
                                        ? "******" + teacher.pan_number.slice(-3)
                                        : ""
                                }
                                disabled
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                            />
                        </div>

                        {/* PF Number - Editable */}
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                PF Number
                            </label>
                            <input
                                type="text"
                                value={teacher?.pf_number || ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        pf_number: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        {/* Tax ID - Editable */}
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Tax ID
                            </label>
                            <input
                                type="text"
                                value={teacher?.tax_id || ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        tax_id: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        {/* Aadhaar Number - Disabled & Masked */}
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Aadhaar Number
                            </label>
                            <input
                                type="text"
                                value={
                                    teacher?.aadhaar_number
                                        ? "********" + teacher.aadhaar_number.slice(-4)
                                        : ""
                                }
                                disabled
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Emergency Contact
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Emergency Contact Name
                            </label>
                            <input
                                type="text"
                                value={teacher?.emergency_contact_name || ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        emergency_contact_name: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Emergency Contact Relation
                            </label>
                            <input
                                type="text"
                                value={teacher?.emergency_contact_relation || ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        emergency_contact_relation: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Emergency Contact Phone
                            </label>
                            <input
                                type="text"
                                value={teacher?.emergency_contact_phone || ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        emergency_contact_phone: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 mb-1">
                                Emergency Contact Address
                            </label>
                            <textarea
                                value={teacher?.emergency_contact_address || ""}
                                onChange={(e) =>
                                    setTeacher({
                                        ...teacher,
                                        emergency_contact_address: e.target.value,
                                    })
                                }
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>


                    <div className="mt-8 flex justify-end gap-3 pb-6">
                        <button
                            type="button"
                            onClick={() => router.back()}
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

            </div>
        </div>
    );
}