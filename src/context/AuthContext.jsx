import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const ADMINS = [
    { username: 'admin1', password: 'password1', name: 'Admin One' },
    { username: 'admin2', password: 'password2', name: 'Admin Two' },
    { username: 'admin3', password: 'password3', name: 'Admin Three' },
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
            const userData = { username: admin.username, name: admin.name };
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
