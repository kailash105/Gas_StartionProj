import React, { useEffect, useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";
import { httpsCallable } from "firebase/functions";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
} from "firebase/firestore";
import { db, functions } from "../firebase";

const Staff = () => {
    const [staff, setStaff] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        salary: "",
        email: "",
        password: "",
    });

    // 🔄 FETCH STAFF
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "staff"), (snap) => {
            const list = snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setStaff(list);
        });

        return () => unsub();
    }, []);

    // ➕ ADD STAFF (AUTH + FIRESTORE)
    const handleAddStaff = async (e) => {
        e.preventDefault();

        try {
            // 1️⃣ Create login user via Cloud Function
            const createStaffUser = httpsCallable(functions, "createStaffUser");
            await createStaffUser({
                email: formData.email,
                password: formData.password,
                name: formData.name,
            });

            // 2️⃣ Create staff document
            await addDoc(collection(db, "staff"), {
                name: formData.name,
                role: formData.role,
                salary: Number(formData.salary),

                // ✅ NEW FIELDS (IMPORTANT)
                advanceTaken: 0,
                payableSalary: Number(formData.salary),

                email: formData.email,
                createdAt: new Date(),
            });

            alert("Staff added successfully");

            setFormData({
                name: "",
                role: "",
                salary: "",
                email: "",
                password: "",
            });
            setShowForm(false);
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to add staff");
        }
    };

    // 🗑 DELETE STAFF
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to remove this staff member?")) return;
        await deleteDoc(doc(db, "staff", id));
    };

    return (
        <div>
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    Staff Management
                </h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={20} /> Add Staff
                </button>
            </div>

            {/* STAFF LIST */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {staff.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No staff members added.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {staff.map((person) => {
                            const salary = person.salary || 0;
                            const advance = person.advanceTaken || 0;
                            const payable =
                                person.payableSalary ??
                                salary - advance;

                            return (
                                <div
                                    key={person.id}
                                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50"
                                >
                                    {/* LEFT */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                            <Wallet size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">
                                                {person.name}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                {person.role}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {person.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* RIGHT */}
                                    <div className="flex flex-wrap gap-6 items-center justify-end w-full sm:w-auto">
                                        {/* SALARY */}
                                        <div className="text-right">
                                            <div className="text-xs text-slate-400 uppercase">
                                                Salary
                                            </div>
                                            <div className="font-bold">
                                                ₹{salary.toLocaleString()}
                                            </div>
                                        </div>

                                        {/* ADVANCE */}
                                        {advance > 0 && (
                                            <div className="text-right">
                                                <div className="text-xs text-orange-600 uppercase font-bold">
                                                    Advance
                                                </div>
                                                <div className="font-bold text-orange-600">
                                                    -₹{advance.toLocaleString()}
                                                </div>
                                            </div>
                                        )}

                                        {/* PAYABLE */}
                                        <div className="text-right">
                                            <div className="text-xs text-green-600 uppercase font-bold">
                                                Payable
                                            </div>
                                            <div className="font-bold text-green-600">
                                                ₹{payable.toLocaleString()}
                                            </div>
                                        </div>

                                        {/* DELETE */}
                                        <button
                                            onClick={() => handleDelete(person.id)}
                                            className="text-slate-400 hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ADD STAFF MODAL */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            Add Staff Member
                        </h2>

                        <form
                            onSubmit={handleAddStaff}
                            className="space-y-4"
                        >
                            <input
                                placeholder="Full Name"
                                className="w-full p-2 border rounded"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                required
                            />

                            <input
                                placeholder="Role (Admin / Manager / Attendant)"
                                className="w-full p-2 border rounded"
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        role: e.target.value,
                                    })
                                }
                                required
                            />

                            <input
                                type="number"
                                placeholder="Monthly Salary (₹)"
                                className="w-full p-2 border rounded"
                                value={formData.salary}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        salary: e.target.value,
                                    })
                                }
                                required
                            />

                            <input
                                type="email"
                                placeholder="Login Email"
                                className="w-full p-2 border rounded"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                required
                            />

                            <input
                                type="password"
                                placeholder="Temporary Password"
                                className="w-full p-2 border rounded"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                required
                            />

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;
