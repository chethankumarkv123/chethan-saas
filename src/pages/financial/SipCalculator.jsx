import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DownloadReport } from '../../components/DownloadReport';
import { SEO } from '../../components/SEO';
import {
    TrendingUp, DollarSign, Calendar, ArrowRight, Info,
    Target, ShieldAlert, ChevronDown, ChevronUp, PieChart as PieIcon,
    BarChart3, Zap
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    BarChart, Bar, Cell, ReferenceLine
} from 'recharts';

export function SipCalculator() {
    // --- Core State ---
    const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(10);

    // --- Advanced State ---
    const [stepUpEnabled, setStepUpEnabled] = useState(false);
    const [stepUpRate, setStepUpRate] = useState(10); // 10% annual increase

    const [inflationEnabled, setInflationEnabled] = useState(false);
    const [inflationRate, setInflationRate] = useState(6);

    const [taxEnabled, setTaxEnabled] = useState(false);
    const [taxType, setTaxType] = useState('equity'); // 'equity' or 'debt'

    const [goalEnabled, setGoalEnabled] = useState(false);
    const [goalAmount, setGoalAmount] = useState(5000000);

    const [showAdvanced, setShowAdvanced] = useState(false);

    // --- Calculation Logic ---
    const results = useMemo(() => {
        let months = years * 12;
        let r_monthly = rate / 100 / 12;

        let currentMonthly = monthlyInvestment;
        let totalInvested = 0;
        let corpus = 0;
        let chartData = [];
        let yearlyData = [];

        // Step-Up Calculation (Iterative Monthly)
        // To accurately chart, we track year-end balances
        let balance = 0;

        for (let m = 1; m <= months; m++) {
            // Apply annual step-up
            if (stepUpEnabled && m > 1 && (m - 1) % 12 === 0) {
                currentMonthly = currentMonthly * (1 + stepUpRate / 100);
            }

            balance += currentMonthly; // Add investment
            totalInvested += currentMonthly;
            balance = balance * (1 + r_monthly); // Add interest

            // Year End Data Snapshot
            if (m % 12 === 0) {
                const year = m / 12;
                chartData.push({
                    year: year,
                    invested: Math.round(totalInvested),
                    value: Math.round(balance),
                    gain: Math.round(balance - totalInvested)
                });
            }
        }
        corpus = balance;

        // --- Tax Calculation ---
        let totalGain = corpus - totalInvested;
        let tax = 0;
        let postTaxCorpus = corpus;

        if (taxEnabled) {
            if (taxType === 'equity') {
                // Equity: LTCG 12.5% on gains > 1.25L
                const taxableGain = Math.max(0, totalGain - 125000);
                tax = taxableGain * 0.125;
            } else {
                // Debt: Added to income (Assume 30% slab for simplicity/conservative)
                tax = totalGain * 0.30;
            }
            postTaxCorpus = corpus - tax;
        }

        // --- Inflation Adjustment (Real Value) ---
        let realValue = postTaxCorpus;
        if (inflationEnabled) {
            // PV = FV / (1+r)^n
            realValue = postTaxCorpus / Math.pow(1 + inflationRate / 100, years);
        }

        // --- Scenarios (Bear / Bull) ---
        // Simple approximation: +/- 2% CAGR impact
        // We can't re-run the full loop easily without func overlap, so approximate scaling
        // Or better: Re-run simplified loop for scenarios to be accurate
        const calculateScenario = (modRate) => {
            let b = 0;
            let rm = (rate + modRate) / 100 / 12;
            let cm = monthlyInvestment;
            for (let m = 1; m <= months; m++) {
                if (stepUpEnabled && m > 1 && (m - 1) % 12 === 0) cm *= (1 + stepUpRate / 100);
                b = (b + cm) * (1 + rm);
            }
            return b;
        };

        const bearCorpus = calculateScenario(-2);
        const bullCorpus = calculateScenario(2);

        // --- Goal Analysis ---
        const shortfall = Math.max(0, goalAmount - postTaxCorpus);
        const goalProgress = Math.min(100, (postTaxCorpus / goalAmount) * 100);

        return {
            invested: Math.round(totalInvested),
            corpus: Math.round(corpus),
            gain: Math.round(totalGain),
            tax: Math.round(tax),
            postTaxCorpus: Math.round(postTaxCorpus),
            realValue: Math.round(realValue),
            bear: Math.round(bearCorpus),
            bull: Math.round(bullCorpus),
            chartData,
            shortfall: Math.round(shortfall),
            goalProgress,
            avgMonthly: Math.round(totalInvested / months) // Average monthly inv (due to step up)
        };
    }, [monthlyInvestment, rate, years, stepUpEnabled, stepUpRate, inflationEnabled, inflationRate, taxEnabled, taxType, goalAmount]);

    // Insights Generation
    const getInsights = () => {
        const insights = [];
        if (stepUpEnabled) {
            insights.push(`Stepping up your SIP by ${stepUpRate}% annually adds significant momentum to your compounding.`);
        } else {
            insights.push(`💡 Pro Tip: A 10% yearly Step-Up could increase your corpus by ~${Math.round((results.corpus * 0.4) / 100000).toLocaleString()}L (approx 40% boost).`);
        }

        if (inflationEnabled) {
            const erosion = Math.round(((results.postTaxCorpus - results.realValue) / results.postTaxCorpus) * 100);
            insights.push(`Inflation of ${inflationRate}% will erode about ${erosion}% of your purchasing power over ${years} years.`);
        }

        if (taxEnabled) {
            insights.push(taxType === 'equity'
                ? "Equity Tax: Gains over ₹1.25L are taxed at 12.5%."
                : "Debt Tax: Gains are added to your income and taxed as per slab (assumed 30%).");
        }

        return insights;
    };

    const reportRef = useRef();

    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
            <SEO
                title="Advanced SIP Calculator - Step Up, Tax & Goals"
                description="Comprehensive SIP Calculator with Step-Up logic, Inflation adjustment, Tax analysis, and Goal planning."
                keywords="sip calculator, step up sip, mutual fund tax calculator, goal planner, financial freedom"
            />

            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3 mb-2">
                        <TrendingUp className="text-purple-600 dark:text-purple-400" size={32} />
                        Advanced SIP Planner
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Plan your wealth with precision.</p>
                </div>
                <DownloadReport title="SIP Report" contentRef={reportRef} />
            </div>

            <div className="grid lg:grid-cols-12 gap-8" ref={reportRef}>
                {/* --- LEFT COLUMN: INPUTS --- */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Core Inputs Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                            <DollarSign size={20} className="text-purple-500" /> Investment Details
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Monthly Investment</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        value={monthlyInvestment}
                                        onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                                        className="w-full pl-8 p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-bold text-lg"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Exp. Return (%)</label>
                                    <input
                                        type="number"
                                        value={rate}
                                        onChange={(e) => setRate(Number(e.target.value))}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Period (Years)</label>
                                    <input
                                        type="number"
                                        value={years}
                                        onChange={(e) => setYears(Number(e.target.value))}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Settings Toggle */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Zap size={18} className="text-amber-500" />
                                Advanced Settings
                            </span>
                            {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>

                        {showAdvanced && (
                            <div className="p-6 space-y-6 animate-fade-in">
                                {/* Step Up */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-bold text-gray-700 dark:text-white">Step-Up SIP</label>
                                        <input type="checkbox" checked={stepUpEnabled} onChange={(e) => setStepUpEnabled(e.target.checked)} className="w-5 h-5 accent-purple-600 rounded cursor-pointer" />
                                    </div>
                                    {stepUpEnabled && (
                                        <div className="pl-4 border-l-2 border-purple-500">
                                            <label className="block text-xs text-gray-500 mb-1">Annual Increase (%)</label>
                                            <input type="number" value={stepUpRate} onChange={e => setStepUpRate(Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none" />
                                        </div>
                                    )}
                                </div>

                                {/* Inflation */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-bold text-gray-700 dark:text-white">Inflation Adjustment</label>
                                        <input type="checkbox" checked={inflationEnabled} onChange={(e) => setInflationEnabled(e.target.checked)} className="w-5 h-5 accent-red-500 rounded cursor-pointer" />
                                    </div>
                                    {inflationEnabled && (
                                        <div className="pl-4 border-l-2 border-red-500">
                                            <label className="block text-xs text-gray-500 mb-1">Inflation Rate (%)</label>
                                            <input type="number" value={inflationRate} onChange={e => setInflationRate(Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none" />
                                        </div>
                                    )}
                                </div>

                                {/* Tax */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-bold text-gray-700 dark:text-white">Tax Impact</label>
                                        <input type="checkbox" checked={taxEnabled} onChange={(e) => setTaxEnabled(e.target.checked)} className="w-5 h-5 accent-orange-500 rounded cursor-pointer" />
                                    </div>
                                    {taxEnabled && (
                                        <div className="pl-4 border-l-2 border-orange-500">
                                            <div className="flex gap-2">
                                                <button onClick={() => setTaxType('equity')} className={`flex-1 py-1.5 text-xs font-bold rounded ${taxType === 'equity' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>Equity</button>
                                                <button onClick={() => setTaxType('debt')} className={`flex-1 py-1.5 text-xs font-bold rounded ${taxType === 'debt' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>Debt</button>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-2">
                                                {taxType === 'equity' ? 'LTCG: 12.5% on gains > 1.25L' : 'Added to income (30% assumed)'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Goal */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-bold text-gray-700 dark:text-white">Set Target Goal</label>
                                        <input type="checkbox" checked={goalEnabled} onChange={(e) => setGoalEnabled(e.target.checked)} className="w-5 h-5 accent-emerald-500 rounded cursor-pointer" />
                                    </div>
                                    {goalEnabled && (
                                        <div className="pl-4 border-l-2 border-emerald-500">
                                            <label className="block text-xs text-gray-500 mb-1">Target Amount (₹)</label>
                                            <input type="number" value={goalAmount} onChange={e => setGoalAmount(Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- RIGHT COLUMN: RESULTS --- */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Primary Results Cards */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-1">Total Invested</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹ {results.invested.toLocaleString()}</p>
                            </div>
                            {stepUpEnabled && <div className="mt-2 text-xs text-purple-500 font-medium">Avg Inv: ₹ {results.avgMonthly.toLocaleString()}/mo</div>}
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-1">Wealth Gained</p>
                                <p className="text-2xl font-bold text-green-500">+ ₹ {results.gain.toLocaleString()}</p>
                            </div>
                            <div className="mt-2 text-xs text-green-600/70 font-medium">
                                Growth: {((results.gain / results.invested) * 100).toFixed(0)}%
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-purple-100 text-xs font-bold uppercase mb-1">Net Corpus</p>
                                <p className="text-3xl font-bold">₹ {results.postTaxCorpus.toLocaleString()}</p>
                                {inflationEnabled && (
                                    <div className="mt-2 inline-block bg-black/20 px-2 py-1 rounded text-xs">
                                        Real Val: ₹ {results.realValue.toLocaleString()}
                                    </div>
                                )}
                            </div>
                            <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                                <TrendingUp size={100} />
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart3 size={20} className="text-gray-500" />
                                Wealth Projections
                            </h3>
                            <div className="flex gap-4 text-xs font-bold">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-purple-500"></span> Total Value
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-slate-600"></span> Invested
                                </div>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <YAxis tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} width={60} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'white', borderRadius: '8px' }}
                                        formatter={(val) => `₹ ${val.toLocaleString()}`}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                                    <Area type="monotone" dataKey="invested" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Analysis & Scenarios */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Market Scenarios */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-sm flex items-center gap-2">
                                <ShieldAlert size={16} className="text-gray-400" /> Market Scenarios
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-red-500 font-bold">Bear Case (-2%)</span>
                                        <span className="text-gray-900 dark:text-white font-mono">₹ {results.bear.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-400 opacity-70" style={{ width: '60%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-blue-500 font-bold">Expected ({rate}%)</span>
                                        <span className="text-gray-900 dark:text-white font-mono">₹ {results.corpus.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: '80%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-green-500 font-bold">Bull Case (+2%)</span>
                                        <span className="text-gray-900 dark:text-white font-mono">₹ {results.bull.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Goal Readiness or Tax Summary */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                            {goalEnabled ? (
                                <div className="h-full flex flex-col justify-between">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-sm flex items-center gap-2">
                                        <Target size={16} className="text-gray-400" /> Goal Readiness
                                    </h4>
                                    <div className="text-center py-4">
                                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-gray-100 dark:border-slate-700 relative">
                                            <span className={`text-xl font-bold ${results.goalProgress >= 100 ? 'text-green-500' : 'text-amber-500'}`}>
                                                {results.goalProgress.toFixed(0)}%
                                            </span>
                                        </div>
                                        <p className="mt-4 text-sm text-gray-500">
                                            {results.shortfall > 0
                                                ? `Shortfall: ₹ ${results.shortfall.toLocaleString()}`
                                                : "🎉 Goal Achieved!"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col justify-center text-center items-center text-gray-400 space-y-3">
                                    <Target size={32} className="opacity-20" />
                                    <p className="text-sm px-8">Enable "Set Target Goal" in Advanced Settings to check if you are on track.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Insights Panel */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 p-6 rounded-2xl">
                        <h4 className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2 mb-3">
                            <Info size={18} /> Analysis & Insights
                        </h4>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-indigo-700 dark:text-indigo-400">
                            {getInsights().map((insight, i) => (
                                <li key={i}>{insight}</li>
                            ))}
                            <li>Historical market returns (Nifty 50) have averaged ~12% over 15+ year periods.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SipCalculator;
