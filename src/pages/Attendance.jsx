import React, { useState, useMemo, useEffect } from 'react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    UserX
} from 'lucide-react';
import clsx from 'clsx';
import {
    collection,
    onSnapshot,
    query,
    where,
    addDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

const Attendance = () => {
    const today = new Date().toISOString().split('T')[0];

    const [staff, setStaff] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [selectedDate, setSelectedDate] = useState(today);

    // 🔹 LOAD STAFF
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'staff'), snap => {
            setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, []);

    // 🔹 LOAD ATTENDANCE FOR DATE (REALTIME)
    useEffect(() => {
        const q = query(
            collection(db, 'attendance'),
            where('date', '==', selectedDate)
        );

        const unsub = onSnapshot(q, snap => {
            setAttendance(
                snap.docs.map(d => ({ id: d.id, ...d.data() }))
            );
        });

        return unsub;
    }, [selectedDate]);

    // 🔹 STATS (UNCHANGED LOGIC)
    const stats = useMemo(() => {
        const total = staff.length;
        const present = attendance.filter(a => a.status === 'PRESENT').length;
        const absent = attendance.filter(a => a.status === 'ABSENT').length;
        const unmarked = total - present - absent;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        return { total, present, absent, unmarked, percentage };
    }, [staff, attendance]);

    const handleDateChange = (days) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const markAttendance = async (person, status) => {
        const exists = attendance.find(a => a.staffId === person.id);
        if (exists) return;

        await addDoc(collection(db, 'attendance'), {
            staffId: person.id,
            staffName: person.name,
            role: person.role,
            date: selectedDate,
            status,
            createdAt: Timestamp.now(),
        });
    };

    const markAllPresent = async () => {
        const batch = staff.filter(s =>
            !attendance.find(a => a.staffId === s.id)
        );

        for (const s of batch) {
            await addDoc(collection(db, 'attendance'), {
                staffId: s.id,
                staffName: s.name,
                role: s.role,
                date: selectedDate,
                status: 'PRESENT',
                createdAt: Timestamp.now(),
            });
        }
    };

    const getStatus = (id) =>
        attendance.find(a => a.staffId === id)?.status;

    return (
        <div>
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Attendance Management</h1>
                    <p className="text-slate-500 text-sm">Track employee daily attendance</p>
                </div>

                <div className="flex items-center bg-white rounded-lg shadow-sm border p-1">
                    <button onClick={() => handleDateChange(-1)} className="p-2">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="px-4 font-semibold flex items-center gap-2">
                        <Calendar size={16} className="text-blue-600" />
                        {new Date(selectedDate).toDateString()}
                    </div>
                    <button
                        onClick={() => handleDateChange(1)}
                        disabled={selectedDate >= today}
                        className="p-2"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Stat label="Total Staff" value={stats.total} />
                <Stat label="Present" value={stats.present} color="green" />
                <Stat label="Absent" value={stats.absent} color="red" />
                <Stat label="Percentage" value={`${stats.percentage}%`} color="blue" />
            </div>

            {/* LIST */}
            <div className="bg-white rounded-xl border">
                <div className="p-4 flex justify-between bg-slate-50">
                    <h3 className="font-semibold">Staff List</h3>
                    {stats.unmarked > 0 && selectedDate === today && (
                        <button onClick={markAllPresent} className="text-blue-600 text-sm">
                            Mark All Present
                        </button>
                    )}
                </div>

                <div className="divide-y">
                    {staff.map(person => {
                        const status = getStatus(person.id);

                        return (
                            <div key={person.id} className="p-4 flex justify-between">
                                <div>
                                    <div className="font-semibold">{person.name}</div>
                                    <div className="text-xs text-slate-500">{person.role}</div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => markAttendance(person, 'PRESENT')}
                                        className={clsx(
                                            "px-4 py-2 rounded",
                                            status === 'PRESENT'
                                                ? "bg-green-100 text-green-700"
                                                : "bg-slate-100"
                                        )}
                                    >
                                        <UserCheck size={16} />
                                    </button>

                                    <button
                                        onClick={() => markAttendance(person, 'ABSENT')}
                                        className={clsx(
                                            "px-4 py-2 rounded",
                                            status === 'ABSENT'
                                                ? "bg-red-100 text-red-700"
                                                : "bg-slate-100"
                                        )}
                                    >
                                        <UserX size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const Stat = ({ label, value, color }) => (
    <div className={`bg-white p-4 rounded-xl border ${color ? `border-${color}-100` : ''}`}>
        <div className="text-xs uppercase text-slate-500">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
    </div>
);

export default Attendance;
