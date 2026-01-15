import { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
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

export function PdfRotate() {
    const [file, setFile] = useState(null);
    const [rotation, setRotation] = useState(90); // 90, 180, 270
    const [isProcessing, setIsProcessing] = useState(false);
    const { validateFiles, errors, setErrors } = useFileValidation("pdfRotate");
    const { showModal } = useUI();
    const feature = FEATURES.pdfRotate;

    const handleFilesSelected = (fileList) => {
        setErrors([]);
        if (validateFiles(fileList)) {
            setFile(fileList[0]);
        }
    };

    const rotatePdf = async () => {
        if (!file) return;
        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();

            pages.forEach(page => {
                const currentRotation = page.getRotation().angle;
                page.setRotation(degrees(currentRotation + rotation));
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `rotated_${file.name}`);

            showModal({ title: "Success", message: "PDF rotated successfully!", type: "info" });
            setFile(null);

        } catch (e) {
            console.error(e);
            showModal({ title: "Error", message: "Failed to rotate: " + e.message, type: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="pt-32 pb-20 px-4 min-h-screen">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords="rotate pdf, flip pdf pages, turn pdf"
            />
            <ProcessingOverlay isProcessing={isProcessing} message="Rotating PDF..." />

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-600 mb-4">
                        {feature.seoTitle || feature.title}
                    </h1>
                    <p className="text-gray-500">{feature.desc}</p>
                    <div className="mt-4">
                        <TrustBar />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
                    <ErrorBanner errors={errors} onClear={() => setErrors([])} />

                    {!file ? (
                        <FileUploader onFilesSelected={handleFilesSelected} accept="application/pdf,.pdf" />
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex justify-between items-center">
                                <span className="font-medium dark:text-gray-200">{file.name}</span>
                                <button onClick={() => setFile(null)} className="text-red-500 hover:underline">Remove</button>
                            </div>

                            <div className="flex justify-center gap-4">
                                {[90, 180, 270].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setRotation(r)}
                                        className={`px-6 py-3 rounded-lg border transition-all ${rotation === r ? 'bg-blue-500 text-white border-blue-500 shadow-md transform scale-105' : 'bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200 border-gray-200 hover:border-blue-300'}`}
                                    >
                                        <i className="fa-solid fa-rotate-right mr-2"></i> {r}°
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={rotatePdf}
                                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                            >
                                Rotate PDF
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
