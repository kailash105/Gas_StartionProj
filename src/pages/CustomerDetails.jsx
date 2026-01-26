import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Wallet, Fuel, Banknote } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import clsx from 'clsx';

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { customers, transactions, setTransactions } = useAppContext();

    const customer = customers.find(c => c.id === id);
    const customerTransactions = transactions.filter(t => t.customerId === id);

    const [viewImageObj, setViewImageObj] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        type: 'FUEL', // FUEL or PAYMENT
        date: new Date().toISOString().split('T')[0],
        amount: '',
        note: '',
        image: null
    });

    // Calculate totals
    const { totalFuel, totalPaid, due } = useMemo(() => {
        let fuel = 0;
        let paid = 0;
        customerTransactions.forEach(t => {
            if (t.type === 'FUEL') fuel += t.amount;
            else if (t.type === 'PAYMENT') paid += t.amount;
        });
        return { totalFuel: fuel, totalPaid: paid, due: fuel - paid };
    }, [customerTransactions]);

    if (!customer) {
        return <div className="p-8 text-center">Customer not found</div>;
    }

    const handleAddTransaction = (e) => {
        e.preventDefault();
        if (!formData.amount) return;

        const newTransaction = {
            id: Date.now().toString(),
            customerId: id,
            ...formData,
            amount: Number(formData.amount),
            createdAt: new Date().toISOString()
        };

        setTransactions([newTransaction, ...transactions]);
        setShowAddModal(false);
        setFormData({ ...formData, amount: '', note: '', image: null });
    };

    // ...

    return (
        <div>
            {/* View Image Modal */}
            {viewImageObj && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setViewImageObj(null)}
                >
                    <div className="bg-white p-2 rounded-xl max-w-2xl max-h-[90vh] overflow-auto">
                        <img src={viewImageObj} alt="Receipt" className="w-full h-auto rounded-lg" />
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/customers')} className="p-2 hover:bg-slate-100 rounded-lg">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">{customer.name}</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-xs text-blue-600 uppercase font-bold mb-1">Total Usage</div>
                    <div className="text-xl font-bold text-slate-800">₹{totalFuel.toLocaleString()}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="text-xs text-green-600 uppercase font-bold mb-1">Total Paid</div>
                    <div className="text-xl font-bold text-slate-800">₹{totalPaid.toLocaleString()}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <div className="text-xs text-red-600 uppercase font-bold mb-1">Due Amount</div>
                    <div className="text-xl font-bold text-red-600">₹{due.toLocaleString()}</div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-700">Transactions</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-700"
                >
                    <Plus size={16} /> Add Entry
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {customerTransactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No transactions recorded yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Type</th>
                                    <th className="px-6 py-3 font-medium">Note</th>
                                    <th className="px-6 py-3 font-medium text-right">Amount</th>
                                    <th className="px-6 py-3 font-medium text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {customerTransactions
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                                    .map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {new Date(t.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                                                    t.type === 'FUEL' ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                                                )}>
                                                    {t.type === 'FUEL' ? <Fuel size={12} /> : <Banknote size={12} />}
                                                    {t.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{t.note || '-'}</td>
                                            <td className={clsx(
                                                "px-6 py-4 text-sm font-bold text-right",
                                                t.type === 'FUEL' ? "text-slate-800" : "text-green-600"
                                            )}>
                                                {t.type === 'FUEL' ? '-' : '+'} ₹{t.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {t.image && (
                                                    <button
                                                        onClick={() => setViewImageObj(t.image)}
                                                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-xs"
                                                    >
                                                        <Banknote size={16} /> View
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Transaction Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
                        <form onSubmit={handleAddTransaction}>
                            {/* ... existing fields ... */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {/* ... transaction type buttons ... */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'FUEL' })}
                                    className={clsx(
                                        "p-3 rounded-lg border flex flex-col items-center gap-2",
                                        formData.type === 'FUEL' ? "bg-orange-50 border-orange-200 text-orange-700" : "border-slate-200 text-slate-500"
                                    )}
                                >
                                    <Fuel size={24} />
                                    <span className="font-medium text-sm">Fuel Usage</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'PAYMENT' })}
                                    className={clsx(
                                        "p-3 rounded-lg border flex flex-col items-center gap-2",
                                        formData.type === 'PAYMENT' ? "bg-green-50 border-green-200 text-green-700" : "border-slate-200 text-slate-500"
                                    )}
                                >
                                    <Banknote size={24} />
                                    <span className="font-medium text-sm">Payment Received</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* ... existing inputs ... */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full p-2 border border-slate-300 rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full p-2 border border-slate-300 rounded"
                                        placeholder="0.00"
                                        required
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Note (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.note}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                        className="w-full p-2 border border-slate-300 rounded"
                                        placeholder="Vehicle No, etc."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Receipt/Proof (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData({ ...formData, image: reader.result });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {formData.image && (
                                        <p className="mt-1 text-xs text-green-600">Image attached</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Save Entry
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
