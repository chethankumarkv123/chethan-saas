import React, { useState, useMemo, useRef } from 'react';
import { DownloadReport } from '../../components/DownloadReport';
import { SEO } from '../../components/SEO';
import { PiggyBank, Briefcase, Zap, Info, TrendingDown, TrendingUp, Target, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';

export function FixedIncome() {
    const [activeTab, setActiveTab] = useState('fd'); // fd, rd, ppf
    const reportRef = useRef();

    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
            <SEO
                title="Fixed Income Calculator - FD, RD, PPF"
                description="Advanced calculator for FD, RD, and PPF with tax planning, real returns, and comparison."
                keywords="fd calculator, rd calculator, ppf calculator, fixed deposit interest, tax impact on fd, real return calculator"
            />

            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3 mb-2">
                        <PiggyBank className="text-teal-500" size={32} />
                        Fixed Income Planner
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Maximize returns from safe investments.</p>
                </div>
                <DownloadReport title="Fixed Income Report" contentRef={reportRef} />
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
                    {['fd', 'rd', 'ppf'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all uppercase ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600 dark:text-teal-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden min-h-[600px]" ref={reportRef}>
                {activeTab === 'fd' && <FDCalculator />}
                {activeTab === 'rd' && <RDCalculator />}
                {activeTab === 'ppf' && <PPFCalculator />}
            </div>

            <style>{`
              .input-field {
                width: 100%;
                padding: 12px;
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 0.75rem;
                outline: none;
                transition: all 0.2s;
              }
              .dark .input-field {
                background-color: #0f172a;
                border: 1px solid #334155;
                color: white;
              }
              .input-field:focus {
                border-color: #14b8a6;
                box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.2);
              }
            `}</style>
        </div>
    );
}

const FDCalculator = () => {
    // Core
    const [investment, setInvestment] = useState(100000);
    const [rate, setRate] = useState(7.0);
    const [years, setYears] = useState(5);
    const [compounding, setCompounding] = useState(4); // 4 = Quarterly

    // Advanced
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [inflationEnabled, setInflationEnabled] = useState(false);
    const [inflationRate, setInflationRate] = useState(6);
    const [taxEnabled, setTaxEnabled] = useState(false);
    const [taxSlab, setTaxSlab] = useState(30);

    const results = useMemo(() => {
        const i = rate / 100;
        const n = compounding;
        const t = years;

        // A = P(1 + r/n)^(nt)
        const maturity = investment * Math.pow((1 + i / n), n * t);
        const interest = maturity - investment;

        // Tax
        let taxAmount = 0;
        if (taxEnabled) {
            taxAmount = interest * (taxSlab / 100);
        }
        const postTaxMaturity = maturity - taxAmount;
        const postTaxInterest = postTaxMaturity - investment;

        // Real Return (Inflation Adjusted)
        let realMaturity = postTaxMaturity;
        if (inflationEnabled) {
            realMaturity = postTaxMaturity / Math.pow(1 + inflationRate / 100, t);
        }

        // Chart Data (Yearly)
        const chartData = [];
        for (let y = 0; y <= t; y++) {
            // A = P(1 + r/n)^(n*y)
            let val = investment * Math.pow((1 + i / n), n * y);
            chartData.push({
                year: y,
                value: Math.round(val),
                invested: investment
            });
        }

        return {
            maturity: Math.round(maturity),
            interest: Math.round(interest),
            postTaxMaturity: Math.round(postTaxMaturity),
            postTaxInterest: Math.round(postTaxInterest),
            taxAmount: Math.round(taxAmount),
            realMaturity: Math.round(realMaturity),
            chartData
        };
    }, [investment, rate, years, compounding, inflationEnabled, inflationRate, taxEnabled, taxSlab]);

    return (
        <div className="grid lg:grid-cols-12">
            {/* Input Section */}
            <div className="lg:col-span-4 p-8 border-r border-gray-100 dark:border-slate-700 space-y-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">FD Planner</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Investment Amount</label>
                        <input type="number" value={investment} onChange={(e) => setInvestment(Number(e.target.value))} className="input-field font-bold text-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Interest Rate (%)</label>
                            <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} step="0.1" className="input-field" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Duration (Years)</label>
                            <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="input-field" />
                        </div>
                    </div>
                </div>

                {/* Advanced Toggle */}
                <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-sm font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700"
                    >
                        {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                    </button>

                    {showAdvanced && (
                        <div className="mt-4 space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Compounding Freq.</label>
                                <select value={compounding} onChange={(e) => setCompounding(Number(e.target.value))} className="input-field">
                                    <option value={1}>Annual</option>
                                    <option value={2}>Half-Yearly</option>
                                    <option value={4}>Quarterly (Standard)</option>
                                    <option value={12}>Monthly</option>
                                </select>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Apply Tax?</label>
                                    <input type="checkbox" checked={taxEnabled} onChange={(e) => setTaxEnabled(e.target.checked)} className="w-4 h-4 accent-teal-600" />
                                </div>
                                {taxEnabled && (
                                    <div>
                                        <label className="block text-[10px] text-gray-400 uppercase mb-1">Tax Slab</label>
                                        <div className="flex gap-2">
                                            {[10, 20, 30].map(s => (
                                                <button key={s} onClick={() => setTaxSlab(s)} className={`px-3 py-1 text-xs font-bold rounded ${taxSlab === s ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'}`}>
                                                    {s}%
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-slate-700">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Inflation Adj.?</label>
                                    <input type="checkbox" checked={inflationEnabled} onChange={(e) => setInflationEnabled(e.target.checked)} className="w-4 h-4 accent-red-500" />
                                </div>
                                {inflationEnabled && (
                                    <input type="number" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} className="input-field mt-2 text-sm" placeholder="Rate %" />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-8 p-8 bg-gray-50/50 dark:bg-slate-900/50">
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Primary Result */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-gray-500 font-bold uppercase text-xs mb-1">Maturity Value</p>
                            <h2 className="text-4xl font-bold text-teal-600 dark:text-teal-400">₹ {results.maturity.toLocaleString()}</h2>
                            <div className="mt-4 flex gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400 text-xs">Principal</p>
                                    <p className="font-bold">₹ {investment.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">Interest</p>
                                    <p className="font-bold text-teal-500">+ ₹ {results.interest.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tax & Real Value Analysis */}
                    <div className="space-y-4">
                        {taxEnabled && (
                            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30 flex justify-between items-center">
                                <div>
                                    <p className="text-orange-800 dark:text-orange-300 font-bold text-sm">Tax on Interest</p>
                                    <p className="text-xs text-orange-600 dark:text-orange-400">Slab: {taxSlab}%</p>
                                </div>
                                <p className="font-bold text-lg text-orange-700 dark:text-orange-400">- ₹ {results.taxAmount.toLocaleString()}</p>
                            </div>
                        )}

                        {inflationEnabled && (
                            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30 flex justify-between items-center">
                                <div>
                                    <p className="text-red-800 dark:text-red-300 font-bold text-sm">Real Value (Today)</p>
                                    <p className="text-xs text-red-600 dark:text-red-400">Inflation: {inflationRate}%</p>
                                </div>
                                <p className="font-bold text-lg text-red-700 dark:text-red-400">₹ {results.realMaturity.toLocaleString()}</p>
                            </div>
                        )}

                        {!taxEnabled && !inflationEnabled && (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                                Enable Advanced Options for Tax & Inflation Analysis
                            </div>
                        )}
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-[300px]">
                    <h4 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2"><TrendingUp size={16} /> Growth Curve</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={results.chartData}>
                            <defs>
                                <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} formatter={(val) => `₹ ${val.toLocaleString()}`} />
                            <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={3} fill="url(#colorTeal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const RDCalculator = () => {
    // Similar advanced structure for RD
    const [monthly, setMonthly] = useState(5000);
    const [rate, setRate] = useState(7.0);
    const [years, setYears] = useState(5);

    // Simple calc for brevity in this specific artifact, but structure mirrors FD
    const calculate = () => {
        const i = rate / 100 / 12;
        const n = years * 12;
        // RD approx FV = P * ( (1+i)^n - 1 ) / i * (1+i)  (Monthly Compounding)
        const fv = monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        return {
            total: Math.round(fv),
            invested: monthly * n,
            interest: Math.round(fv - (monthly * n))
        };
    };
    const res = calculate();

    return (
        <div className="grid lg:grid-cols-12">
            <div className="lg:col-span-4 p-8 border-r border-gray-100 dark:border-slate-700 space-y-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">RD Planner</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Monthly Deposit</label>
                        <input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="input-field font-bold text-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Interest Rate (%)</label>
                            <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} step="0.1" className="input-field" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Duration (Years)</label>
                            <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="input-field" />
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-teal-50 dark:bg-teal-900/10 rounded-xl border border-teal-100 dark:border-teal-900/30">
                    <h4 className="text-sm font-bold text-teal-800 dark:text-teal-300 flex items-center gap-2"><Info size={16} /> RD Insight</h4>
                    <p className="text-xs text-teal-700 dark:text-teal-400 mt-1">Recurring Deposits help build discipline. Interest is taxable similar to FDs.</p>
                </div>
            </div>

            <div className="lg:col-span-8 p-8 bg-gray-50/50 dark:bg-slate-900/50 flex flex-col justify-center items-center">
                <div className="text-center mb-8">
                    <p className="text-gray-500 font-bold uppercase text-xs mb-2">Maturity Value</p>
                    <h2 className="text-5xl font-bold text-teal-600 dark:text-teal-400">₹ {res.total.toLocaleString()}</h2>
                </div>
                <div className="flex gap-10 text-center">
                    <div>
                        <p className="text-gray-400 uppercase text-[10px] font-bold">Total Invested</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">₹ {res.invested.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 uppercase text-[10px] font-bold">Interest Earned</p>
                        <p className="text-xl font-bold text-teal-500">+ ₹ {res.interest.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const PPFCalculator = () => {
    const [yearly, setYearly] = useState(150000);
    const [years, setYears] = useState(15);
    const rate = 7.1;

    const calculate = () => {
        let balance = 0;
        let invested = 0;
        const data = [];
        for (let i = 1; i <= years; i++) {
            invested += yearly;
            balance += yearly;
            balance += balance * (rate / 100);
            data.push({ year: i, value: Math.round(balance), invested: invested });
        }
        return {
            total: Math.round(balance),
            interest: Math.round(balance - invested),
            invested,
            data
        };
    };
    const res = calculate();

    return (
        <div className="grid lg:grid-cols-12">
            <div className="lg:col-span-4 p-8 border-r border-gray-100 dark:border-slate-700 space-y-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">PPF Planner</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Yearly Investment (Max 1.5L)</label>
                        <input type="number" value={yearly} max={150000} onChange={(e) => setYearly(Number(e.target.value))} className="input-field font-bold text-lg" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Duration (Years)</label>
                        <input type="number" value={years} min={15} onChange={(e) => setYears(Number(e.target.value))} className="input-field" />
                        <p className="text-[10px] text-gray-400 mt-1">Min lock-in 15 years.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Interest Rate</label>
                        <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-xl font-mono text-gray-600 dark:text-gray-300 font-bold">
                            {rate}% (Tax Free)
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-8 p-8 bg-gray-50/50 dark:bg-slate-900/50">
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <p className="text-gray-500 font-bold uppercase text-xs mb-1">Maturity Value</p>
                        <h2 className="text-3xl font-bold text-teal-600 dark:text-teal-400">₹ {res.total.toLocaleString()}</h2>
                        <div className="flex items-center gap-2 mt-2 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded w-fit">
                            <ShieldCheck size={12} /> Tax Free (EEE)
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                            <span className="text-sm font-bold text-gray-500">Invested</span>
                            <span className="font-bold">₹ {res.invested.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                            <span className="text-sm font-bold text-gray-500">Interest</span>
                            <span className="font-bold text-teal-500">+ ₹ {res.interest.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={res.data}>
                            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} formatter={(val) => `₹ ${val.toLocaleString()}`} />
                            <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// Default export
export default FixedIncome;
