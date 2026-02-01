import { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { FileUploader } from '../components/FileUploader';
import { ProcessingOverlay } from '../components/ProcessingOverlay';
import { useUI } from '../context/UIContext';
import { useFileValidation } from '../hooks/useFileValidation';
import { ErrorBanner } from '../components/ErrorBanner';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { SEO } from '../components/SEO';
import { TrustBar } from '../components/TrustBar';
import { RelatedTools } from '../components/RelatedTools';
import { SeoContent } from '../components/SeoContent';
import { FEATURES } from '../config/FEATURE_CONFIG';

export function FileToPdf({ mode }) { // csv, excel, json, xml
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { validateFiles, errors, setErrors } = useFileValidation(`${mode}ToPdf`);
    const { showModal } = useUI();

    const featureKey = mode + 'ToPdf';
    const feature = FEATURES[featureKey] || FEATURES.csvToPdf;

    // Settings
    const [pageSize, setPageSize] = useState('A4');
    const [orientation, setOrientation] = useState('portrait');
    const [fontSize, setFontSize] = useState(10);

    const handleFilesSelected = (fileList) => {
        setErrors([]);
        if (validateFiles(fileList)) {
            setFiles(Array.from(fileList));
        }
    };

    const processFiles = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();

        try {
            for (const file of files) {
                const pdfDoc = await PDFDocument.create();
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

                const pageDims = pageSize === 'A4' ? [595.28, 841.89] : [612, 792];
                const [pWidth, pHeight] = orientation === 'portrait' ? pageDims : [pageDims[1], pageDims[0]];

                let contentText = "";
                let tableData = []; // [[row1col1, row1col2], ...]

                // Parse File
                if (mode === 'csv') {
                    const text = await file.text();
                    const result = Papa.parse(text, { header: false, skipEmptyLines: true });
                    tableData = result.data; // 2D array
                } else if (mode === 'excel') {
                    const buffer = await file.arrayBuffer();
                    const wb = XLSX.read(buffer, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    tableData = XLSX.utils.sheet_to_json(ws, { header: 1 });
                } else if (mode === 'json') {
                    const text = await file.text();
                    try {
                        const obj = JSON.parse(text);
                        contentText = JSON.stringify(obj, null, 2);
                    } catch {
                        contentText = text; // Fallback
                    }
                } else if (mode === 'xml') {
                    contentText = await file.text();
                }

                // Render Content
                if (tableData.length > 0) {
                    // Render Table
                    const margin = 40;
                    const cellPadding = 5;
                    const rowHeight = fontSize + 8;
                    const usableWidth = pWidth - (margin * 2);

                    let currentPage = pdfDoc.addPage([pWidth, pHeight]);
                    let y = pHeight - margin;

                    // Simple column width calculation (evenly distributed)
                    const maxCols = Math.max(...tableData.map(r => r.length));
                    const colWidth = usableWidth / maxCols;

                    for (let r = 0; r < tableData.length; r++) {
                        const row = tableData[r];

                        // Check page break
                        if (y < margin + rowHeight) {
                            currentPage = pdfDoc.addPage([pWidth, pHeight]);
                            y = pHeight - margin;
                        }

                        for (let c = 0; c < row.length; c++) {
                            const cellText = String(row[c] || "").substring(0, 50); // Truncate for simplicity

                            // Draw cell text
                            currentPage.drawText(cellText, {
                                x: margin + (c * colWidth) + cellPadding,
                                y: y - fontSize - cellPadding, // rough baseline align
                                size: fontSize,
                                font: r === 0 ? boldFont : font, // Header bold if 1st row
                                color: rgb(0, 0, 0)
                            });

                            // Draw cell border
                            currentPage.drawRectangle({
                                x: margin + (c * colWidth),
                                y: y - rowHeight,
                                width: colWidth,
                                height: rowHeight,
                                borderColor: rgb(0.8, 0.8, 0.8),
                                borderWidth: 1,
                            });
                        }
                        y -= rowHeight;
                    }

                } else {
                    // Render Text (JSON/XML)
                    // Simple text wrapping is hard in pdf-lib without helper.
                    // We will just split by newline and draw.
                    const margin = 40;
                    const lineHeight = fontSize + 4;
                    let currentPage = pdfDoc.addPage([pWidth, pHeight]);
                    let y = pHeight - margin;

                    const lines = contentText.split(/\r?\n/);

                    // Crude word wrap or line truncate
                    const maxCharsPerLine = Math.floor((pWidth - 2 * margin) / (fontSize * 0.5)); // Approx monospace width

                    for (const line of lines) {
                        // Split line into chunks
                        const chunks = line.match(new RegExp(`.{1,${maxCharsPerLine}}`, 'g')) || [""];

                        for (const chunk of chunks) {
                            if (y < margin + lineHeight) {
                                currentPage = pdfDoc.addPage([pWidth, pHeight]);
                                y = pHeight - margin;
                            }

                            currentPage.drawText(chunk, {
                                x: margin,
                                y: y - fontSize,
                                size: fontSize,
                                font: font,
                                color: rgb(0, 0, 0)
                            });
                            y -= lineHeight;
                        }
                    }
                }

                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: "application/pdf" });

                if (files.length === 1) {
                    saveAs(blob, file.name.replace(/\.[^/.]+$/, "") + ".pdf");
                } else {
                    zip.file(file.name.replace(/\.[^/.]+$/, "") + ".pdf", blob);
                }
            }

            if (files.length > 1) {
                const content = await zip.generateAsync({ type: "blob" });
                saveAs(content, `converted_docs.zip`);
            }

            showModal({ title: "Success", message: "Conversion completed!", type: "info" });
            setFiles([]);

        } catch (e) {
            console.error(e);
            showModal({ title: "Error", message: "Failed: " + e.message, type: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    const titles = {
        csv: "CSV to PDF",
        excel: "Excel to PDF",
        json: "JSON to PDF",
        xml: "XML to PDF"
    };

    return (
        <div className="pt-32 pb-20 px-4 min-h-screen">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords={`${mode} to pdf, convert ${mode}, document to pdf`}
            />
            <ProcessingOverlay isProcessing={isProcessing} message="Converting..." />

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 mb-4">
                        {feature.seoTitle || feature.title}
                    </h1>
                    <p className="text-gray-500">{feature.desc}</p>
                    <div className="mt-4">
                        <TrustBar />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
                    <ErrorBanner errors={errors} onClear={() => setErrors([])} />

                    {files.length === 0 ? (
                        <FileUploader onFilesSelected={handleFilesSelected} accept={mode === 'excel' ? '.xlsx, .xls' : `.${mode}`} multiple />
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl">
                                <h3 className="font-semibold mb-2 dark:text-gray-200">Selected Files ({files.length})</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{files.map(f => f.name).join(', ')}</p>
                                <button onClick={() => setFiles([])} className="text-red-500 text-sm mt-2 hover:underline">Change files</button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Page Size</label>
                                    <select className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={pageSize} onChange={e => setPageSize(e.target.value)}>
                                        <option value="A4">A4</option>
                                        <option value="Letter">Letter</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Font Size</label>
                                    <input type="number" className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
                                </div>
                            </div>

                            <button
                                onClick={processFiles}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                            >
                                Convert to PDF
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-12">
                    <RelatedTools toolKeys={feature.related} />
                    <SeoContent featureKey={featureKey} />
                </div>
            </div>
        </div>
    );
}
