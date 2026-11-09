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
    dob: string | null;
    is_active: boolean;
};

type Student = {
    id: string;
    admission_no: string;

    created_at: string;
    last_updated: string;

    // student name is stored in the "name" field in the database
    name: string;

    registration_no: string | null;
    aadhaar_number: string | null;
    apaar_id: string | null;

    student_email: string | null;
    student_phone: string | null;
    student_alternate_phone: string | null;

    current_address: string | null;
    permanent_address: string | null;

    parent_name: string | null;
    parent_phone: string | null;
    parent_email: string | null;

    father_name: string | null;
    father_phone: string | null;
    father_alternate_phone: string | null;
    father_email: string | null;
    father_occupation: string | null;
    father_qualification: string | null;
    father_aadhaar_number: string | null;
    father_annual_income: number | null;

    mother_name: string | null;
    mother_phone: string | null;
    mother_alternate_phone: string | null;
    mother_email: string | null;
    mother_occupation: string | null;
    mother_qualification: string | null;
    mother_aadhaar_number: string | null;
    mother_annual_income: number | null;

    // Guardian Information

    guardian_type: string | null;
    guardian_name: string | null;
    guardian_relation: string | null;
    guardian_phone: string | null;
    guardian_alternate_phone: string | null;
    guardian_email: string | null;
    guardian_occupation: string | null;
    guardian_qualification: string | null;
    guardian_address: string | null;
    is_primary_guardian: boolean;

    date_of_birth: string | null;
    gender: string | null;

    blood_group: string | null;
    nationality: string | null;
    religion: string | null;
    category: string | null;
    caste: string | null;
    mother_tongue: string | null;
    photo_url: string | null;

    academic_year_id: string | null;
    roll_number: string | null;
    class_id: string | null;
    section_id: string | null;
    house_id: string | null;
    stream: string | null;
    elective_subjects: string[] | null;

    status: string | null;

    // Emergency Contact Information
    emergency_contact_type: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_alternate_phone: string | null;
    emergency_contact_email: string | null;
    emergency_contact_relation: string | null;
    emergency_contact_address: string | null;

    // Health & Medical Information
    allergies: string | null;
    medical_conditions: string | null;
    medications: string | null;
    disabilities: string | null;
    dietary_restrictions: string | null;
    special_health_instructions: string | null;
    doctor_name: string | null;
    doctor_phone: string | null;
    doctor_address: string | null;
    insurance_provider: string | null;
    insurance_policy_no: string | null;


    admission_date: string | null;
    admission_type: string | null;
    previous_school_name: string | null;
    previous_school_class: string | null;
    previous_school_board: string | null;
    previous_school_tc_no: string | null;
    remarks: string | null;



    // Transport Information
    uses_transport: boolean;
    transport_route: string | null;
    transport_stop: string | null;
    pickup_point: string | null;
    drop_point: string | null;
    transport_fee: number | null;
    transport_start_date: string | null;
    transport_end_date: string | null;


    // Hostel Information
    uses_hostel: boolean;
    hostel_name: string | null;
    hostel_block: string | null;
    hostel_room_no: string | null;
    hostel_join_date: string | null;
    hostel_leave_date: string | null;



    // Fee & Finance Information
    fee_category: string | null;
    concession_type: string | null;
    concession_percentage: number | null;
    scholarship_name: string | null;
    scholarship_amount: number | null;
    bank_account_no: string | null;
    bank_name: string | null;
    ifsc: string | null;


    user_id: string | null;
    login_username: string | null;
    must_change_password: boolean;


    is_active: boolean;
};

type GeneratedCredential = {
    studentId: string;
    studentName: string;
    schoolCode: string;
    username: string;
    temporaryPassword: string;
};

