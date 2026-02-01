
import { useState } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { toast } from '../../components/Toast';

export function RegexTester() {
    const [regex, setRegex] = useState("");
    const [flags, setFlags] = useState("g");
    const [text, setText] = useState("");

    const PATTERNS = [
        { label: "Email", regex: "[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}", flags: "g" },
        { label: "URL", regex: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)", flags: "g" },
        { label: "Date (YYYY-MM-DD)", regex: "\\d{4}-\\d{2}-\\d{2}", flags: "g" },
        { label: "IPv4", regex: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g" },
        { label: "Hex Color", regex: "#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})", flags: "g" },
        { label: "Username (AlphaNum)", regex: "^[a-zA-Z0-9_-]{3,16}$", flags: "gm" },
    ];

    // Highlight Logic
    const getHighlightedText = () => {
        if (!regex) return text;
        try {
            const re = new RegExp(regex, flags);
            const matches = [...text.matchAll(re)];
            if (matches.length === 0) return text;

            let result = [];
            let lastIndex = 0;

            matches.forEach((match, i) => {
                const start = match.index;
                const end = start + match[0].length;
                if (start > lastIndex) {
                    result.push(text.substring(lastIndex, start));
                }
                result.push(
                    <span key={i} className="bg-yellow-300 dark:bg-yellow-600/50 text-black dark:text-white rounded-sm box-decoration-clone">
                        {match[0]}
                    </span>
                );
                lastIndex = end;
            });

            if (lastIndex < text.length) {
                result.push(text.substring(lastIndex));
            }

            return result;
        } catch (e) {
            return text;
        }
    };

    // Match Count
    const getMatchCount = () => {
        if (!regex) return 0;
        try {
            const re = new RegExp(regex, flags);
            const matches = text.match(re);
            return matches ? matches.length : 0;
        } catch { return 0; }
    };

    const applyPattern = (p) => {
        setRegex(p.regex);
        setFlags(p.flags);
    };

    return (
        <DevToolLayout featureKey="regexTester">
            <div className="space-y-6 max-w-4xl mx-auto">

                {/* Cheatsheet / Presets */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {PATTERNS.map((p, i) => (
                        <button
                            key={i}
                            onClick={() => applyPattern(p)}
                            className="whitespace-nowrap px-3 py-1.5 text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow relative group">
                        <span className="absolute left-3 top-3 text-gray-400 font-mono text-xl select-none">/</span>
                        <input
                            type="text"
                            className="w-full pl-8 pr-4 py-3 border rounded-xl font-mono text-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-800"
                            placeholder="regex pattern"
                            value={regex}
                            onChange={(e) => setRegex(e.target.value)}
                        />
                        <span className="absolute right-3 top-3 text-gray-400 font-mono text-xl select-none">/</span>
                    </div>
                    <input
                        type="text"
                        className="w-full md:w-32 px-3 py-3 border rounded-xl font-mono dark:bg-slate-900 dark:border-slate-600 dark:text-white text-center uppercase font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="flags"
                        value={flags}
                        onChange={(e) => setFlags(e.target.value)}
                    />
                </div>

                {/* Test String */}
                <div className="relative">
                    <textarea
                        className="w-full h-40 p-4 border rounded-xl font-mono text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                        placeholder="Paste text here to test..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    ></textarea>
                    <div className="absolute top-2 right-2 text-xs font-bold text-gray-400 bg-white/50 dark:bg-black/20 px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                        TEST STRING
                    </div>
                </div>

                {/* Results */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm relative min-h-[150px]">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-slate-700 pb-3">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Matches</h3>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getMatchCount() > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-700'}`}>
                            {getMatchCount()} Found
                        </span>
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-gray-300 break-words leading-relaxed">
                        {getHighlightedText()}
                    </pre>
                </div>
            </div>
        </DevToolLayout>
    );
}
