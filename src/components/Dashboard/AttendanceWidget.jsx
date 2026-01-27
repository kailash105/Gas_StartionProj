import React, { useMemo } from 'react';
import { UserCheck, UserX, Calendar, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import clsx from 'clsx';

const AttendanceWidget = () => {
    const { staff, attendance, setAttendance } = useAppContext();
    const today = new Date().toISOString().split('T')[0];

    const stats = useMemo(() => {
        const todayRecord = attendance[today] || {};
        const total = staff.length;
        const present = Object.values(todayRecord).filter(status => status === 'PRESENT').length;
        const absent = Object.values(todayRecord).filter(status => status === 'ABSENT').length;
        const unmarked = total - present - absent;
        return { total, present, absent, unmarked };
    }, [staff, attendance, today]);

    const handleMark = (staffId, status) => {
        setAttendance(prev => ({
            ...prev,
            [today]: {
                ...prev[today],
                [staffId]: status
            }
        }));
    };

    if (staff.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="text-blue-600" size={24} />
                    <h2 className="text-lg font-bold text-slate-800">Daily Attendance</h2>
                </div>
                <div className="text-center py-8 text-slate-500">
                    <p>No staff members added.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="text-blue-600" size={20} />
                        <h2 className="text-lg font-bold text-slate-800">Daily Attendance</h2>
                    </div>
                    <p className="text-slate-500 text-sm">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-4 text-sm">
                    <div className="text-center">
                        <div className="font-bold text-green-600">{stats.present}</div>
                        <div className="text-xs text-slate-400">Present</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-red-600">{stats.absent}</div>
                        <div className="text-xs text-slate-400">Absent</div>
                    </div>
                </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {staff.map(person => {
                    const todayStatus = attendance[today]?.[person.id];

                    return (
                        <div
                            key={person.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-slate-50 hover:bg-slate-50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                                    todayStatus === 'PRESENT' ? "bg-green-100 text-green-700" :
                                        todayStatus === 'ABSENT' ? "bg-red-100 text-red-700" :
                                            "bg-slate-100 text-slate-500"
                                )}>
                                    {person.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-medium text-slate-800">{person.name}</h3>
                                    <p className="text-xs text-slate-500">{person.role}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleMark(person.id, 'PRESENT')}
                                    className={clsx(
                                        "p-2 rounded-lg transition-all",
                                        todayStatus === 'PRESENT'
                                            ? "bg-green-600 text-white shadow-md shadow-green-200"
                                            : "text-slate-400 hover:bg-green-50 hover:text-green-600"
                                    )}
                                    title="Mark Present"
                                >
                                    <UserCheck size={18} />
                                </button>
                                <button
                                    onClick={() => handleMark(person.id, 'ABSENT')}
                                    className={clsx(
                                        "p-2 rounded-lg transition-all",
                                        todayStatus === 'ABSENT'
                                            ? "bg-red-600 text-white shadow-md shadow-red-200"
                                            : "text-slate-400 hover:bg-red-50 hover:text-red-600"
                                    )}
                                    title="Mark Absent"
                                >
                                    <UserX size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {stats.unmarked > 0 && (
                <div className="mt-4 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                    <AlertCircle size={14} />
                    <span>{stats.unmarked} employees pending</span>
                </div>
            )}
        </div>
    );
};

export default AttendanceWidget;
