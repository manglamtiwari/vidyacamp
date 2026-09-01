"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    isValidEmail,
    cleanPhone,
    isValidPhone,
    parseDateOfBirth,
    isValidGender,
    isRequired,
} from "@/lib/validations";
import { getUserRole } from "@/lib/getUserRole";

type SchoolClass = {
    id: string;
    name: string;
};

type SchoolSection = {
    id: string;
    class_id: string;
    name: string;
};

type ImportRow = {
    rowNumber: number;
    admission_no: string;
    name: string;
    student_email: string;
    student_phone: string;
    parent_name: string;
    parent_phone: string;
    parent_email: string;
    date_of_birth: string;
    gender: string;
    class_name: string;
    section_name: string;
    class_id: string | null;
    section_id: string | null;
    errors: string[];
};

export default function BulkStudentsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [checkingAccess, setCheckingAccess] =
        useState(true);

    const [isLoading, setIsLoading] =
        useState(true);

    const [isImporting, setIsImporting] =
        useState(false);

    const [classes, setClasses] =
        useState<SchoolClass[]>([]);

    const [sections, setSections] =
        useState<SchoolSection[]>([]);

    const [rows, setRows] =
        useState<ImportRow[]>([]);

    const [fileName, setFileName] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [importedCount, setImportedCount] =
        useState(0);

    // =========================================================
    // ADMIN ACCESS
    // =========================================================

    useEffect(() => {
        async function checkAccess() {
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

            setCheckingAccess(false);
        }

        checkAccess();
    }, [router]);

    // =========================================================
    // GET SCHOOL + CURRENT ACADEMIC YEAR DATA
    // =========================================================

    async function getAdminSchoolId() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error(
                "Your session has expired. Please log in again."
            );
        }

        const { data, error } = await supabase
            .from("school_users")
            .select("school_id")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .eq("status", "active")
            .limit(1)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            throw new Error(
                "Could not find your active school membership."
            );
        }

        return data.school_id;
    }

    async function loadClassesAndSections() {
        setIsLoading(true);

        try {
            const schoolId =
                await getAdminSchoolId();

            const {
                data: academicYear,
                error: academicYearError,
            } = await supabase
                .from("academic_years")
                .select("id")
                .eq("school_id", schoolId)
                .eq("is_current", true)
                .eq("is_active", true)
                .maybeSingle();

            if (academicYearError) {
                throw academicYearError;
            }

            if (!academicYear) {
                setClasses([]);
                setSections([]);
                return;
            }

            const {
                data: classRows,
                error: classError,
            } = await supabase
                .from("classes")
                .select("id, name")
                .eq("school_id", schoolId)
                .eq(
                    "academic_year_id",
                    academicYear.id
                )
                .eq("is_active", true)
                .order("display_order")
                .order("name");

            if (classError) {
                throw classError;
            }

            const loadedClasses =
                classRows || [];

            setClasses(loadedClasses);

            const classIds =
                loadedClasses.map(
                    (item) => item.id
                );

            if (classIds.length === 0) {
                setSections([]);
                return;
            }

            const {
                data: sectionRows,
                error: sectionError,
            } = await supabase
                .from("sections")
                .select(
                    "id, class_id, name"
                )
                .eq("school_id", schoolId)
                .eq("is_active", true)
                .in(
                    "class_id",
                    classIds
                )
                .order("display_order")
                .order("name");

            if (sectionError) {
                throw sectionError;
            }

            setSections(
                sectionRows || []
            );
        } catch (error) {
            console.error(
                "Could not load classes:",
                error
            );

            setMessage(
                "Could not load classes and sections."
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!checkingAccess) {
            loadClassesAndSections();
        }
    }, [checkingAccess]);

    // =========================================================
    // CSV TEMPLATE
    // =========================================================

    function downloadTemplate() {
        const headers = [
            "Admission No.",
            "Student Name",
            "Student Email",
            "Student Phone",
            "Parent Name",
            "Parent Phone",
            "Parent Email",
            "Date of Birth",
            "Gender",
            "Class",
            "Section",
        ];

        const example = [
            "ADM001",
            "Rahul Sharma",
            "rahul@example.com",
            "9876543210",
            "Rajesh Sharma",
            "9876543211",
            "rajesh@example.com",
            "15-05-2012",
            "Male",
            "Class 5",
            "A",
        ];

        const csv =
            headers.join(",") +
            "\n" +
            example
                .map(csvEscape)
                .join(",") +
            "\n";

        const blob = new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;",
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download =
            "students_import_template.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    function csvEscape(value: string) {
        if (
            value.includes(",") ||
            value.includes('"') ||
            value.includes("\n")
        ) {
            return `"${value.replace(
                /"/g,
                '""'
            )}"`;
        }

        return value;
    }

    // =========================================================
    // CSV PARSER
    // =========================================================

    function parseCSV(text: string) {
        const result: string[][] = [];

        let row: string[] = [];
        let value = "";
        let insideQuotes = false;

        for (
            let i = 0;
            i < text.length;
            i++
        ) {
            const char = text[i];
            const next = text[i + 1];

            if (char === '"' && insideQuotes && next === '"') {
                value += '"';
                i++;
                continue;
            }

            if (char === '"') {
                insideQuotes =
                    !insideQuotes;
                continue;
            }

            if (
                char === "," &&
                !insideQuotes
            ) {
                row.push(value);
                value = "";
                continue;
            }

            if (
                (char === "\n" ||
                    char === "\r") &&
                !insideQuotes
            ) {
                if (
                    char === "\r" &&
                    next === "\n"
                ) {
                    i++;
                }

                row.push(value);
                value = "";

                if (
                    row.some(
                        (item) =>
                            item.trim() !== ""
                    )
                ) {
                    result.push(row);
                }

                row = [];
                continue;
            }

            value += char;
        }

        row.push(value);

        if (
            row.some(
                (item) =>
                    item.trim() !== ""
            )
        ) {
            result.push(row);
        }

        return result;
    }

    // =========================================================
    // NORMALIZE HEADER
    // =========================================================

    function normalizeHeader(
        value: string
    ) {
        return value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");
    }

    // =========================================================
    // PROCESS CSV
    // =========================================================

    async function processFile(
        file: File
    ) {
        setMessage("");
        setImportedCount(0);
        setRows([]);
        setFileName(file.name);

        if (
            !file.name
                .toLowerCase()
                .endsWith(".csv")
        ) {
            setMessage(
                "Please upload a CSV file."
            );
            return;
        }

        try {
            const text =
                await file.text();

            const csvRows =
                parseCSV(text);

            if (csvRows.length < 2) {
                setMessage(
                    "The CSV does not contain any student rows."
                );
                return;
            }

            const headers =
                csvRows[0].map(
                    normalizeHeader
                );

            const requiredHeaders = [
                "admission no.",
                "student name",
                "student email",
                "student phone",
                "parent name",
                "parent phone",
                "parent email",
                "date of birth",
                "gender",
                "class",
                "section",
            ];

            const missingHeaders =
                requiredHeaders.filter(
                    (header) =>
                        !headers.includes(
                            header
                        )
                );

            if (
                missingHeaders.length >
                0
            ) {
                setMessage(
                    `Missing column(s): ${missingHeaders.join(
                        ", "
                    )}`
                );
                return;
            }

            const columnIndex =
                (name: string) =>
                    headers.indexOf(
                        normalizeHeader(
                            name
                        )
                    );

            const admissionIndex =
                columnIndex(
                    "Admission No."
                );

            const nameIndex =
                columnIndex(
                    "Student Name"
                );

            const studentEmailIndex =
                columnIndex(
                    "Student Email"
                );

            const studentPhoneIndex =
                columnIndex(
                    "Student Phone"
                );

            const parentNameIndex =
                columnIndex(
                    "Parent Name"
                );

            const parentPhoneIndex =
                columnIndex(
                    "Parent Phone"
                );

            const parentEmailIndex =
                columnIndex(
                    "Parent Email"
                );

            const dobIndex =
                columnIndex(
                    "Date of Birth"
                );

            const genderIndex =
                columnIndex(
                    "Gender"
                );

            const classIndex =
                columnIndex(
                    "Class"
                );

            const sectionIndex =
                columnIndex(
                    "Section"
                );

            const parsedRows: ImportRow[] =
                [];

            for (
                let i = 1;
                i < csvRows.length;
                i++
            ) {
                const current =
                    csvRows[i];

                const getValue = (
                    index: number
                ) =>
                    (
                        current[index] ||
                        ""
                    ).trim();

                const admission =
                    getValue(
                        admissionIndex
                    );

                const name =
                    getValue(
                        nameIndex
                    );

                const studentEmail =
                    getValue(
                        studentEmailIndex
                    );

                const studentPhone =
                    cleanPhone(
                        getValue(
                            studentPhoneIndex
                        )
                    );

                const parentName =
                    getValue(
                        parentNameIndex
                    );

                const parentPhone =
                    cleanPhone(
                        getValue(
                            parentPhoneIndex
                        )
                    );

                const parentEmail =
                    getValue(
                        parentEmailIndex
                    );

                const dob =
                    getValue(
                        dobIndex
                    );

                const gender =
                    getValue(
                        genderIndex
                    );

                const className =
                    getValue(
                        classIndex
                    );

                const sectionName =
                    getValue(
                        sectionIndex
                    );

                const errors: string[] =
                    [];

                if (!isRequired(admission)) {
                    errors.push(
                        "Admission No. is required"
                    );
                }

                if (!isRequired(name)) {
                    errors.push(
                        "Student Name is required"
                    );
                }

                if (
                    studentEmail &&
                    !isValidEmail(
                        studentEmail
                    )
                ) {
                    errors.push(
                        "Invalid student email"
                    );
                }

                if (
                    studentPhone &&
                    !isValidPhone(studentPhone)
                ) {
                    errors.push(
                        "Student Phone must contain exactly 10 digits"
                    );
                }

                if (
                    parentPhone &&
                    !isValidPhone(parentPhone)
                ) {
                    errors.push(
                        "Parent Phone must contain exactly 10 digits"
                    );
                }

                if (
                    parentEmail &&
                    !isValidEmail(
                        parentEmail
                    )
                ) {
                    errors.push(
                        "Invalid parent email"
                    );
                }

                let normalizedDob: string | null = null;

                if (dob) {
                    normalizedDob = parseDateOfBirth(dob);

                    if (!normalizedDob) {
                        errors.push(
                            "Date of Birth must use DD-MM-YYYY"
                        );
                    }
                }

                if (
                    gender &&
                    !isValidGender(gender)
                ) {
                    errors.push(
                        "Gender must be Male, Female or Other"
                    );
                }

                let classId: string | null =
                    null;

                let sectionId: string | null =
                    null;

                if (className) {
                    const foundClass =
                        classes.find(
                            (item) =>
                                item.name
                                    .trim()
                                    .toLowerCase() ===
                                className
                                    .trim()
                                    .toLowerCase()
                        );

                    if (!foundClass) {
                        errors.push(
                            `Class "${className}" was not found in the current academic year`
                        );
                    } else {
                        classId =
                            foundClass.id;
                    }
                }

                if (sectionName) {
                    if (!classId) {
                        errors.push(
                            "Section cannot be assigned without a valid Class"
                        );
                    } else {
                        const foundSection =
                            sections.find(
                                (item) =>
                                    item.class_id ===
                                        classId &&
                                    item.name
                                        .trim()
                                        .toLowerCase() ===
                                        sectionName
                                            .trim()
                                            .toLowerCase()
                            );

                        if (
                            !foundSection
                        ) {
                            errors.push(
                                `Section "${sectionName}" was not found for Class "${className}"`
                            );
                        } else {
                            sectionId =
                                foundSection.id;
                        }
                    }
                }

                parsedRows.push({
                    rowNumber:
                        i + 1,
                    admission_no:
                        admission,
                    name,
                    student_email:
                        studentEmail,
                    student_phone:
                        studentPhone,
                    parent_name:
                        parentName,
                    parent_phone:
                        parentPhone,
                    parent_email:
                        parentEmail,
                    date_of_birth:
                        normalizedDob || "",
                    gender:
                        gender
                            ? gender
                                  .charAt(
                                      0
                                  )
                                  .toUpperCase() +
                              gender
                                  .slice(
                                      1
                                  )
                                  .toLowerCase()
                            : "",
                    class_name:
                        className,
                    section_name:
                        sectionName,
                    class_id:
                        classId,
                    section_id:
                        sectionId,
                    errors,
                });
            }

            // -------------------------------------------------
            // DUPLICATES INSIDE CSV
            // -------------------------------------------------

            const admissionMap =
                new Map<
                    string,
                    number[]
                >();

            parsedRows.forEach(
                (row) => {
                    if (
                        !row.admission_no
                    ) {
                        return;
                    }

                    const key =
                        row.admission_no
                            .toLowerCase();

                    const existing =
                        admissionMap.get(
                            key
                        ) || [];

                    existing.push(
                        row.rowNumber
                    );

                    admissionMap.set(
                        key,
                        existing
                    );
                }
            );

            parsedRows.forEach(
                (row) => {
                    const duplicateRows =
                        admissionMap.get(
                            row.admission_no.toLowerCase()
                        );

                    if (
                        duplicateRows &&
                        duplicateRows.length >
                            1
                    ) {
                        row.errors.push(
                            `Duplicate Admission No. in CSV (rows ${duplicateRows.join(
                                ", "
                            )})`
                        );
                    }
                }
            );

            // -------------------------------------------------
            // CHECK EXISTING ADMISSION NUMBERS
            // -------------------------------------------------

            const schoolId =
                await getAdminSchoolId();

            const admissionNumbers =
                parsedRows
                    .map(
                        (row) =>
                            row.admission_no
                    )
                    .filter(Boolean);

            if (
                admissionNumbers.length >
                0
            ) {
                const {
                    data: existingStudents,
                    error,
                } = await supabase
                    .from("students")
                    .select(
                        "admission_no"
                    )
                    .eq(
                        "school_id",
                        schoolId
                    )
                    .in(
                        "admission_no",
                        admissionNumbers
                    );

                if (error) {
                    throw error;
                }

                const existingSet =
                    new Set(
                        (
                            existingStudents ||
                            []
                        ).map(
                            (student) =>
                                student.admission_no.toLowerCase()
                        )
                    );

                parsedRows.forEach(
                    (row) => {
                        if (
                            existingSet.has(
                                row.admission_no.toLowerCase()
                            )
                        ) {
                            row.errors.push(
                                "Admission No. already exists in this school"
                            );
                        }
                    }
                );
            }

            setRows(parsedRows);

            const errorCount =
                parsedRows.filter(
                    (row) =>
                        row.errors.length >
                        0
                ).length;

            if (errorCount === 0) {
                setMessage(
                    `${parsedRows.length} student(s) ready to import.`
                );
            } else {
                setMessage(
                    `${parsedRows.length} row(s) found. ${errorCount} row(s) have errors.`
                );
            }
        } catch (error) {
            console.error(
                "Could not process CSV:",
                error
            );

            setMessage(
                "Could not process the CSV file. Please check the file and try again."
            );
        }
    }

    // =========================================================
    // FILE SELECT
    // =========================================================

    function handleFileChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        const file =
            e.target.files?.[0];

        if (!file) return;

        processFile(file);
    }

    // =========================================================
    // IMPORT
    // =========================================================

    async function handleImport() {
        if (rows.length === 0) {
            alert(
                "Please upload a CSV file first."
            );
            return;
        }

        const rowsWithErrors =
            rows.filter(
                (row) =>
                    row.errors.length > 0
            );

        if (
            rowsWithErrors.length > 0
        ) {
            alert(
                "Please fix all errors before importing."
            );
            return;
        }

        const confirmed =
            window.confirm(
                `Import ${rows.length} student(s) into your school?`
            );

        if (!confirmed) return;

        setIsImporting(true);

        try {
            const schoolId =
                await getAdminSchoolId();

            const insertRows =
                rows.map((row) => ({
                    school_id:
                        schoolId,

                    admission_no:
                        row.admission_no,

                    name:
                        row.name,

                    student_email:
                        row.student_email ||
                        null,

                    student_phone:
                        row.student_phone ||
                        null,

                    parent_name:
                        row.parent_name ||
                        null,

                    parent_phone:
                        row.parent_phone ||
                        null,

                    parent_email:
                        row.parent_email ||
                        null,

                    date_of_birth:
                        row.date_of_birth ||
                        null,

                    gender:
                        row.gender ||
                        null,

                    class_id:
                        row.class_id ||
                        null,

                    section_id:
                        row.section_id ||
                        null,

                    is_active: true,
                }));

            const {
                error,
            } = await supabase
                .from("students")
                .insert(
                    insertRows
                );

            if (error) {
                console.error(
                    "Could not import students:",
                    error
                );

                if (
                    error.code ===
                    "23505"
                ) {
                    alert(
                        "One or more Admission Numbers already exist. Please re-upload after fixing the duplicate rows."
                    );
                } else {
                    alert(
                        "Could not import students. Please try again."
                    );
                }

                return;
            }

            setImportedCount(
                insertRows.length
            );

            setRows([]);
            setFileName("");

            if (
                fileInputRef.current
            ) {
                fileInputRef.current.value =
                    "";
            }

            setMessage(
                `${insertRows.length} student(s) imported successfully.`
            );
        } catch (error) {
            console.error(
                "Import failed:",
                error
            );

            alert(
                "Import failed. Please try again."
            );
        } finally {
            setIsImporting(false);
        }
    }

    // =========================================================
    // CLEAR
    // =========================================================

    function clearImport() {
        setRows([]);
        setFileName("");
        setMessage("");
        setImportedCount(0);

        if (
            fileInputRef.current
        ) {
            fileInputRef.current.value =
                "";
        }
    }

    // =========================================================
    // ACCESS SCREEN
    // =========================================================

    if (checkingAccess) {
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

    const errorCount =
        rows.filter(
            (row) =>
                row.errors.length > 0
        ).length;

    const validCount =
        rows.length - errorCount;

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        Bulk Add Students
                    </h1>

                    <p className="text-gray-600 mt-1">
                        Add multiple students at once using a CSV file.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        router.push(
                            "/admin/users"
                        )
                    }
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                    ← Back to People
                </button>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h2 className="text-xl font-semibold">
                    1. Download the template
                </h2>

                <p className="text-gray-500 mt-1">
                    Fill the CSV in Excel, Google Sheets or another spreadsheet application.
                </p>

                <button
                    type="button"
                    onClick={
                        downloadTemplate
                    }
                    className="mt-4 bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700"
                >
                    ↓ Download CSV Template
                </button>

                <div className="mt-5 text-sm text-gray-600">
                    <p className="font-medium">
                        Columns included:
                    </p>

                    <p className="mt-1">
                        Admission No., Student Name, Student Email, Student Phone, Parent Name, Parent Phone, Parent Email, Date of Birth, Gender, Class, Section
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                        Date of Birth format: DD-MM-YYYY (for example, 15-05-2012).
                    </p>
                </div>
            </div>

            {/* Upload */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h2 className="text-xl font-semibold">
                    2. Upload your CSV
                </h2>

                <p className="text-gray-500 mt-1">
                    We will validate the file before adding anything to the database.
                </p>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={
                        handleFileChange
                    }
                    className="mt-5 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />

                {fileName && (
                    <p className="text-sm text-gray-600 mt-3">
                        Selected file:{" "}
                        <span className="font-medium">
                            {fileName}
                        </span>
                    </p>
                )}

                {isLoading && (
                    <p className="text-sm text-gray-500 mt-3">
                        Loading current classes and sections...
                    </p>
                )}

                {message && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                        {message}
                    </div>
                )}

                {importedCount > 0 && (
                    <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-emerald-700">
                        ✓ {importedCount} student(s) imported successfully.
                    </div>
                )}
            </div>

            {/* Preview */}
            {rows.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm mt-6 overflow-hidden">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    3. Review before import
                                </h2>

                                <p className="text-gray-500 mt-1">
                                    {validCount} valid ·{" "}
                                    {errorCount} with errors
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    clearImport
                                }
                                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left p-4 whitespace-nowrap">
                                        Row
                                    </th>

                                    <th className="text-left p-4 whitespace-nowrap">
                                        Admission No.
                                    </th>

                                    <th className="text-left p-4 whitespace-nowrap">
                                        Student Name
                                    </th>

                                    <th className="text-left p-4 whitespace-nowrap">
                                        Student Email
                                    </th>

                                    <th className="text-left p-4 whitespace-nowrap">
                                        Student Phone
                                    </th>

                                    <th className="text-left p-4 whitespace-nowrap">
                                        Parent Name
                                    </th>

                                    <th className="text-left p-4 whitespace-nowrap">
                                        Parent Phone
                                    </th>

                                    <th className="text-left p-4 whitespace-nowrap">
                                        Parent Email
                                    </th>

                                    <th className="text-left p-4 whitespace-nowrap">
                                        Date of Birth
                                    </th>

                                    <th className="text-left p-4 whitespace-nowrap">
                                        Gender
                                    </th>

                                    <th className="text-left p-4 whitespace-nowrap">
                                        Class
                                    </th>

                                    <th className="text-left p-4 whitespace-nowrap">
                                        Section
                                    </th>

                                    <th className="text-left p-4 whitespace-nowrap">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map(
                                    (
                                        row
                                    ) => (
                                        <tr
                                            key={
                                                row.rowNumber
                                            }
                                            className="border-t"
                                        >
                                            <td className="p-4 whitespace-nowrap">
                                                {
                                                    row.rowNumber
                                                }
                                            </td>

                                            <td className="p-4 whitespace-nowrap">
                                                {
                                                    row.admission_no
                                                }
                                            </td>

                                            <td className="p-4 font-medium whitespace-nowrap">
                                                {
                                                    row.name
                                                }
                                            </td>

                                            <td className="p-4 whitespace-nowrap">
                                                {
                                                    row.student_email ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="p-4 whitespace-nowrap">
                                                {
                                                    row.student_phone ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="p-4 whitespace-nowrap">
                                                {
                                                    row.parent_name ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="p-4 whitespace-nowrap">
                                                {
                                                    row.parent_phone ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="p-4 whitespace-nowrap">
                                                {
                                                    row.parent_email ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="p-4 whitespace-nowrap">
                                                {row.date_of_birth
                                                    ? (() => {
                                                        const [
                                                            year,
                                                            month,
                                                            day,
                                                        ] =
                                                            row.date_of_birth.split(
                                                                "-"
                                                            );

                                                        return `${day}-${month}-${year}`;
                                                    })()
                                                    : "-"}
                                            </td>

                                            <td className="p-4 whitespace-nowrap">
                                                {
                                                    row.gender ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="p-4 whitespace-nowrap">
                                                {
                                                    row.class_name ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="p-4 whitespace-nowrap">
                                                {
                                                    row.section_name ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="p-4 min-w-[280px] align-top">
                                                {row.errors.length ===
                                                0 ? (
                                                    <span className="text-emerald-700 font-medium">
                                                        ✓ Valid
                                                    </span>
                                                ) : (
                                                    <div>
                                                        <span className="text-red-600 font-medium">
                                                            ✕ Error
                                                        </span>

                                                        <ul className="mt-1 text-red-600 text-xs list-disc pl-4">
                                                            {row.errors.map(
                                                                (
                                                                    error,
                                                                    index
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        {
                                                                            error
                                                                        }
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Import */}
                    <div className="p-6 border-t flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={
                                clearImport
                            }
                            className="px-5 py-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={
                                handleImport
                            }
                            disabled={
                                isImporting ||
                                errorCount > 0
                            }
                            className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isImporting
                                ? "Importing..."
                                : `Import ${rows.length} Student${
                                      rows.length ===
                                      1
                                          ? ""
                                          : "s"
                                  }`}
                        </button>
                    </div>
                </div>
            )}

            {/* Notes */}
            <div className="bg-emerald-50 rounded-xl p-6 mt-6 text-sm text-emerald-900">
                <p className="font-semibold">
                    Important
                </p>

                <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>
                        Admission No. and Student Name are required.
                    </li>

                    <li>
                        Student and Parent phone numbers must contain exactly 10 digits if provided.
                    </li>

                    <li>
                        Date of Birth must use DD-MM-YYYY format, for example 15-05-2012.
                    </li>

                    <li>
                        Student Email and Parent Email are optional.
                    </li>

                    <li>
                        Class and Section are optional.
                    </li>

                    <li>
                        If Class or Section is provided, it must exist in the current academic year.
                    </li>

                    <li>
                        No students are inserted until all rows pass validation.
                    </li>
                </ul>
            </div>
        </div>
    );
}