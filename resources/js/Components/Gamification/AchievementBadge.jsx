import React from 'react';
import { motion } from 'framer-motion';

export default function AchievementBadge({ achievement, unlocked = false, unlockedAt = null }) {
    const rarityColors = {
        common: 'from-slate-400 to-slate-500',
        rare: 'from-blue-400 to-cyan-400',
        epic: 'from-purple-500 to-pink-500',
        legendary: 'from-amber-400 to-orange-500',
    };

    return (
        <motion.div
            whileHover={{ scale: unlocked ? 1.05 : 1 }}
            className={`p-4 rounded-xl ${unlocked ? 'bg-white/70 backdrop-blur-xl border-2' : 'bg-slate-100 border-2 border-slate-200'} transition-all`}
            style={unlocked ? { borderImage: `linear-gradient(135deg, ${rarityColors[achievement.rarity]}) 1` } : {}}
        >
            <div className="flex flex-col items-center gap-2 text-center">
                <div className={`text-4xl ${!unlocked && 'opacity-30 grayscale'}`}>
                    {achievement.icon}
                </div>
                <div>
                    <h4 className={`font-bold text-sm ${unlocked ? 'text-slate-900' : 'text-slate-400'}`}>
                        {achievement.name}
                    </h4>
                    <p className={`text-xs ${unlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                        {achievement.description}
                    </p>
                </div>
                <div className="flex items-center gap-1 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-semibold uppercase ${achievement.rarity === 'common' ? 'bg-slate-200 text-slate-700' :
                            achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                                achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                                    'bg-amber-100 text-amber-700'
                        }`}>
                        {achievement.rarity}
                    </span>
                    {unlocked && achievement.xp_reward > 0 && (
                        <span className="text-amber-600 font-bold">+{achievement.xp_reward} XP</span>
                    )}
                </div>
                {unlocked && unlockedAt && (
                    <p className="text-xs text-emerald-600 font-semibold">
                        Unlocked {new Date(unlockedAt).toLocaleDateString()}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
