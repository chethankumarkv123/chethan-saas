import React, { useState, useMemo, useRef } from 'react';
import { DownloadReport } from '../../components/DownloadReport';
import { SEO } from '../../components/SEO';
import {
    Target, TrendingUp, Calendar, ArrowRight, ShieldCheck, Zap,
    Award, ChevronDown, ChevronUp, AlertCircle, Info, Landmark,
    TrendingDown, Hourglass, CheckCircle2, DollarSign
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

export function InvestmentPlanner() {
    // --- Core State ---
    const [goalAmount, setGoalAmount] = useState(10000000); // 1 Cr
    const [years, setYears] = useState(10);
    const [risk, setRisk] = useState('moderate'); // conservative, moderate, aggressive

    // --- Advanced State ---
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [inflationEnabled, setInflationEnabled] = useState(false);
    const [inflationRate, setInflationRate] = useState(6);

    const [stepUpEnabled, setStepUpEnabled] = useState(false);
    const [stepUpRate, setStepUpRate] = useState(10);

    const [monthlyIncome, setMonthlyIncome] = useState(0); // For affordability checking

    const [delayYears, setDelayYears] = useState(0); // Scenario simulation

    // --- Risk Profiles ---
    const riskProfiles = {
        conservative: { rate: 8, label: "Debt Oriented", desc: "Low volatility, steady growth." },
        moderate: { rate: 10, label: "Balanced", desc: "Mix of Equity & Debt." },
        aggressive: { rate: 12, label: "Equity Heavy", desc: "High growth, high volatility." }
    };

    // --- Calculation Logic ---
    const results = useMemo(() => {
        const baseRate = riskProfiles[risk].rate;
        const totalYears = years + delayYears;
        const months = totalYears * 12;
        const r = baseRate / 100 / 12;

        // 1. Inflation Adjustment
        let targetValue = goalAmount;
        let inflationImpact = 0;
        if (inflationEnabled) {
            targetValue = goalAmount * Math.pow(1 + inflationRate / 100, totalYears);
            inflationImpact = targetValue - goalAmount;
        }

        // 2. SIP Calculation (Standard vs Step-Up)
        let sip = 0;

        if (stepUpEnabled) {
            // Complex Step-Up Formula or Iterative Solver
            // FV = SIP * Sum [ (1+step)^k * (1+r)^(N-k-1) ] ... messy closed form.
            // Let's use binary search for precision to find initial SIP.
            let low = 100;
            let high = targetValue; // Upper bound safe
            let calculatedSIP = 0;

            // Solver loop (15 iterations enough for precision)
            for (let k = 0; k < 20; k++) {
                let mid = (low + high) / 2;
                let currentBalance = 0;
                let currentMonthly = mid;

                for (let m = 1; m <= months; m++) {
                    // Annual Step Up
                    if (m > 1 && (m - 1) % 12 === 0) {
                        currentMonthly *= (1 + stepUpRate / 100);
                    }
                    currentBalance = (currentBalance + currentMonthly) * (1 + r);
                }

                if (currentBalance < targetValue) low = mid;
                else high = mid;

                calculatedSIP = mid;
            }
            sip = Math.round(calculatedSIP);
        } else {
            // Standard Formula
            // P = FV / ( ((1+r)^n - 1)/r * (1+r) )
            const factor = ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
            sip = Math.round(targetValue / factor);
        }

        // 3. Projections & Chart Data
        const chartData = [];
        let balance = 0;
        let invested = 0;
        let currentMonthlySIP = sip;
        let scenarios = { conservative: 0, aggressive: 0 };

        // Scenario Rates
        const r_low = (baseRate - 2) / 100 / 12;
        const r_high = (baseRate + 2) / 100 / 12;
        let bal_low = 0, bal_high = 0;

        for (let i = 0; i <= totalYears; i++) {
            if (i === 0) {
                chartData.push({ year: 0, balance: 0, invested: 0, milestone: "Start" });
                continue;
            }

            // Monthly accumulation for this year
            for (let m = 0; m < 12; m++) {
                // Step Up Logic
                const monthIndex = (i - 1) * 12 + m;
                if (stepUpEnabled && monthIndex > 0 && monthIndex % 12 === 0) {
                    currentMonthlySIP *= (1 + stepUpRate / 100);
                }

                // Base
                balance = (balance + currentMonthlySIP) * (1 + r);
                invested += currentMonthlySIP;

                // Scenarios
                bal_low = (bal_low + currentMonthlySIP) * (1 + r_low);
                bal_high = (bal_high + currentMonthlySIP) * (1 + r_high);
            }

            // Milestones
            let milestone = null;
            if (balance >= targetValue * 0.5 && balance < targetValue * 0.6 && !chartData.some(d => d.milestone === "Halfway")) milestone = "Halfway";
            if (i === totalYears) milestone = "Goal";

            chartData.push({
                year: i,
                balance: Math.round(balance),
                invested: Math.round(invested),
                milestone
            });
        }

        // 4. Affordability
        let affordabilityMsg = null;
        if (monthlyIncome > 0) {
            const ratio = (sip / monthlyIncome) * 100;
            if (ratio > 30) affordabilityMsg = { type: 'hard', text: `SIP is ${ratio.toFixed(0)}% of income. Hard to sustain.` };
            else if (ratio > 20) affordabilityMsg = { type: 'mod', text: `SIP is ${ratio.toFixed(0)}% of income. Standard.` };
            else affordabilityMsg = { type: 'easy', text: `SIP is ${ratio.toFixed(0)}% of income. Comfortable.` };
        }

        return {
            sip,
            totalInvested: Math.round(invested),
            targetValue: Math.round(targetValue),
            inflationImpact: Math.round(inflationImpact),
            gains: Math.round(balance - invested),
            chartData,
            affordabilityMsg,
            scenarios: {
                low: Math.round(bal_low),
                high: Math.round(bal_high)
            }
        };

    }, [goalAmount, years, delayYears, risk, inflationEnabled, inflationRate, stepUpEnabled, stepUpRate, monthlyIncome]);


    // Action Handlers
    const applyDelay = (d) => setDelayYears(d);

    const reportRef = useRef();

    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
            <SEO
                title="Smart Goal Planner - Invest for Dreams"
                description="Advanced goal planner with inflation adjustment, delay simulation, and step-up SIP capability."
            />

            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3 mb-2">
                        <Target className="text-rose-500" size={32} />
                        Goal Planner
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Transform your dreams into an actionable plan.</p>
                </div>
                <DownloadReport title="Goal Plan Report" contentRef={reportRef} />
            </div>

            <div className="grid lg:grid-cols-12 gap-8" ref={reportRef}>
                {/* --- LEFT: INPUTS --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Goal Details</h2>
                            {delayYears > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">+ {delayYears} Yr Delay</span>}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="input-label">Target Amount (₹)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={goalAmount}
                                        onChange={(e) => setGoalAmount(Number(e.target.value))}
                                        className="input-field text-rose-600 font-bold text-lg"
                                    />
                                    {inflationEnabled && (
                                        <p className="text-[10px] text-rose-400 mt-1 text-right">
                                            Adj. Target: ₹ {results.targetValue.toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="input-label flex justify-between">
                                    Time Horizon
                                    <span className="text-gray-500">{years + delayYears} Years</span>
                                </label>
                                <input
                                    type="range" min="1" max="30" value={years}
                                    onChange={(e) => setYears(Number(e.target.value))}
                                    className="w-full accent-rose-500 bg-gray-200 rounded-lg h-2"
                                />
                            </div>

                            <div>
                                <label className="input-label mb-3">Risk Profile</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(riskProfiles).map(([key, p]) => (
                                        <button
                                            key={key}
                                            onClick={() => setRisk(key)}
                                            className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${risk === key ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300' : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 opacity-60 hover:opacity-100'}`}
                                        >
                                            {key === 'conservative' && <ShieldCheck size={18} />}
                                            {key === 'moderate' && <Award size={18} />}
                                            {key === 'aggressive' && <Zap size={18} />}
                                            <span className="text-[10px] font-bold uppercase">{p.label}</span>
                                            <span className="text-[10px] opacity-70">{p.rate}%</span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 text-center">{riskProfiles[risk].desc}</p>
                            </div>
                        </div>

                        {/* Collapsible Advanced */}
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                            <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between text-xs font-bold text-gray-500 uppercase hover:text-rose-500 transition-colors">
                                <span>Advanced Optimization</span>
                                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            {showAdvanced && (
                                <div className="mt-4 space-y-4 animate-fade-in">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Adjust for Inflation</label>
                                        <input type="checkbox" checked={inflationEnabled} onChange={(e) => setInflationEnabled(e.target.checked)} className="w-4 h-4 accent-rose-500" />
                                    </div>
                                    {inflationEnabled && (
                                        <input type="number" value={inflationRate} onChange={e => setInflationRate(Number(e.target.value))} className="input-field text-sm" placeholder="Inflation %" />
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Enable Step-Up SIP</label>
                                        <input type="checkbox" checked={stepUpEnabled} onChange={(e) => setStepUpEnabled(e.target.checked)} className="w-4 h-4 accent-rose-500" />
                                    </div>
                                    {stepUpEnabled && (
                                        <input type="number" value={stepUpRate} onChange={e => setStepUpRate(Number(e.target.value))} className="input-field text-sm" placeholder="Annual Increase %" />
                                    )}

                                    <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">Monthly Income (Optional)</label>
                                        <input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(Number(e.target.value))} className="input-field text-sm" placeholder="For affordability check" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: RESULTS --- */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Hero Result */}
                    <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between gap-8 relative overflow-hidden">
                        <div className="relative z-10 w-full md:w-1/2">
                            <p className="font-medium text-white/80 mb-2 uppercase tracking-wide text-xs">Required Monthly Investment</p>
                            <h2 className="text-5xl font-black mb-3">₹ {results.sip.toLocaleString()}</h2>

                            {results.affordabilityMsg && (
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${results.affordabilityMsg.type === 'hard' ? 'bg-red-500/20 text-white' : 'bg-white/20 text-white'}`}>
                                    {results.affordabilityMsg.type === 'hard' ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                                    {results.affordabilityMsg.text}
                                </div>
                            )}
                        </div>

                        {/* Quick Simulation Actions */}
                        <div className="relative z-10 w-full md:w-1/2 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <p className="text-xs font-bold text-pink-100 uppercase mb-3 flex items-center gap-2">
                                <Zap size={14} /> Goal Simulators
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => applyDelay(delayYears === 0 ? 1 : 0)} className={`p-2 rounded-lg text-xs font-bold text-center transition-colors ${delayYears > 0 ? 'bg-white text-rose-600' : 'bg-white/20 hover:bg-white/30'}`}>
                                    {delayYears > 0 ? "Remove Delay" : "Delay 1 Year"}
                                </button>
                                <button onClick={() => setStepUpEnabled(!stepUpEnabled)} className={`p-2 rounded-lg text-xs font-bold text-center transition-colors ${stepUpEnabled ? 'bg-white text-rose-600' : 'bg-white/20 hover:bg-white/30'}`}>
                                    {stepUpEnabled ? "Disable Step-Up" : "Try Step-Up"}
                                </button>
                            </div>
                            <p className="text-[10px] text-pink-200 mt-2 text-center opacity-80">
                                See how small changes impact your monthly burden.
                            </p>
                        </div>

                        {/* Decor */}
                        <div className="absolute right-[-20px] top-[-20px] opacity-10">
                            <Target size={200} />
                        </div>
                    </div>

                    {/* Chart & Stats */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 min-h-[350px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-gray-500 flex items-center gap-2">
                                <TrendingUp size={16} /> Asset Growth Path
                            </h3>
                            <div className="flex gap-4 text-xs font-bold">
                                <span className="text-rose-500">Projected</span>
                                <span className="text-gray-400">Invested</span>
                            </div>
                        </div>

                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={results.chartData}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <YAxis tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} fontSize={12} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} width={50} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                                        formatter={(val) => `₹ ${val.toLocaleString()}`}
                                        labelStyle={{ color: '#94a3b8' }}
                                    />
                                    <Area type="monotone" dataKey="balance" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" animationDuration={1000} />
                                    <Area type="monotone" dataKey="invested" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" />

                                    {/* Milestones */}
                                    {results.chartData.map((d) =>
                                        d.milestone ? <ReferenceLine key={d.year} x={d.year} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'top', value: d.milestone, fill: '#f43f5e', fontSize: 10, fontWeight: 'bold' }} /> : null
                                    )}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Insights Panel */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 p-5 rounded-2xl">
                            <h4 className="font-bold text-rose-800 dark:text-rose-300 text-sm mb-3 flex items-center gap-2">
                                <Info size={16} /> Opportunity
                            </h4>
                            <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
                                Delaying your goal by just <span className="font-bold">1 year</span> could reduce your SIP burden significantly due to the extra compounding period.
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl">
                            <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-3 flex items-center gap-2">
                                <ShieldCheck size={16} /> Market Reality
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                In a bear market (-2% return), your corpus might only reach <span className="font-bold">₹ {(results.scenarios.low / 100000).toFixed(1)}L</span>. Consider a buffer in your target.
                            </p>
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
                border-color: #f43f5e;
                box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.2);
              }
            `}</style>
        </div>
    );
}

export default InvestmentPlanner;
