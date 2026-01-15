import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, ShieldCheck } from 'lucide-react';

export function Navbar() {
    const [isDark, setIsDark] = useState(() => {
        // Check for SSR in case of SSG, though this is SPA
        if (typeof window !== 'undefined') {
            return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const html = document.documentElement;
        if (isDark) {
            html.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            html.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    const navLinkClass = (path) => `
        font-medium transition-all duration-200 
        ${location.pathname === path
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
        }
    `;

    return (
        <nav className="glass-nav fixed w-full z-50 transition-all duration-300 border-b border-gray-100 dark:border-slate-800 backdrop-blur-md bg-white/70 dark:bg-slate-900/80 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo & Privacy Badge */}
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
                                <i className="fa-solid fa-file-pdf"></i>
                            </div>
                            <span className="font-bold text-2xl text-slate-800 dark:text-white tracking-tight">
                                EasyConvert
                            </span>
                        </Link>

                        {/* Desktop Only Privacy Badge */}
                        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-full">
                            <ShieldCheck size={14} className="text-green-600 dark:text-green-400" />
                            <span className="text-xs font-semibold text-green-700 dark:text-green-400">Privacy-first</span>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="/#tools" className={navLinkClass('/#tools')}>Tools</a>
                        <Link to="/about" className={navLinkClass('/about')}>About</Link>
                        <Link to="/contact" className={navLinkClass('/contact')}>Contact</Link>

                        <div className="h-6 w-px bg-gray-200 dark:bg-slate-700"></div>

                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                            aria-label="Toggle Dark Mode"
                        >
                            {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                        </button>
                    </div>

                    {/* Mobile Menu Btn */}
                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-300 focus:outline-none hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                            {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                        </button>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600 dark:text-white focus:outline-none hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 absolute w-full shadow-xl">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <a href="/#tools" className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50">All Tools</a>
                        <Link to="/about" className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50">About Us</Link>
                        <Link to="/contact" className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50">Contact</Link>
                        <div className="px-3 py-3 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-400">Files processed locally. 100% Private.</span>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
