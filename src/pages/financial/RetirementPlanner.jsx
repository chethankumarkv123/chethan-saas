import React, { useState, useMemo, useRef } from 'react';
import { DownloadReport } from '../../components/DownloadReport';
import { SEO } from '../../components/SEO';
import {
    User, DollarSign, TrendingUp, Heart, Info, AlertOctagon,
    ShieldCheck, Calendar, Activity, Zap, CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar
} from 'recharts';

export function RetirementPlanner() {
    // --- Core Core Strategy State ---
    const [age, setAge] = useState(30);
    const [retireAge, setRetireAge] = useState(60);
    const [lifeExpectancy, setLifeExpectancy] = useState(85);

    // --- Financial State ---
    const [monthlyExpense, setMonthlyExpense] = useState(50000);
    const [currentSavings, setCurrentSavings] = useState(500000);

    // --- Advanced / Assumptions ---
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [inflation, setInflation] = useState(6);
    const [preRetireReturn, setPreRetireReturn] = useState(12);
    const [postRetireReturn, setPostRetireReturn] = useState(8);
    const [medicalInflation, setMedicalInflation] = useState(10); // Higher medical inflation

    // --- New Income Sources ---
    const [otherIncomeMonth, setOtherIncomeMonth] = useState(0); // Rental, Pension etc.
    const [lumpsumMaturity, setLumpsumMaturity] = useState(0); // EPF/PPF Maturity

    // --- Calculation Logic ---
    const calculations = useMemo(() => {
        const yearsToRetire = Math.max(0, retireAge - age);
        const yearsInRetirement = Math.max(0, lifeExpectancy - retireAge);

        if (yearsToRetire <= 0 && yearsInRetirement <= 0) return null;

        // 1. Expense Projection (Blended Inflation)
        // Assume 15% of expense is Medical (growing at 10%), rest at generic inflation (6%)
        const medicalSplit = 0.15;
        const generalSplit = 0.85;

        const fvGeneral = (monthlyExpense * generalSplit) * Math.pow(1 + inflation / 100, yearsToRetire);
        const fvMedical = (monthlyExpense * medicalSplit) * Math.pow(1 + medicalInflation / 100, yearsToRetire);
        const fvTotalExpense = fvGeneral + fvMedical;

        // Annual Expense required at Age 60
        const annualExpenseReq = (fvTotalExpense * 12) - (otherIncomeMonth * 12); // Reduced by passive income

        // 2. Corpus Calculation
        // Real rate approx for annuity period
        const realRate = ((1 + postRetireReturn / 100) / (1 + inflation / 100)) - 1;

        // PV of Annuity Due (simplified) for expense stream
        const corpusNeeded = annualExpenseReq * ((1 - Math.pow(1 + realRate, -yearsInRetirement)) / realRate);

        // 3. Existing Assets Growth
        const fvSavings = currentSavings * Math.pow(1 + preRetireReturn / 100, yearsToRetire);
        const totalExistingFunds = fvSavings + lumpsumMaturity;

        // 4. Gap
        const shortfall = Math.max(0, corpusNeeded - totalExistingFunds);

        // 5. SIP Required
        const i = preRetireReturn / 100 / 12;
        const n = yearsToRetire * 12;
        const sipNeeded = shortfall > 0 ? shortfall / (((Math.pow(1 + i, n) - 1) / i) * (1 + i)) : 0;

        // 6. Readiness Score (0-100)
        // Ratio of (projected assets / needed corpus) adjusted for time
        const projectedAssetsWithSIP = totalExistingFunds + (shortfall > 0 ? 0 : 0);
        // A simple score: if shortfall is big, score is low.
        // Let's assume user saves 20% of income relative to expense? Rough heuristic.
        // Better: Score = (Projects Assets / Needed) * 100 (capped at 100)
        // But we don't know current SIP yet. Let's base it on "Difficulty to close gap"
        // Gap as multiple of Monthly Expense. 
        // If Gap is 0, score 100.
        // If SIP needed is > 50% of current expense (assuming income ~ expense * 1.5), it's hard.
        let readinessScore = 0;
        if (shortfall <= 0) readinessScore = 100;
        else {
            const sipToExpenseRatio = sipNeeded / monthlyExpense; // 15k sip / 50k exp = 0.3
            readinessScore = Math.max(0, 100 - (sipToExpenseRatio * 100 * 1.5));
        }

        // 7. Graph Data (Accumulation Phase)
        const accumulationChart = [];
        let balance = currentSavings;
        for (let y = 0; y <= yearsToRetire; y++) {
            accumulationChart.push({
                age: age + y,
                balance: Math.round(balance),
                target: Math.round((corpusNeeded / yearsToRetire) * y) // Rough linear guide
            });
            balance = balance * (1 + preRetireReturn / 100) + (sipNeeded * 12);
        }

        return {
            corpusNeeded: Math.round(corpusNeeded),
            fvTotalExpense: Math.round(fvTotalExpense),
            totalExistingFunds: Math.round(totalExistingFunds),
            shortfall: Math.round(shortfall),
            sipNeeded: Math.round(sipNeeded),
            readinessScore: Math.round(readinessScore),
            yearsToRetire,
            accumulationChart
        };

    }, [age, retireAge, lifeExpectancy, monthlyExpense, currentSavings, inflation, preRetireReturn, postRetireReturn, medicalInflation, otherIncomeMonth, lumpsumMaturity]);


    // Styles for Gauge/Score
    const getScoreColor = (s) => {
        if (s >= 80) return "text-green-500";
        if (s >= 50) return "text-amber-500";
        return "text-red-500";
    };

    const getScoreLabel = (s) => {
        if (s >= 80) return "Excellent";
        if (s >= 50) return "Moderate";
        return "Needs Attention";
    };

    const reportRef = useRef();

    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
            <SEO title="Retirement Intelligence Planner" description="AI-powered retirement calculator with longevity risk and inflation modeling." />

            {/* Header with Score */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                <div className="flex flex-col gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                            <User className="text-indigo-500" size={32} />
                            Retirement Planner
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">Map your journey to financial freedom.</p>
                    </div>
                    <DownloadReport title="Retirement Plan Report" contentRef={reportRef} />
                </div>

                {calculations && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase">Readiness Score</p>
                            <p className={`text-2xl font-black ${getScoreColor(calculations.readinessScore)}`}>
                                {calculations.readinessScore}/100
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-sm font-bold ${calculations.readinessScore >= 50 ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                            {getScoreLabel(calculations.readinessScore)}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-12 gap-8" ref={reportRef}>
                {/* --- LEFT: INPUTS --- */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Basic Profile */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-6">
                            <Calendar className="text-indigo-500" size={20} />
                            <h2 className="font-bold text-gray-900 dark:text-white">Life Timeline</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="input-label">My Age</label>
                                <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="input-field" />
                            </div>
                            <div>
                                <label className="input-label">Retire At</label>
                                <input type="number" value={retireAge} onChange={e => setRetireAge(Number(e.target.value))} className="input-field" />
                            </div>
                        </div>
                        <div>
                            <label className="input-label flex justify-between">Life Expectancy <span className="text-gray-400 font-normal">{lifeExpectancy} Yrs</span></label>
                            <input type="range" min="70" max="100" value={lifeExpectancy} onChange={e => setLifeExpectancy(Number(e.target.value))} className="w-full accent-indigo-500" />
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-6">
                            <DollarSign className="text-green-500" size={20} />
                            <h2 className="font-bold text-gray-900 dark:text-white">Finances</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="input-label">Monthly Expense (Current)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-400">₹</span>
                                    <input type="number" value={monthlyExpense} onChange={e => setMonthlyExpense(Number(e.target.value))} className="input-field pl-7" />
                                </div>
                            </div>
                            <div>
                                <label className="input-label">Current Retirement Savings</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-400">₹</span>
                                    <input type="number" value={currentSavings} onChange={e => setCurrentSavings(Number(e.target.value))} className="input-field pl-7" />
                                </div>
                            </div>
                        </div>

                        {/* Collapsible Advanced */}
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                            <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between text-xs font-bold text-indigo-500 uppercase">
                                <span>Advanced Settings</span>
                                {showAdvanced ? <Zap size={14} /> : <Zap size={14} className="opacity-50" />}
                            </button>

                            {showAdvanced && (
                                <div className="mt-4 space-y-4 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="input-label">Inflation (%)</label>
                                            <input type="number" value={inflation} onChange={e => setInflation(Number(e.target.value))} className="input-field" />
                                        </div>
                                        <div>
                                            <label className="input-label">Medical Inf. (%)</label>
                                            <input type="number" value={medicalInflation} onChange={e => setMedicalInflation(Number(e.target.value))} className="input-field" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="input-label">Pre-Retire ROI (%)</label>
                                            <input type="number" value={preRetireReturn} onChange={e => setPreRetireReturn(Number(e.target.value))} className="input-field" />
                                        </div>
                                        <div>
                                            <label className="input-label">Post-Retire ROI</label>
                                            <input type="number" value={postRetireReturn} onChange={e => setPostRetireReturn(Number(e.target.value))} className="input-field" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">Other Future Income (Pension/Rent)</label>
                                        <input type="number" value={otherIncomeMonth} onChange={e => setOtherIncomeMonth(Number(e.target.value))} className="input-field" placeholder="Monthly amount" />
                                    </div>
                                    <div>
                                        <label className="input-label">Maturity Lumpsum (EPF/Gratuity)</label>
                                        <input type="number" value={lumpsumMaturity} onChange={e => setLumpsumMaturity(Number(e.target.value))} className="input-field" placeholder="One-time amount" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: RESULTS --- */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Hero Card */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                            <div className="relative z-10">
                                <p className="opacity-80 font-bold uppercase tracking-wider text-xs mb-1">Target Corpus Needed</p>
                                <h2 className="text-4xl font-bold mb-1">₹ {(calculations?.corpusNeeded / 10000000).toFixed(2)} Cr</h2>
                                <p className="text-indigo-200 text-xs mt-1">
                                    To sustain ₹ {calculations?.fvTotalExpense.toLocaleString()}/mo inflation adjusted lifestyle till {lifeExpectancy}.
                                </p>
                            </div>

                            <div className="relative z-10 mt-8 pt-6 border-t border-indigo-500/30">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="opacity-80 font-bold uppercase tracking-wider text-xs mb-1">Monthly SIP Required</p>
                                        <h3 className="text-3xl font-bold">₹ {calculations?.sipNeeded.toLocaleString()}</h3>
                                    </div>
                                    {calculations?.shortfall <= 0 && (
                                        <div className="bg-green-400 text-indigo-900 px-3 py-1 rounded-full text-xs font-bold">
                                            Fully Funded
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Decorative Line Graph */}
                            <div className="absolute right-0 bottom-0 opacity-20 w-1/2">
                                <TrendingUp size={150} />
                            </div>
                        </div>

                        {/* Gap Analysis */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <AlertOctagon size={18} className="text-red-500" /> Fund Gap
                            </h3>

                            <div className="flex-1 flex flex-col justify-center gap-4 my-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                        <span>Projected Assets</span>
                                        <span>Target</span>
                                    </div>
                                    <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                                        <div
                                            style={{ width: `${Math.min(100, (calculations?.totalExistingFunds / calculations?.corpusNeeded) * 100)}%` }}
                                            className="bg-green-500 h-full"
                                        ></div>
                                    </div>
                                    <div className="mt-1 text-right text-xs text-green-600 font-bold">
                                        Covered: ₹ {(calculations?.totalExistingFunds / 10000000).toFixed(2)} Cr
                                    </div>
                                </div>

                                {calculations?.shortfall > 0 ? (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl flex items-center gap-3">
                                        <AlertTriangle className="text-red-500" size={24} />
                                        <div>
                                            <p className="text-xs text-red-600 dark:text-red-400 font-bold">Shortfall Detected</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">₹ {(calculations?.shortfall / 10000000).toFixed(2)} Cr Gap</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-xl flex items-center gap-3">
                                        <CheckCircle2 className="text-green-500" size={24} />
                                        <div>
                                            <p className="text-xs text-green-600 dark:text-green-400 font-bold">On Track</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Assets exceed target</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Projections Chart */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 min-h-[300px]">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-indigo-500" /> Corpus Trajectory
                        </h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={calculations?.accumulationChart}>
                                <defs>
                                    <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="age" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`} width={60} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(val) => `₹ ${(val / 100000).toFixed(2)} L`} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} />
                                <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} fill="url(#colorBal)" name="Corpus" />
                                <Area type="monotone" dataKey="target" stroke="#cbd5e1" strokeDasharray="5 5" fill="none" name="Target Track" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Insights */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 p-6 rounded-2xl">
                        <h4 className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2 mb-3">
                            <Info size={18} /> Financial Health Check
                        </h4>
                        <ul className="space-y-2 text-sm text-indigo-700 dark:text-indigo-400">
                            <li className="flex gap-2">
                                <ArrowRight size={16} className="mt-0.5 shrink-0" />
                                <span>Inflation of {inflation}% means your monthly expense of ₹50k will become <span className="font-bold">₹ {Math.round(calculations?.fvTotalExpense).toLocaleString()}</span> by retirement.</span>
                            </li>
                            {calculations?.shortfall > 0 && (
                                <li className="flex gap-2">
                                    <ArrowRight size={16} className="mt-0.5 shrink-0" />
                                    <span>To close the gap, consider increasing SIP by 10% annually or delaying retirement by 2 years.</span>
                                </li>
                            )}
                            <li className="flex gap-2">
                                <ArrowRight size={16} className="mt-0.5 shrink-0" />
                                <span>Longevity Risk: Corpus is planned till {lifeExpectancy} years. Consider a buffer for living longer.</span>
                            </li>
                        </ul>
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
                border-color: #6366f1;
                box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
              }
            `}</style>
        </div>
    );
}

export default RetirementPlanner;
