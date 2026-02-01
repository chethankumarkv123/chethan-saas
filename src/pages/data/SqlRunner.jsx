
import React, { useState, useEffect, useRef } from 'react';
import {
    Database,
    Table,
    Play,
    Upload,
    Download,
    Trash2,
    FileSpreadsheet,
    AlertTriangle,
    Clock,
    Plus,
    X,
    FileJson,
    Code,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import initSqlJs from 'sql.js';
import { SEO } from '../../components/SEO';
import toast from 'react-hot-toast';

// We need to point to the WASM file. Using CDN for simplicity in this setup.
// In a production build, you'd copy sql-wasm.wasm to your public folder.
const SQL_WASM_URL = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm";

export function SqlRunner() {
    const [db, setDb] = useState(null);
    const [tables, setTables] = useState([]);
    const [query, setQuery] = useState('SELECT * FROM sqlite_master WHERE type="table";');
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [execTime, setExecTime] = useState(0);
    const [isTablePanelOpen, setIsTablePanelOpen] = useState(true);

    const fileInputRef = useRef(null);

    useEffect(() => {
        const loadSqlEngine = async () => {
            try {
                const SQL = await initSqlJs({
                    locateFile: file => SQL_WASM_URL
                });
                const database = new SQL.Database();
                setDb(database);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to load SQL.js", err);
                setError("Failed to initialize SQL engine. Check internet connection for WASM load.");
                setIsLoading(false);
            }
        };

        loadSqlEngine();
    }, []);

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                complete: (results) => {
                    if (results.data.length === 0) {
                        toast.error(`File ${file.name} is empty`);
                        return;
                    }
                    createTableFromData(file.name, results.data, results.meta.fields);
                },
                error: (err) => {
                    toast.error(`Failed to parse ${file.name}: ${err.message}`);
                }
            });
        });

        // Reset input
        e.target.value = null;
    };

    const createTableFromData = (filename, data, headers) => {
        if (!db) return;

        // Sanitize table name: remove extension, keep alphanumeric
        let tableName = filename.split('.')[0].replace(/[^a-zA-Z0-9_]/g, '_');

        // Ensure unique name
        let uniqueName = tableName;
        let counter = 1;
        while (tables.some(t => t.name === uniqueName)) {
            uniqueName = `${tableName}_${counter}`;
            counter++;
        }
        tableName = uniqueName;

        try {
            // 1. Create Table
            // Detect types roughly
            const firstRow = data[0];
            const colDefs = headers.map(header => {
                const val = firstRow[header];
                let type = "TEXT";
                if (typeof val === 'number') type = "REAL";
                // Sanitize column name
                const safeHeader = header.replace(/[^a-zA-Z0-9_]/g, '');
                return `${safeHeader ? safeHeader : `col_${Math.random().toString(36).substr(2, 5)}`} ${type}`;
            });

            // If header sanitization failed (e.g. empty strings), we might have issues. 
            // Better matching: explicitly map raw headers to safe column names.
            const headerMap = headers.reduce((acc, curr, idx) => {
                const safe = curr.replace(/[^a-zA-Z0-9_]/g, '') || `col_${idx}`;
                acc[curr] = safe;
                return acc;
            }, {});

            const createSql = `CREATE TABLE ${tableName} (${Object.values(headerMap).map(col => `${col} TEXT`).join(', ')});`; // Defaulting all to TEXT for safety in CSV import usually better, but let's try.
            // Actually, dynamic typing in SQLite is flexible. TEXT is safest for import.

            db.run(createSql);

            // 2. Insert Data
            // Prepare statement is faster for bulk insert
            const insertSql = `INSERT INTO ${tableName} VALUES (${Object.keys(headerMap).map(() => '?').join(', ')})`;
            const stmt = db.prepare(insertSql);

            data.forEach(row => {
                // Map row data to the order of headers
                const values = headers.map(h => row[h]);
                stmt.run(values);
            });
            stmt.free();

            const newTable = {
                name: tableName,
                rowCount: data.length,
                columns: Object.values(headerMap)
            };

            setTables(prev => [...prev, newTable]);
            toast.success(`Imported table '${tableName}' (${data.length} rows)`);

            // Generate a sample query for the user
            setQuery(`SELECT * FROM ${tableName} LIMIT 10;`);

        } catch (err) {
            console.error(err);
            toast.error(`Failed to create table: ${err.message}`);
        }
    };

    const runQuery = () => {
        if (!db || !query.trim()) return;

        const startTime = performance.now();
        try {
            const res = db.exec(query);
            const endTime = performance.now();
            setExecTime(endTime - startTime);

            if (res.length === 0) {
                // Query ran fine but no results (e.g. UPDATE, or empty SELECT)
                setResults({ columns: [], values: [], message: "Query executed successfully. No rows returned." });
            } else {
                setResults(res[0]); // sql.js returns array of result sets, usually we just want the first one
            }
            setError(null);
        } catch (err) {
            setError(err.message);
            setResults(null);
        }
    };

    const exportResults = (format) => {
        if (!results || !results.values || results.values.length === 0) {
            toast.error("No results to export");
            return;
        }

        const dataToExport = [
            results.columns,
            ...results.values
        ];

        if (format === 'csv') {
            const csv = Papa.unparse(dataToExport);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'query_results.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === 'json') {
            // Convert to array of objects
            const jsonObjects = results.values.map(row => {
                const obj = {};
                results.columns.forEach((col, idx) => {
                    obj[col] = row[idx];
                });
                return obj;
            });
            const blob = new Blob([JSON.stringify(jsonObjects, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'query_results.json');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === 'xlsx') {
            // Use XLSX to write
            const ws = XLSX.utils.aoa_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Results");
            XLSX.writeFile(wb, "query_results.xlsx");
        }
    };

    const dropTable = (tableName) => {
        try {
            db.run(`DROP TABLE IF EXISTS ${tableName}`);
            setTables(prev => prev.filter(t => t.name !== tableName));
            toast.success(`Dropped table ${tableName}`);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const insertSampleData = () => {
        const sampleData = [
            { id: 1, name: 'Alice Smith', department: 'Sales', salary: 50000, join_date: '2022-01-15' },
            { id: 2, name: 'Bob Jones', department: 'Engineering', salary: 85000, join_date: '2021-06-23' },
            { id: 3, name: 'Charlie Day', department: 'Marketing', salary: 45000, join_date: '2023-03-12' },
            { id: 4, name: 'Dana White', department: 'Engineering', salary: 92000, join_date: '2020-11-05' },
            { id: 5, name: 'Eve Black', department: 'Sales', salary: 52000, join_date: '2022-08-19' },
        ];
        const headers = ['id', 'name', 'department', 'salary', 'join_date'];
        createTableFromData('employees.csv', sampleData, headers);
    };

    return (
        <div className="pt-24 pb-12 px-4 max-w-[1600px] mx-auto min-h-screen flex flex-col">
            <SEO
                title="CSV SQL Runner - Run SQL on CSV Files"
                description="Upload CSV files and run SQL queries locally in your browser. Join tables, filter data, and export results."
                keywords="csv to sql, run sql on csv, browser sqlite, csv sql editor, local data analysis"
            />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Database className="text-blue-600 dark:text-blue-400" />
                        SQL Runner
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Turn your CSV files into a relational database instantly.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={insertSampleData}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        Load Sample Data
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                        <Upload size={16} />
                        Import CSV
                    </button>
                    <input
                        type="file"
                        accept=".csv"
                        multiple
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Initializing SQL Engine...</p>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

                    {/* Sidebar / Table List */}
                    <div className={`${isTablePanelOpen ? 'w-full lg:w-64' : 'w-auto'} flex-shrink-0 transition-all duration-300`}>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-full flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                                {isTablePanelOpen && <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Tables ({tables.length})</span>}
                                <button
                                    onClick={() => setIsTablePanelOpen(!isTablePanelOpen)}
                                    className="text-gray-500 hover:text-blue-500 p-1"
                                >
                                    {isTablePanelOpen ? <TablesIcon size={16} /> : <Database size={20} />}
                                </button>
                            </div>

                            {isTablePanelOpen && (
                                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                    {tables.length === 0 ? (
                                        <div className="text-center py-8 px-4">
                                            <p className="text-xs text-gray-400 mb-2">No tables yet</p>
                                            <p className="text-xs text-gray-500">Import a CSV to get started</p>
                                        </div>
                                    ) : (
                                        tables.map(table => (
                                            <div key={table.name} className="group bg-gray-50 dark:bg-slate-900/50 rounded-lg p-3 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <Table size={14} className="text-blue-500 flex-shrink-0" />
                                                        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate" title={table.name}>{table.name}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => dropTable(table.name)}
                                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Drop Table"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                                <div className="text-xs text-gray-500 mb-2">{table.rowCount.toLocaleString()} rows</div>
                                                <div className="text-[10px] text-gray-400 flex flex-wrap gap-1">
                                                    {table.columns.slice(0, 3).map(col => (
                                                        <span key={col} className="bg-gray-200 dark:bg-slate-700 px-1 rounded">{col}</span>
                                                    ))}
                                                    {table.columns.length > 3 && <span>+{table.columns.length - 3}</span>}
                                                </div>
                                                <button
                                                    onClick={() => setQuery(`SELECT * FROM ${table.name} LIMIT 20;`)}
                                                    className="mt-2 w-full text-xs py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                >
                                                    Select Top 20
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col gap-6 min-w-0">
                        {/* Editor Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col overflow-hidden h-[300px] lg:h-[350px]">
                            <div className="flex items-center justify-between p-2 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                                <div className="flex items-center gap-2 px-2">
                                    <Code size={16} className="text-gray-400" />
                                    <span className="text-xs font-bold text-gray-500 uppercase">Query Editor</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setQuery('')}
                                        className="p-1.5 text-gray-500 hover:text-red-500 transition-colors rounded hover:bg-gray-100 dark:hover:bg-slate-800"
                                        title="Clear"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={runQuery}
                                        className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                    >
                                        <Play size={14} fill="currentColor" /> Run (Ctrl+Enter)
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto text-base">
                                <CodeMirror
                                    value={query}
                                    height="100%"
                                    extensions={[sql()]}
                                    onChange={(val) => setQuery(val)}
                                    theme="dark" // Or conditional based on app theme
                                    basicSetup={{
                                        lineNumbers: true,
                                        foldGutter: true,
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.ctrlKey && e.key === 'Enter') {
                                            runQuery();
                                        }
                                    }}
                                    className="h-full"
                                />
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col flex-1 min-h-[400px] overflow-hidden">
                            {/* Toolbar */}
                            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex flex-wrap gap-4 justify-between items-center bg-gray-50/30 dark:bg-slate-900/30">
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Results</span>
                                    {results && results.values && (
                                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full flex items-center gap-1">
                                            <Clock size={10} /> {execTime.toFixed(2)}ms • {results.values.length} rows
                                        </span>
                                    )}
                                </div>

                                {results && results.values && results.values.length > 0 && (
                                    <div className="flex gap-2">
                                        <button onClick={() => exportResults('csv')} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg" title="Export CSV"><FileSpreadsheet size={18} /></button>
                                        <button onClick={() => exportResults('json')} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg" title="Export JSON"><FileJson size={18} /></button>
                                        <button onClick={() => exportResults('xlsx')} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg" title="Export Excel"><Download size={18} /></button>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-auto relative bg-white dark:bg-slate-900">
                                {error && (
                                    <div className="p-6">
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                                            <AlertTriangle className="text-red-500 mt-0.5" size={20} />
                                            <div>
                                                <h3 className="font-bold text-red-700 dark:text-red-400 text-sm">Query Error</h3>
                                                <p className="text-red-600 dark:text-red-300 text-sm mt-1 font-mono">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!results && !error && (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                            <Play size={24} className="text-gray-300" ml-1 />
                                        </div>
                                        <p>Run a query to see results here</p>
                                    </div>
                                )}

                                {results && results.values && results.values.length === 0 && !error && (
                                    <div className="p-8 text-center text-gray-500">
                                        {results.message || "No rows returned."}
                                    </div>
                                )}

                                {results && results.values && results.values.length > 0 && (
                                    <div className="w-full">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-50 dark:bg-slate-800/80 sticky top-0 z-10 shadow-sm">
                                                <tr>
                                                    {results.columns.map((col, idx) => (
                                                        <th key={idx} className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 whitespace-nowrap">
                                                            {col}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                                {results.values.map((row, rIdx) => (
                                                    <tr key={rIdx} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                                                        {row.map((cell, cIdx) => (
                                                            <td key={cIdx} className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 border-r border-transparent last:border-0 whitespace-nowrap max-w-xs truncate">
                                                                {cell === null ? <span className="text-gray-400 italic">null</span> : String(cell)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const TablesIcon = ({ size }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
        <path d="M9 3v18" />
    </svg>
);
