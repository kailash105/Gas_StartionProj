import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Fuel, Banknote } from 'lucide-react';
import clsx from 'clsx';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    Timestamp,
    doc,
    getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

const normalizeDate = (d) =>
    d?.toDate?.() ?? new Date(d);

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [transactions, setTransactions] = useState([]);

    const [viewImageObj, setViewImageObj] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const [formData, setFormData] = useState({
        type: 'FUEL',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        note: '',
        image: null,
    });

    // 🔹 LOAD CUSTOMER
    useEffect(() => {
        const loadCustomer = async () => {
            const snap = await getDoc(doc(db, 'customers', id));
            if (snap.exists()) {
                setCustomer({ id: snap.id, ...snap.data() });
            }
        };
        loadCustomer();
    }, [id]);

    // 🔥 REALTIME TRANSACTIONS (NO INDEX)
    useEffect(() => {
        const q = query(
            collection(db, 'transactions'),
            where('customerId', '==', id)
        );

        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
            }));
            setTransactions(list);
        });

        return unsub;
    }, [id]);

    // 🔹 TOTALS
    const { totalFuel, totalPaid, due } = useMemo(() => {
        let fuel = 0;
        let paid = 0;
        transactions.forEach(t => {
            if (t.type === 'FUEL') fuel += t.amount;
            else if (t.type === 'PAYMENT') paid += t.amount;
        });
        return { totalFuel: fuel, totalPaid: paid, due: fuel - paid };
    }, [transactions]);

    if (!customer) {
        return <div className="p-8 text-center">Customer not found</div>;
    }

    // 🔹 ADD TRANSACTION
    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!formData.amount) return;

        await addDoc(collection(db, 'transactions'), {
            customerId: id,
            type: formData.type,
            note: formData.note || '',
            image: formData.image || null,
            amount: Number(formData.amount),
            date: Timestamp.fromDate(new Date(formData.date)),
            createdAt: Timestamp.now(),
        });

        setShowAddModal(false);
        setFormData({
            ...formData,
            amount: '',
            note: '',
            image: null,
        });
    };

    return (
        <div>
            {/* IMAGE VIEW */}
            {viewImageObj && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setViewImageObj(null)}
                >
                    <div className="bg-white p-2 rounded-xl max-w-2xl">
                        <img src={viewImageObj} alt="Receipt" className="rounded-lg" />
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/customers')}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold">{customer.name}</h1>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="text-xs text-blue-600 font-bold">TOTAL USAGE</div>
                    <div className="text-xl font-bold">₹{totalFuel}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                    <div className="text-xs text-green-600 font-bold">TOTAL PAID</div>
                    <div className="text-xl font-bold">₹{totalPaid}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                    <div className="text-xs text-red-600 font-bold">DUE</div>
                    <div className="text-xl font-bold text-red-600">₹{due}</div>
                </div>
            </div>

            {/* TRANSACTIONS HEADER */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Transactions</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2"
                >
                    <Plus size={16} /> Add Entry
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl border overflow-hidden">
                {transactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No transactions recorded yet.
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Note</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3 text-right">Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...transactions]
                                .sort((a, b) =>
                                    normalizeDate(b.date) - normalizeDate(a.date)
                                )
                                .map(t => (
                                    <tr key={t.id} className="border-t">
                                        <td className="px-6 py-3">
                                            {normalizeDate(t.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={clsx(
                                                "px-2 py-1 text-xs rounded",
                                                t.type === 'FUEL'
                                                    ? "bg-orange-100 text-orange-700"
                                                    : "bg-green-100 text-green-700"
                                            )}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">{t.note || '-'}</td>
                                        <td className="px-6 py-3 text-right font-bold">
                                            {t.type === 'FUEL' ? '-' : '+'} ₹{t.amount}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            {t.image && (
                                                <button
                                                    onClick={() => setViewImageObj(t.image)}
                                                    className="text-blue-600 text-xs"
                                                >
                                                    View
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ADD MODAL (UI UNCHANGED) */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Transaction</h2>

                        <form onSubmit={handleAddTransaction}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'FUEL' })}
                                    className={clsx(
                                        "p-3 rounded-lg border",
                                        formData.type === 'FUEL'
                                            ? "bg-orange-50 border-orange-200"
                                            : ""
                                    )}
                                >
                                    <Fuel /> Fuel
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'PAYMENT' })}
                                    className={clsx(
                                        "p-3 rounded-lg border",
                                        formData.type === 'PAYMENT'
                                            ? "bg-green-50 border-green-200"
                                            : ""
                                    )}
                                >
                                    <Banknote /> Payment
                                </button>
                            </div>

                            <input
                                type="date"
                                value={formData.date}
                                onChange={e =>
                                    setFormData({ ...formData, date: e.target.value })
                                }
                                className="w-full mb-3 p-2 border rounded"
                                required
                            />

                            <input
                                type="number"
                                placeholder="Amount"
                                value={formData.amount}
                                onChange={e =>
                                    setFormData({ ...formData, amount: e.target.value })
                                }
                                className="w-full mb-3 p-2 border rounded"
                                required
                            />

                            <input
                                type="text"
                                placeholder="Note (optional)"
                                value={formData.note}
                                onChange={e =>
                                    setFormData({ ...formData, note: e.target.value })
                                }
                                className="w-full mb-4 p-2 border rounded"
                            />

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded"
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

export default CustomerDetails;
