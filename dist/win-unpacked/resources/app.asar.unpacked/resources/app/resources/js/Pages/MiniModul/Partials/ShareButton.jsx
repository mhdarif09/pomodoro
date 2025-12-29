import React, { useState, useEffect } from 'react';

// Icons dari Heroicons untuk UI generik (sudah benar)
import { ShareIcon, XMarkIcon, LinkIcon, CheckIcon } from '@heroicons/react/24/outline';

// Icons dari React Icons untuk logo brand (ini perbaikannya)
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaTelegram } from "react-icons/fa6";

const ShareButton = ({ modul }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [showNativeShare, setShowNativeShare] = useState(false);

    // Gunakan useEffect untuk mengakses objek 'window' dan 'navigator' dengan aman
    // Ini memastikan kode hanya berjalan di sisi client (browser)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setShareUrl(window.location.href);
        }
        if (typeof navigator !== 'undefined' && navigator.share) {
            setShowNativeShare(true);
        }
    }, []);

    // Definisikan shareText di sini agar bisa diakses oleh shareOptions
    const shareText = `Saya sedang belajar "${modul.title}" - ${modul.description}`;
    
    // Array opsi share dengan icon yang sudah diperbaiki
    const shareOptions = [
        {
            name: 'Facebook',
            icon: FaFacebook,
            color: 'bg-blue-600 hover:bg-blue-700',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'Twitter',
            icon: FaTwitter,
            color: 'bg-sky-500 hover:bg-sky-600',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'LinkedIn',
            icon: FaLinkedin,
            color: 'bg-blue-700 hover:bg-blue-800',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'WhatsApp',
            icon: FaWhatsapp,
            color: 'bg-green-500 hover:bg-green-600',
            url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        },
        {
            name: 'Telegram',
            icon: FaTelegram,
            color: 'bg-blue-500 hover:bg-blue-600',
            url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        }
    ];

    const handleShare = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    };

    const handleCopyLink = async () => {
        if (!navigator.clipboard) {
            // Fallback untuk browser lama atau koneksi non-HTTPS
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
            } catch (err) {
                console.error('Fallback: Gagal menyalin teks: ', err);
            }
            document.body.removeChild(textArea);
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
            } catch (err) {
                console.error('Gagal menyalin teks: ', err);
            }
        }
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: modul.title,
                    text: shareText,
                    url: shareUrl
                });
            } catch (err) {
                console.log('Error saat menggunakan Web Share API:', err);
            }
        }
    };

    return (
        <>
            {/* Share Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
                <ShareIcon className="w-5 h-5" />
                <span>Share</span>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Share Modul
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modul Info */}
                        <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                                {modul.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 text-xs">
                                {modul.description.length > 100 
                                    ? modul.description.substring(0, 100) + '...' 
                                    : modul.description
                                }
                            </p>
                        </div>

                        {/* Copy Link */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Link Modul
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className={`flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        copied 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                    }`}
                                >
                                    {copied ? (
                                        <CheckIcon className="w-5 h-5" />
                                    ) : (
                                        <LinkIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {copied && (
                                <p className="text-green-600 dark:text-green-400 text-xs mt-1">Link berhasil disalin!</p>
                            )}
                        </div>

                        {/* Social Media Buttons */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Bagikan ke Media Sosial
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {shareOptions.map((option) => {
                                    const IconComponent = option.icon;
                                    return (
                                        <button
                                            key={option.name}
                                            onClick={() => handleShare(option.url)}
                                            className={`flex items-center justify-center gap-3 ${option.color} text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors duration-200`}
                                        >
                                            <IconComponent className="w-5 h-5" />
                                            <span>{option.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Native Share (Mobile) */}
                        {showNativeShare && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                <button
                                    onClick={handleNativeShare}
                                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Bagikan dengan Aplikasi Lain
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ShareButton;