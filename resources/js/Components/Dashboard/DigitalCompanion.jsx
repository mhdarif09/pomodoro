import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DigitalCompanion({ todayTaskStats = { completed: 0, total: 3 }, dailyStats = { current: 0, limit: 3 }, auth = {} }) {
    const [state, setState] = useState('neutral');
    const [message, setMessage] = useState('Semangat hari ini!');
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const analyzeState = () => {
            const focusCount = dailyStats.current || 0;
            const focusLimit = dailyStats.limit || 8;
            const streak = auth?.gamification?.streak || 0;
            const completed = todayTaskStats.completed || 0;
            
            // 1. Cek apakah terlalu capek (sedih/ngantuk kalau overwork)
            if (focusCount >= focusLimit) {
                setState('tired');
                setMessage('Kamu kelihatannya capek... istirahat ya :(');
                return;
            }

            // 2. Cek apakah trend bagus (senang)
            if (streak > 2 || completed >= 3) {
                setState('happy');
                setMessage('Wah, fokusmu hebat banget belakangan ini! Teruskan ya! 🌟');
                return;
            }

            // 3. Normal / menyemangati
            setState('neutral');
            if (focusCount === 0 && completed === 0) {
                setMessage('Siap untuk mulai fokus hari ini?');
            } else {
                setMessage('Semangat kerjanya!');
            }
        };

        analyzeState();
    }, [todayTaskStats, dailyStats, auth]);

    // Expressions for our little companion
    const getExpression = () => {
        switch (state) {
            case 'happy': return '(\u2728\u25E1\u2728)'; // Sparkle eyes
            case 'tired': return '(\u00B4-_\u30FB\u00B4)\u2026\u24E9'; // Tired
            default: return '(\u2022 \u25E1 \u2022)'; // Neutral smile
        }
    };

    const getColors = () => {
        switch (state) {
            case 'happy': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
            case 'tired': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
            default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700/50';
        }
    };

    const getGlow = () => {
        switch (state) {
            case 'happy': return 'shadow-[0_0_20px_rgba(52,211,153,0.3)]';
            case 'tired': return 'shadow-[0_0_20px_rgba(96,165,250,0.3)]';
            default: return 'shadow-sm';
        }
    };

    // Float animation
    const floatVariant = {
        animate: {
            y: [0, -10, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    // Blink animation occasionally
    const faceVariant = {
        animate: {
            scaleY: [1, 1, 0.1, 1, 1],
            transition: {
                duration: 5,
                times: [0, 0.48, 0.5, 0.52, 1],
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    return (
        <div 
            className="relative flex items-center shrink-0 z-20 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.9 }}
                        className={`absolute hidden md:block w-52 top-full mt-3 left-1/2 -translate-x-1/2 lg:left-auto lg:right-0 lg:translate-x-0 p-3 rounded-2xl text-xs font-bold shadow-lg border backdrop-blur-sm z-30 ${getColors()}`}
                        style={{ pointerEvents: 'none' }}
                    >
                        {message}
                        {/* Chat bubble tail */}
                        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 lg:left-auto lg:right-8 lg:translate-x-0 w-4 h-4 rotate-45 border-t border-l ${getColors().split(' ').find(c => c.startsWith('border-'))} ${getColors().split(' ').find(c => c.startsWith('bg-'))}`} />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div 
                variants={floatVariant}
                animate="animate"
                className={`relative w-16 h-16 rounded-full flex items-center justify-center border-2 backdrop-blur-md cursor-pointer transition-colors duration-500 ${getColors()} ${getGlow()}`}
            >
                {/* Companion Face */}
                <motion.div variants={faceVariant} animate="animate" className="text-xl font-black select-none">
                    {getExpression()}
                </motion.div>
            </motion.div>
        </div>
    );
}
