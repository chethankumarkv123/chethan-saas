import { useState } from 'react';
import { DevToolLayout } from '../../components/DevToolLayout';
import { toast } from '../../components/Toast';

const CopyButton = ({ text }) => (
    <button
        onClick={() => {
            navigator.clipboard.writeText(text);
            toast.success("Copied!");
        }}
        className="absolute top-2 right-2 p-1.5 text-xs bg-gray-100 dark:bg-slate-700 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
    >
        Copy
    </button>
);

const TextArea = ({ value, onChange, placeholder, readOnly = false }) => (
    <div className="relative">
        <textarea
            className={`w-full h-40 p-3 border rounded-xl dark:bg-slate-900 dark:border-slate-600 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none ${readOnly ? 'bg-gray-50 dark:bg-slate-800' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            readOnly={readOnly}
        ></textarea>
        {value && <CopyButton text={value} />}
    </div>
);

export function Base64Tool() {
    const [text, setText] = useState("");
    const [base64, setBase64] = useState("");

    const handleText = (val) => {
        setText(val);
        try {
            setBase64(btoa(val));
        } catch {
            setBase64("Invalid input for Base64 encoding (check for special characters)");
        }
    };

    const handleBase64 = (val) => {
        setBase64(val);
        try {
            setText(atob(val));
        } catch {
            setText("Invalid Base64 string");
        }
    };

    return (
        <DevToolLayout featureKey="base64">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Plain Text</label>
                    <TextArea value={text} onChange={handleText} placeholder="Type text here..." />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Base64</label>
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
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Decoded URL</label>
                    <TextArea value={input} onChange={update} placeholder="https://example.com/search?q=hello world" />
                </div>
                <div className="flex justify-center">
                    <i className="fa-solid fa-arrow-down-up text-gray-400"></i>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Encoded URL</label>
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

    const updateOutput = (val) => {
        setOutput(val);
        setOutput(decode(val)); // This logic is circular in a simplified way, primarily 1-way tool for safety, but let's just make it encode primarily.
        // Let's actually separate Encode/Decode logic properly or just auto-detect? 
        // For simplicity: Top is Raw, Bottom is Encoded.
    };

    return (
        <DevToolLayout featureKey="htmlEncoder">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Raw HTML</label>
                    <TextArea value={input} onChange={updateInput} placeholder="<div class='test'>&</div>" />
                </div>
                <div className="flex justify-center gap-4">
                    <span className="text-xs text-gray-400">Type above to encode</span>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Encoded Entities</label>
                    <TextArea value={output} readOnly placeholder="&#60;div class='test'&#62;&#38;&#60;/div&#62;" />
                </div>
            </div>
        </DevToolLayout>
    );
}
