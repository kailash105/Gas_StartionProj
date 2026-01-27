import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Fuel, Users, Wallet, Banknote, Menu, X, LogOut, CalendarCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Readings', path: '/readings', icon: Fuel },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Staff', path: '/staff', icon: Wallet },
    { label: 'Expenses', path: '/expenses', icon: Banknote },
    { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { label: 'Approvals', path: '/approvals', icon: Banknote }, // Using Banknote as icon for now, could use CheckSquare if available
];

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout, user } = useAuth();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Content */}
            <aside className={clsx(
                "fixed top-0 left-0 bottom-0 w-64 bg-slate-900 text-white z-50 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col", // Added flex flex-col here
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                    <img src="/Logo.png" alt="Gas Station" className="h-12 object-contain" />
                    <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-2 flex-1">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => onClose()}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="px-4 py-2 mb-2">
                        <div className="text-xs text-slate-500 uppercase font-bold">Logged in as</div>
                        <div className="text-slate-300 font-medium truncate">{user?.name}</div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

const MobileBottomNav = () => {
    const location = useLocation();

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 lg:hidden z-30 px-4 flex justify-between items-center">
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={clsx(
                            "flex flex-col items-center justify-center p-2 rounded-lg transition-colors w-full",
                            isActive ? "text-blue-600" : "text-slate-400"
                        )}
                    >
                        <Icon size={20} />
                        <span className="text-[10px] font-medium mt-1">{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
};

export const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header (Mobile Only) */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:hidden sticky top-0 z-20">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                    <img src="/Logo.png" alt="Gas Station" className="h-8 ml-3" />
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto pb-20 lg:pb-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                <MobileBottomNav />
            </div>
        </div>
    );
};
