import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function GuildLeaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('weekly'); // 'all_time' or 'weekly'

    useEffect(() => {
        fetchLeaderboard();
    }, [period]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await axios.get(route('api.guilds.leaderboard'), { params: { period, limit: 50 } });
            setLeaderboard(res.data.leaderboard);
        } catch (error) {
            console.error("Failed to load guild leaderboard", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <TrophyIcon className="w-6 h-6 text-emerald-500" /> Guild Rankings
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">The most productive squads in the arena.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setPeriod('weekly')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${period === 'weekly' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Weekly Score
                    </button>
                    <button
                        onClick={() => setPeriod('all_time')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${period === 'all_time' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        All Time XP
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-3">
                    {leaderboard.map((guild, idx) => (
                        <div key={guild.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                            <div className="w-8 font-black text-slate-400 text-center">
                                #{idx + 1}
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl shadow-inner">
                                {guild.emblem}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 dark:text-white">{guild.name}</h4>
                                <div className="flex items-center gap-3 mt-1 text-slate-500 text-xs">
                                    <span className="flex items-center gap-1 font-medium">
                                        <UserGroupIcon className="w-3 h-3" /> {guild.member_count} Members
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-black text-slate-900 dark:text-white text-lg">
                                    {period === 'weekly' ? (guild.weekly_xp?.toLocaleString() || 0) : (guild.total_xp?.toLocaleString() || 0)}
                                </div>
                                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                                    {period === 'weekly' ? 'Weekly XP' : 'Total XP'}
                                </div>
                            </div>
                        </div>
                    ))}
                    {leaderboard.length === 0 && (
                        <div className="text-center p-8 text-slate-500">No guilds available yet.</div>
                    )}
                </div>
            )}
        </div>
    );
}
