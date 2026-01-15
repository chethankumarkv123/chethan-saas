import { useState } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { FileUploader } from '../../components/FileUploader';
import { toast } from '../../components/Toast';
import * as XLSX from 'xlsx';

// --- ERROR EXPLAINER ---
export function ExcelErrorExplainer() {
    const [selected, setSelected] = useState("");

    const errors = {
        "#DIV/0!": "Division by Zero. You are trying to divide a number by 0 or an empty cell.",
        "#N/A": "Not Available. A formula can't find the referenced data (Common in VLOOKUP).",
        "#NAME?": "Invalid Name. Excel doesn't recognize text in a formula (Typo in function name?).",
        "#NULL!": "Null Intersection. You specified an intersection of two ranges that don't intersect.",
        "#NUM!": "Number Error. A formula or function contains numeric values that aren't valid.",
        "#REF!": "Reference Invalid. The formula refers to a cell that is not valid (Deleted cell?).",
        "#VALUE!": "Value Error. Wrong type of argument or operand (e.g. adding Text + Number)."
    };

    return (
        <DevToolLayout featureKey="excelErrorExplainer">
            <div className="max-w-xl mx-auto space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.keys(errors).map(err => (
                        <button
                            key={err}
                            onClick={() => setSelected(err)}
                            className={`p-3 rounded-xl border font-bold text-sm transition-all ${selected === err ? 'bg-red-500 text-white border-red-600' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-red-400'}`}
                        >
                            {err}
                        </button>
                    ))}
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-3xl border border-red-100 dark:border-red-800/30 text-center min-h-[160px] flex items-center justify-center">
                    {selected ? (
                        <div>
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">{selected}</div>
                            <div className="text-lg text-gray-800 dark:text-gray-200">{errors[selected]}</div>
                        </div>
                    ) : (
                        <div className="text-gray-400 font-bold">Select an error code to explain</div>
                    )}
                </div>
            </div>
        </DevToolLayout>
    );
}

// --- COLUMN MERGER ---
export function ColumnMerger() {
    const [data, setData] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [col1, setCol1] = useState("");
    const [col2, setCol2] = useState("");
    const [del, setDel] = useState(" ");

    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const wb = XLSX.read(e.target.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(ws);
            if (json.length > 5000) { toast.error("Too large!"); return; }
            if (json.length > 0) {
                setData(json);
                const h = Object.keys(json[0]);
                setHeaders(h);
                if (h.length >= 2) { setCol1(h[0]); setCol2(h[1]); }
            }
        };
        reader.readAsBinaryString(file);
    };

    const process = () => {
        if (!data || !col1 || !col2) return;

        const newData = data.map(row => {
            const val1 = row[col1] || "";
            const val2 = row[col2] || "";
            const merged = `${val1}${del}${val2}`;
            return { ...row, [`Merged_${col1}_${col2}`]: merged };
        });

        const ws = XLSX.utils.json_to_sheet(newData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Merged");
        XLSX.writeFile(wb, "merged_data.xlsx");
        toast.success("Downloaded!");
    };

    return (
        <DevToolLayout featureKey="columnMerger">
            <div className="max-w-xl mx-auto space-y-6">
                {!data ? (
                    <FileUploader onFileSelect={handleFile} label="Upload Excel/CSV" />
                ) : (
                    <div className="space-y-4 bg-gray-50 dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Column A</label>
                                <select className="w-full p-2 rounded border" value={col1} onChange={e => setCol1(e.target.value)}>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Column B</label>
                                <select className="w-full p-2 rounded border" value={col2} onChange={e => setCol2(e.target.value)}>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Delimiter</label>
                            <input type="text" className="w-full p-2 rounded border" value={del} onChange={e => setDel(e.target.value)} placeholder="Space, comma, etc." />
                        </div>
                        <button onClick={process} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">
                            Merge & Download
                        </button>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}

// --- HEADER NORMALIZER ---
export function HeaderNormalizer() {
    const [processed, setProcessed] = useState(false);

    // Mode: snake_case, camelCase, lowercase
    const [mode, setMode] = useState("snake_case");

    const toCamel = (str) => {
        return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
    };

    const toSnake = (str) => {
        return str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
            .map(x => x.toLowerCase())
            .join('_');
    };

    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const wb = XLSX.read(e.target.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(ws);

            if (json.length > 5000) { toast.error("Too large!"); return; }
            if (json.length === 0) return;

            const newJson = json.map(row => {
                const newRow = {};
                Object.keys(row).forEach(key => {
                    let newKey = key;
                    if (mode === 'snake_case') newKey = toSnake(key);
                    else if (mode === 'camelCase') newKey = toCamel(key);
                    else newKey = key.toLowerCase().replace(/\s+/g, '');

                    newRow[newKey] = row[key];
                });
                return newRow;
            });

            const newWs = XLSX.utils.json_to_sheet(newJson);
            const newWb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWb, newWs, "Normalized");
            XLSX.writeFile(newWb, "normalized_headers.xlsx");
            toast.success("Downloaded!");
            setProcessed(true);
        };
        reader.readAsBinaryString(file);
    };

    return (
        <DevToolLayout featureKey="headerNormalizer">
            <div className="max-w-xl mx-auto space-y-6">
                <div className="flex justify-center gap-4 mb-4">
                    {['snake_case', 'camelCase', 'lowercase'].map(m => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm border capitalize ${mode === m ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-gray-200 text-gray-500'}`}
                        >
                            {m.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <FileUploader onFileSelect={handleFile} label={`Upload to convert to ${mode}`} />

                <p className="text-center text-xs text-gray-400">
                    Example: "First Name" → {mode === 'snake_case' ? 'first_name' : mode === 'camelCase' ? 'firstName' : 'firstname'}
                </p>
            </div>
        </DevToolLayout>
    );
}
