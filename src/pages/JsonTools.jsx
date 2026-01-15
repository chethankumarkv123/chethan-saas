
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
        } catch (err) {
            toast.error("Failed to read clipboard");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords="json formatter, json validator, json minifier, online json tool"
            />

            {/* Tool Area - Constrained Height for "Single View" feel */}
            <div className="h-[calc(100vh-100px)] px-4 pb-8 flex flex-col">
                <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">{feature.title}</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex-grow grid lg:grid-cols-2 gap-4 min-h-0">
                        {/* Input */}
                        <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 overflow-hidden h-full">
                            <div className="p-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">Input JSON</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => setInput('')} className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50">Clear</button>
                                    <button onClick={handlePaste} className="text-xs text-blue-500 hover:text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50">Paste</button>
                                </div>
                            </div>
                            <div className="relative flex-grow min-h-0">
                                <textarea
                                    className={`absolute inset-0 w-full h-full p-4 font-mono text-xs resize-none outline-none dark:bg-slate-800 dark:text-gray-300 ${error ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder='{"key": "value"}'
                                    spellCheck="false"
                                />
                            </div>
                            {error && (
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs font-mono border-t border-red-200 dark:border-red-800">
                                    Error: {error}
                                </div>
                            )}
                        </div>

                        {/* Controls & Output */}
                        <div className="flex flex-col gap-4 h-full">
                            {/* Integrated Toolbar */}
                            <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 shrink-0">
                                {mode === 'formatter' && (
                                    <>
                                        <button onClick={formatJson} className="flex-1 py-1.5 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold transition text-sm shadow-sm">
                                            <i className="fa-solid fa-align-left mr-2"></i> Beautify
                                        </button>
                                        <button onClick={minifyJson} className="flex-1 py-1.5 px-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition text-sm">
                                            <i className="fa-solid fa-compress mr-2"></i> Minify
                                        </button>
                                    </>
                                )}
                                <button onClick={() => validateJson(false)} className="flex-1 py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition text-sm shadow-sm">
                                    <i className="fa-solid fa-check-double mr-2"></i> Validate
                                </button>
                            </div>

                            {/* Output Area - Automatic Height */}
                            <div className="flex-grow flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 overflow-hidden min-h-0">
                                <div className="p-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                                    <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">Result</h3>
                                    <button onClick={handleCopy} className="text-xs text-blue-500 hover:text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50">Copy</button>
                                </div>
                                <div className="relative flex-grow min-h-0">
                                    <textarea
                                        className="absolute inset-0 w-full h-full p-4 font-mono text-xs resize-none outline-none dark:bg-slate-800 dark:text-gray-300 bg-gray-50/50"
                                        value={output}
                                        readOnly
                                        spellCheck="false"
                                        placeholder="Result will appear here..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEO Content - Below Fold */}
            <div className="max-w-6xl mx-auto px-4 pb-20 mt-8">
                <TrustBar />
                <RelatedTools toolKeys={feature.related} />
                <SeoContent feature={feature} />
            </div>
        </div>
    );
}
