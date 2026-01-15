
export function TrustBar() {
    return (
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8 text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 py-3 px-6 rounded-full inline-flex mx-auto border border-gray-100 dark:border-slate-700">
            <span className="flex items-center gap-2">
                <i className="fa-solid fa-user-shield text-green-500"></i> No signup required
            </span>
            <span className="flex items-center gap-2">
                <i className="fa-solid fa-lock text-blue-500"></i> Privacy-first processing
            </span>
            <span className="flex items-center gap-2">
                <i className="fa-solid fa-server text-purple-500"></i> Files processed with strict limits
            </span>
        </div>
    );
}

export function MobileWarningBanner() {
    return (
        <div className="fixed top-20 left-0 w-full z-40 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700 px-4 py-3 backdrop-blur-sm animate-fade-in shadow-sm md:hidden">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <i className="fa-solid fa-triangle-exclamation text-amber-600 dark:text-amber-500"></i>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Best experienced on desktop
                    </p>
                </div>
            </div>
        </div>
    );
}
