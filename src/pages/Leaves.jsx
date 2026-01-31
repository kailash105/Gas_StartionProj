import React, { useEffect, useState } from 'react';
import { Plus, Check, X, FileText, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import {
    collection,
    addDoc,
    onSnapshot,
    updateDoc,
    query,
    orderBy,
    doc,
} from 'firebase/firestore';
import { db } from '../firebase';

const Leaves = () => {
    const { user } = useAuth();

    const [leaves, setLeaves] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [type, setType] = useState('Sick Leave');

    const LEAVE_TYPES = [
        'Sick Leave',
        'Casual Leave',
        'Emergency Leave',
        'Vacation',
        'Other',
    ];

    // 🔥 REALTIME FIRESTORE SYNC
    useEffect(() => {
        const q = query(
            collection(db, 'leaves'),
            orderBy('createdAt', 'desc')
        );

        const unsub = onSnapshot(q, snap => {
            const list = snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
            }));
            setLeaves(list);
        });

        return unsub;
    }, []);

    // ➕ REQUEST LEAVE (MANAGER)
    const handleSubmit = async (e) => {
        e.preventDefault();

        await addDoc(collection(db, 'leaves'), {
            startDate,
            endDate,
            reason,
            type,
            status: 'Pending',

            // ✅ SAFE FIELDS (NO undefined)
            createdByUid: user.uid,
            createdByName: user?.name || 'Unknown',

            createdAt: new Date(),
        });

        setIsFormOpen(false);
        setStartDate('');
        setEndDate('');
        setReason('');
        setType('Sick Leave');
    };

    // ✅ ADMIN ACTIONS
    const updateStatus = async (id, status) => {
        await updateDoc(doc(db, 'leaves', id), {
            status,
            actionBy: user?.name || 'Admin',
            actionAt: new Date(),
        });
    };

    const visibleLeaves =
        user.role === 'admin'
            ? leaves
            : leaves.filter(l => l.createdByUid === user.uid);

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Leave Management
                    </h1>
                    <p className="text-slate-500">
                        Track and manage leave requests
                    </p>
                </div>

                {user.role === 'manager' && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        <Plus size={20} /> Request Leave
                    </button>
                )}
            </div>

            {/* MODAL */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Request Leave</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="border p-2 rounded"
                                />
                                <input
                                    type="date"
                                    required
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="border p-2 rounded"
                                />
                            </div>

                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full border p-2 rounded"
                            >
                                {LEAVE_TYPES.map(t => (
                                    <option key={t}>{t}</option>
                                ))}
                            </select>

                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                required
                                placeholder="Reason"
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
                {visibleLeaves.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <FileText size={48} className="mx-auto opacity-20" />
                        No leave requests
                    </div>
                ) : (
                    <div className="divide-y">
                        {visibleLeaves.map(l => (
                            <div key={l.id} className="p-4 flex justify-between">
                                <div>
                                    <span
                                        className={clsx(
                                            'px-2 py-1 text-xs rounded',
                                            l.status === 'Pending' && 'bg-yellow-100',
                                            l.status === 'Approved' && 'bg-green-100',
                                            l.status === 'Rejected' && 'bg-red-100'
                                        )}
                                    >
                                        {l.status}
                                    </span>

                                    <h3 className="font-bold mt-2">{l.type}</h3>

                                    <p className="text-sm text-slate-600">
                                        {l.startDate} → {l.endDate}
                                    </p>

                                    <p className="text-sm text-slate-600">{l.reason}</p>

                                    <p className="text-xs text-slate-400">
                                        {l.createdByName || 'Unknown'} ·{' '}
                                        <Calendar size={12} className="inline" />{' '}
                                        {l.createdAt?.seconds
                                            ? new Date(l.createdAt.seconds * 1000).toLocaleDateString()
                                            : ''}
                                    </p>
                                </div>

                                {user.role === 'admin' && l.status === 'Pending' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => updateStatus(l.id, 'Approved')}>
                                            <Check />
                                        </button>
                                        <button onClick={() => updateStatus(l.id, 'Rejected')}>
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

export default Leaves;
