import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileUploader } from '../components/FileUploader';
import { ProcessingOverlay } from '../components/ProcessingOverlay';
import { useUI } from '../context/UIContext';
import { useFileValidation } from '../hooks/useFileValidation';
import { ErrorBanner } from '../components/ErrorBanner';
import { saveAs } from 'file-saver';
import { SEO } from '../components/SEO';
import { TrustBar } from '../components/TrustBar';
import { RelatedTools } from '../components/RelatedTools';
import { SeoContent } from '../components/SeoContent';
import { FEATURES } from '../config/FEATURE_CONFIG';
import { addToRecentTools } from '../components/RecentTools';


export function MergePdf() {
    const [files, setFiles] = useState([]); // { file, name, id, pageCount, pdfDoc }
    const [isProcessing, setIsProcessing] = useState(false);
    const { validateFiles, errors: validationErrors, setErrors } = useFileValidation("pdfMerge");
    const { showModal } = useUI();
    const [outputName, setOutputName] = useState("merged_document.pdf");
    const feature = FEATURES.pdfMerge;

    const handleFilesSelected = async (fileList) => {
        setErrors([]);
        if (validateFiles(fileList)) {
            const newFiles = [];
            setIsProcessing(true);
            try {
                for (const file of fileList) {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdfDoc = await PDFDocument.load(arrayBuffer);
                    newFiles.push({
                        file,
                        name: file.name,
                        id: Math.random().toString(36).substr(2, 9),
                        pageCount: pdfDoc.getPageCount(),
                        pdfDoc // Keep reference to doc for merging later
                    });
                }
                setFiles(prev => [...prev, ...newFiles]);
            } catch (e) {
                console.error(e);
                showModal({ title: "Error", message: "Failed to load PDF. Some PDFs are encrypted or corrupted.", type: "error" });
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const removeFile = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    const moveFile = (index, direction) => {
        if ((direction === -1 && index === 0) || (direction === 1 && index === files.length - 1)) return;
        const newFiles = [...files];
        const temp = newFiles[index];
        newFiles[index] = newFiles[index + direction];
        newFiles[index + direction] = temp;
        setFiles(newFiles);
    };

    const mergeFiles = async () => {
        if (files.length < 2) {
            showModal({ title: "Just a second", message: "Please select at least 2 PDF files to merge together.", type: "info" });
            return;
        }

        setIsProcessing(true);
        try {
            const mergedPdf = await PDFDocument.create();

            for (const fileData of files) {
                const pages = await mergedPdf.copyPages(fileData.pdfDoc, fileData.pdfDoc.getPageIndices());
                pages.forEach((page) => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, outputName || "merged.pdf");

            addToRecentTools('pdfMerge');
            showModal({ title: "Success", message: "Your PDFs have been merged successfully!", type: "info" });
        } catch (e) {
            console.error(e);
            showModal({ title: "Merge Failed", message: "We couldn't merge these files. One might be password protected or too large.", type: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 min-h-screen">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords="merge pdf, combine pdf, join pdf files"
            />
            <ProcessingOverlay isProcessing={isProcessing} message="Processing..." />

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-600 mb-2">
                        {feature.seoTitle || feature.title}
                    </h1>
                    <p className="text-gray-500 mb-4">{feature.desc}</p>
                    <TrustBar />
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-slate-700">
                    <ErrorBanner errors={validationErrors} onClear={() => setErrors([])} />

                    <div className="mb-6">
                        <FileUploader onFilesSelected={handleFilesSelected} accept="application/pdf" multiple={true} />
                    </div>

                    {files.length > 0 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="space-y-2">
                                {files.map((f, i) => (
                                    <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-400 w-6">{i + 1}.</span>
                                            <div>
                                                <p className="font-medium dark:text-gray-200">{f.name}</p>
                                                <p className="text-xs text-gray-500">{f.pageCount} pages</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => moveFile(i, -1)} disabled={i === 0} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"><i className="fa-solid fa-arrow-up dark:text-gray-300"></i></button>
                                            <button onClick={() => moveFile(i, 1)} disabled={i === files.length - 1} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"><i className="fa-solid fa-arrow-down dark:text-gray-300"></i></button>
                                            <button onClick={() => removeFile(i)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded"><i className="fa-solid fa-trash"></i></button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Output Filename</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    value={outputName}
                                    onChange={(e) => setOutputName(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={mergeFiles}
                                className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                            >
                                Merge PDF
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
