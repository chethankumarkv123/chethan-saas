import { Shield, Lock } from 'lucide-react';

/**
 * Privacy Badge Component
 * Displays clear privacy guarantees to users
 */
export function PrivacyBadge({ variant = 'default', className = '' }) {
    const variants = {
        default: {
            container: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/50',
            icon: 'text-green-600 dark:text-green-400',
            text: 'text-green-700 dark:text-green-400'
        },
        compact: {
            container: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/50',
            icon: 'text-green-600 dark:text-green-400',
            text: 'text-green-700 dark:text-green-400'
        },
        prominent: {
            container: 'bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800',
            icon: 'text-green-600 dark:text-green-400',
            text: 'text-gray-700 dark:text-gray-300'
        }
    };

    const style = variants[variant] || variants.default;

    if (variant === 'compact') {
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full ${style.container} ${className}`}>
                <Lock size={14} className={style.icon} />
                <span className={`text-xs font-semibold ${style.text}`}>
                    Privacy-first
                </span>
            </div>
        );
    }

    if (variant === 'prominent') {
        return (
            <div className={`p-4 border rounded-xl ${style.container} ${className}`}>
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <Shield className={style.icon} size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-white">
                            Your Privacy is Protected
                        </h4>
                        <ul className={`text-xs space-y-1 ${style.text}`}>
                            <li className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                                Files are processed locally in your browser
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                                No files are uploaded or stored on servers
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                                No signup or account required
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                                Data is cleared after processing
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // Default variant
    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg ${style.container} ${className}`}>
            <Lock size={16} className={style.icon} />
            <span className={`text-sm font-medium ${style.text}`}>
                Files processed locally - No uploads
            </span>
        </div>
    );
}
