import { useState } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { toast } from '../../components/Toast';

export function CurlConverter() {
    const [curl, setCurl] = useState("");
    const [output, setOutput] = useState("");
    const [lang, setLang] = useState("fetch"); // fetch, axios, python

    const parseCurl = (cmd) => {
        // Very basic parser for "daily use"
        // 1. Extract URL (last arg or after curl)
        // 2. Extract Method -X POST
        // 3. Extract Headers -H '...'
        // 4. Extract Data -d '...' or --data-raw

        if (!cmd.trim().startsWith("curl")) return { error: "Not a curl command" };

        let method = "GET";
        let url = "";
        let headers = {};
        let data = null;

        // Clean up newlines
        const cleanCmd = cmd.replace(/\\\n/g, " ").replace(/\s+/g, " ");

        // Extract URL (simple regex for http)
        const urlMatch = cleanCmd.match(/['"](https?:\/\/[^'"]+)['"]/) || cleanCmd.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) url = urlMatch[1];

        // Method
        const methodMatch = cleanCmd.match(/-X\s+([A-Z]+)/);
        if (methodMatch) method = methodMatch[1];

        // Headers
        const headerMatches = cleanCmd.matchAll(/-H\s+['"]([^'"]+)['"]/g);
        for (const match of headerMatches) {
            const [k, v] = match[1].split(/:\s(.+)/);
            if (k && v) headers[k] = v;
        }

        // Data
        const dataMatch = cleanCmd.match(/-d\s+['"]([^'"]+)['"]/) || cleanCmd.match(/--data-raw\s+['"]([^'"]+)['"]/);
        if (dataMatch) {
            data = dataMatch[1];
            if (method === "GET") method = "POST"; // implied
        }

        return { url, method, headers, data };
    };

    const generate = (target) => {
        if (!curl) return;
        const p = parseCurl(curl);
        if (p.error) { setOutput("Invalid curl command"); return; }

        let code = "";

        if (target === 'fetch') {
            code = `fetch('${p.url}', {\n`;
            code += `    method: '${p.method}',\n`;
            code += `    headers: ${JSON.stringify(p.headers, null, 4).replace(/}/, '    }')},\n`;
            if (p.data) code += `    body: ${JSON.stringify(p.data)}\n`;
            code += `})\n.then(response => response.json())\n.then(data => console.log(data));`;
        } else if (target === 'axios') {
            code = `axios({\n`;
            code += `    method: '${p.method.toLowerCase()}',\n`;
            code += `    url: '${p.url}',\n`;
            code += `    headers: ${JSON.stringify(p.headers, null, 4).replace(/}/, '    }')},\n`;
            if (p.data) code += `    data: ${JSON.stringify(p.data)}\n`;
            code += `})\n.then(response => console.log(response.data));`;
        } else if (target === 'python') {
            code = `import requests\n\n`;
            code += `url = "${p.url}"\n\n`;
            if (Object.keys(p.headers).length) {
                code += `headers = ${JSON.stringify(p.headers, null, 4)}\n\n`;
            }
            if (p.data) {
                code += `data = ${JSON.stringify(p.data)}\n\n`;
            }

            code += `response = requests.${p.method.toLowerCase()}(url`;
            if (Object.keys(p.headers).length) code += `, headers=headers`;
            if (p.data) code += `, data=data`;
            code += `)\n\nprint(response.text)`;
        }

        setOutput(code);
        setLang(target);
    };

    return (
        <DevToolLayout featureKey="curlConverter">
            <div className="grid md:grid-cols-2 gap-6 h-[500px]">
                <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-500 mb-2">Curl Command</label>
                    <textarea
                        className="flex-grow p-4 border rounded-xl font-mono text-xs dark:bg-slate-900 dark:border-slate-600 dark:text-white resize-none outline-none focus:border-blue-500"
                        placeholder="curl -X POST https://api.example.com/data -d 'json'"
                        value={curl}
                        onChange={(e) => setCurl(e.target.value)}
                    ></textarea>
                </div>

                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-gray-500">Output Code</label>
                        <div className="flex gap-2">
                            <button onClick={() => generate('fetch')} className={`px-2 py-1 text-xs font-bold rounded ${lang === 'fetch' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>Fetch</button>
                            <button onClick={() => generate('axios')} className={`px-2 py-1 text-xs font-bold rounded ${lang === 'axios' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>Axios</button>
                            <button onClick={() => generate('python')} className={`px-2 py-1 text-xs font-bold rounded ${lang === 'python' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>Python</button>
                        </div>
                    </div>
                    <textarea
                        className="flex-grow p-4 border rounded-xl font-mono text-xs dark:bg-slate-900 dark:border-slate-600 dark:text-blue-300 resize-none outline-none bg-gray-50 dark:bg-slate-800"
                        readOnly
                        value={output}
                        placeholder="// Generated code will appear here"
                    ></textarea>
                    <button onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied!"); }} className="mt-4 w-full py-3 bg-gray-900 text-white rounded-lg font-bold text-sm dark:bg-slate-700 hover:opacity-90">
                        Copy Code
                    </button>
                </div>
            </div>
        </DevToolLayout>
    );
}

export function DiffChecker() {
    const [left, setLeft] = useState("Original text...");
    const [right, setRight] = useState("Modified text...");
    // A simplified diff for "daily use". A real robust one is huge.
    // We will do simple line comparison.

    const diff = () => {
        const lLines = left.split('\n');
        const rLines = right.split('\n');
        const max = Math.max(lLines.length, rLines.length);

        return Array.from({ length: max }).map((_, i) => {
            const l = lLines[i] || "";
            const r = rLines[i] || "";
            const type = l === r ? 'eq' : 'diff';
            return { l, r, type };
        });
    };

    const rows = diff();

    return (
        <DevToolLayout featureKey="diffChecker">
            <div className="space-y-4">
                {/* Inputs for mobile, stacked. For desktop maybe hidden if we want live edit. 
                    Let's use a "Diff View" logic. User edits then sees Result?
                    Or live side-by-side editing?
                    Request 317 says: "Left input / Right Input... Side-by-side on desktop"
                */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <div className="font-bold text-gray-500 text-xs uppercase mb-1">Original</div>
                        <textarea
                            className="w-full h-32 p-2 border rounded font-mono text-xs outline-none focus:border-purple-500 dark:bg-slate-900 dark:text-white"
                            value={left} onChange={e => setLeft(e.target.value)}
                        />
                    </div>
                    <div>
                        <div className="font-bold text-gray-500 text-xs uppercase mb-1">Modified</div>
                        <textarea
                            className="w-full h-32 p-2 border rounded font-mono text-xs outline-none focus:border-purple-500 dark:bg-slate-900 dark:text-white"
                            value={right} onChange={e => setRight(e.target.value)}
                        />
                    </div>
                </div>

                {/* VISUAL DIFF */}
                <div className="mt-8 border rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-2 text-xs font-bold uppercase text-gray-500">
                        <div className="w-1/2 text-center">Original</div>
                        <div className="w-1/2 text-center">Comparison Result</div>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto font-mono text-sm">
                        {rows.map((row, i) => (
                            <div key={i} className={`flex border-b border-gray-50 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 ${row.type === 'diff' ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}`}>
                                <div className={`w-1/2 p-2 relative ${row.type === 'diff' ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                                    <span className="absolute left-1 text-[9px] text-gray-300 select-none">{i + 1}</span>
                                    {row.l}
                                </div>
                                <div className={`w-1/2 p-2 border-l border-gray-100 dark:border-slate-800 ${row.type === 'diff' ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400' : 'text-gray-400'}`}>
                                    {row.r}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DevToolLayout>
    );
}
