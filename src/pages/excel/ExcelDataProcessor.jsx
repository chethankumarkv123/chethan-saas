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

export function ExcelDataProcessor() {
    // Pipeline State
    const [step, setStep] = useState(1); // 1:Upload, 2:Filter, 3:Dedup, 4:Clean, 5:Download
    const [workingData, setWorkingData] = useState([]); // The current state of data after previous steps
    const [originalData, setOriginalData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [fileName, setFileName] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // --- STEP 2: FILTER STATE ---
    const [filters, setFilters] = useState([]); // { id, column, operator, value }
    const [filterLogic, setFilterLogic] = useState('AND');
    const [filterMode, setFilterMode] = useState('include'); // include/exclude

    // --- STEP 3: DEDUP STATE ---
    const [dedupCol, setDedupCol] = useState("ALL_ROWS");
    const [dedupMode, setDedupMode] = useState("keep_first"); // keep_first, keep_last

    // --- STEP 4: CLEAN STATE ---
    const [cleanOpts, setCleanOpts] = useState({
        trimWhitespace: false,
        removeEmptyRows: false,
        normalizeHeaders: false
    });

    // --- HELPER: PARSE FILE ---
    const handleFileSelect = (f) => {
        if (f.size > MAX_FILE_SIZE) { toast.error("File > 5MB"); return; }
        setFileName(f.name);
        setIsProcessing(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                const ws = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(ws);

                if (json.length === 0) throw new Error("Empty file");
                if (json.length > MAX_ROWS) throw new Error(`Rows > ${MAX_ROWS}`);

                const keys = Object.keys(json[0] || {});
                if (keys.length > MAX_COLS) throw new Error(`Cols > ${MAX_COLS}`);

                setOriginalData(json);
                setWorkingData(json);
                setHeaders(keys);
                setStep(2);
                toast.success(`Loaded ${json.length} rows`);
            } catch (err) {
                toast.error(err.message || "Parse failed");
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsBinaryString(f);
    };

    // --- PIPELINE COMPUTATION ---
    const processedData = useMemo(() => {
        let current = [...originalData];

        // 1. APPLY FILTERS
        if (filters.length > 0) {
            current = current.filter(row => {
                const results = filters.map(cond => {
                    const rowVal = row[cond.column];
                    const target = cond.value;
                    const numVal = parseFloat(rowVal);
                    const numTarget = parseFloat(target);

                    switch (cond.operator) {
                        case 'equals': return String(rowVal) == String(target);
                        case 'not_equals': return String(rowVal) != String(target);
                        case 'contains': return String(rowVal).toLowerCase().includes(String(target).toLowerCase());
                        case 'not_contains': return !String(rowVal).toLowerCase().includes(String(target).toLowerCase());
                        case 'gt': return !isNaN(numVal) && !isNaN(numTarget) && numVal > numTarget;
                        case 'lt': return !isNaN(numVal) && !isNaN(numTarget) && numVal < numTarget;
                        case 'is_empty': return !rowVal;
                        case 'is_not_empty': return !!rowVal;
                        default: return false;
                    }
                });
                const match = filterLogic === 'AND' ? results.every(r => r) : results.some(r => r);
                return filterMode === 'include' ? match : !match;
            });
        }

        // 2. APPLY DEDUP
        // Only if we are past step 3 or currently viewing step 3 preview? 
        // Actually, user wants "Step based workflow". 
        // We should apply logic cumulatively.
        // If step >= 4, apply dedup results implicitly? 
        // No, let's just compute everything reactively based on settings, 
        // but specific steps expose specific controls.

        if (dedupCol) { // Only if logic is active. But user might skip step.
            // We'll manage "Active" flags? Or just apply if settings are defaults?
            // "ALL_ROWS" is default.
            // Let's assume dedup is always applied, but "ALL_ROWS" + "Unique" is standard.
            // If user didn't touch it, maybe they don't want to dedup?
            // Step workflow usually means user confirms action.
            // Ideally we carry over 'workingData' from step to step?
            // "State based" approach is better for react: processedData is result of ALL settings.
            // If user skips Dedup step, settings remain default.
            // Default Dedup: "ALL_ROWS" and "Keep First"? That removes exact duplicates.
            // Usually desired.
        }

        // To support "Skipping", we need "Is Dedup Active?".
        // Let's just calculate it.

        // Dedup Logic
        // We only apply this if we want to visualize the END result.
        // For Step 2 preview, we show Filtered.
        // For Step 3 preview, we show Deduped (on top of filtered).
        // For Step 4 preview, we show Cleaned (on top of deduped).
        // Let's control "viewData" based on Step.
        return current;

    }, [originalData, filters, filterLogic, filterMode, dedupCol, dedupMode, cleanOpts]);

    // --- STEP LOGIC ---
    // We actually need to "commit" changes between steps if we want a linear flow?
    // Or just use one big pipeline. Big pipeline is reactive and better for "Back" button.

    // Let's refine the pipeline:
    const step1Data = originalData; // Uploaded

    const step2Data = useMemo(() => { // Filtered
        if (filters.length === 0) return step1Data;
        return step1Data.filter(row => {
            const results = filters.map(cond => {
                const val = row[cond.column];
                const t = cond.value;
                const nVal = parseFloat(val);
                const nT = parseFloat(t);
                switch (cond.operator) {
                    case 'eq': return String(val) == String(t);
                    case 'neq': return String(val) != String(t);
                    case 'inc': return String(val).toLowerCase().includes(String(t).toLowerCase());
                    case 'ninc': return !String(val).toLowerCase().includes(String(t).toLowerCase());
                    case 'gt': return nVal > nT;
                    case 'lt': return nVal < nT;
                    case 'empty': return !val;
                    case 'nempty': return !!val;
                    default: return false;
                }
            });
            const match = filterLogic === 'AND' ? results.every(r => r) : results.some(r => r);
            return filterMode === 'include' ? match : !match;
        });
    }, [step1Data, filters, filterLogic, filterMode]);

    const step3Data = useMemo(() => { // Deduped
        // If user hasn't configured dedup or just default, we do remove exact row duplicates?
        // Let's say default is: Remove Exact Duplicates (Keep First).
        const seen = new Set();
        const res = [];
        // If keep_last, we reverse, filter, reverse back.
        const src = dedupMode === 'keep_last' ? [...step2Data].reverse() : step2Data;

        src.forEach(row => {
            let sig;
            if (dedupCol === 'ALL_ROWS') sig = JSON.stringify(row);
            else sig = String(row[dedupCol]);

            if (!seen.has(sig)) {
                seen.add(sig);
                res.push(row);
            }
        });

        return dedupMode === 'keep_last' ? res.reverse() : res;
    }, [step2Data, dedupCol, dedupMode]);

    const step4Data = useMemo(() => { // Cleaned
        let res = step3Data;
        if (cleanOpts.trimWhitespace) {
            res = res.map(row => {
                const newRow = {};
                Object.keys(row).forEach(k => {
                    newRow[k] = typeof row[k] === 'string' ? row[k].trim() : row[k];
                });
                return newRow;
            });
        }
        if (cleanOpts.removeEmptyRows) {
            res = res.filter(row => Object.values(row).some(v => !!v));
        }
        if (cleanOpts.normalizeHeaders) {
            // This actually changes headers, tricky for the table keys. 
            // We'll skip implementation for stability or just lower-case them.
            // Let's skip for now to avoid breaking the Table render which relies on `headers`.
        }
        return res;
    }, [step3Data, cleanOpts]);


    // Helper to add filter
    const addFilter = () => {
        if (filters.length >= 3) return;
        setFilters([...filters, { id: Date.now(), column: headers[0], operator: 'eq', value: '' }]);
    };

    // Helper to remove filter
    const removeFilter = (id) => setFilters(filters.filter(f => f.id !== id));

    // Helper to update filter
    const updateFilter = (id, key, val) => {
        setFilters(filters.map(f => f.id === id ? { ...f, [key]: val } : f));
    };

    // Download
    const download = (fmt) => {
        if (step4Data.length === 0) { toast.error("No data"); return; }
        const ws = XLSX.utils.json_to_sheet(step4Data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Processed");
        const n = fileName.replace(/\.[^/.]+$/, "");
        if (fmt === 'csv') {
            const csv = XLSX.utils.sheet_to_csv(ws);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `${n}_processed.csv`);
        } else {
            XLSX.writeFile(wb, `${n}_processed.xlsx`);
        }
        toast.success("Downloaded!");
    };


    return (
        <DevToolLayout featureKey="excelDataProcessor">
            <ProcessingOverlay isProcessing={isProcessing} />
            <div className="max-w-5xl mx-auto">

                {/* Stepper Header */}
                <div className="mb-8 px-4">
                    <div className="flex items-center justify-between mb-2">
                        {[1, 2, 3, 4, 5].map(s => (
                            <div key={s} className={`flex items-center ${s < 5 ? 'flex-1' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-slate-700'}`}>
                                    {s}
                                </div>
                                {s < 5 && <div className={`h-1 flex-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'}`} />}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex-1 text-center">Upload</div>
                        <div className="flex-1 text-center">Filter</div>
                        <div className="flex-1 text-center font-bold text-purple-600 dark:text-purple-400">Find Duplicates</div>
                        <div className="flex-1 text-center">Clean</div>
                        <div className="flex-1 text-center">Download</div>
                    </div>
                </div>

                {/* STEP 1: UPLOAD */}
                {step === 1 && (
                    <div className="max-w-xl mx-auto text-center space-y-6 animate-fade-in-up">
                        <h2 className="text-2xl font-bold">Upload Data</h2>
                        <FileUploader onFileSelect={handleFileSelect} accept=".xlsx,.csv" multiple={false} disabled={isProcessing} helperText="Upload Excel or CSV file (max 5MB, 5000 rows)" />
                        <div className="text-xs text-gray-400">max 5MB, 5000 rows</div>
                    </div>
                )}

                {/* STEP 2: FILTER */}
                {step === 2 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><i className="fa-solid fa-filter text-blue-500"></i> Filter Rows</h2>

                            <div className="flex gap-4 mb-4">
                                <select value={filterMode} onChange={e => setFilterMode(e.target.value)} className="bg-gray-50 dark:bg-slate-900 border rounded p-2 text-sm font-bold">
                                    <option value="include">Include Matches</option>
                                    <option value="exclude">Exclude Matches</option>
                                </select>
                                <select value={filterLogic} onChange={e => setFilterLogic(e.target.value)} className="bg-gray-50 dark:bg-slate-900 border rounded p-2 text-sm font-bold">
                                    <option value="AND">Match ALL (AND)</option>
                                    <option value="OR">Match ANY (OR)</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                {filters.map(f => (
                                    <div key={f.id} className="flex gap-2 items-center bg-gray-50 dark:bg-slate-900 p-2 rounded-lg">
                                        <select value={f.column} onChange={e => updateFilter(f.id, 'column', e.target.value)} className="flex-1 p-2 border rounded text-sm bg-white dark:bg-slate-800">{headers.map(h => <option key={h} value={h}>{h}</option>)}</select>
                                        <select value={f.operator} onChange={e => updateFilter(f.id, 'operator', e.target.value)} className="w-32 p-2 border rounded text-sm bg-white dark:bg-slate-800">
                                            <option value="eq">=</option><option value="neq">!=</option><option value="inc">Contains</option><option value="ninc">Not Contains</option><option value="gt">&gt;</option><option value="lt">&lt;</option><option value="empty">Empty</option><option value="nempty">Not Empty</option>
                                        </select>
                                        {!['empty', 'nempty'].includes(f.operator) && <input value={f.value} onChange={e => updateFilter(f.id, 'value', e.target.value)} className="flex-1 p-2 border rounded text-sm bg-white dark:bg-slate-800" placeholder="Value" />}
                                        <button onClick={() => removeFilter(f.id)} className="text-red-500 px-2"><i className="fa-solid fa-times"></i></button>
                                    </div>
                                ))}
                                {filters.length < 3 && <button onClick={addFilter} className="text-sm font-bold text-blue-500 hover:underline">+ Add Condition</button>}
                            </div>

                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                Rows remaining: <b>{step2Data.length}</b> / {step1Data.length}
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 font-medium">← Back</button>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(3)} className="text-blue-600 hover:text-blue-700 font-bold">Skip Filtering →</button>
                                <button onClick={() => setStep(3)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700">Next: Remove Duplicates →</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: DEDUP */}
                {step === 3 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><i className="fa-solid fa-copy text-purple-500"></i> Remove Duplicates</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Check for duplicates in</label>
                                    <select value={dedupCol} onChange={e => setDedupCol(e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900">
                                        <option value="ALL_ROWS">Whole Row (Exact Match)</option>
                                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Action</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={dedupMode === 'keep_first'} onChange={() => setDedupMode('keep_first')} className="w-4 h-4 text-purple-600" />
                                            <span>Keep First Instance</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={dedupMode === 'keep_last'} onChange={() => setDedupMode('keep_last')} className="w-4 h-4 text-purple-600" />
                                            <span>Keep Last Instance</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm text-purple-700 dark:text-purple-300">
                                Unique Rows: <b>{step3Data.length}</b> (Removed {step2Data.length - step3Data.length} duplicates)
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <button onClick={() => setStep(2)} className="text-gray-400">Back</button>
                            <button onClick={() => setStep(4)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700">Next: Clean &rarr;</button>
                        </div>
                    </div>
                )}

                {/* STEP 4: CLEAN */}
                {step === 4 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><i className="fa-solid fa-broom text-orange-500"></i> Cleanup</h2>

                            <div className="space-y-3">
                                <label className="flex items-center p-3 border rounded-xl hover:bg-gray-50 dark:hover:bg-slate-900 cursor-pointer">
                                    <input type="checkbox" checked={cleanOpts.trimWhitespace} onChange={e => setCleanOpts({ ...cleanOpts, trimWhitespace: e.target.checked })} className="w-5 h-5 text-orange-500 rounded" />
                                    <span className="ml-3 font-medium">Trim Whitespace</span>
                                    <span className="ml-auto text-xs text-gray-400">Remove spaces from start/end of text</span>
                                </label>
                                <label className="flex items-center p-3 border rounded-xl hover:bg-gray-50 dark:hover:bg-slate-900 cursor-pointer">
                                    <input type="checkbox" checked={cleanOpts.removeEmptyRows} onChange={e => setCleanOpts({ ...cleanOpts, removeEmptyRows: e.target.checked })} className="w-5 h-5 text-orange-500 rounded" />
                                    <span className="ml-3 font-medium">Remove Empty Rows</span>
                                    <span className="ml-auto text-xs text-gray-400">Delete rows with no data</span>
                                </label>
                            </div>

                            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-sm text-orange-700 dark:text-orange-300">
                                Rows after cleaning: <b>{step4Data.length}</b>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <button onClick={() => setStep(3)} className="text-gray-400">Back</button>
                            <button onClick={() => setStep(5)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700">Next: Preview &rarr;</button>
                        </div>
                    </div>
                )}

                {/* STEP 5: PREVIEW & DOWNLOAD */}
                {step === 5 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm h-[500px] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2"><i className="fa-solid fa-table text-green-500"></i> Final Preview</h2>
                                <div className="text-sm text-gray-500">
                                    Total: <b className="text-green-600">{step4Data.length}</b> rows
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto border rounded-xl">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0">
                                        <tr>{headers.map(h => <th key={h} className="px-4 py-2 border-b whitespace-nowrap">{h}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {step4Data.slice(0, 100).map((row, i) => (
                                            <tr key={i} className="border-b hover:bg-gray-50 dark:hover:bg-slate-900">
                                                {headers.map(h => <td key={h} className="px-4 py-2 border-r last:border-r-0 truncate max-w-[200px]">{row[h]}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button onClick={() => setStep(4)} className="px-6 py-3 text-gray-500 font-bold">Back</button>
                            <button onClick={() => download('csv')} className="px-8 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 shadow-lg"><i className="fa-solid fa-file-csv mr-2"></i> Download CSV</button>
                            <button onClick={() => download('xlsx')} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg"><i className="fa-solid fa-file-excel mr-2"></i> Download XLSX</button>
                        </div>
                        <div className="text-center mt-4">
                            <button onClick={() => { setStep(1); setOriginalData([]); setFilters([]); }} className="text-red-400 text-sm hover:underline">Start Over</button>
                        </div>
                    </div>
                )}

            </div>
        </DevToolLayout>
    );
}
