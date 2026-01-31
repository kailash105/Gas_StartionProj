import React, { useEffect, useState } from 'react';
import { Plus, Check, X, FileText, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import {
    collection,
    addDoc,
    onSnapshot,
    updateDoc,
    doc,
    query,
    orderBy,
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

    // 🔥 REALTIME FIRESTORE SYNC
    useEffect(() => {
        const q = query(
            collection(db, 'approvals'),
            orderBy('createdAt', 'desc')
        );

        const unsub = onSnapshot(q, snap => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setApprovals(list);
        });

        return unsub;
    }, []);

    // ➕ RAISE TICKET (MANAGER)
    const handleSubmit = async (e) => {
        e.preventDefault();

        await addDoc(collection(db, 'approvals'), {
            amount: Number(amount),
            description,
            category,
            status: 'Pending',
            createdByUid: user.uid,
            createdByName: user.name,
            createdAt: new Date(),
        });

        setIsFormOpen(false);
        setAmount('');
        setDescription('');
        setCategory('Operational');
    };

    // ✅ ADMIN ACTIONS
    const updateStatus = async (id, status) => {
        await updateDoc(doc(db, 'approvals', id), {
            status,
            actionBy: user.name,
            actionAt: new Date(),
        });
    };

    const visibleApprovals =
        user.role === 'admin'
            ? approvals
            : approvals.filter(a => a.createdByUid === user.uid);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Finance Approvals</h1>
                    <p className="text-slate-500">Manage and track finance requests</p>
                </div>

                {user.role === 'manager' && (
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
                        <h2 className="text-xl font-bold mb-4">New Request</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="Amount"
                                className="w-full border p-2 rounded"
                                required
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
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Description"
                                className="w-full border p-2 rounded"
                                required
                            />
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsFormOpen(false)}>
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
            <div className="bg-white border rounded-xl overflow-hidden">
                {visibleApprovals.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <FileText size={48} className="mx-auto opacity-20" />
                        No requests
                    </div>
                ) : (
                    <div className="divide-y">
                        {visibleApprovals.map(t => (
                            <div key={t.id} className="p-4 flex justify-between">
                                <div>
                                    <span className={clsx(
                                        'text-xs px-2 py-1 rounded',
                                        t.status === 'Pending' && 'bg-yellow-100',
                                        t.status === 'Approved' && 'bg-green-100',
                                        t.status === 'Rejected' && 'bg-red-100'
                                    )}>
                                        {t.status}
                                    </span>
                                    <h3 className="font-bold mt-2">{t.category} – ₹{t.amount}</h3>
                                    <p className="text-sm text-slate-600">{t.description}</p>
                                    <p className="text-xs text-slate-400">
                                        {t.createdByName} · <Calendar size={12} className="inline" />{' '}
                                        {new Date(t.createdAt.seconds * 1000).toLocaleDateString()}
                                    </p>
                                </div>

                                {user.role === 'admin' && t.status === 'Pending' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => updateStatus(t.id, 'Approved')}>
                                            <Check />
                                        </button>
                                        <button onClick={() => updateStatus(t.id, 'Rejected')}>
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
