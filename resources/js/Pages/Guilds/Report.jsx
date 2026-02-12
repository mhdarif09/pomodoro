import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ChartBarIcon, ClockIcon, CheckBadgeIcon, UserGroupIcon,
    ArrowTrendingUpIcon, TrophyIcon
} from '@heroicons/react/24/outline';

export default function GuildReport({ auth, guild, stats, topContributors }) {
    return (
        <AuthenticatedLayout header={null}>
            <Head title={`${guild.name} - Report`} />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-slate-900 dark:text-white">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <ChartBarIcon className="w-8 h-8 text-teal-500" />
                            Guild Analytics
                        </h1>
                        <p className="text-slate-500 font-medium">Performance report for {guild.name}</p>
                    </div>
                    {/* Date Range Picker Placeholder */}
                    <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500">
                        Last 30 Days
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        title="Total Focus Hours"
                        value={stats.total_focus_hours}
                        unit="hrs"
                        icon={<ClockIcon className="w-6 h-6 text-teal-500" />}
                        trend="+12%"
                        color="teal"
                    />
                    <StatCard
                        title="Missions Completed"
                        value={stats.tasks_completed}
                        unit="tasks"
                        icon={<CheckBadgeIcon className="w-6 h-6 text-emerald-500" />}
                        trend="+5%"
                        color="emerald"
                    />
                    <StatCard
                        title="Active Members"
                        value={stats.active_members}
                        unit="heroes"
                        icon={<UserGroupIcon className="w-6 h-6 text-amber-500" />}
                        trend="stable"
                        color="amber"
                    />
                    <StatCard
                        title="Productivity Score"
                        value="92"
                        unit="/100"
                        icon={<ArrowTrendingUpIcon className="w-6 h-6 text-rose-500" />}
                        trend="+2pts"
                        color="rose"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart Placeholder */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg">Focus Activity Trend</h3>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-2 px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                            {/* Mock Chart Bars */}
                            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                                <div key={i} className="w-full bg-teal-50 dark:bg-teal-900/10 rounded-t-lg relative group">
                                    <div
                                        className="absolute bottom-0 w-full bg-teal-500 rounded-t-lg transition-all duration-1000 group-hover:bg-teal-400"
                                        style={{ height: `${h}%` }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
                            <span>Week 1</span>
                            <span>Week 2</span>
                            <span>Week 3</span>
                            <span>Week 4</span>
                        </div>
                    </div>

                    {/* Top Contributors */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <TrophyIcon className="w-5 h-5 text-amber-500" /> MVP Leaderboard
                        </h3>
                        <div className="space-y-6">
                            {topContributors.map((member, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full font-black text-xs ${idx === 0 ? 'bg-amber-100 text-amber-600' :
                                        idx === 1 ? 'bg-slate-100 text-slate-600' :
                                            idx === 2 ? 'bg-orange-100 text-orange-600' :
                                                'text-slate-400'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                                        {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : <span className="font-bold text-slate-400 text-xs">{member.name.charAt(0)}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm truncate">{member.name}</h4>
                                        <p className="text-xs text-slate-400">{member.completed_tasks} missions done</p>
                                    </div>
                                    <div className="font-mono text-xs font-bold text-emerald-500">
                                        +{member.score} pts
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ title, value, unit, icon, trend, color }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-${color}-500`}>
                {/* Clone icon for background effect */}
                <div className="scale-[3] transform origin-top-right">{icon}</div>
            </div>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-${color}-50 dark:bg-${color}-900/10`}>
                    {icon}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${color}-50 text-${color}-600 dark:bg-${color}-900/20 dark:text-${color}-400`}>
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">{value}</h3>
                    <span className="text-sm font-bold text-slate-400">{unit}</span>
                </div>
            </div>
        </div>
    );
}
