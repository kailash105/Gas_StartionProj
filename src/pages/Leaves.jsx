import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { Plus, Check, X, FileText, Calendar, Clock } from 'lucide-react';
import clsx from 'clsx';

const Leaves = () => {
    const { user } = useAuth();
    const { leaves, setLeaves, staff } = useAppContext();
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [type, setType] = useState('sick'); // Default to Sick Leave
    const [selectedStaffId, setSelectedStaffId] = useState('');

    const LEAVE_TYPES = [
        { id: 'sick', label: 'Sick Leave' },
        { id: 'casual', label: 'Casual Leave' },
        { id: 'emergency', label: 'Emergency Leave' },
        { id: 'vacation', label: 'Vacation' },
        { id: 'other', label: 'Other' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        let employeeName = user.name;
        let staffId = null;

        if (selectedStaffId && selectedStaffId !== 'self') {
            const selectedPerson = staff.find(s => s.id === selectedStaffId);
            if (selectedPerson) {
                employeeName = selectedPerson.name;
                staffId = selectedPerson.id;
            }
        }

        const newLeave = {
            id: Date.now().toString(),
            employeeName: employeeName,
            employeeUsername: user.username, // Keep the creator's username for tracking
            staffId: staffId, // Store the actual staff ID if available
            startDate,
            endDate,
            reason,
            type: LEAVE_TYPES.find(t => t.id === type)?.label || type,
            status: 'Pending',
            requestedDate: new Date().toISOString(),
        };

        setLeaves([newLeave, ...leaves]);
        setIsFormOpen(false);
        setStartDate('');
        setEndDate('');
        setReason('');
        setType('sick');
        setSelectedStaffId('');
    };

    const handleApprove = (id) => {
        const updatedLeaves = leaves.map(leave =>
            leave.id === id ? { ...leave, status: 'Approved', approvedBy: user.name, approvedDate: new Date().toISOString() } : leave
        );
        setLeaves(updatedLeaves);
    };

    const handleReject = (id) => {
        const updatedLeaves = leaves.map(leave =>
            leave.id === id ? { ...leave, status: 'Rejected', rejectedBy: user.name, rejectedDate: new Date().toISOString() } : leave
        );
        setLeaves(updatedLeaves);
    };

    const filteredLeaves = user.role === 'admin'
        ? leaves
        : leaves.filter(l => l.employeeUsername === user.username);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Leave Management</h1>
                    <p className="text-slate-500">Track and manage employee leave requests</p>
                </div>
                {user.role === 'employee' && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        <span>Request Leave</span>
                    </button>
                )}
            </div>

            {/* Leave Request Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Request Leave</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Staff Member</label>
                                <select
                                    value={selectedStaffId}
                                    onChange={(e) => setSelectedStaffId(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="self">Myself ({user.name})</option>
                                    {staff.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    {LEAVE_TYPES.map(t => (
                                        <option key={t.id} value={t.id}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                                <textarea
                                    required
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-24"
                                    placeholder="Reason for leave..."
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

            {/* Leaves List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {filteredLeaves.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <FileText size={48} className="mx-auto mb-3 opacity-20" />
                        <p>No leave requests found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredLeaves.map((leave) => (
                            <div key={leave.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between bg-white hover:bg-slate-50 transition-colors">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={clsx(
                                            "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                            leave.status === 'Pending' && "bg-amber-100 text-amber-700",
                                            leave.status === 'Approved' && "bg-green-100 text-green-700",
                                            leave.status === 'Rejected' && "bg-red-100 text-red-700"
                                        )}>
                                            {leave.status}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-slate-900">{leave.type}</h3>
                                    <p className="text-slate-600 text-sm">{leave.reason}</p>
                                    <div className="text-xs text-slate-400">
                                        Requested by <span className="font-medium text-slate-600">{leave.employeeName}</span> on {new Date(leave.requestedDate).toLocaleDateString()}
                                    </div>
                                    {leave.status !== 'Pending' && (
                                        <div className="text-xs text-slate-400 mt-1">
                                            {leave.status} by {leave.status === 'Approved' ? leave.approvedBy : leave.rejectedBy} on {new Date(leave.status === 'Approved' ? leave.approvedDate : leave.rejectedDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                                {user.role === 'admin' && leave.status === 'Pending' && (
                                    <div className="flex items-center gap-2 sm:self-center">
                                        <button
                                            onClick={() => handleApprove(leave.id)}
                                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                            title="Approve"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleReject(leave.id)}
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

export default Leaves;
