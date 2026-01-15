import { useState } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { FileUploader } from '../../components/FileUploader';
import { toast } from '../../components/Toast';
import * as XLSX from 'xlsx';

// Common limit check
const checkLimits = (data) => {
    if (data.length > 5000) {
        toast.error("File input exceeds 5000 rows limit. Truncating for performance.");
        return data.slice(0, 5000);
    }
    return data;
};

// --- EXCEL TO CSV ---
export function ExcelToCsv() {
    const [csv, setCsv] = useState("");

    // Performance: We use FileReader.readAsBinaryString + XLSX
    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const wb = XLSX.read(e.target.result, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const csvOutput = XLSX.utils.sheet_to_csv(ws);
                setCsv(csvOutput);
                toast.success("Converted!");
            } catch (err) {
                toast.error("Error reading file.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const download = () => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <DevToolLayout featureKey="excelToCsv">
            <div className="max-w-xl mx-auto space-y-6">
                <FileUploader
                    onFileSelect={handleFile}
                    acceptedFormats={{
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                        'application/vnd.ms-excel': ['.xls']
                    }}
                    label="Drop Excel File"
                    maxSize={5 * 1024 * 1024}
                />
                {csv && (
                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-xs font-bold uppercase text-gray-500">Preview (First 500 chars)</div>
                            <button onClick={download} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg text-xs hover:bg-green-700">Download CSV</button>
                        </div>
                        <pre className="text-xs font-mono overflow-auto max-h-60 text-gray-700 dark:text-gray-300">
                            {csv.slice(0, 500)}...
                        </pre>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}

// --- CSV TO EXCEL ---
export function CsvToExcel() {
    const [processed, setProcessed] = useState(false);
    const [data, setData] = useState(null);

    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const wb = XLSX.read(text, { type: 'string' }); // Read CSV as string
                // Validate limits?
                const ws = wb.Sheets[wb.SheetNames[0]];
                setData(wb);
                setProcessed(true);
                toast.success("Ready to download!");
            } catch (err) {
                toast.error("Error parsing CSV.");
            }
        };
        reader.readAsText(file);
    };

    const download = () => {
        if (!data) return;
        XLSX.writeFile(data, "converted.xlsx");
    };

    return (
        <DevToolLayout featureKey="csvToExcel">
            <div className="max-w-xl mx-auto space-y-6">
                <FileUploader
                    onFileSelect={handleFile}
                    acceptedFormats={{ 'text/csv': ['.csv'] }}
                    label="Drop CSV File"
                    maxSize={5 * 1024 * 1024}
                />
                {processed && (
                    <button onClick={download} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                        <i className="fa-solid fa-file-excel"></i> Download Excel (.xlsx)
                    </button>
                )}
            </div>
        </DevToolLayout>
    );
}

// --- EXCEL TO SQL ---
export function ExcelToSql() {
    const [sql, setSql] = useState("");
    const [tableName, setTableName] = useState("my_table");

    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const wb = XLSX.read(e.target.result, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                let json = XLSX.utils.sheet_to_json(ws);
                json = checkLimits(json);

                if (json.length === 0) return;

                const keys = Object.keys(json[0]);
                const stmts = json.map(row => {
                    const vals = keys.map(k => {
                        const v = row[k];
                        return typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v;
                    });
                    return `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${vals.join(', ')});`;
                });

                setSql(stmts.join('\n'));
                toast.success(`Generated ${stmts.length} INSERTs`);
            } catch (err) {
                toast.error("Failed to process.");
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <DevToolLayout featureKey="excelToSql">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex gap-4">
                    <div className="flex-grow">
                        <FileUploader
                            onFileSelect={handleFile}
                            acceptedFormats={{
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                                'text/csv': ['.csv']
                            }}
                            label="Upload Data"
                            compact={true}
                        />
                    </div>
                    <div className="w-1/3">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Table Name</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-xl font-bold dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                            value={tableName}
                            onChange={e => setTableName(e.target.value)}
                        />
                    </div>
                </div>

                {sql && (
                    <div className="relative">
                        <button onClick={() => { navigator.clipboard.writeText(sql); toast.success("Copied!"); }} className="absolute top-2 right-2 text-xs bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded font-bold hover:bg-gray-300">Copy</button>
                        <textarea
                            className="w-full h-80 p-4 border rounded-xl font-mono text-xs dark:bg-slate-900 dark:border-slate-600 dark:text-blue-300 resize-none outline-none"
                            readOnly
                            value={sql}
                        ></textarea>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}

// --- EXCEL TO YAML ---
export function ExcelToYaml() {
    const [yaml, setYaml] = useState("");

    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const wb = XLSX.read(e.target.result, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                let json = XLSX.utils.sheet_to_json(ws);
                json = checkLimits(json);

                // Simple JSON to YAML conversion
                const toYaml = (obj, indent = 0) => {
                    // Primitive YAML converter for flat lists of objects (expected Excel output)
                    // Does NOT handle deep nesting well, but Excel is flat.
                    let s = "";
                    const pad = "  ".repeat(indent);
                    if (Array.isArray(obj)) {
                        obj.forEach(item => {
                            s += `${pad}-\n`;
                            Object.entries(item).forEach(([k, v]) => {
                                s += `${pad}  ${k}: ${typeof v === 'string' && (v.includes(':') || v.includes('#')) ? `"${v}"` : v}\n`;
                            });
                        });
                    }
                    return s;
                };

                setYaml(toYaml(json));
                toast.success("Converted to YAML");
            } catch (err) {
                toast.error("Failed to process.");
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <DevToolLayout featureKey="excelToYaml">
            <div className="max-w-xl mx-auto space-y-6">
                <FileUploader
                    onFileSelect={handleFile}
                    acceptedFormats={{
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                        'text/csv': ['.csv']
                    }}
                    label="Upload Data"
                />

                {yaml && (
                    <div className="relative">
                        <button onClick={() => { navigator.clipboard.writeText(yaml); toast.success("Copied!"); }} className="absolute top-2 right-2 text-xs bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded font-bold hover:bg-gray-300">Copy</button>
                        <textarea
                            className="w-full h-80 p-4 border rounded-xl font-mono text-xs dark:bg-slate-900 dark:border-slate-600 dark:text-green-300 resize-none outline-none"
                            readOnly
                            value={yaml}
                        ></textarea>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}
