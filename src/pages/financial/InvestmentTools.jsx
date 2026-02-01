
import React, { useState } from 'react';

import { Calculator, TrendingUp, PiggyBank, Percent, AlertCircle } from 'lucide-react';
import { SEO } from '../../components/SEO';

// --- Shared Components ---
const CalcWrapper = ({ title, description, icon: Icon, children }) => (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto min-h-screen">
        <SEO
            title={`${title} - Free Online Financial Tool`}
            description={description}
            keywords={`${title.toLowerCase()}, financial calculator, investment return, cagr, ppf, fd interest, sip return`}
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
                    Disclaimer: These figures are estimates for planning purposes only. Interest rates and tax rules are subject to change.
                </p>
            </div>
        </div>
    </div>
);

const ResultCard = ({ label, value, subtext, highlight = false }) => (
    <div className={`p-4 rounded-xl ${highlight ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white'}`}>
        <p className={`text-xs font-bold uppercase mb-1 ${highlight ? 'text-blue-100' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-xl font-bold ${!highlight && 'text-gray-900 dark:text-white'}`}>{value}</p>
        {subtext && <p className={`text-xs mt-1 ${highlight ? 'text-blue-200' : 'text-gray-400'}`}>{subtext}</p>}
    </div>
);

const InputGroup = ({ label, value, onChange, type = "number", suffix, error, helper }) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
        <div className="relative">
            <input
                type={type}
                inputMode="decimal"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full p-3 bg-gray-50 dark:bg-slate-900 border ${error ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-colors`}
            />
            {suffix && (
                <span className="absolute right-4 top-3 text-gray-400 text-sm font-medium pointer-events-none">{suffix}</span>
            )}
        </div>
        {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {error}</p>}
        {helper && !error && <p className="text-xs text-gray-400 mt-1">{helper}</p>}
    </div>
);

// --- 1. SIP Calculator ---
export function SipCalculator() {
    const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(10);
    const [inflation, setInflation] = useState(6);
    const [adjustInflation, setAdjustInflation] = useState(false);
    const [result, setResult] = useState(null);

    const calculate = () => {
        const p = parseFloat(monthlyInvestment) || 0;
        const r = parseFloat(rate) || 0;
        const t = parseFloat(years) || 0;
        const inf = parseFloat(inflation) || 0;

        if (p <= 0 || t <= 0) return;

        const i = r / 100 / 12;
        const n = t * 12;

        // FV = P * [ (1+i)^n - 1 ] * (1+i) / i
        let fv = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        const totalInvested = p * n;

        // Inflation Adjustment (Deflating future value to today's purchasing power)
        let realValue = fv;
        if (adjustInflation) {
            realValue = fv / Math.pow(1 + inf / 100, t);
        }

        setResult({
            invested: Math.round(totalInvested),
            value: Math.round(fv),
            returns: Math.round(fv - totalInvested),
            realValue: Math.round(realValue)
        });
    };

    return (
        <CalcWrapper title="SIP Calculator" description="Estimate the future value of your Systematic Investment Plan." icon={TrendingUp}>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <InputGroup label="Monthly Investment (₹)" value={monthlyInvestment} onChange={setMonthlyInvestment} />
                    <InputGroup label="Expected Annual Return (%)" value={rate} onChange={setRate} suffix="%" />
                    <InputGroup label="Time Period (Years)" value={years} onChange={setYears} suffix="Yr" />

                    <div className="mb-6 flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <input
                            type="checkbox"
                            checked={adjustInflation}
                            onChange={(e) => setAdjustInflation(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                            id="inf-check"
                        />
                        <label htmlFor="inf-check" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                            Adjust for Inflation
                        </label>
                    </div>

                    {adjustInflation && (
                        <div className="mb-4 animate-fade-in">
                            <InputGroup label="Expected Inflation (%)" value={inflation} onChange={setInflation} suffix="%" helper="Avg inflation is 6-7%" />
                        </div>
                    )}

                    <button onClick={calculate} className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                        Calculate Value
                    </button>
                    <p className="text-xs text-gray-400 mt-3">* Assumes monthly compounding & payments.</p>
                </div>
                <div>
                    {result ? (
                        <div className="space-y-4 animate-fade-in">
                            <ResultCard label="Total Invested" value={`₹ ${result.invested.toLocaleString()}`} />
                            <ResultCard label="Estimated Gains" value={`₹ ${result.returns.toLocaleString()}`} />
                            <ResultCard
                                label={adjustInflation ? "Real Value (Today's Worth)" : "Future Value"}
                                value={`₹ ${(adjustInflation ? result.realValue : result.value).toLocaleString()}`}
                                subtext={adjustInflation ? `Nominal Value: ₹ ${result.value.toLocaleString()}` : undefined}
                                highlight
                            />
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                            Enter details to see projection
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 text-left">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">FAQ</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">What is SIP?</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Systematic Investment Plan (SIP) allows investing small amounts periodically in mutual funds. It benefits from Rupee Cost Averaging.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Does this adjust for inflation?</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Yes, if enabled, we discount the final amount by the inflation rate to show "today's purchasing power value".</p>
                    </div>
                </div>
            </div>
        </CalcWrapper>
    );
}

// --- 3. FD Calculator ---
export function FdCalculator() {
    const [principal, setPrincipal] = useState(100000);
    const [rate, setRate] = useState(6.5);
    const [years, setYears] = useState(5);
    const [compounding, setCompounding] = useState(4); // 4 = quarterly
    const [result, setResult] = useState(null);

    const calculate = () => {
        const P = parseFloat(principal);
        const r = parseFloat(rate) / 100;
        const n = parseFloat(compounding);
        const t = parseFloat(years);

        if (P <= 0 || t <= 0) return;

        // A = P(1 + r/n)^(nt)
        const Amount = P * Math.pow((1 + (r / n)), (n * t));

        setResult({
            principal: Math.round(P),
            maturity: Math.round(Amount),
            interest: Math.round(Amount - P)
        });
    };

    return (
        <CalcWrapper title="FD Calculator" description="Calculate maturity amount for Fixed Deposits." icon={PiggyBank}>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <InputGroup label="Total Investment (₹)" value={principal} onChange={setPrincipal} />
                    <InputGroup label="Interest Rate (%)" value={rate} onChange={setRate} suffix="%" />
                    <InputGroup label="Time Period (Years)" value={years} onChange={setYears} suffix="Yr" />

                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Compounding Frequency</label>
                        <select
                            value={compounding}
                            onChange={(e) => setCompounding(Number(e.target.value))}
                            className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none"
                        >
                            <option value={12}>Monthly</option>
                            <option value={4}>Quarterly (Standard)</option>
                            <option value={2}>Half-Yearly</option>
                            <option value={1}>Yearly</option>
                        </select>
                    </div>

                    <button onClick={calculate} className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                        Calculate Maturity
                    </button>
                    <p className="text-xs text-gray-400 mt-2">* Estimation assumes cumulative payout at maturity.</p>
                </div>
                <div>
                    {result ? (
                        <div className="space-y-4 animate-fade-in">
                            <ResultCard label="Principal Amount" value={`₹ ${result.principal.toLocaleString()}`} />
                            <ResultCard label="Total Interest" value={`₹ ${result.interest.toLocaleString()}`} />
                            <ResultCard label="Maturity Value" value={`₹ ${result.maturity.toLocaleString()}`} highlight />

                            {(result.interest > 40000) && (
                                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-200 border border-amber-100 dark:border-amber-800 rounded-lg">
                                    <strong>Tax Note:</strong> Interest > ₹40,000 may attract TDS by the bank. Returns are fully taxable.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                            Calculate to see returns
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-12 text-left">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">FAQ</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">How is FD interest taxed?</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Fixed Deposit interest is added to your income and taxed as per your slab rate.</p>
                    </div>
                </div>
            </div>
        </CalcWrapper>
    );
}

// --- 4. PPF Calculator ---
export function PpfCalculator() {
    const [yearlyInvest, setYearlyInvest] = useState(150000);
    const [years, setYears] = useState(15);
    const [rate, setRate] = useState(7.1);
    const [result, setResult] = useState(null);

    const calculate = () => {
        let balance = 0;
        const P = parseFloat(yearlyInvest);
        const r = parseFloat(rate) / 100;
        const n = parseFloat(years);

        if (n < 15) {
            // Just a warn, but allow it conceptually or clamp it? PPF is 15y min.
            // But extensions are 5y blocks. Let's allow but helper text explains.
        }

        // Formula for annuity (End of Period): P * [ (1+i)^n - 1 ] / i
        // PPF Deposits are typically considered April 1-5 for max interest, so 'Beginning of Period'
        // Type 1: P * [ (1+i)^n - 1 ] * (1+i) / i
        const maturity = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        const invested = P * n;

        setResult({
            invested: Math.round(invested),
            maturity: Math.round(maturity),
            interest: Math.round(maturity - invested),
            isValidLimit: P <= 150000
        });
    };

    return (
        <CalcWrapper title="PPF Calculator" description="Public Provident Fund (PPF) maturity calculator." icon={Calculator}>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <InputGroup
                        label="Yearly Investment (₹)"
                        value={yearlyInvest}
                        onChange={setYearlyInvest}
                        error={yearlyInvest > 150000 ? "Max limit is ₹1,50,000 / year" : null}
                    />
                    <InputGroup label="Duration (Years)" value={years} onChange={setYears} suffix="Yr" helper="Min 15 years" />
                    <InputGroup label="Interest Rate (%)" value={rate} onChange={setRate} suffix="%" helper="Quarterly variable (Currently ~7.1%)" />
                    <button onClick={calculate} className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                        Calculate PPF
                    </button>
                    <p className="text-xs text-gray-400 mt-2">* Assumes investment made at start of financial year (April).</p>
                </div>
                <div>
                    {result ? (
                        <div className="space-y-4 animate-fade-in">
                            <ResultCard label="Total Invested" value={`₹ ${result.invested.toLocaleString()}`} />
                            <ResultCard label="Total Interest" value={`₹ ${result.interest.toLocaleString()}`} />
                            <ResultCard label="Maturity Value" value={`₹ ${result.maturity.toLocaleString()}`} highlight />

                            {!result.isValidLimit && (
                                <div className="mt-2 text-xs text-red-500 font-bold text-center border border-red-200 bg-red-50 p-2 rounded">
                                    Warning: Investment exceeds statutory limit of ₹1.5L
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                            Enter details to calculate
                        </div>
                    )}
                </div>
            </div>
        </CalcWrapper>
    );
}

// --- 6. CAGR Calculator ---
export function CagrCalculator() {
    const [startVal, setStartVal] = useState(10000);
    const [endVal, setEndVal] = useState(20000);
    const [years, setYears] = useState(5);
    const [result, setResult] = useState(null);

    const calculate = () => {
        const s = parseFloat(startVal);
        const e = parseFloat(endVal);
        const n = parseFloat(years);

        if (s > 0 && n > 0 && e >= 0) {
            // (End/Start)^(1/n) - 1
            const cagr = (Math.pow(e / s, 1 / n) - 1) * 100;
            setResult(cagr.toFixed(2));
        }
    };

    return (
        <CalcWrapper title="CAGR Calculator" description="Calculate Compound Annual Growth Rate." icon={Percent}>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <InputGroup label="Initial Investment (₹)" value={startVal} onChange={setStartVal} />
                    <InputGroup label="Final Value (₹)" value={endVal} onChange={setEndVal} />
                    <InputGroup label="Duration (Years)" value={years} onChange={setYears} suffix="Yr" />
                    <button onClick={calculate} className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                        Calculate CAGR
                    </button>
                </div>
                <div>
                    {result !== null ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="p-8 bg-blue-600 text-white rounded-2xl text-center">
                                <p className="text-sm font-bold uppercase opacity-80 mb-2">CAGR Percentage</p>
                                <p className="text-5xl font-bold">{result}%</p>
                            </div>
                            <div className="text-center text-sm text-gray-500">
                                This means your investment grew at an average rate of {result}% every year.
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                            See your growth rate here
                        </div>
                    )}
                </div>
            </div>
        </CalcWrapper>
    );
}
