
import { useState, useEffect } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { toast } from '../../components/Toast';

export function CronGenerator() {
    const [min, setMin] = useState("*");
    const [hour, setHour] = useState("*");
    const [dom, setDom] = useState("*");
    const [month, setMonth] = useState("*");
    const [dow, setDow] = useState("*");

    const cron = `${min} ${hour} ${dom} ${month} ${dow}`;

    const PRESETS = [
        { label: "Every Minute", min: "*", hour: "*", dom: "*", month: "*", dow: "*" },
        { label: "Every Hour", min: "0", hour: "*", dom: "*", month: "*", dow: "*" },
        { label: "Every Day at Midnight", min: "0", hour: "0", dom: "*", month: "*", dow: "*" },
        { label: "Every Week (Sun)", min: "0", hour: "0", dom: "*", month: "*", dow: "0" },
        { label: "Every Month (1st)", min: "0", hour: "0", dom: "1", month: "*", dow: "*" },
        { label: "Every Year (Jan 1)", min: "0", hour: "0", dom: "1", month: "1", dow: "*" },
        { label: "Weekdays at 9am", min: "0", hour: "9", dom: "*", month: "*", dow: "1-5" },
    ];

    const applyPreset = (p) => {
        setMin(p.min);
        setHour(p.hour);
        setDom(p.dom);
        setMonth(p.month);
        setDow(p.dow);
    };

    return (
        <DevToolLayout featureKey="cronGenerator">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Display & Copy */}
                <div className="bg-gray-900 text-green-400 font-mono p-8 rounded-2xl text-center shadow-xl border border-gray-700 relative group transition-all hover:shadow-2xl">
                    <div className="text-4xl sm:text-5xl font-bold tracking-wider mb-2">{cron}</div>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(cron);
                            toast.success("Cron expression copied!");
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                        title="Copy to clipboard"
                    >
                        <i className="fa-regular fa-copy text-lg"></i>
                    </button>
                    <div className="text-gray-500 text-xs mt-4 font-sans tracking-widest uppercase">
                        Current Schedule
                    </div>
                </div>

                {/* Presets Grid */}
                <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Quick Presets</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {PRESETS.map((p, i) => (
                            <button
                                key={i}
                                onClick={() => applyPreset(p)}
                                className="px-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all text-gray-600 dark:text-gray-300"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fields Grid */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                    <div className="grid grid-cols-5 gap-2 sm:gap-4">
                        <CronField label="Minute" value={min} onChange={setMin} range="0-59" />
                        <CronField label="Hour" value={hour} onChange={setHour} range="0-23" />
                        <CronField label="Day (Month)" value={dom} onChange={setDom} range="1-31" />
                        <CronField label="Month" value={month} onChange={setMonth} range="1-12" />
                        <CronField label="Day (Week)" value={dow} onChange={setDow} range="0-6" hint="SUN=0" />
                    </div>
                    <div className="mt-4 text-center text-xs text-gray-400 max-w-lg mx-auto">
                        Tip: Use <b>*</b> for every, <b>*/5</b> for interval, <b>1,2,3</b> for specific list, and <b>1-5</b> for range.
                    </div>
                </div>
            </div>
        </DevToolLayout>
    );
}

const CronField = ({ label, value, onChange, range, hint }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase text-center truncate">{label}</label>
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full text-center font-mono bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-800 dark:text-white"
        />
        <div className="text-[9px] text-gray-400 text-center opacity-60">{range}</div>
    </div>
);

// --- CHMOD ---

export function ChmodCalc() {
    const [p, setP] = useState({
        u: { r: true, w: true, x: true }, // 7
        g: { r: true, w: false, x: true }, // 5
        o: { r: true, w: false, x: true }  // 5
    });

    const getOctal = () => {
        const val = (r) => (r.r ? 4 : 0) + (r.w ? 2 : 0) + (r.x ? 1 : 0);
        return `${val(p.u)}${val(p.g)}${val(p.o)}`;
    };

    const getSymbolic = () => {
        const sym = (r) => (r.r ? 'r' : '-') + (r.w ? 'w' : '-') + (r.x ? 'x' : '-');
        return `-${sym(p.u)}${sym(p.g)}${sym(p.o)}`;
    };

    const toggle = (who, what) => {
        setP(prev => ({
            ...prev,
            [who]: { ...prev[who], [what]: !prev[who][what] }
        }));
    };

    return (
        <DevToolLayout featureKey="chmodCalc">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Visual Grid */}
                <div className="grid grid-cols-4 gap-3 sm:gap-6 text-center items-center select-none">
                    <div className="font-bold text-gray-400 text-xs uppercase tracking-widest">Scope</div>
                    <div className="font-bold text-gray-700 dark:text-gray-200">Owner</div>
                    <div className="font-bold text-gray-700 dark:text-gray-200">Group</div>
                    <div className="font-bold text-gray-700 dark:text-gray-200">Public</div>

                    <div className="font-bold text-gray-500 text-xs uppercase bg-gray-50 dark:bg-slate-800 py-1 rounded">Read</div>
                    <Checkbox checked={p.u.r} onChange={() => toggle('u', 'r')} />
                    <Checkbox checked={p.g.r} onChange={() => toggle('g', 'r')} />
                    <Checkbox checked={p.o.r} onChange={() => toggle('o', 'r')} />

                    <div className="font-bold text-gray-500 text-xs uppercase bg-gray-50 dark:bg-slate-800 py-1 rounded">Write</div>
                    <Checkbox checked={p.u.w} onChange={() => toggle('u', 'w')} />
                    <Checkbox checked={p.g.w} onChange={() => toggle('g', 'w')} />
                    <Checkbox checked={p.o.w} onChange={() => toggle('o', 'w')} />

                    <div className="font-bold text-gray-500 text-xs uppercase bg-gray-50 dark:bg-slate-800 py-1 rounded">Execute</div>
                    <Checkbox checked={p.u.x} onChange={() => toggle('u', 'x')} />
                    <Checkbox checked={p.g.x} onChange={() => toggle('g', 'x')} />
                    <Checkbox checked={p.o.x} onChange={() => toggle('o', 'x')} />
                </div>

                {/* Results */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 text-center flex flex-col justify-center">
                        <div className="text-gray-500 text-xs font-bold uppercase mb-2">Octal</div>
                        <div className="text-5xl font-mono font-bold text-red-700 dark:text-red-400">{getOctal()}</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 text-center flex flex-col justify-center">
                        <div className="text-gray-500 text-xs font-bold uppercase mb-2">Symbolic</div>
                        <div className="text-xl sm:text-2xl font-mono font-bold text-gray-800 dark:text-white tracking-widest">{getSymbolic()}</div>
                    </div>
                </div>
            </div>
        </DevToolLayout>
    );
}

const Checkbox = ({ checked, onChange }) => (
    <div
        onClick={onChange}
        className={`
            h-10 sm:h-12 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all duration-200
            ${checked
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-transparent hover:border-blue-300 dark:hover:border-slate-500'}
        `}
    >
        <i className="fa-solid fa-check text-lg"></i>
    </div>
);
