import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrophyIcon, SparklesIcon, FireIcon } from '@heroicons/react/24/outline';

export default function GlobalLeaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('all_time'); // 'all_time' or 'weekly'

    useEffect(() => {
        fetchLeaderboard();
    }, [period]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await axios.get(route('gamification.leaderboard'), { params: { period, limit: 100 } });
            setLeaderboard(res.data.leaderboard);
        } catch (error) {
            console.error("Failed to load global leaderboard", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-amber-500" /> Global Top Users
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">The most consistent heroes across all realms.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setPeriod('weekly')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${period === 'weekly' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setPeriod('all_time')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${period === 'all_time' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        All Time
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-3">
                    {leaderboard.map((user, idx) => (
                        <div key={user.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                            <div className="w-8 font-black text-slate-400 text-center">
                                #{idx + 1}
                            </div>
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-slate-600 shadow-inner overflow-hidden">
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 dark:text-white">{user.name}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                        Lv. {user.level || 1}
                                    </span>
                                    <span className="text-[10px] text-slate-500">{user.rank_title || 'Novice'}</span>

                                    {user.streak > 0 && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                                            <FireIcon className="w-3 h-3" /> {user.streak}d
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-black text-slate-900 dark:text-white text-lg">
                                    {user.total_xp?.toLocaleString() || 0}
                                </div>
                                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total XP</div>
                            </div>
                        </div>
                    ))}
                    {leaderboard.length === 0 && (
                        <div className="text-center p-8 text-slate-500">No data available yet.</div>
                    )}
                </div>
            )}
        </div>
    );
}
