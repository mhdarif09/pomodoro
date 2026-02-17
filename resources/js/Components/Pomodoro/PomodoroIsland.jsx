import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, PauseIcon, ArrowPathIcon, XMarkIcon, ChevronUpIcon } from '@heroicons/react/24/solid'; // Changed imports
import BreakMode from './BreakMode';
import MusicPlayer from './MusicPlayer';

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
    taskTitle,
    onSessionComplete
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Break State
    const [breakDuration, setBreakDuration] = useState(5); // 5 minutes default
    const [breakTimeLeft, setBreakTimeLeft] = useState(5 * 60);
    const [isBreakActive, setIsBreakActive] = useState(false);
    const [isBreakPaused, setIsBreakPaused] = useState(false);
    const [isBreakMinimized, setIsBreakMinimized] = useState(false);

    // Focus Progress
    const progress = totalDuration > 0 ? (totalDuration - secondsLeft) / totalDuration : 0;

    // Break Progress
    const breakProgress = (breakDuration * 60 - breakTimeLeft) / (breakDuration * 60);

    // Auto-transition to break mode
    useEffect(() => {
        if (secondsLeft === 0 && isRunning) {
            handleStartBreak();
            onStop?.();
            onSessionComplete?.();
        }
    }, [secondsLeft, isRunning]);

    // Break Timer Logic
    useEffect(() => {
        let interval = null;
        if (isBreakActive && !isBreakPaused && breakTimeLeft > 0) {
            interval = setInterval(() => {
                setBreakTimeLeft(prev => {
                    if (prev <= 1) {
                        handleBreakEnd();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isBreakActive, isBreakPaused, breakTimeLeft]);

    const handleStartBreak = () => {
        setBreakTimeLeft(breakDuration * 60);
        setIsBreakActive(true);
        setIsBreakPaused(false);
        setIsBreakMinimized(false);
        onStop?.(); // Ensure focus timer is stopped
    };

    const handleManualBreak = (e) => {
        e?.stopPropagation();
        handleStartBreak();
    };

    const handleBreakEnd = () => {
        setIsBreakActive(false);
        setIsBreakMinimized(false);
        onReset?.(); // Ready for next focus session
    };

    const handleSkipBreak = () => {
        handleBreakEnd();
    };

    const toggleBreakPause = () => {
        setIsBreakPaused(!isBreakPaused);
    };

    const handleMinimizeBreak = () => {
        setIsBreakMinimized(true);
        setIsExpanded(false); // Collapse island to mini view
    };

    const handleMaximizeBreak = () => {
        setIsBreakMinimized(false);
        setIsExpanded(true); // Expand island? No, open full overlay.
    };

    // Determine what to show in Island
    // If Break Active -> Show Break Info
    // Else -> Show Focus Info
    const activeTime = isBreakActive ? breakTimeLeft : secondsLeft;
    const activeTotal = isBreakActive ? (breakDuration * 60) : totalDuration;
    const activeProgress = isBreakActive ? breakProgress : progress;
    const activeIsRunning = isBreakActive ? !isBreakPaused : isRunning;
    const themeColor = isBreakActive ? 'text-emerald-500' : 'text-teal-500';
    const bgColor = isBreakActive ? 'bg-emerald-500' : 'bg-teal-500';

    return (
        <>
            {/* Break Mode Overlay (Controlled) */}
            <AnimatePresence>
                {isBreakActive && (
                    <BreakMode
                        duration={breakDuration}
                        timeLeft={breakTimeLeft}
                        isPaused={isBreakPaused}
                        onTogglePause={toggleBreakPause}
                        onBreakEnd={handleBreakEnd}
                        onSkipBreak={handleSkipBreak}
                        onMinimize={handleMinimizeBreak}
                        isMinimized={isBreakMinimized}
                    />
                )}
            </AnimatePresence>

            {/* Pomodoro Island */}
            <div className={`fixed top-4 left-0 right-0 z-[100] flex justify-center pointer-events-none transition-all duration-500 ${isBreakActive && !isBreakMinimized ? 'opacity-0 translate-y-[-20px]' : 'opacity-100'}`}>
                <motion.div
                    layout
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onClick={() => {
                        if (isBreakActive && isBreakMinimized) {
                            handleMaximizeBreak();
                        } else {
                            setIsExpanded(!isExpanded);
                        }
                    }}
                    className={`
                        pointer-events-auto cursor-pointer
                        bg-black dark:bg-slate-900 border border-white/10
                        shadow-2xl shadow-black/40
                        flex items-center justify-between ${isExpanded ? 'overflow-visible' : 'overflow-hidden'}
                        ${isExpanded ? 'rounded-[2.5rem] w-[340px] p-6' : 'rounded-full w-[170px] h-[36px] p-2'}
                    `}
                    style={{
                        height: isExpanded ? 'auto' : '38px',
                        width: isExpanded ? '340px' : '180px',
                        transition: { type: 'spring', stiffness: 300, damping: 30 }
                    }}
                >
                    {/* Mini View */}
                    {!isExpanded && (
                        <div className="flex items-center justify-between w-full px-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full border-2 ${isBreakActive ? 'border-emerald-500/30' : 'border-teal-500/30'} flex items-center justify-center relative`}>
                                    <svg className="w-full h-full -rotate-90">
                                        <circle
                                            cx="10" cy="10" r="8"
                                            fill="transparent"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className={themeColor}
                                            strokeDasharray={2 * Math.PI * 8}
                                            strokeDashoffset={2 * Math.PI * 8 * (1 - activeProgress)}
                                        />
                                    </svg>
                                    {isBreakActive && <div className="absolute inset-0 flex items-center justify-center text-[8px]">☕</div>}
                                </div>
                                <span className="text-[13px] font-black text-white font-mono leading-none">
                                    {formatTime(activeTime)}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                {activeIsRunning ? (
                                    <div className="flex gap-0.5">
                                        <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className={`w-0.5 ${bgColor} rounded-full`} />
                                        <motion.div animate={{ height: [10, 4, 10] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className={`w-0.5 ${bgColor} rounded-full`} />
                                        <motion.div animate={{ height: [6, 12, 6] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className={`w-0.5 ${bgColor} rounded-full`} />
                                    </div>
                                ) : (
                                    <PlayIcon className="w-3 h-3 text-slate-400" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Expanded View */}
                    <motion.div
                        animate={{ opacity: isExpanded ? 1 : 0 }}
                        className={`${isExpanded ? "w-full space-y-4" : "absolute top-0 left-0 w-full h-0 overflow-hidden opacity-0 pointer-events-none"}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 pr-4">
                                <p className={`text-[10px] font-black ${isBreakActive ? 'text-emerald-400' : 'text-teal-400'} uppercase tracking-widest mb-1`}>
                                    {isBreakActive ? 'Break Mode' : 'Focus Mode'}
                                </p>
                                <h3 className="text-sm font-bold text-white truncate">
                                    {isBreakActive ? 'Recharging...' : (taskTitle || 'Sesi Fokus')}
                                </h3>
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
                                {formatTime(activeTime)}
                            </span>

                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                                <motion.div
                                    className={`h-full ${bgColor}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${activeProgress * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-2">
                            {/* Music Player */}
                            <MusicPlayer />

                            {!isBreakActive && (
                                <button
                                    onClick={handleManualBreak}
                                    className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all active:scale-95 border border-emerald-500/20"
                                    title="Take a Break"
                                >
                                    ☕
                                </button>
                            )}

                            {isBreakActive ? (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleBreakPause(); }}
                                        className={`flex-1 py-3 px-6 rounded-2xl ${isBreakPaused ? 'bg-emerald-500 text-black' : 'bg-white text-black'} font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95`}
                                    >
                                        {isBreakPaused ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
                                        {isBreakPaused ? 'Resume' : 'Pause'}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleSkipBreak(); }}
                                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95"
                                        title="End Break"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                /* Focus Controls */
                                <>
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
                                </>
                            )}
                        </div>

                        {isBreakActive && (
                            <div className="flex justify-center mt-2">
                                <button
                                    onClick={handleMaximizeBreak}
                                    className="text-[10px] text-emerald-400/60 hover:text-emerald-400 uppercase font-black tracking-widest flex items-center gap-1"
                                >
                                    <ChevronUpIcon className="w-3 h-3" />
                                    Open Fullscreen
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}
