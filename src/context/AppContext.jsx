import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Initial Dummy Data
const INITIAL_PUMPS = [
    { id: 1, name: 'Pump 1', type: 'Petrol' },
    { id: 2, name: 'Pump 2', type: 'Petrol' },
    { id: 3, name: 'Pump 3', type: 'Diesel' },
    { id: 4, name: 'Pump 4', type: 'Diesel' },
    { id: 5, name: 'Pump 5', type: 'Diesel' },
    { id: 6, name: 'Pump 6', type: 'Diesel' },
];

export const AppProvider = ({ children }) => {
    // State initialization with localStorage checks
    const [pumps] = useState(INITIAL_PUMPS);

    const [readings, setReadings] = useState(() => {
        const saved = localStorage.getItem('gas_app_readings');
        return saved ? JSON.parse(saved) : [];
    });

    const [customers, setCustomers] = useState(() => {
        const saved = localStorage.getItem('gas_app_customers');
        return saved ? JSON.parse(saved) : [];
    });

    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('gas_app_transactions');
        return saved ? JSON.parse(saved) : [];
    });

    const [staff, setStaff] = useState(() => {
        const saved = localStorage.getItem('gas_app_staff');
        return saved ? JSON.parse(saved) : [];
    });

    const [expenses, setExpenses] = useState(() => {
        const saved = localStorage.getItem('gas_app_expenses');
        return saved ? JSON.parse(saved) : [];
    });

    const [approvals, setApprovals] = useState(() => {
        const saved = localStorage.getItem('gas_app_approvals');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist state to localStorage on changes
    useEffect(() => { localStorage.setItem('gas_app_readings', JSON.stringify(readings)); }, [readings]);
    useEffect(() => { localStorage.setItem('gas_app_customers', JSON.stringify(customers)); }, [customers]);
    useEffect(() => { localStorage.setItem('gas_app_transactions', JSON.stringify(transactions)); }, [transactions]);
    useEffect(() => { localStorage.setItem('gas_app_staff', JSON.stringify(staff)); }, [staff]);
    useEffect(() => { localStorage.setItem('gas_app_expenses', JSON.stringify(expenses)); }, [expenses]);
    useEffect(() => { localStorage.setItem('gas_app_approvals', JSON.stringify(approvals)); }, [approvals]);

    const value = {
        pumps,
        readings, setReadings,
        customers, setCustomers,
        transactions, setTransactions,
        staff, setStaff,
        expenses, setExpenses,
        approvals, setApprovals
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
