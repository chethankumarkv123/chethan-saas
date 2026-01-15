import { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, ImageRun, PageBreak } from "docx";
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
import { toast } from '../components/Toast';

// Worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function PdfToWord() {
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadKey, setUploadKey] = useState(0);
    const { validateFiles, errors: validationErrors, setErrors } = useFileValidation("pdfToWord");
    const { showModal } = useUI();
    const feature = FEATURES.pdfToWord;

    // Settings
    const [pageRange, setPageRange] = useState("");
    const [outputFormat, setOutputFormat] = useState("docx");
    const [contentType, setContentType] = useState("text"); // text or textImages

    const handleFilesSelected = (fileList) => {
        setErrors([]);
        if (validateFiles(fileList)) {
            const newFiles = Array.from(fileList).map(f => ({
                file: f,
                name: f.name,
                id: Math.random().toString(36).substr(2, 9),
                status: 'Pending'
            }));
            setFiles(newFiles);
        }
    };

    const parsePageRange = (range, totalPages) => {
        const pages = new Set();
        const parts = range.split(',');
        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(Number);
                for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
                    pages.add(i);
                }
            } else {
                const page = Number(part);
                if (page >= 1 && page <= totalPages) {
                    pages.add(page);
                }
            }
        }
        return Array.from(pages).sort((a, b) => a - b);
    }

    const convertFiles = async () => {
        setIsProcessing(true);
        setProgress(0);
        const zip = new JSZip();
        let completedCount = 0;

        try {
            for (let i = 0; i < files.length; i++) {
                const fileData = files[i];

                // Update status UI (simplified logic)
                setProgress(((i) / files.length) * 100);

                const fileReader = new FileReader();

                // Promisify FileReader
                const arrayBuffer = await new Promise((resolve, reject) => {
                    fileReader.onload = (e) => resolve(new Uint8Array(e.target.result));
                    fileReader.onerror = reject;
                    fileReader.readAsArrayBuffer(fileData.file);
                });

                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                const pagesToProcess = pageRange ? parsePageRange(pageRange, pdf.numPages) : Array.from({ length: pdf.numPages }, (_, i) => i + 1);

                // DOCX Generation Logic
                const sectionChildren = [];

                for (const pageNum of pagesToProcess) {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    const viewport = page.getViewport({ scale: 1.0 });

                    // Simplify Sorting Logic from legacy
                    const items = textContent.items.map(item => ({
                        str: item.str,
                        x: item.transform[4],
                        y: item.transform[5],
                        height: item.height,
                        width: item.width
                    }));
                    items.sort((a, b) => b.y - a.y); // Y Descending

                    let currentLine = [];
                    let currentY = items.length > 0 ? items[0].y : 0;
                    const lines = [];

                    items.forEach(item => {
                        if (Math.abs(item.y - currentY) > 5) { // Tolerance
                            if (currentLine.length > 0) {
                                currentLine.sort((a, b) => a.x - b.x); // X Ascending
                                lines.push(currentLine);
                            }
                            currentLine = [item];
                            currentY = item.y;
                        } else {
                            currentLine.push(item);
                        }
                    });
                    if (currentLine.length > 0) {
                        currentLine.sort((a, b) => a.x - b.x);
                        lines.push(currentLine);
                    }

                    // Create Paragraphs
                    lines.forEach(line => {
                        const lineStr = line.map(l => l.str).join(' ');
                        sectionChildren.push(new Paragraph({
                            children: [new TextRun(lineStr)],
                            spacing: { after: 200 }
                        }));
                    });

                    // Image Handling
                    if (contentType === 'textImages') {
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        await page.render({ canvasContext: context, viewport }).promise;

                        // Convert to blob
                        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
                        const imgBuffer = await blob.arrayBuffer();

                        sectionChildren.push(new Paragraph({
                            children: [new ImageRun({
                                data: imgBuffer,
                                transformation: {
                                    width: Math.min(viewport.width * 0.7, 600),
                                    height: Math.min(viewport.height * 0.7, 800),
                                }
                            })]
                        }));
                    }

                    sectionChildren.push(new Paragraph({ children: [new PageBreak()] }));
                }

                const doc = new Document({ sections: [{ children: sectionChildren }] });
                const outputBlob = await Packer.toBlob(doc);

                const outName = fileData.name.replace('.pdf', `.${outputFormat}`);
                zip.file(outName, outputBlob);

                // Single file download trigger immediately? Or wait for zip?
                // Let's do instant download if single file, zip if multiple?
                // Legacy did both.
                // For improved UX in React, let's just create a Zip if multiple, or trigger SaveAs if single.
            }

            setProgress(100);

            if (files.length === 1) {
                const content = await zip.file(files[0].name.replace('.pdf', `.${outputFormat}`)).async('blob');
                saveAs(content, files[0].name.replace('.pdf', `.${outputFormat}`));
            } else {
                const content = await zip.generateAsync({ type: "blob" });
                saveAs(content, "converted_files.zip");
            }

            toast.success("Conversion completed successfully!"); // Replaced modal
            setFiles([]); // Reset

        } catch (e) {
            console.error(e);
            showModal({ title: "Error", message: "An error occurred during conversion: " + e.message, type: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="pt-32 pb-20 px-4 min-h-screen">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords="pdf to word, pdf to docx, editable pdf, converter"
            />
            <ProcessingOverlay isProcessing={isProcessing} message={`Converting... ${Math.round(progress)}%`} />

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
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
                        <FileUploader onFilesSelected={handleFilesSelected} accept="application/pdf" key={uploadKey} />
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl">
                                <h3 className="font-semibold mb-3 dark:text-gray-200">Selected Files ({files.length})</h3>
                                <ul className="space-y-2 max-h-40 overflow-y-auto">
                                    {files.map((f, i) => (
                                        <li key={i} className="flex justify-between text-sm p-2 bg-white dark:bg-slate-800 rounded border border-gray-100 dark:border-slate-700">
                                            <span className="dark:text-gray-300">{f.name}</span>
                                            <span className="text-gray-400">{(f.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => setFiles([])} className="text-red-500 text-sm mt-3 hover:underline">Clear all</button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Page Range</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1-5, 8 (Optional)"
                                        className="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-900 border p-2.5 dark:text-white"
                                        value={pageRange}
                                        onChange={(e) => setPageRange(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Content Type</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-900 border p-2.5 dark:text-white"
                                        value={contentType}
                                        onChange={e => setContentType(e.target.value)}
                                    >
                                        <option value="text">Text Only (Faster)</option>
                                        <option value="textImages">Text + Images</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={convertFiles}
                                className="w-full py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                            >
                                Convert to Word
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
