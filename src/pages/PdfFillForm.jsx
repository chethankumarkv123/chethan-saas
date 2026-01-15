import { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { DevToolLayout } from '../components/DevToolLayout';
import { FileUploader } from '../components/FileUploader';
import { toast } from '../components/Toast';
import { ProcessingOverlay } from '../components/ProcessingOverlay';
import { LIMITS } from '../config/LIMITS_CONFIG';
import { ChevronLeft, ChevronRight, FileOutput, Plus, X, Type } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

export function PdfFillForm() {
    const [file, setFile] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Text Fields (Simulate form filling by overlaying text)
    const [fields, setFields] = useState([]); // { id, text, x, y, width, height }

    // Canvas Refs
    const pdfCanvasRef = useRef(null);
    const [dragState, setDragState] = useState({ isDragging: false, startX: 0, startY: 0, initial: {} });
    const [activeId, setActiveId] = useState(null);

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


    // 3. Add Field (User clicks to add a typing area)
    const addField = () => {
        const canvas = pdfCanvasRef.current;
        const x = canvas ? canvas.width / 2 - 75 : 100;
        const y = canvas ? canvas.height / 2 - 15 : 100;

        const newField = {
            id: Date.now(),
            text: "Type here...",
            x, y, width: 150, height: 30
        };
        setFields([...fields, newField]);
        setActiveId(newField.id);
        toast.success("Field added!");
    };


    // 4. Interaction Logic
    const handleMouseDown = (e, f) => {
        e.stopPropagation();
        setActiveId(f.id);
        setDragState({
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            initial: { ...f }
        });
    };

    useEffect(() => {
        const handleMove = (e) => {
            if (!dragState.isDragging || !activeId) return;
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;
            setFields(prev => prev.map(f => {
                if (f.id === activeId) return { ...f, x: dragState.initial.x + dx, y: dragState.initial.y + dy };
                return f;
            }));
        };
        const handleUp = () => setDragState({ isDragging: false, startX: 0, startY: 0, initial: {} });

        if (dragState.isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
        }
        return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
    }, [dragState, activeId]);

    const updateText = (id, newText) => {
        setFields(fields.map(f => f.id === id ? { ...f, text: newText } : f));
    };

    const removeField = (id) => {
        setFields(fields.filter(f => f.id !== id));
    };

    // 5. Download
    const downloadPdf = async () => {
        if (!file || fields.length === 0) return;
        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDocLib = await PDFDocument.load(arrayBuffer);
            const font = await pdfDocLib.embedFont(StandardFonts.Helvetica);
            const page = pdfDocLib.getPages()[pageNum - 1];

            const { width: viewW, height: viewH } = pdfCanvasRef.current;
            const { width: pageW, height: pageH } = page.getSize();
            const scaleX = pageW / viewW;
            const scaleY = pageH / viewH;

            fields.forEach(f => {
                // If text is default placeholder, skip or clarify? We print it.
                if (!f.text) return;

                const finalX = f.x * scaleX;
                // Basic vertical alignment
                const finalY = pageH - (f.y * scaleY) - (12 * scaleY); // 12 is roughly font size

                page.drawText(f.text, {
                    x: finalX,
                    y: finalY,
                    size: 12 * scaleY,
                    font: font,
                    color: rgb(0, 0, 0)
                });
            });

            const pdfBytes = await pdfDocLib.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `filled_form_${file.name}`;
            link.click();
            toast.success("Downloaded!");
        } catch (e) { console.error(e); toast.error("Error saving PDF."); }
        finally { setIsProcessing(false); }
    };

    return (
        <DevToolLayout featureKey="pdfFillForm">
            <div className="max-w-6xl mx-auto space-y-8">
                <ProcessingOverlay isProcessing={isProcessing} message="Processing..." />

                {!file ? (
                    <div className="max-w-xl mx-auto">
                        <FileUploader onFileSelect={handleFile} accept="application/pdf,.pdf" label="Upload PDF to Fill" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {/* Toolbar */}
                        <div className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-gray-100 dark:border-slate-700">
                            <div className="flex gap-4 items-center">
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

                            <div className="flex gap-4">
                                <button
                                    onClick={addField}
                                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2"
                                >
                                    <Plus size={18} /> Add Text Field
                                </button>
                                <button
                                    onClick={downloadPdf}
                                    className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow flex items-center gap-2 active:scale-95 transition-all"
                                >
                                    <FileOutput size={18} /> Download
                                </button>
                            </div>
                        </div>

                        {/* Workspace */}
                        <div className="relative overflow-auto flex justify-center bg-gray-200 dark:bg-slate-700 p-8 rounded-xl min-h-[600px]">
                            <div className="relative shadow-2xl">
                                {/* The PDF Page */}
                                <canvas
                                    ref={pdfCanvasRef}
                                    className="block bg-white shadow-2xl rounded-sm ring-1 ring-gray-200 dark:ring-slate-600"
                                />

                                {fields.map(f => (
                                    <div
                                        key={f.id}
                                        style={{
                                            position: 'absolute',
                                            left: f.x, top: f.y,
                                            zIndex: 10,
                                            cursor: 'move'
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, f)}
                                    >
                                        <input
                                            type="text"
                                            value={f.text}
                                            onChange={(e) => updateText(f.id, e.target.value)}
                                            className="bg-white/80 border border-blue-400 rounded px-2 py-1 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                            style={{ width: `${f.width}px` }} // Fixed width for simple form fields
                                        />
                                        <button
                                            onClick={() => removeField(f.id)}
                                            className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 z-20 transition-transform active:scale-90"
                                        >
                                            <X size={12} />
                                        </button>
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
