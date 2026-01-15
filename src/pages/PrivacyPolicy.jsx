export function PrivacyPolicy() {
    return (
        <div className="pt-32 pb-20 px-4 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">Privacy Policy</h1>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6 text-gray-600 dark:text-gray-300">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1. Data Handling</h2>
                    <p>
                        We take your privacy seriously. <strong>We do not collect, store, or share your uploaded files.</strong>
                        All file conversions and manipulations happen entirely within your web browser using client-side technologies (WebAssembly, JavaScript).
                        Your files never leave your device.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">2. Cookies</h2>
                    <p>
                        We use local storage only to remember your specialized settings (like dark mode preference). We do not use third-party tracking cookies.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">3. Third-Party Services</h2>
                    <p>
                        This website is hosted on static hosting providers. No backend servers process your data.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. Changes</h2>
                    <p>
                        We may update this policy from time to time. Continued use of the site implies acceptance of any changes.
                    </p>
                </div>
            </div>
        </div>
    );
}
