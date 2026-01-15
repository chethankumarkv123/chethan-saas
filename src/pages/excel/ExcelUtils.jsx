import { useState } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { toast } from '../../components/Toast';

// --- EXCEL DATE CONVERTER ---
export function ExcelDateConverter() {
    // Excel date 1 = 1900-01-01 (approx)
    // Mac Excel 1904 system exists but Windows 1900 is standard default.
    const [serial, setSerial] = useState("");
    const [dateStr, setDateStr] = useState("");

    const convert = (val) => {
        setSerial(val);
        const s = parseFloat(val);
        if (isNaN(s)) { setDateStr(""); return; }

        // JS Date from Excel serial
        // (Serial - 25569) * 86400 * 1000
        // Wait, 25569 is offset for 1970-01-01.

        const utc_days = Math.floor(s - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);

        // Adjust for timezone fraction
        const fractional_day = s - Math.floor(s) + 0.0000001;
        const total_seconds = Math.floor(86400 * fractional_day);

        const seconds = total_seconds % 60;
        const minutes = Math.floor(total_seconds / 60) % 60;
        const hours = Math.floor(total_seconds / (60 * 60));

        date_info.setSeconds(seconds);
        date_info.setMinutes(minutes);
        date_info.setHours(hours);

        // Simple ISO string or Locale
        setDateStr(date_info.toLocaleString());
    };

    return (
        <DevToolLayout featureKey="excelDate">
            <div className="max-w-xl mx-auto space-y-8 text-center">
                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Excel Serial Number</label>
                    <input
                        type="number"
                        value={serial}
                        onChange={e => convert(e.target.value)}
                        placeholder="e.g. 44927"
                        className="w-full text-center p-4 text-3xl font-mono font-bold rounded-2xl border bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 outline-none focus:border-blue-500"
                    />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-3xl border border-blue-100 dark:border-blue-800">
                    <div className="text-xs font-bold uppercase text-blue-400 mb-2">Converted Date</div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 min-h-[2rem]">
                        {dateStr || "Enter a number"}
                    </div>
                </div>

                <div className="text-xs text-gray-400">
                    Based on 1900 date system (Windows default).
                </div>
            </div>
        </DevToolLayout>
    );
}

// --- FORMULA GENERATOR ---
export function FormulaGenerator() {
    const [task, setTask] = useState("");
    const [formula, setFormula] = useState("");

    const generate = (type) => {
        let f = "";
        switch (type) {
            case 'vlookup': f = "=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])"; break;
            case 'sumif': f = "=SUMIF(range, criteria, [sum_range])"; break;
            case 'countif': f = "=COUNTIF(range, criteria)"; break;
            case 'if': f = "=IF(logical_test, value_if_true, value_if_false)"; break;
            case 'concat': f = "=CONCAT(text1, [text2], ...)"; break;
            case 'trim': f = "=TRIM(text)"; break;
            case 'len': f = "=LEN(text)"; break;
            case 'today': f = "=TODAY()"; break;
            default: f = "";
        }
        setFormula(f);
        setTask(type);
    };

    return (
        <DevToolLayout featureKey="formulaGenerator">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Btn label="VLOOKUP" onClick={() => generate('vlookup')} />
                    <Btn label="SUMIF" onClick={() => generate('sumif')} />
                    <Btn label="COUNTIF" onClick={() => generate('countif')} />
                    <Btn label="IF Statement" onClick={() => generate('if')} />
                    <Btn label="Concatenate" onClick={() => generate('concat')} />
                    <Btn label="Trim Spaces" onClick={() => generate('trim')} />
                    <Btn label="Count Chars" onClick={() => generate('len')} />
                    <Btn label="Today's Date" onClick={() => generate('today')} />
                </div>

                {formula && (
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 text-center relative group">
                        <div className="text-gray-400 text-xs font-bold uppercase mb-2">Template</div>
                        <div className="text-green-400 font-mono text-lg break-all">{formula}</div>
                        <button
                            onClick={() => { navigator.clipboard.writeText(formula); toast.success("Copied!"); }}
                            className="absolute top-1/2 right-4 -translate-y-1/2 p-2 text-gray-500 hover:text-white"
                        >
                            <i className="fa-regular fa-copy"></i>
                        </button>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}

const Btn = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="py-3 px-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm"
    >
        {label}
    </button>
);
