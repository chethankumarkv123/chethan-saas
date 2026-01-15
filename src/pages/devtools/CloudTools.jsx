import { useState } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { toast } from '../../components/Toast';

// --- CIDR SPLITTER ---
export function CidrSplitter() {
    const [cidr, setCidr] = useState("10.0.0.0/16");
    const [newMask, setNewMask] = useState(24);

    // Helpers (reused logic could be moved to utils)
    const ipToLong = (ip) => {
        let p = ip.split('.');
        return ((p[0] << 24) >>> 0) + ((p[1] << 16) >>> 0) + ((p[2] << 8) >>> 0) + (p[3] >>> 0);
    };
    const longToIp = (num) => {
        var part1 = num & 255;
        var part2 = ((num >> 8) & 255);
        var part3 = ((num >> 16) & 255);
        var part4 = ((num >> 24) & 255);
        return part4 + "." + part3 + "." + part2 + "." + part1;
    };

    const split = () => {
        const parts = cidr.split('/');
        if (parts.length !== 2) return [];
        const ip = parts[0];
        const mask = parseInt(parts[1]);
        const target = parseInt(newMask);

        if (isNaN(mask) || isNaN(target) || target <= mask || target > 32) return [];

        const start = ipToLong(ip);
        const count = Math.pow(2, target - mask);
        const step = Math.pow(2, 32 - target); // IPs per new subnet

        // Limit results to avoid browser hang
        const safeCount = Math.min(count, 512);

        let subnets = [];
        for (let i = 0; i < safeCount; i++) {
            subnets.push(longToIp(start + (i * step)) + "/" + target);
        }
        return { subnets, total: count, shown: safeCount };
    };

    const res = split();

    return (
        <DevToolLayout featureKey="cidrSplitter">
            <div className="max-w-xl mx-auto space-y-6">
                <div className="flex gap-4 items-end">
                    <div className="flex-grow">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Base CIDR</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-xl font-mono text-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                            value={cidr} onChange={e => setCidr(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Mask</label>
                        <select
                            value={newMask}
                            onChange={e => setNewMask(e.target.value)}
                            className="p-3 border rounded-xl font-mono text-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                        >
                            {Array.from({ length: 32 }).map((_, i) => (
                                <option key={i} value={i + 1}>/{i + 1}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {res.subnets && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                            <span>Result Subnets ({res.shown < res.total ? `Showing ${res.shown} of ${res.total}` : res.total})</span>
                            <button onClick={() => { navigator.clipboard.writeText(res.subnets.join('\n')); toast.success("Copied!"); }} className="text-blue-500 hover:underline">Copy List</button>
                        </div>
                        <div className="h-96 overflow-y-auto bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 font-mono text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                            {res.subnets.map(s => <div key={s}>{s}</div>)}
                            {res.shown < res.total && <div className="text-gray-400 italic mt-2">... {res.total - res.shown} more subnets hidden ...</div>}
                        </div>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}

// --- KUBERNETES CONVERTER ---
export function K8sConverter() {
    const [val, setVal] = useState("");
    const [type, setType] = useState("cpu"); // cpu, mem

    // CPU Logic
    const cpuRes = () => {
        const v = parseFloat(val);
        if (isNaN(v)) return null;
        return (
            <div className="grid grid-cols-2 gap-4 mt-6">
                <Box label="MilliCores (m)" val={v * 1000} />
                <Box label="Cores" val={v} />
            </div>
        );
    };

    // Mem Logic
    // Input assumes standard "Mi" or raw bytes usually... let's simplify: Input -> multiple outputs
    // Or drop down for Unit? Calculator.net style = "Convert X [Unit] to Y [Unit]"
    // Let's do: Input in specific unit -> Show all others.
    const [unit, setUnit] = useState("Mi");
    const memRes = () => {
        let bytes = 0;
        const v = parseFloat(val);
        if (isNaN(v)) return null;

        switch (unit) {
            case 'Ki': bytes = v * 1024; break;
            case 'Mi': bytes = v * 1024 * 1024; break;
            case 'Gi': bytes = v * 1024 * 1024 * 1024; break;
            case 'bytes': bytes = v; break;
        }

        return (
            <div className="grid grid-cols-2 gap-4 mt-6">
                <Box label="Bytes" val={Math.round(bytes)} />
                <Box label="Ki (Kibibytes)" val={(bytes / 1024).toFixed(2)} />
                <Box label="Mi (Mebibytes)" val={(bytes / (1024 * 1024)).toFixed(2)} />
                <Box label="Gi (Gibibytes)" val={(bytes / (1024 * 1024 * 1024)).toFixed(3)} />
            </div>
        );
    };

    return (
        <DevToolLayout featureKey="k8sConverter">
            <div className="max-w-xl mx-auto">
                {/* Type Switch */}
                <div className="flex justify-center mb-8">
                    <div className="bg-gray-100 dark:bg-slate-700 p-1 rounded-lg flex gap-1">
                        <button onClick={() => { setType('cpu'); setVal(''); }} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${type === 'cpu' ? 'bg-white shadow dark:bg-slate-600 text-indigo-600 dark:text-white' : 'text-gray-500'}`}>CPU</button>
                        <button onClick={() => { setType('mem'); setVal(''); }} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${type === 'mem' ? 'bg-white shadow dark:bg-slate-600 text-indigo-600 dark:text-white' : 'text-gray-500'}`}>Memory</button>
                    </div>
                </div>

                {/* Inputs */}
                <div className="flex gap-4">
                    <input
                        type="number"
                        value={val} onChange={e => setVal(e.target.value)}
                        placeholder="Value"
                        className="flex-grow p-4 border rounded-xl font-mono text-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                    />
                    {type === 'mem' && (
                        <select value={unit} onChange={e => setUnit(e.target.value)} className="p-4 border rounded-xl font-bold bg-gray-50 dark:bg-slate-800 dark:border-slate-600">
                            <option value="bytes">bytes</option>
                            <option value="Ki">Ki</option>
                            <option value="Mi">Mi</option>
                            <option value="Gi">Gi</option>
                        </select>
                    )}
                    {type === 'cpu' && (
                        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl font-bold text-gray-500 border border-gray-200 dark:border-slate-600">
                            Cores
                        </div>
                    )}
                </div>

                {type === 'cpu' ? cpuRes() : memRes()}

            </div>
        </DevToolLayout>
    );
}

const Box = ({ label, val }) => (
    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 text-center group cursor-pointer hover:border-indigo-300 transition-colors"
        onClick={() => { navigator.clipboard.writeText(val); toast.success("Copied!"); }}
    >
        <div className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</div>
        <div className="font-mono text-lg font-bold text-gray-800 dark:text-white break-all">{val}</div>
    </div>
);
