
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
            <div className="px-4 pb-8 flex flex-col">
                <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col min-h-0">
                    {/* Header */}
                    <div className="text-center mb-6 shrink-0">
                        <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                            <i className="fa-solid fa-code-compare text-teal-500"></i>
                            {feature.title}
                        </h1>
                        <p className="text-slate-400">Compare text differences and highlight changes.</p>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow flex flex-col gap-6 min-h-0">

                        {/* Inputs Row */}
                        <div className={`grid md:grid-cols-2 gap-4 transition-all duration-300`}>
                            {/* Source Input */}
                            <div className="flex flex-col bg-slate-800 rounded-2xl shadow-lg border border-slate-700 h-[40vh] md:h-[450px] overflow-hidden relative group transition-all hover:border-slate-600">
                                <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 shrink-0">
                                    <h3 className="text-sm font-bold tracking-wider text-slate-200 pl-1">SOURCE TEXT</h3>
                                    <div className="flex items-center gap-2">
                                        <button onClick={async () => {
                                            try {
                                                const text = await navigator.clipboard.readText();
                                                setSourceText(text);
                                                toast.success("Pasted!");
                                            } catch (e) { toast.error("Clipboard permission denied"); }
                                        }} className="text-xs text-slate-400 hover:text-white font-medium px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"><i className="fa-regular fa-paste mr-1.5"></i>Paste</button>
                                        <div className="w-px h-4 bg-slate-700"></div>
                                        <button onClick={() => setSourceText('')} className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-900/20 transition-colors">Clear</button>
                                    </div>
                                </div>
                                <textarea
                                    className="w-full h-full p-5 resize-none outline-none bg-transparent text-slate-300 text-sm font-mono leading-relaxed placeholder:text-slate-600"
                                    placeholder="Paste original text..."
                                    value={sourceText}
                                    onChange={e => setSourceText(e.target.value)}
                                    spellCheck={false}
                                ></textarea>
                            </div>

                            {/* Target Input */}
                            <div className="flex flex-col bg-slate-800 rounded-2xl shadow-lg border border-slate-700 h-[40vh] md:h-[450px] overflow-hidden relative group transition-all hover:border-slate-600">
                                <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 shrink-0">
                                    <h3 className="text-sm font-bold tracking-wider text-teal-400 pl-1">TARGET TEXT</h3>
                                    <div className="flex items-center gap-2">
                                        <button onClick={async () => {
                                            try {
                                                const text = await navigator.clipboard.readText();
                                                setTargetText(text);
                                                toast.success("Pasted!");
                                            } catch (e) { toast.error("Clipboard permission denied"); }
                                        }} className="text-xs text-slate-400 hover:text-white font-medium px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"><i className="fa-regular fa-paste mr-1.5"></i>Paste</button>
                                        <div className="w-px h-4 bg-slate-700"></div>
                                        <button onClick={() => setTargetText('')} className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-900/20 transition-colors">Clear</button>
                                    </div>
                                </div>
                                <div className="relative flex-grow">
                                    <textarea
                                        className="w-full h-full p-5 resize-none outline-none bg-transparent text-slate-300 text-sm font-mono leading-relaxed placeholder:text-slate-600"
                                        placeholder="Paste modified text..."
                                        value={targetText}
                                        onChange={e => setTargetText(e.target.value)}
                                        spellCheck={false}
                                    ></textarea>

                                    {/* Primary CTA */}
                                    <div className="absolute bottom-4 right-4 z-10">
                                        <button
                                            onClick={compare}
                                            disabled={!sourceText || !targetText}
                                            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-900/30 transition-all active:scale-95 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <i className="fa-solid fa-code-compare"></i>
                                            Compare
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results Row (conditionally rendered) */}
                        {/* Results Row (conditionally rendered) */}
                        {result && (
                            <div className="flex-grow h-[50vh] min-h-[500px] bg-slate-800 rounded-2xl shadow-xl border border-teal-500/30 overflow-hidden flex flex-col animate-slide-up">
                                <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 shrink-0">
                                    <h3 className="text-sm font-bold tracking-wider text-teal-400 pl-1">DIFFERENCE REPORT</h3>
                                    <button onClick={() => setResult(null)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2 py-1 hover:bg-slate-700 rounded transition"><i className="fa-solid fa-times"></i> Close Report</button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-6 custom-scrollbar bg-slate-900/30">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-4 gap-4 mb-8">
                                        <div className="p-4 bg-teal-900/20 rounded-xl border border-teal-500/20 text-center">
                                            <p className="text-xs text-teal-400 uppercase tracking-widest font-bold mb-1">Similarity</p>
                                            <p className="text-2xl font-black text-teal-500">{result.commonPercent}%</p>
                                        </div>
                                        <div className="p-4 bg-red-900/20 rounded-xl border border-red-500/20 text-center">
                                            <p className="text-xs text-red-400 uppercase tracking-widest font-bold mb-1">Difference</p>
                                            <p className="text-2xl font-black text-red-500">{result.diffPercent}%</p>
                                        </div>
                                        <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 text-center">
                                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Distance</p>
                                            <p className="text-2xl font-black text-slate-300">{result.distance}</p>
                                        </div>
                                        <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 text-center">
                                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Changes</p>
                                            <p className="text-2xl font-black text-slate-300">{result.diffCount}</p>
                                        </div>
                                    </div>

                                    {/* Lists */}
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="p-5 bg-red-950/20 rounded-2xl border border-red-500/20">
                                            <h4 className="font-bold text-red-400 text-sm mb-4 flex items-center gap-2 pb-2 border-b border-red-500/20">
                                                <i className="fa-solid fa-minus-circle"></i> Removed (Unique to Source)
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.removed.length > 0 ? result.removed.map((w, i) => (
                                                    <span key={i} className="px-2.5 py-1 bg-red-900/30 text-red-300 text-xs font-mono rounded-md border border-red-500/30">{w}</span>
                                                )) : <span className="text-slate-500 italic text-sm">No unique words found</span>}
                                            </div>
                                        </div>
                                        <div className="p-5 bg-teal-950/20 rounded-2xl border border-teal-500/20">
                                            <h4 className="font-bold text-teal-400 text-sm mb-4 flex items-center gap-2 pb-2 border-b border-teal-500/20">
                                                <i className="fa-solid fa-plus-circle"></i> Added (Unique to Target)
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.added.length > 0 ? result.added.map((w, i) => (
                                                    <span key={i} className="px-2.5 py-1 bg-teal-900/30 text-teal-300 text-xs font-mono rounded-md border border-teal-500/30">{w}</span>
                                                )) : <span className="text-slate-500 italic text-sm">No unique words found</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings & Toolbar (Below Inputs) */}
                    <div className="mt-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            {Object.keys(options).map(key => (
                                <label key={key} className="group flex items-center gap-2 cursor-pointer text-sm select-none">
                                    <input
                                        type="checkbox"
                                        checked={options[key]}
                                        onChange={e => setOptions({ ...options, [key]: e.target.checked })}
                                        className="rounded bg-slate-700 border-slate-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-800"
                                    />
                                    <span className="text-slate-300 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').replace('ignore', '').trim()}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* SEO Content */}
            <div className="max-w-6xl mx-auto px-4 pb-20 mt-8">
                <TrustBar />
                <RelatedTools toolKeys={feature.related} />
                <SeoContent featureKey="compareText" />
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
