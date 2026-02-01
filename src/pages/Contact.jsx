import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Calendar, MessageSquare, Building2, ArrowRight } from 'lucide-react';

export function Contact() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inquiryType, setInquiryType] = useState('support');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.target);

        // Web3Forms Access Key
        formData.append("access_key", "af42304f-69c8-410b-9954-4b066c70a102");

        // Add custom subject based on selection
        const subjectMap = {
            support: "General Support Request",
            enterprise: "Enterprise Sales Inquiry",
            demo: "Demo Request",
            bug: "Bug Report"
        };
        formData.append("subject", subjectMap[inquiryType] || "Contact Form Submission");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Message sent successfully!");
                e.target.reset();
            } else {
                toast.error(data.message || "Something went wrong.");
            }
        } catch (error) {
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pt-32 pb-20 px-4 min-h-screen bg-gray-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Get in Touch</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Whether you're a developer, a startup, or a large enterprise, we're here to help you scale.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Contact Options */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Book a Slot Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl transform hover:-translate-y-1 transition-transform">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold">Book a Slot</h3>
                            </div>
                            <p className="text-blue-100 mb-6 text-sm leading-relaxed">
                                Interested in an Enterprise plan? Schedule a 15-min discovery call with our product experts.
                            </p>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); toast.success("Calendar integration coming soon!"); }}
                                className="block w-full py-3 bg-white text-blue-600 font-bold text-center rounded-xl hover:bg-blue-50 transition shadow-sm"
                            >
                                Schedule Meeting
                            </a>
                        </div>

                        {/* Quick Info */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Direct Channels</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <Mail size={18} className="text-blue-500" />
                                    <span>hello@odinext.com</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <MessageSquare size={18} className="text-purple-500" />
                                    <span>Live Chat (9am - 5pm EST)</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <Building2 size={18} className="text-gray-500" />
                                    <span>Bangalore, India</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Hidden Spam Prevention */}
                                <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

                                {/* Inquiry Type Pills */}
                                <div>
                                    <label className="block text-sm font-medium mb-3 dark:text-gray-300">I am interested in...</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { id: 'support', label: 'Support', icon: MessageSquare },
                                            { id: 'enterprise', label: 'Enterprise', icon: Building2 },
                                            { id: 'demo', label: 'Book Demo', icon: Calendar },
                                            { id: 'bug', label: 'Report Bug', icon: Mail }
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setInquiryType(type.id)}
                                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium ${inquiryType === type.id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500'
                                                    : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                <type.icon size={20} />
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                    <input type="hidden" name="inquiry_type" value={inquiryType} />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="Chethan"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">Work Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="w-full p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="name@company.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Message</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={1}
                                        onInput={(e) => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                        className="w-full p-4 min-h-[3.5rem] border rounded-xl dark:bg-slate-900 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none overflow-hidden"
                                        placeholder={inquiryType === 'enterprise' ? "Tell us about your team size and requirements..." : "How can we help you today?"}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-70 transition transform active:scale-[0.99] flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Sending Request...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Submit Request</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
