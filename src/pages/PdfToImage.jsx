import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
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

export function PdfToImage({ defaultFormat = 'jpg' }) {
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const { validateFiles, errors: validationErrors, setErrors } = useFileValidation("pdfToImage");
    const { showModal } = useUI();

    // Settings
    const [format, setFormat] = useState(defaultFormat); // jpg, png, webp
    const [quality, setQuality] = useState("0.8");
    const [dpi, setDpi] = useState(150);

    const featureKey = 'pdfTo' + format.charAt(0).toUpperCase() + format.slice(1);
    const feature = FEATURES[featureKey] || FEATURES.pdfToJpg; // Fallback

    const handleFilesSelected = (fileList) => {
        setErrors([]);
        if (validateFiles(fileList)) {
            setFiles(Array.from(fileList).map(f => ({ file: f, name: f.name })));
        }
    };

    const convertFiles = async () => {
        setIsProcessing(true);
        setProgress(0);
        const JSZip = (await import('jszip')).default; // Dynamic import to be safe or just use import if top-level
        const zip = new JSZip();

        try {
            const scale = dpi / 72;
            let processedCount = 0;

            for (let i = 0; i < files.length; i++) {
                const fileData = files[i];
                const arrayBuffer = await fileData.file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

                for (let p = 1; p <= pdf.numPages; p++) {
                    const page = await pdf.getPage(p);
                    const viewport = page.getViewport({ scale });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({ canvasContext: context, viewport }).promise;

                    let mimeType = 'image/jpeg';
                    if (format === 'png') mimeType = 'image/png';
                    if (format === 'webp') mimeType = 'image/webp';

                    const blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType, parseFloat(quality)));

                    const imageName = `${fileData.name.replace('.pdf', '')}_page${p}.${format}`;
                    zip.file(imageName, blob);
                }
                processedCount++;
                setProgress((processedCount / files.length) * 100);
            }

            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `converted_images.zip`);

            showModal({ title: "Success", message: "Images converted and zipped successfully!", type: "info" });
            setFiles([]);

        } catch (e) {
            console.error(e);
            showModal({ title: "Error", message: "Failed to convert images: " + e.message, type: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 min-h-screen">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords={`pdf to ${format}, convert pdf to image, pdf to picture`}
            />
            <ProcessingOverlay isProcessing={isProcessing} message={`Converting to Images... ${Math.round(progress)}%`} />

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600 mb-2">
                        {feature.seoTitle || feature.title}
                    </h1>
                    <p className="text-gray-500 mb-4">{feature.desc}</p>
                    <TrustBar />
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-slate-700">
                    <ErrorBanner errors={validationErrors} onClear={() => setErrors([])} />

                    {files.length === 0 ? (
                        <FileUploader onFilesSelected={handleFilesSelected} accept="application/pdf,.pdf" />
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl">
                                <h3 className="font-semibold mb-2 text-purple-800 dark:text-purple-300">Selected Files ({files.length})</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{files.map(f => f.name).join(', ')}</p>
                                <button onClick={() => setFiles([])} className="text-red-500 text-sm mt-2 hover:underline">Change files</button>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Output Format</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-900 border p-2.5 dark:text-white"
                                        value={format}
                                        onChange={e => setFormat(e.target.value)}
                                    >
                                        <option value="jpg">JPG</option>
                                        <option value="png">PNG</option>
                                        <option value="webp">WEBP</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Quality</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-900 border p-2.5 dark:text-white"
                                        value={quality}
                                        onChange={e => setQuality(e.target.value)}
                                    >
                                        <option value="0.5">Low</option>
                                        <option value="0.75">Medium</option>
                                        <option value="1.0">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Resolution (DPI)</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-900 border p-2.5 dark:text-white"
                                        value={dpi}
                                        onChange={e => setDpi(Number(e.target.value))}
                                    >
                                        <option value="72">72 (Web)</option>
                                        <option value="150">150 (Screen)</option>
                                        <option value="300">300 (Print)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={convertFiles}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                            >
                                Convert PDF to Images
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
