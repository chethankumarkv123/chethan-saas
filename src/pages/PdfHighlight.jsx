import { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb } from 'pdf-lib'; // rgb import needed
import * as pdfjsLib from 'pdfjs-dist';
import { DevToolLayout } from '../components/DevToolLayout';
import { FileUploader } from '../components/FileUploader';
import { toast } from '../components/Toast';
import { ProcessingOverlay } from '../components/ProcessingOverlay';
import { LIMITS } from '../config/LIMITS_CONFIG';
import { ChevronLeft, ChevronRight, Download, Trash2, ShieldAlert } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

export function PdfHighlight() {
    const [file, setFile] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Highlight State
    const [highlights, setHighlights] = useState([]); // Array of { id, x, y, width, height }
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [tempRect, setTempRect] = useState(null); // The one currently being drawn

    // Config
    const color = { r: 1, g: 1, b: 0, alpha: 0.35 }; // Yellow Highlight standard

    const pdfCanvasRef = useRef(null);

    // 1. Load
    const handleFile = async (f) => {
        if (f.size > LIMITS.PDF_MAX_SIZE_MB * 1024 * 1024) {
            toast.error(`File limit ${LIMITS.PDF_MAX_SIZE_MB}MB`);
            return;
        }
        setFile(f);
        setIsProcessing(true);
        try {
            const buffer = await f.arrayBuffer();
            const loadedPdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
            setPdfDoc(loadedPdf);
            setPageNum(1);
        } catch (e) { toast.error("Failed to load PDF"); }
        finally { setIsProcessing(false); }
    };

    // 2. Render
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

    // 3. Highlight Logic (Rectangle Draw)
    const handleMouseDown = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setIsDrawing(true);
        setStartPos({ x, y });
        setTempRect({ x, y, width: 0, height: 0 });
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;
        const rect = e.target.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const width = currentX - startPos.x;
        const height = currentY - startPos.y;

        setTempRect({
            x: width < 0 ? currentX : startPos.x,
            y: height < 0 ? currentY : startPos.y,
            width: Math.abs(width),
            height: Math.abs(height)
        });
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (tempRect && tempRect.width > 5 && tempRect.height > 5) {
            setHighlights([...highlights, { ...tempRect, id: Date.now() }]);
        }
        setTempRect(null);
    };

    const removeHighlight = (id) => {
        setHighlights(highlights.filter(h => h.id !== id));
    };

    // 4. Download
    const downloadPdf = async () => {
        if (!file || highlights.length === 0) return;
        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDocLib = await PDFDocument.load(arrayBuffer);
            const page = pdfDocLib.getPages()[pageNum - 1];

            const { width: viewW, height: viewH } = pdfCanvasRef.current;
            const { width: pageW, height: pageH } = page.getSize();
            const scaleX = pageW / viewW;
            const scaleY = pageH / viewH;

            highlights.forEach(h => {
                const finalX = h.x * scaleX;
                const finalY = pageH - (h.y * scaleY) - (h.height * scaleY);

                page.drawRectangle({
                    x: finalX,
                    y: finalY,
                    width: h.width * scaleX,
                    height: h.height * scaleY,
                    color: rgb(color.r, color.g, color.b),
                    opacity: color.alpha
                });
            });

            const pdfBytes = await pdfDocLib.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `highlighted_${file.name}`;
            link.click();
            toast.success("Success!");

        } catch (e) {
            console.error(e);
            toast.error("Error saving PDF.");
        } finally { setIsProcessing(false); }
    };

    return (
        <DevToolLayout featureKey="pdfHighlight">
            <div className="max-w-6xl mx-auto space-y-8">
                <ProcessingOverlay isProcessing={isProcessing} message="Processing..." />

                {!file ? (
                    <div className="max-w-xl mx-auto text-center">
                        <FileUploader onFileSelect={handleFile} accept="application/pdf,.pdf" label="Upload PDF to Highlight" />
                        <p className="mt-4 text-gray-400">Click and drag on the PDF to highlight areas.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
                            <div className="flex gap-4 items-center">
                                <button
                                    disabled={pageNum <= 1}
                                    onClick={() => setPageNum(p => p - 1)}
                                    className="p-2 w-10 h-10 bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 flex items-center justify-center transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="font-bold dark:text-white">Page {pageNum}</span>
                                <button
                                    disabled={pdfDoc && pageNum >= pdfDoc.numPages}
                                    onClick={() => setPageNum(p => p + 1)}
                                    className="p-2 w-10 h-10 bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 flex items-center justify-center transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setHighlights([])}
                                    className="px-4 py-2 text-red-500 font-bold hover:bg-red-50 rounded-lg text-sm"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={downloadPdf}
                                    className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg shadow-md flex items-center gap-2 transition-all active:scale-95"
                                >
                                    <Download size={18} /> Download PDF
                                </button>
                            </div>
                        </div>

                        <div className="relative overflow-auto flex justify-center bg-gray-200 dark:bg-slate-700 p-8 rounded-xl min-h-[600px]">
                            <div className="relative shadow-2xl cursor-text select-none">
                                <canvas ref={pdfCanvasRef} className="block" />

                                {/* Interaction Layer */}
                                <div
                                    className="absolute inset-0 z-20 cursor-crosshair"
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                />

                                {/* Highlights Display */}
                                {highlights.map(h => (
                                    <div
                                        key={h.id}
                                        style={{
                                            position: 'absolute',
                                            left: h.x, top: h.y, width: h.width, height: h.height,
                                            backgroundColor: 'rgba(255, 255, 0, 0.4)',
                                            border: '1px solid rgba(255, 200, 0, 0.8)',
                                            zIndex: 10
                                        }}
                                    >
                                        <button
                                            onClick={() => removeHighlight(h.id)}
                                            className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 hover:opacity-100 transition-opacity z-50 pointer-events-auto"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}

                                {/* Drawing Temp Rect */}
                                {tempRect && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: tempRect.x, top: tempRect.y, width: tempRect.width, height: tempRect.height,
                                            backgroundColor: 'rgba(255, 255, 0, 0.4)',
                                            border: '1px dashed orange',
                                            zIndex: 15,
                                            pointerEvents: 'none'
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DevToolLayout>
    );
}
