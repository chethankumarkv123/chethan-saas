import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { UnderDevelopmentModal, LimitedFeatureModal } from './FeatureModals';

export function FeatureButton({ featureKey, config }) {
    const navigate = useNavigate();
    const [showDevModal, setShowDevModal] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);

    // Destructure config
    const { title, desc, icon, color, mode, badge, to } = config;

    // Simplified Color Styles - Harmonized Palette
    const colorMap = {
        primary: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
        red: "text-red-600 bg-red-50 dark:bg-red-900/20",
        purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
        orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
        green: "text-green-600 bg-green-50 dark:bg-green-900/20",
        teal: "text-teal-600 bg-teal-50 dark:bg-teal-900/20",
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
        pink: "text-pink-600 bg-pink-50 dark:bg-pink-900/20",
        yellow: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
        cyan: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20",
        indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
        emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
        gray: "text-gray-600 bg-gray-50 dark:bg-slate-800"
    };

    const iconStyle = colorMap[color] || colorMap.primary;

    const handleClick = (e) => {
        e.preventDefault();

        if (mode === 'under_development') {
            setShowDevModal(true);
            return;
        }
        if (mode === 'limited') {
            navigate(to);
            return;
        }
        if (mode === 'enabled') {
            navigate(to);
        }
    };

    return (
        <>
            <div
                onClick={handleClick}
                className={`
                    group relative flex flex-col p-6 h-full bg-white dark:bg-slate-800
                    border border-gray-200 dark:border-slate-700
                    rounded-xl shadow-sm
                    hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-900/50
                    transition-all duration-300 ease-out cursor-pointer
                    ${mode === 'under_development' ? 'opacity-70 grayscale-[0.5]' : ''}
                `}
            >
                {/* Header: Icon + Badge */}
                <div className="flex justify-between items-start mb-5">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-transform group-hover:scale-110 duration-300 ${iconStyle}`}>
                        <i className={icon}></i>
                    </div>
                </div>

                {/* Content */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {title}
                        </h3>
                        {/* Status Badge */}
                        {badge && (
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${mode === 'under_development'
                                ? 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-slate-700 dark:text-gray-400 dark:border-slate-600'
                                : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-800/50'
                                }`}>
                                {mode === 'under_development' ? 'Soon' : 'Lite'}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                        {desc}
                    </p>
                </div>
            </div>

            <UnderDevelopmentModal isOpen={showDevModal} onClose={() => setShowDevModal(false)} />
            <LimitedFeatureModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
        </>
    );
}
