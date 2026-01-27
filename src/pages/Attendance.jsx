import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, UserCheck, UserX, AlertCircle, Save } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import clsx from 'clsx';

const Attendance = () => {
    const { staff, attendance, setAttendance } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Computed stats for the selected date
    const stats = useMemo(() => {
        const record = attendance[selectedDate] || {};
        const total = staff.length;
        const present = Object.values(record).filter(s => s === 'PRESENT').length;
        const absent = Object.values(record).filter(s => s === 'ABSENT').length;
        const unmarked = total - present - absent;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        return { total, present, absent, unmarked, percentage };
    }, [staff, attendance, selectedDate]);

    const handleDateChange = (days) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const handleMark = (staffId, status) => {
        setAttendance(prev => ({
            ...prev,
            [selectedDate]: {
                ...prev[selectedDate],
                [staffId]: status
            }
        }));
    };

    const markAllPresent = () => {
        const updates = {};
        staff.forEach(s => {
            updates[s.id] = 'PRESENT';
        });
        setAttendance(prev => ({
            ...prev,
            [selectedDate]: {
                ...prev[selectedDate],
                ...updates
            }
        }));
    };

    return (
        <div>
            {/* Header & Date Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Attendance Management</h1>
                    <p className="text-slate-500 text-sm">Track employee daily attendance</p>
                </div>

                <div className="flex items-center bg-white rounded-lg shadow-sm border border-slate-200 p-1">
                    <button
                        onClick={() => handleDateChange(-1)}
                        className="p-2 hover:bg-slate-50 rounded-md text-slate-600"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="px-4 font-semibold text-slate-800 min-w-[140px] text-center flex items-center gap-2 justify-center">
                        <Calendar size={16} className="text-blue-600" />
                        {new Date(selectedDate).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </div>
                    <button
                        onClick={() => handleDateChange(1)}
                        className="p-2 hover:bg-slate-50 rounded-md text-slate-600"
                        disabled={selectedDate >= new Date().toISOString().split('T')[0]}
                    >
                        <ChevronRight size={20} className={selectedDate >= new Date().toISOString().split('T')[0] ? "opacity-30" : ""} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium uppercase mb-1">Total Staff</div>
                    <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 bg-green-50/30">
                    <div className="text-xs text-green-600 font-medium uppercase mb-1">Present</div>
                    <div className="text-2xl font-bold text-green-700">{stats.present}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 bg-red-50/30">
                    <div className="text-xs text-red-600 font-medium uppercase mb-1">Absent</div>
                    <div className="text-2xl font-bold text-red-700">{stats.absent}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 bg-blue-50/30">
                    <div className="text-xs text-blue-600 font-medium uppercase mb-1">Percentage</div>
                    <div className="text-2xl font-bold text-blue-700">{stats.percentage}%</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800">Staff List</h3>
                    {stats.unmarked > 0 && selectedDate === new Date().toISOString().split('T')[0] && (
                        <button
                            onClick={markAllPresent}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Mark All Present
                        </button>
                    )}
                </div>

                {staff.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <UserX size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No staff members found.</p>
                        <p className="text-sm mt-2">Go to Staff section to add employees.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {staff.map(person => {
                            const status = attendance[selectedDate]?.[person.id];

                            return (
                                <div key={person.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                                            status === 'PRESENT' ? "bg-green-100 text-green-700" :
                                                status === 'ABSENT' ? "bg-red-100 text-red-700" :
                                                    "bg-slate-100 text-slate-500"
                                        )}>
                                            {person.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-800">{person.name}</div>
                                            <div className="text-xs text-slate-500">{person.role}</div>
                                        </div>
                                    </div>

                                    <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                                        <button
                                            onClick={() => handleMark(person.id, 'PRESENT')}
                                            className={clsx(
                                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                                                status === 'PRESENT'
                                                    ? "bg-white text-green-700 shadow-sm ring-1 ring-green-100"
                                                    : "text-slate-500 hover:text-green-700"
                                            )}
                                        >
                                            <UserCheck size={16} />
                                            <span className="hidden sm:inline">Present</span>
                                        </button>
                                        <button
                                            onClick={() => handleMark(person.id, 'ABSENT')}
                                            className={clsx(
                                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                                                status === 'ABSENT'
                                                    ? "bg-white text-red-700 shadow-sm ring-1 ring-red-100"
                                                    : "text-slate-500 hover:text-red-700"
                                            )}
                                        >
                                            <UserX size={16} />
                                            <span className="hidden sm:inline">Absent</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attendance;
