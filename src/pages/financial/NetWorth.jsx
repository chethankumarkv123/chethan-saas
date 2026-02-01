import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DownloadReport } from '../../components/DownloadReport';
import { SEO } from '../../components/SEO';
import {
    Scale, Plus, Trash2, ArrowUpRight, ArrowDownRight, DollarSign,
    Home, Car, CreditCard, Building, Coins, Briefcase, Zap,
    TrendingUp, BadgeAlert, Wallet, PieChart as PieChartIcon,
    BarChart3, ShieldCheck, AlertOctagon, Info
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export function NetWorth() {
    // --- Initial State (Persisted) ---
    const [assets, setAssets] = useState([
        { id: 1, name: 'Home', value: 5000000, type: 'Real Estate', category: 'Real Estate' },
        { id: 2, name: 'Mutual Funds', value: 1500000, type: 'Investments', category: 'Investments' },
        { id: 3, name: 'Savings Account', value: 200000, type: 'Cash', category: 'Cash & Bank' },
        { id: 4, name: 'EPF', value: 800000, type: 'Retirement', category: 'Retirement' },
    ]);

    const [liabilities, setLiabilities] = useState([
        { id: 101, name: 'Home Loan', value: 3500000, type: 'Loan', category: 'Loans' },
        { id: 102, name: 'Credit Card', value: 50000, type: 'Credit', category: 'Credit Card' },
    ]);

    // --- Advanced Tracking State ---
    const [monthlyExpenses, setMonthlyExpenses] = useState(50000); // For Emergency Fund Check
    const [showAdvanced, setShowAdvanced] = useState(false);

    // --- Persistence ---
    useEffect(() => {
        const savedAssets = localStorage.getItem('nw_assets_v2');
        const savedLiabilities = localStorage.getItem('nw_liabilities_v2');
        if (savedAssets) setAssets(JSON.parse(savedAssets));
        if (savedLiabilities) setLiabilities(JSON.parse(savedLiabilities));
    }, []);

    useEffect(() => {
        localStorage.setItem('nw_assets_v2', JSON.stringify(assets));
        localStorage.setItem('nw_liabilities_v2', JSON.stringify(liabilities));
    }, [assets, liabilities]);

    // --- Calculations ---
    const results = useMemo(() => {
        const totalAssets = assets.reduce((acc, curr) => acc + curr.value, 0);
        const totalLiabilities = liabilities.reduce((acc, curr) => acc + curr.value, 0);
        const netWorth = totalAssets - totalLiabilities;

        // Ratios
        const debtToAsset = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

        // Liquid Assets (Cash + Investments roughly)
        const liquidAssets = assets
            .filter(a => ['Cash & Bank', 'Investments', 'Stocks', 'Mutual Funds'].includes(a.category))
            .reduce((acc, curr) => acc + curr.value, 0);

        // Emergency Fund Health
        const expenseCoverageMonths = monthlyExpenses > 0 ? liquidAssets / monthlyExpenses : 0;

        // Health Status
        let healthLabel = 'Healthy';
        let healthColor = 'text-green-500';
        if (debtToAsset > 50) {
            healthLabel = 'High Debt';
            healthColor = 'text-red-500';
        } else if (expenseCoverageMonths < 3) {
            healthLabel = 'Low Liquidity';
            healthColor = 'text-amber-500';
        }

        return {
            totalAssets,
            totalLiabilities,
            netWorth,
            debtToAsset,
            liquidAssets,
            expenseCoverageMonths,
            healthLabel,
            healthColor
        };
    }, [assets, liabilities, monthlyExpenses]);

    // --- Asset Allocation Data for Chart ---
    const allocationData = useMemo(() => {
        const map = {};
        assets.forEach(a => {
            map[a.category] = (map[a.category] || 0) + a.value;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [assets]);

    // --- Form State ---
    const [newItem, setNewItem] = useState({ name: '', value: '', type: 'asset', category: 'Investments' });

    const assetCategories = ['Cash & Bank', 'Investments', 'Real Estate', 'Gold', 'Retirement', 'Other'];
    const liabilityCategories = ['Loans', 'Credit Card', 'Borrowing', 'Other'];

    const addItem = () => {
        if (!newItem.name || !newItem.value) return;
        const item = {
            id: Date.now(),
            name: newItem.name,
            value: parseFloat(newItem.value),
            type: newItem.type === 'asset' ? 'General' : 'Debt', // Visual type
            category: newItem.category
        };

        if (newItem.type === 'asset') {
            setAssets([...assets, item]);
        } else {
            setLiabilities([...liabilities, item]);
        }
        setNewItem({ name: '', value: '', type: 'asset', category: 'Investments' });
    };

    const deleteItem = (id, type) => {
        if (type === 'asset') setAssets(assets.filter(a => a.id !== id));
        else setLiabilities(liabilities.filter(l => l.id !== id));
    };

    // --- Refs ---
    const reportRef = useRef();

    // Colors
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
            <SEO
                title="Net Worth Intelligence Tracker"
                description="Track your assets, liabilities, and financial health ratios. Visualize wealth growth."
                keywords="net worth, asset tracker, debt manager, financial health"
            />

            <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                        <Scale className="text-emerald-500" size={32} />
                        Wealth Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Your personal balance sheet & health check.</p>
                </div>

                <div className="flex gap-4 items-center">
                    <DownloadReport title="Net Worth Report" contentRef={reportRef} />

                    <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Financial Health</p>
                        <p className={`font-bold ${results.healthColor} flex items-center gap-2 justify-end`}>
                            {results.healthLabel === 'Healthy' ? <ShieldCheck size={16} /> : <AlertOctagon size={16} />}
                            {results.healthLabel}
                        </p>
                    </div>
                </div>
            </div>

            <div ref={reportRef} className="bg-gray-50 dark:bg-slate-950 p-4 -m-4 rounded-xl"> {/* Print Wrapper */}

                {/* Hero Section */}
                <div className="grid lg:grid-cols-3 gap-6 mb-10">
                    {/* Total Net Worth Card */}
                    <div className={`lg:col-span-2 rounded-3xl p-8 shadow-xl border-2 transition-all relative overflow-hidden flex flex-col justify-center ${results.netWorth >= 0 ? 'bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-500' : 'bg-gradient-to-br from-red-600 to-rose-700 border-red-500'}`}>
                        <div className="relative z-10">
                            <p className="text-white/80 font-bold uppercase tracking-widest text-xs mb-2">Total Net Worth</p>
                            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">₹ {results.netWorth.toLocaleString()}</h2>

                            <div className="grid grid-cols-2 gap-4 max-w-md">
                                <div className="bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ArrowUpRight className="text-emerald-300" size={16} />
                                        <span className="text-xs uppercase text-white/70 font-bold">Assets</span>
                                    </div>
                                    <p className="text-xl font-bold text-white">₹ {results.totalAssets.toLocaleString()}</p>
                                </div>
                                <div className="bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ArrowDownRight className="text-rose-300" size={16} />
                                        <span className="text-xs uppercase text-white/70 font-bold">Liabilities</span>
                                    </div>
                                    <p className="text-xl font-bold text-white">₹ {results.totalLiabilities.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        {/* Decorative */}
                        <div className="absolute right-[-20px] top-[-20px] opacity-10">
                            <TrendingUp size={300} textAnchor="middle" />
                        </div>
                    </div>

                    {/* Intelligent Ratios Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                            <Zap size={18} className="text-amber-500" /> Vital Stats
                        </h3>

                        <div className="space-y-6">
                            {/* Debt Ratio */}
                            <div>
                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                    <span>Debt-to-Asset Ratio</span>
                                    <span className={results.debtToAsset > 50 ? 'text-red-500' : 'text-green-500'}>{results.debtToAsset.toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${results.debtToAsset > 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, results.debtToAsset)}%` }}></div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Ideally keep below 40%.</p>
                            </div>

                            {/* Emergency Fund */}
                            <div>
                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                    <span>Emergency Coverage</span>
                                    <span className={results.expenseCoverageMonths < 3 ? 'text-amber-500' : 'text-green-500'}>{results.expenseCoverageMonths.toFixed(1)} Months</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${results.expenseCoverageMonths < 3 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (results.expenseCoverageMonths / 6) * 100)}%` }}></div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Liquid Assets covers {results.expenseCoverageMonths.toFixed(1)}mo of expenses.</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Monthly Expense</label>
                                <input type="number" value={monthlyExpenses} onChange={e => setMonthlyExpenses(Number(e.target.value))} className="w-24 text-right bg-transparent border-b border-gray-200 dark:border-slate-600 text-sm font-bold focus:outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Add Form (Moved) */}
                <div className="mb-10 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Add Asset / Liability</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                        <select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} className="input-field rounded-lg">
                            <option value="asset">➕ Asset (Owning)</option>
                            <option value="liability">➖ Liability (Owing)</option>
                        </select>

                        <input type="text" placeholder="Name (e.g. Gold, Car Loan)" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="input-field rounded-lg" />

                        <input type="number" placeholder="Value (₹)" value={newItem.value} onChange={e => setNewItem({ ...newItem, value: e.target.value })} className="input-field rounded-lg" />

                        {newItem.type === 'asset' ? (
                            <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} className="input-field rounded-lg">
                                {assetCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        ) : (
                            <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} className="input-field rounded-lg">
                                {liabilityCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        )}
                    </div>
                    <button onClick={addItem} className="w-full mt-4 bg-gray-900 dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
                        Add to Dashboard
                    </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Assets */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Briefcase className="text-emerald-500" size={20} /> Assets Breakdown
                            </h3>
                            {/* Allocation Chart */}
                            <div className="h-8 w-8 text-emerald-500">
                                <PieChartIcon />
                            </div>
                        </div>

                        <div className="space-y-3 mb-6 flex-1">
                            {assets.map(asset => (
                                <div key={asset.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900 rounded-xl group hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-emerald-600 shadow-sm">
                                            {asset.category === 'Real Estate' && <Home size={16} />}
                                            {asset.category === 'Investments' && <TrendingUp size={16} />}
                                            {asset.category === 'Cash & Bank' && <Wallet size={16} />}
                                            {asset.category === 'Retirement' && <ShieldCheck size={16} />}
                                            {!['Real Estate', 'Investments', 'Cash & Bank', 'Retirement'].includes(asset.category) && <Coins size={16} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{asset.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase">{asset.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-emerald-600">₹ {asset.value.toLocaleString()}</span>
                                        <button onClick={() => deleteItem(asset.id, 'asset')} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Asset Pie Visual */}
                        <div className="h-[200px] w-full border-t border-gray-100 dark:border-slate-700 pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={allocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2}>
                                        {allocationData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(val) => `₹ ${val.toLocaleString()}`} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Liabilities */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <AlertOctagon className="text-red-500" size={20} /> Liabilities
                            </h3>
                        </div>

                        <div className="space-y-3 mb-6 flex-1">
                            {liabilities.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900 rounded-xl group hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-red-500 shadow-sm">
                                            <CreditCard size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{item.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase">{item.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-red-500">- ₹ {item.value.toLocaleString()}</span>
                                        <button onClick={() => deleteItem(item.id, 'liability')} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {liabilities.length === 0 && (
                                <div className="text-center py-10 text-gray-400 text-sm italic">
                                    Debt free! Excellent job. 🎉
                                </div>
                            )}
                        </div>

                        {/* What If Simulation */}
                        <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 border border-gray-100 dark:border-slate-800">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <Zap size={12} /> Quick Actions
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <button className="bg-white dark:bg-slate-800 p-2 rounded border hover:border-emerald-500 transition-colors" onClick={() => setNewItem({ name: 'Bonus', value: 100000, type: 'asset', category: 'Cash & Bank' })}>
                                    + Add ₹1L Bonus
                                </button>
                                <button className="bg-white dark:bg-slate-800 p-2 rounded border hover:border-red-500 transition-colors" onClick={() => setNewItem({ name: 'New Loan', value: 500000, type: 'liability', category: 'Loans' })}>
                                    + Add ₹5L Loan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Close Print Ref */}
            </div>



            <style>{`
              .input-field {
                width: 100%;
                padding: 10px;
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                outline: none;
                font-size: 0.875rem;
              }
              .dark .input-field {
                background-color: #0f172a;
                border-color: #334155;
                color: white;
              }
            `}</style>
        </div>
    );
}

export default NetWorth;
