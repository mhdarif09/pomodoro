// File: resources/js/Pages/Pomodoro/components/PomodoroTimer.jsx
// Desain baru dengan progress bar radial yang modern

import React from 'react';
import { motion } from 'framer-motion';

const formatTime = (secondsLeft) => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const ProgressCircle = ({ progress, size, strokeWidth }) => {
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            {/* Background Circle */}
            <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-slate-200 dark:text-slate-700"
            />
            {/* Progress Circle */}
            <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="text-teal-500 dark:text-teal-400"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: "circOut" }}
            />
        </svg>
    );
};

export default function PomodoroTimer({ secondsLeft, isRunning, totalDuration, onStart, onStop, onReset }) {
    
    const progress = totalDuration > 0 ? (totalDuration - secondsLeft) / totalDuration : 0;
    const circleSize = 280;
    const strokeWidth = 12;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center p-4"
        >
            <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
                <ProgressCircle progress={progress} size={320} strokeWidth={14} />
                <div className="absolute text-center">
                    <h1 className="text-6xl sm:text-7xl font-mono font-bold text-slate-900 dark:text-white">
                        {formatTime(secondsLeft)}
                    </h1>
                     <p className="text-lg font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {isRunning ? 'Tetap Fokus...' : 'Siap Mulai?'}
                    </p>
                </div>
            </div>

            <div className="flex justify-center items-center space-x-4 mt-8">
                {!isRunning ? (
                    <motion.button
                        onClick={onStart}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-12 rounded-full shadow-lg shadow-teal-500/30 transition-all duration-300"
                    >
                        Mulai
                    </motion.button>
                ) : (
                    <motion.button
                        onClick={onStop}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-12 rounded-full shadow-lg shadow-rose-500/30 transition-all duration-300"
                    >
                        Berhenti
                    </motion.button>
                )}
                <button
                    onClick={onReset}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold py-3 px-4 rounded-full transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                    Reset
                </button>
            </div>
        </motion.div>
    );
}