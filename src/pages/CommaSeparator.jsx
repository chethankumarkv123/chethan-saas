import { useState, useRef } from 'react';
import { useUI } from '../context/UIContext';
import { SEO } from '../components/SEO';
import { TrustBar } from '../components/TrustBar';
import { RelatedTools } from '../components/RelatedTools';
import { SeoContent } from '../components/SeoContent';
import { FEATURES } from '../config/FEATURE_CONFIG';
import { toast } from '../components/Toast';

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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-16 md:pt-20 pb-32 md:pb-8">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords="comma separator, list to csv, column to comma, text tool"
            />

            {/* Tool Area */}
            <div className="md:h-[calc(100vh-100px)] px-4 flex flex-col">
                <div className="max-w-7xl mx-auto w-full md:h-full flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/30 text-${feature.color}-600 dark:text-${feature.color}-400`}>
                                <i className={`text-xl ${feature.icon}`}></i>
                            </div>
                            <div>
                                <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                    {feature.title}
                                </h1>
                                <p className="text-xs text-gray-500 hidden md:block">{feature.desc}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="flex items-center gap-2 text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-bold py-2 px-3 md:px-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-slate-700"
                        >
                            <i className="fa-solid fa-sliders"></i>
                            <span className="hidden md:inline">Settings</span>
                        </button>
                    </div>

                    {/* Main Split View */}
                    <div className="flex-grow grid md:grid-cols-2 gap-4 min-h-0 mb-4">
                        {/* Input */}
                        <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-[40vh] md:h-full overflow-hidden">
                            <div className="p-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 shrink-0">
                                <h3 className="font-bold text-xs uppercase tracking-wide text-gray-500">Input Data</h3>
                                <div className="flex gap-1">
                                    <button onClick={() => setInput('')} className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20">Clear</button>
                                    <button onClick={async () => {
                                        try {
                                            const text = await navigator.clipboard.readText();
                                            setInput(text);
                                        } catch (e) { toast.error("Clipboard permission denied"); }
                                    }} className="text-xs text-blue-500 hover:text-blue-600 font-medium px-2 py-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">Paste</button>
                                </div>
                            </div>
                            <textarea
                                className="flex-grow p-4 resize-none outline-none dark:bg-slate-800 dark:text-gray-200 text-base md:text-sm font-google-sans leading-relaxed"
                                placeholder="Paste values here (one per line)"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Output */}
                        <div ref={resultRef} className={`flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-[40vh] md:h-full overflow-hidden ${!hasConverted ? 'hidden md:flex' : 'flex animate-fade-in-up'}`}>
                            <div className="p-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-green-50 dark:bg-green-900/10 shrink-0">
                                <h3 className="font-bold text-xs uppercase tracking-wide text-green-700 dark:text-green-400">Result</h3>
                                <button onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied!"); }} className="text-xs bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-bold px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                                    <i className="fa-regular fa-copy mr-1"></i> Copy
                                </button>
                            </div>
                            <textarea
                                className="flex-grow p-4 resize-none outline-none dark:bg-slate-800 dark:text-gray-200 bg-gray-50/30 text-base md:text-sm font-google-sans leading-relaxed"
                                placeholder="Result will appear here..."
                                readOnly
                                value={output}
                            ></textarea>
                        </div>
                    </div>

                    {/* Desktop Toolbar */}
                    <div className="hidden md:flex bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 shrink-0 flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 overflow-x-auto">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-500 uppercase">Delimiter</span>
                                <select
                                    className="border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-sm dark:bg-slate-900 dark:text-white outline-none focus:border-blue-500"
                                    value={settings.delimiter}
                                    onChange={handleDelimiterChange}
                                >
                                    <option value=",">Comma (,)</option>
                                    <option value=";">Semicolon (;)</option>
                                    <option value="|">Pipe (|)</option>
                                    <option value=" ">Space</option>
                                    <option value="\n">New Line</option>
                                </select>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer text-sm bg-gray-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
                                <input type="checkbox" checked={settings.tidy} onChange={() => { }} onClick={() => setSettings(s => ({ ...s, tidy: !s.tidy }))} className="hidden" />
                                <i className={`fa-solid ${settings.tidy ? 'fa-check-square text-blue-600' : 'fa-square text-gray-400'}`}></i>
                                <span className="text-gray-700 dark:text-gray-300">Trim</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-sm bg-gray-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
                                <input type="checkbox" className="hidden" checked={settings.dedup} onChange={() => { }} onClick={() => setSettings(s => ({ ...s, dedup: !s.dedup }))} />
                                <i className={`fa-solid ${settings.dedup ? 'fa-check-square text-blue-600' : 'fa-square text-gray-400'}`}></i>
                                <span className="text-gray-700 dark:text-gray-300">Dedup</span>
                            </label>
                        </div>

                        <button
                            onClick={convert}
                            className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-md transition-transform active:scale-95 flex items-center gap-2 text-sm"
                        >
                            <i className="fa-solid fa-arrow-right-arrow-left"></i> Convert
                        </button>
                    </div>

                    {/* Mobile Sticky Action Bar */}
                    <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 z-40 safe-area-bottom flex flex-col gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">

                        {/* Mini Settings Preview */}
                        <div className="flex justify-between items-center px-1">
                            <div className="text-xs font-bold text-gray-500">
                                Delimiter: <span className="text-blue-600">{settings.delimiter === '\n' ? 'New Line' : settings.delimiter}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                                {settings.dedup && <span className="mr-2"><i className="fa-solid fa-check mr-1"></i>Dedup</span>}
                                {settings.tidy && <span><i className="fa-solid fa-check mr-1"></i>Trim</span>}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="px-4 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold"
                            >
                                <i className="fa-solid fa-sliders"></i>
                            </button>
                            <button
                                onClick={convert}
                                className="flex-1 py-3 bg-blue-600 active:bg-blue-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg"
                            >
                                Convert
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* SEO Content */}
            <div className="max-w-6xl mx-auto px-4 mt-8 pb-20 md:pb-0">
                <TrustBar />
                <RelatedTools toolKeys={feature.related} />
                <SeoContent feature={feature} />
            </div>

            {/* Settings Modal (Bottom Sheet on Mobile) */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full md:max-w-3xl rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden animate-slide-up md:animate-scale-up max-h-[85vh] flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/20 shrink-0">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <i className="fa-solid fa-cog text-blue-600"></i> Converter Settings
                            </h2>
                            <button onClick={() => setIsSettingsOpen(false)} className="bg-gray-200 dark:bg-slate-700 text-gray-500 rounded-full p-1 w-8 h-8 flex items-center justify-center hover:bg-gray-300 transition">
                                <i className="fa-solid fa-times"></i>
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
            )}
        </div>
    );
}
