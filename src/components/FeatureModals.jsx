
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function UnderDevelopmentModal({ isOpen, onClose }) {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here we would send to backend, for now console log
        console.log("Email captured:", email);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setEmail('');
            onClose();
        }, 2000);
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center border border-gray-100 dark:border-slate-700 animate-scale-in">
                <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg rotate-12">
                    <i className="fa-solid fa-rocket text-2xl text-white"></i>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Feature Under Development</h3>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    This feature requires advanced cloud processing and is coming soon.
                    We’re building fast, privacy-first tools every day.
                </p>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Get notified when it's ready:
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                required
                                placeholder="Enter your email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors">
                                Notify Me
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">No spam. Unsubscribe anytime.</p>
                    </form>
                ) : (
                    <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-400 font-bold">
                        <i className="fa-solid fa-check-circle mr-2"></i> You're on the list!
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg"
                >
                    Got it
                </button>
            </div>
        </div>,
        document.body
    );
}

export function LimitedFeatureModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center border border-gray-100 dark:border-slate-700 animate-scale-in">
                <div className="w-16 h-16 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <i className="fa-solid fa-cloud-arrow-up text-2xl text-white"></i>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Limit Exceeded</h3>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                    This browser-optimized tool supports files up to 5MB and 50 pages.
                    For larger files, robust cloud processing is required (Coming Soon).
                </p>

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg"
                >
                    Close
                </button>
            </div>
        </div>,
        document.body
    );
}
