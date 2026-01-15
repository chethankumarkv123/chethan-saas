import { Link } from 'react-router-dom';
import { Twitter, Github, Mail, Globe, Coffee } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-slate-800 pt-16 pb-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <img
                                src="/logo.png"
                                alt="EasyConvert"
                                className="h-8 w-auto"
                            />
                            <span className="font-bold text-xl text-slate-900 dark:text-white">EasyConvert</span>
                        </div>
                        <p className="text-sm leading-relaxed mb-6 text-gray-500 dark:text-gray-400">
                            Built for developers & everyday users. Fast, secure, and free online tools for everyone.
                            Processed locally in your browser.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 dark:hover:text-blue-400 rounded-full transition-all">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-slate-800 dark:hover:text-white rounded-full transition-all">
                                <Github size={18} />
                            </a>
                            <a href="mailto:hello@easyconvert.com" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 dark:hover:text-red-400 rounded-full transition-all">
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-wider">Popular Tools</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/merge-pdf" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Merge PDF</Link></li>
                            <li><Link to="/split-pdf" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Split PDF</Link></li>
                            <li><Link to="/pdf-to-word" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">PDF to Word</Link></li>
                            <li><Link to="/json-formatter" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">JSON Formatter</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-wider">Company</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</Link></li>
                            <li><Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-wider">Support</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQ</Link></li>
                            <li><Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Report Issue</Link></li>
                            <li>
                                <a
                                    href="https://www.buymeacoffee.com/chethan"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-bold hover:underline"
                                >
                                    <Coffee size={14} /> Buy me a coffee
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-500">
                    <p>&copy; {new Date().getFullYear()} EasyConvert. All rights reserved.</p>
                    <div className="mt-4 md:mt-0 flex gap-6 items-center">
                        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                            <Globe size={14} />
                            <span>English</span>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
