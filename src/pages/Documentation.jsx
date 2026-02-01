
import React from 'react';
import { SEO } from '../components/SEO';
import {
    FileText,
    Shield,
    Zap,
    Code,
    Image as ImageIcon,
    Database,
    Smartphone,
    Layers,
    Lock
} from 'lucide-react';

export function Documentation() {
    return (
        <div className="pt-32 pb-20 px-4 min-h-screen">
            <SEO
                title="Services & Documentation - EasyConvert"
                description="Detailed documentation of EasyConvert services, features, and functionality. Learn how our secure, client-side tools work."
                keywords="EasyConvert Documentation, PDF Tools User Guide, Developer Tools Help, Features, Privacy, Security"
            />

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
                        Product Documentation & Services
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        A comprehensive guide to EasyConvert functionality, security architecture, and available services.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Core Architecture */}
                    <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Shield className="text-green-500" />
                                Security & Architecture
                            </h2>
                        </div>
                        <div className="p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Client-Side Processing</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                    Unlike traditional online tools that upload your files to a remote server, EasyConvert is built with a
                                    <strong> privacy-first architecture</strong>. All file processing (PDF manipulation, image resizing, data conversion)
                                    happens directly within your web browser using WebAssembly and modern JavaScript APIs.
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        "No file uploads to servers",
                                        "Zero risk of data breaches",
                                        "Works offline after loading",
                                        "Instant processing with no queue"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                        <Lock className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">End-to-End Privacy</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Your data never leaves your device</div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    We utilize technologies like PDF.js and browser-native Canvas API to ensure that even complex operations
                                    like merging PDFs or converting images are handled locally by your device's CPU.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Services Breakdown */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* PDF Tools */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 p-8">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-6">
                                <FileText className="text-red-600 dark:text-red-400" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">PDF Services</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                                Comprehensive PDF manipulation suite without the subscription costs.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <Zap className="w-4 h-4 text-amber-500 mt-0.5" />
                                    <span><strong>Modification:</strong> Merge, Split, Rotate, Compress</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <Zap className="w-4 h-4 text-amber-500 mt-0.5" />
                                    <span><strong>Conversion:</strong> PDF to Word, Excel, JPG, JSON</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <Zap className="w-4 h-4 text-amber-500 mt-0.5" />
                                    <span><strong>Security:</strong> Sign, Unlock, Protect files</span>
                                </li>
                            </ul>
                        </div>

                        {/* Developer Tools */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 p-8">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-6">
                                <Code className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Developer Tools</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                                Essential utilities for software engineers and systems administrators.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <Zap className="w-4 h-4 text-indigo-500 mt-0.5" />
                                    <span><strong>Formatters:</strong> JSON, XML, SQL, YAML</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <Zap className="w-4 h-4 text-indigo-500 mt-0.5" />
                                    <span><strong>Networking:</strong> IP/Subnet Calc, CIDR Tools</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <Zap className="w-4 h-4 text-indigo-500 mt-0.5" />
                                    <span><strong>Generators:</strong> UUID, Random Data, Hashes</span>
                                </li>
                            </ul>
                        </div>

                        {/* Data & Excel */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 p-8">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-6">
                                <Database className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Data Services</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                                Powerful data cleaning and conversion specifically for Excel and CSV files.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <Zap className="w-4 h-4 text-green-500 mt-0.5" />
                                    <span><strong>Cleaning:</strong> Remove duplicates, normalize headers</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <Zap className="w-4 h-4 text-green-500 mt-0.5" />
                                    <span><strong>Analysis:</strong> Formula explainer, Data filter</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <Zap className="w-4 h-4 text-green-500 mt-0.5" />
                                    <span><strong>Conversion:</strong> Excel to JSON/SQL/PDF</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Technical Specs / How it Works */}
                    <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Layers className="text-purple-500" />
                                How It Works
                            </h2>
                        </div>
                        <div className="p-8 md:p-10">
                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center font-bold text-purple-600 dark:text-purple-400 text-xl">1</div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Select Your Tool</h4>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Choose from over 50+ available tools. Whether you need to merge PDFs, format JSON, or clean an Excel file,
                                            our intuitive navigation helps you find the right utility instantly.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center font-bold text-purple-600 dark:text-purple-400 text-xl">2</div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Process Locally</h4>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Drag and drop your files. The browser immediately begins processing the data using allocated memory.
                                            Large files are handled efficiently using stream processing or chunking where applicable, ensuring the browser doesn't freeze.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center font-bold text-purple-600 dark:text-purple-400 text-xl">3</div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Download Results</h4>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Once processing is complete, the resulting file is generated as a Blob URL directly in your browser.
                                            You can download it immediately. No email required, no sign-up, and no wait times.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: <Zap size={20} />, title: "Lightning Fast", desc: "No server latency. Immediate processing." },
                            { icon: <Shield size={20} />, title: "100% Private", desc: "Files never leave your machine." },
                            { icon: <Smartphone size={20} />, title: "Mobile Ready", desc: "Fully optimized for phones & tablets." },
                            { icon: <ImageIcon size={20} />, title: "No Quality Loss", desc: "Smart compression algorithms." }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                <div className="text-blue-600 dark:text-blue-400 mb-3">{feature.icon}</div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
