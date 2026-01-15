import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileUploader } from '../components/FileUploader';
import { ProcessingOverlay } from '../components/ProcessingOverlay';
import { useUI } from '../context/UIContext';
import { useFileValidation } from '../hooks/useFileValidation';
import { ErrorBanner } from '../components/ErrorBanner';
import { SEO } from '../components/SEO';
import { TrustBar } from '../components/TrustBar';
import { RelatedTools } from '../components/RelatedTools';
import { SeoContent } from '../components/SeoContent';
import { FEATURES } from '../config/FEATURE_CONFIG';

// Worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

export function PdfToCsv() {
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const { validateFiles, errors: validationErrors, setErrors } = useFileValidation("pdfToCsv");
    const { showModal } = useUI();
    const feature = FEATURES.pdfToCsv;

    // Settings
    const [delimiter, setDelimiter] = useState(",");
    const [customDelimiter, setCustomDelimiter] = useState("");
    const [outputFormat, setOutputFormat] = useState("csv");
    const [removeCommas, setRemoveCommas] = useState(false);

    const handleFilesSelected = (fileList) => {
        setErrors([]);
        if (validateFiles(fileList)) {
            setFiles(Array.from(fileList).map(f => ({ file: f, name: f.name })));
        }
    };

    const convertFiles = async () => {
        setIsProcessing(true);
        setProgress(0);
        const zip = new JSZip();

        try {
            const finalDelimiter = delimiter === 'custom' ? customDelimiter : delimiter;
            if (delimiter === 'custom' && !customDelimiter) throw new Error("Please specify a custom delimiter.");

            for (let i = 0; i < files.length; i++) {
                const fileData = files[i];
                setProgress((i / files.length) * 100);

                const fileReader = new FileReader();
                const arrayBuffer = await new Promise((resolve, reject) => {
                    fileReader.onload = e => resolve(new Uint8Array(e.target.result));
                    fileReader.onerror = reject;
                    fileReader.readAsArrayBuffer(fileData.file);
                });

                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let tableData = [];

                for (let p = 1; p <= pdf.numPages; p++) {
                    const page = await pdf.getPage(p);
                    const textContent = await page.getTextContent();

                    // Simple Table Extraction Logic
                    const items = textContent.items.map(item => ({
                        str: item.str,
                        y: item.transform[5],
                        x: item.transform[4]
                    }));
                    items.sort((a, b) => b.y - a.y); // Sort by Y

                    const rows = [];
                    let currentRow = [];
                    let currentY = items[0]?.y || 0;

                    items.forEach(item => {
                        if (Math.abs(item.y - currentY) > 5) {
                            if (currentRow.length > 0) {
                                currentRow.sort((a, b) => a.x - b.x);
                                rows.push(currentRow.map(r => r.str).join(" ")); // Very simple heuristic
                            }
                            currentRow = [item];
                            currentY = item.y;
                        } else {
                            currentRow.push(item);
                        }
                    });
                    if (currentRow.length > 0) rows.push(currentRow.map(r => r.str).join(" "));

                    // Now split rows by space to simulate columns? 
                    // Legacy logic used "split(/\s+/)". Let's mimic that.
                    rows.forEach(r => {
                        tableData.push(r.split(/\s+/).filter(c => c));
                    });
                }

                // Data Cleaning
                if (removeCommas) {
                    tableData = tableData.map(row => row.map(cell => {
                        if (/^[\d,.]+$/.test(cell)) return cell.replace(/,/g, '');
                        return cell;
                    }));
                }

                // Output Generation
                let outputContent;
                const outName = fileData.name.replace('.pdf', `.${outputFormat}`);

                if (outputFormat === 'csv') {
                    outputContent = tableData.map(row =>
                        row.map(cell => {
                            let str = String(cell || '');
                            if (str.includes(finalDelimiter) || str.includes('"') || str.includes('\n')) {
                                str = `"${str.replace(/"/g, '""')}"`;
                            }
                            return str;
                        }).join(finalDelimiter)
                    ).join('\n');
                    zip.file(outName, outputContent);
                } else {
                    const ws = XLSX.utils.aoa_to_sheet(tableData);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                    const outBuff = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                    zip.file(outName, outBuff);
                }
            }

            setProgress(100);

            if (files.length === 1) {
                const content = await zip.file(files[0].name.replace('.pdf', `.${outputFormat}`)).async('blob');
                saveAs(content, files[0].name.replace('.pdf', `.${outputFormat}`));
            } else {
                const content = await zip.generateAsync({ type: "blob" });
                saveAs(content, "converted_tables.zip");
            }

            showModal({ title: "Success", message: "Conversion successful!", type: "info" });
            setFiles([]);

        } catch (e) {
            console.error(e);
            showModal({ title: "Error", message: e.message, type: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="pt-32 pb-20 px-4 min-h-screen">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords="pdf to csv, pdf to excel, extract table pdf"
            />
            <ProcessingOverlay isProcessing={isProcessing} message={`Extracting Tables... ${Math.round(progress)}%`} />

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600 mb-4">
                        {feature.seoTitle || feature.title}
                    </h1>
                    <p className="text-gray-500">{feature.desc}</p>
                    <div className="mt-4">
                        <TrustBar />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
                    <ErrorBanner errors={validationErrors} onClear={() => setErrors([])} />

                    {files.length === 0 ? (
                        <FileUploader onFilesSelected={handleFilesSelected} accept="application/pdf,.pdf" />
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl">
                                <h3 className="font-semibold mb-2 text-green-800 dark:text-green-300">Selected Files ({files.length})</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{files.map(f => f.name).join(', ')}</p>
                                <button onClick={() => setFiles([])} className="text-red-500 text-sm mt-2 hover:underline">Change files</button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Output Format</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-900 border p-2.5 dark:text-white"
                                        value={outputFormat}
                                        onChange={e => setOutputFormat(e.target.value)}
                                    >
                                        <option value="csv">CSV</option>
                                        <option value="xlsx">Excel (XLSX)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Delimiter</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-900 border p-2.5 dark:text-white"
                                        value={delimiter}
                                        onChange={e => setDelimiter(e.target.value)}
                                    >
                                        <option value=",">Comma (,)</option>
                                        <option value=";">Semicolon (;)</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                    {delimiter === 'custom' && (
                                        <input
                                            type="text"
                                            className="mt-2 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                            placeholder="Enter char"
                                            value={customDelimiter}
                                            onChange={e => setCustomDelimiter(e.target.value)}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="clean" checked={removeCommas} onChange={e => setRemoveCommas(e.target.checked)} />
                                <label htmlFor="clean" className="text-sm dark:text-gray-300">Remove 'Thousands' separators (e.g. 1,000 &rarr; 1000)</label>
                            </div>

                            <button
                                onClick={convertFiles}
                                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                            >
                                Convert Files
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-12">
                    <RelatedTools toolKeys={feature.related} />
                    <SeoContent feature={feature} />
                </div>
            </div>
        </div>
    );
}
