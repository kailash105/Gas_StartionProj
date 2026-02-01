import React, { useEffect, useState } from 'react';
import { Plus, Check, X, FileText, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import {
    collection,
    addDoc,
    onSnapshot,
    updateDoc,
    query,
    orderBy,
    doc,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const Approvals = () => {
    const { user } = useAuth();

    const [approvals, setApprovals] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Operational');

    const CATEGORIES = [
        'Operational',
        'Maintenance',
        'Salary/Wages',
        'Inventory',
        'Other',
    ];

    // 🔥 REALTIME SYNC
    useEffect(() => {
        const q = query(
            collection(db, 'approvals'),
            orderBy('createdAt', 'desc')
        );

        const unsub = onSnapshot(q, snap => {
            setApprovals(
                snap.docs.map(d => ({ id: d.id, ...d.data() }))
            );
        });

        return unsub;
    }, []);

    // ➕ RAISE APPROVAL (MANAGER / ADMIN)
    const handleSubmit = async (e) => {
        e.preventDefault();

        await addDoc(collection(db, 'approvals'), {
            type: 'GENERAL', // 🔑 default
            amount: Number(amount),
            description,
            category,
            status: 'Pending',

            createdByUid: user.uid,
            createdByName: user.name || 'Unknown',
            createdByRole: user.role,

            createdAt: Timestamp.now(),
        });

        setIsFormOpen(false);
        setAmount('');
        setDescription('');
        setCategory('Operational');
    };

    // ✅ ADMIN ACTION
    const updateStatus = async (approval, status) => {
        const ref = doc(db, 'approvals', approval.id);

        await updateDoc(ref, {
            status,
            actionBy: user.name || 'Admin',
            actionAt: Timestamp.now(),
        });

        // 🔥 STAFF ADVANCE LOGIC
        if (status === 'Approved' && approval.type === 'STAFF_ADVANCE') {
            // 1️⃣ Add to expenses
            await addDoc(collection(db, 'expenses'), {
                type: 'SALARY_ADVANCE',
                staffId: approval.staffId,
                description: `Advance to ${approval.staffName}`,
                amount: approval.amount,
                date: Timestamp.now(),
                createdBy: user.name,
                createdAt: Timestamp.now(),
            });
        }
    };

    const visibleApprovals =
        user.role === 'admin'
            ? approvals
            : approvals.filter(a => a.createdByUid === user.uid);

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Finance Approvals
                    </h1>
                    <p className="text-slate-500">
                        Manage and track finance requests
                    </p>
                </div>

                {(user.role === 'manager' || user.role === 'admin') && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        <Plus size={20} /> Raise Ticket
                    </button>
                )}
            </div>

            {/* MODAL */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            New Finance Request
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="number"
                                required
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="Amount"
                                className="w-full border p-2 rounded"
                            />

                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full border p-2 rounded"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>

                            <textarea
                                required
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Description"
                                className="w-full border p-2 rounded"
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* LIST */}
            <div className="bg-white rounded-xl border overflow-hidden">
                {visibleApprovals.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <FileText size={48} className="mx-auto opacity-20" />
                        No approval requests
                    </div>
                ) : (
                    <div className="divide-y">
                        {visibleApprovals.map(a => (
                            <div key={a.id} className="p-4 flex justify-between">
                                <div>
                                    <span
                                        className={clsx(
                                            'px-2 py-1 text-xs rounded',
                                            a.status === 'Pending' && 'bg-yellow-100',
                                            a.status === 'Approved' && 'bg-green-100',
                                            a.status === 'Rejected' && 'bg-red-100'
                                        )}
                                    >
                                        {a.status}
                                    </span>

                                    <h3 className="font-bold mt-2">
                                        ₹{a.amount} · {a.category}
                                    </h3>

                                    <p className="text-sm text-slate-600">
                                        {a.description}
                                    </p>

                                    <p className="text-xs text-slate-400">
                                        {a.createdByName} ·{' '}
                                        <Calendar size={12} className="inline" />{' '}
                                        {a.createdAt?.toDate().toLocaleDateString()}
                                    </p>
                                </div>

                                {user.role === 'admin' && a.status === 'Pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateStatus(a, 'Approved')}
                                            className="text-green-600"
                                        >
                                            <Check />
                                        </button>
                                        <button
                                            onClick={() => updateStatus(a, 'Rejected')}
                                            className="text-red-600"
                                        >
                                            <X />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Approvals;
