import { Coffee, Heart } from 'lucide-react';

export function CoffeeBadge() {
    return (
        <a
            href="https://www.buymeacoffee.com/chethan"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 bg-white dark:bg-slate-800 p-2 pr-6 rounded-full shadow-2xl border border-amber-100 dark:border-amber-900/30 hover:scale-105 transition-all duration-300 hidden md:flex"
        >
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-inner group-hover:rotate-12 transition-transform">
                <Coffee size={20} />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 flex items-center gap-1">
                    Support Me <Heart size={10} className="fill-current" />
                </span>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">Buy me a coffee</span>
            </div>
        </a>
    );
}
