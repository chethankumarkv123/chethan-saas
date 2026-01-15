import { useState } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';

export function ScientificCalc() {
    const [display, setDisplay] = useState("");
    const [result, setResult] = useState("");

    const handleClick = (val) => {
        if (val === 'C') {
            setDisplay("");
            setResult("");
        } else if (val === '=') {
            try {
                // Safe-ish eval for a calculator
                // eslint-disable-next-line
                const res = Function('"use strict";return (' + display + ')')();
                setResult(res);
                setDisplay(String(res));
            } catch {
                setResult("Error");
            }
        } else if (val === 'DEL') {
            setDisplay(display.slice(0, -1));
        } else if (['sin', 'cos', 'tan', 'sqrt', 'log'].includes(val)) {
            setDisplay(display + `Math.${val}(`);
        } else {
            setDisplay(display + val);
        }
    };

    const buttons = [
        'C', '(', ')', 'DEL',
        'sin', 'cos', 'tan', '/',
        '7', '8', '9', '*',
        '4', '5', '6', '-',
        '1', '2', '3', '+',
        '0', '.', 'sqrt', '='
    ];

    return (
        <DevToolLayout featureKey="scientificCalc">
            <div className="max-w-xs mx-auto bg-gray-100 dark:bg-slate-900 p-4 rounded-2xl shadow-inner">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-4 text-right shadow-sm border border-gray-200 dark:border-slate-700 h-20 flex flex-col justify-center overflow-hidden">
                    <div className="text-gray-500 text-xs h-4">{result}</div>
                    <div className="text-2xl font-mono font-bold text-gray-800 dark:text-white truncate">{display || "0"}</div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {buttons.map((btn, i) => (
                        <button
                            key={i}
                            onClick={() => handleClick(btn)}
                            className={`
                                p-3 rounded-lg font-bold text-lg transition-all active:scale-95 shadow-sm
                                ${btn === '=' ? 'bg-blue-600 text-white col-span-1' : ''}
                                ${btn === 'C' || btn === 'DEL' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : ''}
                                ${['/', '*', '-', '+'].includes(btn) ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : ''}
                                ${!['=', 'C', 'DEL', '/', '*', '-', '+'].includes(btn) ? 'bg-white dark:bg-slate-700 dark:text-white hover:bg-gray-50' : ''}
                            `}
                        >
                            {btn}
                        </button>
                    ))}
                </div>
            </div>
        </DevToolLayout>
    );
}

export function PercentageCalc() {
    const [mode, setMode] = useState(0); // 0: X% of Y, 1: X is what % of Y, 2: Increase/Decrease
    const [val1, setVal1] = useState("");
    const [val2, setVal2] = useState("");

    const calculate = () => {
        const v1 = parseFloat(val1);
        const v2 = parseFloat(val2);
        if (isNaN(v1) || isNaN(v2)) return "---";

        switch (mode) {
            case 0: return ((v1 / 100) * v2).toFixed(2);
            case 1: return ((v1 / v2) * 100).toFixed(2) + "%";
            case 2:
                const diff = v2 - v1;
                const p = (diff / v1) * 100;
                return p.toFixed(2) + "% " + (p > 0 ? "Increase" : "Decrease");
            default: return "";
        }
    };

    return (
        <DevToolLayout featureKey="percentageCalc">
            <div className="space-y-6 max-w-xl mx-auto">
                <div className="flex gap-2 justify-center bg-gray-100 dark:bg-slate-700/50 p-1 rounded-xl">
                    {['X% of Y', 'X is ?% of Y', '% Change'].map((label, i) => (
                        <button
                            key={i}
                            onClick={() => setMode(i)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === i ? 'bg-white dark:bg-slate-600 shadow text-blue-600' : 'text-gray-500'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 text-lg justify-center">
                    {mode === 0 && (
                        <>
                            <input type="number" value={val1} onChange={e => setVal1(e.target.value)} className="w-20 p-2 text-center border rounded-lg dark:bg-slate-900 dark:border-slate-600" placeholder="X" />
                            <span>% of</span>
                            <input type="number" value={val2} onChange={e => setVal2(e.target.value)} className="w-20 p-2 text-center border rounded-lg dark:bg-slate-900 dark:border-slate-600" placeholder="Y" />
                        </>
                    )}
                    {mode === 1 && (
                        <>
                            <input type="number" value={val1} onChange={e => setVal1(e.target.value)} className="w-20 p-2 text-center border rounded-lg dark:bg-slate-900 dark:border-slate-600" placeholder="X" />
                            <span>is what % of</span>
                            <input type="number" value={val2} onChange={e => setVal2(e.target.value)} className="w-20 p-2 text-center border rounded-lg dark:bg-slate-900 dark:border-slate-600" placeholder="Y" />
                        </>
                    )}
                    {mode === 2 && (
                        <>
                            <span>From</span>
                            <input type="number" value={val1} onChange={e => setVal1(e.target.value)} className="w-20 p-2 text-center border rounded-lg dark:bg-slate-900 dark:border-slate-600" placeholder="Start" />
                            <span>to</span>
                            <input type="number" value={val2} onChange={e => setVal2(e.target.value)} className="w-20 p-2 text-center border rounded-lg dark:bg-slate-900 dark:border-slate-600" placeholder="End" />
                        </>
                    )}
                </div>

                <div className="text-center">
                    <div className="text-gray-400 text-xs font-bold uppercase mb-2">Result</div>
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {calculate()}
                    </div>
                </div>
            </div>
        </DevToolLayout>
    );
}

export function DateDiff() {
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");

    const calculate = () => {
        if (!start || !end) return null;
        const d1 = new Date(start);
        const d2 = new Date(end);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffYears = (diffDays / 365.25).toFixed(1);
        return { days: diffDays, years: diffYears };
    };

    const res = calculate();

    return (
        <DevToolLayout featureKey="dateDiff">
            <div className="space-y-8 max-w-xl mx-auto">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">Start Date</label>
                        <input type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">End Date</label>
                        <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                    </div>
                </div>

                {res && (
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                            <div className="text-3xl font-bold text-green-700 dark:text-green-400">{res.days}</div>
                            <div className="text-xs text-green-600 dark:text-green-500 font-bold uppercase">Total Days</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">~{res.years}</div>
                            <div className="text-xs text-blue-600 dark:text-blue-500 font-bold uppercase">Years</div>
                        </div>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}
