
import { useState } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { toast } from '../../components/Toast';

const CopyButton = ({ text }) => (
    <button
        onClick={() => {
            navigator.clipboard.writeText(text);
            toast.success("Copied!");
        }}
        className="absolute top-2 right-2 p-1.5 text-xs font-bold bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
    >
        Copy
    </button>
);

const TextArea = ({ value, onChange, placeholder, readOnly = false }) => (
    <div className="relative group">
        <textarea
            className={`w-full h-48 p-4 border rounded-xl dark:bg-slate-900 dark:border-slate-600 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all ${readOnly ? 'bg-gray-50 dark:bg-slate-800 text-gray-600' : 'bg-white'}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            readOnly={readOnly}
            spellCheck="false"
        ></textarea>
        {value && <CopyButton text={value} />}
    </div>
);

export function Base64Tool() {
    const [text, setText] = useState("");
    const [base64, setBase64] = useState("");

    const toBase64 = (str) => {
        try {
            return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
                return String.fromCharCode('0x' + p1);
            }));
        } catch (e) {
            return "Error encoding";
        }
    };

    const fromBase64 = (str) => {
        try {
            return decodeURIComponent(Array.prototype.map.call(window.atob(str), (c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        } catch (e) {
            return "Invalid Base64 string";
        }
    };

    const handleText = (val) => {
        setText(val);
        setBase64(toBase64(val));
    };

    const handleBase64 = (val) => {
        setBase64(val);
        setText(fromBase64(val));
    };

    return (
        <DevToolLayout featureKey="base64">
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Plain Text</label>
                    <TextArea value={text} onChange={handleText} placeholder="Type text here..." />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Base64 Output</label>
                    <TextArea value={base64} onChange={handleBase64} placeholder="Base64 output..." />
                </div>
            </div>
        </DevToolLayout>
    );
}

export function UrlEncoder() {
    const [input, setInput] = useState("");
    const [encoded, setEncoded] = useState("");

    const update = (val) => {
        setInput(val);
        setEncoded(encodeURIComponent(val).replace(/'/g, "%27"));
    };

    const updateDec = (val) => {
        setEncoded(val);
        try {
            setInput(decodeURIComponent(val));
        } catch {
            setInput("Invalid URL encoding");
        }
    };

    return (
        <DevToolLayout featureKey="urlEncoder">
            <div className="space-y-6 max-w-3xl mx-auto">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Decoded URL</label>
                    <TextArea value={input} onChange={update} placeholder="https://example.com/search?q=hello world" />
                </div>
                <div className="flex justify-center -my-2 relative z-10">
                    <div className="bg-gray-100 dark:bg-slate-700 rounded-full p-2 border border-gray-200 dark:border-slate-600">
                        <i className="fa-solid fa-arrow-down-up text-gray-400"></i>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Encoded URL</label>
                    <TextArea value={encoded} onChange={updateDec} placeholder="https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world" />
                </div>
            </div>
        </DevToolLayout>
    );
}

export function HtmlEncoder() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");

    const encode = (str) => {
        return str.replace(/[\u00A0-\u9999<>\&]/g, (i) => '&#' + i.charCodeAt(0) + ';');
    };

    const decode = (str) => {
        const txt = document.createElement("textarea");
        txt.innerHTML = str;
        return txt.value;
    };

    const updateInput = (val) => {
        setInput(val);
        setOutput(encode(val));
    };

    return (
        <DevToolLayout featureKey="htmlEncoder">
            <div className="space-y-6 max-w-3xl mx-auto">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Raw HTML</label>
                    <TextArea value={input} onChange={updateInput} placeholder="<div class='test'>&</div>" />
                </div>
                <div className="flex justify-center -my-2 relative z-10">
                    <div className="bg-gray-100 dark:bg-slate-700 rounded-full p-2 border border-gray-200 dark:border-slate-600">
                        <i className="fa-solid fa-arrow-down text-gray-400"></i>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Encoded Entities</label>
                    <TextArea value={output} readOnly placeholder="&#60;div class='test'&#62;&#38;&#60;/div&#62;" />
                </div>
            </div>
        </DevToolLayout>
    );
}
