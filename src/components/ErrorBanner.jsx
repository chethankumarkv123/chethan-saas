import { XCircle, X } from 'lucide-react';

export function ErrorBanner({ errors, onClear }) {
    if (!errors || errors.length === 0) return null;

    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-start gap-3 animate-fade-in">
            <XCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
                <h4 className="text-red-800 dark:text-red-300 font-semibold text-sm mb-1">There were issues with your submission:</h4>
                <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400 space-y-1">
                    {errors.map((err, i) => (
                        <li key={i}>{err}</li>
                    ))}
                </ul>
            </div>
            {onClear && (
                <button onClick={onClear} className="text-red-400 hover:text-red-600 dark:hover:text-red-200 transition-colors">
                    <X size={18} />
                </button>
            )}
        </div>
    );
}
