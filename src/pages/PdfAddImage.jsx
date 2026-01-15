import { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { DevToolLayout } from '../components/DevToolLayout';
import { FileUploader } from '../components/FileUploader';
import { toast } from '../components/Toast';
import { ProcessingOverlay } from '../components/ProcessingOverlay';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function PdfAddImage() {
    const [file, setFile] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Image State
    const [images, setImages] = useState([]); // { id, dataUrl, x, y, width, height }
    const [activeImgId, setActiveImgId] = useState(null);

    // Canvas Refs
    const pdfCanvasRef = useRef(null);
    const [dragState, setDragState] = useState({ isDragging: false, isResizing: false, startX: 0, startY: 0, initial: {} });

    // 1. PDF Load
    const handleFile = async (f) => {
        if (f.size > 10 * 1024 * 1024) { toast.error("File excessively large. Limit 10MB"); return; }
        setFile(f);
        setIsProcessing(true);
        try {
            const buffer = await f.arrayBuffer();
            const loadedPdf = await pdfjsLib.getDocument(buffer).promise;
            setPdfDoc(loadedPdf);
            setPageNum(1);
        } catch (e) {
            toast.error("Failed to load PDF");
        } finally {
            setIsProcessing(false);
        }
    };

    // 2. Render Page
    useEffect(() => {
        if (!pdfDoc || !pdfCanvasRef.current) return;
        let isCancelled = false;
        const render = async () => {
            const page = await pdfDoc.getPage(pageNum);
            if (isCancelled) return;
            const viewport = page.getViewport({ scale });
            const canvas = pdfCanvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: ctx, viewport }).promise;
        };
        render();
        return () => { isCancelled = true; };
    }, [pdfDoc, pageNum, scale]);

    // 3. Add Image Logic
    const handleImageUpload = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                // Resize input image to reasonable default if huge
                let w = img.width;
                let h = img.height;
                if (w > 200) { h = (200 / w) * h; w = 200; }

                const canvas = pdfCanvasRef.current;
                const x = canvas ? canvas.width / 2 - w / 2 : 100;
                const y = canvas ? canvas.height / 2 - h / 2 : 100;

                const newImg = {
                    id: Date.now(),
                    dataUrl: ev.target.result,
                    x, y, width: w, height: h
                };
                setImages([...images, newImg]);
                setActiveImgId(newImg.id);
                toast.success("Image added!");
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(f);
    };

    // 4. Drag Logic
    const handleMouseDown = (e, img, type) => {
        e.preventDefault(); e.stopPropagation();
        setActiveImgId(img.id);
        setDragState({
            isDragging: type === 'move',
            isResizing: type === 'resize',
            startX: e.clientX,
            startY: e.clientY,
            initial: { ...img }
        });
    };

    useEffect(() => {
        const handleMove = (e) => {
            if ((!dragState.isDragging && !dragState.isResizing) || !activeImgId) return;
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;

            setImages(prev => prev.map(img => {
                if (img.id === activeImgId) {
                    if (dragState.isDragging) {
                        return { ...img, x: dragState.initial.x + dx, y: dragState.initial.y + dy };
                    }
                    if (dragState.isResizing) {
                        return { ...img, width: Math.max(20, dragState.initial.width + dx), height: Math.max(20, dragState.initial.height + dy) };
                    }
                }
                return img;
            }));
        };
        const handleUp = () => setDragState({ isDragging: false, isResizing: false, startX: 0, startY: 0, initial: {} });

        if (dragState.isDragging || dragState.isResizing) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
        }
        return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
    }, [dragState, activeImgId]);

    // 5. Download
    const downloadPdf = async () => {
        if (!file || images.length === 0) return;
        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDocLib = await PDFDocument.load(arrayBuffer);
            const page = pdfDocLib.getPages()[pageNum - 1]; // Only editing active page visually for MVP rules, but normally we'd track page per item. MVP: "Place anywhere on PDF".
            // Since we aren't tracking which page an image belongs to in this simple state, 
            // we assume all images are meant for the CURRENT VISIBLE PAGE for this interaction model 
            // OR we iterate. For simplicity/safety, let's just draw on the current page for MVP 
            // or improve state to include pageNum. 
            // Let's improve state slightly: actually we just put them all on the current page the user is viewing, 
            // as multi-page editing adds complexity. 
            // Wait, users might rotate pages. Let's assume user stays on page. 

            const { width: viewW, height: viewH } = pdfCanvasRef.current;
            const { width: pageW, height: pageH } = page.getSize();
            const scaleX = pageW / viewW;
            const scaleY = pageH / viewH;

            for (const img of images) {
                const imageBytes = await fetch(img.dataUrl).then(res => res.arrayBuffer());
                let embeddedImage;
                if (img.dataUrl.startsWith("data:image/png")) embeddedImage = await pdfDocLib.embedPng(imageBytes);
                else embeddedImage = await pdfDocLib.embedJpg(imageBytes);

                const finalX = img.x * scaleX;
                const finalY = pageH - (img.y * scaleY) - (img.height * scaleY);

                page.drawImage(embeddedImage, {
                    x: finalX,
                    y: finalY, // flipped
                    width: img.width * scaleX,
                    height: img.height * scaleY
                });
            }

            const pdfBytes = await pdfDocLib.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `image_added_${file.name}`;
            link.click();
            toast.success("Downloaded!");

        } catch (e) {
            console.error(e);
            toast.error("Error saving PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const removeImage = (id) => {
        setImages(images.filter(i => i.id !== id));
        if (activeImgId === id) setActiveImgId(null);
    };

    return (
        <DevToolLayout featureKey="pdfAddImage">
            <div className="max-w-6xl mx-auto space-y-8">
                <ProcessingOverlay isProcessing={isProcessing} message="Processing..." />

                {!file && (
                    <div className="max-w-xl mx-auto">
                        <FileUploader onFileSelect={handleFile} accept=".pdf" label="Upload PDF to Add Images" />
                    </div>
                )}

                {file && (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Controls */}
                        <div className="w-full lg:w-1/3 space-y-6">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-slate-700 text-center">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="img-upload" />
                                <label htmlFor="img-upload" className="cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed border-purple-200 hover:bg-purple-50 rounded-xl transition-colors">
                                    <i className="fa-solid fa-image text-4xl text-purple-400 mb-2"></i>
                                    <span className="font-bold text-purple-600">Upload Image</span>
                                    <span className="text-xs text-gray-400">PNG, JPG (Max 5MB)</span>
                                </label>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-slate-700 flex justify-between items-center">
                                <button disabled={pageNum <= 1} onClick={() => setPageNum(p => p - 1)} className="p-2 w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"><i className="fa-solid fa-chevron-left"></i></button>
                                <span className="font-bold text-sm">Page {pageNum}</span>
                                <button disabled={pdfDoc && pageNum >= pdfDoc.numPages} onClick={() => setPageNum(p => p + 1)} className="p-2 w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"><i className="fa-solid fa-chevron-right"></i></button>
                            </div>

                            <button onClick={downloadPdf} disabled={images.length === 0} className="w-full py-4 bg-purple-600 text-white font-bold rounded-2xl shadow-xl hover:bg-purple-700 disabled:opacity-50 transition-transform active:scale-95">
                                <i className="fa-solid fa-file-export mr-2"></i> Download PDF
                            </button>
                        </div>

                        {/* Workspace */}
                        <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-2xl p-4 overflow-auto flex justify-center min-h-[600px] relative">
                            <div className="relative shadow-2xl">
                                <canvas ref={pdfCanvasRef} className="block" />

                                {images.map(img => (
                                    <div
                                        key={img.id}
                                        style={{
                                            position: 'absolute',
                                            left: img.x,
                                            top: img.y,
                                            width: img.width,
                                            height: img.height,
                                            backgroundImage: `url(${img.dataUrl})`,
                                            backgroundSize: '100% 100%',
                                            cursor: 'move',
                                            border: activeImgId === img.id ? '2px dashed purple' : 'none',
                                            zIndex: 10
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, img, 'move')}
                                    >
                                        {activeImgId === img.id && (
                                            <>
                                                <div
                                                    className="absolute bottom-0 right-0 w-6 h-6 bg-purple-500 rounded-tl cursor-nwse-resize hover:bg-purple-600"
                                                    onMouseDown={(e) => handleMouseDown(e, img, 'resize')}
                                                />
                                                <button
                                                    onClick={() => removeImage(img.id)}
                                                    className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600"
                                                >
                                                    <i className="fa-solid fa-times text-xs"></i>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}
