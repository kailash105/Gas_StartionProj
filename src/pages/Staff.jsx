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
    const [expenses, setExpenses] = useState([]); // optional: link later
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        salary: "",
        email: "",
        password: "",
    });

    // 🔄 Fetch staff from Firestore
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

    // 💰 Salary advances (kept for compatibility)
    const getAdvances = (staffId) => {
        return expenses
            .filter((e) => e.type === "SALARY_ADVANCE" && e.staffId === staffId)
            .reduce((sum, e) => sum + e.amount, 0);
    };

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

            // 2️⃣ Create business staff record
            await addDoc(collection(db, "staff"), {
                name: formData.name,
                role: formData.role,
                salary: Number(formData.salary),
                email: formData.email,
                createdAt: new Date(),
            });

            alert("Staff created successfully");

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
            alert(err.message || "Failed to create staff");
        }
    };

    // 🗑️ DELETE STAFF (BUSINESS RECORD ONLY)
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to remove this staff member?")) return;
        await deleteDoc(doc(db, "staff", id));
    };

    return (
        <div>
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
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
                            const advances = getAdvances(person.id);
                            const netPayable = person.salary - advances;

                            return (
                                <div
                                    key={person.id}
                                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50 gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                            <Wallet size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">
                                                {person.name}
                                            </h3>
                                            <p className="text-xs text-slate-500">{person.role}</p>
                                            <p className="text-xs text-slate-400">{person.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="text-right">
                                            <div className="text-xs text-slate-400 uppercase">
                                                Monthly Salary
                                            </div>
                                            <div className="font-bold text-slate-800">
                                                ₹{person.salary.toLocaleString()}
                                            </div>
                                        </div>

                                        {advances > 0 && (
                                            <div className="text-right">
                                                <div className="text-xs text-orange-500 uppercase font-bold">
                                                    Advances
                                                </div>
                                                <div className="font-bold text-orange-600">
                                                    -₹{advances.toLocaleString()}
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-right">
                                            <div className="text-xs text-green-600 uppercase font-bold">
                                                Net Payable
                                            </div>
                                            <div className="font-bold text-green-600">
                                                ₹{netPayable.toLocaleString()}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(person.id)}
                                            className="text-slate-400 hover:text-red-500 ml-2"
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
                        <h2 className="text-xl font-bold mb-4">Add Staff Member</h2>

                        <form onSubmit={handleAddStaff} className="space-y-4">
                            <input
                                placeholder="Full Name"
                                className="w-full p-2 border rounded"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />

                            <input
                                placeholder="Role (Manager / Attendant)"
                                className="w-full p-2 border rounded"
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({ ...formData, role: e.target.value })
                                }
                                required
                            />

                            <input
                                type="number"
                                placeholder="Monthly Salary (₹)"
                                className="w-full p-2 border rounded"
                                value={formData.salary}
                                onChange={(e) =>
                                    setFormData({ ...formData, salary: e.target.value })
                                }
                                required
                            />

                            <input
                                type="email"
                                placeholder="Login Email"
                                className="w-full p-2 border rounded"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                required
                            />

                            <input
                                type="password"
                                placeholder="Temporary Password"
                                className="w-full p-2 border rounded"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
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
