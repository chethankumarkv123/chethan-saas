import { useState } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { toast } from '../../components/Toast';

export function RegexTester() {
    const [regex, setRegex] = useState("");
    const [flags, setFlags] = useState("g");
    const [text, setText] = useState("");

    // Highlight Logic
    const getHighlightedText = () => {
        if (!regex) return text;
        try {
            const re = new RegExp(regex, flags);
            const parts = text.split(re);
            const matches = text.match(re);
            if (!matches) return text;

            return parts.reduce((acc, part, i) => {
                if (i < parts.length - 1) {
                    return [...acc, part, <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-black dark:text-white rounded px-0.5">{matches[i] || ""}</span>];
                }
                return [...acc, part];
            }, []);
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

    return (
        <DevToolLayout featureKey="regexTester">
            <div className="space-y-6">
                {/* Input Area */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow relative">
                        <span className="absolute left-3 top-2 text-gray-400 font-mono text-xl">/</span>
                        <input
                            type="text"
                            className="w-full pl-8 pr-4 py-2 border rounded-lg font-mono text-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white outline-none focus:border-blue-500"
                            placeholder="regex pattern"
                            value={regex}
                            onChange={(e) => setRegex(e.target.value)}
                        />
                        <span className="absolute right-3 top-2 text-gray-400 font-mono text-xl">/</span>
                    </div>
                    <input
                        type="text"
                        className="w-24 px-3 py-2 border rounded-lg font-mono dark:bg-slate-900 dark:border-slate-600 dark:text-white text-center uppercase"
                        placeholder="flags"
                        value={flags}
                        onChange={(e) => setFlags(e.target.value)}
                    />
                </div>

                {/* Test String */}
                <textarea
                    className="w-full h-32 p-4 border rounded-lg font-mono text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:border-blue-500 outline-none resize-y"
                    placeholder="Paste text here to test..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                ></textarea>

                {/* Results */}
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 relative min-h-[100px]">
                    <div className="absolute top-2 right-2 text-xs font-bold text-gray-500 uppercase">
                        {getMatchCount()} Matches
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-gray-300">
                        {getHighlightedText()}
                    </pre>
                </div>
            </div>
        </DevToolLayout>
    );
}
