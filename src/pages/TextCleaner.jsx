
import { useState } from 'react';
import { SEO } from '../components/SEO';
import { TrustBar } from '../components/TrustBar';
import { RelatedTools } from '../components/RelatedTools';
import { SeoContent } from '../components/SeoContent';
import { FEATURES } from '../config/FEATURE_CONFIG';
import { toast } from '../components/Toast';

export function TextCleaner() {
    const feature = FEATURES.textCleaner;
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    // Actions
    const [removeSpaces, setRemoveSpaces] = useState(false);
    const [removeBreaks, setRemoveBreaks] = useState(false);
    const [removeHtml, setRemoveHtml] = useState(false);

    // Advanced Actions
    const [removeEmptyLines, setRemoveEmptyLines] = useState(false);
    const [dedupLines, setDedupLines] = useState(false);
    const [sortLines, setSortLines] = useState('none'); // 'none', 'asc', 'desc', 'length'

    const convert = () => {
        let res = input;

        if (removeHtml) {
            const doc = new DOMParser().parseFromString(res, 'text/html');
            res = doc.body.textContent || "";
        }

        // Line-based operations
        let lines = res.split(/\r?\n/);

        if (removeEmptyLines) {
            lines = lines.filter(line => line.trim().length > 0);
        }

        if (dedupLines) {
            lines = [...new Set(lines)];
        }

        if (sortLines !== 'none') {
            if (sortLines === 'asc') lines.sort();
            if (sortLines === 'desc') lines.sort().reverse();
            if (sortLines === 'length') lines.sort((a, b) => a.length - b.length || a.localeCompare(b));
        }

        // Processing Re-assembly
        if (removeBreaks) {
            res = lines.join(' ');
            res = res.replace(/(\r\n|\n|\r)/gm, " ");
        } else {
            res = lines.join('\n');
        }

        if (removeSpaces) {
            res = res.replace(/\s+/g, ' ').trim();
        }

        setOutput(res);
        if (res) toast.success("Text Cleaned!");
    };

    const changeCase = (type) => {
        let res = output || input;
        if (type === 'upper') res = res.toUpperCase();
        if (type === 'lower') res = res.toLowerCase();
        if (type === 'capitalize') {
            res = res.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
        setOutput(res);
        toast.success(`Converted to ${type}case`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords="text cleaner, text formatter, remove spaces, remove formatting"
            />

            {/* Tool Area */}
            <div className="px-4 pb-8 flex flex-col">
                <div className="max-w-7xl mx-auto w-full flex flex-col">
                    <div className="text-center mb-6 shrink-0">
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {feature.title}
                        </h1>
                        <p className="text-slate-400">Remove spaces, line breaks, and HTML tags instantly.</p>
                    </div>

                    {/* Controls Toolbar */}
                    <div className="mb-4 bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm flex flex-col gap-4">
                        {/* Row 1: Toggles */}
                        <div className="flex flex-wrap gap-x-6 gap-y-3 pb-4 border-b border-slate-700/50">
                            {[
                                { state: removeSpaces, set: setRemoveSpaces, label: "Rem. Spaces" },
                                { state: removeBreaks, set: setRemoveBreaks, label: "Rem. Breaks" },
                                { state: removeHtml, set: setRemoveHtml, label: "Strip HTML" },
                                { state: removeEmptyLines, set: setRemoveEmptyLines, label: "Rem. Empty Lines" },
                                { state: dedupLines, set: setDedupLines, label: "Dedup Lines" },
                            ].map((opt, i) => (
                                <label key={i} className="flex items-center gap-2 cursor-pointer select-none group">
                                    <div className={`w-9 h-5 rounded-full relative transition-colors ${opt.state ? 'bg-orange-600' : 'bg-slate-700'}`}>
                                        <div className={`absolute top-1 bottom-1 w-3 h-3 rounded-full bg-white transition-all ${opt.state ? 'left-5 shadow-sm' : 'left-1'}`}></div>
                                        <input type="checkbox" checked={opt.state} onChange={e => opt.set(e.target.checked)} className="hidden" />
                                    </div>
                                    <span className={`text-sm font-medium transition-colors ${opt.state ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{opt.label}</span>
                                </label>
                            ))}
                        </div>

                        {/* Row 2: Sort & Case */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            {/* Sort Options */}
                            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Sort:</span>
                                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 shrink-0">
                                    {[
                                        { val: 'none', icon: 'fa-slash', label: 'None' },
                                        { val: 'asc', icon: 'fa-arrow-down-a-z', label: 'A-Z' },
                                        { val: 'desc', icon: 'fa-arrow-down-z-a', label: 'Z-A' },
                                        { val: 'length', icon: 'fa-arrow-down-short-wide', label: 'Length' },
                                    ].map(opt => (
                                        <button
                                            key={opt.val}
                                            onClick={() => setSortLines(opt.val)}
                                            title={opt.label}
                                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${sortLines === opt.val ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                        >
                                            <i className={`fa-solid ${opt.icon}`}></i>
                                            <span className="hidden sm:inline">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Case Options */}
                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Case:</span>
                                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 shrink-0">
                                    <button onClick={() => changeCase('upper')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition" title="UPPERCASE">AA</button>
                                    <button onClick={() => changeCase('lower')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition" title="lowercase">aa</button>
                                    <button onClick={() => changeCase('capitalize')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition" title="Capitalize">Aa</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow grid md:grid-cols-2 gap-4 min-h-0 mb-4">
                        {/* Input */}
                        <div className="flex flex-col bg-slate-800 rounded-2xl shadow-lg border border-slate-700 h-[40vh] md:h-[450px] overflow-hidden relative group transition-all hover:border-slate-600">
                            <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 shrink-0">
                                <h3 className="text-sm font-bold tracking-wider text-slate-200 pl-1">INPUT TEXT</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const text = await navigator.clipboard.readText();
                                                setInput(text);
                                                toast.success("Pasted!");
                                            } catch (e) { toast.error("Clipboard permission denied"); }
                                        }}
                                        className="text-xs text-slate-400 hover:text-white font-medium px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                                    >
                                        <i className="fa-regular fa-paste mr-1.5"></i>
                                        Paste
                                    </button>
                                    <div className="w-px h-4 bg-slate-700"></div>
                                    <button
                                        onClick={() => setInput('')}
                                        className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-900/20 transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                            <div className="relative flex-grow">
                                <textarea
                                    className="w-full h-full p-5 resize-none outline-none bg-transparent text-slate-300 text-sm font-mono leading-relaxed placeholder:text-slate-600"
                                    placeholder="Paste your text here..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    spellCheck={false}
                                ></textarea>

                                {/* Primary CTA */}
                                <div className="absolute bottom-4 right-4 z-10">
                                    <button
                                        onClick={convert}
                                        className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-900/30 transition-all active:scale-95 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!input}
                                    >
                                        <i className="fa-solid fa-broom"></i>
                                        Clean Text
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Output */}
                        <div className={`flex flex-col bg-slate-800 rounded-2xl shadow-lg border border-slate-700 h-[40vh] md:h-[450px] overflow-hidden relative transition-all ${output ? 'border-orange-500/30 shadow-[0_0_30px_-10px_rgba(249,115,22,0.15)]' : ''}`}>
                            <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 shrink-0">
                                <h3 className="text-sm font-bold tracking-wider text-orange-400 pl-1">RESULT</h3>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(output);
                                        toast.success("Copied ✓");
                                    }}
                                    disabled={!output}
                                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold px-3 py-1.5 rounded-lg border border-slate-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <i className="fa-regular fa-copy"></i> Copy
                                </button>
                            </div>

                            <div className="relative flex-grow bg-slate-900/30">
                                {output ? (
                                    <textarea
                                        className="w-full h-full p-5 resize-none outline-none bg-transparent text-orange-300 text-sm font-mono leading-relaxed"
                                        readOnly
                                        value={output}
                                        onClick={(e) => e.target.select()}
                                    ></textarea>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 select-none pointer-events-none">
                                        <i className="fa-solid fa-arrow-right-arrow-left text-3xl mb-3 opacity-20"></i>
                                        <p className="text-sm font-medium">Cleaned text will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEO Content */}
            <div className="max-w-6xl mx-auto px-4 pb-20 mt-8">
                <TrustBar />
                <RelatedTools toolKeys={feature.related} />
                <SeoContent featureKey="textCleaner" />
            </div>
        </div>
    );
}
