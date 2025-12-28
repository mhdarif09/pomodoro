import React from 'react';
import { motion } from 'framer-motion';

export default function LevelBadge({ level, levelTitle, size = 'md' }) {
    const sizes = {
        sm: 'w-12 h-12 text-lg',
        md: 'w-16 h-16 text-2xl',
        lg: 'w-20 h-20 text-3xl',
    };

    const getBadgeColor = (level) => {
        if (level >= 50) return 'from-purple-500 to-pink-500';
        if (level >= 40) return 'from-emerald-500 to-teal-500';
        if (level >= 30) return 'from-blue-500 to-cyan-500';
        if (level >= 20) return 'from-amber-400 to-orange-400';
        if (level >= 10) return 'from-green-400 to-emerald-400';
        return 'from-slate-400 to-slate-500';
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <motion.div
                whileHover={{ scale: 1.1 }}
                className={`${sizes[size]} rounded-2xl bg-gradient-to-br ${getBadgeColor(level)} flex items-center justify-center text-white font-black shadow-xl border-4 border-white`}
            >
                {level}
            </motion.div>
            {levelTitle && (
                <div className="text-center">
                    <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Level</div>
                    <div className="text-sm font-bold text-slate-900">{levelTitle}</div>
                </div>
            )}
        </div>
    );
}
