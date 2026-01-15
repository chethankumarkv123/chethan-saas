import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
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

export function PdfUnlock() {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const { validateFiles, errors, setErrors } = useFileValidation("pdfUnlock");
    const { showModal } = useUI();
    const feature = FEATURES.pdfUnlock;

    const handleFilesSelected = (fileList) => {
        setErrors([]);
        if (validateFiles(fileList)) {
            setFile(fileList[0]);
        }
    };

    const unlockPdf = async () => {
        if (!file) return;
        if (!password) {
            showModal({ title: "Error", message: "Please enter the password.", type: "error" });
            return;
        }
        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            // Attempt to load with password. If it fails, pdf-lib throws error.
            const pdfDoc = await PDFDocument.load(arrayBuffer, { password });

            // To "unlock", we just save it back. 
            // pdf-lib's save() creates a fresh PDF without encryption unless we explicitly add it.
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `unlocked_${file.name}`);

            showModal({ title: "Success", message: "PDF unlocked successfully!", type: "info" });
            setPassword(""); // Clear password for security
            setFile(null);

        } catch (e) {
            console.error(e);
            if (e.message.includes("Password")) {
                showModal({ title: "Error", message: "Incorrect password.", type: "error" });
            } else {
                showModal({ title: "Error", message: "Failed to unlock: " + e.message, type: "error" });
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="pt-32 pb-20 px-4 min-h-screen">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords="unlock pdf, remove pdf password, decrypt pdf"
            />
            <ProcessingOverlay isProcessing={isProcessing} message="Unlocking PDF..." />

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-600 mb-4">
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
                        <FileUploader onFilesSelected={handleFilesSelected} accept="application/pdf" />
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl flex justify-between items-center">
                                <span className="font-medium dark:text-gray-200">{file.name}</span>
                                <button onClick={() => setFile(null)} className="text-red-500 hover:underline">Remove</button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Enter PDF Password</label>
                                <input
                                    type="password"
                                    className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                />
                            </div>

                            <button
                                onClick={unlockPdf}
                                className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                            >
                                Unlock PDF
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
