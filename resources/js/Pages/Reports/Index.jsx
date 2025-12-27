import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
    ClockIcon,
    CheckBadgeIcon,
    FireIcon,
    ChartBarIcon,
    ArrowUpIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

const PRIORITY_COLORS = {
    'Low': '#94a3b8',
    'Medium': '#0ea5e9',
    'High': '#f43f5e',
    'Urgent': '#b91c1c'
};

export default function Index({ auth, stats }) {
    const {
        weeklyFocus,
        completionRate,
        totalCompleted,
        totalTasks,
        priorityDistribution,
        streak,
        totalFocusMinutes
    } = stats;

    const cards = [
        {
            title: 'Total Waktu Fokus',
            value: `${Math.round(totalFocusMinutes / 60)}h ${totalFocusMinutes % 60}m`,
            icon: ClockIcon,
            color: 'bg-teal-500',
            trend: '+12% from last week'
        },
        {
            title: 'Tugas Selesai',
            value: totalCompleted,
            icon: CheckBadgeIcon,
            color: 'bg-emerald-500',
            trend: `${completionRate}% Completion Rate`
        },
        {
            title: 'Productivity Streak',
            value: `${streak} Hari`,
            icon: FireIcon,
            color: 'bg-orange-500',
            trend: 'Keep it going!'
        }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Productivity Report</h2>}
        >
            <Head title="Productivity Report" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Progress & Insights</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Lihat bagaimana kamu mengalokasikan waktumu minggu ini.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <CalendarIcon className="w-5 h-5 text-teal-500" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative overflow-hidden group"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${card.color} opacity-[0.03] rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110`} />

                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-2xl ${card.color} text-white shadow-lg`}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{card.title}</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{card.value}</h3>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                                    {card.trend}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Weekly Focus Chart */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Trend Fokus Mingguan</h3>
                            <ChartBarIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyFocus}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9', radius: 10 }}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            padding: '12px'
                                        }}
                                    />
                                    <Bar
                                        dataKey="minutes"
                                        fill="#14b8a6"
                                        radius={[10, 10, 10, 10]}
                                        barSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right Column: Distribution & Completion */}
                    <div className="space-y-8">
                        {/* Task Completion Progress */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-32 -mt-32" />

                            <div className="relative z-10">
                                <h3 className="text-lg font-black mb-6">Pencapaian Tugas</h3>
                                <div className="flex items-center gap-8">
                                    <div className="relative w-32 h-32 flex-shrink-0">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="transparent"
                                                className="text-white/10"
                                            />
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="transparent"
                                                strokeDasharray={351.8}
                                                strokeDashoffset={351.8 - (351.8 * completionRate) / 100}
                                                strokeLinecap="round"
                                                className="text-teal-400"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl font-black">{completionRate}%</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Selesai</p>
                                                <p className="text-xl font-black">{totalCompleted} <span className="text-sm font-medium text-white/40">/ {totalTasks}</span></p>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${completionRate}%` }}
                                                    className="h-full bg-teal-400 rounded-full"
                                                />
                                            </div>
                                            <p className="text-[11px] text-white/60 font-medium">Kamu telah menyelesaikan {totalCompleted} tugas penting minggu ini. Pertahankan!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Priority Distribution */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Distribusi Prioritas</h3>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={priorityDistribution}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {priorityDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || '#94a3b8'} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {priorityDistribution.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[entry.name] || '#94a3b8' }} />
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{entry.name}: {entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Growth Insights */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -mr-48 -mt-48" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-24 h-24 bg-teal-500/10 rounded-3xl flex items-center justify-center flex-shrink-0 animate-bounce">
                            <ArrowUpIcon className="w-12 h-12 text-teal-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Growth Insider</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
                                {streak >= 3
                                    ? `Luar biasa! Streak ${streak} hari menunjukkan kedisiplinan yang tinggi. Waktu fokus paling produktifmu adalah di hari ${weeklyFocus.sort((a, b) => b.minutes - a.minutes)[0]?.day || 'ini'}.`
                                    : "Mulai bangun kebiasaan fokus setiap hari untuk melihat peningkatan produktivitas yang signifikan."
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
