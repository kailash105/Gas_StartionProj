import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Banknote } from 'lucide-react';
import {
    collection,
    addDoc,
    deleteDoc,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    doc,
    updateDoc,
    getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const Expenses = () => {
    const { user } = useAuth();

    const [expenses, setExpenses] = useState([]);
    const [staff, setStaff] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showAdvanceForm, setShowAdvanceForm] = useState(false);

    // -------------------------
    // REALTIME EXPENSES
    // -------------------------
    useEffect(() => {
        const q = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, snap => {
            setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, []);

    // -------------------------
    // STAFF LIST
    // -------------------------
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'staff'), snap => {
            setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, []);

    // -------------------------
    // FORM STATES
    // -------------------------
    const defaultExpenseForm = {
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
    };

    const defaultAdvanceForm = {
        date: new Date().toISOString().split('T')[0],
        staffId: '',
        amount: '',
    };

    const [formData, setFormData] = useState(defaultExpenseForm);
    const [advanceData, setAdvanceData] = useState(defaultAdvanceForm);

    // -------------------------
    // ADD NORMAL EXPENSE
    // -------------------------
    const handleAddExpense = async (e) => {
        e.preventDefault();

        await addDoc(collection(db, 'expenses'), {
            type: 'EXPENSE',
            description: formData.description,
            amount: Number(formData.amount),
            date: Timestamp.fromDate(new Date(formData.date)),
            createdBy: user?.name || user?.email || 'System',
            createdAt: Timestamp.now(),
        });

        setFormData(defaultExpenseForm);
        setShowForm(false);
    };

    // -------------------------
    // ADD STAFF ADVANCE
    // -------------------------
    const handleAddAdvance = async (e) => {
        e.preventDefault();

        const selectedStaff = staff.find(s => s.id === advanceData.staffId);
        if (!selectedStaff) return;

        const amount = Number(advanceData.amount);

        // -------------------------
        // MANAGER → APPROVAL FLOW
        // -------------------------
        if (user.role === 'manager') {
            await addDoc(collection(db, 'approvals'), {
                type: 'SALARY_ADVANCE',
                staffId: selectedStaff.id,
                staffName: selectedStaff.name,
                amount,
                requestedBy: user?.name || user?.email || 'Manager',
                date: Timestamp.fromDate(new Date(advanceData.date)),
                status: 'Pending',
                createdAt: Timestamp.now(),
            });
        }

        // -------------------------
        // ADMIN → DIRECT ADVANCE
        // -------------------------
        if (user.role === 'admin') {
            // 1️⃣ Expense entry
            await addDoc(collection(db, 'expenses'), {
                type: 'SALARY_ADVANCE',
                staffId: selectedStaff.id,
                description: `Advance to ${selectedStaff.name}`,
                amount,
                date: Timestamp.fromDate(new Date(advanceData.date)),
                approved: true,
                createdBy: user?.name || user?.email || 'Admin',
                createdAt: Timestamp.now(),
            });

            // 2️⃣ Salary deduction
            const staffRef = doc(db, 'staff', selectedStaff.id);
            const staffSnap = await getDoc(staffRef);
            const staffData = staffSnap.data();

            const prevAdvance = staffData.advanceTaken || 0;
            const salary = staffData.salary || 0;
            const newAdvance = prevAdvance + amount;

            await updateDoc(staffRef, {
                advanceTaken: newAdvance,
                payableSalary: salary - newAdvance,
            });
        }

        setAdvanceData(defaultAdvanceForm);
        setShowAdvanceForm(false);
    };

    // -------------------------
    // DELETE EXPENSE (ADMIN)
    // -------------------------
    const handleDelete = async (id) => {
        if (!confirm('Delete this entry?')) return;
        await deleteDoc(doc(db, 'expenses', id));
    };

    return (
        <div>
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Expenses</h1>

                <div className="flex gap-2">
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                        <button
                            onClick={() => setShowAdvanceForm(true)}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Banknote size={20} /> Staff Advance
                        </button>
                    )}

                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={20} /> Add Expense
                    </button>
                </div>
            </div>

            {/* EXPENSE LIST */}
            <div className="bg-white rounded-xl border divide-y">
                {expenses.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No expenses recorded
                    </div>
                ) : (
                    expenses.map(e => (
                        <div key={e.id} className="p-4 flex justify-between">
                            <div>
                                <h3 className="font-semibold">{e.description}</h3>
                                <p className="text-xs text-slate-500">
                                    {e.date?.toDate().toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="font-bold">₹{e.amount}</span>

                                {user?.role === 'admin' && (
                                    <button
                                        onClick={() => handleDelete(e.id)}
                                        className="text-red-500"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ADD EXPENSE MODAL */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Expense</h2>

                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full border p-2 rounded"
                            />

                            <input
                                placeholder="Description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            />

                            <input
                                type="number"
                                placeholder="Amount"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            />

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* STAFF ADVANCE MODAL */}
            {showAdvanceForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-orange-700">
                            Staff Advance
                        </h2>

                        <form onSubmit={handleAddAdvance} className="space-y-4">
                            <input
                                type="date"
                                value={advanceData.date}
                                onChange={e => setAdvanceData({ ...advanceData, date: e.target.value })}
                                className="w-full border p-2 rounded"
                            />

                            <select
                                value={advanceData.staffId}
                                onChange={e => setAdvanceData({ ...advanceData, staffId: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            >
                                <option value="">Select Staff</option>
                                {staff.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.role})
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                placeholder="Amount"
                                value={advanceData.amount}
                                onChange={e => setAdvanceData({ ...advanceData, amount: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            />

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAdvanceForm(false)}>
                                    Cancel
                                </button>
                                <button className="bg-orange-600 text-white px-4 py-2 rounded">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
