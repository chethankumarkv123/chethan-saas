import { useState } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { FileUploader } from '../../components/FileUploader';
import { toast } from '../../components/Toast';
import * as XLSX from 'xlsx';

export function ExcelToJson() {
    const [json, setJson] = useState("");
    const [preview, setPreview] = useState([]);

    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0]; // First sheet only per rules
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                setJson(JSON.stringify(jsonData, null, 2));
                setPreview(jsonData.slice(0, 5)); // Preview first 5 rows
                toast.success(`Converted ${jsonData.length} rows from ${sheetName}`);
            } catch (err) {
                console.error(err);
                toast.error("Failed to parse file. Ensure it is a valid CSV or Excel file.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const downloadJson = () => {
        if (!json) return;
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted_data.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <DevToolLayout featureKey="excelToJson">
            <div className="space-y-8">
                <div className="max-w-xl mx-auto">
                    <FileUploader
                        onFileSelect={handleFile}
                        acceptedFormats={{
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                            'application/vnd.ms-excel': ['.xls'],
                            'text/csv': ['.csv']
                        }}
                        maxSize={5 * 1024 * 1024} // 5MB limit for "small files" rule
                        label="Drop Excel or CSV file"
                    />
                    <p className="text-center text-xs text-gray-400 mt-2">Max 5MB. First sheet only.</p>
                </div>

                {json && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="flex flex-col h-[500px]">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-gray-500">JSON Output</label>
                                <div className="flex gap-2">
                                    <button onClick={() => { navigator.clipboard.writeText(json); toast.success("Copied!"); }} className="text-xs font-bold text-blue-600 hover:underline">Copy</button>
                                    <button onClick={downloadJson} className="text-xs font-bold text-green-600 hover:underline">Download</button>
                                </div>
                            </div>
                            <textarea
                                className="flex-grow p-4 border rounded-xl font-mono text-xs dark:bg-slate-900 dark:border-slate-600 dark:text-white resize-none outline-none focus:border-green-500"
                                value={json}
                                readOnly
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2">Preview (First 5 Items)</label>
                            <div className="overflow-x-auto border rounded-xl dark:border-slate-700">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 uppercase font-bold">
                                        <tr>
                                            {preview.length > 0 && Object.keys(preview[0]).map(key => (
                                                <th key={key} className="px-4 py-3 whitespace-nowrap">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                        {preview.map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                                {Object.values(row).map((val, j) => (
                                                    <td key={j} className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                                        {val !== null && val !== undefined ? String(val).slice(0, 50) : ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}

export function JsonToExcel() {
    const [json, setJson] = useState("");

    const convert = (type) => { // type: 'xlsx' | 'csv'
        try {
            const data = JSON.parse(json);
            if (!Array.isArray(data)) throw new Error("JSON must be an array of objects");

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data");

            XLSX.writeFile(wb, `converted_data.${type}`);
            toast.success(`Downloaded as ${type.toUpperCase()}`);
        } catch (e) {
            toast.error("Invalid JSON. Ensure it is an array of objects [{}, {}].");
        }
    };

    return (
        <DevToolLayout featureKey="jsonToExcel">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col h-[400px]">
                    <label className="text-sm font-bold text-gray-500 mb-2">Paste JSON (Array of Objects)</label>
                    <textarea
                        className="flex-grow p-4 border rounded-xl font-mono text-xs dark:bg-slate-900 dark:border-slate-600 dark:text-white resize-none outline-none focus:border-blue-500"
                        placeholder={'[\n  {"id": 1, "name": "Alice", "role": "Dev"},\n  {"id": 2, "name": "Bob", "role": "QA"}\n]'}
                        value={json}
                        onChange={(e) => setJson(e.target.value)}
                    ></textarea>
                </div>

                <div className="flex justify-center gap-4">
                    <button onClick={() => convert('csv')} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2">
                        <i className="fa-solid fa-file-csv"></i> Download CSV
                    </button>
                    <button onClick={() => convert('xlsx')} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2">
                        <i className="fa-solid fa-file-excel"></i> Download Excel
                    </button>
                </div>
            </div>
        </DevToolLayout>
    );
}