type CredentialModalData = {
    credentials: GeneratedCredential[];
    failures: {
        studentName: string;
        error: string;
    }[];
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

type AcademicYear = {
    id: string;
    name: string;
};

type House = {
    id: string;
    name: string;
    code: string | null;
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

    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [houses, setHouses] = useState<House[]>([]);

    const [sections, setSections] = useState<SchoolSection[]>([]);
    const [teacherSearch, setTeacherSearch] = useState("");
    const [teacherDobFilter, setTeacherDobFilter] = useState("");
    const [teacherStatusFilter, setTeacherStatusFilter] = useState<
        "all" | "active" | "inactive"
    >("all");
    const [studentSearch, setStudentSearch] = useState("");
    const [studentDobFilter, setStudentDobFilter] = useState("");
    const [studentGenderFilter, setStudentGenderFilter] = useState("all");
    const [studentClassFilter, setStudentClassFilter] = useState("all");
    const [studentSectionFilter, setStudentSectionFilter] = useState("all");
    const [studentStatusFilter, setStudentStatusFilter] = useState<
        "all" | "active" | "inactive"
    >("all");

    const [isCheckingAccess, setIsCheckingAccess] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    // student id generate

    const [generatingStudentId, setGeneratingStudentId] = useState<string | null>(null);
    const [regeneratingStudentId, setRegeneratingStudentId] = useState<string | null>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [isBulkGenerating, setIsBulkGenerating] = useState(false);

    const [selectedAccountStudentIds, setSelectedAccountStudentIds] = useState<string[]>([]);
    const [isBulkRegenerating, setIsBulkRegenerating] = useState(false);

    const [credentialModalData, setCredentialModalData] =
        useState<CredentialModalData | null>(null);

    const [showTeacherForm, setShowTeacherForm] = useState(false);
    const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
    const [teacherName, setTeacherName] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [teacherPhone, setTeacherPhone] = useState("");
    const [teacherEmail, setTeacherEmail] = useState("");
    const [teacherDob, setTeacherDob] = useState("");

    const [showStudentForm, setShowStudentForm] = useState(false);
    const [admissionNo, setAdmissionNo] = useState("");
    const [studentName, setStudentName] = useState("");

    // student contact information
    const [studentEmail, setStudentEmail] = useState("");
    const [studentPhone, setStudentPhone] = useState("");
    const [studentAlternatePhone, setStudentAlternatePhone] = useState("");

    const [currentAddress, setCurrentAddress] = useState("");
    const [permanentAddress, setPermanentAddress] = useState("");
    const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);

    const [studentAadharNumber, setStudentAadharNumber] = useState("");
    const [studentApaarIdNumber, setStudentApaarIdNumber] = useState("");


    const [parentName, setParentName] = useState("");
    const [parentPhone, setParentPhone] = useState("");
    const [parentEmail, setParentEmail] = useState("");
    const [fatherName, setFatherName] = useState("");
    const [fatherPhone, setFatherPhone] = useState("");
    const [fatherAlternatePhone, setFatherAlternatePhone] = useState("");
    const [fatherEmail, setFatherEmail] = useState("");
    const [fatherOccupation, setFatherOccupation] = useState("");
    const [fatherQualification, setFatherQualification] = useState("");
    const [fatherAadhaarNumber, setFatherAadhaarNumber] = useState("");
    const [fatherAnnualIncome, setFatherAnnualIncome] = useState("");


    const [motherName, setMotherName] = useState("");
    const [motherPhone, setMotherPhone] = useState("");
    const [motherAlternatePhone, setMotherAlternatePhone] = useState("");
    const [motherEmail, setMotherEmail] = useState("");
    const [motherOccupation, setMotherOccupation] = useState("");
    const [motherQualification, setMotherQualification] = useState("");
    const [motherAadhaarNumber, setMotherAadhaarNumber] = useState("");
    const [motherAnnualIncome, setMotherAnnualIncome] = useState("");

    const [emergencyContactType, setEmergencyContactType] = useState("Father");


    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("");
    const [studentClassId, setStudentClassId] = useState("");
    const [studentSectionId, setStudentSectionId] = useState("");

    const [registrationNo, setRegistrationNo] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [nationality, setNationality] = useState("");
    const [religion, setReligion] = useState("");
    const [category, setCategory] = useState("");
    const [caste, setCaste] = useState("");
    const [motherTongue, setMotherTongue] = useState("");

    const [academicYearId, setAcademicYearId] = useState("");
    const [houseId, setHouseId] = useState("");
    const [electiveSubjects, setElectiveSubjects] = useState("");
    const [studentStatus, setStudentStatus] = useState("Active");
    const [rollNumber, setRollNumber] = useState("");
    const [stream, setStream] = useState("");
    const [admissionDate, setAdmissionDate] = useState("");
    const [admissionType, setAdmissionType] = useState("");
    const [previousSchoolName, setPreviousSchoolName] = useState("");
    const [previousSchoolClass, setPreviousSchoolClass] = useState("");
    const [previousSchoolBoard, setPreviousSchoolBoard] = useState("");
    const [previousSchoolTcNo, setPreviousSchoolTcNo] = useState("");
    const [remarks, setRemarks] = useState("");

    // Guardian Information
    const [guardianType, setGuardianType] = useState("Father");
    const [guardianName, setGuardianName] = useState("");
    const [guardianRelation, setGuardianRelation] = useState("");
    const [guardianPhone, setGuardianPhone] = useState("");
    const [guardianAlternatePhone, setGuardianAlternatePhone] = useState("");
    const [guardianEmail, setGuardianEmail] = useState("");
    const [guardianOccupation, setGuardianOccupation] = useState("");
    const [guardianQualification, setGuardianQualification] = useState("");
    const [guardianAddress, setGuardianAddress] = useState("");
    const [isPrimaryGuardian, setIsPrimaryGuardian] = useState(true);

    const [emergencyContactName, setEmergencyContactName] = useState("");
    const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
    const [emergencyContactAlternatePhone, setEmergencyContactAlternatePhone] = useState("");
    const [emergencyContactEmail, setEmergencyContactEmail] = useState("");
    const [emergencyContactRelation, setEmergencyContactRelation] = useState("");
    const [emergencyContactAddress, setEmergencyContactAddress] = useState("");


    const [allergies, setAllergies] = useState("");
    const [medicalConditions, setMedicalConditions] = useState("");
    const [medications, setMedications] = useState("");
    const [disabilities, setDisabilities] = useState("");
    const [dietaryRestrictions, setDietaryRestrictions] = useState("");
    const [specialHealthInstructions, setSpecialHealthInstructions] = useState("");
    const [doctorName, setDoctorName] = useState("");
    const [doctorPhone, setDoctorPhone] = useState("");
    const [doctorAddress, setDoctorAddress] = useState("");
    const [insuranceProvider, setInsuranceProvider] = useState("");
    const [insurancePolicyNo, setInsurancePolicyNo] = useState("");


    // Transport Information
    const [usesTransport, setUsesTransport] = useState(false);
    const [transportRoute, setTransportRoute] = useState("");
    const [transportStop, setTransportStop] = useState("");
    const [pickupPoint, setPickupPoint] = useState("");
    const [dropPoint, setDropPoint] = useState("");
    const [transportFee, setTransportFee] = useState("");
    const [transportStartDate, setTransportStartDate] = useState("");
    const [transportEndDate, setTransportEndDate] = useState("");

    //Hostel Information

    const [usesHostel, setUsesHostel] = useState(false);
    const [hostelName, setHostelName] = useState("");
    const [hostelBlock, setHostelBlock] = useState("");
    const [hostelRoomNo, setHostelRoomNo] = useState("");
    const [hostelJoinDate, setHostelJoinDate] = useState("");
    const [hostelLeaveDate, setHostelLeaveDate] = useState("");


    // Fee Information

    const [feeCategory, setFeeCategory] = useState("");
    const [concessionType, setConcessionType] = useState("");
    const [concessionPercentage, setConcessionPercentage] = useState("");
    const [scholarshipName, setScholarshipName] = useState("");
    const [scholarshipAmount, setScholarshipAmount] = useState("");
    const [bankAccountNo, setBankAccountNo] = useState("");
    const [bankName, setBankName] = useState("");
    const [ifsc, setIfsc] = useState("");



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


    async function getAdminSchoolId() {
        // First, check the current authenticated user.
        let {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        // If no user is available, try refreshing the session.
        if (!user) {
            const {
                data: { session },
                error: refreshError,
            } = await supabase.auth.refreshSession();

            if (refreshError) {
                console.error("Session refresh failed:", refreshError);
            }

            if (session?.user) {
                user = session.user;
            }
        }

        if (userError && !user) {
            console.error("Could not get authenticated user:", userError);
        }

        if (!user) {
            throw new Error(
                "Your session has expired. Please log in again."
            );
        }

        // Find the active school membership for this admin.
        const { data: membership, error: membershipError } =
            await supabase
                .from("school_users")
                .select("school_id")
                .eq("user_id", user.id)
                .eq("role", "admin")
                .eq("status", "active")
                .limit(1)
                .maybeSingle();

        if (membershipError) {
            console.error("Could not load school membership:", membershipError);
            throw membershipError;
        }

        if (!membership) {
            throw new Error(
                "Could not find your active school membership."
            );
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
                    .select("id, employee_id, name, phone, email, dob, is_active")
                    .eq("school_id", schoolId)
                    .order("name"),

                supabase
                    .from("students")
                    .select(`

                        created_at,
last_updated,
    id,
    name,
    admission_no,
    registration_no,
    student_email,
    student_phone,
    student_alternate_phone,

    current_address,
    permanent_address,

    parent_name,
    parent_phone,
    parent_email,

    father_name,
    father_phone,
    father_alternate_phone,
    father_email,
    father_occupation,
    father_qualification,
    father_aadhaar_number,
    father_annual_income,

    mother_name,
    mother_phone,
    mother_alternate_phone,
    mother_email,
    mother_occupation,
    mother_qualification,
    mother_aadhaar_number,
mother_annual_income,

guardian_type,
guardian_name,
guardian_relation,
guardian_phone,
guardian_alternate_phone,
guardian_email,
guardian_occupation,
guardian_qualification,
guardian_address,
is_primary_guardian,

    date_of_birth,
    gender,
    blood_group,
    nationality,
    religion,
    category,
    caste,
    mother_tongue,
    photo_url,
    aadhaar_number,
    apaar_id,

    academic_year_id,
    roll_number,
    class_id,
    section_id,
    house_id,
    stream,
    elective_subjects,
    remarks,

    status,
    emergency_contact_type,
emergency_contact_name,
emergency_contact_phone,
emergency_contact_alternate_phone,
emergency_contact_email,
emergency_contact_relation,
emergency_contact_address,

allergies,
medical_conditions,
medications,
disabilities,
dietary_restrictions,
special_health_instructions,
doctor_name,
doctor_phone,
doctor_address,
insurance_provider,
insurance_policy_no,

uses_transport,
transport_route,
transport_stop,
pickup_point,
drop_point,
transport_fee,
transport_start_date,
transport_end_date,

uses_hostel,
hostel_name,
hostel_block,
hostel_room_no,
hostel_join_date,
hostel_leave_date,

fee_category,
concession_type,
concession_percentage,
scholarship_name,
scholarship_amount,
bank_account_no,
bank_name,
ifsc,

    admission_date,
    admission_type,
    previous_school_name,
    previous_school_class,
    previous_school_board,
    previous_school_tc_no,
    is_active,

    user_id,
login_username,
must_change_password

`)

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


                //new

                const { data: academicYearsData, error: academicYearsError } =
                    await supabase
                        .from("academic_years")
                        .select("id, name")
                        .order("start_date", {
                            ascending: false,
                        });

                if (academicYearsError) {
                    console.error(
                        "Could not load academic years:",
                        academicYearsError
                    );
                } else {
                    setAcademicYears(academicYearsData || []);
                }



                const { data: housesData, error: housesError } =
                    await supabase
                        .from("houses")
                        .select("id, name, code")
                        .eq("is_active", true)
                        .order("name", {
                            ascending: true,
                        });

                if (housesError) {
                    console.error(
                        "Could not load houses:",
                        housesError
                    );
                } else {
                    setHouses(housesData || []);
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

    function resetTeacherForm() {
        setTeacherName("");
        setEmployeeId("");
        setTeacherPhone("");
        setTeacherEmail("");
        setTeacherDob("");
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

                if (error) {
                    if (error.code === "23505") {
                        alert(
                            "This Employee ID is already being used by another teacher in this school."
                        );
                        return;
                    }

                    throw error;
                }
                alert("Teacher updated successfully.");
                resetTeacherForm();
                await loadPeople();
                return;
            }


            const response = await fetch("/api/admin/invite-teacher", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: teacherName,
                    employeeId: employeeId,
                    phone: teacherPhone,
                    email: teacherEmail,
                    dob: teacherDob,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (
                    result.error?.includes("teachers_school_employee_id_unique") ||
                    result.error?.includes("duplicate key")
                ) {
                    alert(
                        "This Employee ID is already being used in this school."
                    );
                    return;
                }

                alert(result.error || "Could not send teacher invitation.");
                return;
            }

            alert(
                "Teacher added successfully. A password setup email has been sent to the teacher's email."
            );

            resetTeacherForm();
            await loadPeople();
        } catch (error) {
            console.error("Could not save teacher:", error);
            alert("Could not save teacher. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleResendPasswordSetup(
        teacher: Teacher
    ) {
        if (!teacher.email) {
            alert("This teacher does not have an email address.");
            return;
        }

        const confirmed = window.confirm(
            `Resend the password setup email to ${teacher.email}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                "/api/admin/resend-teacher-invite",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        teacherId: teacher.id,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                alert(
                    result.error ||
                    "Could not resend teacher invitation."
                );
                return;
            }

            alert(
                "Password setup email sent successfully."
            );
        } catch (error) {
            console.error(
                "Could not resend teacher invitation:",
                error
            );

            alert(
                "Could not resend teacher invitation. Please try again."
            );
        }
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

    function resetStudentForm() {

        setAdmissionNo("");
        setStudentName("");
        setStudentEmail("");
        setStudentPhone("");
        setStudentAlternatePhone("");

        setCurrentAddress("");
        setPermanentAddress("");
        setSameAsCurrentAddress(false);

        setParentName("");
        setParentPhone("");
        setParentEmail("");
        setDateOfBirth("");
        setGender("");


        setRegistrationNo("");
        setBloodGroup("");
        setNationality("");
        setReligion("");
        setCategory("");
        setCaste("");
        setMotherTongue("");
        setStudentAadharNumber("");
        setStudentApaarIdNumber("");

        setStream("");
        setStudentStatus("Active");
        setAdmissionDate("");
        setAdmissionType("");
        setAcademicYearId("");
        setRollNumber("");
        setPreviousSchoolName("");
        setPreviousSchoolClass("");
        setPreviousSchoolBoard("");
        setPreviousSchoolTcNo("");
        setRemarks("");
        setHouseId("");
        setElectiveSubjects("");
        setStudentClassId("");
        setStudentSectionId("");


        // Father Information
        setFatherName("");
        setFatherPhone("");
        setFatherAlternatePhone("");
        setFatherEmail("");
        setFatherOccupation("");
        setFatherQualification("");
        setFatherAadhaarNumber("");
        setFatherAnnualIncome("");

        // Mother Information
        setMotherName("");
        setMotherPhone("");
        setMotherAlternatePhone("");
        setMotherEmail("");
        setMotherOccupation("");
        setMotherQualification("");
        setMotherAadhaarNumber("");
        setMotherAnnualIncome("");

        // Reset Guardian Information
        setGuardianType("Father");
        setGuardianName("");
        setGuardianRelation("");
        setGuardianPhone("");
        setGuardianAlternatePhone("");
        setGuardianEmail("");
        setGuardianOccupation("");
        setGuardianQualification("");
        setGuardianAddress("");
        setIsPrimaryGuardian(true);

        setEmergencyContactType("Father");
        setEmergencyContactName("");
        setEmergencyContactPhone("");
        setEmergencyContactAlternatePhone("");
        setEmergencyContactEmail("");
        setEmergencyContactRelation("");
        setEmergencyContactAddress("");

        setAllergies("");
        setMedicalConditions("");
        setMedications("");
        setDisabilities("");
        setDietaryRestrictions("");
        setSpecialHealthInstructions("");
        setDoctorName("");
        setDoctorPhone("");
        setDoctorAddress("");
        setInsuranceProvider("");
        setInsurancePolicyNo("");

        setUsesTransport(false);
        setTransportRoute("");
        setTransportStop("");
        setPickupPoint("");
        setDropPoint("");
        setTransportFee("");
        setTransportStartDate("");
        setTransportEndDate("");

        setUsesHostel(false);
        setHostelName("");
        setHostelBlock("");
        setHostelRoomNo("");
        setHostelJoinDate("");
        setHostelLeaveDate("");

        setFeeCategory("");
        setConcessionType("");
        setConcessionPercentage("");
        setScholarshipName("");
        setScholarshipAmount("");
        setBankAccountNo("");
        setBankName("");
        setIfsc("");

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

            const schoolId = await getAdminSchoolId();

            const { error } = await supabase
                .from("students")
                .insert({
                    school_id: schoolId,

                    // Existing fields
                    admission_no: admissionNo.trim(),
                    name: studentName.trim(),
                    student_email: studentEmail.trim() || null,
                    student_phone: studentPhone.trim() || null,
                    student_alternate_phone: studentAlternatePhone.trim() || null,

                    current_address: currentAddress.trim() || null,
                    permanent_address: permanentAddress.trim() || null,

                    parent_name: parentName.trim() || null,
                    parent_phone: parentPhone.trim() || null,
                    parent_email: parentEmail.trim() || null,
                    date_of_birth: dateOfBirth || null,
                    gender: gender || null,
                    class_id: studentClassId || null,
                    section_id: studentSectionId || null,

                    // Basic Information
                    registration_no: registrationNo.trim() || null,
                    aadhaar_number: studentAadharNumber.trim() || null,
                    apaar_id: studentApaarIdNumber.trim() || null,
                    blood_group: bloodGroup || null,
                    nationality: nationality.trim() || null,
                    religion: religion.trim() || null,
                    category: category.trim() || null,
                    caste: caste.trim() || null,
                    mother_tongue: motherTongue.trim() || null,

                    // Academic Information
                    roll_number: rollNumber.trim() || null,
                    stream: stream.trim() || null,
                    // status: status || "active",
                    status: studentStatus,

                    // Admission Information
                    admission_date: admissionDate || null,
                    admission_type: admissionType || null,
                    previous_school_name:
                        previousSchoolName.trim() || null,
                    previous_school_class:
                        previousSchoolClass.trim() || null,
                    previous_school_board:
                        previousSchoolBoard.trim() || null,
                    previous_school_tc_no:
                        previousSchoolTcNo.trim() || null,
                    remarks: remarks.trim() || null,


                    // Father Information
                    father_name: fatherName.trim() || null,
                    father_phone: fatherPhone.trim() || null,
                    father_alternate_phone:
                        fatherAlternatePhone.trim() || null,
                    father_email: fatherEmail.trim() || null,
                    father_occupation: fatherOccupation.trim() || null,
                    father_qualification: fatherQualification.trim() || null,
                    father_aadhaar_number: fatherAadhaarNumber.trim() || null,
                    father_annual_income: fatherAnnualIncome.trim()
                        ? Number(fatherAnnualIncome)
                        : null,

                    // Mother Information
                    mother_name: motherName.trim() || null,
                    mother_phone: motherPhone.trim() || null,
                    mother_alternate_phone:
                        motherAlternatePhone.trim() || null,
                    mother_email: motherEmail.trim() || null,
                    mother_occupation: motherOccupation.trim() || null,
                    mother_qualification: motherQualification.trim() || null,
                    mother_aadhaar_number: motherAadhaarNumber.trim() || null,
                    mother_annual_income: motherAnnualIncome.trim()
                        ? Number(motherAnnualIncome)
                        : null,

                    guardian_type: guardianType,

                    guardian_name:
                        guardianType === "Separate Guardian"
                            ? guardianName.trim() || null
                            : null,

                    guardian_relation:
                        guardianType === "Separate Guardian"
                            ? guardianRelation.trim() || null
                            : null,

                    guardian_phone:
                        guardianType === "Separate Guardian"
                            ? guardianPhone.trim() || null
                            : null,

                    guardian_alternate_phone:
                        guardianType === "Separate Guardian"
                            ? guardianAlternatePhone.trim() || null
                            : null,

                    guardian_email:
                        guardianType === "Separate Guardian"
                            ? guardianEmail.trim() || null
                            : null,

                    guardian_occupation:
                        guardianType === "Separate Guardian"
                            ? guardianOccupation.trim() || null
                            : null,

                    guardian_qualification:
                        guardianType === "Separate Guardian"
                            ? guardianQualification.trim() || null
                            : null,

                    guardian_address:
                        guardianType === "Separate Guardian"
                            ? guardianAddress.trim() || null
                            : null,

                    is_primary_guardian: isPrimaryGuardian,

                    emergency_contact_type: emergencyContactType,
                    emergency_contact_name: emergencyContactType === "Other" ? emergencyContactName : null,
                    emergency_contact_phone: emergencyContactType === "Other" ? emergencyContactPhone : null,
                    emergency_contact_alternate_phone: emergencyContactType === "Other" ? emergencyContactAlternatePhone : null,
                    emergency_contact_email: emergencyContactType === "Other" ? emergencyContactEmail : null,
                    emergency_contact_relation: emergencyContactType === "Other" ? emergencyContactRelation : null,
                    emergency_contact_address: emergencyContactType === "Other" ? emergencyContactAddress : null,



                    allergies: allergies || null,
                    medical_conditions: medicalConditions || null,
                    medications: medications || null,
                    disabilities: disabilities || null,
                    dietary_restrictions: dietaryRestrictions || null,
                    special_health_instructions: specialHealthInstructions || null,
                    doctor_name: doctorName || null,
                    doctor_phone: doctorPhone || null,
                    doctor_address: doctorAddress || null,
                    insurance_provider: insuranceProvider || null,
                    insurance_policy_no: insurancePolicyNo || null,



                    uses_transport: usesTransport,
                    transport_route: usesTransport ? transportRoute || null : null,
                    transport_stop: usesTransport ? transportStop || null : null,
                    pickup_point: usesTransport ? pickupPoint || null : null,
                    drop_point: usesTransport ? dropPoint || null : null,
                    transport_fee: usesTransport && transportFee !== "" ? Number(transportFee) : null,
                    transport_start_date: usesTransport ? transportStartDate || null : null,
                    transport_end_date: usesTransport ? transportEndDate || null : null,



                    uses_hostel: usesHostel,
                    hostel_name: usesHostel ? hostelName || null : null,
                    hostel_block: usesHostel ? hostelBlock || null : null,
                    hostel_room_no: usesHostel ? hostelRoomNo || null : null,
                    hostel_join_date: usesHostel ? hostelJoinDate || null : null,
                    hostel_leave_date: usesHostel ? hostelLeaveDate || null : null,



                    fee_category: feeCategory || null,
                    concession_type: concessionType || null,
                    concession_percentage:
                        concessionPercentage !== "" ? Number(concessionPercentage) : null,
                    scholarship_name: scholarshipName || null,
                    scholarship_amount:
                        scholarshipAmount !== "" ? Number(scholarshipAmount) : null,
                    bank_account_no: bankAccountNo || null,
                    bank_name: bankName || null,
                    ifsc: ifsc.trim() ? ifsc.trim().toUpperCase() : null,


                    academic_year_id: academicYearId || null,
                    house_id: houseId || null,
                    elective_subjects: electiveSubjects
                        ? electiveSubjects
                            .split(",")
                            .map((subject) => subject.trim())
                            .filter(Boolean)
                        : null,


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


    function isStudentAccountEligible(student: Student) {
        const className =
            classes.find((item) => item.id === student.class_id)?.name || "";

        const normalized = className.trim().toLowerCase();

        return (
            student.is_active &&
            !student.user_id &&
            !student.login_username &&
            !/\b(nursery|lkg|ukg|kg|kindergarten)\b/.test(normalized) &&
            /\b(10|[1-9])\b/.test(normalized)
        );
    }

    function getVisibleEligibleStudents() {
        const search = studentSearch.toLowerCase().trim();

        return students.filter((student) => {
            const matchesSearch =
                !search ||
                student.admission_no.toLowerCase().includes(search) ||
                student.name.toLowerCase().includes(search) ||
                (student.student_email || "").toLowerCase().includes(search) ||
                (student.student_phone || "").toLowerCase().includes(search) ||
                (student.parent_name || "").toLowerCase().includes(search) ||
                (student.parent_phone || "").toLowerCase().includes(search) ||
                (student.parent_email || "").toLowerCase().includes(search);

            const matchesDob =
                !studentDobFilter ||
                student.date_of_birth === studentDobFilter;

            const matchesGender =
                studentGenderFilter === "all" ||
                student.gender === studentGenderFilter;

            const matchesClass =
                studentClassFilter === "all" ||
                student.class_id === studentClassFilter;

            const matchesSection =
                studentSectionFilter === "all" ||
                sections.find((section) => section.id === student.section_id)?.name ===
                studentSectionFilter;

            const matchesStatus =
                studentStatusFilter === "all" ||
                (studentStatusFilter === "active" && student.is_active) ||
                (studentStatusFilter === "inactive" && !student.is_active);

            return (
                matchesSearch &&
                matchesDob &&
                matchesGender &&
                matchesClass &&
                matchesSection &&
                matchesStatus &&
                isStudentAccountEligible(student)
            );
        });
    }



    function getVisibleStudentsWithAccounts() {
        const search = studentSearch.toLowerCase().trim();

        return students.filter((student) => {
            const className =
                classes.find((item) => item.id === student.class_id)?.name || "";

            const normalized = className.trim().toLowerCase();

            const isEligibleClass =
                !/\b(nursery|lkg|ukg|kg|kindergarten)\b/.test(normalized) &&
                /\b(10|[1-9])\b/.test(normalized);

            const matchesSearch =
                !search ||
                student.admission_no.toLowerCase().includes(search) ||
                student.name.toLowerCase().includes(search) ||
                (student.student_email || "").toLowerCase().includes(search) ||
                (student.student_phone || "").toLowerCase().includes(search) ||
                (student.parent_name || "").toLowerCase().includes(search) ||
                (student.parent_phone || "").toLowerCase().includes(search) ||
                (student.parent_email || "").toLowerCase().includes(search);

            const matchesDob =
                !studentDobFilter ||
                student.date_of_birth === studentDobFilter;

            const matchesGender =
                studentGenderFilter === "all" ||
                student.gender === studentGenderFilter;

            const matchesClass =
                studentClassFilter === "all" ||
                student.class_id === studentClassFilter;

            const matchesSection =
                studentSectionFilter === "all" ||
                sections.find((section) => section.id === student.section_id)?.name ===
                studentSectionFilter;

            const matchesStatus =
                studentStatusFilter === "all" ||
                (studentStatusFilter === "active" && student.is_active) ||
                (studentStatusFilter === "inactive" && !student.is_active);

            return (
                student.is_active &&
                !!student.user_id &&
                !!student.login_username &&
                isEligibleClass &&
                matchesSearch &&
                matchesDob &&
                matchesGender &&
                matchesClass &&
                matchesSection &&
                matchesStatus
            );
        });
    }

    function toggleAccountStudentSelection(studentId: string) {
        setSelectedAccountStudentIds((current) =>
            current.includes(studentId)
                ? current.filter((id) => id !== studentId)
                : [...current, studentId]
        );
    }

    function toggleSelectAllStudentsWithAccounts() {
        const visibleIds = getVisibleStudentsWithAccounts().map(
            (student) => student.id
        );

        const allVisibleSelected =
            visibleIds.length > 0 &&
            visibleIds.every((id) => selectedAccountStudentIds.includes(id));

        setSelectedAccountStudentIds((current) =>
            allVisibleSelected
                ? current.filter((id) => !visibleIds.includes(id))
                : Array.from(new Set([...current, ...visibleIds]))
        );
    }


    function toggleStudentSelection(studentId: string) {
        setSelectedStudentIds((current) =>
            current.includes(studentId)
                ? current.filter((id) => id !== studentId)
                : [...current, studentId]
        );
    }

    function toggleSelectAllEligibleStudents() {
        const visibleIds = getVisibleEligibleStudents().map((student) => student.id);
        const allVisibleSelected =
            visibleIds.length > 0 &&
            visibleIds.every((id) => selectedStudentIds.includes(id));

        setSelectedStudentIds((current) =>
            allVisibleSelected
                ? current.filter((id) => !visibleIds.includes(id))
                : Array.from(new Set([...current, ...visibleIds]))
        );
    }

    function toggleSelectAllSelectableStudents() {
        const eligibleIds = getVisibleEligibleStudents().map(
            (student) => student.id
        );

        const accountIds = getVisibleStudentsWithAccounts().map(
            (student) => student.id
        );

        const allSelected =
            eligibleIds.every((id) => selectedStudentIds.includes(id)) &&
            accountIds.every((id) => selectedAccountStudentIds.includes(id)) &&
            eligibleIds.length + accountIds.length > 0;

        if (allSelected) {
            setSelectedStudentIds((current) =>
                current.filter((id) => !eligibleIds.includes(id))
            );

            setSelectedAccountStudentIds((current) =>
                current.filter((id) => !accountIds.includes(id))
            );
        } else {
            setSelectedStudentIds((current) =>
                Array.from(new Set([...current, ...eligibleIds]))
            );

            setSelectedAccountStudentIds((current) =>
                Array.from(new Set([...current, ...accountIds]))
            );
        }
    }



    function copyAllCredentials() {
        if (!credentialModalData?.credentials.length) return;

        const text = credentialModalData.credentials
            .map((item) =>
                `Student: ${item.studentName}\n` +
                `School Code: ${item.schoolCode}\n` +
                `Username: ${item.username}\n` +
                `Temporary Password: ${item.temporaryPassword}`
            )
            .join("\n\n----------------------\n\n");

        navigator.clipboard.writeText(text).catch((error) => {
            console.error("Could not copy credentials:", error);
        });
    }

    function copySingleCredential(item: GeneratedCredential) {
        const text =
            `Student: ${item.studentName}\n` +
            `School Code: ${item.schoolCode}\n` +
            `Username: ${item.username}\n` +
            `Temporary Password: ${item.temporaryPassword}`;

        navigator.clipboard.writeText(text).catch((error) => {
            console.error("Could not copy credentials:", error);
        });
    }

    function downloadCredentialsCSV() {
        if (!credentialModalData?.credentials.length) return;

        const confirmed = window.confirm(
            "This CSV contains temporary passwords in plain text. Store it securely and delete it after distributing the credentials. Continue?"
        );

        if (!confirmed) return;

        const headers = [
            "Student Name",
            "School Code",
            "Username",
            "Temporary Password",
        ];

        const escapeCSV = (value: string) =>
            `"${value.replace(/"/g, '""')}"`;

        const rows = credentialModalData.credentials.map((item) => [
            item.studentName,
            item.schoolCode,
            item.username,
            item.temporaryPassword,
        ]);

        const csv = [
            headers.map(escapeCSV).join(","),
            ...rows.map((row) => row.map(escapeCSV).join(",")),
        ].join("\r\n");

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `student-credentials-${new Date().toISOString().slice(0, 10)}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }



    async function handleGenerateStudentAccount(student: Student) {
        if (!student.is_active) {
            alert("Activate this student before generating an account.");
            return;
        }

        if (student.user_id || student.login_username) {
            alert("This student already has login details.");
            return;
        }

        const confirmed = window.confirm(
            `Generate a student login account for ${student.name}?`
        );

        if (!confirmed) return;

        setGeneratingStudentId(student.id);

        try {
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError || !session?.access_token) {
                throw new Error("Your session has expired. Please log in again.");
            }

            const response = await fetch(
                "/api/admin/generate-student-accounts",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        studentId: student.id,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Account generation failed."
                );
            }

            const credentials = result.credentials;

            // alert(
            //     `Student account created successfully!\n\n` +
            //     `Student: ${credentials.studentName}\n` +
            //     `School Code: ${credentials.schoolCode}\n` +
            //     `Username: ${credentials.username}\n` +
            //     `Temporary Password: ${credentials.temporaryPassword}\n\n` +
            //     `Please save these credentials. The student should change the password after the first login.`
            // );

            setCredentialModalData({
                credentials: [
                    {
                        studentId: student.id,
                        studentName: credentials.studentName,
                        schoolCode: credentials.schoolCode,
                        username: credentials.username,
                        temporaryPassword: credentials.temporaryPassword,
                    },
                ],
                failures: [],
            });

            await loadPeople();

        } catch (error) {
            console.error("Student account generation error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Could not generate student account."
            );

        } finally {
            setGeneratingStudentId(null);
        }
    }


    async function handleRegenerateStudentPassword(student: Student) {
        const confirmed = window.confirm(
            `Regenerate the temporary password for ${student.name}?\n\n` +
            `The student's current password will stop working. ` +
            `They will need to set a new password at their next login.`
        );

        if (!confirmed) return;

        setRegeneratingStudentId(student.id);

        try {
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError || !session?.access_token) {
                throw new Error("Your session has expired. Please log in again.");
            }

            const response = await fetch(
                "/api/admin/regenerate-student-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        studentId: student.id,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Password regeneration failed."
                );
            }

            const credentials = result.credentials;

            setCredentialModalData({
                credentials: [
                    {
                        studentId: student.id,
                        studentName: credentials.studentName,
                        schoolCode: credentials.schoolCode,
                        username: credentials.username,
                        temporaryPassword: credentials.temporaryPassword,
                    },
                ],
                failures: [],
            });

            await loadPeople();

        } catch (error) {
            console.error("Student password regeneration error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Could not regenerate student password."
            );

        } finally {
            setRegeneratingStudentId(null);
        }
    }

    async function handleRegenerateSelectedStudentPasswords() {
        if (selectedAccountStudentIds.length === 0) {
            alert("Please select at least one student.");
            return;
        }

        if (selectedAccountStudentIds.length > 100) {
            alert("Please select no more than 100 students at a time.");
            return;
        }

        const confirmed = window.confirm(
            `Regenerate temporary passwords for ${selectedAccountStudentIds.length} students?\n\n` +
            `Their current passwords will stop working. Each student will need to set a new password at their next login.`
        );

        if (!confirmed) return;

        setIsBulkRegenerating(true);

        try {
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError || !session?.access_token) {
                throw new Error("Your session has expired. Please log in again.");
            }

            const successfulCredentials: GeneratedCredential[] = [];
            const failures: { studentName: string; error: string }[] = [];
            const failedStudentIds: string[] = [];

            for (const studentId of selectedAccountStudentIds) {
                const student = students.find((item) => item.id === studentId);

                if (!student) continue;

                try {
                    const response = await fetch(
                        "/api/admin/regenerate-student-password",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${session.access_token}`,
                            },
                            body: JSON.stringify({ studentId }),
                        }
                    );

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            result.error || "Password regeneration failed."
                        );
                    }

                    successfulCredentials.push({
                        studentId: student.id,
                        studentName: result.credentials.studentName,
                        schoolCode: result.credentials.schoolCode,
                        username: result.credentials.username,
                        temporaryPassword: result.credentials.temporaryPassword,
                    });

                } catch (error) {
                    failedStudentIds.push(studentId);
                    failures.push({
                        studentName: student.name,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Password regeneration failed.",
                    });
                }
            }

            setCredentialModalData({
                credentials: successfulCredentials,
                failures,
            });

            // Keep failed students selected so the admin can retry.
            setSelectedAccountStudentIds(
                selectedAccountStudentIds.filter((id) =>
                    failedStudentIds.includes(id)
                )
            );

            await loadPeople();

        } catch (error) {
            console.error("Bulk password regeneration error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Bulk password regeneration failed."
            );

        } finally {
            setIsBulkRegenerating(false);
        }
    }


    async function handleGenerateSelectedStudentAccounts() {
        if (selectedStudentIds.length === 0) {
            alert("Please select at least one eligible student.");
            return;
        }

        const confirmed = window.confirm(
            `Generate login accounts for ${selectedStudentIds.length} selected students?`
        );

        if (!confirmed) return;

        setIsBulkGenerating(true);

        try {
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError || !session?.access_token) {
                throw new Error("Your session has expired. Please log in again.");
            }

            const response = await fetch(
                "/api/admin/generate-student-accounts",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        studentIds: selectedStudentIds,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Bulk account generation failed.");
            }

            const successfulResults = result.results.filter(
                (item: any) => item.success
            );

            const failedResults = result.results.filter(
                (item: any) => !item.success
            );

            // Keep only failed students selected for a possible retry.
            setSelectedStudentIds(
                failedResults.map((item: any) => item.studentId)
            );

            const credentialsText = successfulResults
                .map((item: any) => {
                    const credentials = item.credentials;

                    return (
                        `Student: ${item.studentName}\n` +
                        `School Code: ${credentials.schoolCode}\n` +
                        `Username: ${credentials.username}\n` +
                        `Temporary Password: ${credentials.temporaryPassword}`
                    );
                })
                .join("\n\n----------------------\n\n");

            const failuresText = failedResults
                .map((item: any) => {
                    const studentName =
                        students.find((student) => student.id === item.studentId)?.name ||
                        item.studentId;

                    return `${studentName}: ${item.error}`;
                })
                .join("\n");

            let message =
                `Bulk account generation completed!\n\n` +
                `Total: ${result.summary.total}\n` +
                `Successful: ${result.summary.successful}\n` +
                `Failed: ${result.summary.failed}`;

            if (credentialsText) {
                message += `\n\n===== SUCCESSFUL ACCOUNTS =====\n\n${credentialsText}`;
            }

            if (failuresText) {
                message += `\n\n===== FAILED ACCOUNTS =====\n\n${failuresText}`;
            }

            if (successfulResults.length > 0) {
                message +=
                    "\n\nPlease save the temporary credentials securely. Students must change their passwords after first login.";
            }

            alert(message);

            await loadPeople();

        } catch (error) {
            console.error("Bulk student account generation error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Bulk account generation failed."
            );

        } finally {
            setIsBulkGenerating(false);
        }
    }



    async function handleDeactivateStudent(student: Student) {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${student.name}?`
        );

        if (!confirmed) return;

        try {
            const schoolId = await getAdminSchoolId();

            const { data, error } = await supabase
                .from("students")
                .update({ is_active: false })
                .eq("id", student.id)
                .eq("school_id", schoolId)
                .select("id, is_active")
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                throw new Error(
                    "No student record was updated. Check your school access and Supabase permissions."
                );
            }

            if (data.is_active !== false) {
                throw new Error("The database did not confirm deactivation.");
            }

            await loadPeople();
            alert("Student has been deactivated successfully.");
        } catch (error) {
            console.error("Could not deactivate student:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Could not deactivate student. Please try again."
            );
        }
    }


    async function handleRestoreStudent(student: Student) {
        const confirmed = window.confirm(
            `Reactivate ${student.name}?`
        );

        if (!confirmed) return;

        try {
            const schoolId = await getAdminSchoolId();

            const { data, error } = await supabase
                .from("students")
                .update({ is_active: true })
                .eq("id", student.id)
                .eq("school_id", schoolId)
                .select("id, is_active")
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                throw new Error(
                    "No student record was updated. Check your school access and Supabase permissions."
                );
            }

            if (data.is_active !== true) {
                throw new Error("The database did not confirm reactivation.");
            }

            await loadPeople();
            alert("Student has been reactivated successfully.");
        } catch (error) {
            console.error("Could not reactivate student:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Could not reactivate student. Please try again."
            );
        }
    }




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
            { }
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

            { }
            <div className="flex gap-2 mt-8 border-b">
                <button
                    type="button"
                    onClick={() => {
                        resetTeacherForm();
                        resetStudentForm();
                        setActiveTab("teachers");
                    }}
                    className={`px-5 py-3 font-medium ${activeTab === "teachers"
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
                    className={`px-5 py-3 font-medium ${activeTab === "students"
                        ? "border-b-2 border-emerald-600 text-emerald-700"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Students ({students.length})
                </button>
            </div>

            { }
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
                                    Employee ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    placeholder="e.g. EMP-101"
                                    required
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" htmlFor="teacherDob">
                                    Date of Birth <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="teacherDob"
                                    type="date"
                                    value={teacherDob}
                                    onChange={(e) => setTeacherDob(e.target.value)}
                                    onClick={(e) => {
                                        e.currentTarget.showPicker();
                                    }}
                                    className="w-full border rounded-md p-3"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={teacherPhone}
                                    onChange={(e) =>
                                        setTeacherPhone(
                                            e.target.value.replace(/\D/g, "")
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
                                    Email  <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={teacherEmail}
                                    onChange={(e) => setTeacherEmail(e.target.value)}
                                    placeholder="e.g. teacher@school.com"
                                    className="w-full border rounded-md p-3"
                                    required
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

            { }
            {showStudentForm && activeTab === "students" && (
                <div className="bg-white rounded-xl shadow-sm p-6 mt-6">

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>


                            <h2 className="text-xl font-semibold">Add Student</h2>

                            <p className="text-gray-500 mt-1">
                                Add student information to your school.
                            </p>


                        </div>


                    </div>


                    <form onSubmit={handleSaveStudent} className="mt-6">

                        {/* ===================================================== */}
                        {/* BASIC INFORMATION */}
                        {/* ===================================================== */}

                        <div className="mb-5">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Basic Information
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Basic identity and personal information of the student.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Admission No. */}
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

                            {/* Registration No. */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Registration No.
                                </label>

                                <input
                                    type="text"
                                    value={registrationNo}
                                    onChange={(e) => setRegistrationNo(e.target.value)}
                                    placeholder="e.g. REG-1001"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>


                            {/* Student Name */}
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

                            {/* Gender */}
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

                            {/* Date of Birth */}
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

                            {/* Blood Group */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Blood Group
                                </label>

                                <select
                                    value={bloodGroup}
                                    onChange={(e) => setBloodGroup(e.target.value)}
                                    className="w-full border rounded-md p-3 bg-white"
                                >
                                    <option value="">Select blood group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>

                            {/* Nationality */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Nationality
                                </label>

                                <input
                                    type="text"
                                    value={nationality}
                                    onChange={(e) => setNationality(e.target.value)}
                                    placeholder="e.g. Indian"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Religion */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Religion
                                </label>

                                <input
                                    type="text"
                                    value={religion}
                                    onChange={(e) => setReligion(e.target.value)}
                                    placeholder="e.g. Hindu"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Category
                                </label>

                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="e.g. General"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Caste */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Caste
                                </label>

                                <input
                                    type="text"
                                    value={caste}
                                    onChange={(e) => setCaste(e.target.value)}
                                    placeholder="Enter caste"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Mother Tongue */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Mother Tongue
                                </label>

                                <input
                                    type="text"
                                    value={motherTongue}
                                    onChange={(e) => setMotherTongue(e.target.value)}
                                    placeholder="e.g. Hindi"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Aadhaar Number */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Aadhaar Number
                                </label>

                                <input
                                    type="text"
                                    value={studentAadharNumber}
                                    onChange={(e) => setStudentAadharNumber(e.target.value)}
                                    placeholder="Enter Aadhaar number"
                                    maxLength={20}
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* APAAR ID */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    APAAR ID
                                </label>

                                <input
                                    type="text"
                                    value={studentApaarIdNumber}
                                    onChange={(e) => setStudentApaarIdNumber(e.target.value)}
                                    placeholder="Enter APAAR ID"
                                    maxLength={50}
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                        </div>




                        {/* ===================================================== */}
                        {/* ADMISSION & ACADEMIC INFORMATION */}
                        {/* ===================================================== */}

                        <div className="border-t pt-6 mt-8 mb-5">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Admission & Academic Information
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Academic placement and admission-related information.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Admission Date */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Admission Date
                                </label>

                                <input
                                    type="date"
                                    value={admissionDate}
                                    onChange={(e) => setAdmissionDate(e.target.value)}
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Admission Type */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Admission Type
                                </label>

                                <select
                                    value={admissionType}
                                    onChange={(e) => setAdmissionType(e.target.value)}
                                    className="w-full border rounded-md p-3 bg-white"
                                >
                                    <option value="">Select admission type</option>
                                    <option value="New">New</option>
                                    <option value="Transfer">Transfer</option>
                                    <option value="Re-admission">Re-admission</option>
                                </select>
                            </div>

                            {/* Academic Year */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Academic Year
                                </label>

                                <select
                                    value={academicYearId}
                                    onChange={(e) =>
                                        setAcademicYearId(e.target.value)
                                    }
                                    className="w-full border rounded-md p-3 bg-white"
                                >
                                    <option value="">Select academic year</option>

                                    {academicYears.map((year) => (
                                        <option
                                            key={year.id}
                                            value={year.id}
                                        >
                                            {year.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Roll Number */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Roll Number
                                </label>

                                <input
                                    type="text"
                                    value={rollNumber}
                                    onChange={(e) => setRollNumber(e.target.value)}
                                    placeholder="e.g. 101"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Class */}
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

                            {/* Section */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Section
                                </label>

                                <select
                                    value={studentSectionId}
                                    onChange={(e) =>
                                        setStudentSectionId(e.target.value)
                                    }
                                    disabled={!studentClassId}
                                    className="w-full border rounded-md p-3 bg-white disabled:bg-gray-100"
                                >
                                    <option value="">Not assigned</option>

                                    {getSectionsForSelectedClass().map((section) => (
                                        <option
                                            key={section.id}
                                            value={section.id}
                                        >
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* House */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    House
                                </label>

                                <select
                                    value={houseId}
                                    onChange={(e) =>
                                        setHouseId(e.target.value)
                                    }
                                    className="w-full border rounded-md p-3 bg-white"
                                >
                                    <option value="">Not assigned</option>

                                    {houses.map((house) => (
                                        <option
                                            key={house.id}
                                            value={house.id}
                                        >
                                            {house.name}
                                            {house.code ? ` (${house.code})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Stream */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Stream
                                </label>

                                <input
                                    type="text"
                                    value={stream}
                                    onChange={(e) => setStream(e.target.value)}
                                    placeholder="e.g. Science"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Elective Subjects */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Elective Subjects
                                </label>

                                <input
                                    type="text"
                                    value={electiveSubjects}
                                    onChange={(e) =>
                                        setElectiveSubjects(e.target.value)
                                    }
                                    placeholder="e.g. Computer Science, Hindi"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Status
                                </label>

                                <select
                                    value={studentStatus}
                                    onChange={(e) =>
                                        setStudentStatus(e.target.value)
                                    }
                                    className="w-full border rounded-md p-3 bg-white"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Transferred">Transferred</option>
                                    <option value="Passed Out">Passed Out</option>
                                    <option value="Left School">Left School</option>
                                </select>
                            </div>

                            {/* Previous School Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Previous School Name
                                </label>

                                <input
                                    type="text"
                                    value={previousSchoolName}
                                    onChange={(e) =>
                                        setPreviousSchoolName(e.target.value)
                                    }
                                    placeholder="Previous school name"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Previous School Class */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Previous School Class
                                </label>

                                <input
                                    type="text"
                                    value={previousSchoolClass}
                                    onChange={(e) =>
                                        setPreviousSchoolClass(e.target.value)
                                    }
                                    placeholder="e.g. 8th"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Previous School Board */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Previous School Board
                                </label>

                                <input
                                    type="text"
                                    value={previousSchoolBoard}
                                    onChange={(e) =>
                                        setPreviousSchoolBoard(e.target.value)
                                    }
                                    placeholder="e.g. CBSE"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Previous School TC No. */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Previous School TC No.
                                </label>

                                <input
                                    type="text"
                                    value={previousSchoolTcNo}
                                    onChange={(e) =>
                                        setPreviousSchoolTcNo(e.target.value)
                                    }
                                    placeholder="Transfer certificate number"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>


                            {/* Remarks */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">
                                    Remarks
                                </label>

                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Add any comments or administrative notes about the student..."
                                    rows={3}
                                    className="w-full border rounded-md p-3 resize-y"
                                />
                            </div>


                        </div>


                        {/* ===================================================== */}
                        {/* CONTACT INFORMATION */}
                        {/* ===================================================== */}

                        <div className="border-t pt-6 mt-8 mb-5">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Contact Information
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Contact information of the student.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Student Email */}
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

                            {/* Student Phone */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Student Phone
                                </label>

                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={studentPhone}
                                    onChange={(e) =>
                                        setStudentPhone(
                                            e.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    placeholder="e.g. 9876543210"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Alternate Phone */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Alternate Phone
                                </label>

                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={studentAlternatePhone}
                                    onChange={(e) =>
                                        setStudentAlternatePhone(
                                            e.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    placeholder="e.g. 9876543210"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                        </div>


                        {/* ===================================================== */}
                        {/* ADDRESS INFORMATION */}
                        {/* ===================================================== */}

                        <div className="border-t pt-6 mt-8 mb-5">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Address Information
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Address information of the student.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">

                            {/* Current Address */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Current Address
                                </label>

                                <textarea
                                    value={currentAddress}
                                    onChange={(e) => setCurrentAddress(e.target.value)}
                                    placeholder="Enter current address"
                                    rows={3}
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Same as Current Address */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={sameAsCurrentAddress}
                                    id='sameAsCurrentAddress'
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setSameAsCurrentAddress(checked);

                                        if (checked) {
                                            setPermanentAddress(currentAddress);
                                        }
                                    }}
                                    className="h-4 w-4"
                                />

                                <label className="text-sm font-medium" htmlFor="sameAsCurrentAddress">
                                    Same as Current Address
                                </label>
                            </div>

                            {/* Permanent Address */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Permanent Address
                                </label>

                                <textarea
                                    value={permanentAddress}
                                    onChange={(e) => setPermanentAddress(e.target.value)}
                                    placeholder="Enter permanent address"
                                    rows={3}
                                    disabled={sameAsCurrentAddress}
                                    className="w-full border rounded-md p-3 disabled:bg-gray-100"
                                />
                            </div>

                        </div>


                        {/* ===================================================== */}
                        {/* PARENT / GUARDIAN INFORMATION */}
                        {/* ===================================================== */}

                        <div className="border-t pt-6 mt-8 mb-5">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Parent / Guardian Information
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Primary parent or guardian contact information.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Parent Name */}
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

                            {/* Parent Phone */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Parent Phone
                                </label>

                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={parentPhone}
                                    onChange={(e) =>
                                        setParentPhone(
                                            e.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    placeholder="e.g. 9876543210"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Parent Email */}
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

                            {/* ===================================================== */}
                            {/* FATHER INFORMATION */}
                            {/* ===================================================== */}

                            <div className="col-span-1 md:col-span-2 border-t pt-6 mt-4 mb-1">
                                <h4 className="text-base font-semibold text-gray-800">
                                    Father Information
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    Father's contact and professional information.
                                </p>
                            </div>

                            {/* Father Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Father Name
                                </label>

                                <input
                                    type="text"
                                    value={fatherName}
                                    onChange={(e) => setFatherName(e.target.value)}
                                    placeholder="e.g. Rajesh Sharma"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Father Phone */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Father Phone
                                </label>

                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={fatherPhone}
                                    onChange={(e) =>
                                        setFatherPhone(
                                            e.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    placeholder="e.g. 9876543210"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Father Alternate Phone */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Father Alternate Phone
                                </label>

                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={fatherAlternatePhone}
                                    onChange={(e) =>
                                        setFatherAlternatePhone(
                                            e.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    placeholder="e.g. 9876543210"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Father Email */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Father Email
                                </label>

                                <input
                                    type="email"
                                    value={fatherEmail}
                                    onChange={(e) => setFatherEmail(e.target.value)}
                                    placeholder="e.g. father@email.com"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Father Occupation */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Father Occupation
                                </label>

                                <input
                                    type="text"
                                    value={fatherOccupation}
                                    onChange={(e) => setFatherOccupation(e.target.value)}
                                    placeholder="e.g. Engineer"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Father Qualification */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Father Qualification
                                </label>

                                <input
                                    type="text"
                                    value={fatherQualification}
                                    onChange={(e) =>
                                        setFatherQualification(e.target.value)
                                    }
                                    placeholder="e.g. B.Tech"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Father Aadhaar */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Aadhaar Number
                                </label>

                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={12}
                                    value={fatherAadhaarNumber}
                                    onChange={(e) =>
                                        setFatherAadhaarNumber(
                                            e.target.value.replace(/\D/g, "").slice(0, 12)
                                        )
                                    }
                                    placeholder="Enter father's Aadhaar number"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Father Annual Income */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Annual Income (₹)
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={fatherAnnualIncome}
                                    onChange={(e) => setFatherAnnualIncome(e.target.value)}
                                    placeholder="e.g. 500000"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>


                            {/* ===================================================== */}
                            {/* MOTHER INFORMATION */}
                            {/* ===================================================== */}

                            <div className="col-span-1 md:col-span-2 border-t pt-6 mt-4 mb-1">
                                <h4 className="text-base font-semibold text-gray-800">
                                    Mother Information
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    Mother's contact and professional information.
                                </p>
                            </div>

                            {/* Mother Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Mother Name
                                </label>

                                <input
                                    type="text"
                                    value={motherName}
                                    onChange={(e) => setMotherName(e.target.value)}
                                    placeholder="e.g. Priya Sharma"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Mother Phone */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Mother Phone
                                </label>

                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={motherPhone}
                                    onChange={(e) =>
                                        setMotherPhone(
                                            e.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    placeholder="e.g. 9876543210"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Mother Alternate Phone */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Mother Alternate Phone
                                </label>

                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={motherAlternatePhone}
                                    onChange={(e) =>
                                        setMotherAlternatePhone(
                                            e.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    placeholder="e.g. 9876543210"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Mother Email */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Mother Email
                                </label>

                                <input
                                    type="email"
                                    value={motherEmail}
                                    onChange={(e) => setMotherEmail(e.target.value)}
                                    placeholder="e.g. mother@email.com"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Mother Occupation */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Mother Occupation
                                </label>

                                <input
                                    type="text"
                                    value={motherOccupation}
                                    onChange={(e) => setMotherOccupation(e.target.value)}
                                    placeholder="e.g. Teacher"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Mother Qualification */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Mother Qualification
                                </label>

                                <input
                                    type="text"
                                    value={motherQualification}
                                    onChange={(e) =>
                                        setMotherQualification(e.target.value)
                                    }
                                    placeholder="e.g. M.A."
                                    className="w-full border rounded-md p-3"
                                />
                            </div>


                            {/* Mother Aadhaar */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Aadhaar Number
                                </label>

                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={12}
                                    value={motherAadhaarNumber}
                                    onChange={(e) =>
                                        setMotherAadhaarNumber(
                                            e.target.value.replace(/\D/g, "").slice(0, 12)
                                        )
                                    }
                                    placeholder="Enter mother's Aadhaar number"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            {/* Mother Annual Income */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Annual Income (₹)
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={motherAnnualIncome}
                                    onChange={(e) => setMotherAnnualIncome(e.target.value)}
                                    placeholder="e.g. 300000"
                                    className="w-full border rounded-md p-3"
                                />
                            </div>






                            {/* ===================================================== */}
                            {/* GUARDIAN INFORMATION */}
                            {/* ===================================================== */}

                            <div className="col-span-1 md:col-span-2 border-t pt-6 mt-4 mb-1">
                                <h4 className="text-base font-semibold text-gray-800">
                                    Guardian Information
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    Select a parent or enter details for a separate guardian.
                                </p>
                            </div>

                            {/* Guardian Type */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Guardian Type
                                </label>

                                <select
                                    value={guardianType}
                                    onChange={(e) => setGuardianType(e.target.value)}
                                    className="w-full border rounded-md p-3 bg-white"
                                >
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Separate Guardian">Separate Guardian</option>
                                </select>
                            </div>

                            {/* Primary Guardian */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={isPrimaryGuardian}
                                    onChange={(e) => setIsPrimaryGuardian(e.target.checked)}
                                    className="h-4 w-4"
                                />

                                <label className="text-sm font-medium">
                                    Primary Guardian
                                </label>
                            </div>

                            {/* Selected Parent Information */}
                            {guardianType !== "Separate Guardian" && (
                                <div className="col-span-1 md:col-span-2 rounded-md bg-gray-50 border p-4">
                                    <p className="text-sm text-gray-600">
                                        {guardianType === "Father"
                                            ? `Father: ${fatherName || "Name not entered"}`
                                            : `Mother: ${motherName || "Name not entered"}`}
                                    </p>

                                    <p className="text-sm text-gray-500 mt-1">
                                        The selected parent's existing details will be used.
                                    </p>
                                </div>
                            )}

                            {/* Separate Guardian Fields */}
                            {guardianType === "Separate Guardian" && (
                                <>
                                    {/* Guardian Name */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Guardian Name
                                        </label>
                                        <input
                                            type="text"
                                            value={guardianName}
                                            onChange={(e) => setGuardianName(e.target.value)}
                                            placeholder="Enter guardian name"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    {/* Relation */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Relation
                                        </label>
                                        <input
                                            type="text"
                                            value={guardianRelation}
                                            onChange={(e) => setGuardianRelation(e.target.value)}
                                            placeholder="e.g. Grandfather, Uncle"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    {/* Guardian Phone */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Guardian Phone
                                        </label>
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            value={guardianPhone}
                                            onChange={(e) =>
                                                setGuardianPhone(e.target.value.replace(/\D/g, ""))
                                            }
                                            placeholder="e.g. 9876543210"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    {/* Alternate Phone */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Alternate Phone
                                        </label>
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            value={guardianAlternatePhone}
                                            onChange={(e) =>
                                                setGuardianAlternatePhone(
                                                    e.target.value.replace(/\D/g, "")
                                                )
                                            }
                                            placeholder="e.g. 9123456789"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    {/* Guardian Email */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Guardian Email
                                        </label>
                                        <input
                                            type="email"
                                            value={guardianEmail}
                                            onChange={(e) => setGuardianEmail(e.target.value)}
                                            placeholder="e.g. guardian@email.com"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    {/* Guardian Occupation */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Guardian Occupation
                                        </label>
                                        <input
                                            type="text"
                                            value={guardianOccupation}
                                            onChange={(e) => setGuardianOccupation(e.target.value)}
                                            placeholder="e.g. Business"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    {/* Guardian Qualification */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Guardian Qualification
                                        </label>
                                        <input
                                            type="text"
                                            value={guardianQualification}
                                            onChange={(e) => setGuardianQualification(e.target.value)}
                                            placeholder="e.g. Graduate"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    {/* Guardian Address */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">
                                            Guardian Address
                                        </label>
                                        <textarea
                                            value={guardianAddress}
                                            onChange={(e) => setGuardianAddress(e.target.value)}
                                            placeholder="Enter guardian's full address"
                                            rows={3}
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>
                                </>
                            )}



                            {/* =====================================================
    EMERGENCY CONTACT INFORMATION
===================================================== */}

                            <div className="col-span-1 md:col-span-2 border-t pt-6 mt-4 mb-1 space-y-4">
                                <div>
                                    <h4 className="text-base font-semibold text-gray-800">
                                        Emergency Contact Information
                                    </h4>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Select the person to contact in case of an emergency.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Emergency Contact Person
                                        </label>

                                        <select
                                            value={emergencyContactType}
                                            onChange={(e) =>
                                                setEmergencyContactType(e.target.value)
                                            }
                                            className="w-full border rounded-md p-3 bg-white"
                                        >
                                            <option value="Father">Father</option>
                                            <option value="Mother">Mother</option>
                                            <option value="Guardian">Guardian</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                </div>

                                {emergencyContactType === "Other" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Contact Person Name
                                            </label>
                                            <input
                                                type="text"
                                                value={emergencyContactName}
                                                onChange={(e) => setEmergencyContactName(e.target.value)}
                                                placeholder="Enter contact person's name"
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                value={emergencyContactPhone}
                                                onChange={(e) =>
                                                    setEmergencyContactPhone(
                                                        e.target.value.replace(/\D/g, "").slice(0, 20)
                                                    )
                                                }
                                                placeholder="Enter phone number"
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Alternate Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                value={emergencyContactAlternatePhone}
                                                onChange={(e) =>
                                                    setEmergencyContactAlternatePhone(
                                                        e.target.value.replace(/\D/g, "").slice(0, 20)
                                                    )
                                                }
                                                placeholder="Enter alternate phone number"
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={emergencyContactEmail}
                                                onChange={(e) => setEmergencyContactEmail(e.target.value)}
                                                placeholder="Enter email address"
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Relation to Student
                                            </label>
                                            <input
                                                type="text"
                                                value={emergencyContactRelation}
                                                onChange={(e) => setEmergencyContactRelation(e.target.value)}
                                                placeholder="e.g. Uncle, Aunt"
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-2">
                                                Address
                                            </label>
                                            <textarea
                                                value={emergencyContactAddress}
                                                onChange={(e) => setEmergencyContactAddress(e.target.value)}
                                                rows={3}
                                                placeholder="Enter contact person's address"
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>
                                    </div>
                                )}

                            </div>


                            {/* =====================================================
    HEALTH & MEDICAL INFORMATION
===================================================== */}

                            <div className="col-span-1 md:col-span-2 border-t pt-6 mt-4 mb-1 space-y-4">
                                <div>
                                    <h4 className="text-base font-semibold text-gray-800">
                                        9. Health & Medical Information
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Provide the student's health, medical, and insurance details.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Allergies</label>
                                        <textarea
                                            value={allergies}
                                            onChange={(e) => setAllergies(e.target.value)}
                                            rows={2}
                                            placeholder="Enter any known allergies"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Medical Conditions</label>
                                        <textarea
                                            value={medicalConditions}
                                            onChange={(e) => setMedicalConditions(e.target.value)}
                                            rows={2}
                                            placeholder="Enter medical conditions"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Medications</label>
                                        <textarea
                                            value={medications}
                                            onChange={(e) => setMedications(e.target.value)}
                                            rows={2}
                                            placeholder="Enter current medications"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Disabilities</label>
                                        <textarea
                                            value={disabilities}
                                            onChange={(e) => setDisabilities(e.target.value)}
                                            rows={2}
                                            placeholder="Enter relevant disability information, if any"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Dietary Restrictions</label>
                                        <textarea
                                            value={dietaryRestrictions}
                                            onChange={(e) => setDietaryRestrictions(e.target.value)}
                                            rows={2}
                                            placeholder="Enter dietary restrictions"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Special Health Instructions</label>
                                        <textarea
                                            value={specialHealthInstructions}
                                            onChange={(e) => setSpecialHealthInstructions(e.target.value)}
                                            rows={2}
                                            placeholder="Enter special health instructions"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Doctor Name</label>
                                        <input
                                            type="text"
                                            value={doctorName}
                                            onChange={(e) => setDoctorName(e.target.value)}
                                            placeholder="Enter doctor's name"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Doctor Phone</label>
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            value={doctorPhone}
                                            onChange={(e) =>
                                                setDoctorPhone(e.target.value.replace(/\D/g, "").slice(0, 20))
                                            }
                                            placeholder="Enter doctor's phone number"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Doctor Address</label>
                                        <textarea
                                            value={doctorAddress}
                                            onChange={(e) => setDoctorAddress(e.target.value)}
                                            rows={2}
                                            placeholder="Enter doctor's address"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Insurance Provider</label>
                                        <input
                                            type="text"
                                            value={insuranceProvider}
                                            onChange={(e) => setInsuranceProvider(e.target.value)}
                                            placeholder="Enter insurance provider"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Insurance Policy No.</label>
                                        <input
                                            type="text"
                                            value={insurancePolicyNo}
                                            onChange={(e) => setInsurancePolicyNo(e.target.value)}
                                            placeholder="Enter insurance policy number"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>
                                </div>
                            </div>



                            {/* =====================================================
    TRANSPORT INFORMATION
===================================================== */}

                            <div className="col-span-1 md:col-span-2 border-t pt-6 mt-4 mb-1 space-y-4">
                                <div>
                                    <h4 className="text-base font-semibold text-gray-800">
                                        10. Transport Information
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Provide the student's school transport details.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        id="usesTransport"
                                        type="checkbox"
                                        checked={usesTransport}
                                        onChange={(e) => setUsesTransport(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="usesTransport" className="text-sm font-medium">
                                        Uses Transport
                                    </label>
                                </div>

                                {usesTransport && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Route</label>
                                            <input
                                                type="text"
                                                value={transportRoute}
                                                onChange={(e) => setTransportRoute(e.target.value)}
                                                placeholder="Enter transport route"
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Stop</label>
                                            <input
                                                type="text"
                                                value={transportStop}
                                                onChange={(e) => setTransportStop(e.target.value)}
                                                placeholder="Enter transport stop"
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Pickup Point</label>
                                            <input
                                                type="text"
                                                value={pickupPoint}
                                                onChange={(e) => setPickupPoint(e.target.value)}
                                                placeholder="Enter pickup point"
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Drop Point</label>
                                            <input
                                                type="text"
                                                value={dropPoint}
                                                onChange={(e) => setDropPoint(e.target.value)}
                                                placeholder="Enter drop point"
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Transport Fee</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={transportFee}
                                                onChange={(e) => setTransportFee(e.target.value)}
                                                placeholder="Enter transport fee"
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Start Date</label>
                                            <input
                                                type="date"
                                                value={transportStartDate}
                                                onChange={(e) => setTransportStartDate(e.target.value)}
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">End Date</label>
                                            <input
                                                type="date"
                                                value={transportEndDate}
                                                onChange={(e) => setTransportEndDate(e.target.value)}
                                                min={transportStartDate || undefined}
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>




                            {/* =====================================================
    HOSTEL INFORMATION
===================================================== */}

                            <div className="col-span-1 md:col-span-2 border-t pt-6 mt-4 mb-1 space-y-4">
                                <div>
                                    <h4 className="text-base font-semibold text-gray-800">
                                        11. Hostel Information
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Provide the student's hostel accommodation details.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        id="usesHostel"
                                        type="checkbox"
                                        checked={usesHostel}
                                        onChange={(e) => setUsesHostel(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="usesHostel" className="text-sm font-medium">
                                        Uses Hostel
                                    </label>
                                </div>

                                {usesHostel && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Hostel</label>
                                            <input
                                                type="text"
                                                value={hostelName}
                                                onChange={(e) => setHostelName(e.target.value)}
                                                placeholder="Enter hostel name"
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Block</label>
                                            <input
                                                type="text"
                                                value={hostelBlock}
                                                onChange={(e) => setHostelBlock(e.target.value)}
                                                placeholder="Enter block"
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Room No.</label>
                                            <input
                                                type="text"
                                                value={hostelRoomNo}
                                                onChange={(e) => setHostelRoomNo(e.target.value)}
                                                placeholder="Enter room number"
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Join Date</label>
                                            <input
                                                type="date"
                                                value={hostelJoinDate}
                                                onChange={(e) => setHostelJoinDate(e.target.value)}
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Leave Date</label>
                                            <input
                                                type="date"
                                                value={hostelLeaveDate}
                                                onChange={(e) => setHostelLeaveDate(e.target.value)}
                                                min={hostelJoinDate || undefined}
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>




                            {/* =====================================================
    FEE & FINANCE INFORMATION
===================================================== */}

                            <div className="col-span-1 md:col-span-2 border-t pt-6 mt-4 mb-1 space-y-4">
                                <div>
                                    <h4 className="text-base font-semibold text-gray-800">
                                        12. Fee & Finance Information
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Provide the student's fee, concession, scholarship, and bank details.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Fee Category</label>
                                        <input
                                            type="text"
                                            value={feeCategory}
                                            onChange={(e) => setFeeCategory(e.target.value)}
                                            placeholder="Enter fee category"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Concession Type</label>
                                        <input
                                            type="text"
                                            value={concessionType}
                                            onChange={(e) => setConcessionType(e.target.value)}
                                            placeholder="Enter concession type"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Concession %</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={concessionPercentage}
                                            onChange={(e) => setConcessionPercentage(e.target.value)}
                                            placeholder="Enter concession percentage"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Scholarship Name</label>
                                        <input
                                            type="text"
                                            value={scholarshipName}
                                            onChange={(e) => setScholarshipName(e.target.value)}
                                            placeholder="Enter scholarship name"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Scholarship Amount</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={scholarshipAmount}
                                            onChange={(e) => setScholarshipAmount(e.target.value)}
                                            placeholder="Enter scholarship amount"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Bank Account No.</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={bankAccountNo}
                                            onChange={(e) => setBankAccountNo(e.target.value)}
                                            placeholder="Enter bank account number"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Bank Name</label>
                                        <input
                                            type="text"
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            placeholder="Enter bank name"
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">IFSC</label>
                                        <input
                                            type="text"
                                            value={ifsc}
                                            onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                                            placeholder="Enter IFSC code"
                                            maxLength={11}
                                            className="w-full border rounded-md p-3"
                                        />
                                    </div>
                                </div>
                            </div>



                            {/* For further sections. To be implemented */}


                        </div>


                        {/* ===================================================== */}
                        {/* FORM ACTIONS */}
                        {/* ===================================================== */}

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
                                {isSaving ? "Saving..." : "Save Student"}

                            </button>

                        </div>

                    </form>

                </div>
            )}

            { }
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
                            { }
                            {activeTab === "teachers" && (
                                <div className="p-4 border-b">
                                    <p className="text-sm font-medium text-gray-600 mb-3">
                                        Filter Teachers
                                    </p>
                                    { }
                                    <div className="flex flex-wrap items-center gap-3">
                                        <input
                                            type="text"
                                            placeholder="Search name, employee ID, phone or email..."
                                            value={teacherSearch}
                                            onChange={(e) => setTeacherSearch(e.target.value)}
                                            className="border rounded-md px-3 py-2 text-sm flex-1 min-w-[280px]"
                                        />

                                        <input
                                            type="date"
                                            value={teacherDobFilter}
                                            onChange={(e) => setTeacherDobFilter(e.target.value)}
                                            className="border rounded-md px-3 py-2 text-sm"
                                        />

                                        <select
                                            value={teacherStatusFilter}
                                            onChange={(e) =>
                                                setTeacherStatusFilter(
                                                    e.target.value as "all" | "active" | "inactive"
                                                )
                                            }
                                            className="border rounded-md px-3 py-2 text-sm bg-white"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTeacherSearch("");
                                                setTeacherDobFilter("");
                                                setTeacherStatusFilter("all");
                                            }}
                                            className="border rounded-md px-3 py-2 text-sm"
                                        >
                                            Clear Filters
                                        </button>
                                        <span className="ml-auto text-sm text-gray-500 self-center">
                                            Showing{" "}
                                            {
                                                teachers.filter((teacher) => {
                                                    const search = teacherSearch.toLowerCase().trim();

                                                    const matchesSearch =
                                                        !search ||
                                                        teacher.name.toLowerCase().includes(search) ||
                                                        (teacher.employee_id || "").toLowerCase().includes(search) ||
                                                        (teacher.phone || "").toLowerCase().includes(search) ||
                                                        (teacher.email || "").toLowerCase().includes(search);

                                                    const matchesDob =
                                                        !teacherDobFilter ||
                                                        teacher.dob === teacherDobFilter;

                                                    const matchesStatus =
                                                        teacherStatusFilter === "all" ||
                                                        (teacherStatusFilter === "active" && teacher.is_active) ||
                                                        (teacherStatusFilter === "inactive" && !teacher.is_active);

                                                    return matchesSearch && matchesDob && matchesStatus;
                                                }).length
                                            }{" "}
                                            of {teachers.length} teachers
                                        </span>
                                    </div>
                                </div>
                            )}{activeTab === "students" && (
                                <div className="p-4 border-b">
                                    <p className="text-sm font-medium text-gray-600 mb-3">
                                        Filter Students
                                    </p>

                                    {/* ROW 1: Filters */}
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <input
                                            type="text"
                                            placeholder="Search admission no., name, email, phone or parent..."
                                            value={studentSearch}
                                            onChange={(e) => setStudentSearch(e.target.value)}
                                            className="border rounded-md px-3 py-2 text-sm flex-1 min-w-[280px]"
                                        />

                                        <input
                                            type="date"
                                            value={studentDobFilter}
                                            onChange={(e) => setStudentDobFilter(e.target.value)}
                                            className="border rounded-md px-3 py-2 text-sm"
                                        />

                                        <select
                                            value={studentGenderFilter}
                                            onChange={(e) => setStudentGenderFilter(e.target.value)}
                                            className="border rounded-md px-3 py-2 text-sm bg-white"
                                        >
                                            <option value="all">All Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>

                                        <select
                                            value={studentClassFilter}
                                            onChange={(e) => {
                                                setStudentClassFilter(e.target.value);
                                                setStudentSectionFilter("all");
                                            }}
                                            className="border rounded-md px-3 py-2 text-sm bg-white"
                                        >
                                            <option value="all">All Classes</option>
                                            {classes.map((schoolClass) => (
                                                <option key={schoolClass.id} value={schoolClass.id}>
                                                    {schoolClass.name}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={studentSectionFilter}
                                            onChange={(e) => setStudentSectionFilter(e.target.value)}
                                            className="border rounded-md px-3 py-2 text-sm bg-white"
                                        >
                                            <option value="all">All Sections</option>
                                            {Array.from(
                                                new Map(
                                                    sections
                                                        .filter(
                                                            (section) =>
                                                                studentClassFilter === "all" ||
                                                                section.class_id === studentClassFilter
                                                        )
                                                        .map((section) => [section.name, section])
                                                ).values()
                                            )
                                                .sort((a, b) => a.name.localeCompare(b.name))
                                                .map((section) => (
                                                    <option key={section.name} value={section.name}>
                                                        {section.name}
                                                    </option>
                                                ))}
                                        </select>

                                        <select
                                            value={studentStatusFilter}
                                            onChange={(e) =>
                                                setStudentStatusFilter(
                                                    e.target.value as "all" | "active" | "inactive"
                                                )
                                            }
                                            className="border rounded-md px-3 py-2 text-sm bg-white"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStudentSearch("");
                                                setStudentDobFilter("");
                                                setStudentGenderFilter("all");
                                                setStudentClassFilter("all");
                                                setStudentSectionFilter("all");
                                                setStudentStatusFilter("all");
                                            }}
                                            className="border rounded-md px-3 py-2 text-sm"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>

                                    {/* ROW 2: Actions & Count */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={toggleSelectAllEligibleStudents}
                                            disabled={getVisibleEligibleStudents().length === 0}
                                            className="border rounded-md px-3 py-2 text-sm disabled:opacity-50"
                                        >
                                            {getVisibleEligibleStudents().length > 0 &&
                                                getVisibleEligibleStudents().every((student) =>
                                                    selectedStudentIds.includes(student.id)
                                                )
                                                ? "Deselect All Eligible"
                                                : "Select All Eligible"}
                                        </button>

                                        <span className="text-sm text-blue-700 self-center">
                                            {selectedStudentIds.length} selected
                                        </span>

                                        <button
                                            type="button"
                                            onClick={handleGenerateSelectedStudentAccounts}
                                            disabled={selectedStudentIds.length === 0 || isBulkGenerating}
                                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {isBulkGenerating
                                                ? "Generating Accounts..."
                                                : `Generate Accounts (${selectedStudentIds.length})`}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={toggleSelectAllStudentsWithAccounts}
                                            disabled={getVisibleStudentsWithAccounts().length === 0}
                                            className="border rounded-md px-3 py-2 text-sm disabled:opacity-50"
                                        >
                                            {getVisibleStudentsWithAccounts().length > 0 &&
                                                getVisibleStudentsWithAccounts().every((student) =>
                                                    selectedAccountStudentIds.includes(student.id)
                                                )
                                                ? "Deselect All With Accounts"
                                                : "Select All With Accounts"}
                                        </button>

                                        <span className="text-sm text-orange-700 self-center">
                                            {selectedAccountStudentIds.length} selected
                                        </span>

                                        <button
                                            type="button"
                                            onClick={handleRegenerateSelectedStudentPasswords}
                                            disabled={selectedAccountStudentIds.length === 0 || isBulkRegenerating}
                                            className="px-4 py-2 rounded-lg border border-orange-500 text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                                        >
                                            {isBulkRegenerating
                                                ? "Regenerating Passwords..."
                                                : `Regenerate Passwords (${selectedAccountStudentIds.length})`}
                                        </button>

                                        <span className="ml-auto text-sm text-gray-500 self-center">
                                            Showing{" "}
                                            {
                                                students.filter((student) => {
                                                    const search = studentSearch.toLowerCase().trim();

                                                    const matchesSearch =
                                                        !search ||
                                                        student.admission_no.toLowerCase().includes(search) ||
                                                        student.name.toLowerCase().includes(search) ||
                                                        (student.student_email || "").toLowerCase().includes(search) ||
                                                        (student.student_phone || "").toLowerCase().includes(search) ||
                                                        (student.parent_name || "").toLowerCase().includes(search) ||
                                                        (student.parent_phone || "").toLowerCase().includes(search) ||
                                                        (student.parent_email || "").toLowerCase().includes(search);

                                                    const matchesDob =
                                                        !studentDobFilter ||
                                                        student.date_of_birth === studentDobFilter;

                                                    const matchesGender =
                                                        studentGenderFilter === "all" ||
                                                        student.gender === studentGenderFilter;

                                                    const matchesClass =
                                                        studentClassFilter === "all" ||
                                                        student.class_id === studentClassFilter;

                                                    const matchesSection =
                                                        studentSectionFilter === "all" ||
                                                        sections.find((section) => section.id === student.section_id)?.name ===
                                                        studentSectionFilter;

                                                    const matchesStatus =
                                                        studentStatusFilter === "all" ||
                                                        (studentStatusFilter === "active" && student.is_active) ||
                                                        (studentStatusFilter === "inactive" && !student.is_active);

                                                    return (
                                                        matchesSearch &&
                                                        matchesDob &&
                                                        matchesGender &&
                                                        matchesClass &&
                                                        matchesSection &&
                                                        matchesStatus
                                                    );
                                                }).length
                                            }{" "}
                                            of {students.length} students
                                        </span>
                                    </div>
                                </div>
                            )}

                            { }
                            {activeTab === "teachers" ? (
                                teachers.filter((teacher) => {
                                    const search = teacherSearch.toLowerCase().trim();

                                    const matchesSearch =
                                        !search ||
                                        teacher.name.toLowerCase().includes(search) ||
                                        (teacher.employee_id || "").toLowerCase().includes(search) ||
                                        (teacher.phone || "").toLowerCase().includes(search) ||
                                        (teacher.email || "").toLowerCase().includes(search);

                                    const matchesDob =
                                        !teacherDobFilter ||
                                        teacher.dob === teacherDobFilter;

                                    const matchesStatus =
                                        teacherStatusFilter === "all" ||
                                        (teacherStatusFilter === "active" && teacher.is_active) ||
                                        (teacherStatusFilter === "inactive" && !teacher.is_active);

                                    return matchesSearch && matchesDob && matchesStatus;
                                }).length === 0 ? (
                                    <div className="p-10 text-center text-gray-500">
                                        No teachers match the selected filters.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="text-left p-4">Employee ID</th>
                                                    <th className="text-left p-4">Name</th>
                                                    <th className="text-left p-4">Date of Birth</th>
                                                    <th className="text-left p-4">Phone</th>
                                                    <th className="text-left p-4">Email</th>
                                                    <th className="text-left p-4">Status</th>
                                                    <th className="text-right p-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                { }
                                                {teachers
                                                    .filter((teacher) => {
                                                        const search = teacherSearch.toLowerCase().trim();

                                                        const matchesSearch =
                                                            !search ||
                                                            teacher.name.toLowerCase().includes(search) ||
                                                            (teacher.employee_id || "").toLowerCase().includes(search) ||
                                                            (teacher.phone || "").toLowerCase().includes(search) ||
                                                            (teacher.email || "").toLowerCase().includes(search);

                                                        const matchesDob =
                                                            !teacherDobFilter ||
                                                            teacher.dob === teacherDobFilter;

                                                        const matchesStatus =
                                                            teacherStatusFilter === "all" ||
                                                            (teacherStatusFilter === "active" && teacher.is_active) ||
                                                            (teacherStatusFilter === "inactive" && !teacher.is_active);

                                                        return matchesSearch && matchesDob && matchesStatus;
                                                    })
                                                    .map((teacher) => (
                                                        <tr key={teacher.id} className="border-t">
                                                            <td className="p-4">
                                                                {teacher.employee_id || "-"}
                                                            </td>
                                                            <td className="p-4 font-medium">
                                                                {teacher.name}
                                                            </td>
                                                            <td className="p-4">
                                                                {formatDateOfBirth(teacher.dob)}
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
                                                                            router.push(`/admin/teachers/${teacher.id}/edit`)
                                                                        }
                                                                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                                                                    >
                                                                        Edit
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => router.push(`/admin/teachers/${teacher.id}`)}
                                                                        className="px-4 py-2 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50"
                                                                    >
                                                                        View Profile
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleResendPasswordSetup(teacher)
                                                                        }
                                                                        className="px-4 py-2 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50"
                                                                    >
                                                                        Resend Password Setup
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
                            ) : students.filter((student) => {
                                const search = studentSearch.toLowerCase().trim();

                                const matchesSearch =
                                    !search ||
                                    student.admission_no.toLowerCase().includes(search) ||
                                    student.name.toLowerCase().includes(search) ||
                                    (student.student_email || "").toLowerCase().includes(search) ||
                                    (student.student_phone || "").toLowerCase().includes(search) ||
                                    (student.parent_name || "").toLowerCase().includes(search) ||
                                    (student.parent_phone || "").toLowerCase().includes(search) ||
                                    (student.parent_email || "").toLowerCase().includes(search);

                                const matchesDob =
                                    !studentDobFilter ||
                                    student.date_of_birth === studentDobFilter;

                                const matchesGender =
                                    studentGenderFilter === "all" ||
                                    student.gender === studentGenderFilter;

                                const matchesClass =
                                    studentClassFilter === "all" ||
                                    student.class_id === studentClassFilter;

                                const matchesSection =
                                    studentSectionFilter === "all" ||
                                    sections.find((section) => section.id === student.section_id)?.name ===
                                    studentSectionFilter;

                                const matchesStatus =
                                    studentStatusFilter === "all" ||
                                    (studentStatusFilter === "active" && student.is_active) ||
                                    (studentStatusFilter === "inactive" && !student.is_active);

                                return (
                                    matchesSearch &&
                                    matchesDob &&
                                    matchesGender &&
                                    matchesClass &&
                                    matchesSection &&
                                    matchesStatus
                                );
                            }).length === 0 ? (
                                <div className="p-10 text-center text-gray-500">
                                    No students match the selected filters.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1000px]">
                                        {/* <table className="w-full min-w-[1500px]"> */}
                                        <thead className="bg-gray-50">
                                            {/* <tr>
                                                <th className="text-left p-4">Admission No.</th> */}

                                            <tr>
                                                {/* <th className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            getVisibleEligibleStudents().length > 0 &&
                                                            getVisibleEligibleStudents().every((student) =>
                                                                selectedStudentIds.includes(student.id)
                                                            )
                                                        }
                                                        onChange={toggleSelectAllEligibleStudents}
                                                        aria-label="Select all eligible students"
                                                    />
                                                </th> */}

                                                <th className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            (() => {
                                                                const eligibleIds = getVisibleEligibleStudents().map(
                                                                    (student) => student.id
                                                                );

                                                                const accountIds = getVisibleStudentsWithAccounts().map(
                                                                    (student) => student.id
                                                                );

                                                                return (
                                                                    eligibleIds.length + accountIds.length > 0 &&
                                                                    eligibleIds.every((id) =>
                                                                        selectedStudentIds.includes(id)
                                                                    ) &&
                                                                    accountIds.every((id) =>
                                                                        selectedAccountStudentIds.includes(id)
                                                                    )
                                                                );
                                                            })()
                                                        }
                                                        onChange={toggleSelectAllSelectableStudents}
                                                        aria-label="Select or deselect all selectable students"
                                                    />
                                                </th>


                                                <th className="text-left p-4">Admission No.</th>

                                                <th className="text-left p-4">Student Name</th>
                                                {/* <th className="text-left p-4">Student Email</th> */}
                                                <th className="text-left p-4">Student Phone</th>
                                                <th className="text-left p-4">Parent Name</th>
                                                <th className="text-left p-4">Parent Phone</th>
                                                {/* <th className="text-left p-4">Parent Email</th> */}
                                                {/* <th className="text-left p-4">Date of Birth</th> */}
                                                {/* <th className="text-left p-4">Gender</th> */}
                                                <th className="text-left p-4">Class</th>
                                                <th className="text-left p-4">Section</th>
                                                <th className="text-left p-4">Status</th>
                                                {/* <th className="text-right p-4">Actions</th> */}
                                                <th className="sticky right-0 z-20 bg-gray-50 text-right p-4 whitespace-nowrap">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            { }
                                            {students
                                                .filter((student) => {
                                                    const search = studentSearch.toLowerCase().trim();

                                                    const matchesSearch =
                                                        !search ||
                                                        student.admission_no.toLowerCase().includes(search) ||
                                                        student.name.toLowerCase().includes(search) ||
                                                        (student.student_email || "").toLowerCase().includes(search) ||
                                                        (student.student_phone || "").toLowerCase().includes(search) ||
                                                        (student.parent_name || "").toLowerCase().includes(search) ||
                                                        (student.parent_phone || "").toLowerCase().includes(search) ||
                                                        (student.parent_email || "").toLowerCase().includes(search);

                                                    const matchesDob =
                                                        !studentDobFilter ||
                                                        student.date_of_birth === studentDobFilter;

                                                    const matchesGender =
                                                        studentGenderFilter === "all" ||
                                                        student.gender === studentGenderFilter;

                                                    const matchesClass =
                                                        studentClassFilter === "all" ||
                                                        student.class_id === studentClassFilter;

                                                    const matchesSection =
                                                        studentSectionFilter === "all" ||
                                                        sections.find((section) => section.id === student.section_id)?.name ===
                                                        studentSectionFilter;

                                                    const matchesStatus =
                                                        studentStatusFilter === "all" ||
                                                        (studentStatusFilter === "active" && student.is_active) ||
                                                        (studentStatusFilter === "inactive" && !student.is_active);

                                                    return (
                                                        matchesSearch &&
                                                        matchesDob &&
                                                        matchesGender &&
                                                        matchesClass &&
                                                        matchesSection &&
                                                        matchesStatus
                                                    );
                                                })
                                                .map((student) => {
                                                    const classItem = classes.find(
                                                        (item) => item.id === student.class_id
                                                    );
                                                    const sectionItem = sections.find(
                                                        (item) => item.id === student.section_id
                                                    );

                                                    return (
                                                        // <tr key={student.id} className="border-t">
                                                        //     <td className="p-4">
                                                        //         {student.admission_no}
                                                        //     </td>

                                                        <tr key={student.id} className="border-t">

                                                            <td className="p-4 text-center">
                                                                {student.is_active && student.user_id && student.login_username ? (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedAccountStudentIds.includes(student.id)}
                                                                        onChange={() => toggleAccountStudentSelection(student.id)}
                                                                        aria-label={`Select ${student.name} for password regeneration`}
                                                                    />
                                                                ) : isStudentAccountEligible(student) ? (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedStudentIds.includes(student.id)}
                                                                        onChange={() => toggleStudentSelection(student.id)}
                                                                        aria-label={`Select ${student.name} for account generation`}
                                                                    />
                                                                ) : null}
                                                            </td>


                                                            <td className="p-4">
                                                                {student.admission_no}
                                                            </td>


                                                            <td className="p-4 font-medium">
                                                                {student.name}
                                                            </td>
                                                            {/* <td className="p-4">
                                                                {student.student_email || "-"}
                                                            </td> */}
                                                            <td className="p-4">
                                                                {student.student_phone || "-"}
                                                            </td>
                                                            <td className="p-4">
                                                                {student.parent_name || "-"}
                                                            </td>
                                                            <td className="p-4">
                                                                {student.parent_phone || "-"}
                                                            </td>
                                                            {/* <td className="p-4">
                                                                {student.parent_email || "-"}
                                                            </td> */}
                                                            {/* <td className="p-4">
                                                                {formatDateOfBirth(student.date_of_birth)}
                                                            </td> */}
                                                            {/* <td className="p-4">
                                                                {student.gender || "-"}
                                                            </td> */}
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
                                                            {/* <td className="p-4"> */}
                                                            <td className="sticky right-0 z-10 bg-white p-4 whitespace-nowrap">
                                                                <div className="flex justify-end gap-2">



                                                                    {student.is_active &&
                                                                        !student.user_id &&
                                                                        !student.login_username &&
                                                                        (() => {
                                                                            const className =
                                                                                classes.find((item) => item.id === student.class_id)?.name || "";

                                                                            const normalized = className.trim().toLowerCase();

                                                                            const isEligible =
                                                                                !/\b(nursery|lkg|ukg|kg|kindergarten)\b/.test(normalized) &&
                                                                                /\b(10|[1-9])\b/.test(normalized);

                                                                            return isEligible ? (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleGenerateStudentAccount(student)}
                                                                                    disabled={generatingStudentId === student.id}
                                                                                    className="px-4 py-2 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                                                                                >
                                                                                    {generatingStudentId === student.id
                                                                                        ? "Generating..."
                                                                                        : "Generate Account"}
                                                                                </button>
                                                                            ) : null;
                                                                        })()}




                                                                    {student.is_active &&
                                                                        student.user_id &&
                                                                        student.login_username && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRegenerateStudentPassword(student)}
                                                                                disabled={regeneratingStudentId === student.id}
                                                                                className="px-4 py-2 rounded-lg border border-orange-300 text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                                                                            >
                                                                                {regeneratingStudentId === student.id
                                                                                    ? "Regenerating..."
                                                                                    : "Regenerate Password"}
                                                                            </button>
                                                                        )}



                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            router.push(`/admin/students/${student.id}`)
                                                                        }
                                                                        className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                                                    >
                                                                        View Profile
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            router.push(`/admin/students/${student.id}/edit`)
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


            {/* Student Credentials Modal */}
            {credentialModalData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Student Login Credentials
                            </h2>

                            <button
                                type="button"
                                onClick={() => setCredentialModalData(null)}
                                className="text-2xl text-gray-500 hover:text-gray-800"
                            >
                                &times;
                            </button>
                        </div>

                        <p className="mb-4 text-sm text-red-600">
                            Save these credentials now. The temporary password
                            will not be available to view again after closing.
                        </p>

                        <div className="max-h-80 space-y-4 overflow-y-auto">
                            {credentialModalData.credentials.map((item) => (
                                <div
                                    key={item.studentId}
                                    className="rounded-lg border p-4"
                                >
                                    <h3 className="mb-3 font-semibold">
                                        {item.studentName}
                                    </h3>

                                    <p className="mb-2 text-sm">
                                        <strong>School Code:</strong>{" "}
                                        {item.schoolCode}
                                    </p>

                                    <p className="mb-2 text-sm">
                                        <strong>Username:</strong>{" "}
                                        {item.username}
                                    </p>

                                    <p className="mb-3 text-sm">
                                        <strong>Temporary Password:</strong>{" "}
                                        <span className="font-mono font-bold">
                                            {item.temporaryPassword}
                                        </span>
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => copySingleCredential(item)}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                                    >
                                        Copy Credentials
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 flex flex-wrap justify-end gap-2">
                            <button
                                type="button"
                                onClick={copyAllCredentials}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                            >
                                Copy All
                            </button>

                            <button
                                type="button"
                                onClick={downloadCredentialsCSV}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
                            >
                                Download CSV
                            </button>

                            <button
                                type="button"
                                onClick={() => setCredentialModalData(null)}
                                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}