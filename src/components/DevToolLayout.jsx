import { useNavigate } from "react-router-dom";
import { FEATURE_CONFIG } from "../config/FEATURE_CONFIG";
import { useSeo } from "../hooks/useSeo";
import { SeoContent } from "./SeoContent";

export function DevToolLayout({ children, featureKey, title, description }) {
    const navigate = useNavigate();
    const config = FEATURE_CONFIG.features[featureKey] || {};

    // Fallback to props if config is missing (legacy support)
    const pageTitle = title || config.title || "Tool";
    const pageDesc = description || config.desc || "A useful developer tool.";
    const seoTitle = config.seoTitle || `${pageTitle} - DevTools`;
    const seoDesc = config.seoDesc || `${pageDesc} Free online tool.`;

    const relatedKeys = config.related || [];

    // Apply SEO
    useSeo({ title: seoTitle, description: seoDesc });

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">

            {/* Breadcrumb / Back */}
            <button
                onClick={() => navigate('/')}
                className="mb-8 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors group text-sm font-medium"
            >
                <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i>
                Back to Tools
            </button>

            {/* Header */}
            <div className="text-center mb-12 animate-fade-in-up">
                <div className={`w-16 h-16 mx-auto mb-6 bg-${config.color || 'blue'}-50 dark:bg-${config.color || 'blue'}-900/20 rounded-2xl flex items-center justify-center`}>
                    <i className={`${config.icon || 'fa-solid fa-code'} text-3xl text-${config.color || 'blue'}-600 dark:text-${config.color || 'blue'}-400`}></i>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                    {pageTitle}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    {pageDesc}
                </p>
            </div>

            {/* Tool Area */}
            <div className={`mb-20 ${config.bg || ''}`}>
                {children}
            </div>

            {/* SEO Content Section (New) */}
            <SeoContent featureKey={featureKey} />

            {/* Related Tools (Keep existing logic simplified or integrate into SEO) */}
            {relatedKeys.length > 0 && (
                <div className="border-t border-gray-100 dark:border-slate-800 pt-12">
                    <h3 className="text-center text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">Related Tools</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {relatedKeys.map(k => {
                            const t = FEATURE_CONFIG.features[k];
                            if (!t) return null;
                            return (
                                <button
                                    key={k}
                                    onClick={() => navigate(t.to)}
                                    className="p-4 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all text-left bg-white dark:bg-slate-900"
                                >
                                    <div className={`text-${t.color}-500 mb-2`}><i className={t.icon}></i></div>
                                    <div className="font-bold text-gray-900 dark:text-white text-sm">{t.title}</div>
                                    <div className="text-xs text-gray-500 truncate">{t.desc}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
