import { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { DevToolLayout } from '../components/DevToolLayout';
import { FileUploader } from '../components/FileUploader';
import { toast } from '../components/Toast';
import { ProcessingOverlay } from '../components/ProcessingOverlay';
import { LIMITS } from '../config/LIMITS_CONFIG';
import { ChevronLeft, ChevronRight, Download, PenTool, Type, Upload, Trash2, Plus, X, ShieldAlert, FileSignature } from 'lucide-react';

// Worker Setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

export function PdfSign() {
    const [file, setFile] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null); // pdfjs doc
    const [pageNum, setPageNum] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Signature State
    const [signature, setSignature] = useState(null); // { type, dataUrl, x, y, width, height }
    const [activeTab, setActiveTab] = useState('draw'); // draw, type, upload

    // Canvas Refs
    const pdfCanvasRef = useRef(null);
    const drawCanvasRef = useRef(null);
    const signContainerRef = useRef(null);

    // Drag State
    const [dragState, setDragState] = useState({ isDragging: false, isResizing: false, startX: 0, startY: 0, initial: {} });

    // 1. Load PDF
    const handleFile = async (f) => {
        if (f.size > LIMITS.PDF_MAX_SIZE_MB * 1024 * 1024) {
            toast.error(`File too large. Limit ${LIMITS.PDF_MAX_SIZE_MB}MB`);
            return;
        }
        setFile(f);
        setIsProcessing(true);
        try {
            const buffer = await f.arrayBuffer();
            const loadedPdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
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
            try {
                const page = await pdfDoc.getPage(pageNum);
                if (isCancelled) return;

                const viewport = page.getViewport({ scale });
                const canvas = pdfCanvasRef.current;
                const ctx = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: ctx, viewport }).promise;
            } catch (e) {
                console.error(e);
            }
        };
        render();
        return () => { isCancelled = true; };
    }, [pdfDoc, pageNum, scale]);

    // 3. Signature Creation Logic
    const clearDraw = () => {
        const canvas = drawCanvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const saveDraw = () => {
        const canvas = drawCanvasRef.current;
        if (!canvas) return;
        // simple check if empty
        const blank = document.createElement('canvas');
        blank.width = canvas.width; blank.height = canvas.height;
        if (canvas.toDataURL() === blank.toDataURL()) { toast.error("Draw something first!"); return; }

        addSignatureToBoard(canvas.toDataURL());
    };

    const saveType = (text) => {
        if (!text.trim()) return;
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d');
        ctx.font = "italic 48px cursive";
        const width = ctx.measureText(text).width + 20;
        c.width = width;
        c.height = 60;
        ctx.font = "italic 48px cursive"; // reset after resize
        ctx.fillStyle = "black";
        ctx.fillText(text, 10, 45);
        addSignatureToBoard(c.toDataURL());
    };

    const handleImageUpload = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = (ev) => addSignatureToBoard(ev.target.result);
        reader.readAsDataURL(f);
    };

    const addSignatureToBoard = (dataUrl) => {
        // Default placement: Center
        const canvas = pdfCanvasRef.current;
        const cw = canvas ? canvas.width : 500;
        const ch = canvas ? canvas.height : 700;

        setSignature({
            dataUrl,
            x: cw / 2 - 100,
            y: ch / 2 - 50,
            width: 200,
            height: 100
        });
        toast.success("Signature added! Drag to position.");
    };

    // 4. Drag & Drop Logic
    const handleMouseDown = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        setDragState({
            isDragging: type === 'move',
            isResizing: type === 'resize',
            startX: e.clientX,
            startY: e.clientY,
            initial: { ...signature }
        });
    };

    useEffect(() => {
        const handleMove = (e) => {
            if (!dragState.isDragging && !dragState.isResizing) return;

            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;

            setSignature(prev => {
                if (!prev) return null;
                if (dragState.isDragging) {
                    return { ...prev, x: dragState.initial.x + dx, y: dragState.initial.y + dy };
                }
                if (dragState.isResizing) {
                    // Constrain aspect ratio? optionally. For now free resize.
                    return {
                        ...prev,
                        width: Math.max(50, dragState.initial.width + dx),
                        height: Math.max(20, dragState.initial.height + dy)
                    };
                }
                return prev;
            });
        };

        const handleUp = () => {
            setDragState({ isDragging: false, isResizing: false, startX: 0, startY: 0, initial: {} });
        };

        if (dragState.isDragging || dragState.isResizing) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [dragState]);


    // 5. Drawing Canvas Interaction (Drawing Pad)
    const startDrawing = (e) => {
        const canvas = drawCanvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';

        const rect = canvas.getBoundingClientRect();
        const x = e.nativeEvent.offsetX; // Simple offsetX works for mouse
        const y = e.nativeEvent.offsetY;

        ctx.beginPath();
        ctx.moveTo(x, y);
        canvas.isDrawing = true;
    };

    const draw = (e) => {
        const canvas = drawCanvasRef.current;
        if (!canvas || !canvas.isDrawing) return;
        const ctx = canvas.getContext('2d');
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const canvas = drawCanvasRef.current;
        if (canvas) canvas.isDrawing = false;
    };

    // 6. Save & Download
    const downloadPdf = async () => {
        if (!file || !signature) return;
        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDocLib = await PDFDocument.load(arrayBuffer);
            const page = pdfDocLib.getPages()[pageNum - 1]; // 0-indexed

            // Coordinates Math
            // PDF Coords: Bottom-Left (0,0)
            // Canvas Coords: Top-Left (0,0)
            // Need to account for: Scale (View), and PDF actual size

            // Get view scale ratio
            const { width: viewW, height: viewH } = pdfCanvasRef.current;
            const { width: pageW, height: pageH } = page.getSize();

            // Ratio between View and Actual PDF Page
            // viewW = pageW * scale
            // So factor = pageW / viewW

            const scaleX = pageW / viewW;
            const scaleY = pageH / viewH;

            // Embed Image
            const imageBytes = await fetch(signature.dataUrl).then(res => res.arrayBuffer());
            let embeddedImage;
            if (signature.dataUrl.startsWith('data:image/png')) embeddedImage = await pdfDocLib.embedPng(imageBytes);
            else embeddedImage = await pdfDocLib.embedJpg(imageBytes);

            // Calculate Position
            // Screen Y is valid from Top. PDF Y is from Bottom.
            // signature.y is Top-Left of signature on screen.

            const finalW = signature.width * scaleX;
            const finalH = signature.height * scaleY;
            const finalX = signature.x * scaleX;
            // Flip Y
            const finalY = pageH - (signature.y * scaleY) - finalH;

            page.drawImage(embeddedImage, {
                x: finalX,
                y: finalY,
                width: finalW,
                height: finalH,
            });

            const pdfBytes = await pdfDocLib.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `signed_${file.name}`;
            link.click();
            toast.success("Downloaded successfully!");
        } catch (e) {
            console.error(e);
            toast.error("Error saving PDF.");
        } finally {
            setIsProcessing(false);
        }
    };


    return (
        <DevToolLayout featureKey="pdfSign">
            <div className="max-w-6xl mx-auto space-y-8">
                <ProcessingOverlay isProcessing={isProcessing} message="Processing PDF..." />

                {!file && (
                    <div className="max-w-xl mx-auto">
                        <FileUploader onFileSelect={handleFile} accept="application/pdf,.pdf" label="Upload PDF to Sign" />
                        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                            <ShieldAlert size={14} />
                            Files processed locally. No server upload.
                        </p>
                    </div>
                )}

                {file && (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Controls - Left */}
                        <div className="w-full lg:w-1/3 space-y-6">
                            {/* Add Signature Panel */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-slate-700">
                                <h3 className="font-bold mb-4 flex items-center gap-2 dark:text-white">
                                    <PenTool size={18} className="text-blue-500" /> Create Signature
                                </h3>

                                {/* Tabs */}
                                <div className="flex bg-gray-50 dark:bg-slate-900/50 p-1.5 rounded-xl mb-6 border border-gray-100 dark:border-slate-800">
                                    {['draw', 'type', 'upload'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setActiveTab(t)}
                                            className={`flex-1 py-2 text-sm font-bold capitalize rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === t
                                                ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400'
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            {t === 'draw' && <PenTool size={14} />}
                                            {t === 'type' && <Type size={14} />}
                                            {t === 'upload' && <Upload size={14} />}
                                            {t}
                                        </button>
                                    ))}
                                </div>

                                {/* Content */}
                                <div className="min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 p-4 relative">
                                    {activeTab === 'draw' && (
                                        <>
                                            <canvas
                                                ref={drawCanvasRef}
                                                width={300} height={150}
                                                className="bg-white cursor-crosshair shadow-sm touch-none"
                                                onMouseDown={startDrawing}
                                                onMouseMove={draw}
                                                onMouseUp={stopDrawing}
                                                onMouseLeave={stopDrawing}
                                            />
                                            <div className="flex gap-2 mt-4 w-full">
                                                <button onClick={clearDraw} className="flex-1 py-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors">
                                                    <Trash2 size={14} /> Clear
                                                </button>
                                                <button onClick={saveDraw} className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg shadow-md flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-colors">
                                                    <Plus size={14} /> Add to PDF
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'type' && (
                                        <div className="w-full space-y-4">
                                            <input id="sig-input" type="text" placeholder="Type your name..." className="w-full p-3 border border-gray-300 rounded-xl text-center font-[cursive] text-3xl italic text-black bg-white" />
                                            <button
                                                onClick={() => saveType(document.getElementById('sig-input').value)}
                                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow"
                                            >
                                                Add Signature
                                            </button>
                                        </div>
                                    )}

                                    {activeTab === 'upload' && (
                                        <div className="text-center w-full">
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="sig-upload" />
                                            <label htmlFor="sig-upload" className="cursor-pointer block py-8 hover:bg-gray-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                                                <Upload size={40} className="mx-auto text-gray-300 dark:text-slate-600 mb-2" />
                                                <div className="text-sm font-bold text-gray-500">Click to Upload Image</div>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Page Controls */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-slate-700 flex justify-between items-center">
                                <button
                                    disabled={pageNum <= 1}
                                    onClick={() => setPageNum(p => p - 1)}
                                    className="p-2 w-10 h-10 bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 flex items-center justify-center transition-colors shadow-sm"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="font-bold text-sm dark:text-white">Page {pageNum}</span>
                                <button
                                    disabled={pdfDoc && pageNum >= pdfDoc.numPages}
                                    onClick={() => setPageNum(p => p + 1)}
                                    className="p-2 w-10 h-10 bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 flex items-center justify-center transition-colors shadow-sm"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            <button onClick={downloadPdf} disabled={!signature} className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                <FileSignature size={20} /> Download Signed PDF
                            </button>

                            <div className="text-xs text-justify text-gray-400 leading-relaxed bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                                <strong>Disclaimer:</strong> This tool adds a visual signature image only. It does not natively cryptographically sign the document. It may not constitute a legally binding digital signature in all jurisdictions.
                            </div>
                        </div>

                        {/* PDF Canvas - Right (Center Stage) */}
                        <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-2xl p-4 overflow-auto flex justify-center min-h-[600px] relative">
                            <div className="relative shadow-2xl" id="pdf-wrapper">
                                {/* The PDF Page */}
                                <canvas
                                    ref={pdfCanvasRef}
                                    className="block bg-white shadow-2xl rounded-sm ring-1 ring-gray-200 dark:ring-slate-600"
                                />

                                {/* The Signature Overlay */}
                                {signature && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: signature.x,
                                            top: signature.y,
                                            width: signature.width,
                                            height: signature.height,
                                            backgroundImage: `url(${signature.dataUrl})`,
                                            backgroundSize: '100% 100%',
                                            backgroundRepeat: 'no-repeat',
                                            cursor: 'move',
                                            border: '2px dashed #3b82f6',
                                            zIndex: 10
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, 'move')}
                                    >
                                        {/* Resize Handle */}
                                        <div
                                            className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-tl cursor-nwse-resize hover:bg-blue-600"
                                            onMouseDown={(e) => handleMouseDown(e, 'resize')}
                                        />
                                        {/* Remove Button */}
                                        <button
                                            onClick={() => setSignature(null)}
                                            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-transform active:scale-90"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}
