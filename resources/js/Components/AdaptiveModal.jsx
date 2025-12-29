import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const AdaptiveModal = ({ isOpen, onClose, children, title, showClose = true, maxWidth = 'max-w-md' }) => {
    const [deviceType, setDeviceType] = useState('macos'); // default to macos

    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(ua)) {
            setDeviceType('ios');
        } else if (/macintosh/.test(ua)) {
            setDeviceType('macos');
        } else {
            setDeviceType('macos'); // Default fallback
        }
    }, []);

    if (!isOpen) return null;

    const isIOS = deviceType === 'ios';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={isIOS ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
                        animate={isIOS ? { y: 0 } : { scale: 1, opacity: 1 }}
                        exit={isIOS ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={clsx(
                            "relative w-full overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl",
                            maxWidth,
                            isIOS ? "rounded-[2rem] p-6 mb-4 self-end sm:self-center" : "rounded-xl p-5 border border-white/20 dark:border-slate-700/50"
                        )}
                    >
                        {/* Header */}
                        <div className={clsx(
                            "flex items-center justify-between mb-4",
                            isIOS ? "flex-col text-center" : "flex-row"
                        )}>
                            {isIOS && <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mb-4 mx-auto" />}

                            <h3 className={clsx(
                                "font-bold text-slate-900 dark:text-white",
                                isIOS ? "text-xl" : "text-lg"
                            )}>
                                {title}
                            </h3>

                            {showClose && !isIOS && (
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <XMarkIcon className="h-5 w-5 text-slate-500" />
                                </button>
                            )}

                            {showClose && isIOS && (
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Body */}
                        <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
                            {children}
                        </div>

                        {/* iOS Bottom Action (Optional) */}
                        {isIOS && (
                            <div className="mt-6 flex flex-col gap-3">
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 text-center font-semibold text-blue-600 dark:text-blue-400 bg-slate-100 dark:bg-slate-800 rounded-2xl active:scale-95 transition-transform"
                                >
                                    Selesai
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AdaptiveModal;
