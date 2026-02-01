
import React, { useState } from 'react';
import {
    Key,
    Lock,
    Download,
    Copy,
    ShieldAlert,
    RefreshCw,
    Info,
    Eye,
    EyeOff
} from 'lucide-react';
import forge from 'node-forge';
import { SEO } from '../../components/SEO';
import toast from 'react-hot-toast';

export function SshGenerator() {
    const [algorithm, setAlgorithm] = useState('RSA');
    const [keySize, setKeySize] = useState('2048');
    const [passphrase, setPassphrase] = useState('');
    const [names, setNames] = useState('key');
    const [showPassphrase, setShowPassphrase] = useState(false);

    const [keys, setKeys] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [fingerprint, setFingerprint] = useState(null);

    const generateKeys = async () => {
        setIsGenerating(true);
        setKeys(null);
        setFingerprint(null);

        // Allow UI to update before blocking with heavy crypto
        setTimeout(() => {
            try {
                // Generate Key Pair
                const keypair = forge.pki.rsa.generateKeyPair({ bits: parseInt(keySize), workers: 2 });

                // Format Private Key (PEM)
                let privateKeyPem;
                if (passphrase) {
                    privateKeyPem = forge.pki.encryptRsaPrivateKey(keypair.privateKey, passphrase, {
                        algorithm: 'aes256', // standard encrypted PEM
                    });
                } else {
                    privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
                }

                // Format Public Key (OpenSSH)
                const publicKey = keypair.publicKey;
                const sshPublicKey = forge.ssh.publicKeyToOpenSSH(publicKey, names || "generated-key");

                setKeys({
                    private: privateKeyPem,
                    public: sshPublicKey
                });

                // Calculate Fingerprint (MD5 hex usually for legacy, or SHA256 base64)
                const md = forge.md.md5.create();
                md.update(forge.asn1.toDer(forge.pki.publicKeyToAsn1(publicKey)).getBytes());
                // OpenSSH fingerprints are usually calculated on the key blob, not ASN.1
                // forge.ssh.publicKeyToOpenSSH returns string "ssh-rsa AAAAB3..."
                // We need to base64 decode the middle part to get the blob
                const parts = sshPublicKey.split(' ');
                if (parts.length >= 2) {
                    const keyType = parts[0];
                    const keyBody = parts[1];
                    const blob = forge.util.decode64(keyBody);

                    // SHA256 Fingerprint
                    const sha256 = forge.md.sha256.create();
                    sha256.update(blob);
                    // Remove trailing = for standard display
                    const fingerprintSha256 = "SHA256:" + forge.util.encode64(sha256.digest().getBytes()).replace(/=+$/, '');

                    setFingerprint(fingerprintSha256);
                }

                toast.success("SSH Key Pair Generated Successfully");

            } catch (err) {
                console.error(err);
                toast.error("Failed to generate keys: " + err.message);
            } finally {
                setIsGenerating(false);
            }
        }, 100);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const downloadKey = (content, filename) => {
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto min-h-screen">
            <SEO
                title="SSH Key Generator - Online & Secure"
                description="Generate RSA SSH key pairs (2048/4096 bit) securely in your browser. Encrypt with passphrase and download OpenSSH format."
                keywords="ssh key generator, rsa key generator, online ssh keys, openssh generator, pem generator"
            />

            <div className="mb-8 text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
                    <Key className="text-blue-600 dark:text-blue-400" size={32} />
                    SSH Key Generator
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Generate secure SSH key pairs locally in your browser. <br />
                    <span className="font-semibold text-red-500">Private keys never leave your device.</span>
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <RefreshCw size={20} className="text-blue-500" /> Configuration
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Algorithm</label>
                                <select
                                    value={algorithm}
                                    onChange={(e) => setAlgorithm(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="RSA">RSA (Rivest–Shamir–Adleman)</option>
                                    {/* node-forge mainly supports RSA heavily. keeping it simple for reliability */}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Size (Bits)</label>
                                <select
                                    value={keySize}
                                    onChange={(e) => setKeySize(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="2048">2048 bits (Standard)</option>
                                    <option value="4096">4096 bits (High Security)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">4096 bits is slower to generate but more secure.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Passphrase (Optional)
                                    <span className="group relative ml-2 top-0.5 inline-block cursor-help">
                                        <Info size={14} className="text-gray-400" />
                                        <span className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded opacity-90 z-10">
                                            Encrypts your private key. You'll need to enter this every time you use the key.
                                        </span>
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassphrase ? "text" : "password"}
                                        value={passphrase}
                                        onChange={(e) => setPassphrase(e.target.value)}
                                        placeholder="Leave empty for no password"
                                        className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassphrase(!showPassphrase)}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        {showPassphrase ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Comment / Username</label>
                                <input
                                    type="text"
                                    value={names}
                                    onChange={(e) => setNames(e.target.value)}
                                    placeholder="user@host"
                                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <button
                                onClick={generateKeys}
                                disabled={isGenerating}
                                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${isGenerating
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/25 hover:-translate-y-0.5'
                                    }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Key size={18} /> Generate SSH Keys
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-2xl p-6">
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="text-orange-500 mt-1 flex-shrink-0" size={24} />
                            <div>
                                <h3 className="font-bold text-orange-800 dark:text-orange-400 text-sm mb-1">Security Notice</h3>
                                <p className="text-orange-700 dark:text-orange-300 text-xs leading-relaxed">
                                    These keys are generated entirely in your browser using JavaScript. No keys are ever sent to our servers.
                                    <br /><br />
                                    <strong>Recommendation:</strong> For production servers, it is always safest to generate keys locally on your own machine using `ssh-keygen`.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Output Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {keys ? (
                        <>
                            {/* Fingerprint */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Key Fingerprint (SHA256)</span>
                                <div className="font-mono text-sm text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10 px-3 py-2 rounded-lg break-all">
                                    {fingerprint}
                                </div>
                            </div>

                            {/* Private Key */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Lock size={16} className="text-red-500" />
                                        <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm">Private Key (PEM)</h3>
                                        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded font-medium">Keep Secret</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => copyToClipboard(keys.private)} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded text-gray-500 hover:text-blue-500 transition-colors" title="Copy">
                                            <Copy size={16} />
                                        </button>
                                        <button onClick={() => downloadKey(keys.private, 'id_rsa')} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded text-gray-500 hover:text-green-500 transition-colors" title="Download">
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <textarea
                                        readOnly
                                        value={keys.private}
                                        className="w-full h-64 p-4 font-mono text-xs bg-white dark:bg-slate-950 text-gray-600 dark:text-gray-300 resize-none outline-none leading-relaxed"
                                    />
                                </div>
                            </div>

                            {/* Public Key */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Key size={16} className="text-green-500" />
                                        <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm">Public Key (OpenSSH)</h3>
                                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded font-medium">Safe to Share</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => copyToClipboard(keys.public)} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded text-gray-500 hover:text-blue-500 transition-colors" title="Copy">
                                            <Copy size={16} />
                                        </button>
                                        <button onClick={() => downloadKey(keys.public, 'id_rsa.pub')} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded text-gray-500 hover:text-green-500 transition-colors" title="Download">
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <textarea
                                        readOnly
                                        value={keys.public}
                                        className="w-full h-32 p-4 font-mono text-xs bg-white dark:bg-slate-950 text-gray-600 dark:text-gray-300 resize-none outline-none leading-relaxed"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl text-gray-400 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Key size={32} className="opacity-20" />
                            </div>
                            <h3 className="font-bold text-gray-500 dark:text-gray-400 mb-2">Ready to Generate</h3>
                            <p className="text-sm max-w-sm mx-auto">
                                Configure your key parameters on the left and click "Generate SSH Keys" to create a new key pair.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
