import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Banknote } from 'lucide-react';
import {
    collection,
    addDoc,
    deleteDoc,
    onSnapshot,
    orderBy,
    query,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const Expenses = () => {
    const { user } = useAuth();

    const [expenses, setExpenses] = useState([]);
    const [staff, setStaff] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showAdvanceForm, setShowAdvanceForm] = useState(false);
    const [viewImageObj, setViewImageObj] = useState(null);

    // 🔄 REALTIME EXPENSES
    useEffect(() => {
        const q = query(
            collection(db, 'expenses'),
            orderBy('createdAt', 'desc')
        );

        const unsub = onSnapshot(q, snap => {
            setExpenses(
                snap.docs.map(d => ({ id: d.id, ...d.data() }))
            );
        });

        return unsub;
    }, []);

    // 🔄 STAFF LIST (FOR ADVANCE)
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'staff'), snap => {
            setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, []);

    // ➕ NORMAL EXPENSE
    const handleAddExpense = async (e) => {
        e.preventDefault();

        await addDoc(collection(db, 'expenses'), {
            type: 'EXPENSE',
            description: formData.description,
            amount: Number(formData.amount),
            date: formData.date,
            image: formData.image || null,
            createdBy: user.name,
            createdAt: new Date(),
        });

        setFormData(defaultExpenseForm);
        setShowForm(false);
    };

    // ➕ STAFF ADVANCE
    const handleAddAdvance = async (e) => {
        e.preventDefault();
        const selectedStaff = staff.find(s => s.id === advanceData.staffId);
        if (!selectedStaff) return;

        await addDoc(collection(db, 'expenses'), {
            type: 'SALARY_ADVANCE',
            description: `Advance to ${selectedStaff.name}`,
            staffId: selectedStaff.id,
            amount: Number(advanceData.amount),
            date: advanceData.date,
            createdBy: user.name,
            createdAt: new Date(),
        });

        setAdvanceData(defaultAdvanceForm);
        setShowAdvanceForm(false);
    };

    // 🗑 DELETE (ADMIN ONLY)
    const handleDelete = async (id) => {
        if (!confirm('Delete this entry?')) return;
        await deleteDoc(collection(db, 'expenses').doc(id));
    };

    // FORM STATES
    const defaultExpenseForm = {
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        image: null,
    };

    const defaultAdvanceForm = {
        date: new Date().toISOString().split('T')[0],
        staffId: '',
        amount: '',
    };

    const [formData, setFormData] = useState(defaultExpenseForm);
    const [advanceData, setAdvanceData] = useState(defaultAdvanceForm);

    return (
        <div>
            {/* IMAGE VIEW */}
            {viewImageObj && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setViewImageObj(null)}
                >
                    <img src={viewImageObj} className="max-h-[90vh] rounded-xl" />
                </div>
            )}

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Expenses & Tips</h1>

                <div className="flex gap-2">
                    {user.role === 'admin' && (
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

            {/* LIST */}
            <div className="bg-white rounded-xl border">
                {expenses.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No expenses recorded</div>
                ) : (
                    <div className="divide-y">
                        {expenses.map(e => (
                            <div key={e.id} className="p-4 flex justify-between">
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${e.type === 'SALARY_ADVANCE'
                                        ? 'bg-orange-50 text-orange-600'
                                        : 'bg-red-50 text-red-600'
                                        }`}>
                                        <Banknote size={20} />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold">
                                            {e.description}
                                            {e.type === 'SALARY_ADVANCE' && (
                                                <span className="ml-2 text-xs bg-orange-100 px-2 rounded">
                                                    ADVANCE
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {new Date(e.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="font-bold">₹{e.amount}</span>

                                    {e.image && (
                                        <button onClick={() => setViewImageObj(e.image)}>
                                            <Banknote size={16} />
                                        </button>
                                    )}

                                    {user.role === 'admin' && (
                                        <button
                                            onClick={() => handleDelete(e.id)}
                                            className="text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
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

                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                    const reader = new FileReader();
                                    reader.onloadend = () =>
                                        setFormData({ ...formData, image: reader.result });
                                    reader.readAsDataURL(e.target.files[0]);
                                }}
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
                            Record Staff Advance
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
                                    Record
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
