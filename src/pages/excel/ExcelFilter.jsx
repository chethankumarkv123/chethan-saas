import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DevToolLayout } from '../../components/DevToolLayout';
import { FileUploader } from '../../components/FileUploader';
import { toast } from '../../components/Toast';
import { ProcessingOverlay } from '../../components/ProcessingOverlay';

// Constants
const MAX_ROWS = 5000;
const MAX_COLS = 50;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ExcelFilter() {
    // Data State
    const [file, setFile] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [rows, setRows] = useState([]); // Array of objects or arrays
    const [fileName, setFileName] = useState("");

    // UI State
    const [isProcessing, setIsProcessing] = useState(false);
    const [mode, setMode] = useState('ui'); // 'ui', 'text', 'search', 'dedup'
    const [filterType, setFilterType] = useState('include'); // 'include', 'exclude' (for dedup: 'keep_unique', 'show_duplicates')
    const [logic, setLogic] = useState('AND'); // 'AND' or 'OR'

    // UI Filter State
    // Condition: { id, column, operator, value }
    const [conditions, setConditions] = useState([
        { id: 1, column: '', operator: 'equals', value: '' }
    ]);

    // Text Filter State
    const [queryText, setQueryText] = useState("");

    // Search State
    const [searchTerm, setSearchTerm] = useState("");

    // Dedup State
    const [dedupCol, setDedupCol] = useState("ALL_ROWS"); // or specific column name


    // Load File
    const handleFileSelect = async (f) => {
        if (f.size > MAX_FILE_SIZE) {
            toast.error("File is too large. Max 5MB.");
            return;
        }
        setFile(f);
        setFileName(f.name);
        setIsProcessing(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length === 0) {
                    toast.error("File is empty.");
                    setFile(null);
                    setIsProcessing(false);
                    return;
                }

                if (jsonData.length > MAX_ROWS) {
                    toast.error(`Too many rows (${jsonData.length}). Limit is ${MAX_ROWS}.`);
                    setFile(null);
                    setIsProcessing(false);
                    return;
                }

                const keys = jsonData[0];
                if (keys.length > MAX_COLS) {
                    toast.error(`Too many columns (${keys.length}). Limit is ${MAX_COLS}.`);
                    setFile(null);
                    setIsProcessing(false);
                    return;
                }

                // Parse into objects for easier filtering
                // Use header names as keys
                // Filter out empty rows if any
                const parsedData = XLSX.utils.sheet_to_json(worksheet);

                setHeaders(keys);
                setRows(parsedData);
                // Reset states
                setConditions([{ id: 1, column: keys[0] || '', operator: 'equals', value: '' }]);

            } catch (err) {
                console.error(err);
                toast.error("Failed to parse file.");
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsArrayBuffer(f);
    };

    // Filter Logic
    const filteredData = useMemo(() => {
        if (!rows.length) return [];

        // 1. FILTER BUILDER
        if (mode === 'ui') {
            if (conditions.length === 0) return rows;
            return rows.filter(row => {
                const results = conditions.map(cond => {
                    const val = row[cond.column];
                    const target = cond.value;
                    const numVal = parseFloat(val);
                    const numTarget = parseFloat(target);

                    switch (cond.operator) {
                        case 'equals': return String(val) == String(target);
                        case 'not_equals': return String(val) != String(target);
                        case 'contains': return String(val).toLowerCase().includes(String(target).toLowerCase());
                        case 'not_contains': return !String(val).toLowerCase().includes(String(target).toLowerCase());
                        case 'starts_with': return String(val).toLowerCase().startsWith(String(target).toLowerCase());
                        case 'ends_with': return String(val).toLowerCase().endsWith(String(target).toLowerCase());
                        case 'gt': return !isNaN(numVal) && !isNaN(numTarget) && numVal > numTarget;
                        case 'lt': return !isNaN(numVal) && !isNaN(numTarget) && numVal < numTarget;
                        case 'is_empty': return val === undefined || val === null || val === '';
                        case 'is_not_empty': return val !== undefined && val !== null && val !== '';
                        default: return false;
                    }
                });
                const isMatch = logic === 'AND' ? results.every(r => r) : results.some(r => r);
                return filterType === 'include' ? isMatch : !isMatch;
            });
        }

        // 2. TEXT QUERY
        else if (mode === 'text') {
            if (!queryText.trim()) return rows;
            return rows.filter(row => {
                const lines = queryText.split('\n').filter(l => l.trim());
                if (lines.length === 0) return true;

                const results = lines.map(line => {
                    let op = '';
                    let fields = [];
                    if (line.includes('!=')) { op = '!='; fields = line.split('!='); }
                    else if (line.includes('>')) { op = '>'; fields = line.split('>'); }
                    else if (line.includes('<')) { op = '<'; fields = line.split('<'); }
                    else if (line.toLowerCase().includes(' contains ')) { op = 'contains'; fields = line.split(/ contains /i); }
                    else if (line.includes('=')) { op = '='; fields = line.split('='); }

                    if (!op || fields.length < 2) return false;
                    const colName = fields[0].trim();
                    const targetVal = fields[1].trim();
                    const rowVal = row[colName];
                    if (rowVal === undefined) return false;

                    const nVal = parseFloat(rowVal);
                    const nTarget = parseFloat(targetVal);

                    switch (op) {
                        case '=': return String(rowVal) == targetVal;
                        case '!=': return String(rowVal) != targetVal;
                        case '>': return !isNaN(nVal) && !isNaN(nTarget) && nVal > nTarget;
                        case '<': return !isNaN(nVal) && !isNaN(nTarget) && nVal < nTarget;
                        case 'contains': return String(rowVal).toLowerCase().includes(targetVal.toLowerCase());
                        default: return false;
                    }
                });
                const isMatch = results.every(r => r);
                return filterType === 'include' ? isMatch : !isMatch;
            });
        }

        // 3. GLOBAL SEARCH
        else if (mode === 'search') {
            if (!searchTerm.trim()) return rows;
            const lowerTerm = searchTerm.toLowerCase();
            return rows.filter(row => {
                // Check if ANY value in the row contains search term
                const isMatch = Object.values(row).some(val =>
                    String(val).toLowerCase().includes(lowerTerm)
                );
                return filterType === 'include' ? isMatch : !isMatch;
            });
        }

        // 4. DEDUPLICATE
        else if (mode === 'dedup') {
            const seen = new Set();
            const uniqueList = [];
            const duplicatesList = [];

            rows.forEach(row => {
                let sig;
                if (dedupCol === 'ALL_ROWS') {
                    sig = JSON.stringify(row); // Simple signature
                } else {
                    sig = String(row[dedupCol]);
                }

                if (seen.has(sig)) {
                    duplicatesList.push(row);
                } else {
                    seen.add(sig);
                    uniqueList.push(row);
                }
            });

            return filterType === 'unique' ? uniqueList : duplicatesList;
        }

        return rows;
    }, [rows, conditions, queryText, mode, logic, filterType, searchTerm, dedupCol]);


    // UI Helpers remain similar...
    const addCondition = () => {
        if (conditions.length >= 3) { toast.error("Max 3 conditions supported."); return; }
        setConditions([...conditions, { id: Date.now(), column: headers[0], operator: 'equals', value: '' }]);
    };
    const removeCondition = (id) => {
        if (conditions.length === 1) return;
        setConditions(conditions.filter(c => c.id !== id));
    };
    const updateCondition = (id, field, val) => {
        setConditions(conditions.map(c => c.id === id ? { ...c, [field]: val } : c));
    };
    const downloadData = (format) => {
        if (filteredData.length === 0) { toast.error("Result is empty."); return; }
        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Result_data");
        const fn = fileName.replace(/\.[^/.]+$/, "");
        if (format === 'csv') {
            const csvOut = XLSX.utils.sheet_to_csv(ws);
            const blob = new Blob([csvOut], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `${fn}_${mode}.csv`);
        } else {
            XLSX.writeFile(wb, `${fn}_${mode}.xlsx`);
        }
    };

    return (
        <DevToolLayout featureKey="excelFilter">
            <div className="max-w-6xl mx-auto space-y-8">
                <ProcessingOverlay isProcessing={isProcessing} message="Processing Data..." />

                {/* 1. UPLOAD */}
                {!file && (
                    <div className="max-w-xl mx-auto">
                        <FileUploader
                            onFileSelect={handleFileSelect}
                            accept=".xlsx, .csv"
                            label="Upload Excel or CSV (Max 5MB)"
                        />
                        <div className="text-center text-xs text-gray-400 mt-4 space-y-1">
                            <p><i className="fa-solid fa-lock mr-1"></i> Data processed locally.</p>
                            <p>Max 5,000 rows. First sheet only.</p>
                        </div>
                    </div>
                )}

                {/* 2. MAIN INTERFACE */}
                {file && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* LEFT: CONTROLS */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Mode Switcher */}
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-gray-100 dark:border-slate-700">
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Tool Mode</h3>
                                <div className="grid grid-cols-2 gap-1 bg-gray-100 dark:bg-slate-900 rounded-lg p-1">
                                    <button onClick={() => { setMode('ui'); setFilterType('include'); }} className={`py-2 px-1 text-xs font-bold rounded-md transition-all ${mode === 'ui' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}><i className="fa-solid fa-filter mr-1"></i> Filter</button>
                                    <button onClick={() => { setMode('text'); setFilterType('include'); }} className={`py-2 px-1 text-xs font-bold rounded-md transition-all ${mode === 'text' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}><i className="fa-solid fa-terminal mr-1"></i> Query</button>
                                    <button onClick={() => { setMode('search'); setFilterType('include'); }} className={`py-2 px-1 text-xs font-bold rounded-md transition-all ${mode === 'search' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}><i className="fa-solid fa-search mr-1"></i> Search</button>
                                    <button onClick={() => { setMode('dedup'); setFilterType('unique'); }} className={`py-2 px-1 text-xs font-bold rounded-md transition-all ${mode === 'dedup' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}><i className="fa-solid fa-copy mr-1"></i> Dedup</button>
                                </div>
                            </div>

                            {/* Control Panel Based on Mode */}
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow border border-gray-100 dark:border-slate-700">

                                {/* UI BUILDER */}
                                {mode === 'ui' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-gray-50 dark:bg-slate-900 border rounded-lg text-sm px-2 py-1 font-bold">
                                                <option value="include">Include Matches</option>
                                                <option value="exclude">Exclude Matches</option>
                                            </select>
                                            <select value={logic} onChange={e => setLogic(e.target.value)} className="bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs px-2 py-1 font-bold">
                                                <option value="AND">AND (All)</option>
                                                <option value="OR">OR (Any)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            {conditions.map((cond, idx) => (
                                                <div key={cond.id} className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 space-y-2 relative">
                                                    {conditions.length > 1 && <button onClick={() => removeCondition(cond.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><i className="fa-solid fa-times-circle"></i></button>}
                                                    <select value={cond.column} onChange={e => updateCondition(cond.id, 'column', e.target.value)} className="w-full text-sm p-2 border rounded bg-white dark:bg-slate-800">{headers.map(h => <option key={h} value={h}>{h}</option>)}</select>
                                                    <div className="flex gap-2">
                                                        <select value={cond.operator} onChange={e => updateCondition(cond.id, 'operator', e.target.value)} className="w-1/2 text-sm p-2 border rounded bg-white dark:bg-slate-800">
                                                            <option value="equals">=</option><option value="not_equals">!=</option><option value="contains">Contains</option><option value="not_contains">Does not contain</option><option value="starts_with">Starts with</option><option value="ends_with">Ends with</option><option value="gt">&gt;</option><option value="lt">&lt;</option><option value="is_empty">Is Empty</option><option value="is_not_empty">Is Not Empty</option>
                                                        </select>
                                                        {!['is_empty', 'is_not_empty'].includes(cond.operator) && (
                                                            <input type="text" placeholder="Value" value={cond.value} onChange={e => updateCondition(cond.id, 'value', e.target.value)} className="w-1/2 text-sm p-2 border rounded dark:bg-slate-800" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {conditions.length < 3 && <button onClick={addCondition} className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-slate-600 text-gray-400 font-bold text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">+ Add Condition</button>}
                                        </div>
                                    </div>
                                )}

                                {/* TEXT QUERY */}
                                {mode === 'text' && (
                                    <div className="space-y-2">
                                        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="mb-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm px-2 py-1 font-bold"><option value="include">Include Matches</option><option value="exclude">Exclude Matches</option></select>
                                        <textarea value={queryText} onChange={e => setQueryText(e.target.value)} placeholder={`Status=Active\nAge>25\nEmail contains @gmail.com`} className="w-full h-40 p-3 text-sm border rounded-lg font-mono bg-gray-900 text-green-400 border-gray-700 focus:outline-none focus:border-green-500" />
                                        <div className="text-xs text-gray-400">
                                            Supported: =, !=, &gt;, &lt;, contains. One per line.
                                        </div>
                                    </div>
                                )}

                                {/* GLOBAL SEARCH */}
                                {mode === 'search' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Global Search</label>
                                            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-xs px-2 py-1 font-bold"><option value="include">Include Matches</option><option value="exclude">Exclude Matches</option></select>
                                        </div>
                                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search in all columns..." className="w-full p-4 border rounded-xl shadow-inner text-lg dark:bg-slate-800 dark:border-slate-600" autoFocus />
                                        <div className="text-xs text-gray-400">Finds rows where ANY column matches this text.</div>
                                    </div>
                                )}

                                {/* DEDUPLICATE */}
                                {mode === 'dedup' && (
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Deduplicate By</label>
                                        <select value={dedupCol} onChange={e => setDedupCol(e.target.value)} className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-600 text-sm font-medium">
                                            <option value="ALL_ROWS">Whole Row (Exact Match)</option>
                                            {headers.map(h => <option key={h} value={h}>Column: {h}</option>)}
                                        </select>

                                        <div className="flex gap-2">
                                            <button onClick={() => setFilterType('unique')} className={`flex-1 py-3 rounded-lg font-bold text-sm ${filterType === 'unique' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-300'}`}>Keep Unique</button>
                                            <button onClick={() => setFilterType('duplicates')} className={`flex-1 py-3 rounded-lg font-bold text-sm ${filterType === 'duplicates' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-300'}`}>Show Duplicates</button>
                                        </div>
                                        <div className="text-xs text-gray-400">"Keep Unique" keeps the first instance and removes subsequent duplicates.</div>
                                    </div>
                                )}

                            </div>

                            {/* Download */}
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => downloadData('csv')} className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200">
                                    <i className="fa-solid fa-file-csv text-green-600"></i> CSV
                                </button>
                                <button onClick={() => downloadData('xlsx')} className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200">
                                    <i className="fa-solid fa-file-excel text-green-600"></i> XLSX
                                </button>
                            </div>

                            <button onClick={() => { setFile(null); setRows([]); }} className="w-full text-xs text-red-500 hover:underline">
                                Reset / Upload New File
                            </button>

                        </div>

                        {/* RIGHT: PREVIEW */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 flex flex-col h-[600px]">
                            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 rounded-t-2xl">
                                <div>
                                    <h3 className="font-bold text-gray-700 dark:text-gray-200">
                                        {mode === 'dedup' ? (filterType === 'unique' ? 'Unique Rows Filtered' : 'Duplicate Rows Found') : 'Filtered Results'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Showing {Math.min(filteredData.length, 100)} of <span className="font-bold text-green-600">{filteredData.length}</span> results
                                        (Original: {rows.length})
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-4">
                                {filteredData.length > 0 ? (
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-slate-700 sticky top-0 md:text-xs">
                                            <tr>
                                                {headers.map(h => (
                                                    <th key={h} className="px-4 py-3 font-bold border-b dark:border-slate-600 whitespace-nowrap bg-gray-50 dark:bg-slate-700 z-10">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.slice(0, 100).map((row, i) => (
                                                <tr key={i} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700">
                                                    {headers.map(h => (
                                                        <td key={h} className="px-4 py-2 border-r last:border-r-0 border-gray-100 dark:border-slate-700 whitespace-nowrap truncate max-w-[200px]" title={row[h]}>
                                                            {row[h]}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                        <i className="fa-solid fa-filter-circle-xmark text-4xl mb-2"></i>
                                        <p>No matching rows found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}
