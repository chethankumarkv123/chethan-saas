
import { useState } from 'react';
import { useUI } from '../context/UIContext';
import { SEO } from '../components/SEO';
import { TrustBar } from '../components/TrustBar';
import { RelatedTools } from '../components/RelatedTools';
import { SeoContent } from '../components/SeoContent';
import { FEATURES } from '../config/FEATURE_CONFIG';

export function CompareText() {
    const { showModal } = useUI();
    const feature = FEATURES.compareText;

    const [sourceText, setSourceText] = useState('');
    const [targetText, setTargetText] = useState('');
    const [options, setOptions] = useState({
        ignoreCase: true,
        ignoreWhitespace: true,
        ignorePunctuation: false,
        ignoreNumbers: false
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [result, setResult] = useState(null);

    const processText = (text) => {
        let t = text;
        if (options.ignoreCase) t = t.toLowerCase();
        if (options.ignoreWhitespace) t = t.replace(/\s+/g, ' ').trim();
        if (options.ignorePunctuation) t = t.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
        if (options.ignoreNumbers) t = t.replace(/[0-9]/g, '');
        return t;
    };

    const compare = () => {
        if (!sourceText || !targetText) return;

        const s = processText(sourceText);
        const t = processText(targetText);

        const sWords = s.split(' ').filter(Boolean);
        const tWords = t.split(' ').filter(Boolean);

        const common = sWords.filter(w => tWords.includes(w));
        const removed = sWords.filter(w => !tWords.includes(w));
        const added = tWords.filter(w => !sWords.includes(w));

        // Levenshtein
        const levenshtein = (a, b) => {
            if (a.length == 0) return b.length;
            if (b.length == 0) return a.length;
            const matrix = [];
            for (let i = 0; i <= b.length; i++) matrix[i] = [i];
            for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) == a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
                    else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                }
            }
            return matrix[b.length][a.length];
        };

        setResult({
            commonPercent: Math.round((common.length / Math.max(sWords.length, tWords.length)) * 100) || 0,
            diffPercent: 100 - (Math.round((common.length / Math.max(sWords.length, tWords.length)) * 100) || 0),
            commonCount: common.length,
            diffCount: Math.abs(sWords.length - tWords.length),
            distance: levenshtein(s, t),
            removed,
            added
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-24">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords="compare text, diff checker, text difference, compare strings"
            />

            {/* Tool Area */}
            <div className="h-[calc(100vh-100px)] px-4 pb-4 flex flex-col">
                <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col min-h-0">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4 shrink-0 px-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                                <i className="fa-solid fa-code-compare text-xl"></i>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                {feature.title}
                            </h1>
                        </div>

                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="group flex items-center gap-2.5 text-xs md:text-sm bg-slate-900 dark:bg-slate-800 text-white font-black py-2.5 px-4 md:px-6 rounded-xl shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all border border-slate-700 active:scale-[0.98] min-h-[44px]"
                        >
                            <i className="fa-solid fa-sliders-h text-blue-400 group-hover:rotate-180 transition-transform duration-500"></i>
                            <span>Settings</span>
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow flex flex-col gap-4 min-h-0">

                        {/* Inputs Row */}
                        <div className={`grid md:grid-cols-2 gap-4 ${result ? 'h-1/2' : 'flex-grow'} transition-all duration-300 min-h-[200px]`}>
                            <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 overflow-hidden">
                                <div className="p-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 shrink-0">
                                    <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">Source Text</h3>
                                    <button onClick={() => setSourceText('')} className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50">Clear</button>
                                </div>
                                <textarea
                                    className="flex-grow p-4 resize-none outline-none dark:bg-slate-900 dark:text-gray-200 text-sm"
                                    placeholder="Paste original text..."
                                    value={sourceText}
                                    onChange={e => setSourceText(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 overflow-hidden">
                                <div className="p-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 shrink-0">
                                    <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">Target Text</h3>
                                    <button onClick={() => setTargetText('')} className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50">Clear</button>
                                </div>
                                <textarea
                                    className="flex-grow p-4 resize-none outline-none dark:bg-slate-900 dark:text-gray-200 text-sm"
                                    placeholder="Paste modified text..."
                                    value={targetText}
                                    onChange={e => setTargetText(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* Results Row (conditionally rendered) */}
                        {result && (
                            <div className="flex-grow h-1/2 bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col animate-slide-up">
                                <div className="p-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 shrink-0">
                                    <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">Comparison Results</h3>
                                    <button onClick={() => setResult(null)} className="text-xs text-gray-500 hover:text-gray-700"><i className="fa-solid fa-times"></i> Close</button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-4 gap-4 mb-6">
                                        <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Similarity</p>
                                            <p className="text-xl font-bold text-teal-600">{result.commonPercent}%</p>
                                        </div>
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Difference</p>
                                            <p className="text-xl font-bold text-red-600">{result.diffPercent}%</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Distance</p>
                                            <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{result.distance}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Changes</p>
                                            <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{result.diffCount}</p>
                                        </div>
                                    </div>

                                    {/* Lists */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                                            <h4 className="font-bold text-red-700 text-sm mb-3 flex items-center gap-2">
                                                <i className="fa-solid fa-minus-circle"></i> Removed (Unique to Source)
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.removed.length > 0 ? result.removed.map((w, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-white dark:bg-slate-800 text-red-600 text-xs rounded border border-red-200 dark:border-red-900">{w}</span>
                                                )) : <span className="text-gray-400 italic text-xs">No unique words</span>}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                                            <h4 className="font-bold text-green-700 text-sm mb-3 flex items-center gap-2">
                                                <i className="fa-solid fa-plus-circle"></i> Added (Unique to Target)
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.added.length > 0 ? result.added.map((w, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-white dark:bg-slate-800 text-green-600 text-xs rounded border border-green-200 dark:border-green-900">{w}</span>
                                                )) : <span className="text-gray-400 italic text-xs">No unique words</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Toolbar */}
                    <div className="hidden md:flex mt-4 bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-700/50 shrink-0 items-center justify-between gap-6 px-6">
                        <div className="flex flex-wrap gap-4">
                            {Object.keys(options).map(key => (
                                <label key={key} className="group flex items-center gap-2.5 cursor-pointer text-sm bg-slate-800/50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all active:scale-95 select-none">
                                    <input
                                        type="checkbox"
                                        checked={options[key]}
                                        onChange={e => setOptions({ ...options, [key]: e.target.checked })}
                                        className="hidden"
                                    />
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${options[key] ? 'bg-teal-600 shadow-[0_0_12px_rgba(20,184,166,0.4)]' : 'bg-slate-700'}`}>
                                        <i className={`fa-solid fa-check text-[10px] text-white transition-opacity ${options[key] ? 'opacity-100' : 'opacity-0'}`}></i>
                                    </div>
                                    <span className="text-slate-300 font-bold tracking-tight capitalize">{key.replace(/([A-Z])/g, ' $1').replace('ignore', '').trim()}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={compare}
                            className="px-10 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black rounded-xl shadow-[0_4px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_6px_25px_rgba(20,184,166,0.4)] transition-all active:scale-[0.97] flex items-center gap-3 text-sm"
                        >
                            <i className="fa-solid fa-code-compare"></i>
                            COMPARE NOW
                        </button>
                    </div>

                    {/* Mobile Sticky Action Bar */}
                    <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800 z-40 safe-area-bottom flex flex-col gap-4 shadow-[0_-8px_20px_-4px_rgba(0,0,0,0.3)]">
                        {/* Quick Selection Options */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Quick Config</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                                {Object.keys(options).map(key => (
                                    <button
                                        key={key}
                                        onClick={() => setOptions(prev => ({ ...prev, [key]: !prev[key] }))}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border min-h-[42px] flex items-center justify-center tracking-tight ${options[key]
                                            ? 'bg-teal-600 border-teal-500 text-white shadow-lg scale-105'
                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                    >
                                        {key.replace('ignore', '').toUpperCase()} {options[key] ? 'ON' : 'OFF'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="w-14 h-14 bg-slate-800 text-teal-400 rounded-2xl font-black border border-slate-700 active:scale-90 transition-all flex items-center justify-center shadow-lg"
                            >
                                <i className="fa-solid fa-sliders-h text-xl"></i>
                            </button>
                            <button
                                onClick={compare}
                                disabled={!sourceText || !targetText}
                                className="flex-1 h-14 bg-gradient-to-r from-teal-600 to-emerald-600 active:scale-[0.98] disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-black rounded-2xl shadow-[0_4px_15px_rgba(20,184,166,0.3)] flex items-center justify-center gap-2 text-base transition-all"
                            >
                                <i className="fa-solid fa-code-compare"></i>
                                COMPARE NOW
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEO Content */}
            <div className="max-w-6xl mx-auto px-4 pb-20 mt-8">
                <TrustBar />
                <RelatedTools toolKeys={feature.related} />
                <SeoContent feature={feature} />
            </div>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full md:max-w-2xl rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden animate-slide-up md:animate-scale-up max-h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
                            <h2 className="text-xl font-medium text-[#008eb0] dark:text-sky-400 flex items-center gap-3">
                                <i className="fa-solid fa-gear"></i> Converter Settings
                            </h2>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 transition p-2">
                                <i className="fa-solid fa-times text-xl"></i>
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
                            {Object.keys(options).map(key => (
                                <div key={key} className="space-y-3">
                                    <label className="block font-bold text-sm text-gray-700 dark:text-gray-200">
                                        Ignore {key.replace('ignore', '').replace(/([A-Z])/g, ' $1').trim()}
                                    </label>
                                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-900/50 rounded-xl">
                                        <button
                                            onClick={() => setOptions(prev => ({ ...prev, [key]: true }))}
                                            className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition ${options[key] ? 'bg-white shadow text-blue-600 dark:bg-slate-700 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={() => setOptions(prev => ({ ...prev, [key]: false }))}
                                            className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition ${!options[key] ? 'bg-white shadow text-blue-600 dark:bg-slate-700 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            No
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex justify-end bg-gray-50/50 dark:bg-slate-900/20 shrink-0 safe-area-bottom">
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="w-full md:w-auto px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg transition-transform active:scale-95 text-base"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
