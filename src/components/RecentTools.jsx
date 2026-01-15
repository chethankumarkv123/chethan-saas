import { useState, useEffect } from 'react';
import { FEATURES } from '../config/FEATURE_CONFIG';
import { Link } from 'react-router-dom';
import { LIMITS } from '../config/LIMITS_CONFIG';

export function RecentTools() {
    const [recentTools, setRecentTools] = useState([]);

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('recent_tools') || '[]');
            setRecentTools(stored.filter(key => FEATURES[key]).slice(0, LIMITS.RECENT_TOOLS_COUNT));
        } catch (e) {
            console.error("Failed to load recent tools", e);
        }
    }, []);

    if (recentTools.length === 0) return null;

    return (
        <div className="mb-10 animate-fade-in">
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                Recently Used
            </h3>
            <div className="flex flex-wrap gap-3">
                {recentTools.map(key => {
                    const feature = FEATURES[key];
                    return (
                        <Link
                            key={key}
                            to={feature.to}
                            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all group"
                        >
                            <div className={`w-8 h-8 rounded-lg bg-${feature.color}-50 dark:bg-${feature.color}-900/20 flex items-center justify-center`}>
                                <i className={`${feature.icon} text-${feature.color}-500 dark:text-${feature.color}-400 text-sm`}></i>
                            </div>
                            <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
                                {feature.title}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export const addToRecentTools = (featureKey) => {
    try {
        const stored = JSON.parse(localStorage.getItem('recent_tools') || '[]');
        const updated = [featureKey, ...stored.filter(k => k !== featureKey)].slice(0, 5);
        localStorage.setItem('recent_tools', JSON.stringify(updated));
    } catch (e) {
        console.error("Failed to update recent tools", e);
    }
};
