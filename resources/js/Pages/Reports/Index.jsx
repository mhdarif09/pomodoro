import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ClockIcon,
    CheckBadgeIcon,
    FireIcon,
    SparklesIcon,
    LockClosedIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';

export default function Index({ auth }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

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
        focusDropHours = 'Tidak ada',
        topProductiveHour = '-',
        aiInsights = {},
        taskRescheduledCount = 0
    } = stats || {};

    const insightsCards = [
        {
            title: 'Total Waktu Fokus',
            value: `${Math.floor(totalFocusMinutes / 60)}j ${totalFocusMinutes % 60}m`,
            icon: ClockIcon,
            color: 'bg-teal-500',
            description: 'Akumulasi waktu fokus kamu'
        },
        {
            title: 'Tugas Selesai',
            value: `${completionRate}%`,
            icon: CheckBadgeIcon,
            color: 'bg-emerald-500',
            description: `${totalCompleted} dari ${totalTasks} task`
        },
        {
            title: 'Productivity Streak',
            value: `${streak} Hari`,
            icon: FireIcon,
            color: 'bg-orange-500',
            description: streak >= 3 ? 'Luar biasa! Keep going! 🔥' : 'Mulai bangun kebiasaan fokus'
        },
        {
            title: 'Jam Paling Produktif',
            value: topProductiveHour,
            icon: SparklesIcon,
            color: 'bg-blue-500',
            description: 'Waktu terbaik untuk task berat'
        },
        {
            title: 'Jam Fokus Drop',
            value: focusDropHours === 'Tidak ada penurunan signifikan' ? '✨ Bagus!' : focusDropHours.split(',')[0],
            icon: ClockIcon,
            color: focusDropHours === 'Tidak ada penurunan signifikan' ? 'bg-green-500' : 'bg-yellow-500',
            description: focusDropHours === 'Tidak ada penurunan signifikan' ? 'Konsistensi bagus!' : 'Hindari task berat di jam ini'
        },
        {
            title: 'Task Di-reschedule',
            value: taskRescheduledCount,
            icon: CalendarIcon,
            color: 'bg-purple-500',
            description: taskRescheduledCount > 0 ? 'Otomatis dipindah ke besok' : 'Semua sesuai jadwal'
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

            <div className="relative min-h-screen pb-20">
                {/* Premium Lock Overlay */}
                {!isPremium && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-slate-100/60 dark:bg-black/60 backdrop-blur-2xl z-10" />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                            className="relative z-20 w-full max-w-md mx-4"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-600 rounded-[2.5rem] blur-2xl opacity-20 dark:opacity-40 animate-pulse" />

                            <div className="relative bg-white dark:bg-[#1C1C1E] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 text-center">
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

                {/* Content Area */}
                <div className={`py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 ${!isPremium ? 'filter blur-sm select-none pointer-events-none' : ''}`}>

                    {/* Header Section  */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-[900] text-slate-900 dark:text-white tracking-tight leading-none">Wawasan & Progress</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-3 font-semibold text-lg tracking-tight">Insight produktivitas yang mudah dipahami</p>
                        </div>
                        <div className="flex items-center gap-3 apple-glass px-5 py-3 rounded-2xl border-white/10 shadow-lg bg-white/50 dark:bg-slate-800/50">
                            <CalendarIcon className="w-5 h-5 text-teal-500 stroke-2" />
                            <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                                {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-teal-500 rounded-full animate-spin" />
                            <p className="mt-4 font-bold text-slate-400">Memuat Data...</p>
                        </div>
                    )}

                    {/* Simplified Insights Cards */}
                    {!loading && stats && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {insightsCards.map((card, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="apple-glass p-6 rounded-[2.5rem] shadow-xl border-white/10 relative overflow-hidden group bg-white dark:bg-slate-900"
                                    >
                                        <div className={`absolute top-0 right-0 w-24 h-24 ${card.color} opacity-[0.08] rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-125 blur-xl`} />
                                        <div className="relative z-10">
                                            <div className={`p-3 rounded-2xl ${card.color} text-white shadow-lg inline-block mb-4`}>
                                                <card.icon className="w-6 h-6" />
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">{card.title}</p>
                                            <h3 className="text-3xl font-[900] text-slate-900 dark:text-white mb-2">{card.value}</h3>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* AI Recommendations */}
                            {aiInsights && aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                                <div className="apple-glass p-8 rounded-[3rem] shadow-xl border-white/10 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-black relative overflow-hidden mt-8">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 text-teal-600 dark:text-teal-400">
                                                <SparklesIcon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-[900] text-slate-900 dark:text-white">Rekomendasi AI</h3>
                                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Tips untuk meningkatkan produktivitas</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {aiInsights.recommendations.map((rec, idx) => (
                                                <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                                    <span className="text-2xl">💡</span>
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{rec.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}