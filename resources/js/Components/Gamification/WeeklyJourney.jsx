import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FireIcon, CheckCircleIcon, ClockIcon, TargetIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

export default function WeeklyJourney({ auth, onStreakUpdate }) {
    const [journeyData, setJourneyData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWeeklyJourney();
    }, []);

    const fetchWeeklyJourney = async () => {
        try {
            const res = await axios.get(route('api.gamification.weekly-journey'));
            setJourneyData(res.data);
            if (onStreakUpdate && res.data?.streak?.current) {
                onStreakUpdate(res.data.streak.current);
            }
        } catch (err) {
            console.error('Failed to fetch weekly journey:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="apple-glass rounded-[2.5rem] p-6 shadow-xl border border-white/10">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                    <div className="flex gap-2">
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="h-10 flex-1 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const { week, targets, overall_progress, streak } = journeyData || {};

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="apple-glass rounded-[2.5rem] p-6 shadow-xl border border-white/10"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <FireIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Weekly Journey</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Minggu ini</p>
                    </div>
                </div>
                {streak?.current > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full border border-orange-500/20">
                        <FireIcon className="w-5 h-5 text-orange-500" />
                        <span className="text-lg font-black text-orange-500">{streak.current}</span>
                        <span className="text-xs text-orange-400 font-medium">day streak</span>
                    </div>
                )}
            </div>

            {/* Overall Progress */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Overall Progress</span>
                    <span className="text-lg font-black text-teal-500">{overall_progress || 0}%</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${overall_progress || 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                    />
                </div>
            </div>

            {/* Day Grid */}
            <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Daily Progress</p>
                <div className="grid grid-cols-7 gap-2">
                    {week?.days_completed?.map((day, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                                day.completed 
                                    ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                        >
                            <span className="text-[10px] font-bold opacity-70">
                                {day.day_name?.substring(0, 3)}
                            </span>
                            {day.completed && (
                                <CheckCircleIcon className="w-4 h-4 mt-1" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Targets */}
            <div className="space-y-4">
                <TargetItem
                    icon={<CheckCircleIcon className="w-5 h-5" />}
                    label="Tasks Completed"
                    current={targets?.tasks?.completed || 0}
                    target={targets?.tasks?.target || 20}
                    percentage={targets?.tasks?.percentage || 0}
                    color="bg-blue-500"
                />
                <TargetItem
                    icon={<ClockIcon className="w-5 h-5" />}
                    label="Pomodoros"
                    current={targets?.pomodoros?.completed || 0}
                    target={targets?.pomodoros?.target || 30}
                    percentage={targets?.pomodoros?.percentage || 0}
                    color="bg-rose-500"
                />
                <TargetItem
                    icon={<FireIcon className="w-5 h-5" />}
                    label="Focus Minutes"
                    current={targets?.focus_minutes?.completed || 0}
                    target={targets?.focus_minutes?.target || 600}
                    percentage={targets?.focus_minutes?.percentage || 0}
                    color="bg-orange-500"
                    formatMinutes={true}
                />
            </div>

            {/* Rewards Preview */}
            {journeyData?.rewards && (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Potential Rewards</span>
                        <span className="font-black text-teal-500">
                            +{journeyData.rewards.xp} XP
                            {journeyData.rewards.streak_bonus > 0 && (
                                <span className="text-orange-400"> (+{journeyData.rewards.streak_bonus} streak bonus)</span>
                            )}
                        </span>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

function TargetItem({ icon, label, current, target, percentage, color, formatMinutes }) {
    const displayValue = formatMinutes 
        ? `${Math.floor(current / 60)}h ${current % 60}m` 
        : current;
    const displayTarget = formatMinutes 
        ? `${Math.floor(target / 60)}h ${target % 60}m` 
        : target;

    return (
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-10 flex items-center justify-center text-white ${color.replace('bg-', 'text-')}`}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                    <span className="text-xs font-bold text-slate-500">
                        {displayValue} / {displayTarget}
                    </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full ${color} rounded-full`}
                    />
                </div>
            </div>
        </div>
    );
}
