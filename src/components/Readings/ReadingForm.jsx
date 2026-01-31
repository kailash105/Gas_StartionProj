import React, { useState, useEffect } from 'react';
import { Save, Calculator } from 'lucide-react';

import {
    collection,
    addDoc,
    updateDoc,
    query,
    where,
    getDocs,
    doc,
} from 'firebase/firestore';

import {
    ref,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';

import { db, storage } from '../../firebase';
import { useAppContext } from '../../context/AppContext';


const ReadingForm = ({ initialDate, onClose }) => {
    const { pumps } = useAppContext();

    const [date, setDate] = useState(
        initialDate || new Date().toISOString().split('T')[0]
    );
    const [entries, setEntries] = useState({});
    const [prices, setPrices] = useState({ petrol: 0, diesel: 0 });
    const [editingDocId, setEditingDocId] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔹 LOAD EXISTING READING OR INIT
    useEffect(() => {
        if (!date || pumps.length === 0) return;

        const loadReading = async () => {
            setLoading(true);

            const q = query(
                collection(db, 'readings'),
                where('date', '==', date)
            );
            const snap = await getDocs(q);

            if (!snap.empty) {
                const d = snap.docs[0];
                const data = d.data();
                setEditingDocId(d.id);

                setPrices({
                    petrol: data.petrolPrice || 0,
                    diesel: data.dieselPrice || 0,
                });

                const map = {};
                data.pumps.forEach(p => {
                    map[p.pumpId] = {
                        opening: p.opening,
                        closing: p.closing,
                        image: p.image || null,
                    };
                });
                setEntries(map);
            } else {
                const fresh = {};
                pumps.forEach(p => {
                    fresh[p.id] = { opening: 0, closing: 0, image: null };
                });
                setEntries(fresh);
                setEditingDocId(null);
            }

            setLoading(false);
        };

        loadReading();
    }, [date, pumps]);

    const handleChange = (pumpId, field, value) => {
        setEntries(prev => ({
            ...prev,
            [pumpId]: {
                ...prev[pumpId],
                [field]: field === 'image' ? value : Number(value),
            },
        }));
    };

    const usage = (pumpId) => {
        const e = entries[pumpId];
        if (!e) return 0;
        return Math.max(0, e.closing - e.opening);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let totalPetrol = 0;
        let totalDiesel = 0;

        const pumpReadings = await Promise.all(
            pumps.map(async (pump) => {
                const entry = entries[pump.id];
                let imageUrl = entry.image || null;

                // 📸 Upload image if it's base64
                if (entry.image && entry.image.startsWith('data:image')) {
                    const blob = await fetch(entry.image).then(r => r.blob());
                    const imageRef = ref(
                        storage,
                        `pump_readings/${date}/${pump.id}_${Date.now()}.jpg`
                    );
                    await uploadBytes(imageRef, blob);
                    imageUrl = await getDownloadURL(imageRef);
                }

                const usage = Math.max(0, entry.closing - entry.opening);
                if (pump.type === 'Petrol') totalPetrol += usage;
                else totalDiesel += usage;

                return {
                    pumpId: pump.id,
                    pumpName: pump.name,
                    type: pump.type,
                    opening: entry.opening,
                    closing: entry.closing,
                    usage,
                    image: imageUrl, // ✅ STORAGE URL
                };
            })
        );

        const payload = {
            date,
            pumps: pumpReadings,
            totalPetrol,
            totalDiesel,
            totalUsage: totalPetrol + totalDiesel,
            petrolPrice: prices.petrol,
            dieselPrice: prices.diesel,
            totalRevenue:
                totalPetrol * prices.petrol +
                totalDiesel * prices.diesel,
            updatedAt: new Date(),
        };

        if (editingDocId) {
            await updateDoc(doc(db, 'readings', editingDocId), payload);
        } else {
            await addDoc(collection(db, 'readings'), {
                ...payload,
                createdAt: new Date(),
            });
        }

        onClose();
    };


    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl text-center text-slate-500">
                Loading pumps…
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calculator className="text-blue-600" />
                {editingDocId ? 'Edit Readings' : 'New Readings Entry'}
            </h2>

            {/* 🔥 ORIGINAL UI RESTORED */}
            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Select Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="p-2 border rounded-lg"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-orange-50 p-4 rounded-lg border">
                        <label className="text-xs font-bold">Petrol Price (₹)</label>
                        <input
                            type="number"
                            value={prices.petrol}
                            onChange={(e) =>
                                setPrices({ ...prices, petrol: Number(e.target.value) })
                            }
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border">
                        <label className="text-xs font-bold">Diesel Price (₹)</label>
                        <input
                            type="number"
                            value={prices.diesel}
                            onChange={(e) =>
                                setPrices({ ...prices, diesel: Number(e.target.value) })
                            }
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                </div>

                {['Petrol', 'Diesel'].map(type => (
                    <div key={type} className="mb-6">
                        <h3 className={`font-bold ${type === 'Petrol' ? 'text-orange-600' : 'text-blue-600'}`}>
                            {type} Pumps
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4 mt-2">
                            {pumps.filter(p => p.type === type).map(pump => (
                                <div key={pump.id} className="bg-slate-50 p-4 rounded border">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold">{pump.name}</span>
                                        <span className="text-xs">Usage: {usage(pump.id).toFixed(2)}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            placeholder="Opening"
                                            value={entries[pump.id]?.opening || ''}
                                            onChange={(e) =>
                                                handleChange(pump.id, 'opening', e.target.value)
                                            }
                                            className="p-2 border rounded"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Closing"
                                            value={entries[pump.id]?.closing || ''}
                                            onChange={(e) =>
                                                handleChange(pump.id, 'closing', e.target.value)
                                            }
                                            className="p-2 border rounded"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded">
                        <Save size={16} /> Save Readings
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReadingForm;
