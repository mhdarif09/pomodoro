import { useState, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import axios from 'axios';
import { ArrowDownTrayIcon, ShareIcon, XMarkIcon, PhotoIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import html2canvas from 'html2canvas';

import StreakShareCard from './StreakShareCard';

export default function StreakShareModal({ isOpen, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [format, setFormat] = useState('story'); // 'story' | 'square'
    const [isGenerating, setIsGenerating] = useState(false);
    
    const cardRef = useRef(null);

    useEffect(() => {
        if (isOpen && !data) {
            setLoading(true);
            axios.get(route('api.gamification.streak-summary'))
                .then(res => {
                    setData(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load streak data", err);
                    setLoading(false);
                });
        }
    }, [isOpen]);

    const generateImage = async () => {
        if (!cardRef.current) return null;
        
        try {
            setIsGenerating(true);
            const canvas = await html2canvas(cardRef.current, {
                scale: 1, // Card is already 1080px wide, so scale 1 is perfect
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#020617', // slate-950
                logging: false,
                width: 1080,
                height: format === 'square' ? 1080 : 1920,
                onclone: (clonedDoc) => {
                    const el = clonedDoc.querySelector('.share-card-capture');
                    if (el) {
                        el.style.transform = 'none';
                    }
                }
            });
            
            return new Promise(resolve => {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png', 1.0);
            });
        } catch (err) {
            console.error("Failed to generate image:", err);
            return null;
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        const blob = await generateImage();
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sarangtumbuh_streak_${data?.streak?.current}days.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleShare = async () => {
        const blob = await generateImage();
        if (!blob) return;

        const file = new File([blob], `streak_${data?.streak?.current}days.png`, { type: 'image/png' });
        
        const shareData = {
            title: 'My Productivity Streak',
            text: `Aku udah fokus selama ${data?.streak?.current} hari beruntun di SarangTumbuh! 🔥🚀 #BuildHabits`,
            files: [file]
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // If user cancels share, it throws AbortError, which we can ignore
                if (err.name !== 'AbortError') {
                    console.error("Error sharing:", err);
                    alert("Gagal membagikan. Coba download gambarnya saja ya.");
                }
            }
        } else {
            // Fallback to download if Web Share API is not supported
            handleDownload();
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left shadow-xl transition-all w-full max-w-4xl flex flex-col md:flex-row">
                                
                                {/* Left Side: Preview Options & Actions */}
                                <div className="p-6 md:p-8 flex flex-col justify-between flex-1 border-r border-slate-100 dark:border-slate-700">
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-slate-900 dark:text-white">
                                                Share Progress Kamu 🔥
                                            </Dialog.Title>
                                            <button 
                                                onClick={onClose}
                                                className="md:hidden text-slate-400 hover:text-slate-500"
                                            >
                                                <XMarkIcon className="w-6 h-6" />
                                            </button>
                                        </div>
                                        
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                                            Pamerin konsistensi kamu ke teman-teman. Pilih rasio gambar yang paling pas buat sosial mediamu.
                                        </p>

                                        <div className="space-y-3 mb-8">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Format Gambar</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => setFormat('story')}
                                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${format === 'story' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800'}`}
                                                >
                                                    <DevicePhoneMobileIcon className="w-8 h-8 mb-2" />
                                                    <span className="font-semibold text-sm">IG Story</span>
                                                    <span className="text-[10px] opacity-70">9:16</span>
                                                </button>
                                                
                                                <button
                                                    onClick={() => setFormat('square')}
                                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${format === 'square' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800'}`}
                                                >
                                                    <PhotoIcon className="w-8 h-8 mb-2" />
                                                    <span className="font-semibold text-sm">Post / WA</span>
                                                    <span className="text-[10px] opacity-70">1:1 Square</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3 mt-4">
                                        <button
                                            onClick={handleShare}
                                            disabled={loading || isGenerating}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ShareIcon className="w-5 h-5" />
                                            {isGenerating ? 'Menyiapkan...' : 'Share ke Sosial Media'}
                                        </button>
                                        
                                        <button
                                            onClick={handleDownload}
                                            disabled={loading || isGenerating}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ArrowDownTrayIcon className="w-5 h-5" />
                                            Download Image (PNG)
                                        </button>
                                    </div>
                                </div>

                                {/* Right Side: Card Preview */}
                                <div className="bg-slate-100 dark:bg-slate-900 p-6 md:p-8 flex items-center justify-center relative min-h-[500px] overflow-hidden">
                                     {/* Desktop Close Button */}
                                    <button 
                                        onClick={onClose}
                                        className="hidden md:block absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-10 bg-white/10 p-2 rounded-full backdrop-blur-sm"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>

                                    {loading ? (
                                        <div className="flex flex-col items-center text-slate-400">
                                            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                                            <p className="font-medium animate-pulse">Memuat data...</p>
                                        </div>
                                    ) : (
                                        <div className="relative shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 scale-[0.25] sm:scale-[0.35] md:scale-[0.3] lg:scale-[0.4] transform origin-center flex-shrink-0">
                                            {/* Render the actual card that html2canvas will capture */}
                                            <StreakShareCard ref={cardRef} data={data} format={format} />
                                            
                                            {/* Loading overlay during generation */}
                                            {isGenerating && (
                                                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                                                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
