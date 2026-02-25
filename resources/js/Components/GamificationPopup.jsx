import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, FireIcon, StarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid';

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
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setShowContent(true), 100);
            const timer = setTimeout(() => {
                setShowContent(false);
                setTimeout(onClose, 300);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen && !showContent) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center"
                        onClick={() => {
                            setShowContent(false);
                            setTimeout(onClose, 300);
                        }}
                    />
                    <div className="fixed inset-0 pointer-events-none z-[101] flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 50 }}
                            animate={{ 
                                opacity: showContent ? 1 : 0,
                                scale: showContent ? 1 : 0.5,
                                y: showContent ? 0 : 50
                            }}
                            transition={{ 
                                type: "spring",
                                stiffness: 300,
                                damping: 20
                            }}
                            className="pointer-events-auto"
                        >
                            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-1 rounded-[2rem] shadow-2xl">
                                <div className="bg-white dark:bg-slate-900 rounded-[1.8rem] p-8 max-w-sm mx-4 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500" />
                                    
                                    <div className="absolute -top-4 -right-4">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        >
                                            <SparklesIcon className="w-16 h-16 text-yellow-400" />
                                        </motion.div>
                                    </div>

                                    <div className="text-center relative z-10">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                                            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30"
                                        >
                                            <FireIcon className="w-10 h-10 text-white" />
                                        </motion.div>

                                        <motion.h2 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 10 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-2xl font-black text-slate-900 dark:text-white mb-1"
                                        >
                                            Task Completed!
                                        </motion.h2>

                                        <motion.p 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: showContent ? 1 : 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="text-sm text-slate-500 dark:text-slate-400 mb-4"
                                        >
                                            "{data.taskTitle?.substring(0, 30)}{data.taskTitle?.length > 30 ? '...' : ''}"
                                        </motion.p>

                                        <div className="space-y-3 mb-6">
                                            {data.xpAwarded > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: showContent ? 1 : 0, x: showContent ? 0 : -20 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 px-4 py-3 rounded-2xl"
                                                >
                                                    <StarIcon className="w-6 h-6 text-yellow-500" />
                                                    <span className="text-xl font-black text-yellow-600 dark:text-yellow-400">
                                                        +{data.xpAwarded} XP
                                                    </span>
                                                </motion.div>
                                            )}

                                            {data.newStreak > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: showContent ? 1 : 0, x: showContent ? 0 : 20 }}
                                                    transition={{ delay: 0.6 }}
                                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 px-4 py-3 rounded-2xl"
                                                >
                                                    <FireIcon className="w-6 h-6 text-orange-500" />
                                                    <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                                                        {data.newStreak} Day Streak! 🔥
                                                    </span>
                                                </motion.div>
                                            )}

                                            {data.levelUp && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.8 }}
                                                    transition={{ delay: 0.7 }}
                                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 px-4 py-3 rounded-2xl border-2 border-purple-500/30"
                                                >
                                                    <ArrowTrendingUpIcon className="w-6 h-6 text-purple-500" />
                                                    <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                                                        Level Up! Now Level {data.newLevel}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </div>

                                        {data.achievements && data.achievements.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: showContent ? 1 : 0 }}
                                                transition={{ delay: 0.8 }}
                                                className="mb-4"
                                            >
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                    New Achievement Unlocked!
                                                </p>
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {data.achievements.map((achievement, idx) => (
                                                        <div key={idx} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-sm font-bold text-yellow-700 dark:text-yellow-400">
                                                            {achievement.icon || '🏆'} {achievement.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        <motion.button
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: showContent ? 1 : 0 }}
                                            transition={{ delay: 0.9 }}
                                            onClick={() => {
                                                setShowContent(false);
                                                setTimeout(onClose, 300);
                                            }}
                                            className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Awesome! 🚀
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
