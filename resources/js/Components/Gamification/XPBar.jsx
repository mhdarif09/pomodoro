import React from 'react';
import { motion } from 'framer-motion';

export default function XPBar({ currentXP, xpForNextLevel, level, animated = true }) {
    const percentage = (currentXP / xpForNextLevel) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-emerald-600">Level {level}</span>
                <span className="text-xs font-semibold text-slate-500">
                    {currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <motion.div
                    initial={animated ? { width: 0 } : { width: `${percentage}%` }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-500 rounded-full shadow-sm"
                />
            </div>
        </div>
    );
}
