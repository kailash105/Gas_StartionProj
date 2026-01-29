import React, { useMemo, useState } from 'react';
import { Fuel, TrendingUp, Droplet, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import AttendanceWidget from '../components/Dashboard/AttendanceWidget';
import FuelIntakeModal from '../components/Dashboard/FuelIntakeModal';

const TankCard = ({ title, stats, color, icon: Icon }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-${color}-200 transition-colors`}>
        <div className={`absolute top-0 right-0 p-4 opacity-10 text-${color}-500 bg-${color}-50 rounded-bl-3xl`}>
            <Icon size={32} />
        </div>
        <div className="relative z-10">
            <h3 className="text-sm font-medium text-slate-500 mb-1">{title} Capacity</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-800">{stats.current.toLocaleString()} L</span>
                <span className="text-xs text-slate-400">/ {stats.capacity.toLocaleString()} L</span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-${color}-500 transition-all duration-500 ease-out`}
                    style={{ width: `${stats.percentage}%` }}
                ></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">{stats.percentage.toFixed(1)}% Full</p>
        </div>
    </div>
);

const Dashboard = () => {
    const { readings, transactions, getTankStats } = useAppContext();
    const navigate = useNavigate();
    const [showIntakeModal, setShowIntakeModal] = useState(false);

    const metrics = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];

        // 1. Today's Reading stats
        const todayReading = readings.find(r => r.date === today);
        const todayUsage = todayReading ? todayReading.totalUsage : 0;
        const todayRevenue = todayReading ? (todayReading.totalRevenue || 0) : 0;

        // 2. Tank Stats
        const tankStats = getTankStats();

        return { todayUsage, todayRevenue, tankStats };
    }, [readings, getTankStats]);

    return (
        <div>
            {showIntakeModal && <FuelIntakeModal onClose={() => setShowIntakeModal(false)} />}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-slate-500 text-sm">Station Overview & Tank Status</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowIntakeModal(true)}
                        className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-700 transition-colors shadow-lg shadow-slate-200"
                    >
                        <Plus size={16} />
                        Add Fuel Intake
                    </button>
                    <div className="hidden sm:block text-right">
                        <div className="text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200">
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-green-500 bg-green-50 rounded-bl-3xl">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1">Today's Sale</h3>
                        <div className="text-2xl font-bold text-slate-800">{metrics.todayUsage.toLocaleString()} L</div>
                        <p className="text-xs text-green-600 mt-2 font-medium">₹{metrics.todayRevenue.toLocaleString()}</p>
                    </div>
                </div>

                <TankCard
                    title="Petrol (MS)"
                    stats={metrics.tankStats.petrol}
                    color="orange"
                    icon={Fuel}
                />

                <TankCard
                    title="Diesel (HSD)"
                    stats={metrics.tankStats.diesel}
                    color="blue"
                    icon={Droplet}
                />

                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-lg text-white relative overflow-hidden cursor-pointer group" onClick={() => navigate('/readings')}>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="text-blue-200 text-sm font-medium mb-1">Quick Action</div>
                            <div className="text-lg font-bold">Add Daily Reading</div>
                        </div>
                        <div className="flex items-center gap-2 text-white/80 text-sm mt-4 group-hover:translate-x-1 transition-transform">
                            <span>Go to Readings</span>
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 opacity-20">
                        <Fuel size={100} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Content Area - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Transactions */}
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

                {/* Sidebar Area - 1/3 width */}
                <div className="lg:col-span-1">
                    <AttendanceWidget />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
