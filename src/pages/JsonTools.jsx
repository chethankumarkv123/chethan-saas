
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { SEO } from '../components/SEO';
import { TrustBar } from '../components/TrustBar';
import { RelatedTools } from '../components/RelatedTools';
import { SeoContent } from '../components/SeoContent';
import { FEATURES } from '../config/FEATURE_CONFIG';
import { toast } from '../components/Toast';

export function JsonTools({ mode = 'formatter' }) {
    // mode can be 'formatter' or 'validator'
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);
    const { showModal } = useUI();

    // Determine the active feature config based on mode
    const featureKey = mode === 'validator' ? 'jsonValidator' : 'jsonFormatter';
    const feature = FEATURES[featureKey];

    const validateJson = (silent = false) => {
        try {
            if (!input.trim()) {
                if (!silent) toast.error("Please enter some JSON first");
                return false;
            }
            const parsed = JSON.parse(input);
            setError(null);
            // Show result to confirm validation visually
            setOutput(JSON.stringify(parsed, null, 4));
            if (!silent) toast.success("Valid JSON!");
            return parsed;
        } catch (e) {
            setError(e.message);
            if (!silent) toast.error("Invalid JSON");
            return false;
        }
    };

    const formatJson = () => {
        const parsed = validateJson(true); // silent validation
        if (parsed) {
            setOutput(JSON.stringify(parsed, null, 4));
            toast.success("JSON Formatted");
        }
    };

    const minifyJson = () => {
        const parsed = validateJson(true);
        if (parsed) {
            setOutput(JSON.stringify(parsed));
            toast.success("JSON Minified");
        }
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast.success("Copied to clipboard");
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInput(text);
            // Auto-detect? Maybe not for huge files, but let's clear error
            setError(null);
        } catch (err) {
            toast.error("Failed to read clipboard");
        }
    };

    const loadSample = () => {
        const sample = {
            "project": "SuperApp",
            "version": 1.0,
            "features": ["auth", "database", "api"],
            "active": true,
            "owner": {
                "name": "Dev",
                "id": 123
            }
        };
        setInput(JSON.stringify(sample));
        setError(null);
        setOutput('');
    };

    // Auto-format for small inputs?
    useEffect(() => {
        if (input.length > 0 && input.length < 5000) {
            try {
                const p = JSON.parse(input);
                if (p) setError(null);
            } catch (e) { /* ignore while typing */ }
        }
    }, [input]);

    const getLineNumber = () => {
        if (!error) return null;
        // Try to extract position
        const match = error.match(/position (\d+)/);
        if (match) {
            const pos = parseInt(match[1]);
            const lines = input.substring(0, pos).split('\n');
            return lines.length;
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-24">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords="json formatter, json validator, json minifier, online json tool, json lint"
            />

            {/* Tool Area */}
            <div className="px-4 pb-8 flex flex-col">
                <div className="max-w-7xl mx-auto w-full flex flex-col">
                    <div className="text-center mb-6 shrink-0">
                        <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                            {feature.title}
                        </h1>
                        <p className="text-slate-400">Validate, format, and minify your JSON data instantly.</p>
                    </div>

                    <div className="flex-grow grid lg:grid-cols-2 gap-4 min-h-0">
                        {/* Input */}
                        <div className={`flex flex-col bg-slate-800 rounded-2xl shadow-lg border h-[40vh] md:h-[450px] overflow-hidden relative group transition-all hover:border-slate-600 ${error ? 'border-red-500/50' : 'border-slate-700'}`}>
                            <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 shrink-0">
                                <h3 className="text-sm font-bold tracking-wider text-slate-200 pl-1">INPUT JSON</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={loadSample} className="text-xs text-slate-400 hover:text-white font-medium px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">Sample</button>
                                    <div className="w-px h-4 bg-slate-700"></div>
                                    <button onClick={handlePaste} className="text-xs text-slate-400 hover:text-white font-medium px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"><i className="fa-regular fa-paste mr-1.5"></i>Paste</button>
                                    <div className="w-px h-4 bg-slate-700"></div>
                                    <button onClick={() => setInput('')} className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-900/20 transition-colors">Clear</button>
                                </div>
                            </div>
                            <div className="relative flex-grow">
                                <textarea
                                    className={`absolute inset-0 w-full h-full p-5 font-mono text-xs resize-none outline-none dark:bg-slate-800 dark:text-gray-300 placeholder:text-slate-600 ${error ? 'bg-red-500/5' : 'bg-transparent'}`}
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder='Paste JSON here...'
                                    spellCheck="false"
                                />

                                {/* Primary Actions CTA */}
                                <div className="absolute bottom-4 right-4 z-20 flex gap-3">
                                    {mode === 'formatter' ? (
                                        <>
                                            <button
                                                onClick={minifyJson}
                                                disabled={!input}
                                                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl shadow-lg transition-all active:scale-95 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <i className="fa-solid fa-compress"></i> Minify
                                            </button>
                                            <button
                                                onClick={formatJson}
                                                disabled={!input}
                                                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-900/30 transition-all active:scale-95 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <i className="fa-solid fa-align-left"></i> Format
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => validateJson(false)}
                                            disabled={!input}
                                            className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-green-900/30 transition-all active:scale-95 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <i className="fa-solid fa-check-double"></i> Validate
                                        </button>
                                    )}
                                </div>
                            </div>
                            {error && (
                                <div className="absolute bottom-4 left-4 z-10 animate-fade-in max-w-[calc(100%-270px)]">
                                    <div className="py-2.5 px-4 bg-red-950/90 backdrop-blur-md text-red-200 text-xs font-mono rounded-xl border border-red-500/30 shadow-xl flex items-center gap-3">
                                        <i className="fa-solid fa-circle-exclamation text-red-500 text-sm shrink-0"></i>
                                        <span className="break-words leading-tight">{error}</span>
                                        {getLineNumber() && <span className="font-bold bg-red-500/20 px-1.5 py-0.5 rounded text-red-100 text-[10px] whitespace-nowrap shrink-0">Line {getLineNumber()}</span>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Output */}
                        <div className={`flex flex-col bg-slate-800 rounded-2xl shadow-lg border border-slate-700 h-[40vh] md:h-[450px] overflow-hidden relative transition-all ${output ? 'border-cyan-500/30 shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)]' : ''}`}>
                            <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 shrink-0">
                                <h3 className="text-sm font-bold tracking-wider text-cyan-400 pl-1">RESULT</h3>
                                <button
                                    onClick={handleCopy}
                                    disabled={!output}
                                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold px-3 py-1.5 rounded-lg border border-slate-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <i className="fa-regular fa-copy"></i> Copy
                                </button>
                            </div>
                            <div className="relative flex-grow bg-slate-900/30">
                                {output ? (
                                    <textarea
                                        className="absolute inset-0 w-full h-full p-5 font-mono text-xs resize-none outline-none bg-transparent text-cyan-300 selection:bg-cyan-900/50"
                                        value={output}
                                        readOnly
                                        spellCheck="false"
                                        onClick={(e) => e.target.select()}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 select-none pointer-events-none">
                                        <i className="fa-solid fa-code text-3xl mb-3 opacity-20"></i>
                                        <p className="text-sm font-medium">Valid JSON will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEO Content - Below Fold */}
            <div className="max-w-6xl mx-auto px-4 pb-20 mt-8">
                <TrustBar />
                <RelatedTools toolKeys={feature.related} />
                <SeoContent featureKey={featureKey} />
            </div>
        </div>
    );
}
