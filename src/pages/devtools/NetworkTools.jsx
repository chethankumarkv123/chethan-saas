import { useState, useMemo } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { toast } from '../../components/Toast';

// --- HELPER FUNCTIONS ---
function ipToLong(ip) {
    let components = ip.split('.');
    if (components.length !== 4) return null;
    let ipl = 0;
    for (let i = 0; i < 4; i++) {
        let octet = parseInt(components[i]);
        if (isNaN(octet) || octet < 0 || octet > 255) return null;
        ipl += octet * Math.pow(256, 3 - i);
    }
    return ipl;
}

function longToIp(ipl) {
    if (ipl < 0) ipl = 0xFFFFFFFF + ipl + 1;
    return (
        (ipl >>> 24) + '.' +
        (ipl >> 16 & 255) + '.' +
        (ipl >> 8 & 255) + '.' +
        (ipl & 255)
    );
}

function maskToCidr(mask) {
    const long = ipToLong(mask);
    if (!long) return null;
    let c = 0;
    for (let i = 31; i >= 0; i--) {
        if ((long & (1 << i)) !== 0) c++;
        else break;
    }
    return c;
}

function calculateCidrData(ip, cidr) {
    const ipLong = ipToLong(ip);
    if (ipLong === null) return null;

    cidr = parseInt(cidr);
    if (isNaN(cidr) || cidr < 0 || cidr > 32) return null;

    const mask = ~(Math.pow(2, 32 - cidr) - 1);
    const networkLong = ipLong & mask;
    const broadcastLong = networkLong + Math.pow(2, 32 - cidr) - 1;

    const count = Math.pow(2, 32 - cidr);
    const usableCount = count <= 2 ? 0 : count - 2;

    const firstLong = usableCount > 0 ? networkLong + 1 : networkLong;
    const lastLong = usableCount > 0 ? broadcastLong - 1 : broadcastLong;

    return {
        type: 'cidr',
        network: longToIp(networkLong),
        broadcast: longToIp(broadcastLong),
        mask: longToIp(mask),
        cidr: cidr,
        first: longToIp(firstLong),
        last: longToIp(lastLong),
        total: count,
        usable: usableCount,
        // New Comparison Features
        ipClass: getIpClass(ipLong),
        ipType: getIpType(ipLong),
        binaryMask: (mask >>> 0).toString(2).padStart(32, '0').match(/.{1,8}/g).join('.')
    };
}

function getIpClass(ipLong) {
    const firstOctet = (ipLong >>> 24) & 0xFF;
    if (firstOctet < 128) return 'A';
    if (firstOctet < 192) return 'B';
    if (firstOctet < 224) return 'C';
    if (firstOctet < 240) return 'D (Multicast)';
    return 'E (Experimental)';
}

function getIpType(ipLong) {
    // Private ranges:
    // 10.0.0.0/8     -> 167772160 to 184549375
    // 172.16.0.0/12  -> 2886729728 to 2887778303
    // 192.168.0.0/16 -> 3232235520 to 3232301055
    // 127.0.0.0/8 (Loopback) -> 2130706432 to 2147483647

    // Unsigned conversion for safe comparison
    const unsigned = ipLong >>> 0;

    if ((unsigned >= 167772160 && unsigned <= 184549375) ||
        (unsigned >= 2886729728 && unsigned <= 2887778303) ||
        (unsigned >= 3232235520 && unsigned <= 3232301055)) {
        return 'Private';
    }
    if (unsigned >= 2130706432 && unsigned <= 2147483647) return 'Loopback';

    return 'Public';
}

const ResultRow = ({ label, value, sub }) => (
    <div className="flex justify-between items-start py-3 border-b border-gray-100 dark:border-slate-700 last:border-0">
        <div>
            <span className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider block pt-1">{label}</span>
            {sub && <span className="text-xs text-gray-400 font-medium">{sub}</span>}
        </div>
        <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-lg text-gray-800 dark:text-gray-100 break-all text-right">{value}</span>
            <button
                onClick={() => {
                    navigator.clipboard.writeText(value);
                    toast.success("Copied!");
                }}
                className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                title="Copy"
            >
                <i className="fa-regular fa-copy"></i>
            </button>
        </div>
    </div>
);

