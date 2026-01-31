import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard, Fuel, Users, Wallet,
    Banknote, Menu, X, LogOut, CalendarCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import clsx from "clsx";

const getNavItems = (role) => {
    const common = [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Readings", path: "/readings", icon: Fuel },
        { label: "Customers", path: "/customers", icon: Users },
        { label: "Expenses", path: "/expenses", icon: Banknote },
        { label: "Attendance", path: "/attendance", icon: CalendarCheck },
        { label: "Leaves", path: "/leaves", icon: CalendarCheck },
    ];

    if (role === "admin") {
        return [
            ...common,
            { label: "Staff", path: "/staff", icon: Wallet },
            { label: "Approvals", path: "/approvals", icon: Banknote },
        ];
    }

    return [
        ...common,
        { label: "Approvals", path: "/approvals", icon: Banknote },
    ];
};

export const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const navItems = getNavItems(user.role);

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className={clsx(
                "fixed lg:static z-50 w-64 bg-slate-900 text-white h-full transition-transform",
                open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                    <span className="font-bold">SAI BALAJI</span>
                    <button className="lg:hidden" onClick={() => setOpen(false)}>
                        <X />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const active = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg",
                                    active ? "bg-blue-600" : "hover:bg-slate-800"
                                )}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <p className="text-sm text-slate-400">{user.name}</p>
                    <button
                        onClick={logout}
                        className="mt-2 flex items-center gap-2 text-red-400"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1">
                <header className="lg:hidden h-16 bg-white flex items-center px-4">
                    <button onClick={() => setOpen(true)}>
                        <Menu />
                    </button>
                </header>

                <main className="p-6">{children}</main>
            </div>
        </div>
    );
};
