"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type House = {
    id: string;
    school_id: string;
    name: string;
    code: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
};

export default function HousesPage() {
    const [houses, setHouses] = useState<House[]>([]);
    const [loading, setLoading] = useState(true);

    const [showHouseForm, setShowHouseForm] = useState(false);
    const [houseName, setHouseName] = useState("");
    const [houseCode, setHouseCode] = useState("");
    const [houseDescription, setHouseDescription] = useState("");
    const [saving, setSaving] = useState(false);

    const [editingHouseId, setEditingHouseId] = useState<string | null>(null);

    useEffect(() => {
        async function getHouses() {
            const { data, error } = await supabase
                .from("houses")
                .select("*")
                .order("name", {
                    ascending: true,
                });

            if (error) {
                console.error("Could not load houses:", error);
                setLoading(false);
                return;
            }

            setHouses(data || []);
            setLoading(false);
        }

        getHouses();
    }, []);





    const handleSaveHouse = async () => {
        if (!houseName.trim()) {
            alert("Please enter a house name.");
            return;
        }

        setSaving(true);

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                alert("You are not logged in.");
                return;
            }

            const { data: schoolUser, error: schoolUserError } = await supabase
                .from("school_users")
                .select("school_id")
                .eq("user_id", user.id)
                .eq("status", "active")
                .single();

            if (schoolUserError || !schoolUser) {
                console.error("Could not find user's school:", schoolUserError);
                alert("Could not determine your school.");
                return;
            }

            if (editingHouseId) {
                // UPDATE existing house
                const { data, error } = await supabase
                    .from("houses")
                    .update({
                        name: houseName.trim(),
                        code: houseCode.trim() || null,
                        description: houseDescription.trim() || null,
                    })
                    .eq("id", editingHouseId)
                    .eq("school_id", schoolUser.school_id)
                    .select()
                    .single();

                if (error) {
                    console.error("Could not update house:", error);

                    if (error.code === "23505") {
                        alert("A house with this name already exists.");
                    } else {
                        alert("Could not update house. Please try again.");
                    }

                    return;
                }

                setHouses((current) =>
                    current
                        .map((house) =>
                            house.id === editingHouseId ? data : house
                        )
                        .sort((a, b) => a.name.localeCompare(b.name))
                );

            } else {
                // INSERT new house
                const { data, error } = await supabase
                    .from("houses")
                    .insert({
                        school_id: schoolUser.school_id,
                        name: houseName.trim(),
                        code: houseCode.trim() || null,
                        description: houseDescription.trim() || null,
                    })
                    .select()
                    .single();

                if (error) {
                    console.error("Could not save house:", error);

                    if (error.code === "23505") {
                        alert("A house with this name already exists.");
                    } else {
                        alert("Could not save house. Please try again.");
                    }

                    return;
                }

                setHouses((current) =>
                    [...current, data].sort((a, b) =>
                        a.name.localeCompare(b.name)
                    )
                );
            }

            // Clear form
            setHouseName("");
            setHouseCode("");
            setHouseDescription("");
            setEditingHouseId(null);
            setShowHouseForm(false);

        } finally {
            setSaving(false);
        }
    };


    const handleEditHouse = (house: House) => {
        setEditingHouseId(house.id);
        setHouseName(house.name);
        setHouseCode(house.code || "");
        setHouseDescription(house.description || "");
        setShowHouseForm(true);
    };


    const handleDeleteHouse = async (id: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this house?"
        );

        if (!confirmed) {
            return;
        }

        const { error } = await supabase
            .from("houses")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Could not delete house:", error);
            alert("Could not delete house. Please try again.");
            return;
        }

        setHouses((current) =>
            current.filter((house) => house.id !== id)
        );
    };




    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">
                        Houses
                    </h1>

                    <p className="text-gray-600 mt-1">
                        Manage houses for your school.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowHouseForm(true)}
                    className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition"
                >
                    + Add House
                </button>
            </div>

            {showHouseForm && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Add House
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                House Name
                            </label>

                            <input
                                type="text"
                                value={houseName}
                                onChange={(e) => setHouseName(e.target.value)}
                                placeholder="Enter house name"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                House Code
                            </label>

                            <input
                                type="text"
                                value={houseCode}
                                onChange={(e) => setHouseCode(e.target.value)}
                                placeholder="Enter house code"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>

                            <textarea
                                value={houseDescription}
                                onChange={(e) => setHouseDescription(e.target.value)}
                                placeholder="Enter house description"
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                    </div>

                    <div className="flex items-center gap-4 mt-6">

                        <button
                            type="button"
                            onClick={() => setShowHouseForm(false)}
                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveHouse}
                            disabled={saving}
                            className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition"
                        >
                            {saving ? "Saving..." : "Save House"}
                        </button>

                    </div>
                </div>
            )}




            <div className="mt-6 space-y-4">
                {
                    loading ? (
                        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>

                            <p className="text-gray-500 mt-4">
                                Loading houses...
                            </p>
                        </div>
                    ) : houses.length === 0 && !showHouseForm ? (
                        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                No houses yet
                            </h2>

                            <p className="text-gray-500 mt-2">
                                Create your first house to get started.
                            </p>
                        </div>
                    ) : houses.length > 0 ? (
                        houses.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-sm p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            {item.name}
                                        </h2>

                                        <p className="text-sm text-gray-500 mt-1">
                                            {item.code && `Code: ${item.code}`}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">

                                        {item.is_active ? (
                                            <p className="text-sm font-medium text-emerald-700">
                                                Active
                                            </p>
                                        ) : (
                                            <p className="text-sm font-medium text-gray-500">
                                                Inactive
                                            </p>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => handleEditHouse(item)}
                                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteHouse(item.id)}
                                            className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition"
                                        >
                                            Delete
                                        </button>

                                    </div>
                                </div>

                                {item.description && (
                                    <p className="text-gray-600 mt-4">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        ))
                    ) : null}
            </div>
        </div>
    );
}