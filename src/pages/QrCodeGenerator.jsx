
import { useState, useRef } from 'react';
import { SEO } from '../components/SEO';
import { TrustBar } from '../components/TrustBar';
import { RelatedTools } from '../components/RelatedTools';
import { SeoContent } from '../components/SeoContent';
import { FEATURES } from '../config/FEATURE_CONFIG';
import { toast } from '../components/Toast';
import { QRCodeCanvas } from 'qrcode.react';

export function QrCodeGenerator() {
    const feature = FEATURES.qrCode;

    // Core State
    const [mode, setMode] = useState('text'); // text, wifi, email
    const [finalValue, setFinalValue] = useState('');

    // Style State
    const [size, setSize] = useState(256);
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [logo, setLogo] = useState(null);

    // Input States
    const [textInput, setTextInput] = useState('');
    const [wifiSSID, setWifiSSID] = useState('');
    const [wifiPass, setWifiPass] = useState('');
    const [wifiType, setWifiType] = useState('WPA');
    const [emailAddr, setEmailAddr] = useState('');
    const [emailSubjv, setEmailSubj] = useState('');

    // Handle Input Changes & Update QR Value
    const updateValue = (type, val1, val2, val3) => {
        if (type === 'text') {
            setFinalValue(val1);
        } else if (type === 'wifi') {
            const ssid = val1 || wifiSSID;
            const pass = val2 !== undefined ? val2 : wifiPass;
            const enc = val3 || wifiType;
            if (!ssid) { setFinalValue(''); return; }
            setFinalValue(`WIFI:S:${ssid};T:${enc};P:${pass};;`);
        } else if (type === 'email') {
            const mail = val1 || emailAddr;
            const subj = val2 !== undefined ? val2 : emailSubjv;
            if (!mail) { setFinalValue(''); return; }
            setFinalValue(`mailto:${mail}?subject=${encodeURIComponent(subj)}`);
        }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogo(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const downloadQr = () => {
        if (!finalValue) {
            toast.error("Enter content to generate QR code first");
            return;
        }
        const canvas = document.querySelector('#qr-preview-container canvas');
        if (canvas) {
            try {
                const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                let downloadLink = document.createElement("a");
                downloadLink.href = pngUrl;
                downloadLink.download = "qr-code.png";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                toast.success("QR Code downloaded!");
            } catch (err) {
                console.error(err);
                toast.error("Failed to save QR Code");
            }
        }
    };

    return (
        <div className="pt-20 pb-12 px-4 min-h-screen bg-gray-50 dark:bg-slate-900">
            <SEO
                title={feature.seoTitle}
                description={feature.seoDesc}
                keywords="qr code generator, wifi qr code, email qr code, logo qr code"
            />

            <div className="max-w-5xl mx-auto">
                {/* Header - Compact */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                </div>

                <div className="grid md:grid-cols-12 gap-6">

                    {/* LEFT COLUMN: Controls */}
                    <div className="md:col-span-7 space-y-4">

                        {/* 1. Mode Tabs - Compact */}
                        <div className="bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex">
                            <button
                                onClick={() => { setMode('text'); setFinalValue(textInput); }}
                                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'text' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <i className="fa-solid fa-link mr-2"></i> URL / Text
                            </button>
                            <button
                                onClick={() => { setMode('wifi'); updateValue('wifi', wifiSSID, wifiPass, wifiType); }}
                                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'wifi' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <i className="fa-solid fa-wifi mr-2"></i> Wi-Fi
                            </button>
                            <button
                                onClick={() => { setMode('email'); updateValue('email', emailAddr, emailSubjv); }}
                                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'email' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <i className="fa-solid fa-envelope mr-2"></i> Email
                            </button>
                        </div>

                        {/* 2. Inputs based on Mode */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 p-5">

                            {mode === 'text' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Website URL or Text</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 border border-gray-200 dark:border-slate-600 rounded-lg dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                        placeholder="https://example.com"
                                        value={textInput}
                                        onChange={e => { setTextInput(e.target.value); updateValue('text', e.target.value); }}
                                    />
                                </div>
                            )}

                            {mode === 'wifi' && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Network Name (SSID)</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 border border-gray-200 dark:border-slate-600 rounded-lg dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            placeholder="MyHomeWiFi"
                                            value={wifiSSID}
                                            onChange={e => { setWifiSSID(e.target.value); updateValue('wifi', e.target.value, undefined, undefined); }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Password</label>
                                            <input
                                                type="text"
                                                className="w-full p-2.5 border border-gray-200 dark:border-slate-600 rounded-lg dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                placeholder="secr3t"
                                                value={wifiPass}
                                                onChange={e => { setWifiPass(e.target.value); updateValue('wifi', undefined, e.target.value, undefined); }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Security</label>
                                            <select
                                                className="w-full p-2.5 border border-gray-200 dark:border-slate-600 rounded-lg dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                value={wifiType}
                                                onChange={e => { setWifiType(e.target.value); updateValue('wifi', undefined, undefined, e.target.value); }}
                                            >
                                                <option value="WPA">WPA/WPA2</option>
                                                <option value="WEP">WEP</option>
                                                <option value="nopass">No Password</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {mode === 'email' && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full p-2.5 border border-gray-200 dark:border-slate-600 rounded-lg dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            placeholder="contact@example.com"
                                            value={emailAddr}
                                            onChange={e => { setEmailAddr(e.target.value); updateValue('email', e.target.value, undefined); }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Subject</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 border border-gray-200 dark:border-slate-600 rounded-lg dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            placeholder="Inquiry"
                                            value={emailSubjv}
                                            onChange={e => { setEmailSubj(e.target.value); updateValue('email', undefined, e.target.value); }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Appearance Options - Collapsible-style dense */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 p-5">
                            <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">Customization</h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Color</label>
                                    <div className="flex items-center border border-gray-200 dark:border-slate-600 rounded-lg p-1 dark:bg-slate-900 h-9">
                                        <input type="color" className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0" value={fgColor} onChange={e => setFgColor(e.target.value)} />
                                        <span className="ml-2 text-[10px] text-gray-500 mono flex-grow">{fgColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">BG Color</label>
                                    <div className="flex items-center border border-gray-200 dark:border-slate-600 rounded-lg p-1 dark:bg-slate-900 h-9">
                                        <input type="color" className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                                        <span className="ml-2 text-[10px] text-gray-500 mono flex-grow">{bgColor}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Logo (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                />
                            </div>

                            <button
                                onClick={downloadQr}
                                disabled={!finalValue}
                                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition transform active:scale-[0.98] text-sm ${finalValue ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25' : 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed'}`}
                            >
                                <i className="fa-solid fa-download mr-2"></i> Download PNG
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Preview - Sticky */}
                    <div className="md:col-span-5">
                        <div className="sticky top-24">
                            <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 p-6 min-h-[350px]">
                                <div id="qr-preview-container" className="bg-white p-4 shadow-xl rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105">
                                    {finalValue ? (
                                        <QRCodeCanvas
                                            value={finalValue}
                                            size={size}
                                            fgColor={fgColor}
                                            bgColor={bgColor}
                                            level={"H"}
                                            includeMargin={true}
                                            imageSettings={logo ? {
                                                src: logo,
                                                x: undefined,
                                                y: undefined,
                                                height: size * 0.2,
                                                width: size * 0.2,
                                                excavate: true,
                                            } : undefined}
                                            style={{ width: '100%', height: 'auto', maxWidth: '220px', maxHeight: '220px' }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-300 py-8">
                                            <i className="fa-solid fa-qrcode text-5xl opacity-30 mb-3"></i>
                                            <span className="text-xs font-medium">Enter details to generate</span>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-6 text-xs text-gray-400 font-medium">
                                    <i className="fa-solid fa-eye mr-1"></i> Live Preview
                                </p>
                            </div>

                            <div className="mt-4 bg-blue-50 dark:bg-slate-800/50 rounded-lg p-3 border border-blue-100 dark:border-slate-700">
                                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-1"><i className="fa-solid fa-lightbulb text-yellow-500 mr-1.5"></i>Tip</h4>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    {mode === 'wifi' && "Guests can scan to join Wi-Fi instantly."}
                                    {mode === 'email' && "Opens email app with pre-filled details."}
                                    {mode === 'text' && "Customize with your brand logo."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <RelatedTools toolKeys={feature.related} />
                    <SeoContent feature={feature} />
                </div>
            </div>
        </div>
    );
}
