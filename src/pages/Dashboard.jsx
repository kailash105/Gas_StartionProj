import React, { useMemo } from 'react';
import { Fuel, Wallet, Banknote, AlertCircle, TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-${color}-200 transition-colors`}>
        <div className={`absolute top-0 right-0 p-4 opacity-10 text-${color}-500 bg-${color}-50 rounded-bl-3xl`}>
            <Icon size={32} />
        </div>
        <div className="relative z-10">
            <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
        </div>
    </div>
);

const Dashboard = () => {
    const { readings, transactions, expenses } = useAppContext();
    const navigate = useNavigate();

    const metrics = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];

        // 1. Today's Reading stats
        const todayReading = readings.find(r => r.date === today);
        const todayUsage = todayReading ? todayReading.totalUsage : 0;
        const todayRevenue = todayReading ? (todayReading.totalRevenue || 0) : 0;

        // 2. Total Customer Dues
        // Logic: Sum of all Fuel - Sum of all Payments
        let totalDues = 0;
        transactions.forEach(t => {
            if (t.type === 'FUEL') totalDues += t.amount;
            else if (t.type === 'PAYMENT') totalDues -= t.amount;
        });

        // 3. Current Month Expenses
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyExpenses = expenses.reduce((acc, curr) => {
            const d = new Date(curr.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                return acc + curr.amount;
            }
            return acc;
        }, 0);

        return { todayUsage, todayRevenue, totalDues, monthlyExpenses };
    }, [readings, transactions, expenses]);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-slate-500 text-sm">Welcome back, here's what's happening today.</p>
                </div>
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-slate-600">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Today's Fuel Sale"
                    value={`${metrics.todayUsage.toLocaleString()} L`}
                    subtext={`Revenue: ₹${metrics.todayRevenue.toLocaleString()}`}
                    icon={Fuel}
                    color="blue"
                />
                <StatCard
                    title="Total Dues"
                    value={`₹${metrics.totalDues.toLocaleString()}`}
                    subtext="Amount to be collected"
                    icon={AlertCircle}
                    color="orange"
                />
                <StatCard
                    title="Monthly Expenses"
                    value={`₹${metrics.monthlyExpenses.toLocaleString()}`}
                    subtext="This month"
                    icon={Banknote}
                    color="red"
                />
                <div className="bg-slate-800 p-6 rounded-xl shadow-sm text-white relative overflow-hidden cursor-pointer" onClick={() => navigate('/readings')}>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-400 mb-1">Quick Action</h3>
                            <div className="text-lg font-bold">Add Today's Reading</div>
                        </div>
                        <div className="flex items-center gap-2 text-blue-300 text-sm mt-4 group">
                            <span>Go to Readings</span>
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 opacity-10">
                        <Fuel size={100} />
                    </div>
                </div>
            </div>

            {/* Quick Links or Recent Activity could go here */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Recent Transactions</h3>
                    {transactions.length === 0 ? (
                        <p className="text-slate-400 text-sm">No recent transactions</p>
                    ) : (
                        <div className="space-y-3">
                            {transactions.slice(0, 5).map(t => (
                                <div key={t.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                                    <div>
                                        <span className={`font-medium ${t.type === 'FUEL' ? 'text-orange-600' : 'text-green-600'}`}>
                                            {t.type}
                                        </span>
                                        <span className="text-slate-400 mx-2">•</span>
                                        <span className="text-slate-600">{new Date(t.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="font-bold text-slate-700">₹{t.amount.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    <button onClick={() => navigate('/customers')} className="w-full mt-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
                        View All Customers
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
