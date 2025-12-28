import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/solid';

export default function ChallengeCard({ challenge, progress = 0, completed = false, onClaim }) {
    const typeColors = {
        daily: 'from-amber-400 to-orange-400',
        weekly: 'from-blue-400 to-cyan-400',
        special: 'from-purple-400 to-pink-400',
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-xl transition-all"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeColors[challenge.type]} flex items-center justify-center text-2xl`}>
                        🎯
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{challenge.title}</h3>
                        <p className="text-xs text-emerald-600 uppercase font-semibold">{challenge.type}</p>
                    </div>
                </div>
                {completed && (
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckIcon className="w-5 h-5 text-white" />
                    </div>
                )}
            </div>

            <p className="text-sm text-slate-600 mb-4">{challenge.description}</p>

            <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600">
                    <span className="text-xl">✨</span>
                    <span className="font-bold">{challenge.xp_reward} XP</span>
                </div>
                {completed && onClaim && (
                    <button
                        onClick={onClaim}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold text-sm hover:bg-emerald-600 transition-colors"
                    >
                        Claim Reward
                    </button>
                )}
            </div>
        </motion.div>
    );
}
