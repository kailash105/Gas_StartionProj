import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const ADMINS = [
    { username: 'admin1', password: 'password1', name: 'Admin One', role: 'admin' },
    { username: 'admin2', password: 'password2', name: 'Admin Two', role: 'admin' },
    { username: 'admin3', password: 'password3', name: 'Admin Three', role: 'admin' },
];

const EMPLOYEES = [
    { username: 'emp1', password: 'password1', name: 'Employee One', role: 'employee' },
    { username: 'emp2', password: 'password2', name: 'Employee Two', role: 'employee' },
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('gas_app_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (username, password) => {
        const admin = ADMINS.find(
            (a) => a.username === username && a.password === password
        );

        if (admin) {
            const userData = { username: admin.username, name: admin.name, role: admin.role };
            setUser(userData);
            localStorage.setItem('gas_app_user', JSON.stringify(userData));
            return true;
        }

        const employee = EMPLOYEES.find(
            (e) => e.username === username && e.password === password
        );

        if (employee) {
            const userData = { username: employee.username, name: employee.name, role: employee.role };
            setUser(userData);
            localStorage.setItem('gas_app_user', JSON.stringify(userData));
            return true;
        }

        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('gas_app_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
