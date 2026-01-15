import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { FEATURES } from '../config/FEATURE_CONFIG';

export function BackLink() {
    const location = useLocation();

    // Pages where we DON'T want the back link
    const excludedPaths = ['/', '/about', '/contact', '/privacy-policy', '/disclaimer'];

    if (excludedPaths.includes(location.pathname)) {
        return null;
    }

    // Find the current feature and its category
    const currentFeature = Object.values(FEATURES).find(f => f.to === location.pathname);
    const backTarget = currentFeature?.category ? `/#${currentFeature.category}` : '/#tools';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 -mb-20 relative z-10 pointer-events-none">
            <Link
                to={backTarget}
                className="inline-flex items-center gap-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors group text-sm font-semibold pointer-events-auto"
            >
                <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                Back to Tools
            </Link>
        </div>
    );
}
