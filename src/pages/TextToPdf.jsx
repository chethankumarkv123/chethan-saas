import { useState } from 'react';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { ProcessingOverlay } from '../components/ProcessingOverlay';
import { useUI } from '../context/UIContext';
import { ErrorBanner } from '../components/ErrorBanner';
import { SEO } from '../components/SEO';
import { TrustBar } from '../components/TrustBar';
import { RelatedTools } from '../components/RelatedTools';
import { SeoContent } from '../components/SeoContent';
import { FEATURES } from '../config/FEATURE_CONFIG';

export function TextToPdf() {
    const [text, setText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [filename, setFilename] = useState("document.pdf");
    const { showModal } = useUI();
    const feature = FEATURES.textToPdf;

    const createPdf = async () => {
        if (!text) {
            showModal({ title: "Error", message: "Please enter some text.", type: "error" });
            return;
        }
        setIsProcessing(true);
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const fontSize = 12;

            page.drawText(text, {
                x: 50,
                y: height - 4 * fontSize,
                size: fontSize,
                font: font,
                maxWidth: width - 100,
                lineHeight: fontSize + 2,
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, filename.endsWith('.pdf') ? filename : `${filename}.pdf`);

            showModal({ title: "Success", message: "PDF created successfully!", type: "info" });
            setText("");

        } catch (e) {
            console.error(e);
            showModal({ title: "Error", message: "Failed to create PDF. Text might be too long for one page (pagination not yet implemented).", type: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="pt-32 pb-20 px-4 min-h-screen">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords="text to pdf, txt to pdf, convert text"
            />
            <ProcessingOverlay isProcessing={isProcessing} message="Generating PDF..." />

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-black dark:from-white dark:to-gray-400 mb-4">
                        {feature.seoTitle || feature.title}
                    </h1>
                    <p className="text-gray-500">{feature.desc}</p>
                    <div className="mt-4">
                        <TrustBar />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Filename</label>
                            <input
                                type="text"
                                value={filename}
                                onChange={e => setFilename(e.target.value)}
                                className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                placeholder="my_document.pdf"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Content</label>
                            <textarea
                                className="w-full h-64 p-4 border rounded-xl font-mono text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
                                placeholder="Paste your Text, XML, JSON, or Source Code here..."
                                value={text}
                                onChange={e => setText(e.target.value)}
                            ></textarea>
                        </div>

                        <button
                            onClick={createPdf}
                            className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-colors"
                        >
                            Generate PDF
                        </button>
                    </div>
                </div>

                <div className="mt-12">
                    <RelatedTools toolKeys={feature.related} />
                    <SeoContent featureKey="textToPdf" />
                </div>
            </div>
        </div>
    );
}
