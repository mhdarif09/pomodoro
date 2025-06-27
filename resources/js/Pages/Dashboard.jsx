import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
// Import Ikon
import { ChartBarIcon, ClockIcon, HandRaisedIcon, ArrowTrendingUpIcon, LightBulbIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

// Komponen Kartu Statistik yang dapat digunakan kembali
const StatsCard = ({ icon, label, value, unit, isPremiumFeature = false, isPremiumUser }) => (
    <div className={`relative bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg shadow-sm ${!isPremiumUser && isPremiumFeature ? 'blur-sm' : ''}`}>
        <div className="flex items-start gap-4">
            <div className="bg-teal-100 dark:bg-teal-900/50 p-2 rounded-md">
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {value} <span className="text-base font-normal">{unit}</span>
                </p>
            </div>
        </div>
    </div>
);

// Komponen Overlay untuk fitur premium
const PremiumLockOverlay = ({ onUpgradeClick }) => (
    <div className="absolute inset-0 bg-slate-800/60 backdrop-blur-md rounded-xl flex items-center justify-center z-10 p-6 text-center">
        <div className="space-y-4">
            <LockClosedIcon className="h-12 w-12 text-yellow-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Buka Analisis & Rekomendasi</h3>
            <p className="text-sm text-slate-200">Upgrade ke Premium untuk mendapatkan insight penuh tentang produktivitas Anda.</p>
            <button
                onClick={onUpgradeClick} // Anda perlu meneruskan fungsi untuk membuka modal upgrade
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold px-6 py-2 rounded-full shadow-lg text-sm transition-transform transform hover:scale-105"
            >
                ✨ Upgrade Sekarang
            </button>
        </div>
    </div>
);


export default function Dashboard({ auth, leaderboard = [], subscription, pomodoroStats = {} }) {
    // Efek untuk memuat Midtrans Snap.js
    useEffect(() => {
        if (!window.snap) {
            const script = document.createElement('script');
            script.src = 'https://app.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const isPremium = !!subscription;

    // Logika untuk menghasilkan rekomendasi berdasarkan statistik
    const recommendations = useMemo(() => {
        const suggestions = [];
        const { totalSessions, manuallyStoppedCount, tabSwitches } = pomodoroStats;

        if (totalSessions > 0) {
            if (manuallyStoppedCount / totalSessions > 0.4) {
                suggestions.push("Banyak sesi dihentikan manual. Mungkin durasi fokus 25 menit terlalu lama? Coba kurangi menjadi 20 menit.");
            }
            if (tabSwitches / totalSessions > 5) {
                suggestions.push("Anda sering beralih tab. Manfaatkan fitur 'Blokir Situs' untuk membantu Anda tetap fokus pada satu tugas.");
            }
        }
        if (totalSessions < 5) {
             suggestions.push("Konsistensi adalah kunci. Coba jadwalkan 1-2 sesi Pomodoro setiap hari untuk membangun kebiasaan.");
        } else {
             suggestions.push("Kerja bagus! Anda telah membangun kebiasaan fokus. Pertahankan momentum ini.");
        }
        
        return suggestions;
    }, [pomodoroStats]);

    const getMedal = (index) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return <span className="text-slate-400">{index + 1}</span>;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">

                {/* Welcome Message & Subscription Status */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-lg border border-slate-200 dark:border-slate-700 shadow-lg sm:rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">👋 Selamat datang, {auth.user.name}!</h3>
                    {isPremium ? (
                        <p className="text-sm text-teal-500 dark:text-teal-400 mt-2 flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5"/>
                            <span>Status Premium aktif hingga: {new Date(subscription.expired_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </p>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Anda menggunakan akun gratis. Upgrade untuk fitur penuh.</p>
                    )}
                </motion.div>

                {/* Analysis & Recommendations Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
                    <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-lg border border-slate-200 dark:border-slate-700 shadow-lg sm:rounded-2xl p-6 space-y-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <ChartBarIcon className="h-6 w-6 text-teal-500" />
                            Analisis Produktivitas
                        </h3>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatsCard icon={<ArrowTrendingUpIcon className="h-6 w-6 text-teal-600 dark:text-teal-400"/>} label="Total Sesi" value={pomodoroStats.totalSessions ?? 0} unit="sesi" isPremiumUser={isPremium} />
                            <StatsCard icon={<ClockIcon className="h-6 w-6 text-teal-600 dark:text-teal-400"/>} label="Waktu Fokus" value={Math.round((pomodoroStats.totalFocusMinutes ?? 0) / 60)} unit="jam" isPremiumUser={isPremium} />
                            <StatsCard icon={<HandRaisedIcon className="h-6 w-6 text-orange-500 dark:text-orange-400"/>} label="Sesi Dihentikan" value={pomodoroStats.manuallyStoppedCount ?? 0} unit="kali" isPremiumFeature={true} isPremiumUser={isPremium} />
                            <StatsCard icon={<ChartBarIcon className="h-6 w-6 text-rose-500 dark:text-rose-400"/>} label="Pengalih Perhatian" value={pomodoroStats.tabSwitches ?? 0} unit="kali" isPremiumFeature={true} isPremiumUser={isPremium} />
                        </div>
                        
                        {/* Recommendations */}
                        <div className="pt-4">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                                <LightBulbIcon className="h-5 w-5 text-yellow-500" />
                                Rekomendasi untuk Anda
                            </h4>
                            <ul className="space-y-2 text-sm list-disc list-inside text-slate-600 dark:text-slate-300">
                                {recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                            </ul>
                        </div>
                    </div>
                    {!isPremium && <PremiumLockOverlay />}
                </motion.div>
                
                {/* Leaderboard Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-lg border border-slate-200 dark:border-slate-700 shadow-lg sm:rounded-2xl">
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">🏆 Leaderboard Fokus</h3>
                        {leaderboard.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="border-b-2 border-slate-200 dark:border-slate-600">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">#</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Nama Pengguna</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Total Sesi</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Total Fokus (Jam)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {leaderboard.map((user, index) => (
                                            <tr key={user.id} className={user.id === auth.user.id ? 'bg-teal-50 dark:bg-teal-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}>
                                                <td className="px-4 py-3 font-bold text-lg">{getMedal(index)}</td>
                                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{user.name}</td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.pomodoro_sessions_count}</td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{Math.round(user.total_focus_minutes / 60)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Belum ada data leaderboard.</p>
                        )}
                    </div>
                </motion.div>

            </div>
        </AuthenticatedLayout>
    );
}