import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    collection,
    onSnapshot,
    query,
    orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

/* 🔹 STATIC PUMPS (DO NOT CHANGE – UI DEPENDS ON THIS) */
const INITIAL_PUMPS = [
    { id: 1, name: 'Pump 1', type: 'Petrol' },
    { id: 2, name: 'Pump 2', type: 'Petrol' },
    { id: 3, name: 'Pump 3', type: 'Diesel' },
    { id: 4, name: 'Pump 4', type: 'Diesel' },
    { id: 5, name: 'Pump 5', type: 'Diesel' },
    { id: 6, name: 'Pump 6', type: 'Diesel' },
];

export const AppProvider = ({ children }) => {
    /* ✅ PUMPS – STATIC */
    const [pumps] = useState(INITIAL_PUMPS);

    /* 🔥 READINGS – FIRESTORE (LIVE SYNC) */
    const [readings, setReadings] = useState([]);

    useEffect(() => {
        const q = query(
            collection(db, 'readings'),
            orderBy('date', 'desc')
        );

        const unsub = onSnapshot(q, snap => {
            const list = snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
            }));
            setReadings(list);
        });

        return () => unsub();
    }, []);

    /* 🔽 EVERYTHING BELOW REMAINS LOCALSTORAGE BASED (UNCHANGED) */

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

    const [attendance, setAttendance] = useState(() => {
        const saved = localStorage.getItem('gas_app_attendance');
        return saved ? JSON.parse(saved) : {};
    });

    const [leaves, setLeaves] = useState(() => {
        const saved = localStorage.getItem('gas_app_leaves');
        return saved ? JSON.parse(saved) : [];
    });

    const [fuelIntakes, setFuelIntakes] = useState(() => {
        const saved = localStorage.getItem('gas_app_fuel_intakes');
        return saved ? JSON.parse(saved) : [];
    });

    /* 🔹 PERSIST NON-FIRESTORE DATA */
    useEffect(() => { localStorage.setItem('gas_app_customers', JSON.stringify(customers)); }, [customers]);
    useEffect(() => { localStorage.setItem('gas_app_transactions', JSON.stringify(transactions)); }, [transactions]);
    useEffect(() => { localStorage.setItem('gas_app_staff', JSON.stringify(staff)); }, [staff]);
    useEffect(() => { localStorage.setItem('gas_app_expenses', JSON.stringify(expenses)); }, [expenses]);
    useEffect(() => { localStorage.setItem('gas_app_approvals', JSON.stringify(approvals)); }, [approvals]);
    useEffect(() => { localStorage.setItem('gas_app_attendance', JSON.stringify(attendance)); }, [attendance]);
    useEffect(() => { localStorage.setItem('gas_app_leaves', JSON.stringify(leaves)); }, [leaves]);
    useEffect(() => { localStorage.setItem('gas_app_fuel_intakes', JSON.stringify(fuelIntakes)); }, [fuelIntakes]);

    /* 🔹 TANK STATS (UNCHANGED LOGIC) */
    const getTankStats = () => {
        const TANK_CAPACITY = { Petrol: 15000, Diesel: 20000 };

        let petrolIntake = 0;
        let dieselIntake = 0;

        fuelIntakes.forEach(i => {
            if (i.type === 'Petrol') petrolIntake += Number(i.amount);
            if (i.type === 'Diesel') dieselIntake += Number(i.amount);
        });

        let petrolUsage = 0;
        let dieselUsage = 0;

        readings.forEach(r => {
            petrolUsage += r.totalPetrol || 0;
            dieselUsage += r.totalDiesel || 0;
        });

        const currentPetrol = petrolIntake - petrolUsage;
        const currentDiesel = dieselIntake - dieselUsage;

        return {
            petrol: {
                current: currentPetrol,
                capacity: TANK_CAPACITY.Petrol,
                percentage: Math.min(100, Math.max(0, (currentPetrol / TANK_CAPACITY.Petrol) * 100)),
            },
            diesel: {
                current: currentDiesel,
                capacity: TANK_CAPACITY.Diesel,
                percentage: Math.min(100, Math.max(0, (currentDiesel / TANK_CAPACITY.Diesel) * 100)),
            },
        };
    };

    return (
        <AppContext.Provider
            value={{
                pumps,
                readings,
                customers, setCustomers,
                transactions, setTransactions,
                staff, setStaff,
                expenses, setExpenses,
                approvals, setApprovals,
                attendance, setAttendance,
                leaves, setLeaves,
                fuelIntakes, setFuelIntakes,
                addFuelIntake: (data) =>
                    setFuelIntakes(prev => [...prev, { ...data, id: Date.now() }]),
                deleteFuelIntake: (id) =>
                    setFuelIntakes(prev => prev.filter(i => i.id !== id)),
                getTankStats,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
