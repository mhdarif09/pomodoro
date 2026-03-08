import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FireIcon, CheckCircleIcon, ClockIcon, TrophyIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

export default function WeeklyJourney({ auth, compact = false }) {
    const [journeyData, setJourneyData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWeeklyJourney();
    }, []);

    const fetchWeeklyJourney = async () => {
        try {
            const res = await axios.get(route('api.gamification.weekly-journey'));
            setJourneyData(res.data);
        } catch (err) {
            console.error('Failed to fetch weekly journey:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <WeeklyJourneySkeleton compact={compact} />;
    }

    const { week, targets, overall_progress, streak, rewards } = journeyData || {};

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-emerald-500 to-emerald-500 rounded-2xl p-4 text-white shadow-lg"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <FireIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs opacity-80">Weekly Journey</p>
                            <p className="font-black text-lg">{overall_progress || 0}%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
                        <FireIcon className="w-4 h-4" />
                        <span className="font-bold text-sm">{streak?.current || 0}</span>
                    </div>
                </div>
                <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${overall_progress || 0}%` }}
                        className="h-full bg-white rounded-full"
                    />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        >
            {/* Hero Header - Stimuler Style */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/30 rounded-full -ml-8 -mb-8 blur-2xl" />
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <FireIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white">Weekly Journey</h3>
                                <p className="text-white/70 text-sm font-medium">
                                    {week?.start ? `${week.start} - ${week.end}` : 'This Week'}
                                </p>
                            </div>
                        </div>
                        {streak?.current > 0 && (
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-2xl"
                            >
                                <span className="text-3xl">🔥</span>
                                <div className="text-left">
                                    <p className="text-2xl font-black text-white leading-none">{streak.current}</p>
                                    <p className="text-[10px] text-white/70 font-bold uppercase">Day Streak</p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Circular Progress */}
                    <div className="flex items-center gap-8">
                        <div className="relative">
                            <svg className="w-32 h-32 -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.2)" strokeWidth="12" fill="none" />
                                <motion.circle
                                    cx="64" cy="64" r="56"
                                    stroke="white" strokeWidth="12"
                                    strokeLinecap="round"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 56}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - (overall_progress || 0) / 100) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-white">{overall_progress || 0}%</span>
                                <span className="text-xs text-white/70 font-bold">COMPLETE</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3">
                            <TargetMini
                                icon="✅"
                                label="Tasks"
                                current={targets?.tasks?.completed || 0}
                                target={targets?.tasks?.target || 20}
                            />
                            <TargetMini
                                icon="🍅"
                                label="Pomodoros"
                                current={targets?.pomodoros?.completed || 0}
                                target={targets?.pomodoros?.target || 30}
                            />
                            <TargetMini
                                icon="⏱️"
                                label="Focus Time"
                                current={targets?.focus_minutes?.completed || 0}
                                target={targets?.focus_minutes?.target || 600}
                                formatTime
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Day Grid */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Daily Consistency</p>
                <div className="grid grid-cols-7 gap-2">
                    {week?.days_completed?.map((day, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
                                day.completed 
                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                            }`}
                        >
                            <span className="text-[10px] font-bold opacity-70 mb-1">
                                {day.day_name?.substring(0, 3)}
                            </span>
                            {day.completed ? (
                                <CheckCircleIcon className="w-5 h-5" />
                            ) : (
                                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                            )}
                            {day.completed && day.count > 0 && (
                                <span className="text-[10px] font-black mt-1">{day.count}</span>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Rewards Section */}
            {rewards && (
                <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <TrophyIcon className="w-6 h-6 text-yellow-500" />
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white">Weekly Rewards</p>
                                <p className="text-xs text-slate-500">Complete the week to claim!</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-black text-yellow-600">+{rewards.xp} XP</p>
                            {rewards.streak_bonus > 0 && (
                                <p className="text-xs text-orange-500 font-bold">+{rewards.streak_bonus} streak bonus</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

function TargetMini({ icon, label, current, target, formatTime }) {
    const displayCurrent = formatTime 
        ? `${Math.floor(current / 60)}h ${current % 60}m` 
        : current;
    const displayTarget = formatTime 
        ? `${Math.floor(target / 60)}h ${target % 60}m` 
        : target;
    
    return (
        <div className="flex items-center gap-3">
            <span className="text-lg">{icon}</span>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-white/90">{label}</span>
                    <span className="text-xs font-bold text-white/70">
                        {displayCurrent}/{displayTarget}
                    </span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (current / target) * 100)}%` }}
                        className="h-full bg-white rounded-full"
                    />
                </div>
            </div>
        </div>
    );
}

function WeeklyJourneySkeleton({ compact }) {
    if (compact) {
        return (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        <div>
                            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                            <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                    </div>
                </div>
                <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 animate-pulse">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                <div className="flex-1">
                    <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
            </div>
            <div className="flex gap-8">
                <div className="w-32 h-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="flex-1 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}
