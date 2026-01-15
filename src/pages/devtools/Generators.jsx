import { useState, useEffect } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { toast } from '../../components/Toast';

const ResultBox = ({ value, label }) => (
    <div className="relative group">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
        <div className="flex items-center gap-2">
            <input
                readOnly
                value={value}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4 font-mono text-lg text-gray-800 dark:text-gray-200 outline-none"
            />
            <button
                onClick={() => {
                    navigator.clipboard.writeText(value);
                    toast.success("Copied!");
                }}
                className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:opacity-80 transition-opacity"
            >
                <i className="fa-regular fa-copy"></i>
            </button>
        </div>
    </div>
);

export function UuidGenerator() {
    const [uuid, setUuid] = useState("");
    const [count, setCount] = useState(1);

    const generate = () => {
        // UUID v4
        const newUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        setUuid(newUuid);
    };

    useEffect(() => {
        generate();
    }, []);

    return (
        <DevToolLayout featureKey="uuidGenerator">
            <div className="space-y-8 max-w-xl mx-auto">
                <ResultBox value={uuid} label="UUID v4" />

                <button
                    onClick={generate}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-rotate"></i> Generate New UUID
                </button>
            </div>
        </DevToolLayout>
    );
}

export function RandomString() {
    const [length, setLength] = useState(16);
    const [result, setResult] = useState("");
    const [options, setOptions] = useState({
        upper: true,
        lower: true,
        numbers: true,
        symbols: false
    });

    const generate = () => {
        const charset = {
            upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            lower: "abcdefghijklmnopqrstuvwxyz",
            numbers: "0123456789",
            symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
        };

        let chars = "";
        if (options.upper) chars += charset.upper;
        if (options.lower) chars += charset.lower;
        if (options.numbers) chars += charset.numbers;
        if (options.symbols) chars += charset.symbols;

        if (chars === "") { setResult("Select options"); return; } // fallback

        let str = "";
        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setResult(str);
    };

    useEffect(() => {
        generate();
    }, [length, options]);

    const toggle = (key) => setOptions(p => ({ ...p, [key]: !p[key] }));

    return (
        <DevToolLayout featureKey="randomString">
            <div className="space-y-6 max-w-xl mx-auto">
                <ResultBox value={result} label="Random String" />

                <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Length: {length}</label>
                        <input
                            type="range" min="4" max="64" value={length}
                            onChange={e => setLength(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {Object.keys(options).map(key => (
                            <button
                                key={key}
                                onClick={() => toggle(key)}
                                className={`p-3 rounded-lg text-sm font-bold capitalize border-2 transition-all ${options[key]
                                        ? 'border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300'
                                        : 'border-gray-200 text-gray-500 dark:border-slate-700'
                                    }`}
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={generate}
                    className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-rotate"></i> Regenerate
                </button>
            </div>
        </DevToolLayout>
    );
}

export function RandomNumber() {
    const [min, setMin] = useState(1);
    const [max, setMax] = useState(100);
    const [result, setResult] = useState(null);

    const generate = () => {
        const mn = parseInt(min);
        const mx = parseInt(max);
        if (isNaN(mn) || isNaN(mx)) return;
        setResult(Math.floor(Math.random() * (mx - mn + 1)) + mn);
    };

    useEffect(() => {
        generate();
    }, []);

    return (
        <DevToolLayout featureKey="randomNumber">
            <div className="space-y-8 max-w-xl mx-auto text-center">
                <div className="p-8 bg-teal-50 dark:bg-teal-900/10 rounded-2xl border-2 border-teal-100 dark:border-teal-900/30">
                    <span className="block text-xs font-bold text-teal-600 mb-2 uppercase tracking-widest">Result</span>
                    <div className="text-6xl font-mono font-bold text-teal-700 dark:text-teal-400">
                        {result}
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-500 mb-1">Min</label>
                        <input type="number" value={min} onChange={e => setMin(e.target.value)} className="w-full p-3 text-center border rounded-xl dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-500 mb-1">Max</label>
                        <input type="number" value={max} onChange={e => setMax(e.target.value)} className="w-full p-3 text-center border rounded-xl dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                    </div>
                </div>

                <button
                    onClick={generate}
                    className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-dice"></i> Roll
                </button>
            </div>
        </DevToolLayout>
    );
}
