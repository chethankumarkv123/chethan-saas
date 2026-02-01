
import React, { useState } from 'react';
import { SEO } from '../../components/SEO';
import { Home, Wallet, TrendingDown, Percent, Info } from 'lucide-react';

const CalcWrapper = ({ title, description, icon: Icon, children }) => (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto min-h-screen">
        <SEO
            title={`${title} - Free Financial Calculator`}
            description={description}
            keywords={`${title.toLowerCase()}, tax calculator 2025, home loan emi, retirement corpus, loan prepayment`}
        />
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3 mb-2">
                <Icon className="text-blue-600 dark:text-blue-400" size={32} />
                {title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8">
            {children}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 text-center">
                <p className="text-xs text-gray-400 bg-gray-50 dark:bg-slate-900 py-2 rounded-lg inline-block px-4">
                    Disclaimer: These results are estimates for planning only. Consult a qualified financial advisor or tax professional.
                </p>
            </div>
        </div>
    </div>
);

const ResultCard = ({ label, value, subtext, highlight = false, color = "blue" }) => (
    <div className={`p-4 rounded-xl ${highlight ? `bg-${color}-600 text-white` : 'bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white'}`}>
        <p className={`text-xs font-bold uppercase mb-1 ${highlight ? 'text-white/80' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-xl font-bold ${!highlight && 'text-gray-900 dark:text-white'}`}>{value}</p>
        {subtext && <p className={`text-xs mt-1 ${highlight ? 'text-white/70' : 'text-gray-400'}`}>{subtext}</p>}
    </div>
);

const InputGroup = ({ label, value, onChange, type = "number", suffix, help, min, max, step }) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex justify-between items-center">
            {label}
            {help && <span className="text-[10px] font-normal text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{help}</span>}
        </label>
        <div className="relative">
            <input
                type={type}
                inputMode="decimal"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={min}
                max={max}
                step={step}
                className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {suffix && (
                <span className="absolute right-4 top-3 text-gray-400 text-sm font-medium pointer-events-none">{suffix}</span>
            )}
        </div>
    </div>
);

// --- 2. Home Loan EMI ---
export function HomeLoanCalculator() {
    const [amount, setAmount] = useState(3000000);
    const [rate, setRate] = useState(8.5);
    const [years, setYears] = useState(20);
    const [result, setResult] = useState(null);

    const calculate = () => {
        const P = parseFloat(amount);
        const r = parseFloat(rate) / 12 / 100;
        const n = parseFloat(years) * 12;

        if (P > 0 && r >= 0 && n > 0) {
            let emi = 0;
            if (r === 0) { // 0% interest edge case
                emi = P / n;
            } else {
                emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            }
            const totalPaid = emi * n;

            setResult({
                emi: Math.round(emi),
                totalInterest: Math.round(totalPaid - P),
                totalPayment: Math.round(totalPaid)
            });
        }
    };

    return (
        <CalcWrapper title="Home Loan EMI Calculator" description="Simple EMI calculator with interest breakdown." icon={Home}>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <InputGroup label="Loan Amount (₹)" value={amount} onChange={setAmount} />
                    <InputGroup label="Interest Rate (%)" value={rate} onChange={setRate} suffix="%" step="0.1" />
                    <InputGroup label="Loan Tenure (Years)" value={years} onChange={setYears} suffix="Yr" />
                    <button onClick={calculate} className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                        Calculate EMI
                    </button>
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                        <span className="font-bold flex items-center gap-2 block mb-1"><Info size={14} /> Compare Scenarios?</span>
                        Try the <a href="/loan-calculator" className="underline font-bold hover:text-blue-900">Advanced Loan Calculator</a> for prepayments and amortization schedules.
                    </div>
                </div>
                <div>
                    {result ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-blue-600 text-white p-6 rounded-2xl text-center shadow-lg shadow-blue-500/20">
                                <p className="text-sm font-bold opacity-80 mb-1">Monthly EMI</p>
                                <p className="text-4xl font-bold">₹ {result.emi.toLocaleString()}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <ResultCard label="Total Interest" value={`₹ ${(result.totalInterest / 100000).toFixed(2)} L`} />
                                <ResultCard label="Total Payment" value={`₹ ${(result.totalPayment / 100000).toFixed(2)} L`} />
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                            Enter loan details
                        </div>
                    )}
                </div>
            </div>
        </CalcWrapper>
    );
}

