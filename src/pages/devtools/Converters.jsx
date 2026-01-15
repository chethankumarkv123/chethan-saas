import { useState, useEffect } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { toast } from '../../components/Toast';

const CopyButton = ({ text }) => (
    <button
        onClick={() => {
            navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard!");
        }}
        className="ml-2 p-2 text-gray-400 hover:text-blue-500 transition-colors"
        title="Copy"
    >
        <i className="fa-regular fa-copy"></i>
    </button>
);

export function BaseConverter() {
    const [dec, setDec] = useState("");
    const [hex, setHex] = useState("");
    const [bin, setBin] = useState("");
    const [oct, setOct] = useState("");

    const updateFromDec = (val) => {
        if (val === "") { reset(); return; }
        const num = parseInt(val, 10);
        if (isNaN(num)) return;
        setDec(val);
        setHex(num.toString(16).toUpperCase());
        setBin(num.toString(2));
        setOct(num.toString(8));
    };

    const updateFromHex = (val) => {
        if (val === "") { reset(); return; }
        const num = parseInt(val, 16);
        if (isNaN(num)) return;
        setHex(val.toUpperCase());
        setDec(num.toString(10));
        setBin(num.toString(2));
        setOct(num.toString(8));
    };

    const updateFromBin = (val) => {
        if (val === "") { reset(); return; }
        const num = parseInt(val, 2);
        if (isNaN(num)) return;
        setBin(val);
        setDec(num.toString(10));
        setHex(num.toString(16).toUpperCase());
        setOct(num.toString(8));
    };

    const reset = () => {
        setDec("");
        setHex("");
        setBin("");
        setOct("");
    };

    return (
        <DevToolLayout featureKey="baseConverter">
            <div className="space-y-4 max-w-xl mx-auto">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Decimal</label>
                    <div className="flex">
                        <input type="number" value={dec} onChange={(e) => updateFromDec(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white" placeholder="1024" />
                        <CopyButton text={dec} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hexadecimal</label>
                    <div className="flex">
                        <input type="text" value={hex} onChange={(e) => updateFromHex(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white" placeholder="400" />
                        <CopyButton text={hex} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Binary</label>
                    <div className="flex">
                        <input type="text" value={bin} onChange={(e) => updateFromBin(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white" placeholder="10000000000" />
                        <CopyButton text={bin} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Octal</label>
                    <div className="flex">
                        <input type="number" readOnly value={oct} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300 cursor-not-allowed" />
                        <CopyButton text={oct} />
                    </div>
                </div>
                <button onClick={reset} className="text-sm text-red-500 hover:underline">Clear All</button>
            </div>
        </DevToolLayout>
    );
}

export function TimestampConverter() {
    const [ts, setTs] = useState(Math.floor(Date.now() / 1000));
    const [date, setDate] = useState(new Date().toISOString().slice(0, 19));

    const updateFromTs = (val) => {
        setTs(val);
        const d = new Date(val * 1000);
        if (!isNaN(d.getTime())) {
            // Adjust to local ISO string somewhat manually or use lib. 
            // Simple approach:
            const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
            setDate(local);
        }
    };

    const updateFromDate = (val) => {
        setDate(val);
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
            setTs(Math.floor(d.getTime() / 1000));
        }
    };

    return (
        <DevToolLayout featureKey="timestampConverter">
            <div className="space-y-6 max-w-xl mx-auto text-center">
                <div className="text-4xl font-mono p-4 bg-gray-100 dark:bg-slate-900 rounded-xl my-4 text-blue-600 dark:text-blue-400">
                    {ts}
                </div>

                <div className="grid gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unix Timestamp (Seconds)</label>
                        <div className="flex">
                            <input type="number" value={ts} onChange={(e) => updateFromTs(e.target.value)} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white font-mono" />
                            <CopyButton text={ts} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time (Local)</label>
                        <div className="flex">
                            <input type="datetime-local" value={date} onChange={(e) => updateFromDate(e.target.value)} step="1" className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={() => updateFromTs(Math.floor(Date.now() / 1000))} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium">
                        Now
                    </button>
                </div>
            </div>
        </DevToolLayout>
    );
}

export function DataSizeConverter() {
    const [bytes, setBytes] = useState("");

    // Base unit is Byte == 1
    const units = [
        { label: 'Bits (b)', scale: 1 / 8, group: 'Basic' },
        { label: 'Bytes (B)', scale: 1, group: 'Basic' },
        { label: 'Kilobytes (KB)', scale: 1024, group: 'Storage' },
        { label: 'Megabytes (MB)', scale: Math.pow(1024, 2), group: 'Storage' },
        { label: 'Gigabytes (GB)', scale: Math.pow(1024, 3), group: 'Storage' },
        { label: 'Terabytes (TB)', scale: Math.pow(1024, 4), group: 'Storage' },
        { label: 'Petabytes (PB)', scale: Math.pow(1024, 5), group: 'Large Storage' },
        { label: 'Exabytes (EB)', scale: Math.pow(1024, 6), group: 'Large Storage' },
        { label: 'Zettabytes (ZB)', scale: Math.pow(1024, 7), group: 'Large Storage' },
        { label: 'Yottabytes (YB)', scale: Math.pow(1024, 8), group: 'Large Storage' },
    ];

    const speeds = [
        { label: 'USB 2.0 (480 Mbps)', speedBytes: 60 * 1024 * 1024 }, // 60 MB/s max theoretical
        { label: 'USB 3.0 (5 Gbps)', speedBytes: 625 * 1024 * 1024 }, // 625 MB/s
        { label: 'Wi-Fi 5 (866 Mbps)', speedBytes: 108 * 1024 * 1024 },
        { label: 'Gigabit Ethernet (1 Gbps)', speedBytes: 125 * 1024 * 1024 },
        { label: '4G LTE (150 Mbps)', speedBytes: 18.75 * 1024 * 1024 },
        { label: '5G (1 Gbps)', speedBytes: 125 * 1024 * 1024 },
        { label: 'SSD Read/Write (500 MB/s)', speedBytes: 500 * 1024 * 1024 },
        { label: 'NVMe SSD (3500 MB/s)', speedBytes: 3500 * 1024 * 1024 },
    ];

    const formatNumber = (num) => {
        if (!num && num !== 0) return "";
        // Prevent scientific notation for smaller/medium numbers, standard for large
        if (num > 1e15 || (num < 1e-6 && num > 0)) return num.toExponential(4);

        // Show enough decimals for precision but not too many
        // For integers, show integer. For floats, max 6 decimals, strip trailing zeros
        return parseFloat(num.toFixed(8)).toString();
    };

    const getValue = (scale) => {
        if (!bytes && bytes !== 0) return "";
        const val = bytes / scale;
        return formatNumber(val);
    };

    const updateValue = (val, scale) => {
        if (val === "") { setBytes(""); return; }
        const num = parseFloat(val);
        if (isNaN(num)) return;
        setBytes(num * scale);
    };

    const getTransferTime = (speedPerSec) => {
        if (!bytes) return "-";
        const seconds = bytes / speedPerSec;
        if (seconds < 1) return "< 1 sec";

        const y = Math.floor(seconds / (3600 * 24 * 365));
        const d = Math.floor((seconds % (3600 * 24 * 365)) / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        const parts = [];
        if (y > 0) parts.push(`${y}y`);
        if (d > 0) parts.push(`${d}d`);
        if (h > 0) parts.push(`${h}h`);
        if (m > 0) parts.push(`${m}m`);
        if (s > 0 && y === 0) parts.push(`${s}s`); // Hide seconds for very long durations

        return parts.slice(0, 2).join(" "); // Show massive durations compactly
    };

    return (
        <DevToolLayout featureKey="dataSizeConverter">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Converter Grid */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            <i className="fa-solid fa-server mr-2 text-blue-500"></i>
                            Size Converter
                        </h2>
                        <button onClick={() => setBytes("")} className="text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded-lg transition-colors font-medium">
                            <i className="fa-solid fa-trash mr-1"></i> Reset
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {units.map((unit) => (
                            <div key={unit.label}>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{unit.label}</label>
                                <div className="flex relative items-center">
                                    <input
                                        type="number"
                                        value={getValue(unit.scale)}
                                        onChange={(e) => updateValue(e.target.value, unit.scale)}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                                        placeholder="0"
                                    />
                                    <div className="absolute right-2">
                                        <CopyButton text={getValue(unit.scale)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transfer Time Estimator */}
                {bytes > 0 && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">
                            <i className="fa-solid fa-stopwatch mr-2 text-green-500"></i>
                            Estimated Transfer Time
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {speeds.map(speed => (
                                <div key={speed.label} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 flex flex-col justify-between h-24">
                                    <span className="text-xs font-bold text-gray-400 uppercase">{speed.label}</span>
                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400 truncate">
                                        {getTransferTime(speed.speedBytes)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}
