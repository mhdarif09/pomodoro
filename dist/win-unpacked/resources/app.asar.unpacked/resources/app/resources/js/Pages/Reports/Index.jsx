import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    ClockIcon,
    CheckBadgeIcon,
    FireIcon,
    ChartBarIcon,
    ArrowUpIcon,
    CalendarIcon,
    LockClosedIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const PRIORITY_COLORS = {
    'Low': '#94a3b8',
    'Medium': '#0ea5e9',
    'High': '#f43f5e',
    'Urgent': '#b91c1c'
};

export default function Index({ auth }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cek status premium user
    const isPremium = auth.user.premium_features && auth.user.premium_features.productivity_report;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(route('reports.index'));
                setStats(response.data);
                setTimeout(() => setLoading(false), 500);
            } catch (error) {
                console.error("Gagal memuat data laporan:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const {
        weeklyFocus = [],
        completionRate = 0,
        totalCompleted = 0,
        totalTasks = 0,
        priorityDistribution = [],
        streak = 0,
        totalFocusMinutes = 0
    } = stats || {};

    const cards = [
        {
            title: 'Total Waktu Fokus',
            value: `${Math.round(totalFocusMinutes / 60)}h ${totalFocusMinutes % 60}m`,
            icon: ClockIcon,
            color: 'bg-teal-500',
            trend: '+Productivity'
        },
        {
            title: 'Tugas Selesai',
            value: totalCompleted,
            icon: CheckBadgeIcon,
            color: 'bg-emerald-500',
            trend: `${completionRate}% Rate`
        },
        {
            title: 'Productivity Streak',
            value: `${streak} Hari`,
            icon: FireIcon,
            color: 'bg-orange-500',
            trend: 'Keep going!'
        }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="font-[900] text-3xl text-slate-900 dark:text-white tracking-tight">
                        Produktivitas
                    </h2>
                </div>
            }
        >
            <Head title="Productivity Report" />

            {/* Container Utama: Relative agar Overlay bisa absolute terhadap ini */}
            <div className="relative min-h-screen pb-20">
                
                {/* --- PREMIUM LOCK OVERLAY (IOS STYLE) --- */}
                {!isPremium && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
                        {/* 1. Backdrop Blur Total */}
                        <div className="absolute inset-0 bg-slate-100/60 dark:bg-black/60 backdrop-blur-2xl z-10" />
                        
                        {/* 2. Floating Card */}
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                            className="relative z-20 w-full max-w-md mx-4"
                        >
                            {/* Glow Effect di belakang card */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-600 rounded-[2.5rem] blur-2xl opacity-20 dark:opacity-40 animate-pulse" />
                            
                            <div className="relative bg-white dark:bg-[#1C1C1E] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 text-center">
                                {/* Icon Lock Gradient */}
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-tr from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shadow-inner">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                        <LockClosedIcon className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                <h3 className="text-3xl font-[900] text-slate-900 dark:text-white mb-3 tracking-tight leading-tight">
                                    Unlock Insights
                                </h3>
                                
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
                                    Analisis mendalam ini eksklusif untuk member Premium. Tingkatkan produktivitasmu dengan data nyata.
                                </p>

                                <div className="space-y-3">
                                    <Link 
                                        href={route('subscribe.index')}
                                        className="block w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Upgrade Sekarang
                                    </Link>
                                    <Link 
                                        href={route('dashboard')}
                                        className="block w-full py-4 bg-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold transition-colors"
                                    >
                                        Kembali
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* --- CONTENT AREA (Diberi padding wrapper agar rapi) --- */}
                <div className={`py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 ${!isPremium ? 'filter blur-sm select-none pointer-events-none' : ''}`}>
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-[900] text-slate-900 dark:text-white tracking-tight leading-none">Wawasan & Progress</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-3 font-semibold text-lg tracking-tight">Pantau performa dan alokasi waktumu minggu ini.</p>
                        </div>
                        <div className="flex items-center gap-3 apple-glass px-5 py-3 rounded-2xl border-white/10 shadow-lg bg-white/50 dark:bg-slate-800/50">
                            <CalendarIcon className="w-5 h-5 text-teal-500 stroke-2" />
                            <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                                {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    {/* Loading State */}
                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#F2F2F7] dark:bg-black rounded-[3rem]"
                            >
                                <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-teal-500 rounded-full animate-spin" />
                                <p className="mt-4 font-bold text-slate-400">Memuat Data...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Konten Utama (Hanya render jika stats ada) */}
                    {!loading && stats && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                            
                            {/* Stat Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                {cards.map((card, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="apple-glass p-6 rounded-[2.5rem] shadow-xl border-white/10 relative overflow-hidden group bg-white dark:bg-slate-900"
                                    >
                                        <div className={`absolute top-0 right-0 w-24 h-24 ${card.color} opacity-[0.08] rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-125 blur-xl`} />
                                        <div className="flex justify-between items-start relative z-10">
                                            <div className={`p-3.5 rounded-2xl ${card.color} text-white shadow-lg`}>
                                                <card.icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">{card.title}</p>
                                                <h3 className="text-2xl font-[900] text-slate-900 dark:text-white">{card.value}</h3>
                                            </div>
                                        </div>
                                        <div className="mt-6">
                                            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                {card.trend}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Main Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                                {/* Weekly Focus Chart */}
                                <div className="apple-glass p-8 rounded-[3rem] shadow-xl border-white/10 bg-white dark:bg-slate-900">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-xl font-[900] text-slate-900 dark:text-white">Trend Fokus</h3>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase">7 Hari Terakhir</p>
                                        </div>
                                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-teal-500">
                                            <ChartBarIcon className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={weeklyFocus}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dx={-10} />
                                                <Tooltip 
                                                    cursor={{ fill: 'transparent' }}
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                                />
                                                <Bar dataKey="minutes" fill="#14b8a6" radius={[8, 8, 8, 8]} barSize={24} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Right Column: Stats */}
                                <div className="space-y-8">
                                    {/* Completion Rate */}
                                    <div className="bg-slate-900 dark:bg-black p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                                        <h3 className="text-lg font-[900] mb-6 relative z-10">Pencapaian Tugas</h3>
                                        <div className="flex items-center gap-8 relative z-10">
                                            <div className="relative w-32 h-32 flex-shrink-0">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={351.8} strokeDashoffset={351.8 - (351.8 * completionRate) / 100} strokeLinecap="round" className="text-teal-400 transition-all duration-1000" />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-2xl font-[900]">{completionRate}%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white/40 uppercase mb-1">Selesai</p>
                                                <p className="text-3xl font-[900] mb-4">{totalCompleted} <span className="text-lg text-white/30">/ {totalTasks}</span></p>
                                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${completionRate}%` }} className="h-full bg-teal-400 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Priority Pie */}
                                    <div className="apple-glass p-8 rounded-[3rem] shadow-xl border-white/10 bg-white dark:bg-slate-900">
                                        <h3 className="text-lg font-[900] text-slate-900 dark:text-white mb-6">Prioritas</h3>
                                        <div className="flex items-center gap-6">
                                            <div className="h-32 w-32 flex-shrink-0">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={priorityDistribution} innerRadius={35} outerRadius={55} paddingAngle={5} dataKey="value" stroke="none">
                                                            {priorityDistribution.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || '#94a3b8'} />
                                                            ))}
                                                        </Pie>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="flex-1 grid grid-cols-2 gap-3">
                                                {priorityDistribution.map((entry, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[entry.name] || '#94a3b8' }} />
                                                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{entry.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Growth Insights */}
                            <div className="apple-glass p-8 rounded-[3rem] shadow-xl border-white/10 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-black relative overflow-hidden">
                                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                                    <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 text-teal-600 dark:text-teal-400">
                                        <SparklesIcon className="w-10 h-10" />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-2xl font-[900] text-slate-900 dark:text-white">Growth Insider</h3>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-2xl">
                                            {streak >= 3
                                                ? `Luar biasa! Streak ${streak} hari menunjukkan kedisiplinan tinggi. Terus pertahankan momentum ini!`
                                                : "Mulai bangun kebiasaan fokus secara konsisten. Konsistensi kecil setiap hari membawa hasil besar."
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}