import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { Plus, Check, X, Clock, FileText, Calendar } from 'lucide-react';
import clsx from 'clsx';

const Approvals = () => {
    const { user } = useAuth();
    const { approvals, setApprovals } = useAppContext();
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form State
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState({ id: 'operational', label: 'Operational' });

    const CATEGORIES = [
        { id: 'operational', label: 'Operational' },
        { id: 'maintenance', label: 'Maintenance' },
        { id: 'salary', label: 'Salary/Wages' },
        { id: 'inventory', label: 'Inventory' },
        { id: 'other', label: 'Other' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        const newTicket = {
            id: Date.now().toString(),
            employeeName: user.name,
            employeeUsername: user.username,
            amount: parseFloat(amount),
            description,
            category: category.label,
            status: 'Pending',
            date: new Date().toISOString(),
        };

        setApprovals([newTicket, ...approvals]);
        setIsFormOpen(false);
        setAmount('');
        setDescription('');
        setCategory(CATEGORIES[0]);
    };

    const handleApprove = (id) => {
        const updatedApprovals = approvals.map(ticket =>
            ticket.id === id ? { ...ticket, status: 'Approved', approvedBy: user.name, approvedDate: new Date().toISOString() } : ticket
        );
        setApprovals(updatedApprovals);
    };

    const handleReject = (id) => {
        const updatedApprovals = approvals.map(ticket =>
            ticket.id === id ? { ...ticket, status: 'Rejected', rejectedBy: user.name, rejectedDate: new Date().toISOString() } : ticket
        );
        setApprovals(updatedApprovals);
    };

    const filteredApprovals = user.role === 'admin'
        ? approvals
        : approvals.filter(t => t.employeeUsername === user.username);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Finance Approvals</h1>
                    <p className="text-slate-500">Manage and track finance requests</p>
                </div>
                {user.role === 'employee' && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        <span>Raise Ticket</span>
                    </button>
                )}
            </div>

            {/* Ticket Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">New Finance Request</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    value={category.id}
                                    onChange={(e) => setCategory(CATEGORIES.find(c => c.id === e.target.value))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-24"
                                    placeholder="Reason for expense..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tickets List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {filteredApprovals.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <FileText size={48} className="mx-auto mb-3 opacity-20" />
                        <p>No approval tickets found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredApprovals.map((ticket) => (
                            <div key={ticket.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between bg-white hover:bg-slate-50 transition-colors">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={clsx(
                                            "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                            ticket.status === 'Pending' && "bg-amber-100 text-amber-700",
                                            ticket.status === 'Approved' && "bg-green-100 text-green-700",
                                            ticket.status === 'Rejected' && "bg-red-100 text-red-700"
                                        )}>
                                            {ticket.status}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(ticket.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-slate-900">{ticket.category} - ${ticket.amount.toFixed(2)}</h3>
                                    <p className="text-slate-600 text-sm">{ticket.description}</p>
                                    <div className="text-xs text-slate-400">
                                        Requested by <span className="font-medium text-slate-600">{ticket.employeeName}</span>
                                    </div>
                                    {ticket.status !== 'Pending' && (
                                        <div className="text-xs text-slate-400 mt-1">
                                            {ticket.status} by {ticket.status === 'Approved' ? ticket.approvedBy : ticket.rejectedBy} on {new Date(ticket.status === 'Approved' ? ticket.approvedDate : ticket.rejectedDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                                {user.role === 'admin' && ticket.status === 'Pending' && (
                                    <div className="flex items-center gap-2 sm:self-center">
                                        <button
                                            onClick={() => handleApprove(ticket.id)}
                                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                            title="Approve"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleReject(ticket.id)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Reject"
                                        >
                                            <X size={20} />
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
