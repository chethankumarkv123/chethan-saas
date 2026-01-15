
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

    const convert = () => {
        let res = input;

        if (removeHtml) {
            const doc = new DOMParser().parseFromString(res, 'text/html');
            res = doc.body.textContent || "";
        }

        if (removeBreaks) {
            res = res.replace(/(\r\n|\n|\r)/gm, " ");
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
            <div className="h-[calc(100vh-100px)] px-4 pb-8 flex flex-col">
                <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
                    <div className="text-center mb-4 shrink-0">
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
                            {feature.title}
                        </h1>
                    </div>

                    <div className="flex-grow grid md:grid-cols-2 gap-4 min-h-0 mb-4">
                        {/* Input */}
                        <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 h-full overflow-hidden">
                            <div className="p-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">Input Text</h3>
                                <button onClick={() => setInput('')} className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50">Clear</button>
                            </div>
                            <textarea
                                className="flex-grow p-4 resize-none outline-none dark:bg-slate-800 dark:text-gray-200 text-sm"
                                placeholder="Paste text here..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Output */}
                        <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 h-full overflow-hidden">
                            <div className="p-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">Result</h3>
                                <button onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied!"); }} className="text-xs text-blue-500 hover:text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50">Copy</button>
                            </div>
                            <textarea
                                className="flex-grow p-4 resize-none outline-none dark:bg-slate-800 dark:text-gray-200 bg-gray-50/50 text-sm"
                                placeholder="Cleaned text will appear here..."
                                readOnly
                                value={output}
                            ></textarea>
                        </div>
                    </div>

                    {/* Actions Toolbar - Always Visible at Bottom of Tool Area */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 shrink-0">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                            {/* Checkboxes */}
                            <div className="flex flex-wrap gap-4 text-sm">
                                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 px-2 py-1 rounded transition">
                                    <input type="checkbox" checked={removeSpaces} onChange={e => setRemoveSpaces(e.target.checked)} className="rounded text-orange-600 focus:ring-orange-500" />
                                    <span className="text-gray-700 dark:text-gray-300">Remove Extra Spaces</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 px-2 py-1 rounded transition">
                                    <input type="checkbox" checked={removeBreaks} onChange={e => setRemoveBreaks(e.target.checked)} className="rounded text-orange-600 focus:ring-orange-500" />
                                    <span className="text-gray-700 dark:text-gray-300">Remove Line Breaks</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 px-2 py-1 rounded transition">
                                    <input type="checkbox" checked={removeHtml} onChange={e => setRemoveHtml(e.target.checked)} className="rounded text-orange-600 focus:ring-orange-500" />
                                    <span className="text-gray-700 dark:text-gray-300">Strip HTML</span>
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-3">
                                <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                                    <button onClick={() => changeCase('upper')} className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-600 rounded-md transition" title="UPPERCASE">AA</button>
                                    <button onClick={() => changeCase('lower')} className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-600 rounded-md transition" title="lowercase">aa</button>
                                    <button onClick={() => changeCase('capitalize')} className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-600 rounded-md transition" title="Capitalize">Aa</button>
                                </div>

                                <button onClick={convert} className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-md shadow-orange-500/20 transition-transform active:scale-95 text-sm flex items-center gap-2">
                                    <i className="fa-solid fa-broom"></i> Clean Text
                                </button>
                            </div>
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
        </div>
    );
}
