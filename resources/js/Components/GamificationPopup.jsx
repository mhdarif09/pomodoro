import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, FireIcon, StarIcon, ArrowTrendingUpIcon, ShareIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useLanguage } from './../Contexts/LanguageContext';

// GamificationPopup messages are now translated in Locales/translations.js

export default function GamificationPopup({ 
    isOpen, 
    onClose, 
    data = {
        xpAwarded: 0,
        newStreak: 0,
        levelUp: false,
        newLevel: 0,
        achievements: [],
        taskTitle: ''
    } 
}) {
    const { t } = useLanguage();
    const [showContent, setShowContent] = useState(false);
    const [randomMessage, setRandomMessage] = useState("");
    const [shareStatus, setShareStatus] = useState("Share ke IG Story");

    useEffect(() => {
        if (isOpen) {
            // Pilih pesan acak setiap kali pop-up terbuka untuk menstimulasi kejutan
            const messages = t('psychological_messages');
            const randomMsg = Array.isArray(messages) && messages.length > 0 
                ? messages[Math.floor(Math.random() * messages.length)]
                : "Great job! Keep up the good work!";
            setRandomMessage(randomMsg);
            setShowContent(true);
            setShareStatus(t('share_achievement') || "Bagikan Pencapaian 📸");
        } else {
            setShowContent(false);
        }
    }, [isOpen, t]);

    const handleShare = async () => {
        const shareData = {
            title: t('share_title') || 'SarangTumbuh Progress!',
            text: `${t('share_text_1') || 'Saya baru menyelesaikan'} "${data.taskTitle}"! +${data.xpAwarded} XP ${t('share_text_2') || 'dan Streak'} ${data.newStreak} ${t('share_text_3') || 'Hari di SarangTumbuh. Yuk produktif bareng! 🔥🚀'}`,
            url: window.location.origin,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                setShareStatus(t('share_success') || "Berhasil Dibagikan! ✨");
            } catch (err) {
                console.log('Error sharing:', err);
                copyToClipboard(shareData.text);
            }
        } else {
            copyToClipboard(shareData.text);
        }
        
        setTimeout(() => setShareStatus(t('share_achievement') || "Bagikan Pencapaian 📸"), 3000);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setShareStatus(t('share_copied') || "Teks disalin ke Clipboard! 📋");
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setShareStatus(t('share_failed') || "Gagal menyalin 😢");
        });
    };

    if (!showContent && !isOpen) return null;

    const popupContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6"
                >
                    {/* Solid / Playful Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 0.9 }} 
                        exit={{ opacity: 0 }} 
                        className="absolute inset-0 bg-slate-900 backdrop-blur-sm"
                        onClick={() => {
                            setShowContent(false);
                            setTimeout(onClose, 300);
                        }}
                    />

                    {/* Fun Floating Particles */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center">
                         <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500 rounded-full mix-blend-screen filter blur-[60px] opacity-30 animate-pulse" />
                         <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-indigo-500 rounded-full mix-blend-screen filter blur-[60px] opacity-30 animate-pulse" style={{ animationDelay: '1s'}} />
                    </div>

                    <motion.div
                        initial={{ scale: 0.7, y: 100, opacity: 0 }}
                        animate={{ 
                            scale: showContent ? 1 : 0.7,
                            y: showContent ? 0 : 100,
                            opacity: showContent ? 1 : 0
                        }}
                        exit={{ scale: 0.8, y: 50, opacity: 0 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 25,
                            mass: 1.2
                        }}
                        className="relative w-full max-w-sm pointer-events-auto"
                    >
                        {/* the Duolingo style physical card (solid drop shadow) */}
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 sm:p-8 relative isolate border-b-8 border-slate-200 dark:border-slate-900 shadow-2xl">
                             
                             {/* Close Button */}
                            <button 
                                onClick={() => {
                                    setShowContent(false);
                                    setTimeout(onClose, 300);
                                }}
                                className="absolute top-4 right-4 p-2.5 bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-600 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white transition-transform active:scale-90 z-20"
                            >
                                <XMarkIcon className="w-5 h-5 font-black" />
                            </button>

                            <div className="text-center flex flex-col items-center">
                                {/* Bouncy Avatar Icon */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -30 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.15, type: "spring", stiffness: 500, damping: 12 }}
                                    className="w-24 h-24 mb-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl rotate-3 flex items-center justify-center shadow-inner relative border-b-4 border-emerald-300 dark:border-emerald-700"
                                >
                                    <FireIcon className="w-14 h-14 text-emerald-500 dark:text-emerald-400 drop-shadow-sm" />
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <SparklesIcon className="w-8 h-8 text-yellow-400 absolute -top-4 -right-4" />
                                    </motion.div>
                                    <motion.div
                                        animate={{ y: [0, 5, 0] }}
                                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                                    >
                                        <SparklesIcon className="w-5 h-5 text-yellow-300 absolute -bottom-2 -left-2" />
                                    </motion.div>
                                </motion.div>

                                {/* Main Title */}
                                <motion.h2 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-3xl font-black text-slate-800 dark:text-white mb-1 tracking-tight"
                                >
                                    {t('good_job') || 'Kerja Bagus!'}
                                </motion.h2>

                                {/* Task Title */}
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-emerald-600 dark:text-emerald-400 font-bold mb-6 flex items-center gap-1.5 justify-center"
                                >
                                    <span className="bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 rounded-xl text-sm border-b-2 border-emerald-200 dark:border-emerald-800 truncate max-w-[250px]">
                                        {data.taskTitle || (t('focus_session') || "Sesi Fokus")}
                                    </span>
                                </motion.p>

                                {/* Stats Grid (Duolingo Style Bubbles) */}
                                <div className="flex justify-center gap-4 w-full mb-8">
                                    {data.xpAwarded > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5, x: -20 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 15 }}
                                            className="flex flex-col items-center justify-center w-28 bg-yellow-400 rounded-2xl p-3 border-b-4 border-yellow-500 shadow-sm"
                                        >
                                            <span className="text-[10px] font-black text-yellow-800/60 uppercase tracking-widest mb-1">Total XP</span>
                                            <div className="flex items-center gap-1 text-yellow-900">
                                                <StarIcon className="w-5 h-5" />
                                                <span className="text-2xl font-black">+{data.xpAwarded}</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {data.newStreak > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5, x: 20 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 15 }}
                                            className="flex flex-col items-center justify-center w-28 bg-orange-500 rounded-2xl p-3 border-b-4 border-orange-600 shadow-sm"
                                        >
                                            <span className="text-[10px] font-black text-orange-200 uppercase tracking-widest mb-1">{t('streak') || 'Streak'}</span>
                                            <div className="flex items-center gap-1 text-white">
                                                <FireIcon className="w-5 h-5" />
                                                <span className="text-2xl font-black">{data.newStreak}</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Psychological Messaging Text Box */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="mb-8 w-full"
                                >
                                    <div className="relative bg-slate-100 dark:bg-slate-700/50 rounded-2xl p-4 border-2 border-slate-200 dark:border-slate-700">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-2 text-slate-400 dark:text-slate-500">
                                            <StarIcon className="w-4 h-4" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {randomMessage}
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Level Up Alert */}
                                {data.levelUp && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7, type: "spring" }}
                                        className="w-full flex items-center justify-center gap-2 bg-indigo-500 text-white px-4 py-3 rounded-2xl mb-6 shadow-sm border-b-4 border-indigo-600"
                                    >
                                        <ArrowTrendingUpIcon className="w-6 h-6" />
                                        <span className="text-base font-black uppercase tracking-widest">
                                            {t('level_up')} {data.newLevel}!
                                        </span>
                                    </motion.div>
                                )}

                                {/* Floating Button Actions */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="w-full space-y-3"
                                >
                                    <button
                                        onClick={() => {
                                            setShowContent(false);
                                            setTimeout(onClose, 300);
                                        }}
                                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-sm sm:text-base transition-all active:translate-y-1 active:border-b-0 border-b-4 border-emerald-600 shadow-sm flex items-center justify-center"
                                    >
                                        {t('continue_button') || 'LANJUTKAN'}
                                    </button>
                                    
                                    <button
                                        onClick={handleShare}
                                        className="w-full py-3.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm transition-all active:translate-y-1 active:border-b-0 border-b-4 border-slate-300 dark:border-slate-800 shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <ShareIcon className="w-4 h-4" />
                                        {shareStatus}
                                    </button>
                                </motion.div>

                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return typeof window !== 'undefined' ? createPortal(popupContent, document.body) : null;
}
