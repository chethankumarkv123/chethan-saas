import { useState, useEffect } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { toast } from '../../components/Toast';

// --- TIMEZONE CONVERTER ---
export function TimezoneConverter() {
    // We'll convert Local Time -> Target Timezone
    const [local, setLocal] = useState("");
    const [targetTz, setTargetTz] = useState("UTC");

    // Initial Time
    useEffect(() => {
        const now = new Date();
        // Format for datetime-local input: YYYY-MM-DDTHH:mm
        const pad = (n) => n.toString().padStart(2, '0');
        const str = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
        setLocal(str);
    }, []);

    const convert = () => {
        if (!local) return "Invalid Date";
        const date = new Date(local);
        try {
            return new Intl.DateTimeFormat('en-US', {
                timeZone: targetTz,
                dateStyle: 'full',
                timeStyle: 'long'
            }).format(date);
        } catch (e) {
            return "Invalid Timezone";
        }
    };

    const commonTz = [
        "UTC", "America/New_York", "America/Los_Angeles", "America/Chicago",
        "Europe/London", "Europe/Paris", "Europe/Berlin",
        "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney"
    ];

    return (
        <DevToolLayout featureKey="timezoneConverter">
            <div className="max-w-xl mx-auto space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your Time</label>
                        <input
                            type="datetime-local"
                            value={local}
                            onChange={e => setLocal(e.target.value)}
                            className="w-full p-3 rounded-xl border dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Zone</label>
                        <select
                            value={targetTz}
                            onChange={e => setTargetTz(e.target.value)}
                            className="w-full p-3 rounded-xl border dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                        >
                            {commonTz.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                    </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-800/30 text-center relative group">
                    <div className="text-xs font-bold uppercase text-indigo-500 mb-2">Converted Time</div>
                    <div className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
                        {convert()}
                    </div>
                    <button
                        onClick={() => { navigator.clipboard.writeText(convert()); toast.success("Copied!"); }}
                        className="absolute top-4 right-4 text-indigo-300 hover:text-indigo-600"
                    >
                        <i className="fa-regular fa-copy"></i>
                    </button>
                </div>
            </div>
        </DevToolLayout>
    );
}

// --- CRON EXPLAINER ---
export function CronExplainer() {
    const [cron, setCron] = useState("* * * * *");

    const explain = () => {
        const parts = cron.trim().split(/\s+/);
        if (parts.length !== 5) return "Invalid format. Expected 5 parts: Min Hour Dom Month Dow";

        const [min, hour, dom, mon, dow] = parts;

        // Very basic heuristics for "Daily Use"
        // Writing a full english parser is complex, we handle common cases.

        if (cron === "* * * * *") return "Every minute";
        if (min === "0" && hour === "*" && dom === "*" && mon === "*" && dow === "*") return "At minute 0 past every hour.";
        if (min === "0" && hour === "0" && dom === "*" && mon === "*" && dow === "*") return "At 00:00 every day.";
        if (min === "0" && hour === "0" && dom === "*" && mon === "*" && dow === "0") return "At 00:00 on Sunday.";

        let desc = "Runs ";

        // Time
        if (hour !== "*" && min !== "*") desc += `at ${hour}:${min.padStart(2, '0')}`;
        else if (min !== "*") desc += `at minute ${min}`;
        else desc += "every minute";

        // Date
        if (dow !== "*") desc += ` on day-of-week ${dow}`;
        if (dom !== "*") desc += ` on day-of-month ${dom}`;

        return desc + ".";
    };

    return (
        <DevToolLayout featureKey="cronExplainer">
            <div className="max-w-xl mx-auto space-y-6 text-center">
                <input
                    type="text"
                    value={cron}
                    onChange={e => setCron(e.target.value)}
                    placeholder="* * * * *"
                    className="w-full text-center p-4 text-3xl font-mono font-bold rounded-2xl border bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 outline-none focus:border-purple-500"
                />
                <div className="text-xs text-gray-400 font-mono">Min Hour Day Month Weekday</div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-8 rounded-3xl border border-purple-100 dark:border-purple-800/30">
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                        {explain()}
                    </div>
                </div>
            </div>
        </DevToolLayout>
    );
}
