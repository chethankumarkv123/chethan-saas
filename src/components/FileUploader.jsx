import { useRef, useState } from 'react';
import { CloudUpload, Lock } from 'lucide-react';
import { LIMITS } from '../config/LIMITS_CONFIG';

export function FileUploader({
    onFilesSelected,
    onFileSelect, // Support single file callback
    accept,
    multiple,
    label = "Drag & drop files here",
    maxFiles = 10,
    disabled = false,
    helperText = "Files are processed locally.",
    className = ""
}) {
    // If not explicitly set, multiple is true if onFilesSelected is provided, 
    // or false if only onFileSelect is provided. Default to true if neither or both.
    const isMultiple = multiple !== undefined ? multiple : (onFilesSelected ? true : !onFileSelect);
    const inputRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            if (onFileSelect && !isMultiple) {
                onFileSelect(e.dataTransfer.files[0]);
            } else if (onFilesSelected) {
                onFilesSelected(e.dataTransfer.files);
            }
        }
    };

    const handleClick = () => {
        if (!disabled) inputRef.current?.click();
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            if (onFileSelect && !isMultiple) {
                onFileSelect(e.target.files[0]);
            } else if (onFilesSelected) {
                onFilesSelected(e.target.files);
            }
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Helper Text - First Time Guidance */}
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center animate-fade-in">
                {helperText}
            </p>

            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all group relative cursor-pointer
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isDragOver
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 scale-[1.01] shadow-lg'
                        : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md'
                    }
                `}
            >
                {/* Privacy Badge overlaid nicely */}
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-full text-[10px] font-semibold text-green-700 dark:text-green-400">
                    <Lock size={10} />
                    <span>Private</span>
                </div>

                <div className="flex flex-col items-center justify-center gap-4">
                    {/* Compact Icon & Text Group */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-sm">
                            <CloudUpload size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white hidden sm:block">
                            {label}
                        </h3>
                    </div>

                    {/* Prominent Upload Button */}
                    <button
                        type="button"
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <CloudUpload size={18} className="sm:hidden" />
                        <span>Select Files</span>
                    </button>

                    {/* Mobile Text */}
                    <p className="sm:hidden text-sm text-gray-500">Tap to select or drag files</p>

                    {/* Clear Limits & Info - Very Compact */}
                    <div className="text-xs text-gray-400 dark:text-slate-500">
                        {isMultiple ? `Up to ${maxFiles} files` : 'Select a file'} {accept ? `(${accept.replace(/,\s*/g, ', ').replace(/application\//g, '.')})` : ''} • Max {LIMITS.PDF_MAX_SIZE_MB}MB
                    </div>
                </div>

                {disabled && (
                    <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 animate-fade-in">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <CloudUpload className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Uploading...</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Processing your file</p>
                            </div>
                        </div>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    multiple={isMultiple}
                    accept={accept}
                    className="hidden"
                    onChange={handleChange}
                    disabled={disabled}
                    value=""
                />
            </div>
        </div>
    );
}
