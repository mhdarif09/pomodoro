// File: resources/js/Pages/Pomodoro/components/PomodoroTimer.jsx

import React from 'react';
import { motion } from 'framer-motion';

const formatTime = (secondsLeft) => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function PomodoroTimer({ secondsLeft, isRunning, onStart, onStop, onReset }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 rounded-2xl shadow-xl text-center"
        >
            <h1 className="text-xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                Fokus Sesi
            </h1>
            <p className="text-8xl md:text-9xl font-mono font-bold text-slate-900 dark:text-white mb-6">
                {formatTime(secondsLeft)}
            </p>
            <div className="flex justify-center items-center space-x-4">
                {!isRunning ? (
                    <motion.button
                        onClick={onStart}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-10 rounded-full shadow-md"
                    >
                        Mulai
                    </motion.button>
                ) : (
                    <motion.button
                        onClick={onStop}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-10 rounded-full shadow-md"
                    >
                        Berhenti
                    </motion.button>
                )}
                <button
                    onClick={onReset}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold transition-colors"
                >
                    Reset
                </button>
            </div>
        </motion.div>
    );
}