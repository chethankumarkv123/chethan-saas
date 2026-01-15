
import { SEO } from '../components/SEO';

export function About() {
    return (
        <div className="pt-32 pb-20 px-4 min-h-screen">
            <SEO
                title="About Chethan - Product-Focused Software Builder"
                description="I am a software builder working on SaaS platforms, AI systems, and lead-gen solutions. Helping startups with dashboards, CRMs, and automation."
                keywords="Chethan, Software Builder, SaaS Developer, AI Automation, React Developer, Freelancer"
            />
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
                        About Me
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Hi, I’m Chethan. I simplify complex problems with code.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-8 md:p-12 space-y-8">

                        {/* Intro */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                The Builder
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                I am a product-focused software builder working on SaaS platforms, AI-powered systems, and modern web & mobile applications.
                                My focus isn't just on writing code, but on building systems that are robust, scalable, and intuitive.
                            </p>
                        </section>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Expertise */}
                            <section className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                        <i className="fa-solid fa-code text-xl"></i>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">What I Build</h3>
                                </div>
                                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                                    <li className="flex items-start gap-2">
                                        <i className="fa-solid fa-check text-blue-500 mt-1.5 flex-shrink-0"></i>
                                        <span>Dashboards, admin panels, and analytics systems</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-solid fa-check text-blue-500 mt-1.5 flex-shrink-0"></i>
                                        <span>Multi-tenant AI chatbot & RAG-based systems</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-solid fa-check text-blue-500 mt-1.5 flex-shrink-0"></i>
                                        <span>Web-to-mobile app migrations preserving logic</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Services */}
                            <section className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                        <i className="fa-solid fa-briefcase text-xl"></i>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">How I Help</h3>
                                </div>
                                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                                    <li className="flex items-start gap-2">
                                        <i className="fa-solid fa-arrow-right text-purple-500 mt-1.5 flex-shrink-0"></i>
                                        <span>Conversion-optimized landing pages</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-solid fa-arrow-right text-purple-500 mt-1.5 flex-shrink-0"></i>
                                        <span>Lead tracking dashboards & CRM integrations</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-solid fa-arrow-right text-purple-500 mt-1.5 flex-shrink-0"></i>
                                        <span>Automation for lead capture and follow-ups</span>
                                    </li>
                                </ul>
                            </section>
                        </div>

                        {/* Philosophy */}
                        <section className="pt-4 border-t border-gray-100 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                My Philosophy
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                I work as a freelancer and consultant helping startups and businesses.
                                I value <strong>simplicity, maintainability, and real business outcomes</strong> above all else.
                                I don't use buzzwords or fake metrics—I deliver results that matter.
                            </p>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
