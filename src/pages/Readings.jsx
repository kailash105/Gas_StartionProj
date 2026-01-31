import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import ReadingForm from '../components/Readings/ReadingForm';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
} from 'firebase/firestore';
import { db } from '../firebase';

const Readings = () => {
    const [readings, setReadings] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    // 🔥 REALTIME FIRESTORE LISTENER
    useEffect(() => {
        const q = query(
            collection(db, 'readings'),
            orderBy('date', 'desc')
        );

        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
            }));
            setReadings(list);
        });

        return unsub;
    }, []);

    const handleEdit = (date) => {
        setSelectedDate(date);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setSelectedDate(null);
        setShowForm(true);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this reading?')) return;
        await deleteDoc(doc(db, 'readings', id));
    };

    if (showForm) {
        return (
            <div className="max-w-3xl mx-auto">
                <ReadingForm
                    initialDate={selectedDate}
                    onClose={() => setShowForm(false)}
                />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Daily Readings</h1>
                <button
                    onClick={handleAddNew}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Add Reading</span>
                </button>
            </div>

            <div className="space-y-4">
                {readings.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-100">
                        No readings found. Start by adding a new daily reading.
                    </div>
                ) : (
                    readings.map((reading) => (
                        <div
                            key={reading.id}
                            onClick={() => handleEdit(reading.date)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-300 cursor-pointer transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800">
                                        {new Date(reading.date).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </h3>
                                    <p className="text-slate-500 text-sm">
                                        Total Usage: {reading.totalUsage.toLocaleString()} L
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400 uppercase">Petrol</div>
                                        <div className="font-bold text-orange-600">
                                            {reading.totalPetrol.toLocaleString()} L
                                        </div>
                                        {reading.petrolPrice > 0 && (
                                            <div className="text-[10px] text-slate-400">
                                                Rate: ₹{reading.petrolPrice}
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-px bg-slate-200 mx-2"></div>

                                    <div className="text-right">
                                        <div className="text-xs text-slate-400 uppercase">Diesel</div>
                                        <div className="font-bold text-blue-600">
                                            {reading.totalDiesel.toLocaleString()} L
                                        </div>
                                        {reading.dieselPrice > 0 && (
                                            <div className="text-[10px] text-slate-400">
                                                Rate: ₹{reading.dieselPrice}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={(e) => handleDelete(e, reading.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* 🔥 PUMPS — RESTORED */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-4 border-t border-slate-50">
                                {reading.pumps.map(pump => {
                                    const price =
                                        pump.type === 'Petrol'
                                            ? reading.petrolPrice || 0
                                            : reading.dieselPrice || 0;
                                    const amount = pump.usage * price;

                                    return (
                                        <div key={pump.pumpId} className="bg-slate-50 p-2 rounded text-center">
                                            <div className="text-[10px] text-slate-500 truncate">
                                                {pump.pumpName}
                                            </div>
                                            <div className="font-medium text-slate-800 text-sm">
                                                {pump.usage} L
                                            </div>
                                            {amount > 0 && (
                                                <div
                                                    className={`text-[10px] font-semibold ${pump.type === 'Petrol'
                                                            ? 'text-orange-600'
                                                            : 'text-blue-600'
                                                        }`}
                                                >
                                                    ₹{amount.toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Readings;
