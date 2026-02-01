import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DownloadReport } from '../../components/DownloadReport';
import { SEO } from '../../components/SEO';
import {
    TrendingUp, ArrowRight, ShoppingCart, Zap, AlertTriangle,
    TrendingDown, GraduationCap, Home, Pill, Plane, CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

export function Inflation() {
    // --- Core State ---
    const [currentCost, setCurrentCost] = useState(10000); // Expense or Item Cost
    const [rate, setRate] = useState(6);
    const [years, setYears] = useState(10);

    // --- Advanced State ---
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Reverse Calculator (Purchasing Power)
    const [reverseMode, setReverseMode] = useState(false);
    const [futureAmount, setFutureAmount] = useState(10000000); // 1 Cr

    // Investment Comparison
    const [showInvestComparison, setShowInvestComparison] = useState(false);
    const [investReturn, setInvestReturn] = useState(10); // Standard Equity

    // Categories for Quick Rate Selection
    const categories = [
        { id: 'general', label: 'General', rate: 6, icon: <ShoppingCart size={16} /> },
        { id: 'edu', label: 'Education', rate: 10, icon: <GraduationCap size={16} /> },
        { id: 'med', label: 'Medical', rate: 12, icon: <Pill size={16} /> },
        { id: 'home', label: 'Housing', rate: 5, icon: <Home size={16} /> }, // Rental yield/appreciation often lower? Real Estate generally beats? 
        // Actually Housing inflation (rent) ~ 5-7%? Let's say 5 for rent
        { id: 'travel', label: 'Travel', rate: 8, icon: <Plane size={16} /> },
    ];
    const [activeCategory, setActiveCategory] = useState('general');

    // --- Calculations ---
    const results = useMemo(() => {
        // Forward Calculation
        const futureValue = currentCost * Math.pow(1 + rate / 100, years);

        // Reverse Calculation
        const presentValue = futureAmount / Math.pow(1 + rate / 100, years);
        const powerLossPct = (1 - (presentValue / futureAmount)) * 100;

        // Chart Data (Forward)
        const chartData = [];
        let cost = currentCost;
        let investment = currentCost; // If invested instead

        // Milestones
        let doubledYear = null;
        let tripledYear = null;

        for (let i = 0; i <= years; i++) {
            chartData.push({
                year: i,
                cost: Math.round(cost),
                investment: Math.round(investment)
            });

            if (!doubledYear && cost >= currentCost * 2) doubledYear = i;
            if (!tripledYear && cost >= currentCost * 3) tripledYear = i;

            cost = cost * (1 + rate / 100);
            investment = investment * (1 + investReturn / 100);
        }

        return {
            futureValue: Math.round(futureValue),
            presentValue: Math.round(presentValue),
            powerLossPct: powerLossPct.toFixed(1),
            chartData,
            doubledYear,
            tripledYear,
            netRealReturn: investReturn - rate
        };

    }, [currentCost, rate, years, investReturn, reverseMode, futureAmount]);

    // Handlers
    const handleCategorySelect = (cat) => {
        setActiveCategory(cat.id);
        setRate(cat.rate);
    };

    const reportRef = useRef();

    return (
        <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto min-h-screen">
            <SEO
                title="Inflation Impact Calculator - Real Value of Money"
                description="Visualize how inflation erodes purchasing power and increases future costs. Plan for education, medical, and lifestyle inflation."
            />

            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3 mb-2">
                        <TrendingUp className="text-red-500" size={32} />
                        Inflation Decoder
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Silence the silent killer of wealth.</p>
                </div>
                <DownloadReport title="Inflation Report" contentRef={reportRef} />
            </div>

            <div className="grid lg:grid-cols-12 gap-8" ref={reportRef}>
                {/* --- LEFT: CONTROL PANEL --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        {/* Mode Toggle */}
                        <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl mb-6">
                            <button
                                onClick={() => setReverseMode(false)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!reverseMode ? 'bg-white dark:bg-slate-700 shadow text-red-600' : 'text-gray-500'}`}
                            >
                                Future Cost
                            </button>
                            <button
                                onClick={() => setReverseMode(true)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${reverseMode ? 'bg-white dark:bg-slate-700 shadow text-red-600' : 'text-gray-500'}`}
                            >
                                Purchasing Power
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Dynamic Input based on Mode */}
                            {!reverseMode ? (
                                <div>
                                    <label className="input-label">Current Cost (₹)</label>
                                    <input type="number" value={currentCost} onChange={e => setCurrentCost(Number(e.target.value))} className="input-field text-lg font-bold" />
                                </div>
                            ) : (
                                <div>
                                    <label className="input-label">Future Amount (₹)</label>
                                    <input type="number" value={futureAmount} onChange={e => setFutureAmount(Number(e.target.value))} className="input-field text-lg font-bold" />
                                </div>
                            )}

                            {/* Category Selector */}
                            <div>
                                <label className="input-label mb-2">Inflation Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategorySelect(cat)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activeCategory === cat.id ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-500'}`}
                                        >
                                            {cat.icon} {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Rate Slider */}
                            <div>
                                <label className="input-label flex justify-between">
                                    Annual Inflation Rate
                                    <span className="text-red-500">{rate}%</span>
                                </label>
                                <input type="range" min="1" max="15" value={rate} onChange={e => { setRate(Number(e.target.value)); setActiveCategory('custom'); }} className="w-full accent-red-500 bg-gray-200 rounded-lg h-2" />
                            </div>

                            <div>
                                <label className="input-label flex justify-between">
                                    Time Period
                                    <span>{years} Years</span>
                                </label>
                                <input type="range" min="1" max="50" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full accent-gray-500 bg-gray-200 rounded-lg h-2" />
                            </div>
                        </div>

                        {/* Collapsible Comparisons */}
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-500 uppercase">Compare Investment</label>
                                <input type="checkbox" checked={showInvestComparison} onChange={e => setShowInvestComparison(e.target.checked)} className="w-4 h-4 accent-green-500" />
                            </div>
                            {showInvestComparison && (
                                <div className="mt-3 animate-fade-in">
                                    <label className="input-label">Expected Return (%)</label>
                                    <input type="number" value={investReturn} onChange={e => setInvestReturn(Number(e.target.value))} className="input-field" />
                                    <p className="text-[10px] mt-1 text-right text-gray-400">
                                        Real Return: <span className={results.netRealReturn > 0 ? 'text-green-500' : 'text-red-500'}>{results.netRealReturn.toFixed(1)}%</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: VISUALIZATION --- */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Hero Result */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 text-center relative overflow-hidden">
                        {!reverseMode ? (
                            <>
                                <p className="text-gray-500 font-bold uppercase text-xs mb-2 tracking-wider">Future Cost in {years} Years</p>
                                <h2 className="text-5xl md:text-6xl font-black text-red-600 dark:text-red-500 mb-4">₹ {results.futureValue.toLocaleString()}</h2>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                    To maintain the same lifestyle that costs <span className="font-bold">₹ {currentCost.toLocaleString()}</span> today, you will need this much.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-500 font-bold uppercase text-xs mb-2 tracking-wider">Present Value (Purchasing Power)</p>
                                <h2 className="text-5xl md:text-6xl font-black text-amber-500 mb-4">₹ {results.presentValue.toLocaleString()}</h2>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                    ₹ {futureAmount.toLocaleString()} in {years} years will basically buy you what <span className="font-bold">₹ {results.presentValue.toLocaleString()}</span> buys today.
                                </p>
                            </>
                        )}
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 min-h-[350px]">
                        <h3 className="text-sm font-bold text-gray-500 mb-6 flex items-center gap-2">
                            <TrendingUp size={16} /> Impact Timeline
                        </h3>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={results.chartData}>
                                    <defs>
                                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                        {showInvestComparison && (
                                            <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                            </linearGradient>
                                        )}
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} fontSize={12} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} width={50} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                                        formatter={(val) => `₹ ${val.toLocaleString()}`}
                                    />
                                    <Area type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" name="Projected Cost" />
                                    {showInvestComparison && (
                                        <Area type="monotone" dataKey="investment" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Investment Growth" />
                                    )}

                                    {results.doubledYear && <ReferenceLine x={results.doubledYear} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: '2x Cost', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Insights & Quick Stats */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-5 rounded-2xl flex items-start gap-4">
                            <div className="bg-red-100 dark:bg-red-800 p-2 rounded-lg text-red-600 dark:text-red-200 mt-1">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-red-800 dark:text-red-300 text-sm mb-1">Purchasing Power Erosion</h4>
                                <p className="text-xs text-red-700 dark:text-red-400">
                                    Every decade at {rate}%, you lose roughly <span className="font-bold">{((1 - 1 / Math.pow(1.06, 10)) * 100).toFixed(0)}%</span> of your money's value.
                                    {rate > 8 && " High inflation requires Equity investments to survive."}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl flex items-start gap-4">
                            <div className="bg-gray-200 dark:bg-slate-700 p-2 rounded-lg text-gray-600 dark:text-gray-300 mt-1">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-300 text-sm mb-1">Rule of 72</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    At {rate}% inflation, prices will <span className="font-bold">Double</span> every {(72 / rate).toFixed(1)} years.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
              .input-label {
                  display: block;
                  font-size: 0.75rem;
                  font-weight: 700;
                  color: #6b7280;
                  text-transform: uppercase;
                  margin-bottom: 0.5rem;
              }
              .dark .input-label {
                  color: #9ca3af;
              }
              .input-field {
                width: 100%;
                padding: 12px;
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 0.75rem;
                outline: none;
                transition: all 0.2s;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
              }
              .dark .input-field {
                background-color: #0f172a;
                border-color: #334155;
                color: white;
              }
              .input-field:focus {
                border-color: #ef4444;
                box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
              }
            `}</style>
        </div>
    );
}

export default Inflation;
