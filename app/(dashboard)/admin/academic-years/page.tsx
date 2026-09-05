"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AcademicYear = {
    id: string;
    school_id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
    is_active: boolean;
};

export default function AcademicYearsPage() {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [showForm, setShowForm] = useState(false);

    const [yearName, setYearName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [editingStartDate, setEditingStartDate] = useState("");
    const [editingEndDate, setEditingEndDate] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

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

    async function loadAcademicYears() {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const schoolId = await getAdminSchoolId();

            const { data, error } = await supabase
                .from("academic_years")
                .select(
                    "id, school_id, name, start_date, end_date, is_current, is_active"
                )
                .eq("school_id", schoolId)
                .order("start_date", {
                    ascending: false,
                    nullsFirst: false,
                })
                .order("name");

            if (error) {
                throw error;
            }

            setAcademicYears(data || []);
        } catch (error) {
            console.error(
                "Could not load academic years:",
                error
            );

            setErrorMessage(
                "Could not load academic years. Please refresh and try again."
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadAcademicYears();
    }, []);

    // =========================================================
    // ADD ACADEMIC YEAR
    // =========================================================

    async function handleAddAcademicYear(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        const trimmedName = yearName.trim();

        if (!trimmedName) {
            setErrorMessage(
                "Academic year name cannot be empty."
            );
            return;
        }

        if (!startDate || !endDate) {
            setErrorMessage(
                "Start Date and End Date are required."
            );
            return;
        }

        if (endDate < startDate) {
            setErrorMessage(
                "End Date cannot be before Start Date."
            );
            return;
        }

        setIsSaving(true);
        setErrorMessage("");

        try {
            const schoolId = await getAdminSchoolId();

            const alreadyExists = academicYears.some(
                (year) =>
                    year.name.trim().toLowerCase() ===
                    trimmedName.toLowerCase()
            );

            if (alreadyExists) {
                setErrorMessage(
                    "This academic year already exists."
                );
                return;
            }

            const { error } = await supabase
                .from("academic_years")
                .insert({
                    school_id: schoolId,
                    name: trimmedName,
                    start_date: startDate || null,
                    end_date: endDate || null,
                    is_current: false,
                    is_active: true,
                });

            if (error) {
                console.error(
                    "Could not create academic year:",
                    error
                );

                if (error.code === "23505") {
                    setErrorMessage(
                        "This academic year already exists."
                    );
                } else {
                    setErrorMessage(
                        "Could not create academic year. Please try again."
                    );
                }

                return;
            }

            setYearName("");
            setStartDate("");
            setEndDate("");
            setShowForm(false);

            await loadAcademicYears();
        } catch (error) {
            console.error(
                "Could not create academic year:",
                error
            );

            setErrorMessage(
                "Could not create academic year. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    }

    function cancelForm() {
        setYearName("");
        setStartDate("");
        setEndDate("");
        setShowForm(false);
        setErrorMessage("");
    }

    // =========================================================
    // EDIT
    // =========================================================

    function startEditing(year: AcademicYear) {
        setEditingId(year.id);
        setEditingName(year.name);
        setEditingStartDate(year.start_date || "");
        setEditingEndDate(year.end_date || "");
        setErrorMessage("");
    }

    function cancelEditing() {
        setEditingId(null);
        setEditingName("");
        setEditingStartDate("");
        setEditingEndDate("");
        setErrorMessage("");
    }

    async function handleUpdate(
        e: React.FormEvent<HTMLFormElement>,
        yearId: string
    ) {
        e.preventDefault();

        const trimmedName = editingName.trim();

        if (!trimmedName) {
            setErrorMessage(
                "Academic year name cannot be empty."
            );
            return;
        }

        if (!editingStartDate || !editingEndDate) {
            setErrorMessage(
                "Start Date and End Date are required."
            );
            return;
        }

        if (editingEndDate < editingStartDate) {
            setErrorMessage(
                "End Date cannot be before Start Date."
            );
            return;
        }

        setIsSaving(true);
        setErrorMessage("");

        try {
            const duplicate = academicYears.some(
                (year) =>
                    year.id !== yearId &&
                    year.name.trim().toLowerCase() ===
                    trimmedName.toLowerCase()
            );

            if (duplicate) {
                setErrorMessage(
                    "This academic year already exists."
                );
                return;
            }

            const { error } = await supabase
                .from("academic_years")
                .update({
                    name: trimmedName,
                    start_date:
                        editingStartDate || null,
                    end_date:
                        editingEndDate || null,
                })
                .eq("id", yearId);

            if (error) {
                console.error(
                    "Could not update academic year:",
                    error
                );

                setErrorMessage(
                    "Could not update academic year. Please try again."
                );

                return;
            }

            cancelEditing();

            await loadAcademicYears();
        } catch (error) {
            console.error(
                "Could not update academic year:",
                error
            );

            setErrorMessage(
                "Could not update academic year. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    }

    // =========================================================
    // MAKE CURRENT
    // =========================================================

    async function makeCurrent(year: AcademicYear) {
        const confirmed = window.confirm(
            `Make "${year.name}" the current academic year?`
        );

        if (!confirmed) {
            return;
        }

        setErrorMessage("");

        try {
            const schoolId = await getAdminSchoolId();

            /*
             * First remove the current flag from all years
             * belonging to this school.
             */
            const { error: clearError } = await supabase
                .from("academic_years")
                .update({
                    is_current: false,
                })
                .eq("school_id", schoolId);

            if (clearError) {
                throw clearError;
            }

            /*
             * Now make the selected year current.
             */
            const { error: currentError } = await supabase
                .from("academic_years")
                .update({
                    is_current: true,
                    is_active: true,
                })
                .eq("id", year.id);

            if (currentError) {
                throw currentError;
            }

            await loadAcademicYears();
        } catch (error) {
            console.error(
                "Could not change current academic year:",
                error
            );

            setErrorMessage(
                "Could not change the current academic year. Please try again."
            );
        }
    }

    // =========================================================
    // DEACTIVATE
    // =========================================================

    async function deactivateYear(year: AcademicYear) {
        if (year.is_current) {
            alert(
                "You cannot deactivate the current academic year. Make another academic year current first."
            );
            return;
        }

        const confirmed = window.confirm(
            `Deactivate "${year.name}"?\n\nIt will no longer be available as an active academic year.`
        );

        if (!confirmed) {
            return;
        }

        setErrorMessage("");

        try {
            const { error } = await supabase
                .from("academic_years")
                .update({
                    is_active: false,
                })
                .eq("id", year.id);

            if (error) {
                throw error;
            }

            await loadAcademicYears();
        } catch (error) {
            console.error(
                "Could not deactivate academic year:",
                error
            );

            setErrorMessage(
                "Could not deactivate academic year. Please try again."
            );
        }
    }

    // =========================================================
    // REACTIVATE
    // =========================================================

    async function reactivateYear(year: AcademicYear) {
        setErrorMessage("");

        try {
            const { error } = await supabase
                .from("academic_years")
                .update({
                    is_active: true,
                })
                .eq("id", year.id);

            if (error) {
                throw error;
            }

            await loadAcademicYears();
        } catch (error) {
            console.error(
                "Could not reactivate academic year:",
                error
            );

            setErrorMessage(
                "Could not reactivate academic year. Please try again."
            );
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">
                        Academic Years
                    </h1>

                    <p className="text-gray-600 mt-1">
                        Manage academic years for your school.
                    </p>
                </div>

                {!showForm && !editingId && (
                    <button
                        type="button"
                        onClick={() => {
                            setErrorMessage("");
                            setShowForm(true);
                        }}
                        className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition"
                    >
                        + Add Academic Year
                    </button>
                )}
            </div>

            {/* Error */}
            {errorMessage && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
                    {errorMessage}
                </div>
            )}

            {/* Add Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Add Academic Year
                    </h2>

                    <p className="text-gray-500 mt-1">
                        Example: 2026-27
                    </p>

                    <form
                        onSubmit={handleAddAcademicYear}
                        className="mt-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label
                                    htmlFor="yearName"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Academic Year{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    id="yearName"
                                    type="text"
                                    value={yearName}
                                    onChange={(e) =>
                                        setYearName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="2026-27"
                                    required
                                    autoFocus
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="startDate"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Start Date
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    id="startDate"
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(
                                            e.target.value
                                        )
                                    }
                                    onClick={(e) => {
                                        e.currentTarget.showPicker();
                                    }}
                                    className="w-full border rounded-md p-3"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="endDate"
                                    className="block text-sm font-medium mb-2"
                                >
                                    End Date
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    id="endDate"
                                    type="date"
                                    required
                                    value={endDate}
                                    onChange={(e) =>
                                        setEndDate(
                                            e.target.value
                                        )
                                    }
                                     onClick={(e) => {
                                        e.currentTarget.showPicker();
                                    }}
                                    className="w-full border rounded-md p-3"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={cancelForm}
                                className="px-5 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                                {isSaving
                                    ? "Saving..."
                                    : "Save Academic Year"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            {isLoading ? (
                <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>

                    <p className="text-gray-500 mt-4">
                        Loading academic years...
                    </p>
                </div>
            ) : academicYears.length === 0 ? (
                !showForm && (
                    <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            No academic years yet
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Add your first academic year to get started.
                        </p>
                    </div>
                )
            ) : (
                <div className="space-y-4">
                    {academicYears.map((year) => (
                        <div
                            key={year.id}
                            className="bg-white rounded-xl shadow-sm p-6"
                        >
                            {editingId === year.id ? (
                                <form
                                    onSubmit={(e) =>
                                        handleUpdate(
                                            e,
                                            year.id
                                        )
                                    }
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label
                                                className="block text-sm font-medium mb-2"
                                            >
                                                Academic Year
                                                <span className="text-red-500">
                                        *
                                    </span>
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    editingName
                                                }
                                                onChange={(e) =>
                                                    setEditingName(
                                                        e.target
                                                            .value
                                                    )
                                                }
                                                autoFocus
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="editingStartDate"
                                                className="block text-sm font-medium mb-2"
                                            >
                                                Start Date
                                                <span className="text-red-500">
                                        *
                                    </span>
                                            </label>

                                            <input
                                                id="editingStartDate"
                                                type="date"
                                                required
                                                value={
                                                    editingStartDate
                                                }
                                                onChange={(e) =>
                                                    setEditingStartDate(
                                                        e.target
                                                            .value
                                                    )
                                                }
                                                onClick={(e) => {
                                                    e.currentTarget.showPicker();
                                                }}
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="editingEndDate"
                                                className="block text-sm font-medium mb-2"
                                            >
                                                End Date
                                                <span className="text-red-500">
                                        *
                                    </span>
                                            </label>

                                            <input
                                                id="editingEndDate"
                                                type="date"
                                                required
                                                value={
                                                    editingEndDate
                                                }
                                                onChange={(e) =>
                                                    setEditingEndDate(
                                                        e.target
                                                            .value
                                                    )
                                                }
                                                onClick={(e) => {
                                                    e.currentTarget.showPicker();
                                                }}
                                                className="w-full border rounded-md p-3"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={
                                                cancelEditing
                                            }
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
                                                : "Save Changes"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-semibold text-gray-800">
                                                {year.name}
                                            </h2>

                                            {year.is_current && (
                                                <span className="px-3 py-1 text-sm rounded-full bg-emerald-100 text-emerald-700">
                                                    Current
                                                </span>
                                            )}

                                            {!year.is_active && (
                                                <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-500">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-gray-500 mt-2">
                                            {year.start_date
                                                ? year.start_date
                                                : "No start date"}

                                            {" → "}

                                            {year.end_date
                                                ? year.end_date
                                                : "No end date"}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {!year.is_current &&
                                            year.is_active && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        makeCurrent(
                                                            year
                                                        )
                                                    }
                                                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                                >
                                                    Make Current
                                                </button>
                                            )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                startEditing(
                                                    year
                                                )
                                            }
                                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>

                                        {year.is_active ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    deactivateYear(
                                                        year
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
                                                    reactivateYear(
                                                        year
                                                    )
                                                }
                                                className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                            >
                                                Reactivate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}