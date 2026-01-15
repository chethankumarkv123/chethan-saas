export function Disclaimer() {
    return (
        <div className="pt-32 pb-20 px-4 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">Disclaimer</h1>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6 text-gray-600 dark:text-gray-300">
                    <p>
                        The tools provided on <strong>EasyConvert</strong> are provided "as is" without warranty of any kind, express or implied.
                    </p>
                    <p>
                        <strong>Data Privacy:</strong> All file processing is performed locally in your web browser. We do not store, view, or upload your files to any server. Your privacy is paramount.
                    </p>
                    <p>
                        <strong>Usage:</strong> You are responsible for the files you process using our tools. Please ensure you have the right to modify or convert the documents you upload.
                    </p>
                    <p>
                        <strong>Accuracy:</strong> While we strive for perfection, conversion results (such as PDF to Word or Excel) may not always preserve 100% of the original formatting due to the complexity of file formats.
                    </p>
                    <p>
                        By using this website, you agree to these terms.
                    </p>
                </div>
            </div>
        </div>
    );
}
