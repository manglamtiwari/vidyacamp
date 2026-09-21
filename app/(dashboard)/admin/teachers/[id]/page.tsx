"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TeacherProfilePage() {
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

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {teacher?.name || "Teacher Profile"}
                    </h1>

                    {teacher?.employee_id && (
                        <p className="text-sm text-gray-500 mt-1">
                            Employee ID: {teacher.employee_id}
                        </p>
                    )}
                </div>

                {/* <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    Back
                </button> */}
                <div className="flex gap-3">
                    {/* <button
        type="button"
        className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition"
    >
        Edit Profile
    </button> */}

                    <button
                        type="button"
                        onClick={() => router.push(`/admin/teachers/${teacherId}/edit`)}
                        className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition"
                    >
                        Edit Profile
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        Back
                    </button>
                </div>
            </div>


            <div className="bg-white rounded-xl border border-gray-200 p-6">
                {isLoading ? (
                    <p className="text-gray-500">Loading teacher profile...</p>
                ) : !teacher ? (
                    <p className="text-red-500">Teacher not found.</p>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Personal Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500">Employee ID</p>
                                <p className="font-medium text-gray-900">
                                    {teacher.employee_id || "Not provided"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium text-gray-900">
                                    {teacher.name || "Not provided"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Date of Birth</p>
                                <p className="font-medium text-gray-900">
                                    {teacher.dob || "Not provided"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Gender</p>
                                <p className="font-medium text-gray-900">
                                    {teacher.gender || "Not provided"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Blood Group</p>
                                <p className="font-medium text-gray-900">
                                    {teacher.blood_group || "Not provided"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium text-gray-900">
                                    {teacher.phone || "Not provided"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">
                                    {teacher.email || "Not provided"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">City</p>
                                <p className="font-medium text-gray-900">
                                    {teacher.city || "Not provided"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">State</p>
                                <p className="font-medium text-gray-900">
                                    {teacher.state || "Not provided"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Country</p>
                                <p className="font-medium text-gray-900">
                                    {teacher.country || "Not provided"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Nationality</p>
                                <p className="font-medium text-gray-900">
                                    {teacher.nationality || "Not provided"}
                                </p>
                            </div>
                        </div>
                    </div>



                )}

            </div>


            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Employment Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500">Designation</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.designation || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.department || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.role || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Joining Date</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.joining_date || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Resignation Date</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.resignation_date || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.is_active ? "Active" : "Inactive"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Class Teacher Of</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.class_teacher_of || "Not provided"}
                        </p>
                    </div>
                </div>
            </div>


            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Education & Experience
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500">Highest Qualification</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.highest_qualification || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Specialization</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.specialization || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Total Years of Experience
                        </p>
                        <p className="font-medium text-gray-900">
                            {teacher?.total_years_experience ?? "Not provided"}
                        </p>
                    </div>
                </div>
            </div>


            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Salary & Bank Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500">Basic Salary</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.basic_salary ?? "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Bank Name</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.bank_name || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Bank Account No.</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.bank_account_no || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">IFSC Code</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.ifsc_code || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">PAN Number</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.pan_number || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">PF Number</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.pf_number || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Tax ID</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.tax_id || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Aadhaar Number</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.aadhaar_number || "Not provided"}
                        </p>
                    </div>
                </div>
            </div>


            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Emergency Contact
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500">Contact Name</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.emergency_contact_name || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Relationship</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.emergency_contact_relation || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.emergency_contact_phone || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium text-gray-900">
                            {teacher?.emergency_contact_address || "Not provided"}
                        </p>
                    </div>
                </div>
            </div>


        </div>
    );
}