import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StreakShareModal from '@/Components/Gamification/StreakShareModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ClockIcon,
    CheckBadgeIcon,
    FireIcon,
    SparklesIcon,
    LockClosedIcon,
    CalendarIcon,
    ArrowTrendingUpIcon,
    BoltIcon,
    ChartBarIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

const BentoTile = ({ children, className = "", delay = 0, useGlass = true }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        className={`${useGlass ? 'apple-glass' : ''} rounded-[2.5rem] p-6 shadow-xl border border-white/10 ${className}`}
    >
        {children}
    </motion.div>
);

export default function Index({ auth }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showStreakModal, setShowStreakModal] = useState(false);

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
        completionRate = 0,
        totalCompleted = 0,
        totalTasks = 0,
        streak = 0,
        totalFocusMinutes = 0,
        focusSuccessRate = 0,
        focusDropHours = 'Tidak ada',
        topProductiveHour = '-',
        aiInsights = {},
        taskRescheduledCount = 0
    } = stats || {};

    if (!isPremium) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Productivity Report" />
                <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-slate-50 dark:bg-black/20 backdrop-blur-3xl z-0" />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="relative z-10 w-full max-w-md mx-4"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-[3rem] blur-2xl opacity-20 animate-pulse" />
                        <div className="relative bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-white/20 text-center">
                            <div className="w-24 h-24 mx-auto mb-8 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                                <LockClosedIcon className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Unlock Insights</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 leading-relaxed">
                                Fitur laporan produktivitas mendalam ini tersedia khusus untuk member Premium.
                            </p>
                            <div className="space-y-4">
                                <Link
                                    href={route('subscribe.index')}
                                    className="block w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
                                >
                                    Upgrade Sekarang
                                </Link>
                                <Link href={route('dashboard')} className="block w-full py-4 text-slate-400 hover:text-slate-600 font-bold">
                                    Kembali ke Dashboard
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header={<h2 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight">Analisis Produktivitas</h2>}>
            <Head title="Productivity" />

            <div className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-5">

                {/* 1. HERO ROW: Core Performance */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Completion Rate Hero */}
                    <BentoTile
                        useGlass={false}
                        className="col-span-12 lg:col-span-7 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                            <CheckBadgeIcon className="w-64 h-64 -rotate-12" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-100 opacity-80 mb-2 block">Task Efficiency</span>
                                <h1 className="text-6xl font-black tracking-tighter mb-4 leading-none">
                                    {completionRate}% <span className="text-2xl opacity-60">Selesai</span>
                                </h1>
                                <p className="text-emerald-50 font-bold max-w-sm">
                                    Kamu telah menyelesaikan <span className="underline decoration-emerald-300 decoration-2">{totalCompleted}</span> tugas dari total <span className="underline decoration-emerald-300 decoration-2">{totalTasks}</span> tugas yang direncanakan.
                                </p>
                            </div>

                            <div className="mt-8 flex items-center gap-4">
                                <div className="flex-1 h-3 bg-black/20 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completionRate}%` }}
                                        className="h-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)]"
                                    />
                                </div>
                                <span className="text-xs font-black text-emerald-100 uppercase tracking-widest">{completionRate}/100</span>
                            </div>
                        </div>
                    </BentoTile>

                    {/* Streak Tile */}
                    <BentoTile className="col-span-12 lg:col-span-5 bg-white dark:bg-slate-900 group">
                        <div className="flex flex-col h-full justify-between">
                            <div className="flex items-start justify-between">
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-[1.5rem] text-orange-500">
                                    <FireIcon className="w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Streak</span>
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white leading-none mt-1">{streak} Hari</h3>
                                </div>
                            </div>

                            <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic">
                                    {streak >= 3 ? "🔥 Momentum luar biasa! Teruskan produktivitasmu." : "Ayo bangun momentum! Fokus setiap hari untuk streak lebih panjang."}
                                </p>
                            </div>

                            <button 
                                onClick={() => setShowStreakModal(true)}
                                className="mt-4 w-full py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20"
                            >
                                <FireIcon className="w-4 h-4" /> Share Streak Card
                            </button>

                            <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                <ArrowTrendingUpIcon className="w-4 h-4" />
                                <span>Steady Progress</span>
                            </div>
                        </div>
                    </BentoTile>
                </div>

                {/* 2. MAIN ROW: Time & Analytics */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Focus Time Tile */}
                    <BentoTile className="col-span-12 lg:col-span-4 bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/50">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                    <ClockIcon className="w-6 h-6" />
                                </div>
                                <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest">Focus Engine</h4>
                            </div>

                            <div>
                                <h1 className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
                                    {Math.floor(totalFocusMinutes / 60)}j {totalFocusMinutes % 60}m
                                </h1>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Akumulasi Waktu Fokus</p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-indigo-100 dark:border-indigo-900/30">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quality Score</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{focusSuccessRate}%</p>
                                </div>
                                <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-indigo-500 flex items-center justify-center text-[10px] font-black text-indigo-500 rotate-12">
                                    HQ
                                </div>
                            </div>
                        </div>
                    </BentoTile>

                    {/* Peak Performance Heatmap */}
                    <BentoTile className="col-span-12 lg:col-span-8 group">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest flex items-center gap-2">
                                <BoltIcon className="w-5 h-5 text-yellow-500" />
                                Peak Performance
                            </h4>
                            <span className="text-[10px] font-bold text-slate-400">Activity Heatmap</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <SparklesIcon className="w-20 h-20" />
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 shadow-sm uppercase tracking-widest mb-4 block">Power Hour</span>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{topProductiveHour}</h3>
                                <p className="text-xs font-bold text-slate-500 dark:text-emerald-600/70 leading-relaxed italic">
                                    Ini adalah waktu emasmu. Semua task berat diselesaikan di jam ini.
                                </p>
                            </div>

                            <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 relative overflow-hidden">
                                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-4 block">Focus Dip</span>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                                    {focusDropHours === 'Tidak ada penurunan signifikan' ? 'Stable' : focusDropHours.split(',')[0]}
                                </h3>
                                <p className="text-xs font-bold text-slate-500 dark:text-amber-600/70 leading-relaxed italic">
                                    {focusDropHours === 'Tidak ada penurunan signifikan' ? 'Konsistensi fokusmu luar biasa tinggi.' : 'Disarankan untuk melakukan break atau meditasi di jam ini.'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-bold text-slate-500 italic">Task Rescheduled: <span className="text-indigo-500 font-black">{taskRescheduledCount}</span></span>
                            </div>
                            <Link href="#" className="text-[10px] font-black text-emerald-500 hover:text-emerald-600 uppercase tracking-widest">Detailed Log</Link>
                        </div>
                    </BentoTile>
                </div>

                {/* 3. AI STRATEGY SECTION */}
                <BentoTile
                    useGlass={false}
                    className="bg-slate-900 dark:bg-black text-white p-10 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform duration-[3s] group-hover:scale-110" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -ml-48 -mb-48" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-12">
                            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
                                <SparklesIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter leading-none">Analisis Strategis AI</h2>
                                <p className="text-emerald-400 text-sm font-black uppercase tracking-[0.2em] mt-2">Personal Growth Strategist</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {aiInsights?.recommendations?.map((rec, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ x: 5 }}
                                    className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex gap-4 items-start transition-colors hover:bg-white/10"
                                >
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-1">
                                        <BoltIcon className="w-4 h-4" />
                                    </div>
                                    <p className="text-slate-300 font-bold leading-relaxed">{rec.text}</p>
                                </motion.div>
                            ))}
                        </div>

                        {aiInsights?.focus_drop && (
                            <div className="mt-8 p-6 rounded-[2rem] bg-indigo-500/20 border border-indigo-500/20 backdrop-blur-md">
                                <div className="flex items-center gap-3 mb-2 font-black uppercase tracking-widest text-indigo-400 text-xs text-">
                                    <span>⚠️ Focus Anomaly Detected</span>
                                </div>
                                <p className="text-slate-200 font-bold">{aiInsights.focus_drop.message}</p>
                            </div>
                        )}

                        <div className="mt-12 flex justify-center">
                            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-white/5 flex items-center gap-2">
                                Download PDF Report <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </BentoTile>
            </div>

            {/* Loading Indicator for Dynamic Updates */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-xl z-[100] flex items-center justify-center"
                    >
                        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>

            <StreakShareModal
                isOpen={showStreakModal}
                onClose={() => setShowStreakModal(false)}
            />
        </AuthenticatedLayout>
    );
}