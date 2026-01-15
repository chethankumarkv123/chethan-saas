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

    const ExplainRate = () => {
        if (min === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') return "Runs every minute";
        if (min !== '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') return `Runs at minute ${min} of every hour`;
        if (min === '0' && hour === '*' && dom === '*' && month === '*' && dow === '*') return "Runs at the top of every hour";
        // Simple heuristic explanations can be expanded, but for simplicity:
        return "Custom Schedule";
    };

    return (
        <DevToolLayout featureKey="cronGenerator">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-gray-900 text-green-400 font-mono p-6 rounded-2xl text-center text-3xl shadow-xl border border-gray-700 relative group">
                    {cron}
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(cron);
                            toast.success("Cron expression copied!");
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white transition-colors"
                    >
                        <i className="fa-regular fa-copy text-sm"></i>
                    </button>
                    <div className="text-gray-500 text-xs mt-2 font-sans tracking-wide uppercase"><ExplainRate /></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <CronField label="Minute" value={min} onChange={setMin} range="0-59" />
                    <CronField label="Hour" value={hour} onChange={setHour} range="0-23" />
                    <CronField label="Day (Month)" value={dom} onChange={setDom} range="1-31" />
                    <CronField label="Month" value={month} onChange={setMonth} range="1-12" />
                    <CronField label="Day (Week)" value={dow} onChange={setDow} range="0-6" hint="0=Sun" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <QuickCron label="Every Minute" set={() => { setMin('*'); setHour('*'); setDom('*'); setMonth('*'); setDow('*') }} />
                    <QuickCron label="Every Hour" set={() => { setMin('0'); setHour('*'); setDom('*'); setMonth('*'); setDow('*') }} />
                    <QuickCron label="Every Day" set={() => { setMin('0'); setHour('0'); setDom('*'); setMonth('*'); setDow('*') }} />
                    <QuickCron label="Every Week" set={() => { setMin('0'); setHour('0'); setDom('*'); setMonth('*'); setDow('0') }} />
                </div>
            </div>
        </DevToolLayout>
    );
}

const CronField = ({ label, value, onChange, range, hint }) => (
    <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full text-center font-mono bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg py-1 text-sm font-bold"
        />
        <div className="text-[10px] text-gray-400 text-center mt-1">{range} {hint && `(${hint})`}</div>
    </div>
);

const QuickCron = ({ label, set }) => (
    <button
        onClick={set}
        className="py-2 px-3 text-xs font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
    >
        {label}
    </button>
);


// --- CHMOD ---

export function ChmodCalc() {
    const [p, setP] = useState({
        u: { r: true, w: true, x: true }, // 7
        g: { r: true, w: false, x: true }, // 5
        o: { r: true, w: false, x: true }  // 5
    });

    const getOctal = () => {
        const val = (r) => {
            let n = 0;
            if (r.r) n += 4;
            if (r.w) n += 2;
            if (r.x) n += 1;
            return n;
        };
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
                <div className="grid grid-cols-4 gap-4 text-center items-center">
                    <div className="font-bold text-gray-400 text-sm"></div>
                    <div className="font-bold text-gray-700 dark:text-gray-300">Owner</div>
                    <div className="font-bold text-gray-700 dark:text-gray-300">Group</div>
                    <div className="font-bold text-gray-700 dark:text-gray-300">Public</div>

                    <div className="font-bold text-gray-500 text-sm uppercase">Read</div>
                    <Checkbox checked={p.u.r} onChange={() => toggle('u', 'r')} />
                    <Checkbox checked={p.g.r} onChange={() => toggle('g', 'r')} />
                    <Checkbox checked={p.o.r} onChange={() => toggle('o', 'r')} />

                    <div className="font-bold text-gray-500 text-sm uppercase">Write</div>
                    <Checkbox checked={p.u.w} onChange={() => toggle('u', 'w')} />
                    <Checkbox checked={p.g.w} onChange={() => toggle('g', 'w')} />
                    <Checkbox checked={p.o.w} onChange={() => toggle('o', 'w')} />

                    <div className="font-bold text-gray-500 text-sm uppercase">Execute</div>
                    <Checkbox checked={p.u.x} onChange={() => toggle('u', 'x')} />
                    <Checkbox checked={p.g.x} onChange={() => toggle('g', 'x')} />
                    <Checkbox checked={p.o.x} onChange={() => toggle('o', 'x')} />
                </div>

                {/* Results */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 text-center relative group">
                        <div className="text-gray-500 text-xs font-bold uppercase mb-1">Octal</div>
                        <div className="text-5xl font-mono font-bold text-red-700 dark:text-red-400">{getOctal()}</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 text-center relative flex flex-col justify-center">
                        <div className="text-gray-500 text-xs font-bold uppercase mb-1">Symbolic</div>
                        <div className="text-2xl font-mono font-bold text-gray-800 dark:text-white tracking-widest">{getSymbolic()}</div>
                    </div>
                </div>
            </div>
        </DevToolLayout>
    );
}

const Checkbox = ({ checked, onChange }) => (
    <div onClick={onChange} className={`
        h-12 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all
        ${checked
            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-transparent hover:border-gray-300 dark:hover:border-slate-600'}
    `}>
        <i className="fa-solid fa-check text-xl"></i>
    </div>
);
