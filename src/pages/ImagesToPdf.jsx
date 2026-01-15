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

export function ImagesToPdf({ mode }) { // jpg, png, webp
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { validateFiles, errors, setErrors } = useFileValidation(`${mode}ToPdf`);
    const { showModal } = useUI();

    const featureKey = mode + 'ToPdf';
    const feature = FEATURES[featureKey] || FEATURES.jpgToPdf;

    // Settings
    const [pageSize, setPageSize] = useState('A4');
    const [margin, setMargin] = useState(20);

    const handleFilesSelected = (fileList) => {
        setErrors([]);
        if (validateFiles(fileList)) {
            setFiles(Array.from(fileList).map(f => ({
                file: f,
                name: f.name,
                url: URL.createObjectURL(f)
            })));
        }
    };

    const createPdf = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        try {
            const pdfDoc = await PDFDocument.create();

            for (const fileData of files) {
                const imageBytes = await fetch(fileData.url).then(res => res.arrayBuffer());
                let image;

                if (fileData.file.type === 'image/jpeg' || mode === 'jpg') {
                    image = await pdfDoc.embedJpg(imageBytes);
                } else if (fileData.file.type === 'image/png' || mode === 'png') {
                    image = await pdfDoc.embedPng(imageBytes);
                } else {
                    // Fallback for WebP or others: Draw to canvas, then to PNG
                    const img = new Image();
                    img.src = fileData.url;
                    await new Promise(r => img.onload = r);

                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    const pngBlob = await new Promise(r => canvas.toBlob(r, 'image/png'));
                    const pngBytes = await pngBlob.arrayBuffer();
                    image = await pdfDoc.embedPng(pngBytes);
                }

                const page = pdfDoc.addPage();
                const { width, height } = page.getSize();
                const availableWidth = width - (margin * 2);
                const availableHeight = height - (margin * 2);

                const imgDims = image.scaleToFit(availableWidth, availableHeight);

                page.drawImage(image, {
                    x: width / 2 - imgDims.width / 2,
                    y: height / 2 - imgDims.height / 2,
                    width: imgDims.width,
                    height: imgDims.height
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `converted_images.pdf`);

            showModal({ title: "Success", message: "PDF created successfully!", type: "info" });
            setFiles([]);

        } catch (e) {
            console.error(e);
            showModal({ title: "Error", message: "Failed to create PDF: " + e.message, type: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="pt-32 pb-20 px-4 min-h-screen">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords={`image to pdf, ${mode} to pdf, picture to pdf`}
            />
            <ProcessingOverlay isProcessing={isProcessing} message="Creating PDF..." />

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 mb-4">
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
                        <FileUploader
                            onFilesSelected={handleFilesSelected}
                            accept={mode === 'webp' ? 'image/webp' : `image/${mode === 'jpg' ? 'jpeg' : 'png'}`}
                            multiple
                        />
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl">
                                <h3 className="font-semibold mb-2 dark:text-gray-200">Selected Images ({files.length})</h3>
                                <div className="flex gap-2 overflow-x-auto py-2">
                                    {files.map((f, i) => (
                                        <img key={i} src={f.url} className="h-16 w-16 object-cover rounded border" />
                                    ))}
                                </div>
                                <button onClick={() => setFiles([])} className="text-red-500 text-sm mt-2 hover:underline">Clear all</button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Page Size</label>
                                    <select className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={pageSize} onChange={e => setPageSize(e.target.value)}>
                                        <option value="A4">A4</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Margin</label>
                                    <select className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={margin} onChange={e => setMargin(Number(e.target.value))}>
                                        <option value="0">No Margin</option>
                                        <option value="20">Small</option>
                                        <option value="50">Large</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={createPdf}
                                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                            >
                                Convert to PDF
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
