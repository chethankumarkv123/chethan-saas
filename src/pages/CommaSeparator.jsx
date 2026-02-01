import { useState, useRef } from 'react';
import { useUI } from '../context/UIContext';
import { SEO } from '../components/SEO';
import { TrustBar } from '../components/TrustBar';
import { RelatedTools } from '../components/RelatedTools';
import { SeoContent } from '../components/SeoContent';
import { FEATURES } from '../config/FEATURE_CONFIG';
import { toast } from '../components/Toast';

const QUICK_DELIMITERS = [
    { label: ',', value: ',' },
    { label: ';', value: ';' },
    { label: '|', value: '|' },
    { label: 'Space', value: ' ' },
    { label: 'New Line', value: '\n' },
];

export function CommaSeparator() {
    const { showModal } = useUI();
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [hasConverted, setHasConverted] = useState(false);
    const resultRef = useRef(null);

    const [settings, setSettings] = useState({
        tidy: true,
        dedup: false,
        explode: 'newlines', // newlines, spaces, commas, semicolons
        quotes: 'none', // none, single, double
        delimiter: ',',
        tags: { open: '', close: '' },
        interval: 0,
        intervalWrap: { open: '', close: '' }
    });

    const handleDelimiterChange = (e) => {
        setSettings(prev => ({ ...prev, delimiter: e.target.value }));
    };

    const convert = () => {
        let values = input;
        if (!values) {
            toast.error("Please enter some text first");
            return;
        }

        // 1. Explode
        if (settings.explode === 'spaces') values = values.split(/\s+/).filter(Boolean);
        else if (settings.explode === 'commas') values = values.split(/,+/).filter(Boolean);
        else if (settings.explode === 'semicolons') values = values.split(/;+/).filter(Boolean);
        else values = values.split(/\r?\n/).filter(Boolean);

        // 2. Tidy
        if (settings.tidy) values = values.map(v => v.trim());

        // 3. Dedup
        if (settings.dedup) values = [...new Set(values)];

        // 4. Quotes & Tags & Interval
        const resultItems = values.map(v => {
            let val = v;
            if (settings.quotes === 'double') val = `"${val}"`;
            else if (settings.quotes === 'single') val = `'${val}'`;

            return `${settings.tags.open}${val}${settings.tags.close}`;
        });

        // 5. Interval & Join
        let finalString = "";
        const delim = settings.delimiter.replace(/\\n/g, '\n');

        if (settings.interval > 0) {
            let chunks = [];
            for (let i = 0; i < resultItems.length; i += Number(settings.interval)) {
                const chunk = resultItems.slice(i, i + Number(settings.interval));
                chunks.push(`${settings.intervalWrap.open}${chunk.join(delim)}${settings.intervalWrap.close}`);
            }
            finalString = chunks.join('\n');
        } else {
            finalString = resultItems.join(delim);
        }

        setOutput(finalString);
        setHasConverted(true);
        toast.success(`Converted ${values.length} items!`);

        // Mobile: Auto-scroll to result
        setTimeout(() => {
            if (window.innerWidth < 768 && resultRef.current) {
                resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const feature = FEATURES.commaSeparator;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-24 md:pt-28 pb-32 md:pb-8">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords="comma separator, list to csv, column to comma, text tool"
            />

            {/* Tool Area */}
            <div className="md:h-[calc(100vh-100px)] px-4 flex flex-col">
                <div className="max-w-7xl mx-auto w-full md:h-full flex flex-col">
                    {/* Header - Compact on Mobile */}
                    <div className="flex justify-between items-center mb-3 md:mb-4 shrink-0">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className={`p-1.5 md:p-2 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/30 text-${feature.color}-600 dark:text-${feature.color}-400`}>
                                <i className={`text-base md:text-xl ${feature.icon}`}></i>
                            </div>
                            <div>
                                <h1 className="text-base md:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                    {feature.title}
                                </h1>
                                <p className="text-xs text-gray-500 hidden md:block">{feature.desc}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="flex items-center gap-2 text-[#008eb0] dark:text-sky-400 font-medium hover:opacity-80 transition-all transition-all underline underline-offset-4 decoration-1"
                        >
                            <i className="fa-solid fa-gear text-lg"></i>
                            <span className="text-sm md:text-base font-semibold">Converter Settings</span>
                        </button>
                    </div>

                    {/* Main Split View */}
                    <div className="flex-grow grid md:grid-cols-2 gap-3 md:gap-4 min-h-0 mb-3 md:mb-4">
                        {/* Input */}

                        <div className="flex flex-col bg-slate-800 rounded-2xl shadow-lg border border-slate-700 h-[40vh] md:h-[450px] overflow-hidden relative group transition-all hover:border-slate-600">
                            <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 shrink-0">
                                <h3 className="text-sm font-bold tracking-wider text-slate-200 pl-1">INPUT DATA</h3>
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
                                    placeholder={`Paste values here (one per line)\n\nExample:\napple\nbanana\norange`}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    spellCheck={false}
                                ></textarea>

                                {/* Primary CTA in Input Panel */}
                                <div className="absolute bottom-4 right-4 z-10">
                                    <button
                                        onClick={convert}
                                        className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-green-900/30 transition-all active:scale-95 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!input}
                                    >
                                        <i className="fa-solid fa-arrow-right-long"></i>
                                        Convert
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Output */}

                        <div ref={resultRef} className={`flex flex-col bg-slate-800 rounded-2xl shadow-lg border border-slate-700 h-[40vh] md:h-[450px] overflow-hidden relative transition-all ${hasConverted ? 'border-green-500/30 shadow-[0_0_30px_-10px_rgba(34,197,94,0.15)]' : ''}`}>
                            <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 shrink-0">
                                <h3 className="text-sm font-bold tracking-wider text-green-400 pl-1">RESULT</h3>
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
                                        className="w-full h-full p-5 resize-none outline-none bg-transparent text-green-300 text-sm font-mono leading-relaxed"
                                        readOnly
                                        value={output}
                                        onClick={(e) => e.target.select()}
                                    ></textarea>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 select-none pointer-events-none">
                                        <i className="fa-solid fa-arrow-right-arrow-left text-3xl mb-3 opacity-20"></i>
                                        <p className="text-sm font-medium">Converted values will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Toolbar */}
                    <div className="hidden md:flex bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-700/50 shrink-0 items-center justify-between gap-6 px-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Delimiter</span>
                                <div className="flex gap-1 bg-slate-800 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-700">
                                    {QUICK_DELIMITERS.map(d => (
                                        <button
                                            key={d.value}
                                            onClick={() => setSettings(s => ({ ...s, delimiter: d.value }))}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.delimiter === d.value
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                                }`}
                                            title={d.label}
                                        >
                                            {d.value === ' ' ? 'SPC' : d.value === '\n' ? '↵' : d.value}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-6 w-px bg-slate-700/50"></div>

                            <div className="flex items-center gap-2">
                                <label className="group flex items-center gap-2.5 cursor-pointer text-sm bg-slate-800/50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all active:scale-95 select-none">
                                    <input type="checkbox" checked={settings.tidy} onChange={() => { }} onClick={() => setSettings(s => ({ ...s, tidy: !s.tidy }))} className="hidden" />
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${settings.tidy ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]' : 'bg-slate-700'}`}>
                                        <i className={`fa-solid fa-check text-[10px] text-white transition-opacity ${settings.tidy ? 'opacity-100' : 'opacity-0'}`}></i>
                                    </div>
                                    <span className="text-slate-300 font-bold tracking-tight">Trim</span>
                                </label>

                                <label className="group flex items-center gap-2.5 cursor-pointer text-sm bg-slate-800/50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all active:scale-95 select-none">
                                    <input type="checkbox" className="hidden" checked={settings.dedup} onChange={() => { }} onClick={() => setSettings(s => ({ ...s, dedup: !s.dedup }))} />
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${settings.dedup ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]' : 'bg-slate-700'}`}>
                                        <i className={`fa-solid fa-check text-[10px] text-white transition-opacity ${settings.dedup ? 'opacity-100' : 'opacity-0'}`}></i>
                                    </div>
                                    <span className="text-slate-300 font-bold tracking-tight">Dedup</span>
                                </label>
                            </div>
                        </div>

                    </div>


                    {/* Mobile Sticky Action Bar */}
                    <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800 z-40 safe-area-bottom flex flex-col gap-4 shadow-[0_-8px_20px_-4px_rgba(0,0,0,0.3)]">

                        {/* Quick Selection Options */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Quick Config</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSettings(s => ({ ...s, tidy: !s.tidy }))}
                                        className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-all border ${settings.tidy ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                                    >
                                        TRIM {settings.tidy ? 'ON' : 'OFF'}
                                    </button>
                                    <button
                                        onClick={() => setSettings(s => ({ ...s, dedup: !s.dedup }))}
                                        className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-all border ${settings.dedup ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                                    >
                                        DEDUP {settings.dedup ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                                {QUICK_DELIMITERS.map(d => (
                                    <button
                                        key={d.value}
                                        onClick={() => setSettings(s => ({ ...s, delimiter: d.value }))}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border min-h-[42px] flex items-center justify-center tracking-tight ${settings.delimiter === d.value
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg scale-105'
                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="w-14 h-14 bg-slate-800 text-blue-400 rounded-2xl font-black border border-slate-700 active:scale-90 transition-all flex items-center justify-center shadow-lg"
                            >
                                <i className="fa-solid fa-sliders-h text-xl"></i>
                            </button>
                            <button
                                onClick={convert}
                                disabled={!input}
                                className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 active:scale-[0.98] disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-black rounded-2xl shadow-[0_4px_15px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 text-base transition-all"
                            >
                                <i className="fa-solid fa-bolt-lightning text-yellow-400"></i>
                                CONVERT NOW
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* SEO Content */}
            <div className="max-w-6xl mx-auto px-4 mt-8 pb-20 md:pb-0">
                <TrustBar />
                <RelatedTools toolKeys={feature.related} />
                <SeoContent featureKey="commaSeparator" />
            </div>

            {/* Settings Modal (Bottom Sheet on Mobile) */}
            {
                isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-slate-800 w-full md:max-w-3xl rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden animate-slide-up md:animate-scale-up max-h-[85vh] flex flex-col">
                            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
                                <h2 className="text-xl font-medium text-[#008eb0] dark:text-sky-400 flex items-center gap-3">
                                    <i className="fa-solid fa-gear"></i> Converter Settings
                                </h2>
                                <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 transition p-2">
                                    <i className="fa-solid fa-times text-xl"></i>
                                </button>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                                {/* LEFT COLUMN */}
                                <div className="space-y-5">
                                    {/* Tidy Up */}
                                    <div>
                                        <label className="block font-bold text-sm text-gray-700 dark:text-gray-200 mb-2">
                                            Tidy Up <span className="font-normal text-gray-400 text-xs ml-1">Remove new lines?</span>
                                        </label>
                                        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-900/50 rounded-xl">
                                            <button onClick={() => setSettings(s => ({ ...s, tidy: true }))} className={`flex-1 py-2 rounded-lg font-bold text-xs transition ${settings.tidy ? 'bg-white shadow text-blue-600 dark:bg-slate-700 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}>Yes</button>
                                            <button onClick={() => setSettings(s => ({ ...s, tidy: false }))} className={`flex-1 py-2 rounded-lg font-bold text-xs transition ${!settings.tidy ? 'bg-white shadow text-blue-600 dark:bg-slate-700 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}>No</button>
                                        </div>
                                    </div>

                                    {/* Attack the clones */}
                                    <div>
                                        <label className="block font-bold text-sm text-gray-700 dark:text-gray-200 mb-2">
                                            Attack the clones <span className="font-normal text-gray-400 text-xs ml-1">Remove duplicates</span>
                                        </label>
                                        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-900/50 rounded-xl">
                                            <button onClick={() => setSettings(s => ({ ...s, dedup: true }))} className={`flex-1 py-2 rounded-lg font-bold text-xs transition ${settings.dedup ? 'bg-white shadow text-blue-600 dark:bg-slate-700 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}>Yes</button>
                                            <button onClick={() => setSettings(s => ({ ...s, dedup: false }))} className={`flex-1 py-2 rounded-lg font-bold text-xs transition ${!settings.dedup ? 'bg-white shadow text-blue-600 dark:bg-slate-700 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}>No</button>
                                        </div>
                                    </div>

                                    {/* Explode */}
                                    <div>
                                        <label className="block font-bold text-sm text-gray-700 dark:text-gray-200 mb-2">
                                            Explode <span className="font-normal text-gray-400 text-xs ml-1">Split records by</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['newlines', 'spaces', 'commas', 'semicolons'].map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setSettings(s => ({ ...s, explode: opt }))}
                                                    className={`py-2 rounded-lg font-bold text-xs capitalize transition border ${settings.explode === opt ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'}`}
                                                >
                                                    {opt.replace('newlines', 'New Lines')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quotes */}
                                    <div>
                                        <label className="block font-bold text-sm text-gray-700 dark:text-gray-200 mb-2">
                                            Quotes <span className="font-normal text-gray-400 text-xs ml-1">Add quotes</span>
                                        </label>
                                        <div className="flex gap-2">
                                            {['none', 'double', 'single'].map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setSettings(s => ({ ...s, quotes: opt }))}
                                                    className={`flex-1 py-2 rounded-lg font-bold text-xs capitalize transition border ${settings.quotes === opt ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'}`}
                                                >
                                                    {opt === 'none' ? 'No' : opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="space-y-5">
                                    {/* Delimiter */}
                                    <div>
                                        <label className="block font-bold text-sm text-gray-700 dark:text-gray-200 mb-2">
                                            Delimiter <span className="font-normal text-gray-400 text-xs ml-1">Separator char</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-gray-200 rounded-xl text-base dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                                            value={settings.delimiter}
                                            onChange={(e) => setSettings(s => ({ ...s, delimiter: e.target.value }))}
                                        />
                                        <div className="flex gap-2 mt-2">
                                            {[',', ';', '|', ' '].map(char => (
                                                <button key={char} onClick={() => setSettings(s => ({ ...s, delimiter: char }))} className="px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs font-mono hover:bg-gray-200">{char === ' ' ? 'Space' : char}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block font-bold text-sm text-gray-700 dark:text-gray-200 mb-2">
                                            Tags <span className="font-normal text-gray-400 text-xs ml-1">Wrap records (e.g. &lt;li&gt;)</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <input placeholder="Prefix (e.g. <li>)" className="w-1/2 p-3 border border-gray-200 rounded-xl text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={settings.tags.open} onChange={e => setSettings(s => ({ ...s, tags: { ...s.tags, open: e.target.value } }))} />
                                            <input placeholder="Suffix" className="w-1/2 p-3 border border-gray-200 rounded-xl text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={settings.tags.close} onChange={e => setSettings(s => ({ ...s, tags: { ...s.tags, close: e.target.value } }))} />
                                        </div>
                                    </div>

                                    {/* Interval */}
                                    <div>
                                        <label className="block font-bold text-sm text-gray-700 dark:text-gray-200 mb-2">
                                            Interval <span className="font-normal text-gray-400 text-xs ml-1">New line after X items</span>
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full p-3 border border-gray-200 rounded-xl text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                                            value={settings.interval}
                                            onChange={(e) => setSettings(s => ({ ...s, interval: e.target.value }))}
                                        />
                                    </div>

                                    {/* Interval Wrap */}
                                    <div>
                                        <label className="block font-bold text-sm text-gray-700 dark:text-gray-200 mb-2">
                                            Interval Wrap <span className="font-normal text-gray-400 text-xs ml-1">Wrap interval chunks</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <input placeholder="Open" className="w-1/2 p-3 border border-gray-200 rounded-xl text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={settings.intervalWrap.open} onChange={e => setSettings(s => ({ ...s, intervalWrap: { ...s.intervalWrap, open: e.target.value } }))} />
                                            <input placeholder="Close" className="w-1/2 p-3 border border-gray-200 rounded-xl text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={settings.intervalWrap.close} onChange={e => setSettings(s => ({ ...s, intervalWrap: { ...s.intervalWrap, close: e.target.value } }))} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex justify-end bg-gray-50/50 dark:bg-slate-900/20 shrink-0 safe-area-bottom">
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 text-base"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
