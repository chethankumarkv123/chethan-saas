import { useState, useEffect, useRef } from 'react';
import { FeatureButton } from '../components/FeatureButton';
import { FEATURES, FEATURE_CATEGORIES } from '../config/FEATURE_CONFIG';
import { SEO } from '../components/SEO';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Zap, FileText, Command } from 'lucide-react';
import { RecentTools } from '../components/RecentTools';

export function Home() {
    const [searchTerm, setSearchTerm] = useState("");
    const searchInputRef = useRef(null);
    const navigate = useNavigate();

    // Keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const getFilteredFeatures = (categoryFeatures) => {
        return categoryFeatures
            .map(key => ({ key, feature: FEATURES[key] }))
            .filter(item => {
                if (!item.feature) return false;
                return (
                    item.feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.feature.desc.toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // If there's an exact match or similar logic, we can navigate. 
        // For now, just focus the tool list.
    };

    return (
        <>
            <SEO
                title="EasyConvert - Premium Free PDF & Developer Tools"
                description="Merge, split, compress PDF and use developer tools securely. Files processed locally in your browser. No signup required."
                keywords="pdf tools, merge pdf, split pdf, json formatter, local pdf processing, developer tools"
            />

            <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">

                {/* Hero Section - Aggressively Compact */}
                <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-transparent dark:from-slate-800/20 dark:to-transparent pointer-events-none" />

                    {/* Compact Padding */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8 lg:pt-32 lg:pb-10 relative z-10">
                        <div className="text-center max-w-3xl mx-auto">

                            {/* Trust Badge - Tight */}
                            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 mb-4 rounded-full bg-blue-50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700/50 text-blue-700 dark:text-blue-400 animate-fade-in-up">
                                <Shield size={12} className="fill-blue-100 dark:fill-blue-900/20" />
                                <span className="text-[10px] font-bold tracking-wide uppercase">100% Client-side Processing</span>
                            </div>

                            {/* Headline - Compact & Tight */}
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight leading-tight">
                                <span className="block mb-1">Every tool you need</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                    in one secure place.
                                </span>
                            </h1>

                            {/* Subtext - Reduced */}
                            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-6 max-w-xl mx-auto font-light leading-snug">
                                Merge, split, and convert files instantly.
                                <span className="hidden sm:inline"> Fast, private, and free forever.</span>
                            </p>

                            {/* Search & Actions - Compact Gap */}
                            <div className="flex flex-col items-center gap-4 w-full animate-fade-in-up delay-100">

                                {/* Search Bar - Slimmer */}
                                <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className="block w-full pl-10 pr-10 py-3 rounded-xl bg-white dark:bg-slate-800 shadow-lg shadow-blue-900/5 border border-gray-200 dark:border-slate-700 text-base placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                        placeholder="Search tools (e.g. merge, json, split)..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-[10px] text-gray-500 dark:text-gray-400 font-bold border border-gray-200 dark:border-slate-600">
                                            <Command size={8} />
                                            <span>K</span>
                                        </div>
                                    </div>
                                </form>

                                {/* Helper Text */}
                                {searchTerm && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 animate-fade-in">
                                        Results for <span className="font-semibold text-gray-900 dark:text-white">"{searchTerm}"</span>
                                    </p>
                                )}

                                {/* Primary Quick Actions - Slimmer */}
                                {!searchTerm && (
                                    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                                        <Link
                                            to="/merge-pdf"
                                            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            <FileText size={16} />
                                            <span>Merge PDF</span>
                                        </Link>
                                        <Link
                                            to="/split-pdf"
                                            className="w-full sm:w-auto px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Zap size={16} className="text-orange-500" />
                                            <span>Split PDF</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tools Grid Section - Tighter */}
                <div id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                    {/* Recent Tools */}
                    {!searchTerm && <RecentTools />}

                    {FEATURE_CATEGORIES.map(category => {
                        const features = getFilteredFeatures(category.features);
                        if (features.length === 0) return null;

                        return (
                            <div key={category.id} id={category.id} className="mb-8 last:mb-0">
                                <div className="flex items-center gap-3 mb-4">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {category.label.split('–')[0].trim()}
                                    </h2>
                                    <div className="h-px bg-gray-200 dark:bg-slate-800 flex-grow mt-1"></div>
                                    <span className="hidden sm:inline-block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                                        {category.id === 'core_tools' && 'Everyday Utilities'}
                                        {category.id === 'pdf_tools' && 'PDF Management'}
                                        {category.id === 'user_tools' && 'User Tools'}
                                        {category.id === 'developer_tools' && 'Developer Utils'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                    {features.map((featureObj, idx) => (
                                        <FeatureButton
                                            key={featureObj.key}
                                            featureKey={featureObj.key}
                                            config={featureObj.feature}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
