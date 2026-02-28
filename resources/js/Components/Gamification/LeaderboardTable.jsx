import React from 'react';
import { motion } from 'framer-motion';
import { TrophyIcon } from '@heroicons/react/24/solid';

export default function LeaderboardTable({ users, currentUserId }) {
    const getRankIcon = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Rank</th>
                        <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Player</th>
                        <th className="text-right py-3 px-4 text-sm font-bold text-slate-600">Level</th>
                        <th className="text-right py-3 px-4 text-sm font-bold text-slate-600">Total XP</th>
                        <th className="text-center py-3 px-4 text-sm font-bold text-slate-600">Streak</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => {
                        const isCurrentUser = user.id === currentUserId;
                        return (
                            <motion.tr
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`border-b border-slate-100 hover:bg-emerald-50/50 transition-colors ${isCurrentUser ? 'bg-emerald-50 font-bold' : ''
                                    }`}
                            >
                                <td className="py-4 px-4">
                                    <div className="text-lg font-black text-emerald-600">
                                        {getRankIcon(index + 1)}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-slate-900 font-semibold">{user.name}</span>
                                        {isCurrentUser && (
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">You</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <span className="text-slate-900 font-bold">{user.level}</span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <span className="text-slate-600 font-semibold">{user.total_xp.toLocaleString()}</span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                                        🔥 {user.current_streak}
                                    </span>
                                </td>
                            </motion.tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
