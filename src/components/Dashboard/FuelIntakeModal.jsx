import React, { useState } from 'react';
import { X, Droplet } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const FuelIntakeModal = ({ onClose }) => {
    const { addFuelIntake } = useAppContext();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'Petrol',
        amount: '',
        invoiceNo: '',
        note: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addFuelIntake({
            ...formData,
            amount: Number(formData.amount)
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Droplet className="text-blue-600" size={20} />
                        Add Fuel Intake
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'Petrol' })}
                                className={`p-3 rounded-lg border text-sm font-bold transition-all ${formData.type === 'Petrol'
                                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                Petrol (MS)
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'Diesel' })}
                                className={`p-3 rounded-lg border text-sm font-bold transition-all ${formData.type === 'Diesel'
                                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                Diesel (HSD)
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Quantity (Liters)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            placeholder="Enter quantity"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Invoice / Ref No. (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. INV-12345"
                            value={formData.invoiceNo}
                            onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                        >
                            Add to Tank
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FuelIntakeModal;
