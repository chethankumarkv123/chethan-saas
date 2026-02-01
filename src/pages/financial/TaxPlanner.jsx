import React, { useState, useMemo, useRef } from 'react';
import { DownloadReport } from '../../components/DownloadReport';
import { SEO } from '../../components/SEO';
import {
    Calculator, Wallet, TrendingDown, Info, ShieldCheck,
    PieChart as PieChartIcon, Check, X, Building, ChevronDown, ChevronUp,
    Lightbulb, ArrowRight
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export function TaxPlanner() {
    // --- Core Income State ---
    const [income, setIncome] = useState(1500000);
    const [otherIncome, setOtherIncome] = useState(0);
    const [isSenior, setIsSenior] = useState(false);

    // --- Advanced Salary Breakdown State ---
    const [showSalaryBreakup, setShowSalaryBreakup] = useState(false);
    const [basic, setBasic] = useState(0);
    const [hraReceived, setHraReceived] = useState(0);
    const [rentPaid, setRentPaid] = useState(0);
    const [isMetro, setIsMetro] = useState(true);

    // --- Deductions State ---
    const [section80C, setSection80C] = useState(150000);
    const [section80D, setSection80D] = useState(25000);
    const [nps, setNps] = useState(50000);
    const [homeLoanInterest, setHomeLoanInterest] = useState(0);
    // HRA Exemption is calculated dynamically if breakdown exists, else manual input
    const [manualHraExemption, setManualHraExemption] = useState(0);

    const [showInvestmentMap, setShowInvestmentMap] = useState(false);

    // --- Calculations ---
    const calculations = useMemo(() => {
        const grossIncome = parseFloat(income) + parseFloat(otherIncome);

        // HRA Logic
        let hraExemption = parseFloat(manualHraExemption);
        if (showSalaryBreakup && basic > 0 && rentPaid > 0) {
            // Min of:
            // 1. Actual HRA Received
            // 2. Rent Paid - 10% of Basic
            // 3. 50% of Basic (Metro) or 40% (Non-Metro)
            const c1 = parseFloat(hraReceived);
            const c2 = parseFloat(rentPaid) - (0.10 * parseFloat(basic));
            const c3 = parseFloat(basic) * (isMetro ? 0.50 : 0.40);
            hraExemption = Math.max(0, Math.min(c1, c2, c3));
        }

        // --- NEW REGIME (FY 24-25 / 25-26) ---
        const stdDedNew = 75000;
        // In New Regime, Employer NPS contribution (80CCD(2)) is allowed deduction. 
        // For individual implementation simplicity, we just take Std Ded.
        const taxableNew = Math.max(0, grossIncome - stdDedNew);

        let taxNew = 0;
        if (taxableNew > 1500000) taxNew += (taxableNew - 1500000) * 0.30;
        if (taxableNew > 1200000) taxNew += Math.min(300000, Math.max(0, taxableNew - 1200000)) * 0.20;
        if (taxableNew > 1000000) taxNew += Math.min(200000, Math.max(0, taxableNew - 1000000)) * 0.15;
        if (taxableNew > 700000) taxNew += Math.min(300000, Math.max(0, taxableNew - 700000)) * 0.10;
        if (taxableNew > 300000) taxNew += Math.min(400000, Math.max(0, taxableNew - 300000)) * 0.05;
        if (taxableNew <= 700000) taxNew = 0; // 87A

        // --- OLD REGIME ---
        const stdDedOld = 50000;
        const totalDeductions = Math.min(150000, parseFloat(section80C)) +
            parseFloat(section80D) +
            parseFloat(hraExemption) +
            parseFloat(nps) +
            Math.min(200000, parseFloat(homeLoanInterest)) +
            stdDedOld;

        const taxableOld = Math.max(0, grossIncome - totalDeductions);

        let taxOld = 0;
        const limit1 = isSenior ? 300000 : 250000;
        if (taxableOld > 1000000) taxOld += (taxableOld - 1000000) * 0.30;
        if (taxableOld > 500000) taxOld += Math.min(500000, Math.max(0, taxableOld - 500000)) * 0.20;
        if (taxableOld > limit1) taxOld += Math.min(500000 - limit1, Math.max(0, taxableOld - limit1)) * 0.05;
        if (taxableOld <= 500000) taxOld = 0; // 87A

        const cessNew = taxNew * 0.04;
        const cessOld = taxOld * 0.04;
        const totalTaxNew = Math.round(taxNew + cessNew);
        const totalTaxOld = Math.round(taxOld + cessOld);

        const diff = Math.abs(totalTaxNew - totalTaxOld);
        const winner = totalTaxNew < totalTaxOld ? 'New Regime' : (totalTaxOld < totalTaxNew ? 'Old Regime' : 'Both Equal');
        const takeHomeAnnual = grossIncome - (winner === 'New Regime' ? totalTaxNew : totalTaxOld);

        return {
            grossIncome,
            new: { taxable: taxableNew, tax: totalTaxNew, deductions: stdDedNew },
            old: { taxable: taxableOld, tax: totalTaxOld, deductions: totalDeductions },
            diff,
            winner,
            hraExemption: Math.round(hraExemption),
            takeHomeAnnual: Math.round(takeHomeAnnual),
            takeHomeMonthly: Math.round(takeHomeAnnual / 12),
            effectiveTaxRate: ((Math.min(totalTaxNew, totalTaxOld) / grossIncome) * 100).toFixed(1)
        };
    }, [income, otherIncome, isSenior, basic, hraReceived, rentPaid, isMetro, showSalaryBreakup, section80C, section80D, nps, homeLoanInterest, manualHraExemption]);

    // Data for charts
    const chartData = [
        { name: 'Tax', New: calculations.new.tax, Old: calculations.old.tax },
        { name: 'Income', New: calculations.new.taxable, Old: calculations.old.taxable },
    ];

    const reportRef = useRef();

    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
            <SEO
                title="Smart Tax Planner 2025 - Optimize & Save"
                description="Advanced Income Tax Calculator with HRA helper, Investment mapping, and Old vs New regime analysis."
                keywords="income tax calculator, new tax regime, hra calculator, 80c investment, tax saving tips"
            />

            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3 mb-2">
                        <Wallet className="text-orange-500" size={32} />
                        Tax Planner 2025
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Smartest way to compare regimes & optimize savings.</p>
                </div>
                <DownloadReport title="Tax Comparison Report" contentRef={reportRef} />
            </div>

            <div className="grid lg:grid-cols-12 gap-8" ref={reportRef}>
                {/* --- LEFT COLUMN: INPUTS --- */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Basic Income Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">Income Sources</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Annual Salary (Gross)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-gray-400">₹</span>
                                    <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} className="w-full pl-8 p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl font-mono text-lg font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Other Income</label>
                                <input type="number" value={otherIncome} onChange={(e) => setOtherIncome(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl font-mono" />
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                                <input type="checkbox" checked={isSenior} onChange={(e) => setIsSenior(e.target.checked)} className="w-4 h-4 accent-orange-500" id="senior" />
                                <label htmlFor="senior" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Senior Citizen (60+)</label>
                            </div>
                        </div>

                        {/* HRA Helper Toggle */}
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                            <button onClick={() => setShowSalaryBreakup(!showSalaryBreakup)} className="text-sm font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                                {showSalaryBreakup ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                {showSalaryBreakup ? "Hide HRA Calculator" : "Calculate HRA Exemption"}
                            </button>

                            {showSalaryBreakup && (
                                <div className="mt-4 p-4 bg-orange-50 dark:bg-slate-900 rounded-xl space-y-3 animate-fade-in">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Basic Salary</label>
                                        <input type="number" value={basic} onChange={e => setBasic(Number(e.target.value))} className="w-full p-2 text-sm rounded bg-white dark:bg-slate-800 border dark:border-slate-700" placeholder="Annual Basic" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">HRA Received</label>
                                            <input type="number" value={hraReceived} onChange={e => setHraReceived(Number(e.target.value))} className="w-full p-2 text-sm rounded bg-white dark:bg-slate-800 border dark:border-slate-700" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Rent Paid</label>
                                            <input type="number" value={rentPaid} onChange={e => setRentPaid(Number(e.target.value))} className="w-full p-2 text-sm rounded bg-white dark:bg-slate-800 border dark:border-slate-700" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsMetro(true)} className={`flex-1 text-xs py-1 rounded font-bold ${isMetro ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>Metro (50%)</button>
                                        <button onClick={() => setIsMetro(false)} className={`flex-1 text-xs py-1 rounded font-bold ${!isMetro ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>Non-Metro</button>
                                    </div>
                                    <div className="text-right text-xs text-orange-700 dark:text-orange-400 font-bold">
                                        Exempt HRA: ₹ {calculations.hraExemption.toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Deductions Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Deductions</h2>
                            <span className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-gray-500">Old Regime Only</span>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: '80C (PPF/ELSS)', val: section80C, set: setSection80C, max: 150000 },
                                { label: '80D (Medical)', val: section80D, set: setSection80D, max: isSenior ? 50000 : 25000 },
                                { label: 'NPS (80CCD 1B)', val: nps, set: setNps, max: 50000 },
                                { label: 'Home Loan Int.', val: homeLoanInterest, set: setHomeLoanInterest, max: 200000 }
                            ].map((item, i) => (
                                <div key={i}>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex justify-between">
                                        {item.label}
                                        <span className="text-[10px] text-gray-400">Max ₹{(item.max / 1000).toFixed(0)}k</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={item.val}
                                        onChange={(e) => item.set(Number(e.target.value))}
                                        className={`w-full p-3 bg-gray-50 dark:bg-slate-900 border rounded-xl font-mono ${item.val > item.max ? 'border-red-400 text-red-500' : 'border-gray-200 dark:border-slate-700'}`}
                                    />
                                    {item.val > item.max && <p className="text-[10px] text-red-500 mt-1">Value exceeds limit. Capped at {item.max} for calculation.</p>}
                                </div>
                            ))}

                            {!showSalaryBreakup && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">HRA Exemption</label>
                                    <input type="number" value={manualHraExemption} onChange={e => setManualHraExemption(Number(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl font-mono" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: RESULTS --- */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Hero Result */}
                    <div className={`rounded-3xl p-8 text-white shadow-xl relative overflow-hidden transition-all duration-500 ${calculations.winner.includes('New') ? 'bg-gradient-to-br from-emerald-600 to-green-700' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
                        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <p className="text-white/80 font-bold uppercase tracking-wider text-xs mb-2">Recommended Strategy</p>
                                <h3 className="text-4xl font-black mb-2 flex items-center gap-3">
                                    {calculations.winner} <ShieldCheck size={32} />
                                </h3>
                                <p className="text-white/90 text-sm mb-6">
                                    {calculations.diff > 0
                                        ? `You save ₹ ${calculations.diff.toLocaleString()} annually.`
                                        : "Both regimes offer the same tax benefit."}
                                </p>
                                <div className="flex gap-4">
                                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                        <p className="text-[10px] uppercase opacity-70">Tax Payable</p>
                                        <p className="font-bold text-xl">₹ {Math.min(calculations.new.tax, calculations.old.tax).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                        <p className="text-[10px] uppercase opacity-70">Monthly In-Hand</p>
                                        <p className="font-bold text-xl">₹ {calculations.takeHomeMonthly.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Comparison Pill */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="opacity-80">New Regime Tax</span>
                                    <span className="font-mono font-bold">₹ {calculations.new.tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="opacity-80">Old Regime Tax</span>
                                    <span className="font-mono font-bold">₹ {calculations.old.tax.toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-white/20 my-2"></div>
                                <div className="flex justify-between items-center text-xs opacity-70">
                                    <span>Effective Tax Rate</span>
                                    <span>{calculations.effectiveTaxRate}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute right-[-30px] top-[-30px] opacity-10 rotate-12">
                            <Calculator size={350} />
                        </div>
                    </div>

                    {/* Chart Comparison */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 min-h-[300px]">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <TrendingDown size={18} /> Tax Comparison
                        </h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} />
                                <Legend />
                                <Bar dataKey="New" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} name="New Regime" />
                                <Bar dataKey="Old" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} name="Old Regime" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Investment & Optimization Panel */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Lightbulb className="text-amber-500" size={18} /> Optimization Tips
                            </h4>
                            <button onClick={() => setShowInvestmentMap(!showInvestmentMap)} className="text-xs font-bold text-blue-600 hover:underline">
                                {showInvestmentMap ? "Hide Investment Map" : "View Investment Opportunities"}
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Dynamic Tips */}
                            {calculations.winner === 'New Regime' && calculations.old.tax > calculations.new.tax && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                    To beat the New Regime, you need to claim additional deductions of roughly
                                    <span className="font-bold"> ₹ {(calculations.old.tax - calculations.new.tax).toLocaleString()}</span>.
                                </div>
                            )}

                            {section80C < 150000 && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg text-sm text-red-700 dark:text-red-300 flex justify-between items-center">
                                    <span>Short by ₹ {(150000 - section80C).toLocaleString()} in 80C.</span>
                                    <span className="font-bold text-xs uppercase cursor-pointer">Invest Now</span>
                                </div>
                            )}

                            {/* Investment Map */}
                            {showInvestmentMap && (
                                <div className="mt-4 grid grid-cols-3 gap-2 animate-fade-in">
                                    <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg text-center">
                                        <Building size={20} className="mx-auto mb-2 text-gray-400" />
                                        <p className="text-xs font-bold mb-1">ELSS Funds</p>
                                        <p className="text-[10px] text-gray-500">Lock-in: 3Y</p>
                                        <p className="text-[10px] text-green-500">High Returns</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg text-center">
                                        <ShieldCheck size={20} className="mx-auto mb-2 text-gray-400" />
                                        <p className="text-xs font-bold mb-1">PPF</p>
                                        <p className="text-[10px] text-gray-500">Lock-in: 15Y</p>
                                        <p className="text-[10px] text-blue-500">Risk Free</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg text-center">
                                        <Wallet size={20} className="mx-auto mb-2 text-gray-400" />
                                        <p className="text-xs font-bold mb-1">NPS</p>
                                        <p className="text-[10px] text-gray-500">Till 60</p>
                                        <p className="text-[10px] text-amber-500">Retirement</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                /* Custom scrollbar or specific styles if needed */
            `}</style>
        </div>
    );
}

export default TaxPlanner;
