// File: resources/js/Pages/Pomodoro/components/FloatingActionButtons.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

export default function FloatingActionButtons({ isPremium, onAIChatClick, onPDFQueryClick }) {
    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40">
            <motion.button
                onClick={onAIChatClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-teal-500 hover:bg-teal-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-3"
            >
                <SparklesIcon className="h-6 w-6" />
                <span className="font-semibold hidden sm:block">AI Chat</span>
            </motion.button>
            <motion.button
                onClick={onPDFQueryClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-slate-700 hover:bg-slate-800 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 relative"
            >
                {!isPremium && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500 text-black text-[10px] items-center justify-center font-bold">✨</span>
                    </span>
                )}
                <DocumentTextIcon className="h-6 w-6" />
                <span className="font-semibold hidden sm:block">PDF AI</span>
            </motion.button>
        </div>
    );
}