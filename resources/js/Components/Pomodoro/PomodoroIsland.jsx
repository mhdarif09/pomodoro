import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, PauseIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/solid';

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function PomodoroIsland({
    secondsLeft,
    isRunning,
    totalDuration,
    onStart,
    onStop,
    onReset,
    onClose,
    taskTitle
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const progress = totalDuration > 0 ? (totalDuration - secondsLeft) / totalDuration : 0;

    // Auto-expand slightly on start if not already
    useEffect(() => {
        if (isRunning && !isExpanded) {
            // Optional: peek expansion
        }
    }, [isRunning]);

    return (
        <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center pointer-events-none">
            <motion.div
                layout
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                    pointer-events-auto cursor-pointer
                    bg-black dark:bg-slate-900 border border-white/10
                    shadow-2xl shadow-black/40
                    flex items-center justify-between overflow-hidden
                    ${isExpanded ? 'rounded-[2.5rem] w-[340px] p-6' : 'rounded-full w-[160px] h-[360px] p-2'}
                `}
                style={{
                    height: isExpanded ? 'auto' : '38px',
                    width: isExpanded ? '340px' : '180px',
                    transition: { type: 'spring', stiffness: 300, damping: 30 }
                }}
            >
                {!isExpanded ? (
                    /* Mini View */
                    <div className="flex items-center justify-between w-full px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full border-2 border-teal-500/30 flex items-center justify-center relative">
                                <svg className="w-full h-full -rotate-90">
                                    <circle
                                        cx="10" cy="10" r="8"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="text-teal-500"
                                        strokeDasharray={2 * Math.PI * 8}
                                        strokeDashoffset={2 * Math.PI * 8 * (1 - progress)}
                                    />
                                </svg>
                            </div>
                            <span className="text-[13px] font-black text-white font-mono leading-none">
                                {formatTime(secondsLeft)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            {isRunning ? (
                                <div className="flex gap-0.5">
                                    <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-teal-500 rounded-full" />
                                    <motion.div animate={{ height: [10, 4, 10] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className="w-0.5 bg-teal-500 rounded-full" />
                                    <motion.div animate={{ height: [6, 12, 6] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-0.5 bg-teal-500 rounded-full" />
                                </div>
                            ) : (
                                <PlayIcon className="w-3 h-3 text-slate-400" />
                            )}
                        </div>
                    </div>
                ) : (
                    /* Expanded View */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full space-y-4"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Focus Mode</p>
                                <h3 className="text-sm font-bold text-white truncate">{taskTitle || 'Sesi Fokus'}</h3>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center">
                            <span className="text-5xl font-black text-white font-mono tracking-tighter">
                                {formatTime(secondsLeft)}
                            </span>

                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                                <motion.div
                                    className="h-full bg-teal-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onReset(); }}
                                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95"
                                title="Reset"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                            </button>

                            {!isRunning ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onStart(); }}
                                    className="flex-1 py-3 px-6 rounded-2xl bg-teal-500 hover:bg-teal-400 text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
                                >
                                    <PlayIcon className="w-4 h-4" />
                                    Mulai
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onStop(); }}
                                    className="flex-1 py-3 px-6 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <PauseIcon className="w-4 h-4" />
                                    Pause
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
