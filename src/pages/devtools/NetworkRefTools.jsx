import { useState, useEffect } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { toast } from '../../components/Toast';

// --- PUBLIC IP ---
export function PublicIp() {
    const [ip, setIp] = useState("Loading...");
    const [type, setType] = useState("");

    useEffect(() => {
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => {
                setIp(data.ip);
                setType(data.ip.includes(':') ? "IPv6" : "IPv4");
            })
            .catch(() => {
                setIp("Could not detect IP (Blocker active?)");
                setType("Unknown");
            });
    }, []);

    return (
        <DevToolLayout featureKey="publicIp">
            <div className="max-w-md mx-auto text-center space-y-6">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-lg">
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Your Public IP Address</div>
                    <div className="text-4xl font-mono font-bold text-blue-600 dark:text-blue-400 break-all mb-2">
                        {ip}
                    </div>
                    <div className="text-sm font-bold text-gray-400">{type}</div>
                </div>

                <button
                    onClick={() => { navigator.clipboard.writeText(ip); toast.success("Copied!"); }}
                    className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-transform active:scale-95"
                >
                    <i className="fa-regular fa-copy mr-2"></i> Copy IP
                </button>
            </div>
        </DevToolLayout>
    );
}

// --- PORT LOOKUP ---
export function PortLookup() {
    const [port, setPort] = useState("");

    // Very basic common ports map
    const ports = {
        20: "FTP (Data)", 21: "FTP (Control)", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS", 67: "DHCP", 68: "DHCP", 69: "TFTP",
        80: "HTTP", 110: "POP3", 123: "NTP", 143: "IMAP", 443: "HTTPS", 445: "SMB", 3306: "MySQL", 5432: "PostgreSQL",
        6379: "Redis", 8080: "HTTP Alternate", 27017: "MongoDB"
    };

    const getService = () => {
        if (!port) return "Enter a port number";
        return ports[port] || "Unknown / Dynamic Port";
    };

    return (
        <DevToolLayout featureKey="portLookup">
            <div className="max-w-md mx-auto space-y-6 text-center">
                <input
                    type="number"
                    value={port}
                    onChange={e => setPort(e.target.value)}
                    placeholder="e.g. 443"
                    className="w-full text-center p-4 text-3xl font-mono font-bold rounded-2xl border bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 outline-none focus:border-teal-500"
                />

                <div className="bg-teal-50 dark:bg-teal-900/20 p-8 rounded-3xl border border-teal-100 dark:border-teal-800/30">
                    <div className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400 mb-2">Service</div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                        {getService()}
                    </div>
                </div>
            </div>
        </DevToolLayout>
    );
}

// --- HTTP STATUS ---
export function HttpStatus() {
    const [code, setCode] = useState("");

    const statuses = {
        200: "OK - Request succeeded.",
        201: "Created - Resource created.",
        204: "No Content - Action success but no body.",
        301: "Moved Permanently - URL changed.",
        302: "Found - Temp redirect.",
        304: "Not Modified - Cached version valid.",
        400: "Bad Request - Invalid syntax.",
        401: "Unauthorized - Auth required.",
        403: "Forbidden - Auth valid but no permission.",
        404: "Not Found - Resource doesn't exist.",
        405: "Method Not Allowed - Wrong HTTP method.",
        429: "Too Many Requests - Rate limited.",
        500: "Internal Server Error - Server crashed.",
        502: "Bad Gateway - Upstream invalid.",
        503: "Service Unavailable - Overloaded/Maintenance.",
        504: "Gateway Timeout - Upstream timed out."
    };

    const getExplain = () => {
        if (!code) return "Enter a status code";
        return statuses[code] || "Unknown Code";
    };

    return (
        <DevToolLayout featureKey="httpStatus">
            <div className="max-w-md mx-auto space-y-6 text-center">
                <input
                    type="number"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="e.g. 404"
                    className="w-full text-center p-4 text-3xl font-mono font-bold rounded-2xl border bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 outline-none focus:border-orange-500"
                />

                <div className="bg-orange-50 dark:bg-orange-900/20 p-8 rounded-3xl border border-orange-100 dark:border-orange-800/30">
                    <div className="text-xs font-bold uppercase text-orange-600 dark:text-orange-400 mb-2">Meaning</div>
                    <div className="text-xl font-bold text-gray-800 dark:text-white leading-relaxed">
                        {getExplain()}
                    </div>
                </div>
            </div>
        </DevToolLayout>
    );
}
