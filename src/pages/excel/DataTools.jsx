import { useState } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { FileUploader } from '../../components/FileUploader';
import { toast } from '../../components/Toast';
import Papa from 'papaparse';

export function CsvCleaner() {
    const [original, setOriginal] = useState(null);
    const [cleaned, setCleaned] = useState(null);
    const [stats, setStats] = useState({ removedRows: 0, trimmedCells: 0, normalizedHeaders: 0 });

    const processCsv = (file) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true, // Auto remove empty lines
            complete: (results) => {
                setOriginal(results.data);
                cleanData(results.data, results.meta.fields);
            },
            error: () => toast.error("Failed to parse CSV")
        });
    };

    const cleanData = (data, headers) => {
        let trimCount = 0;
        let headerCount = 0; // Header normalization logic is implicit in rewriting keys

        // Normalize Headers: Trim, Lowercase, Underscore for spaces (Simple "Dev Friendly" normalization)
        // Or keep it simple: just trim headers. The requirement says "Normalize headers".
        // Let's trim and remove weird chars.

        const newHeaders = headers.map(h => {
            const cleanH = h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            if (cleanH !== h) headerCount++;
            return cleanH;
        });

        const cleanedRows = data.map(row => {
            const newRow = {};
            newHeaders.forEach((h, i) => {
                const oldKey = headers[i];
                let val = row[oldKey];
                if (typeof val === 'string') {
                    const trimmed = val.trim();
                    if (trimmed !== val) trimCount++;
                    val = trimmed;
                }
                newRow[h] = val;
            });
            // Also filter out completely empty rows (handled partly by Parse skipEmptyLines, but object might be all empty strings)
            return newRow;
        }).filter(row => Object.values(row).some(v => v !== "" && v !== null && v !== undefined));

        setCleaned(cleanedRows);
        setStats({
            removedRows: data.length - cleanedRows.length, // approximation
            trimmedCells: trimCount,
            normalizedHeaders: headerCount
        });
        toast.success("CSV Cleaned!");
    };

    const download = () => {
        if (!cleaned) return;
        const csv = Papa.unparse(cleaned);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cleaned_data.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <DevToolLayout featureKey="csvCleaner">
            <div className="space-y-8 max-w-2xl mx-auto">
                {!cleaned ? (
                    <FileUploader
                        onFileSelect={processCsv}
                        acceptedFormats={{ 'text/csv': ['.csv'] }}
                        label="Upload CSV to Clean"
                    />
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <StatBox label="Rows Removed" val={stats.removedRows} color="text-red-500" />
                            <StatBox label="Cells Trimmed" val={stats.trimmedCells} color="text-yellow-600" />
                            <StatBox label="Headers Fixed" val={stats.normalizedHeaders} color="text-green-600" />
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
                            <i className="fa-solid fa-check-circle text-4xl text-green-500 mb-4"></i>
                            <h3 className="text-xl font-bold dark:text-white mb-2">Cleaning Complete</h3>
                            <p className="text-gray-500 mb-6">Your data has been normalized and whitespace removed.</p>

                            <div className="flex gap-4 justify-center">
                                <button onClick={() => setCleaned(null)} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                                    Clean Another
                                </button>
                                <button onClick={download} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2">
                                    <i className="fa-solid fa-download"></i> Download CSV
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}

const StatBox = ({ label, val, color }) => (
    <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
        <div className={`text-2xl font-bold mb-1 ${color}`}>{val}</div>
        <div className="text-xs font-bold text-gray-400 uppercase">{label}</div>
    </div>
);

export function FormulaExplainer() {
    const [formula, setFormula] = useState("");
    const [explanation, setExplanation] = useState("");

    const explain = () => {
        if (!formula.startsWith("=")) {
            setExplanation("Excel formulas normally start with '='. Please paste the full formula.");
            return;
        }

        // Extremely basic explanation logic (Rule based)
        let exp = "This formula ";
        const f = formula.toUpperCase();

        if (f.includes("VLOOKUP")) {
            exp += "searches for a value in the first column of a range and returns a value in the same row from another column. ";
            exp += "Make sure the lookup column is the first one in your range.";
        } else if (f.includes("XLOOKUP")) {
            exp += "modern search function that looks for a value in one array and returns a corresponding value from another array. ";
        } else if (f.includes("SUMIF")) {
            exp += "calculates the sum of cells that meet a specific condition. ";
        } else if (f.includes("IF")) {
            exp += "performs a logical test: if true, it returns one value; if false, it returns another. ";
        } else if (f.includes("COUNTIF")) {
            exp += "counts the number of cells that meet a specific condition. ";
        } else if (f.includes("SUM")) {
            exp += "adds up all the numbers in the specified range. ";
        } else {
            exp += "performs a calculation based on the functions provided. (Specific explanation not in database yet).";
        }

        // Extract ranges? (Simple RegEx for A1:B10)
        const ranges = f.match(/[A-Z]+[0-9]+:[A-Z]+[0-9]+/g);
        if (ranges) {
            exp += ` It operates on the ranges: ${ranges.join(", ")}.`;
        }

        setExplanation(exp);
    };

    return (
        <DevToolLayout featureKey="formulaExplainer">
            <div className="max-w-xl mx-auto space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Paste Excel Formula</label>
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full p-4 pl-10 border rounded-xl font-mono text-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="=VLOOKUP(A2, D:E, 2, FALSE)"
                            value={formula}
                            onChange={(e) => setFormula(e.target.value)}
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">=</span>
                    </div>
                </div>

                <button onClick={explain} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">
                    <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Explain Formula
                </button>

                {explanation && (
                    <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-xl border border-purple-100 dark:border-purple-900/30 animate-fade-in-up">
                        <h3 className="text-purple-700 dark:text-purple-400 font-bold uppercase tracking-widest text-xs mb-2">Explanation</h3>
                        <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">{explanation}</p>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}
