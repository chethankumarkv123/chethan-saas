
import { useState, useRef, useEffect } from 'react';
import { useUI } from '../context/UIContext';
import { SeoContent } from '../components/SeoContent';
import { RelatedTools } from '../components/RelatedTools';
import { SEO } from '../components/SEO';
import { TrustBar } from '../components/TrustBar';
import { FEATURES } from '../config/FEATURE_CONFIG';
import { useFileValidation } from '../hooks/useFileValidation';
import { FileUploader } from '../components/FileUploader';
import { ErrorBanner } from '../components/ErrorBanner';
import { ProcessingOverlay } from '../components/ProcessingOverlay';
import { toast } from '../components/Toast';

export function ImageTools({ initialMode = 'resizer' }) {
    const { showModal } = useUI();
    const [mode, setMode] = useState(initialMode); // resizer, compressor
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Advanced State
    const [outputFormat, setOutputFormat] = useState('original'); // original, image/jpeg, image/png, image/webp
    const [rotation, setRotation] = useState(0);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [grayscale, setGrayscale] = useState(false);

    // Resize State
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [maintainAspect, setMaintainAspect] = useState(true);
    const [aspectRatio, setAspectRatio] = useState(1);
    const [originalDimensions, setOriginalDimensions] = useState({ w: 0, h: 0 });

    // Compress State
    const [quality, setQuality] = useState(0.8);
    const [processedImage, setProcessedImage] = useState(null);
    const [processedSize, setProcessedSize] = useState(0);

    const featureName = mode === 'resizer' ? 'imageResizer' : 'imageCompressor';
    const feature = FEATURES[featureName];
    const { validateFiles, errors, setErrors } = useFileValidation(featureName);

    // Reset state when mode or files change
    useEffect(() => {
        setProcessedImage(null);
        setProcessedSize(0);
    }, [mode, files]);

    const handleFilesSelected = (fileList) => {
        setErrors([]);
        if (validateFiles(fileList)) {
            const file = fileList[0]; // Handle single file for now
            setFiles([file]);

            const img = new Image();
            img.onload = () => {
                setOriginalDimensions({ w: img.width, h: img.height });
                setWidth(img.width);
                setHeight(img.height);
                setAspectRatio(img.width / img.height);
                setPreviewUrl(img.src);
                // Reset transformations
                setRotation(0);
                setFlipH(false);
                setFlipV(false);
                setGrayscale(false);
                setOutputFormat('original');
            };
            img.src = URL.createObjectURL(file);
        }
    };

    const handleWidthChange = (e) => {
        const w = parseInt(e.target.value) || 0;
        setWidth(w);
        if (maintainAspect && w > 0) {
            setHeight(Math.round(w / aspectRatio));
        }
    };

    const handleHeightChange = (e) => {
        const h = parseInt(e.target.value) || 0;
        setHeight(h);
        if (maintainAspect && h > 0) {
            setWidth(Math.round(h * aspectRatio));
        }
    };

    const processImage = async () => {
        if (!files.length) return;
        setIsProcessing(true);

        try {
            const file = files[0];
            const img = new Image();

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = previewUrl;
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Determine target dimensions
            let targetWidth = mode === 'resizer' ? width : originalDimensions.w;
            let targetHeight = mode === 'resizer' ? height : originalDimensions.h;

            // Swap dimensions if rotated 90 or 270 degrees
            if ((rotation / 90) % 2 !== 0) {
                [targetWidth, targetHeight] = [targetHeight, targetWidth];
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // Apply transformations
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((rotation * Math.PI) / 180);

            // Screen-relative flipping logic
            // If rotated 90/270 (sideways), Horizontal Flip on screen = Vertical Flip on Image, and vice-versa.
            let effectiveFlipH = flipH;
            let effectiveFlipV = flipV;

            if ((rotation / 90) % 2 !== 0) {
                // Swapped orientation
                effectiveFlipH = flipV;
                effectiveFlipV = flipH;
            }

            ctx.scale(effectiveFlipH ? -1 : 1, effectiveFlipV ? -1 : 1);

            // Draw image centered (handling logic to draw correctly after rotation)
            // When rotated 90/270, the "draw" width/height are the *original* orientation's target W/H, 
            // but we swapped canvas W/H above. Drawing centered works.
            const drawWidth = (rotation / 90) % 2 !== 0 ? targetHeight : targetWidth;
            const drawHeight = (rotation / 90) % 2 !== 0 ? targetWidth : targetHeight;

            ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

            // Apply Grayscale
            if (grayscale) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = avg; // red
                    data[i + 1] = avg; // green
                    data[i + 2] = avg; // blue
                }
                ctx.putImageData(imageData, 0, 0);
            }

            // Export
            let mimeType = outputFormat;
            if (outputFormat === 'original') {
                mimeType = file.type;
            }

            // Fallback if original type is null/empty or unsupported in toDataURL sometimes
            if (!['image/png', 'image/jpeg', 'image/webp'].includes(mimeType)) {
                mimeType = 'image/jpeg';
            }

            const q = quality;
            const dataUrl = canvas.toDataURL(mimeType, q);

            setProcessedImage(dataUrl);

            // Calculate size
            const head = 'data:' + mimeType + ';base64,';
            const size = Math.round((dataUrl.length - head.length) * 3 / 4);
            setProcessedSize(size);

            toast.success("Image processed successfully!");

        } catch (err) {
            console.error(err);
            toast.error("Error processing image.");
        } finally {
            setIsProcessing(false);
        }
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const downloadImage = () => {
        if (!processedImage) return;

        try {
            // Convert base64 to blob to avoid URL length limits
            const byteString = atob(processedImage.split(',')[1]);
            const mimeString = processedImage.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;

            // Generate meaningful filename
            const originalName = files[0]?.name || 'image';
            let namePart;
            const lastDotIndex = originalName.lastIndexOf('.');

            if (lastDotIndex !== -1) {
                namePart = originalName.substring(0, lastDotIndex);
            } else {
                namePart = originalName;
            }

            // Fallback if namePart is empty
            if (!namePart) namePart = 'image';

            let ext = 'jpg';
            if (mimeString === 'image/png') ext = 'png';
            if (mimeString === 'image/webp') ext = 'webp';

            const suffix = mode === 'resizer' ? '-resized' : '-compressed';
            const finalFilename = `${namePart}${suffix}.${ext}`;

            link.download = finalFilename;

            console.log('DEBUG: Download initiated', {
                originalName,
                finalFilename,
                blobUrl: url,
                mime: mimeString
            });

            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (err) {
            console.error("Download failed:", err);
            toast.error("Failed to download image.");
        }
    };

    return (
        <div className="pt-24 pb-20 px-4 min-h-screen bg-gray-50 dark:bg-slate-900">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords={`image ${mode}, photo editor, online image tool`}
            />

            <ProcessingOverlay isProcessing={isProcessing} message={`Processing...`} />

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-600 mb-4">
                        {feature.title}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">{feature.desc}</p>
                    <div className="mt-4">
                        <TrustBar />
                    </div>
                </div>

                {/* Mode Switcher - Compact */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-md border border-gray-100 dark:border-slate-700 inline-flex gap-1">
                        <button
                            onClick={() => { setMode('resizer'); setProcessedImage(null); }}
                            className={`px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2 ${mode === 'resizer' ? 'bg-pink-600 text-white shadow-lg transform scale-105' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 dark:text-gray-400'}`}
                        >
                            <i className="fa-solid fa-expand"></i> Resize
                        </button>
                        <button
                            onClick={() => { setMode('compressor'); setProcessedImage(null); }}
                            className={`px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2 ${mode === 'compressor' ? 'bg-teal-600 text-white shadow-lg transform scale-105' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 dark:text-gray-400'}`}
                        >
                            <i className="fa-solid fa-compress"></i> Compress
                        </button>
                    </div>
                </div>

                {files.length === 0 ? (
                    <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-slate-700 mt-8">
                        <FileUploader
                            onFilesSelected={handleFilesSelected}
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            helperText="Upload an image to resize or compress."
                        />
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Supports JPG, PNG, WEBP • Max 10MB
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-12 gap-8 items-start animate-fade-in-up">
                        {/* LEFT COLUMN: Controls - Sticky */}
                        <div className="lg:col-span-4 sticky top-28 z-10">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                                        <i className="fa-solid fa-sliders text-pink-500"></i> Settings
                                    </h3>
                                    {files.length > 0 && (
                                        <span className="text-xs font-mono bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-gray-500 border border-gray-200 dark:border-slate-600">
                                            {files[0].type.split('/')[1].toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {mode === 'resizer' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Width</label>
                                                    <div className="relative group">
                                                        <input
                                                            type="number"
                                                            value={width}
                                                            onChange={handleWidthChange}
                                                            className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none text-sm font-bold transition-all"
                                                        />
                                                        <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-bold group-hover:text-pink-500 transition-colors">PX</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Height</label>
                                                    <div className="relative group">
                                                        <input
                                                            type="number"
                                                            value={height}
                                                            onChange={handleHeightChange}
                                                            className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none text-sm font-bold transition-all"
                                                        />
                                                        <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-bold group-hover:text-pink-500 transition-colors">PX</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/30 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-600">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={maintainAspect}
                                                        onChange={(e) => setMaintainAspect(e.target.checked)}
                                                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:border-pink-500 checked:bg-pink-500"
                                                    />
                                                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                                        <i className="fa-solid fa-check text-[10px]"></i>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lock Aspect Ratio</span>
                                            </label>
                                        </>
                                    )}

                                    {/* Universal Quality Setting */}
                                    <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-2xl space-y-4 border border-gray-100 dark:border-slate-600/50">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Quality Level</label>
                                            <span className="text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded border border-teal-100 dark:border-teal-800">{Math.round(quality * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1.0"
                                            step="0.05"
                                            value={quality}
                                            onChange={(e) => setQuality(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600 dark:bg-slate-600"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                            <span>Max Compression</span>
                                            <span>Best Quality</span>
                                        </div>
                                    </div>

                                    {/* Advanced Settings Section */}
                                    <div className="border-t border-gray-100 dark:border-slate-700 pt-4 space-y-4">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Advanced Options</h4>

                                        {/* Output Format */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Output Format</label>
                                            <select
                                                value={outputFormat}
                                                onChange={(e) => setOutputFormat(e.target.value)}
                                                className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-white"
                                            >
                                                <option value="original">Original Format</option>
                                                <option value="image/jpeg">JPG / JPEG</option>
                                                <option value="image/png">PNG</option>
                                                <option value="image/webp">WEBP</option>
                                            </select>
                                        </div>

                                        {/* Rotation & Flip */}
                                        <div className="grid grid-cols-4 gap-2">
                                            <button onClick={() => setRotation(r => (r - 90) % 360)} className="aspect-square bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors" title="Rotate Left">
                                                <i className="fa-solid fa-rotate-left"></i>
                                            </button>
                                            <button onClick={() => setRotation(r => (r + 90) % 360)} className="aspect-square bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors" title="Rotate Right">
                                                <i className="fa-solid fa-rotate-right"></i>
                                            </button>
                                            <button onClick={() => setFlipH(!flipH)} className={`aspect-square rounded-lg flex items-center justify-center transition-colors ${flipH ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300'}`} title="Flip Horizontal">
                                                <i className="fa-solid fa-arrows-left-right"></i>
                                            </button>
                                            <button onClick={() => setFlipV(!flipV)} className={`aspect-square rounded-lg flex items-center justify-center transition-colors ${flipV ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300'}`} title="Flip Vertical">
                                                <i className="fa-solid fa-arrows-up-down"></i>
                                            </button>
                                        </div>

                                        {/* Grayscale */}
                                        <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/30 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-600">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={grayscale}
                                                    onChange={(e) => setGrayscale(e.target.checked)}
                                                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:border-gray-600 checked:bg-gray-600"
                                                />
                                                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                                    <i className="fa-solid fa-check text-[10px]"></i>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Convert to Grayscale</span>
                                        </label>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            onClick={processImage}
                                            className={`w-full py-4 text-white font-bold rounded-xl shadow-lg shadow-gray-200 dark:shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 text-sm ${mode === 'resizer' ? 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-pink-500/20' : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-teal-500/20'}`}
                                        >
                                            {mode === 'resizer' ? <i className="fa-solid fa-wand-magic-sparkles"></i> : <i className="fa-solid fa-compress"></i>}
                                            {mode === 'resizer' ? 'Resize Image' : 'Compress Now'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Preview */}
                        <div className="lg:col-span-8 h-full flex flex-col">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-slate-700 flex-grow flex flex-col">

                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Preview</h3>
                                    <button
                                        onClick={() => { setFiles([]); setProcessedImage(null); }}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1.5"
                                    >
                                        <i className="fa-solid fa-arrow-rotate-left"></i> Start Over
                                    </button>
                                </div>

                                {/* Checkerboard Pattern */}
                                <div className="flex-grow bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded-xl mb-4 relative overflow-hidden flex items-center justify-center p-8 border border-gray-100 dark:border-slate-700 min-h-[400px]"
                                    style={{ backgroundImage: 'linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>

                                    <img
                                        src={processedImage || previewUrl}
                                        alt="Preview"
                                        style={{
                                            transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                                            transition: 'transform 0.3s ease'
                                        }}
                                        className="max-w-full max-h-[500px] object-contain shadow-2xl rounded-lg"
                                    />

                                    {/* Badge */}
                                    {processedImage && (
                                        <div className="absolute bottom-6 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce-in border border-white/10">
                                            <i className="fa-solid fa-check-circle text-green-400"></i>
                                            <span className="font-bold text-sm">Processed Successfully</span>
                                        </div>
                                    )}
                                </div>

                                {/* Stats & Downloads */}
                                <div className="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-5 border border-gray-100 dark:border-slate-700">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-8 w-full sm:w-auto justify-center sm:justify-start">
                                            <div className="text-center sm:text-left">
                                                <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Original Size</span>
                                                <span className="text-base font-bold text-gray-700 dark:text-gray-200">{formatSize(files[0]?.size)}</span>
                                            </div>

                                            {/* Arrow */}
                                            <div className="text-gray-300 dark:text-gray-600">
                                                <i className="fa-solid fa-arrow-right-long text-xl"></i>
                                            </div>

                                            <div className="text-center sm:text-left">
                                                <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Result Size</span>
                                                {processedImage ? (
                                                    <span className="text-base font-bold text-green-600 dark:text-green-400">{formatSize(processedSize)}</span>
                                                ) : (
                                                    <span className="text-base font-bold text-gray-300 dark:text-gray-600">---</span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={downloadImage}
                                            disabled={!processedImage}
                                            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm ${processedImage ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:-translate-y-1' : 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'}`}
                                        >
                                            <i className="fa-solid fa-download"></i> Download Image
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                <div className="mt-16">
                    <TrustBar />
                    <RelatedTools toolKeys={feature.related} />
                    <SeoContent featureKey={featureName} />
                </div>
            </div>
        </div>
    );
}
