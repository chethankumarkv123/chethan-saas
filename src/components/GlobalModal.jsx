import { useUI } from '../context/UIContext';
import { X } from 'lucide-react';

export function GlobalModal() {
    const { modalState, closeModal } = useUI();
    if (!modalState.isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in relative border border-gray-100 dark:border-slate-700">
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <X size={24} />
                </button>

                <h3 className={`text-xl font-bold mb-4 ${modalState.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-primary-600 dark:text-primary-400'}`}>
                    {modalState.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {modalState.message}
                </p>

                <button
                    onClick={closeModal}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-colors"
                >
                    Got it
                </button>
            </div>
        </div>
    );
}
