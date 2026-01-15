import { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { DevToolLayout } from '../components/DevToolLayout';
import { FileUploader } from '../components/FileUploader';
import { toast } from '../components/Toast';
import { ProcessingOverlay } from '../components/ProcessingOverlay';
import { LIMITS } from '../config/LIMITS_CONFIG';
import { ChevronLeft, ChevronRight, FileOutput, Plus, X, Type } from 'lucide-react';

// Worker Setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

export function PdfAddText() {
    const [file, setFile] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null); // pdfjs doc
    const [pageNum, setPageNum] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Text State
    const [texts, setTexts] = useState([]); // Array of { id, text, x, y, size, color }
    const [activeTextId, setActiveTextId] = useState(null);
    const [inputText, setInputText] = useState("");
    const [fontSize, setFontSize] = useState(12);
    const [color, setColor] = useState({ r: 0, g: 0, b: 0, hex: "#000000" });

    // Canvas Refs
    const pdfCanvasRef = useRef(null);

    // Drag State
    const [dragState, setDragState] = useState({ isDragging: false, startX: 0, startY: 0, initial: {} });

    // 1. Load PDF
    const handleFile = async (f) => {
        if (f.size > LIMITS.PDF_MAX_SIZE_MB * 1024 * 1024) {
            toast.error(`File excessively large. Limit ${LIMITS.PDF_MAX_SIZE_MB}MB`);
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


    // 3. Add Text Logic
    const addText = () => {
        if (!inputText.trim()) { toast.error("Enter some text first."); return; }

        // Center Default
        const canvas = pdfCanvasRef.current;
        const x = canvas ? canvas.width / 2 - 50 : 100;
        const y = canvas ? canvas.height / 2 : 100;

        const newText = {
            id: Date.now(),
            text: inputText,
            x,
            y,
            size: Number(fontSize),
            color: color
        };

        setTexts([...texts, newText]);
        setInputText("");
        setActiveTextId(newText.id);
        toast.success("Text added! Drag to position.");
    };

    const removeText = (id) => {
        setTexts(texts.filter(t => t.id !== id));
        if (activeTextId === id) setActiveTextId(null);
    };


    // 4. Drag Logic
    const handleMouseDown = (e, t) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveTextId(t.id);
        setDragState({
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            initial: { ...t }
        });
    };

    useEffect(() => {
        const handleMove = (e) => {
            if (!dragState.isDragging || !activeTextId) return;
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;

            setTexts(prev => prev.map(t => {
                if (t.id === activeTextId) {
                    return { ...t, x: dragState.initial.x + dx, y: dragState.initial.y + dy };
                }
                return t;
            }));
        };

        const handleUp = () => {
            setDragState({ isDragging: false, startX: 0, startY: 0, initial: {} });
        };

        if (dragState.isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [dragState, activeTextId]);


    // 5. Download
    const downloadPdf = async () => {
        if (!file || texts.length === 0) return;
        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDocLib = await PDFDocument.load(arrayBuffer);
            const helveticaFont = await pdfDocLib.embedFont(StandardFonts.Helvetica);
            const page = pdfDocLib.getPages()[pageNum - 1];

            const { width: viewW, height: viewH } = pdfCanvasRef.current;
            const { width: pageW, height: pageH } = page.getSize();
            const scaleX = pageW / viewW;
            const scaleY = pageH / viewH;

            texts.forEach(t => {
                // Y flip logic
                // t.y is form TOP. PDF is from BOTTOM.
                // Need to account for font height roughly in positioning if needed, 
                // but basic point-to-point map is:
                const finalX = t.x * scaleX;
                const finalY = pageH - (t.y * scaleY) - (t.size * scaleY); // Approximate baseline adjust

                page.drawText(t.text, {
                    x: finalX,
                    y: finalY,
                    size: t.size * scaleY, // Scale font too
                    font: helveticaFont,
                    color: rgb(t.color.r, t.color.g, t.color.b),
                });
            });

            const pdfBytes = await pdfDocLib.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `text_added_${file.name}`;
            link.click();
            toast.success("PDF Downloaded!");

        } catch (e) {
            console.error(e);
            toast.error("Error saving PDF.");
        } finally {
            setIsProcessing(false);
        }
    };


    return (
        <DevToolLayout featureKey="pdfAddText">
            <div className="max-w-6xl mx-auto space-y-8">
                <ProcessingOverlay isProcessing={isProcessing} message="Processing..." />

                {!file && (
                    <div className="max-w-xl mx-auto">
                        <FileUploader onFileSelect={handleFile} accept="application/pdf,.pdf" label="Upload PDF to Add Text" />
                    </div>
                )}

                {file && (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Controls */}
                        <div className="w-full lg:w-1/3 space-y-6">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-slate-700">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    placeholder="Type text here..."
                                    className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-xl mb-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                />
                                <div className='flex gap-4 mb-4'>
                                    <div className='flex-1'>
                                        <label className="text-xs font-bold text-gray-400">Size</label>
                                        <input
                                            type="number"
                                            value={fontSize}
                                            onChange={e => setFontSize(e.target.value)}
                                            className="w-full p-2 border rounded-lg"
                                        />
                                    </div>
                                    <div className='flex-1'>
                                        <label className="text-xs font-bold text-gray-400">Color</label>
                                        <input
                                            type="color"
                                            value={color.hex}
                                            onChange={e => {
                                                const hex = e.target.value;
                                                const r = parseInt(hex.slice(1, 3), 16) / 255;
                                                const g = parseInt(hex.slice(3, 5), 16) / 255;
                                                const b = parseInt(hex.slice(5, 7), 16) / 255;
                                                setColor({ r, g, b, hex });
                                            }}
                                            className="w-full h-10 border rounded-lg cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={addText}
                                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700"
                                >
                                    <i className="fa-solid fa-plus mr-2"></i> Add Text
                                </button>
                            </div>

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

                            <button onClick={downloadPdf} disabled={texts.length === 0} className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-xl hover:bg-green-700 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                <FileOutput size={20} /> Download PDF
                            </button>
                        </div>

                        {/* Preview */}
                        <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-2xl p-4 overflow-auto flex justify-center min-h-[600px] relative">
                            <div className="relative shadow-2xl">
                                {/* The PDF Page */}
                                <canvas
                                    ref={pdfCanvasRef}
                                    className="block bg-white shadow-2xl rounded-sm ring-1 ring-gray-200 dark:ring-slate-600"
                                />

                                {texts.map(t => (
                                    <div
                                        key={t.id}
                                        style={{
                                            position: 'absolute',
                                            left: t.x,
                                            top: t.y,
                                            fontSize: `${t.size}px`,
                                            color: t.color.hex,
                                            fontFamily: 'Helvetica, sans-serif',
                                            cursor: 'move',
                                            border: activeTextId === t.id ? '1px dashed blue' : 'none',
                                            padding: '2px',
                                            whiteSpace: 'nowrap',
                                            userSelect: 'none'
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, t)}
                                    >
                                        {t.text}
                                        {activeTextId === t.id && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeText(t.id); }}
                                                className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-transform active:scale-90"
                                            >
                                                <X size={12} />
                                            </button>
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
