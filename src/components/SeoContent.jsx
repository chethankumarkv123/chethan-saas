import { getSeoConfig } from '../config/SEO_CONTENT';

export function SeoContent({ featureKey, extraTitle }) {
    const config = getSeoConfig(featureKey);
    const { toolName, description, useCases, steps, limitsText } = config;

    return (
        <section className="mt-24 pt-12 border-t border-gray-100 dark:border-slate-800 max-w-4xl mx-auto px-4 pb-20">
            <article className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                {/* 2. H1 */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">{toolName} Online</h1>

                {/* 3. What It Does */}
                <p className="text-lg leading-relaxed mb-8">
                    {description} This tool works directly in your browser, ensuring speed and privacy without needing to install software or upload files to a server.
                </p>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* 4. Use Cases */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <span className="text-blue-500">
                                <i className="fa-regular fa-lightbulb"></i>
                            </span>
                            When to use this?
                        </h2>
                        <ul className="space-y-3">
                            {useCases.map((use, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <i className="fa-solid fa-check text-green-500 mt-1.5 text-xs"></i>
                                    <span>{use}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 5. How It Works */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <span className="text-blue-500">
                                <i className="fa-solid fa-list-ol"></i>
                            </span>
                            How to use
                        </h2>
                        <ol className="space-y-3 list-decimal list-inside marker:text-blue-500 marker:font-bold">
                            {steps.map((step, i) => (
                                <li key={i} className="pl-2">
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>

                {/* 6. Limits */}
                <div className="mt-12 bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-200 mb-2">Limits & Privacy</h2>
                    <p className="mb-2">
                        {limitsText}
                    </p>
                    <p>
                        We prioritize your privacy. <strong>No files are stored on our servers.</strong> All processing happens locally in your browser or temporarily in secure memory, ensuring your data remains yours.
                    </p>
                </div>
            </article>
        </section>
    );
}
