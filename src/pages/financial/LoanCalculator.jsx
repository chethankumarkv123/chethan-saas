import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DownloadReport } from '../../components/DownloadReport';
import {
    Calculator,
    DollarSign,
    Calendar,
    Percent,
    TrendingDown,
    Printer,
    Download,
    FileText,
    Share2,
    PieChart as PieChartIcon,
    Activity,
    IndianRupee,
    Landmark
} from 'lucide-react';
import { SEO } from '../../components/SEO';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';

export function LoanCalculator() {
    // State
    const [amount, setAmount] = useState(500000);
    const [rate, setRate] = useState(8.5);
    const [tenure, setTenure] = useState(60); // months
    const [tenureType, setTenureType] = useState('months');

    // Prepayment State
    const [prepayment, setPrepayment] = useState(0);
    const [prepaymentFreq, setPrepaymentFreq] = useState('monthly'); // monthly, yearly, one-time

    // Results State
    const [results, setResults] = useState(null);
    const [schedule, setSchedule] = useState([]);
    // const [chartData, setChartData] = useState([]); // This will be replaced by useMemo

    // Load from URL params on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('amount')) setAmount(Number(params.get('amount')));
        if (params.get('rate')) setRate(Number(params.get('rate')));
        if (params.get('tenure')) setTenure(Number(params.get('tenure')));
        if (params.get('prepayment')) setPrepayment(Number(params.get('prepayment')));
    }, []);

    // Calculate on Input Change
    useEffect(() => {
        calculateLoan();
        // Update URL (debounced would be better but this is simple enough for now)
        const params = new URLSearchParams();
        params.set('amount', amount);
        params.set('rate', rate);
        params.set('tenure', tenure);
        if (prepayment > 0) params.set('prepayment', prepayment);
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }, [amount, rate, tenure, tenureType, prepayment, prepaymentFreq]);

    const calculateLoan = () => {
        const principal = parseFloat(amount) || 0;
        const annualRate = parseFloat(rate) || 0;
        const t = parseFloat(tenure) || 0;

        if (principal <= 0 || t <= 0) {
            setResults(null);
            setSchedule([]);
            // setChartData([]); // This will be replaced by useMemo
            return;
        }

        const totalMonths = tenureType === 'years' ? t * 12 : t;
        const monthlyRate = annualRate / 12 / 100;

        let emi = 0;
        if (annualRate === 0) {
            emi = principal / totalMonths;
        } else {
            emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
        }

        let balance = principal;
        let totalInterest = 0;
        let totalPaid = 0;
        let totalPrincipalPaid = 0; // Track total principal paid for chart
        const newSchedule = [];
        // const newChartData = []; // This will be replaced by useMemo

        // Generate Schedule
        for (let month = 1; month <= totalMonths * 2; month++) {
            if (balance <= 0.01) break;

            const interestPayment = balance * monthlyRate;
            let principalPayment = emi - interestPayment;

            // Apply Prepayment
            let extra = 0;
            if (prepayment > 0) {
                if (prepaymentFreq === 'monthly') extra = parseFloat(prepayment);
                else if (prepaymentFreq === 'yearly' && month % 12 === 0) extra = parseFloat(prepayment);
                else if (prepaymentFreq === 'one-time' && month === 1) extra = parseFloat(prepayment);
            }

            if (principalPayment + extra > balance) {
                extra = balance - principalPayment;
                if (extra < 0) {
                    principalPayment = balance;
                    extra = 0;
                }
            }

            balance = balance - principalPayment - extra;
            if (balance < 0.01) balance = 0;

            totalInterest += interestPayment;
            totalPrincipalPaid += principalPayment + extra; // Accumulate principal paid
            const monthTotal = principalPayment + interestPayment + extra;
            totalPaid += monthTotal;

            newSchedule.push({
                month,
                principal: principalPayment + extra,
                interest: interestPayment,
                balance,
                totalPayment: monthTotal,
                totalInterest: totalInterest, // Add total interest to schedule for chart
                totalPrincipal: totalPrincipalPaid // Add total principal paid for chart
            });

            // Downsample for chart if too many months (every 6 months or 1 year if long)
            // This logic is now handled by useMemo
            // if (totalMonths <= 60 || month % 6 === 0 || balance === 0) {
            //     newChartData.push({
            //         month,
            //         balance: Math.round(balance),
            //         interestPaid: Math.round(totalInterest),
            //         principalPaid: Math.round(totalPaid - totalInterest)
            //     });
            // }
        }

        const calculatedResults = {
            emi: emi,
            totalInterest: totalInterest,
            totalAmount: totalPaid,
            payoffMonths: newSchedule.length,
            savings: 0
        };

        if (prepayment > 0 && annualRate > 0) {
            const baseTotalMonths = totalMonths;
            const baseEmi = (principal * monthlyRate * Math.pow(1 + monthlyRate, baseTotalMonths)) / (Math.pow(1 + monthlyRate, baseTotalMonths) - 1);
            const baseTotalInterest = (baseEmi * baseTotalMonths) - principal;
            calculatedResults.savings = Math.max(0, baseTotalInterest - totalInterest);
            calculatedResults.timeSaved = Math.max(0, baseTotalMonths - newSchedule.length);
        }

        setResults(calculatedResults);
        setSchedule(newSchedule);
        // setChartData(newChartData); // This will be replaced by useMemo
    };

    const exportToCSV = () => {
        if (!schedule.length) return;
        const csv = Papa.unparse(schedule);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'loan_schedule.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        if (!schedule.length || !results) return;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(41, 128, 185);
        doc.text("Loan Amortization Schedule", 14, 22);

        // Summary
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Loan Amount: ${amount.toLocaleString()}`, 14, 45);
        doc.text(`Interest Rate: ${rate}%`, 80, 45);
        doc.text(`Monthly EMI: ${results.emi.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 140, 45);

        doc.text(`Total Interest: ${results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 14, 55);
        doc.text(`Total Payment: ${results.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 80, 55);
        if (results.savings > 0) {
            doc.setTextColor(0, 150, 0);
            doc.text(`Savings: ${results.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 140, 55);
        }

        // Table
        doc.autoTable({
            startY: 65,
            head: [['Month', 'Principal', 'Interest', 'Total Payment', 'Balance']],
            body: schedule.map(row => [
                row.month,
                Math.round(row.principal).toLocaleString(),
                Math.round(row.interest).toLocaleString(),
                Math.round(row.totalPayment).toLocaleString(),
                Math.round(row.balance).toLocaleString()
            ]),
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 8, cellPadding: 2 }
        });

        doc.save('loan_schedule.pdf');
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    };

    const handlePrint = () => {
        window.print();
    };

    const COLORS = ['#3B82F6', '#F59E0B']; // Blue for Principal, Orange for Interest

    const chartData = useMemo(() => {
        return schedule.filter((_, i) => i % 12 === 0 || i === schedule.length - 1).map(row => ({
            year: Math.floor(row.month / 12) + (row.month % 12 === 0 ? 0 : 1), // Start years from 1
            balance: Math.round(row.balance),
            interestPaid: Math.round(row.totalInterest),
            principalPaid: Math.round(row.totalPrincipal)
        }));
    }, [schedule]);

    const reportRef = useRef();

    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
            <SEO
                title="Advanced Loan Calculator - EMI & Prepayment"
                description="Calculate EMI, plan prepayments, and analyze amortization schedules for Home, Car, and Personal loans."
                keywords="loan calculator, emi calculator, prepayment calculator, amortization schedule, home loan tax benefit"
            />

            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3 mb-2">
                        <Landmark className="text-blue-600 dark:text-blue-400" size={32} />
                        Advanced Loan Planner
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Master your debt with smart planning.</p>
                </div>
                <DownloadReport title="Loan Report" contentRef={reportRef} />
            </div>

            <div className="grid lg:grid-cols-12 gap-8" ref={reportRef}>
                {/* Inputs */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            Loan Details
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Loan Amount</label>
                                <div className="relative">
                                    <IndianRupee size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        className="w-full pl-9 p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Interest Rate (%)</label>
                                    <div className="relative">
                                        <Percent size={14} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            value={rate}
                                            step="0.1"
                                            onChange={(e) => setRate(Number(e.target.value))}
                                            className="w-full pl-8 p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tenure</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            value={tenure}
                                            onChange={(e) => setTenure(Number(e.target.value))}
                                            className="flex-1 min-w-0 p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                        />
                                        <select
                                            value={tenureType}
                                            onChange={(e) => setTenureType(e.target.value)}
                                            className="bg-gray-100 dark:bg-slate-700 rounded-xl px-2 text-sm outline-none cursor-pointer"
                                        >
                                            <option value="months">Months</option>
                                            <option value="years">Years</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Prepayment Section */}
                            <div className="pt-6 border-t border-gray-100 dark:border-slate-700 border-dashed">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-3 flex justify-between items-center bg-gray-50 dark:bg-slate-900 p-2 rounded">
                                    Extra Pre-payment
                                    <span className="text-blue-500 text-[10px] bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">OPTIONAL</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2 relative">
                                        <IndianRupee size={14} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            value={prepayment}
                                            onChange={(e) => setPrepayment(Number(e.target.value))}
                                            placeholder="Extra 0"
                                            className="w-full pl-8 p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none font-mono"
                                        />
                                    </div>
                                    <select
                                        value={prepaymentFreq}
                                        onChange={(e) => setPrepaymentFreq(e.target.value)}
                                        className="bg-gray-100 dark:bg-slate-700 rounded-xl px-2 text-xs outline-none cursor-pointer"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="one-time">One-time</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 no-print">
                        <h4 className="font-bold flex items-center gap-2 mb-2">
                            <Activity size={16} /> Did you know?
                        </h4>
                        <p className="opacity-90 leading-relaxed text-xs">
                            Increasing your EMI by just 5% each year can reduce your loan tenure by nearly 40%. Try adding a small monthly prepayment!
                        </p>
                    </div>
                </div>

                {/* Results & Visuals */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-lg shadow-blue-500/20">
                            <p className="text-blue-100 text-xs font-bold mb-2 uppercase tracking-wider opacity-80">Monthly EMI</p>
                            <h3 className="text-3xl font-bold font-mono">₹{results ? results.emi.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}</h3>
                            <p className="text-xs text-blue-200 mt-2">Per Month</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                            <p className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-wider">Total Interest</p>
                            <h3 className="text-2xl font-bold text-orange-500 font-mono">₹{results ? results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}</h3>
                            <p className="text-xs text-gray-400 mt-2">{results ? ((results.totalInterest / results.totalAmount) * 100).toFixed(1) : 0}% of Total</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                            <p className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-wider">Total Payable</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-mono">₹{results ? results.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}</h3>
                            <p className="text-xs text-gray-400 mt-2">Principal + Interest</p>
                        </div>
                    </div>

                    {/* Savings Alert */}
                    {results && results.savings > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-200 dark:border-green-800 rounded-xl p-5 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full text-green-600 dark:text-green-300 shadow-sm">
                                <TrendingDown size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-green-800 dark:text-green-300 text-lg">You save ₹ {results.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}!</h4>
                                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                    By paying extra, you finish your loan <strong>{results.timeSaved} months earlier</strong>.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Charts Section */}
                    {results && (
                        <div className="grid md:grid-cols-2 gap-6 no-print">
                            {/* Breakdown Chart */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center">
                                <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-4 flex items-center gap-2 w-full">
                                    <PieChartIcon size={16} /> Breakup
                                </h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Principal', value: amount },
                                                    { name: 'Interest', value: results.totalInterest }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {COLORS.map((color, index) => (
                                                    <Cell key={`cell-${index}`} fill={color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Balance Graph */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                                <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-4 flex items-center gap-2">
                                    <Activity size={16} /> Loan Balance Trend
                                </h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                            <XAxis
                                                dataKey="month"
                                                tick={{ fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                                label={{ value: 'Months', position: 'insideBottomRight', offset: -5, fontSize: 10 }}
                                            />
                                            <YAxis
                                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                                tick={{ fontSize: 10 }}
                                                tickLine={false}
                                                axisLine={false}
                                                width={40}
                                            />
                                            <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                            <Area
                                                type="monotone"
                                                dataKey="balance"
                                                stroke="#3B82F6"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorBalance)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Schedule Table */}
                    {schedule.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-slate-900 gap-4">
                                <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                    <Calendar size={18} /> Amortization Schedule
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={exportToPDF} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium">
                                        <FileText size={16} /> PDF
                                    </button>
                                    <button onClick={exportToCSV} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium">
                                        <Download size={16} /> CSV
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-10 shadow-sm text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold text-gray-500">Month</th>
                                            <th className="px-4 py-3 font-semibold text-gray-500">Principal</th>
                                            <th className="px-4 py-3 font-semibold text-gray-500">Interest</th>
                                            <th className="px-4 py-3 font-semibold text-gray-500">Total</th>
                                            <th className="px-4 py-3 font-semibold text-gray-500 text-right">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                        {schedule.map((row) => (
                                            <tr key={row.month} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">{row.month}</td>
                                                <td className="px-4 py-3 text-green-600 font-mono">₹{row.principal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                <td className="px-4 py-3 text-orange-600 font-mono">₹{row.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono">₹{row.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                <td className="px-4 py-3 text-gray-900 dark:text-white font-mono text-right font-medium">₹{row.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .printable-content { padding: 0 !important; width: 100% !important; max-width: none !important; margin: 0 !important; }
                    body { background: white !important; color: black !important; }
                    .shadow-sm, .shadow-lg { box-shadow: none !important; border: 1px solid #ddd !important; }
                }
            `}</style>
        </div>
    );
}

