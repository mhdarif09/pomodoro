import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { TrophyIcon, FireIcon, StarIcon, ChartBarIcon, CalendarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import Heatmap from '@uiw/react-heat-map';

export default function ProfileShow({ auth, stats, achievements, heatmapData }) {
    // Format heatmap data to match the component's expected format (YYYY/MM/DD)
    const formattedHeatmap = heatmapData.map(d => ({
        date: d.date.replace(/-/g, '/'),
        count: d.count
    }));

    // Example start and end dates for heatmap (last 6 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 6);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-black text-2xl text-slate-800 dark:text-neutral-200 tracking-tight">Gamification Profile</h2>
                    <Link href={route('profile.edit')} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors flex items-center gap-2 text-sm font-bold">
                        <Cog6ToothIcon className="w-4 h-4" />
                        Settings
                    </Link>
                </div>
            }
        >
            <Head title={`Profile - ${stats.name}`} />

            <div className="py-8 bg-[#F5F5F7] dark:bg-black min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Header Info */}
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-emerald-600 p-1 flex-shrink-0">
                                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[1.8rem] overflow-hidden flex items-center justify-center text-5xl font-black text-slate-700 dark:text-slate-300 shadow-inner">
                                    {stats.avatar ? <img src={stats.avatar} alt="Avatar" className="w-full h-full object-cover" /> : stats.name.charAt(0)}
                                </div>
                            </div>
                            <div className="absolute -bottom-3 -right-3 bg-white dark:bg-[#1C1C1E] p-1.5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 flex items-center gap-1.5 px-3">
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Lv. {stats.level}</span>
                            </div>
                        </div>

                        {/* Name & Title */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{stats.name}</h1>
                            <div className="text-emerald-500 font-bold uppercase tracking-wider text-sm mt-1 mb-2">{stats.rank_title}</div>
                            <p className="text-slate-500 text-sm">Joined {stats.joined_at}</p>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[100px]">
                                <TrophyIcon className="w-6 h-6 text-amber-500 mb-1" />
                                <div className="text-xl font-black text-slate-700 dark:text-slate-200">{stats.total_xp.toLocaleString()}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total XP</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[100px]">
                                <FireIcon className="w-6 h-6 text-orange-500 mb-1" />
                                <div className="text-xl font-black text-slate-700 dark:text-slate-200">{stats.streak}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Day Streak</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[100px]">
                                <StarIcon className="w-6 h-6 text-yellow-400 mb-1" />
                                <div className="text-xl font-black text-slate-700 dark:text-slate-200">{stats.highest_streak}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Best Streak</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[100px]">
                                <ChartBarIcon className="w-6 h-6 text-blue-500 mb-1" />
                                <div className="text-xl font-black text-slate-700 dark:text-slate-200">#{stats.rank ?? '-'}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global Rank</div>
                            </div>
                        </div>
                    </div>

                    {/* Consistency Calendar (Heatmap) */}
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-white">
                            <CalendarIcon className="w-5 h-5 text-emerald-500" />
                            <h3 className="font-black text-lg">Consistency Calendar</h3>
                        </div>
                        <div className="overflow-x-auto pb-4 custom-scrollbar">
                            <div className="min-w-[700px]">
                                <Heatmap
                                    value={formattedHeatmap}
                                    startDate={startDate}
                                    endDate={endDate}
                                    panelColors={{
                                        0: 'rgba(203, 213, 225, 0.2)', // slate-300 light
                                        2: '#A7F3D0', // emerald-200
                                        4: '#34D399', // emerald-400
                                        10: '#10B981', // emerald-500
                                        20: '#059669', // emerald-600
                                        30: '#047857'  // emerald-700
                                    }}
                                    rectSize={14}
                                    rectProps={{
                                        rx: 4 // rounded corners
                                    }}
                                    space={4}
                                    legendCellSize={14}
                                    style={{ color: '#64748b' }} // slate-500 for text
                                />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-4 text-center">Completed tasks over the last 6 months</p>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                                <TrophyIcon className="w-5 h-5 text-amber-500" />
                                <h3 className="font-black text-lg">Achievements</h3>
                            </div>
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                {achievements.length} Unlocked
                            </span>
                        </div>

                        {achievements.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {achievements.map(ach => (
                                    <div key={ach.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-200 flex items-center justify-center text-2xl shadow-inner shrink-0">
                                            {ach.icon || '🏆'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ach.name}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{ach.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                <div className="text-4xl mb-3 opacity-50">🏆</div>
                                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400">No achievements yet.</h4>
                                <p className="text-xs text-slate-400 mt-1">Keep completing tasks to earn rewards!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
