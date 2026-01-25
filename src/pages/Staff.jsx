import React, { useState } from 'react';
import { Plus, Trash2, Wallet } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Staff = () => {
    const { staff, setStaff } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        salary: ''
    });

    const handleAddStaff = (e) => {
        e.preventDefault();
        const newStaff = {
            id: Date.now().toString(),
            ...formData,
            salary: Number(formData.salary)
        };
        setStaff([...staff, newStaff]);
        setFormData({ name: '', role: '', salary: '' });
        setShowForm(false);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to remove this staff member?')) {
            setStaff(staff.filter(s => s.id !== id));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={20} /> Add Staff
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {staff.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No staff members added.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {staff.map(person => (
                            <div key={person.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                        <Wallet size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{person.name}</h3>
                                        <p className="text-xs text-slate-500">{person.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400 uppercase">Monthly Salary</div>
                                        <div className="font-bold text-slate-800">₹{person.salary.toLocaleString()}</div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(person.id)}
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
                        <h2 className="text-xl font-bold mb-4">Add Staff Member</h2>
                        <form onSubmit={handleAddStaff}>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full p-2 border border-slate-300 rounded"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Role (e.g. Manager, Attendant)"
                                    className="w-full p-2 border border-slate-300 rounded"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Monthly Salary (₹)"
                                    className="w-full p-2 border border-slate-300 rounded"
                                    value={formData.salary}
                                    onChange={e => setFormData({ ...formData, salary: e.target.value })}
                                    required
                                />
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

export default Staff;
