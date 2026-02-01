
import React, { useState, useEffect } from 'react';
import {
    Shield,
    ShieldAlert,
    ShieldCheck,
    Clock,
    Copy,
    Key,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    FileJson
} from 'lucide-react';
import * as jose from 'jose';
import { SEO } from '../../components/SEO';
import toast from 'react-hot-toast';

export function JwtDecoder() {
    const [token, setToken] = useState('');
    const [secret, setSecret] = useState('');
    const [decodedHeader, setDecodedHeader] = useState(null);
    const [decodedPayload, setDecodedPayload] = useState(null);
    const [signatureStatus, setSignatureStatus] = useState('unchecked'); // unchecked, valid, invalid
    const [error, setError] = useState(null);
    const [isExpired, setIsExpired] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [activeTab, setActiveTab] = useState('payload');

    // Decode token whenever it changes
    useEffect(() => {
        if (!token) {
            setDecodedHeader(null);
            setDecodedPayload(null);
            setError(null);
            setSignatureStatus('unchecked');
            setIsExpired(false);
            return;
        }

        try {
            // fast decode without validation
            const header = jose.decodeProtectedHeader(token);
            const payload = jose.decodeJwt(token);

            setDecodedHeader(header);
            setDecodedPayload(payload);
            setError(null);

            // Check expiration
            if (payload.exp) {
                const now = Math.floor(Date.now() / 1000);
                setIsExpired(payload.exp < now);
            } else {
                setIsExpired(false);
            }

        } catch (err) {
            setDecodedHeader(null);
            setDecodedPayload(null);
            if (token.split('.').length === 3) {
                setError("Invalid JWT format");
            }
        }
    }, [token]);

    // Validate signature if secret is provided
    useEffect(() => {
        const validateToken = async () => {
            if (!token || !secret || !decodedHeader) {
                setSignatureStatus('unchecked');
                return;
            }

            try {
                const alg = decodedHeader.alg;
                const encoder = new TextEncoder();

                let key;
                if (alg.startsWith('HS')) {
                    key = encoder.encode(secret);
                } else if (alg.startsWith('RS') || alg.startsWith('ES')) {
                    key = await jose.importSPKI(secret, alg);
                } else {
                    key = encoder.encode(secret);
                }

                await jose.jwtVerify(token, key);
                setSignatureStatus('valid');
            } catch (err) {
                setSignatureStatus('invalid');
            }
        };

        const timeoutId = setTimeout(() => {
            validateToken();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [token, secret, decodedHeader]);

    // Timer
    useEffect(() => {
        if (!decodedPayload?.exp) {
            setTimeLeft('');
            return;
        }
        const interval = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const diff = decodedPayload.exp - now;
            if (diff < 0) {
                setTimeLeft('Expired');
                setIsExpired(true);
            } else {
                const days = Math.floor(diff / 86400);
                const hours = Math.floor((diff % 86400) / 3600);
                const minutes = Math.floor((diff % 3600) / 60);
                const seconds = diff % 60;
                let timeString = '';
                if (days > 0) timeString += `${days}d `;
                if (hours > 0) timeString += `${hours}h `;
                if (minutes > 0) timeString += `${minutes}m `;
                timeString += `${seconds}s`;
                setTimeLeft(timeString);
                setIsExpired(false);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [decodedPayload]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(JSON.stringify(text, null, 2));
        toast.success('Copied to clipboard');
    };

    const pasteToken = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setToken(text);
            toast.success('Pasted from clipboard');
        } catch (err) {
            toast.error('Failed to read clipboard');
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
            <SEO
                title="JWT Decoder & Validator - EasyConvert"
                description="Decode, verify and debug JWT tokens securely in your browser. Supports HS256, RS256, and expiration checking."
                keywords="JWT Decoder, JSON Web Token Debugger, Verify JWT, HS256 RS256 Validator, Access Token Decoder"
            />

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <ShieldCheck className="text-blue-600 dark:text-blue-400" />
                        JWT Decoder
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Decode, verify, and inspect JSON Web Tokens locally.
                    </p>
                </div>
                {decodedPayload && (
                    <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold ${isExpired ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {isExpired ? <ShieldAlert size={18} /> : <Clock size={18} />}
                        {isExpired ? 'Token Expired' : `Valid for ${timeLeft}`}
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-200px)] min-h-[600px]">
                {/* Input Section */}
                <div className="flex flex-col gap-6 h-full">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FileJson size={16} /> Encoded Token
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setToken('')}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-600 dark:text-gray-300"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={pasteToken}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium transition-colors"
                                >
                                    Paste
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste your JWT here (eyJhbGciOi...)"
                            className="flex-1 w-full p-4 font-mono text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none outline-none transition-all"
                            spellCheck={false}
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Key size={16} /> Verify Signature
                            </label>
                            {signatureStatus === 'valid' && (
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <CheckCircle2 size={14} /> Signature Verified
                                </span>
                            )}
                            {signatureStatus === 'invalid' && (
                                <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <XCircle size={14} /> Invalid Signature
                                </span>
                            )}
                        </div>
                        <input
                            type="text"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            placeholder={decodedHeader?.alg?.startsWith('RS') ? 'Paste exact Public Key (PEM)...' : 'your-256-bit-secret'}
                            className={`w-full p-3 font-mono text-sm bg-gray-50 dark:bg-slate-900 border rounded-xl outline-none transition-all ${signatureStatus === 'valid'
                                ? 'border-green-500 ring-1 ring-green-500'
                                : signatureStatus === 'invalid'
                                    ? 'border-red-500 ring-1 ring-red-500'
                                    : 'border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                                }`}
                        />
                    </div>
                </div>

                {/* Output Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-full overflow-hidden">
                    {/* Tabs with Colors */}
                    <div className="flex border-b border-gray-100 dark:border-slate-700">
                        <button
                            onClick={() => setActiveTab('header')}
                            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'header' ? 'border-red-500 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/10' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            HEADER
                        </button>
                        <button
                            onClick={() => setActiveTab('payload')}
                            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'payload' ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            PAYLOAD
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-6 relative">
                        {error && (
                            <div className="flex flex-col items-center justify-center h-full text-red-500">
                                <AlertTriangle size={48} className="mb-4 opacity-50" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        {!decodedHeader && !error && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Shield size={48} className="mb-4 opacity-20" />
                                <p>Paste a token to decode</p>
                            </div>
                        )}

                        {activeTab === 'header' && decodedHeader && (
                            <div className="relative group animate-fade-in">
                                <button
                                    onClick={() => copyToClipboard(decodedHeader)}
                                    className="absolute top-0 right-0 p-2 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Copy size={18} />
                                </button>
                                <pre className="font-mono text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                                    {JSON.stringify(decodedHeader, null, 2)}
                                </pre>

                                <div className="mt-8">
                                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Algorithm details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                                            <span className="text-xs text-gray-500 block">Type</span>
                                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{decodedHeader.typ || 'JWT'}</span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                                            <span className="text-xs text-gray-500 block">Algorithm</span>
                                            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{decodedHeader.alg}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'payload' && decodedPayload && (
                            <div className="relative group animate-fade-in">
                                <button
                                    onClick={() => copyToClipboard(decodedPayload)}
                                    className="absolute top-0 right-0 p-2 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Copy size={18} />
                                </button>
                                <pre className="font-mono text-sm text-purple-700 dark:text-purple-300 whitespace-pre-wrap">
                                    {JSON.stringify(decodedPayload, null, 2)}
                                </pre>

                                <div className="mt-8 border-t border-gray-100 dark:border-slate-700 pt-6">
                                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider">Standard Claims</h3>
                                    <div className="space-y-3">
                                        {['iss', 'sub', 'aud', 'exp', 'iat', 'nbf', 'jti'].map(claim => {
                                            if (!decodedPayload[claim]) return null;
                                            let value = decodedPayload[claim];
                                            if (['exp', 'iat', 'nbf'].includes(claim)) {
                                                value = new Date(value * 1000).toLocaleString();
                                            }
                                            const descriptions = {
                                                iss: 'Issuer', sub: 'Subject', aud: 'Audience',
                                                exp: 'Expiration Time', iat: 'Issued At',
                                                nbf: 'Not Before', jti: 'JWT ID'
                                            };
                                            return (
                                                <div key={claim} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-50 dark:border-slate-700/50 last:border-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-1.5 py-0.5 rounded">{claim}</span>
                                                        <span className="text-xs text-gray-500">{descriptions[claim]}</span>
                                                    </div>
                                                    <span className={`text-sm font-medium ${claim === 'exp' && isExpired ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {value}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
