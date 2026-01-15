import { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
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
import { addToRecentTools } from '../components/RecentTools';

export function PdfSplit() {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [splitMode, setSplitMode] = useState("all"); // all, range
    const [range, setRange] = useState("");
    const { validateFiles, errors, setErrors } = useFileValidation("pdfSplit");
    const { showModal } = useUI();
    const feature = FEATURES.pdfSplit;

    const handleFilesSelected = (fileList) => {
        setErrors([]);
        if (validateFiles(fileList)) {
            setFile(fileList[0]);
        }
    };

    const splitPdf = async () => {
        if (!file) return;
        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const srcDoc = await PDFDocument.load(arrayBuffer);
            const pageCount = srcDoc.getPageCount();

            if (pageCount > 50 && splitMode === 'all') {
                // Gentle warning for large files, though we process it.
                // In a real app we might stop here, but user asked for "Friendly Error States" not hard limits unless necessary.
                // We'll proceed but if it fails catch block handles it.
            }

            if (splitMode === 'all') {
                // Split every page into separate PDF
                for (let i = 0; i < pageCount; i++) {
                    const newDoc = await PDFDocument.create();
                    const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
                    newDoc.addPage(copiedPage);
                    const pdfBytes = await newDoc.save();
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                    saveAs(blob, `${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`);
                }
                addToRecentTools('pdfSplit');
                showModal({ title: "Success", message: `Split ${pageCount} pages successfully!`, type: "info" });
            } else {
                // Split by range
                // Basic implementation: Extract range as NEW pdf
                // Parse range "1-3, 5"
                const pagesToExtract = [];
                const parts = range.split(',');
                for (const part of parts) {
                    if (part.includes('-')) {
                        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
                        if (isNaN(start) || isNaN(end)) throw new Error("Invalid page range format");
                        for (let i = start; i <= end; i++) pagesToExtract.push(i - 1); // 0-indexed
                    } else {
                        const pageNum = parseInt(part.trim());
                        if (isNaN(pageNum)) throw new Error("Invalid page number");
                        pagesToExtract.push(pageNum - 1);
                    }
                }

                if (pagesToExtract.length === 0) {
                    throw new Error("Please enter a valid page range (e.g., 1-5)");
                }

                const newDoc = await PDFDocument.create();
                const copiedPages = await newDoc.copyPages(srcDoc, pagesToExtract.filter(p => p >= 0 && p < pageCount));

                if (copiedPages.length === 0) {
                    throw new Error("No pages found in that range. Check the page numbers.");
                }

                copiedPages.forEach(p => newDoc.addPage(p));

                const pdfBytes = await newDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                saveAs(blob, `${file.name.replace('.pdf', '')}_split.pdf`);

                addToRecentTools('pdfSplit');
                showModal({ title: "Success", message: "Extracted pages successfully!", type: "info" });
            }

        } catch (e) {
            console.error(e);
            let userMessage = "Something went wrong. Please check your file and try again.";
            if (e.message.includes("Invalid page")) userMessage = "The page numbers you entered don't match the document.";
            if (e.message.includes("encrypted")) userMessage = "This PDF is password protected. Please unlock it first.";

            showModal({ title: "Split Failed", message: userMessage, type: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 min-h-screen">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords="split pdf, extract pages pdf, separate pdf pages"
            />
            <ProcessingOverlay isProcessing={isProcessing} message="Splitting PDF..." />

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600 mb-2">
                        {feature.seoTitle || feature.title}
                    </h1>
                    <p className="text-gray-500 mb-4">{feature.desc}</p>
                    <TrustBar />
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-slate-700">
                    <ErrorBanner errors={errors} onClear={() => setErrors([])} />

                    {!file ? (
                        <FileUploader onFilesSelected={handleFilesSelected} accept="application/pdf,.pdf" />
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl flex justify-between items-center">
                                <span className="font-medium dark:text-gray-200">{file.name}</span>
                                <button onClick={() => setFile(null)} className="text-red-500 hover:underline">Remove</button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Split Mode</label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setSplitMode('all')}
                                        className={`flex-1 py-3 rounded-xl border ${splitMode === 'all' ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20' : 'dark:border-slate-700 dark:text-gray-300'}`}
                                    >
                                        Extract All Pages
                                    </button>
                                    <button
                                        onClick={() => setSplitMode('range')}
                                        className={`flex-1 py-3 rounded-xl border ${splitMode === 'range' ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20' : 'dark:border-slate-700 dark:text-gray-300'}`}
                                    >
                                        Extract Range
                                    </button>
                                </div>
                            </div>

                            {splitMode === 'range' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Page Range (e.g. 1-5, 8, 11-13)</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                        value={range}
                                        onChange={e => setRange(e.target.value)}
                                        placeholder="e.g. 1-5"
                                    />
                                </div>
                            )}

                            <button
                                onClick={splitPdf}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                            >
                                Split PDF
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
