import { Loader2 } from 'lucide-react';

export function ProcessingOverlay({ isProcessing, message = "Processing..." }) {
    if (!isProcessing) return null;

    return (
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-20 flex flex-col items-center justify-center rounded-3xl transition-all duration-300 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col items-center max-w-sm">
                <div className="relative mb-6">
                    <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
                    </div>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">{message}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Please do not close this tab</p>
                <div className="mt-4 flex gap-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}
