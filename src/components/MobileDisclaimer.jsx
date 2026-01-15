import { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';

export function MobileDisclaimer() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            if (window.innerWidth < 768 && !sessionStorage.getItem('mobile_disclaimer_dismissed')) {
                setIsVisible(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const dismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('mobile_disclaimer_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in-up">
            <div className="bg-slate-900/95 dark:bg-white/95 backdrop-blur-md text-white dark:text-slate-900 p-4 rounded-xl shadow-2xl flex items-start gap-3 border border-slate-700/50 dark:border-slate-200/50">
                <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
                    <Monitor size={18} className="text-blue-400 dark:text-blue-600" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-sm mb-1">Desktop Recommended</p>
                    <p className="text-xs text-gray-300 dark:text-gray-600 leading-relaxed">
                        Advanced PDF processing is heavy. For the fastest experience, use a computer.
                    </p>
                </div>
                <button
                    onClick={dismiss}
                    className="p-1 hover:bg-white/10 dark:hover:bg-black/10 rounded-full transition-colors"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>
    );
}
