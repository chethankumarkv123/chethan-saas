import { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { DevToolLayout } from '../components/DevToolLayout';
import { FileUploader } from '../components/FileUploader';
import { toast } from '../components/Toast';
import { ProcessingOverlay } from '../components/ProcessingOverlay';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function PdfAddDate() {
    const [file, setFile] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Date State
    const [dates, setDates] = useState([]); // { id, text, x, y }
    const [activeId, setActiveId] = useState(null);
    const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');

    // Canvas Refs
    const pdfCanvasRef = useRef(null);
    const [dragState, setDragState] = useState({ isDragging: false, startX: 0, startY: 0, initial: {} });

    // 1. Load
    const handleFile = async (f) => {
        if (f.size > 10 * 1024 * 1024) { toast.error("File limit 10MB"); return; }
        setFile(f);
        setIsProcessing(true);
        try {
            const buffer = await f.arrayBuffer();
            const loadedPdf = await pdfjsLib.getDocument(buffer).promise;
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

    // 3. Date Logic
    const getFormattedDate = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        switch (dateFormat) {
            case 'YYYY-MM-DD': return `${y}-${m}-${day}`;
            case 'MM/DD/YYYY': return `${m}/${day}/${y}`;
            case 'DD.MM.YYYY': return `${day}.${m}.${y}`;
            default: return d.toLocaleDateString();
        }
    };

    const addDate = () => {
        const canvas = pdfCanvasRef.current;
        const x = canvas ? canvas.width / 2 - 50 : 100;
        const y = canvas ? canvas.height / 2 - 10 : 100;

        const newDate = {
            id: Date.now(),
            text: getFormattedDate(),
            x, y
        };
        setDates([...dates, newDate]);
        setActiveId(newDate.id);
        toast.success("Date added!");
    };


    // 4. Drag Logic
    const handleMouseDown = (e, d) => {
        e.preventDefault(); e.stopPropagation();
        setActiveId(d.id);
        setDragState({ isDragging: true, startX: e.clientX, startY: e.clientY, initial: { ...d } });
    };

    useEffect(() => {
        const handleMove = (e) => {
            if (!dragState.isDragging || !activeId) return;
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;
            setDates(prev => prev.map(d => {
                if (d.id === activeId) return { ...d, x: dragState.initial.x + dx, y: dragState.initial.y + dy };
                return d;
            }));
        };
        const handleUp = () => setDragState({ isDragging: false, startX: 0, startY: 0, initial: {} });

        if (dragState.isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
        }
        return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
    }, [dragState, activeId]);

    const removeDate = (id) => setDates(dates.filter(d => d.id !== id));

    // 5. Download
    const downloadPdf = async () => {
        if (!file || dates.length === 0) return;
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

            dates.forEach(d => {
                const finalX = d.x * scaleX;
                const finalY = pageH - (d.y * scaleY) - (12 * scaleY);

                page.drawText(d.text, {
                    x: finalX,
                    y: finalY,
                    size: 12 * scaleY,
                    font,
                    color: rgb(0, 0, 0)
                });
            });

            const pdfBytes = await pdfDocLib.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `date_stamped_${file.name}`;
            link.click();
            toast.success("Downloaded!");
        } catch (e) { console.error(e); toast.error("Error saving PDF."); }
        finally { setIsProcessing(false); }
    };

    return (
        <DevToolLayout featureKey="pdfAddDate">
            <div className="max-w-6xl mx-auto space-y-8">
                <ProcessingOverlay isProcessing={isProcessing} message="Processing..." />

                {!file ? (
                    <div className="max-w-xl mx-auto">
                        <FileUploader onFileSelect={handleFile} accept=".pdf" label="Upload PDF to Add Date" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {/* Toolbar */}
                        <div className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-gray-100 dark:border-slate-700">
                            <div className="flex gap-4 items-center">
                                <button disabled={pageNum <= 1} onClick={() => setPageNum(p => p - 1)} className="p-2 w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"><i className="fa-solid fa-chevron-left"></i></button>
                                <span className="font-bold text-sm">Page {pageNum}</span>
                                <button disabled={pdfDoc && pageNum >= pdfDoc.numPages} onClick={() => setPageNum(p => p + 1)} className="p-2 w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"><i className="fa-solid fa-chevron-right"></i></button>
                            </div>

                            <div className="flex gap-4 items-center">
                                <select
                                    value={dateFormat}
                                    onChange={(e) => setDateFormat(e.target.value)}
                                    className="p-2 border rounded-lg bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-sm"
                                >
                                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-01-15)</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY (01/15/2026)</option>
                                    <option value="DD.MM.YYYY">DD.MM.YYYY (15.01.2026)</option>
                                </select>
                                <button onClick={addDate} className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 text-sm">
                                    <i className="fa-solid fa-calendar-plus mr-1"></i> Add Date
                                </button>
                                <button onClick={downloadPdf} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow text-sm">
                                    Descargar
                                </button>
                            </div>
                        </div>

                        {/* Workspace */}
                        <div className="relative overflow-auto flex justify-center bg-gray-200 dark:bg-slate-700 p-8 rounded-xl min-h-[600px]">
                            <div className="relative shadow-2xl">
                                <canvas ref={pdfCanvasRef} className="block" />

                                {dates.map(d => (
                                    <div
                                        key={d.id}
                                        style={{
                                            position: 'absolute',
                                            left: d.x, top: d.y,
                                            fontSize: '14px',
                                            fontFamily: 'Helvetica',
                                            cursor: 'move',
                                            padding: '4px',
                                            border: activeId === d.id ? '1px dashed blue' : '1px solid transparent',
                                            backgroundColor: activeId === d.id ? 'rgba(255,255,255,0.8)' : 'transparent',
                                            userSelect: 'none'
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, d)}
                                    >
                                        {d.text}
                                        {activeId === d.id && (
                                            <button onClick={() => removeDate(d.id)} className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow hover:bg-red-600">&times;</button>
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
