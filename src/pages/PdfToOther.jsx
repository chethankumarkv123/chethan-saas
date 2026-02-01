import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
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
import * as pdfjsLib from 'pdfjs-dist';

// Worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export function PdfToOther({ mode }) { // json, text, html, zip
    const featureName = mode === 'text' ? 'pdfToText' :
        mode === 'json' ? 'pdfToJson' :
            mode === 'html' ? 'pdfToHtml' : 'pdfToZip';

    // Fallback if generic mode passed
    const feature = FEATURES[featureName] || FEATURES.pdfToText;

    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { validateFiles, errors, setErrors } = useFileValidation(featureName);
    const { showModal } = useUI();

    const handleFilesSelected = (fileList) => {
        setErrors([]);
        if (validateFiles(fileList)) {
            setFiles(Array.from(fileList));
        }
    };

    const processFiles = async () => {
        setIsProcessing(true);
        const zip = new JSZip();

        try {
            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

                let content = "";

                if (mode === 'text' || mode === 'json' || mode === 'html') {
                    const pagesData = [];

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const text = textContent.items.map(s => s.str).join(' ');

                        if (mode === 'text') {
                            content += `--- Page ${i} ---\n${text}\n\n`;
                        } else if (mode === 'json') {
                            pagesData.push({ page: i, text: text, items: textContent.items });
                        } else if (mode === 'html') {
                            // Very basic HTML structure
                            content += `<div class="page" id="page-${i}">
                            <h2>Page ${i}</h2>
                            <p>${text}</p>
                          </div><hr>`;
                        }
                    }

                    if (mode === 'json') {
                        content = JSON.stringify({ filename: file.name, pages: pagesData }, null, 2);
                    }
                    if (mode === 'html') {
                        content = `<html><head><title>${file.name}</title></head><body>${content}</body></html>`;
                    }
                }

                if (mode === 'zip') {
                    zip.file(file.name, file);
                } else {
                    const ext = mode === 'text' ? 'txt' : mode;
                    zip.file(`${file.name}.${ext}`, content);
                }
            }

            if (files.length === 1 && mode !== 'zip') {
                const filename = `${files[0].name}.${mode === 'text' ? 'txt' : mode}`;
                const content = await zip.file(filename).async(mode === 'json' || mode === 'text' || mode === 'html' ? "string" : "blob");
                const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
                saveAs(blob, filename);
            } else {
                const zipContent = await zip.generateAsync({ type: "blob" });
                saveAs(zipContent, `converted_files.zip`);
            }

            showModal({ title: "Success", message: "Conversion completed!", type: "info" });
            setFiles([]);

        } catch (e) {
            console.error(e);
            showModal({ title: "Error", message: e.message, type: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="pt-24 pb-20 px-4 min-h-screen">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords={`pdf to ${mode}, pdf converter, free pdf tool`}
            />

            <ProcessingOverlay isProcessing={isProcessing} message="Processing..." />

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-900 dark:from-gray-100 dark:to-gray-400 mb-4">
                        {feature.seoTitle || feature.title}
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        {feature.seoDesc || feature.desc}
                    </p>
                    <div className="mt-4">
                        <TrustBar />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
                    <ErrorBanner errors={errors} onClear={() => setErrors([])} />

                    {files.length === 0 ? (
                        <FileUploader onFilesSelected={handleFilesSelected} accept="application/pdf,.pdf" />
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl">
                                <h3 className="font-semibold mb-2 dark:text-gray-200">Selected Files ({files.length})</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{files.map(f => f.name).join(', ')}</p>
                                <button onClick={() => setFiles([])} className="text-red-500 text-sm mt-2 hover:underline">Change files</button>
                            </div>

                            <button
                                onClick={processFiles}
                                className="w-full py-4 bg-gray-800 text-white font-bold rounded-xl shadow-lg hover:bg-gray-900 transition-opacity"
                            >
                                Convert / Process
                            </button>
                        </div>
                    )}
                </div>

                <RelatedTools toolKeys={feature.related} />

                <SeoContent featureKey={featureName} />
            </div>
        </div>
    );
}
