import React, { useState } from 'react';
import { Plus, Trash2, Banknote } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Expenses = () => {
    const { expenses, setExpenses, staff } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [showAdvanceForm, setShowAdvanceForm] = useState(false);
    const [viewImageObj, setViewImageObj] = useState(null);

    // Normal Expense Form Data
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        image: null
    });

    // Staff Advance Form Data
    const [advanceData, setAdvanceData] = useState({
        date: new Date().toISOString().split('T')[0],
        staffId: '',
        amount: ''
    });

    const handleAddExpense = (e) => {
        e.preventDefault();
        const newExpense = {
            id: Date.now().toString(),
            type: 'EXPENSE',
            ...formData,
            amount: Number(formData.amount)
        };
        setExpenses([newExpense, ...expenses]);
        setFormData({ date: new Date().toISOString().split('T')[0], description: '', amount: '', image: null });
        setShowForm(false);
    };

    const handleAddAdvance = (e) => {
        e.preventDefault();
        const selectedStaff = staff.find(s => s.id === advanceData.staffId);
        if (!selectedStaff) return;

        const newExpense = {
            id: Date.now().toString(),
            type: 'SALARY_ADVANCE',
            description: `Advance to ${selectedStaff.name}`,
            date: advanceData.date,
            amount: Number(advanceData.amount),
            staffId: advanceData.staffId
        };
        setExpenses([newExpense, ...expenses]);
        setAdvanceData({ date: new Date().toISOString().split('T')[0], staffId: '', amount: '' });
        setShowAdvanceForm(false);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this entry?')) {
            setExpenses(expenses.filter(e => e.id !== id));
        }
    };

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

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Expenses & Tips</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAdvanceForm(true)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700"
                    >
                        <Banknote size={20} /> <span className="hidden sm:inline">Staff Advance</span>
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                    >
                        <Plus size={20} /> <span className="hidden sm:inline">Add Expense</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {expenses.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No expenses recorded.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {expenses.map(expense => (
                            <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${expense.type === 'SALARY_ADVANCE' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        <Banknote size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                            {expense.description}
                                            {expense.type === 'SALARY_ADVANCE' && (
                                                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">ADVANCE</span>
                                            )}
                                        </h3>
                                        <p className="text-xs text-slate-500">{new Date(expense.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className="font-bold text-slate-800">₹{expense.amount.toLocaleString()}</div>
                                    {expense.image && (
                                        <button
                                            onClick={() => setViewImageObj(expense.image)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="View Receipt"
                                        >
                                            <Banknote size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(expense.id)}
                                        className="text-slate-400 hover:text-red-500"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Expense Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Expense</h2>
                        <form onSubmit={handleAddExpense}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border border-slate-300 rounded"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        placeholder="Electricity bill, Tea, etc."
                                        className="w-full p-2 border border-slate-300 rounded"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border border-slate-300 rounded"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Receipt (Optional)</label>
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
                                    {formData.image && <p className="mt-1 text-xs text-green-600">Image attached</p>}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
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

            {/* Staff Advance Modal */}
            {showAdvanceForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-orange-700">Record Staff Advance</h2>
                        <form onSubmit={handleAddAdvance}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border border-slate-300 rounded"
                                        value={advanceData.date}
                                        onChange={e => setAdvanceData({ ...advanceData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Staff Member</label>
                                    <select
                                        className="w-full p-2 border border-slate-300 rounded"
                                        value={advanceData.staffId}
                                        onChange={e => setAdvanceData({ ...advanceData, staffId: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Select Staff --</option>
                                        {staff.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Advance Amount (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border border-slate-300 rounded"
                                        value={advanceData.amount}
                                        onChange={e => setAdvanceData({ ...advanceData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanceForm(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                                >
                                    Record Advance
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
