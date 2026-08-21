"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AcademicYear = {
    id: string;
    name: string;
};

type ClassItem = {
    id: string;
    school_id: string;
    academic_year_id: string;
    name: string;
    display_order: number;
    is_active: boolean;
};

type SectionItem = {
    id: string;
    school_id: string;
    class_id: string;
    name: string;
    display_order: number;
    is_active: boolean;
};

export default function ClassesPage() {
      const router = useRouter();
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [currentYear, setCurrentYear] =
        useState<AcademicYear | null>(null);
        const [isAuthorized, setIsAuthorized] = useState(false);
const [isCheckingAccess, setIsCheckingAccess] = useState(true);

    const [isLoading, setIsLoading] = useState(true);
    const [isSavingClass, setIsSavingClass] = useState(false);
    const [isSavingSection, setIsSavingSection] = useState(false);

    const [showClassForm, setShowClassForm] = useState(false);
    const [className, setClassName] = useState("");

    const [editingClassId, setEditingClassId] =
        useState<string | null>(null);
    const [editingClassName, setEditingClassName] =
        useState("");

    const [addingSectionTo, setAddingSectionTo] =
        useState<string | null>(null);
    const [sectionName, setSectionName] = useState("");

    const [editingSectionId, setEditingSectionId] =
        useState<string | null>(null);
    const [editingSectionName, setEditingSectionName] =
        useState("");

    const [errorMessage, setErrorMessage] = useState("");


    async function checkAdminAccess() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        router.replace("/login");
        return false;
    }

    const { data: membership, error } = await supabase
        .from("school_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Could not check user role:", error);
        router.replace("/login");
        return false;
    }

    if (membership?.role === "admin") {
        setIsAuthorized(true);
        return true;
    }

    if (membership?.role === "teacher") {
        router.replace("/teacher/dashboard");
        return false;
    }

    if (membership?.role === "student") {
        router.replace("/student/dashboard");
        return false;
    }

    router.replace("/login");
    return false;
}

    async function getAdminSchoolId() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("You are not logged in.");
        }

        const { data: membership, error } = await supabase
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

        if (!membership) {
            throw new Error(
                "Could not find an active admin school membership."
            );
        }

        return membership.school_id;
    }

    async function loadClasses() {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const schoolId = await getAdminSchoolId();

            // Get current academic year
            const { data: year, error: yearError } =
                await supabase
                    .from("academic_years")
                    .select("id, name")
                    .eq("school_id", schoolId)
                    .eq("is_current", true)
                    .eq("is_active", true)
                    .maybeSingle();

            if (yearError) {
                throw yearError;
            }

            if (!year) {
                setCurrentYear(null);
                setClasses([]);
                setSections([]);

                setErrorMessage(
                    "No current academic year has been configured."
                );

                return;
            }

            setCurrentYear(year);

            // Load classes for current academic year
            const { data: classData, error: classesError } =
                await supabase
                    .from("classes")
                    .select(
                        "id, school_id, academic_year_id, name, display_order, is_active"
                    )
                    .eq("school_id", schoolId)
                    .eq("academic_year_id", year.id)
                    .eq("is_active", true)
                    .order("display_order")
                    .order("name");

            if (classesError) {
                throw classesError;
            }

            // Load sections belonging to the loaded classes
            const classIds =
                (classData || []).map((item) => item.id);

            let sectionData: SectionItem[] = [];

            if (classIds.length > 0) {
                const { data, error: sectionsError } =
                    await supabase
                        .from("sections")
                        .select(
                            "id, school_id, class_id, name, display_order, is_active"
                        )
                        .eq("school_id", schoolId)
                        .eq("is_active", true)
                        .in("class_id", classIds)
                        .order("display_order")
                        .order("name");

                if (sectionsError) {
                    throw sectionsError;
                }

                sectionData = data || [];
            }

            setClasses(classData || []);
            setSections(sectionData);
        } catch (error) {
            console.error(
                "Could not load classes:",
                error
            );

            setErrorMessage(
                "Could not load classes. Please refresh and try again."
            );
        } finally {
            setIsLoading(false);
        }
    }

  useEffect(() => {
    let isMounted = true;

    async function initializePage() {
        setIsCheckingAccess(true);

        const allowed = await checkAdminAccess();

        if (!isMounted) {
            return;
        }

        setIsCheckingAccess(false);

        if (allowed) {
            await loadClasses();
        } else {
            setIsLoading(false);
        }
    }

    initializePage();

    return () => {
        isMounted = false;
    };
}, []);

    // =========================================================
    // ADD CLASS
    // =========================================================

    async function handleAddClass(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        const trimmedName = className.trim();

        if (!trimmedName) {
            setErrorMessage(
                "Class name cannot be empty."
            );
            return;
        }

        setIsSavingClass(true);
        setErrorMessage("");

        try {
            const schoolId = await getAdminSchoolId();

            // Get current academic year
            const { data: year, error: yearError } =
                await supabase
                    .from("academic_years")
                    .select("id, name")
                    .eq("school_id", schoolId)
                    .eq("is_current", true)
                    .eq("is_active", true)
                    .maybeSingle();

            if (yearError) {
                throw yearError;
            }

            if (!year) {
                setErrorMessage(
                    "No current academic year has been configured."
                );
                return;
            }

            const alreadyExists = classes.some(
                (item) =>
                    item.name.trim().toLowerCase() ===
                    trimmedName.toLowerCase()
            );

            if (alreadyExists) {
                setErrorMessage(
                    "A class with this name already exists in the current academic year."
                );
                return;
            }

            const nextDisplayOrder =
                classes.length > 0
                    ? Math.max(
                          ...classes.map(
                              (item) =>
                                  item.display_order || 0
                          )
                      ) + 1
                    : 1;

            const { error } = await supabase
                .from("classes")
                .insert({
                    school_id: schoolId,
                    academic_year_id: year.id,
                    name: trimmedName,
                    display_order: nextDisplayOrder,
                    is_active: true,
                });

            if (error) {
                console.error(
                    "Could not create class:",
                    error
                );

                setErrorMessage(
                    "Could not create class. Please try again."
                );

                return;
            }

            setClassName("");
            setShowClassForm(false);

            await loadClasses();
        } catch (error) {
            console.error(
                "Could not create class:",
                error
            );

            setErrorMessage(
                "Could not create class. Please try again."
            );
        } finally {
            setIsSavingClass(false);
        }
    }

    function cancelClassForm() {
        setClassName("");
        setShowClassForm(false);
        setErrorMessage("");
    }

    // =========================================================
    // EDIT CLASS
    // =========================================================

    function startEditingClass(classItem: ClassItem) {
        setEditingClassId(classItem.id);
        setEditingClassName(classItem.name);
        setErrorMessage("");
    }

    function cancelEditingClass() {
        setEditingClassId(null);
        setEditingClassName("");
        setErrorMessage("");
    }

    async function handleUpdateClass(
        e: React.FormEvent<HTMLFormElement>,
        classId: string
    ) {
        e.preventDefault();

        const trimmedName = editingClassName.trim();

        if (!trimmedName) {
            setErrorMessage(
                "Class name cannot be empty."
            );
            return;
        }

        setIsSavingClass(true);
        setErrorMessage("");

        try {
            const duplicate = classes.some(
                (item) =>
                    item.id !== classId &&
                    item.name.trim().toLowerCase() ===
                        trimmedName.toLowerCase()
            );

            if (duplicate) {
                setErrorMessage(
                    "A class with this name already exists in the current academic year."
                );
                return;
            }

            const { error } = await supabase
                .from("classes")
                .update({
                    name: trimmedName,
                })
                .eq("id", classId);

            if (error) {
                throw error;
            }

            cancelEditingClass();

            await loadClasses();
        } catch (error) {
            console.error(
                "Could not update class:",
                error
            );

            setErrorMessage(
                "Could not update class. Please try again."
            );
        } finally {
            setIsSavingClass(false);
        }
    }

    // =========================================================
    // DELETE CLASS
    // =========================================================

    async function handleDeleteClass(
        classItem: ClassItem
    ) {
        const confirmed = window.confirm(
            `Delete "${classItem.name}"?\n\nThe class will be deactivated. Existing student records will not be deleted.`
        );

        if (!confirmed) {
            return;
        }

        setErrorMessage("");

        try {
            const { error } = await supabase
                .from("classes")
                .update({
                    is_active: false,
                })
                .eq("id", classItem.id);

            if (error) {
                throw error;
            }

            await loadClasses();
        } catch (error) {
            console.error(
                "Could not delete class:",
                error
            );

            setErrorMessage(
                "Could not delete class. Please try again."
            );
        }
    }

    // =========================================================
    // ADD SECTION
    // =========================================================

    function startAddingSection(classId: string) {
        setAddingSectionTo(classId);
        setSectionName("");
        setErrorMessage("");
    }

    function cancelAddingSection() {
        setAddingSectionTo(null);
        setSectionName("");
        setErrorMessage("");
    }

    async function handleAddSection(
    e: React.FormEvent<HTMLFormElement>,
    classId: string
) {
    e.preventDefault();

    const trimmedName = sectionName.trim();

    if (!trimmedName) {
        setErrorMessage("Section name cannot be empty.");
        return;
    }

    setIsSavingSection(true);
    setErrorMessage("");

    try {
        const schoolId = await getAdminSchoolId();

        // Make sure the class belongs to the current academic year
        const { data: classRecord, error: classError } =
            await supabase
                .from("classes")
                .select("id, academic_year_id")
                .eq("id", classId)
                .eq("school_id", schoolId)
                .eq("is_active", true)
                .maybeSingle();

        if (classError) {
            throw classError;
        }

        if (
            !classRecord ||
            !currentYear ||
            classRecord.academic_year_id !== currentYear.id
        ) {
            setErrorMessage(
                "This class does not belong to the current academic year."
            );
            return;
        }

        /*
         * IMPORTANT:
         * Load ALL sections for this class, including
         * soft-deleted sections.
         */
        const { data: existingSections, error: sectionsError } =
            await supabase
                .from("sections")
                .select(
                    "id, class_id, name, display_order, is_active"
                )
                .eq("school_id", schoolId)
                .eq("class_id", classId);

        if (sectionsError) {
            throw sectionsError;
        }

        const matchingSection = (existingSections || []).find(
            (section) =>
                section.name.trim().toLowerCase() ===
                trimmedName.toLowerCase()
        );

        /*
         * Section already exists and is active.
         */
        if (matchingSection?.is_active) {
            setErrorMessage(
                "This section already exists in this class."
            );
            return;
        }

        /*
         * Section existed before but was soft-deleted.
         * Reactivate the existing record instead of
         * creating a duplicate.
         */
        if (matchingSection && !matchingSection.is_active) {
            const { error: reactivateError } =
                await supabase
                    .from("sections")
                    .update({
                        is_active: true,
                    })
                    .eq("id", matchingSection.id);

            if (reactivateError) {
                throw reactivateError;
            }

            setSectionName("");
            setAddingSectionTo(null);

            await loadClasses();
            return;
        }

        /*
         * Completely new section.
         */
        const activeSections = (
            existingSections || []
        ).filter((section) => section.is_active);

        const nextDisplayOrder =
            activeSections.length > 0
                ? Math.max(
                      ...activeSections.map(
                          (section) =>
                              section.display_order || 0
                      )
                  ) + 1
                : 1;

        const { error: insertError } =
            await supabase
                .from("sections")
                .insert({
                    school_id: schoolId,
                    class_id: classId,
                    name: trimmedName,
                    display_order: nextDisplayOrder,
                    is_active: true,
                });

        if (insertError) {
            throw insertError;
        }

        setSectionName("");
        setAddingSectionTo(null);

        await loadClasses();
    } catch (error) {
        console.error(
            "Could not create/reactivate section:",
            error
        );

        setErrorMessage(
            "Could not create section. Please try again."
        );
    } finally {
        setIsSavingSection(false);
    }
}

    // =========================================================
    // EDIT SECTION
    // =========================================================

    function startEditingSection(
        section: SectionItem
    ) {
        setEditingSectionId(section.id);
        setEditingSectionName(section.name);
        setErrorMessage("");
    }

    function cancelEditingSection() {
        setEditingSectionId(null);
        setEditingSectionName("");
        setErrorMessage("");
    }

    async function handleUpdateSection(
        e: React.FormEvent<HTMLFormElement>,
        section: SectionItem
    ) {
        e.preventDefault();

        const trimmedName =
            editingSectionName.trim();

        if (!trimmedName) {
            setErrorMessage(
                "Section name cannot be empty."
            );
            return;
        }

        setIsSavingSection(true);
        setErrorMessage("");

        try {
            const duplicate = sections.some(
                (item) =>
                    item.id !== section.id &&
                    item.class_id ===
                        section.class_id &&
                    item.name.trim().toLowerCase() ===
                        trimmedName.toLowerCase()
            );

            if (duplicate) {
                setErrorMessage(
                    "This section already exists in this class."
                );
                return;
            }

            const { error } = await supabase
                .from("sections")
                .update({
                    name: trimmedName,
                })
                .eq("id", section.id);

            if (error) {
                throw error;
            }

            cancelEditingSection();

            await loadClasses();
        } catch (error) {
            console.error(
                "Could not update section:",
                error
            );

            setErrorMessage(
                "Could not update section. Please try again."
            );
        } finally {
            setIsSavingSection(false);
        }
    }

    // =========================================================
    // DELETE SECTION
    // =========================================================

    async function handleDeleteSection(
        section: SectionItem
    ) {
        const confirmed = window.confirm(
            `Delete "Section ${section.name}"?\n\nThe section will be deactivated. Existing student records will not be deleted.`
        );

        if (!confirmed) {
            return;
        }

        setErrorMessage("");

        try {
            const { error } = await supabase
                .from("sections")
                .update({
                    is_active: false,
                })
                .eq("id", section.id);

            if (error) {
                throw error;
            }

            await loadClasses();
        } catch (error) {
            console.error(
                "Could not delete section:",
                error
            );

            setErrorMessage(
                "Could not delete section. Please try again."
            );
        }
    }

    function getSectionsForClass(
        classId: string
    ) {
        return sections.filter(
            (section) =>
                section.class_id === classId &&
                section.is_active
        );
    }

    if (isCheckingAccess || !isAuthorized) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>

                <p className="text-gray-500 mt-4">
                    Checking access...
                </p>
            </div>
        </div>
    );
}

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">
                        Classes & Sections
                    </h1>

                    <p className="text-gray-600 mt-1">
                        Manage classes and sections for your school.
                    </p>

                    {/* Academic Year */}
                    {currentYear && (
                        <div className="inline-flex items-center gap-2 mt-4 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg">
                            <span className="text-sm font-medium">
                                Academic Year
                            </span>

                            <span className="font-bold">
                                {currentYear.name}
                            </span>
                        </div>
                    )}
                </div>

                {!showClassForm &&
                    !editingClassId && (
                        <button
                            type="button"
                            onClick={() => {
                                setErrorMessage("");
                                setShowClassForm(true);
                            }}
                            className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition"
                        >
                            + Add Class
                        </button>
                    )}
            </div>

            {/* Error */}
            {errorMessage && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
                    {errorMessage}
                </div>
            )}

            {/* Add Class Form */}
            {showClassForm && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Add Class
                    </h2>

                    <p className="text-gray-500 mt-1">
                        Add a class to{" "}
                        {currentYear
                            ? currentYear.name
                            : "the current academic year"}
                        .
                    </p>

                    <form
                        onSubmit={handleAddClass}
                        className="mt-6"
                    >
                        <label
                            htmlFor="className"
                            className="block text-sm font-medium mb-2"
                        >
                            Class Name{" "}
                            <span className="text-red-500">
                                *
                            </span>
                        </label>

                        <input
                            id="className"
                            type="text"
                            value={className}
                            onChange={(e) =>
                                setClassName(
                                    e.target.value
                                )
                            }
                            placeholder="e.g. Class 10"
                            required
                            autoFocus
                            className="w-full border rounded-md p-3"
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={
                                    cancelClassForm
                                }
                                className="px-5 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    isSavingClass
                                }
                                className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                                {isSavingClass
                                    ? "Saving..."
                                    : "Save Class"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Loading */}
            {isLoading ? (
                <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>

                    <p className="text-gray-500 mt-4">
                        Loading classes...
                    </p>
                </div>
            ) : !currentYear ? (
                <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        No current academic year
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Please configure a current academic year before managing classes.
                    </p>
                </div>
            ) : classes.length === 0 ? (
                !showClassForm && (
                    <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            No classes yet
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Add your first class for{" "}
                            {currentYear.name}.
                        </p>
                    </div>
                )
            ) : (
                <div className="space-y-5">
                    {classes.map((classItem) => {
                        const classSections =
                            getSectionsForClass(
                                classItem.id
                            );

                        return (
                            <div
                                key={classItem.id}
                                className="bg-white rounded-xl shadow-sm p-6"
                            >
                                {/* Class Header */}
                                {editingClassId ===
                                classItem.id ? (
                                    <form
                                        onSubmit={(e) =>
                                            handleUpdateClass(
                                                e,
                                                classItem.id
                                            )
                                        }
                                        className="flex items-center gap-3"
                                    >
                                        <input
                                            type="text"
                                            value={
                                                editingClassName
                                            }
                                            onChange={(e) =>
                                                setEditingClassName(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            autoFocus
                                            className="flex-1 border rounded-md p-3"
                                        />

                                        <button
                                            type="button"
                                            onClick={
                                                cancelEditingClass
                                            }
                                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={
                                                isSavingClass
                                            }
                                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                        >
                                            {isSavingClass
                                                ? "Saving..."
                                                : "Save"}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800">
                                                {
                                                    classItem.name
                                                }
                                            </h2>

                                            <p className="text-gray-500 mt-1">
                                                {
                                                    classSections.length
                                                }{" "}
                                                {classSections.length ===
                                                1
                                                    ? "section"
                                                    : "sections"}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    startEditingClass(
                                                        classItem
                                                    )
                                                }
                                                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteClass(
                                                        classItem
                                                    )
                                                }
                                                className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                                            >
                                                Delete
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    startAddingSection(
                                                        classItem.id
                                                    )
                                                }
                                                className="border border-emerald-600 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-50 transition"
                                            >
                                                + Add Section
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Add Section */}
                                {addingSectionTo ===
                                    classItem.id && (
                                    <form
                                        onSubmit={(e) =>
                                            handleAddSection(
                                                e,
                                                classItem.id
                                            )
                                        }
                                        className="mt-5 p-4 bg-emerald-50 rounded-lg"
                                    >
                                        <label
                                            htmlFor={`section-${classItem.id}`}
                                            className="block text-sm font-medium mb-2"
                                        >
                                            Section Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <div className="flex gap-3">
                                            <input
                                                id={`section-${classItem.id}`}
                                                type="text"
                                                value={
                                                    sectionName
                                                }
                                                onChange={(e) =>
                                                    setSectionName(
                                                        e.target
                                                            .value
                                                    )
                                                }
                                                placeholder="e.g. A"
                                                required
                                                autoFocus
                                                className="flex-1 border rounded-md p-3 bg-white"
                                            />

                                            <button
                                                type="button"
                                                onClick={
                                                    cancelAddingSection
                                                }
                                                className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={
                                                    isSavingSection
                                                }
                                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                {isSavingSection
                                                    ? "Saving..."
                                                    : "Save"}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Sections */}
                                {classSections.length > 0 && (
                                    <div className="mt-5 space-y-2">
                                        {classSections.map(
                                            (section) => (
                                                <div
                                                    key={
                                                        section.id
                                                    }
                                                    className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3"
                                                >
                                                    {editingSectionId ===
                                                    section.id ? (
                                                        <form
                                                            onSubmit={(
                                                                e
                                                            ) =>
                                                                handleUpdateSection(
                                                                    e,
                                                                    section
                                                                )
                                                            }
                                                            className="flex items-center gap-3 w-full"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={
                                                                    editingSectionName
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    setEditingSectionName(
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                autoFocus
                                                                className="flex-1 border rounded-md p-2 bg-white"
                                                            />

                                                            <button
                                                                type="button"
                                                                onClick={
                                                                    cancelEditingSection
                                                                }
                                                                className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                                                            >
                                                                Cancel
                                                            </button>

                                                            <button
                                                                type="submit"
                                                                disabled={
                                                                    isSavingSection
                                                                }
                                                                className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                                            >
                                                                {isSavingSection
                                                                    ? "Saving..."
                                                                    : "Save"}
                                                            </button>
                                                        </form>
                                                    ) : (
                                                        <>
                                                            <span className="font-medium text-emerald-800">
                                                                Section{" "}
                                                                {
                                                                    section.name
                                                                }
                                                            </span>

                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        startEditingSection(
                                                                            section
                                                                        )
                                                                    }
                                                                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm"
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteSection(
                                                                            section
                                                                        )
                                                                    }
                                                                    className="px-3 py-1.5 rounded-lg border border-red-300 bg-white text-red-600 hover:bg-red-50 text-sm"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}

                                {classSections.length === 0 &&
                                    addingSectionTo !==
                                        classItem.id && (
                                        <p className="text-gray-400 mt-5">
                                            No sections yet.
                                        </p>
                                    )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}