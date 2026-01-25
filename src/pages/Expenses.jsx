import React, { useState } from 'react';
import { Plus, Trash2, Banknote } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Expenses = () => {
    const { expenses, setExpenses } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: ''
    });

    const handleAddExpense = (e) => {
        e.preventDefault();
        const newExpense = {
            id: Date.now().toString(),
            ...formData,
            amount: Number(formData.amount)
        };
        setExpenses([newExpense, ...expenses]);
        setFormData({ ...formData, description: '', amount: '' });
        setShowForm(false);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this expense entry?')) {
            setExpenses(expenses.filter(e => e.id !== id));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Daily Expenses</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={20} /> Add Expense
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {expenses.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No expenses recorded.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {expenses.map(expense => (
                            <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                                        <Banknote size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{expense.description}</h3>
                                        <p className="text-xs text-slate-500">{new Date(expense.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="font-bold text-slate-800">₹{expense.amount.toLocaleString()}</div>
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
        </div>
    );
};

export default Expenses;
