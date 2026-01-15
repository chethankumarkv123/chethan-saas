import { useState } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { FileUploader } from '../../components/FileUploader';
import { toast } from '../../components/Toast';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// --- DUPLICATE FINDER ---
export function DuplicateFinder() {
    const [stats, setStats] = useState(null);
    const [cleanData, setCleanData] = useState(null);

    const handleFile = (file) => {
        // We handle CSV via Papa (faster for big text) or generic simple read.
        // Let's stick to XLSX lib for universality as requested for "Excel Tools", but Papa is faster for CSV.
        // Request says "Excel tools allowed on mobile" -> heavy perf concern.
        // Let's use XLSX for parsing to handle both .xlsx and .csv uniformly for this logic.
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const wb = XLSX.read(e.target.result, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(ws);

                if (json.length > 5000) {
                    toast.error("Limit exceeded: >5000 rows.");
                    return;
                }

                // Find duplicates
                const unique = new Map();
                let dups = 0;

                const uniqueRows = json.filter(row => {
                    // Create a signature. JSON.stringify is simple but order dependent.
                    // Usually safe for row objects created by same parser.
                    const sig = JSON.stringify(row);
                    if (unique.has(sig)) {
                        dups++;
                        return false;
                    }
                    unique.set(sig, true);
                    return true;
                });

                setStats({ total: json.length, unique: uniqueRows.length, duplicates: dups });
                setCleanData(uniqueRows);
                toast.success(`Found ${dups} duplicates.`);

            } catch (err) {
                toast.error("Failed to parse.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const download = () => {
        if (!cleanData) return;
        const ws = XLSX.utils.json_to_sheet(cleanData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "UniqueData");
        XLSX.writeFile(wb, "unique_data.xlsx");
    };

    return (
        <DevToolLayout featureKey="duplicateFinder">
            <div className="max-w-xl mx-auto space-y-8">
                {!stats ? (
                    <FileUploader
                        onFileSelect={handleFile}
                        acceptedFormats={{
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                            'text/csv': ['.csv']
                        }}
                        label="Upload to Find Duplicates"
                    />
                ) : (
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-200 dark:border-slate-700 text-center shadow-sm">
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div>
                                <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stats.total}</div>
                                <div className="text-xs uppercase font-bold text-gray-400">Total Rows</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-red-500">{stats.duplicates}</div>
                                <div className="text-xs uppercase font-bold text-red-400">Duplicates</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-green-500">{stats.unique}</div>
                                <div className="text-xs uppercase font-bold text-green-400">Unique</div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button onClick={() => { setStats(null); setCleanData(null); }} className="px-4 py-2 text-gray-400 hover:text-gray-600 font-bold">Reset</button>
                            <button onClick={download} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">
                                Download Unique List
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}

// --- COLUMN SPLITTER ---
export function ColumnSplitter() {
    // A simplified visual implementation.
    // 1. Upload -> 2. Select Column + Delimiter -> 3. Download

    const [data, setData] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [targetCol, setTargetCol] = useState("");
    const [delimiter, setDelimiter] = useState(",");

    // ... Simplified logic for speed ...
    // Since implementing full interactive column ops is huge, we will do:
    // "Split [Colname] by [Delimiter]" -> Download "split_data.xlsx"

    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const wb = XLSX.read(e.target.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(ws);
            if (json.length > 5000) { toast.error("Too large!"); return; }
            if (json.length > 0) {
                setData(json);
                setHeaders(Object.keys(json[0]));
                setTargetCol(Object.keys(json[0])[0]);
            }
        };
        reader.readAsBinaryString(file);
    };

    const process = () => {
        if (!data || !targetCol) return;

        const newData = data.map(row => {
            const val = String(row[targetCol] || "");
            const parts = val.split(delimiter);
            const newRow = { ...row };
            delete newRow[targetCol]; // Remove original? Or keep? Usually split replaces or appends. Let's append.

            parts.forEach((p, i) => {
                newRow[`${targetCol}_split_${i + 1}`] = p.trim();
            });
            return newRow;
        });

        const ws = XLSX.utils.json_to_sheet(newData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SplitData");
        XLSX.writeFile(wb, "split_result.xlsx");
        toast.success("Downloaded!");
    };

    return (
        <DevToolLayout featureKey="columnSplitter">
            <div className="max-w-xl mx-auto space-y-6">
                {!data ? (
                    <FileUploader onFileSelect={handleFile} label="Upload Excel/CSV" />
                ) : (
                    <div className="space-y-4 bg-gray-50 dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Column to Split</label>
                            <select className="w-full p-2 rounded border" value={targetCol} onChange={e => setTargetCol(e.target.value)}>
                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Delimiter</label>
                            <input type="text" className="w-full p-2 rounded border" value={delimiter} onChange={e => setDelimiter(e.target.value)} placeholder="e.g. , or -" />
                        </div>
                        <button onClick={process} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">
                            Download Split File
                        </button>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}

// --- TRANSPOSE ---
export function TransposeTool() {
    const [processed, setProcessed] = useState(false);
    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const wb = XLSX.read(e.target.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(ws, { header: 1 }); // Array of arrays

            if (json.length > 2000) { toast.error("Max 2000 rows for transpose."); return; } // Strict limit for T

            // Transpose
            // data[row][col] -> data[col][row]
            const transposed = json[0].map((_, colIndex) => json.map(row => row[colIndex]));

            const newWs = XLSX.utils.aoa_to_sheet(transposed);
            const newWb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWb, newWs, "Transposed");
            XLSX.writeFile(newWb, "transposed.xlsx");
            setProcessed(true);
            toast.success("Done!");
        };
        reader.readAsBinaryString(file);
    };

    return (
        <DevToolLayout featureKey="transpose">
            <div className="max-w-xl mx-auto space-y-6">
                <FileUploader onFileSelect={handleFile} label="Upload File to Transpose" />
                <p className="text-center text-xs text-gray-400">Automatically downloads rotated file.</p>
            </div>
        </DevToolLayout>
    );
}
