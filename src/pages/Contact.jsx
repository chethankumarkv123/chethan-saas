export function Contact() {
    return (
        <div className="pt-32 pb-20 px-4 min-h-screen">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Contact Us</h1>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-left space-y-6">
                    <p className="text-lg text-gray-600 dark:text-gray-300 text-center">
                        Have questions, suggestions, or found a bug? We'd love to hear from you.
                    </p>

                    <form className="max-w-lg mx-auto space-y-6 pt-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Your Name</label>
                            <input type="text" className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Email Address</label>
                            <input type="email" className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700" placeholder="john@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Message</label>
                            <textarea className="w-full p-3 h-32 border rounded-xl dark:bg-slate-900 dark:border-slate-700" placeholder="How can we help?"></textarea>
                        </div>
                        <button type="submit" className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700 transition">
                            Send Message
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 pt-8">
                        Note: Since this is a demo application, this form does not actually send emails.
                        For real inquiries, please reach out to the developer directly.
                    </p>
                </div>
            </div>
        </div>
    );
}