// --- 5. Income Tax Calculator (India) ---
export function IncomeTaxCalculator() {
    const [income, setIncome] = useState(1200000);
    const [deductions, setDeductions] = useState(150000);
    const [isSenior, setIsSenior] = useState(false);
    const [result, setResult] = useState(null);

    const calculateTax = () => {
        const taxableOld = Math.max(0, income - deductions - 50000); // Standard Deduction 50k for Old
        const taxableNew = Math.max(0, income - 75000); // Standard Deduction 75k for New (Bud 2024)

        // --- New Regime (FY 2024-25) ---
        let taxNew = 0;
        if (taxableNew > 1500000) taxNew += (taxableNew - 1500000) * 0.30;
        if (taxableNew > 1200000) taxNew += Math.min(300000, Math.max(0, taxableNew - 1200000)) * 0.20;
        if (taxableNew > 1000000) taxNew += Math.min(200000, Math.max(0, taxableNew - 1000000)) * 0.15;
        if (taxableNew > 700000) taxNew += Math.min(300000, Math.max(0, taxableNew - 700000)) * 0.10;
        if (taxableNew > 300000) taxNew += Math.min(400000, Math.max(0, taxableNew - 300000)) * 0.05;

        // Rebate 87A (New): Tax is 0 if Taxable Income <= 7L
        if (taxableNew <= 700000) taxNew = 0;

        // --- Old Regime ---
        let taxOld = 0;
        const basicExemption = isSenior ? 300000 : 250000; // 3L for Senior, 2.5L Normal

        if (taxableOld > 1000000) taxOld += (taxableOld - 1000000) * 0.30;
        if (taxableOld > 500000) taxOld += Math.min(500000, Math.max(0, taxableOld - 500000)) * 0.20;
        if (taxableOld > basicExemption) taxOld += Math.min(500000 - basicExemption, Math.max(0, taxableOld - basicExemption)) * 0.05;

        // Rebate 87A (Old): Tax is 0 if Taxable Income <= 5L
        if (taxableOld <= 500000) taxOld = 0;

        // --- Surcharge (Income > 50L) ---
        // Simplified Surcharge approximation
        const getSurchargeRate = (inc) => {
            if (inc > 5000000 && inc <= 10000000) return 0.10;
            if (inc > 10000000 && inc <= 20000000) return 0.15;
            if (inc > 20000000) return 0.25;
            return 0;
        };
        const surRate = getSurchargeRate(income);

        taxNew += taxNew * surRate;
        taxOld += taxOld * surRate;

        // --- Cess 4% ---
        const taxNewFinal = taxNew * 1.04;
        const taxOldFinal = taxOld * 1.04;

        setResult({
            oldRegime: Math.round(taxOldFinal),
            newRegime: Math.round(taxNewFinal),
            diff: Math.abs(Math.round(taxOldFinal - taxNewFinal)),
            better: taxNewFinal < taxOldFinal ? "New Regime" : (taxOldFinal < taxNewFinal ? "Old Regime" : "Equal"),
            surchargeApplied: surRate > 0
        });
    };

    return (
        <CalcWrapper title="Income Tax Calculator (FY 2024-25)" description="Compare Old vs New Tax Regime with Surcharge." icon={Wallet}>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <InputGroup label="Annual Gross Income (₹)" value={income} onChange={setIncome} help="Salary + Other Sources" />
                    <InputGroup label="Deductions (₹)" value={deductions} onChange={setDeductions} help="80C, 80D, HRA (Old Regime only)" />

                    <div className="mb-6 flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <input
                            type="checkbox"
                            checked={isSenior}
                            onChange={(e) => setIsSenior(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                            id="senior-check"
                        />
                        <label htmlFor="senior-check" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                            Senior Citizen (60+ Years)
                        </label>
                    </div>

                    <button onClick={calculateTax} className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                        Compare Tax Regimes
                    </button>
                    <p className="text-xs text-gray-400 mt-2">* Auto-applies Standard Deduction (₹75k New / ₹50k Old) and 4% Cess.</p>
                </div>
                <div>
                    {result ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className={`p-6 rounded-2xl text-center text-white shadow-lg ${result.better === "New Regime" ? 'bg-green-600' : (result.better === "Old Regime" ? 'bg-blue-600' : 'bg-gray-600')}`}>
                                <p className="opacity-90 font-bold mb-1">Best Choice</p>
                                <h3 className="text-3xl font-bold mb-2">{result.better}</h3>
                                {result.diff > 0 && <p className="text-sm opacity-80">Save ₹ {result.diff.toLocaleString()}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <ResultCard label="New Regime Tax" value={`₹ ${result.newRegime.toLocaleString()}`} highlight={result.better === "New Regime"} color="green" />
                                <ResultCard label="Old Regime Tax" value={`₹ ${result.oldRegime.toLocaleString()}`} highlight={result.better === "Old Regime"} color="blue" />
                            </div>
                            {result.surchargeApplied && (
                                <p className="text-xs text-center text-amber-600 font-bold">Includes Surcharge on base tax.</p>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                            Calculate tax for FY 2024-25
                        </div>
                    )}
                </div>
            </div>
        </CalcWrapper>
    );
}

// --- 7. Loan Prepayment ---
export function PrepaymentCalculator() {
    const [amount, setAmount] = useState(5000000);
    const [rate, setRate] = useState(9);
    const [tenure, setTenure] = useState(20);
    const [prepay, setPrepay] = useState(500000);
    const [result, setResult] = useState(null);

    const calculate = () => {
        const P = parseFloat(amount);
        const r = parseFloat(rate) / 12 / 100;
        const n = parseFloat(tenure) * 12;

        if (P > 0 && r > 0 && n > 0 && prepay > 0) {
            const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            const totalInterestOriginal = (emi * n) - P;

            // Simulate Prepayment:
            // Assume prepayment reduces Principal effectively at Start (simplified for calculator.net style "Impact")
            // Or better: Assume it happens at end of Month 1.
            const P_remaining = P - prepay;

            // New tenure
            // n = -log(1 - (r*P)/EMI) / log(1+r)
            const numerator = emi / (emi - (P_remaining * r));
            let newMonths = 0;
            if (numerator > 0) {
                newMonths = Math.log(numerator) / Math.log(1 + r);
            }

            const totalAmountNew = (emi * newMonths) + prepay; // EMI * NewMonths + The Prepayment Itself
            // Wait, "Total Interest" logic:
            // Original Interest = TotalPaid - Principal
            // New Interest = (EMI * NewMonths) - P_remaining
            // Savings = TotalInterestOriginal - NewInterest
            const totalInterstNew = (emi * newMonths) - P_remaining;

            const savings = Math.max(0, totalInterestOriginal - totalInterstNew);

            setResult({
                saved: Math.round(savings),
                timeSaved: Math.max(0, Math.round(n - newMonths))
            });
        }
    };

    return (
        <CalcWrapper title="Prepayment Calculator" description="Calculate interest savings from a one-time prepayment." icon={TrendingDown}>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <InputGroup label="Original Loan Amount (₹)" value={amount} onChange={setAmount} />
                    <InputGroup label="Interest Rate (%)" value={rate} onChange={setRate} suffix="%" step="0.1" />
                    <InputGroup label="Original Tenure (Years)" value={tenure} onChange={setTenure} suffix="Yr" />
                    <InputGroup label="One-time Prepayment (₹)" value={prepay} onChange={setPrepay} help="Amount to pay extra" />

                    <button onClick={calculate} className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                        Calculate Savings
                    </button>
                    <p className="text-xs text-gray-400 mt-2">* Assumption: Prepayment is made early in the loan tenure to maximize savings.</p>
                </div>
                <div>
                    {result ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-green-600 text-white p-6 rounded-2xl text-center shadow-lg">
                                <p className="text-sm font-bold opacity-80 mb-1">Interest Saved</p>
                                <p className="text-4xl font-bold">₹ {result.saved.toLocaleString()}</p>
                            </div>
                            <ResultCard
                                label="Time Saved"
                                value={`${Math.floor(result.timeSaved / 12)} Years ${Math.round(result.timeSaved % 12)} Months`}
                                subtext="Loan tenure reduction"
                                highlight
                                color="blue"
                            />
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                            Enter details to see savings
                        </div>
                    )}
                </div>
            </div>
        </CalcWrapper>
    );
}

// --- 8. Retirement Calculator ---
export function RetirementCalculator() {
    const [age, setAge] = useState(30);
    const [retireAge, setRetireAge] = useState(60);
    const [monthlyExpense, setMonthlyExpense] = useState(50000);
    const [inflation, setInflation] = useState(6);
    const [returns, setReturns] = useState(10);

    const [result, setResult] = useState(null);

    const calculate = () => {
        const yearsToRetire = parseFloat(retireAge) - parseFloat(age);
        if (yearsToRetire <= 0) return;

        const expenseAnnual = parseFloat(monthlyExpense) * 12;

        // FV of expense at retirement
        const fvExpense = expenseAnnual * Math.pow(1 + (parseFloat(inflation) / 100), yearsToRetire);

        // Corpus Rule: Rule of 25 (Standard: 25x Annual Expense for 30 years survival @ 4% withdrawal)
        const corpusNeeded = fvExpense * 25;

        // Monthly SIP needed
        const i = parseFloat(returns) / 100 / 12;
        const n = yearsToRetire * 12;
        const sipNeeded = corpusNeeded / (((Math.pow(1 + i, n) - 1) / i) * (1 + i));

        setResult({
            corpus: Math.round(corpusNeeded),
            monthly: Math.round(sipNeeded),
            monthlyExpenseRetirement: Math.round(fvExpense / 12)
        });
    };

    return (
        <CalcWrapper title="Retirement Calculator" description="Estimate retirement corpus using Rule of 25." icon={Wallet}>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Current Age" value={age} onChange={setAge} />
                        <InputGroup label="Retire Age" value={retireAge} onChange={setRetireAge} />
                    </div>
                    <InputGroup label="Current Monthly Expense (₹)" value={monthlyExpense} onChange={setMonthlyExpense} help="Expenses to cover in retirement" />
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Inflation (%)" value={inflation} onChange={setInflation} suffix="%" />
                        <InputGroup label="Exp Return (%)" value={returns} onChange={setReturns} suffix="%" help="Pre-retirement" />
                    </div>
                    <button onClick={calculate} className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                        Calculate Plan
                    </button>
                    <p className="text-xs text-gray-400 mt-2">* Uses standard "Rule of 25" to estimate corpus needed for ~30 years post-retirement.</p>
                </div>
                <div>
                    {result ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-indigo-600 text-white p-6 rounded-2xl text-center shadow-lg">
                                <p className="text-sm font-bold opacity-80 mb-1">Required Corpus</p>
                                <p className="text-3xl font-bold">₹ {(result.corpus / 10000000).toFixed(2)} Cr</p>
                                <p className="text-xs mt-2 opacity-70">To sustain a lifestyle of ₹ {(result.monthlyExpenseRetirement / 1000).toFixed(0)}k/mo (inflation adjusted)</p>
                            </div>
                            <ResultCard label="SIP Investment Needed" value={`₹ ${result.monthly.toLocaleString()}`} highlight subtext="@ Assumed Return Rate" />
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                            Plan your retirement early
                        </div>
                    )}
                </div>
            </div>
        </CalcWrapper>
    );
}