// --- UNIFIED TOOL ---
export function IpSubnetCalculator() {
    const [input, setInput] = useState("");

    const data = useMemo(() => {
        const val = input.trim();
        if (!val) return null;

        // 1. IP Range: "192.168.1.1 - 192.168.1.50"
        if (val.includes('-')) {
            const parts = val.split('-').map(p => p.trim());
            if (parts.length === 2) {
                const s = ipToLong(parts[0]);
                const e = ipToLong(parts[1]);
                if (s !== null && e !== null && e >= s) {
                    const total = e - s + 1;
                    return {
                        type: 'range',
                        start: parts[0],
                        end: parts[1],
                        total,
                        // Rough logic to guess equivalent CIDR if aligned?
                        // For now just basic range logic as requested.
                    };
                }
            }
        }

        // 2. IP + Mask: "192.168.1.1 255.255.255.0"
        if (val.includes(' ') && !val.includes('/')) {
            const parts = val.split(/\s+/);
            if (parts.length === 2) {
                const ip = parts[0];
                const mask = parts[1];
                const cidr = maskToCidr(mask);
                if (cidr !== null) {
                    return calculateCidrData(ip, cidr);
                }
            }
        }

        // 3. CIDR: "192.168.1.1/24" (or just IP "/32")
        const [ip, cidrStr] = val.split('/');
        const cidr = cidrStr ? parseInt(cidrStr) : 32;
        return calculateCidrData(ip, cidr);

    }, [input]);

    return (
        <DevToolLayout featureKey="ipSubnetCalculator">
            <div className="max-w-2xl mx-auto">
                {/* Input */}
                <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm mb-8">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="192.168.1.1/24  OR  10.0.0.1 255.0.0.0  OR  1.1.1.1 - 1.1.1.5"
                        className="w-full p-4 bg-transparent font-mono text-lg outline-none text-center font-bold text-gray-800 dark:text-white placeholder:font-normal placeholder:text-gray-300 dark:placeholder:text-slate-600"
                        autoFocus
                    />
                </div>

                {data ? (
                    <div className="space-y-6 animate-fade-in-up">

                        {/* SECTION 1: SUMMARY */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 border-b border-blue-100 dark:border-blue-900/30 flex justify-between items-center">
                                <h3 className="text-blue-800 dark:text-blue-300 font-bold text-lg">Subnet Summary</h3>
                                {data.cidr && <span className="font-mono text-sm bg-white dark:bg-slate-900 px-3 py-1 rounded-full text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">/{data.cidr}</span>}
                            </div>
                            <div className="p-6 space-y-1">
                                <ResultRow label="Network Address" value={data.network} />
                                <ResultRow label="Subnet Mask" value={data.mask} />
                                <ResultRow label="CIDR" value={`/${data.cidr}`} />
                                <ResultRow label="Total IPs" value={data.total.toLocaleString()} />
                                <ResultRow label="Usable IPs" value={data.usable.toLocaleString()} />
                            </div>
                        </div>

                        {/* SECTION 2: USABLE RANGE */}
                        {data.usable > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                                    <h3 className="text-gray-800 dark:text-gray-200 font-bold text-lg">Usable IP Range</h3>
                                    <p className="text-xs text-gray-400 mt-1">IPs that can be assigned to devices</p>
                                </div>
                                <div className="p-6">
                                    <ResultRow label="First Usable IP" value={data.first} />
                                    <ResultRow label="Last Usable IP" value={data.last} />
                                </div>
                            </div>
                        )}

                        {/* SECTION 3: ADVANCED DETAILS (COLLAPSIBLE) */}
                        <details className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden group">
                            <summary className="px-6 py-4 cursor-pointer flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <h3 className="text-gray-600 dark:text-gray-300 font-bold text-lg select-none">Advanced Network Details</h3>
                                <div className="text-blue-500 transform transition-transform group-open:rotate-180">
                                    <i className="fa-solid fa-chevron-down"></i>
                                </div>
                            </summary>
                            <div className="p-6 border-t border-gray-100 dark:border-slate-700 space-y-1 bg-gray-50/50 dark:bg-slate-900/20">
                                <ResultRow label="Broadcast Address" value={data.broadcast} />
                                <ResultRow label="Wildcard Mask (ACL)" value={longToIp(~ipToLong(data.mask) & 0xFFFFFFFF)} />
                                <ResultRow label="Address Class" value={data.ipClass} />
                                <ResultRow label="Network Type" value={data.ipType} />
                                <ResultRow label="Binary Subnet Mask" value={data.binaryMask} font="text-xs" />
                            </div>
                        </details>

                    </div>
                ) : (
                    input && (
                        <div className="text-center py-12 opacity-50">
                            <i className="fa-solid fa-circle-question text-4xl mb-4 text-gray-300"></i>
                            <p className="text-gray-400">Enter a valid IP, CIDR, or Range to see details.</p>
                        </div>
                    )
                )}

                {!data && !input && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-12 bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                        <div className="p-4">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-2">CIDR Support</div>
                            <div className="font-mono text-sm text-gray-600 dark:text-gray-400">192.168.1.0/24</div>
                        </div>
                        <div className="p-4">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-2">Subnet Mask</div>
                            <div className="font-mono text-sm text-gray-600 dark:text-gray-400">10.0.0.1 255.0.0.0</div>
                        </div>
                        <div className="p-4">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-2">IP Range</div>
                            <div className="font-mono text-sm text-gray-600 dark:text-gray-400">10.1.1.5 - 10.1.1.20</div>
                        </div>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}

// Keep old exports so we don't break App.jsx imports before update
// But these can now be just placeholders or removed if we update App.jsx immediately
export function IpCalculator() { return null; }
export function SubnetCalculator() { return null; }
export function UsableIpCalc() { return null; }
export function IpRangeCalc() { return null; }

// Restore CidrOverlap functionality independently
function getCidrData(input) { return calculateCidrData(input.split('/')[0], input.split('/')[1] || 32); }

const IpInput = ({ value, onChange, placeholder, label }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 font-mono text-lg focus:ring-2 focus:ring-blue-500 outline-none" />
    </div>
);

export function CidrOverlap() {
    const [c1, setC1] = useState("");
    const [c2, setC2] = useState("");
    const [overlap, setOverlap] = useState(null);

    const check = () => {
        const d1 = calculateCidrData(c1.split('/')[0], c1.split('/')[1] || 32);
        const d2 = calculateCidrData(c2.split('/')[0], c2.split('/')[1] || 32);
        if (!d1 || !d2) { setOverlap(null); return; }
        const start1 = ipToLong(d1.network);
        const end1 = ipToLong(d1.broadcast);
        const start2 = ipToLong(d2.network);
        const end2 = ipToLong(d2.broadcast);
        setOverlap(Math.max(start1, start2) <= Math.min(end1, end2));
    };

    return (
        <DevToolLayout featureKey="cidrOverlap">
            <div className="max-w-xl mx-auto space-y-6">
                <IpInput value={c1} onChange={setC1} placeholder="10.0.0.0/16" label="CIDR Block 1" />
                <IpInput value={c2} onChange={setC2} placeholder="10.0.1.0/24" label="CIDR Block 2" />
                <button onClick={check} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                    <i className="fa-solid fa-check"></i> Check Overlap
                </button>
                {overlap !== null && (
                    <div className={`p-6 rounded-xl border text-center animate-fade-in-up ${overlap ? 'bg-red-50 border-red-200 dark:bg-red-900/20' : 'bg-green-50 border-green-200 dark:bg-green-900/20'}`}>
                        <div className={`text-3xl font-bold mb-2 ${overlap ? 'text-red-600' : 'text-green-600'}`}>{overlap ? "OVERLAP DETECTED" : "NO OVERLAP"}</div>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}
