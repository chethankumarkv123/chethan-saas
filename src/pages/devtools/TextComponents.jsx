import { useState } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { toast } from '../../components/Toast';

export function CaseConverter() {
    const [input, setInput] = useState("");

    const toCamel = (s) => s.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
    const toSnake = (s) => s.replace(/\s+/g, '_').toLowerCase(); // heavy simplification, good enough for "daily use" on standard text
    const toKebab = (s) => s.replace(/\s+/g, '-').toLowerCase();
    const toPascal = (s) => s.replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()).replace(/\s/g, '');
    const toUpper = (s) => s.toUpperCase();
    const toLower = (s) => s.toLowerCase();

    // Enhancing conversion logic to handle mixed casing input better
    // A robust approach splits words first.
    const splitWords = (s) => s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) || [];

    const convert = (type) => {
        if (!input) return;
        const words = splitWords(input);

        let res = "";
        switch (type) {
            case 'camel':
                res = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
                break;
            case 'snake':
                res = words.map(w => w.toLowerCase()).join('_');
                break;
            case 'kebab':
                res = words.map(w => w.toLowerCase()).join('-');
                break;
            case 'pascal':
                res = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
                break;
            case 'upper':
                res = input.toUpperCase();
                break;
            case 'lower':
                res = input.toLowerCase();
                break;
            default: res = input;
        }
        setInput(res); // Or allow non-destructive copy, usually converters update in place for flow. Let's update in place.
    };

    const copy = () => {
        navigator.clipboard.writeText(input);
        toast.success("Copied!");
    };

    return (
        <DevToolLayout featureKey="caseConverter">
            <div className="space-y-4">
                <textarea
                    className="w-full h-40 p-4 border rounded-xl font-mono text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:border-blue-500 outline-none resize-y"
                    placeholder="Type or paste text here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                ></textarea>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Btn label="camelCase" onClick={() => convert('camel')} />
                    <Btn label="snake_case" onClick={() => convert('snake')} />
                    <Btn label="kebab-case" onClick={() => convert('kebab')} />
                    <Btn label="PascalCase" onClick={() => convert('pascal')} />
                    <Btn label="UPPERCASE" onClick={() => convert('upper')} />
                    <Btn label="lowercase" onClick={() => convert('lower')} />
                </div>

                <div className="flex justify-end pt-2">
                    <button onClick={copy} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm">
                        <i className="fa-regular fa-copy mr-2"></i> Copy Result
                    </button>
                </div>
            </div>
        </DevToolLayout>
    );
}

export function EnvConverter() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [mode, setMode] = useState("json"); // json | yaml

    const convert = (target) => {
        if (!input) { setOutput(""); return; }

        // Parse .env
        const lines = input.split('\n');
        const obj = {};
        lines.forEach(line => {
            const l = line.trim();
            if (!l || l.startsWith('#')) return;
            const idx = l.indexOf('=');
            if (idx !== -1) {
                const key = l.substring(0, idx).trim();
                let val = l.substring(idx + 1).trim();
                // strip quotes
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1);
                }
                obj[key] = val;
            }
        });

        if (target === 'json') {
            setOutput(JSON.stringify(obj, null, 2));
        } else if (target === 'yaml') {
            setOutput(Object.entries(obj).map(([k, v]) => `${k}: "${v}"`).join('\n'));
        }
        setMode(target);
    };

    return (
        <DevToolLayout featureKey="envConverter">
            <div className="grid md:grid-cols-2 gap-6 h-[500px]">
                <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-500 mb-2">.env Input</label>
                    <textarea
                        className="flex-grow p-4 border rounded-xl font-mono text-xs dark:bg-slate-900 dark:border-slate-600 dark:text-white resize-none outline-none focus:border-green-500"
                        placeholder={'DB_HOST=localhost\nDB_PORT=5432'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    ></textarea>
                </div>

                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-gray-500">Output ({mode.toUpperCase()})</label>
                        <div className="flex gap-2">
                            <button onClick={() => convert('json')} className={`px-2 py-1 text-xs font-bold rounded ${mode === 'json' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>JSON</button>
                            <button onClick={() => convert('yaml')} className={`px-2 py-1 text-xs font-bold rounded ${mode === 'yaml' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>YAML</button>
                        </div>
                    </div>
                    <textarea
                        className="flex-grow p-4 border rounded-xl font-mono text-xs dark:bg-slate-900 dark:border-slate-600 dark:text-white resize-none outline-none bg-gray-50 dark:bg-slate-800"
                        readOnly
                        value={output}
                        placeholder="Result will appear here..."
                    ></textarea>
                    <button onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied!"); }} className="mt-4 w-full py-3 bg-gray-900 text-white rounded-lg font-bold text-sm dark:bg-slate-700 hover:opacity-90">
                        Copy Output
                    </button>
                </div>
            </div>
        </DevToolLayout>
    );
}

const Btn = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="py-3 px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-all"
    >
        {label}
    </button>
);
