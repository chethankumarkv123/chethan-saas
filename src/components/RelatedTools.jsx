import { Link } from 'react-router-dom';
import { FEATURES } from '../config/FEATURE_CONFIG';

export function RelatedTools({ toolKeys }) {
    if (!toolKeys || toolKeys.length === 0) return null;

    return (
        <div className="mt-16 border-t border-gray-100 dark:border-slate-700 pt-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Related Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {toolKeys.map(key => {
                    const feature = FEATURES[key];
                    if (!feature) return null;

                    return (
                        <Link
                            key={key}
                            to={feature.to}
                            className="group block bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-700 transition-all shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${feature.color === 'red' ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-500'}`}>
                                    <i className={feature.icon}></i>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {feature.title}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                {feature.desc}
                            </p>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
