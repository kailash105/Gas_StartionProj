import React, { useState } from 'react';
import { Plus, Search, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Customers = () => {
    const { customers, setCustomers } = useAppContext();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');

    const handleAddCustomer = (e) => {
        e.preventDefault();
        if (!newCustomerName.trim()) return;

        const newCustomer = {
            id: Date.now().toString(),
            name: newCustomerName,
            createdAt: new Date().toISOString()
        };

        setCustomers([...customers, newCustomer]);
        setNewCustomerName('');
        setShowAddModal(false);
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Customer Khata</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Add Customer</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCustomers.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        No customers found.
                    </div>
                ) : (
                    filteredCustomers.map(customer => (
                        <div
                            key={customer.id}
                            onClick={() => navigate(`/customers/${customer.id}`)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-300 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                    <User size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                                        {customer.name}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        ID: {customer.id.slice(-4)}
                                    </p>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-blue-600" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Simple Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
                        <form onSubmit={handleAddCustomer}>
                            <input
                                type="text"
                                placeholder="Customer Name"
                                value={newCustomerName}
                                onChange={(e) => setNewCustomerName(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded mb-4"
                                autoFocus
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Add Customer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
