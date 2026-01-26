import React, { useState, useEffect } from 'react';
import { Save, Calculator } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const ReadingForm = ({ initialDate, onClose }) => {
    const { pumps, readings, setReadings } = useAppContext();
    const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
    const [entries, setEntries] = useState({});
    const [prices, setPrices] = useState({ petrol: 0, diesel: 0 });

    // Initialize entries when date changes or component mounts
    useEffect(() => {
        // Check if reading already exists for this date
        const existingReading = readings.find(r => r.date === date);

        if (existingReading) {
            const entryMap = {};
            existingReading.pumps.forEach(p => {
                entryMap[p.pumpId] = { opening: p.opening, closing: p.closing, image: p.image };
            });
            setEntries(entryMap);
            setPrices({ petrol: existingReading.petrolPrice || 0, diesel: existingReading.dieselPrice || 0 });
        } else {
            // Try to find previous day's closing readings
            const prevDate = new Date(date);
            prevDate.setDate(prevDate.getDate() - 1);
            const prevDateStr = prevDate.toISOString().split('T')[0];
            const prevReading = readings.find(r => r.date === prevDateStr);

            const newEntries = {};
            pumps.forEach(pump => {
                let opening = 0;
                if (prevReading) {
                    const prevPump = prevReading.pumps.find(p => p.pumpId === pump.id);
                    if (prevPump) opening = prevPump.closing;
                }
                newEntries[pump.id] = { opening: opening, closing: opening };
            });
            setEntries(newEntries);
        }
    }, [date, pumps, readings]);

    const handleChange = (pumpId, field, value) => {
        setEntries(prev => ({
            ...prev,
            [pumpId]: {
                ...prev[pumpId],
                [field]: Number(value)
            }
        }));
    };

    const calculateUsage = (pumpId) => {
        const entry = entries[pumpId];
        if (!entry) return 0;
        return Math.max(0, entry.closing - entry.opening);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Calculate totals
        let totalPetrol = 0;
        let totalDiesel = 0;
        const pumpReadings = pumps.map(pump => {
            const usage = calculateUsage(pump.id);
            if (pump.type === 'Petrol') totalPetrol += usage;
            else totalDiesel += usage;

            return {
                pumpId: pump.id,
                pumpName: pump.name,
                type: pump.type,
                opening: entries[pump.id].opening,
                closing: entries[pump.id].closing,
                usage,
                image: entries[pump.id].image
            };
        });

        const totalRevenue = (totalPetrol * prices.petrol) + (totalDiesel * prices.diesel);

        const newReading = {
            date,
            pumps: pumpReadings,
            totalPetrol,
            totalDiesel,
            totalUsage: totalPetrol + totalDiesel,
            petrolPrice: prices.petrol,
            dieselPrice: prices.diesel,
            totalRevenue
        };

        // Update context
        const otherReadings = readings.filter(r => r.date !== date);
        setReadings([...otherReadings, newReading].sort((a, b) => new Date(b.date) - new Date(a.date)));

        onClose();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calculator className="text-blue-600" />
                {readings.find(r => r.date === date) ? 'Edit Readings' : 'New Readings Entry'}
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full md:w-auto p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                        <label className="block text-xs font-bold text-orange-700 uppercase mb-1">Petrol Price (₹)</label>
                        <input
                            type="number"
                            value={prices.petrol || ''}
                            onChange={(e) => setPrices({ ...prices, petrol: Number(e.target.value) })}
                            className="w-full p-2 border border-orange-200 rounded text-orange-800 font-bold"
                            placeholder="0.00"
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Diesel Price (₹)</label>
                        <input
                            type="number"
                            value={prices.diesel || ''}
                            onChange={(e) => setPrices({ ...prices, diesel: Number(e.target.value) })}
                            className="w-full p-2 border border-blue-200 rounded text-blue-800 font-bold"
                            placeholder="0.00"
                            step="0.01"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {['Petrol', 'Diesel'].map(type => (
                        <div key={type} className="space-y-4">
                            <h3 className={`text-sm font-bold uppercase tracking-wider ${type === 'Petrol' ? 'text-orange-600' : 'text-blue-600'}`}>
                                {type} Pumps
                            </h3>

                            <div className="grid gap-4 md:grid-cols-2">
                                {pumps.filter(p => p.type === type).map(pump => (
                                    <div key={pump.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-semibold text-slate-700">{pump.name}</span>
                                            <span className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">
                                                Usage: {calculateUsage(pump.id).toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">Opening</label>
                                                <input
                                                    type="number"
                                                    value={entries[pump.id]?.opening || ''}
                                                    onChange={(e) => handleChange(pump.id, 'opening', e.target.value)}
                                                    className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">Closing</label>
                                                <input
                                                    type="number"
                                                    value={entries[pump.id]?.closing || ''}
                                                    onChange={(e) => handleChange(pump.id, 'closing', e.target.value)}
                                                    className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Meter Photo (Optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            handleChange(pump.id, 'image', reader.result);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                            {entries[pump.id]?.image && (
                                                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                                    <Save size={12} /> Image attached
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Save size={18} />
                        Save Readings
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReadingForm;
