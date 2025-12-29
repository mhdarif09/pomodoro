// File: resources/js/Pages/Pomodoro/components/FloatingActionButtons.jsx
// VERSI FINAL LENGKAP - Tombol Tunggal untuk Panel AI Terpadu

import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/solid';

export default function FloatingActionButtons({ onAIChatClick }) {
    return (
        <div className="fixed bottom-6 right-6 z-40">
            <motion.button
                onClick={onAIChatClick}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="bg-teal-500 hover:bg-teal-600 text-white p-4 rounded-full shadow-2xl shadow-teal-500/30 flex items-center gap-3"
            >
                <SparklesIcon className="h-6 w-6" />
                <span className="font-semibold hidden sm:block pr-2">Asisten AI</span>
            </motion.button>
        </div>
    );
}