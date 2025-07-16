import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- Ikon ---
import {
    ChartBarIcon, ClockIcon, HandRaisedIcon, ArrowTrendingUpIcon, LightBulbIcon,
    CheckCircleIcon, RocketLaunchIcon, BookOpenIcon, UsersIcon
} from '@heroicons/react/24/solid';

// ====================================================================
// Komponen #1: Modal Pemilihan Paket (WAJIB DIISI)
// ====================================================================
const SubscriptionModal = ({ user, plans }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async (planName) => {
        setIsLoading(true);
        try {
            const response = await axios.post(route('subscribe.checkout'), { plan: planName });
            const { snap_token } = response.data;
            window.snap.pay(snap_token, {
                onSuccess: () => window.location.href = route('subscription.success'),
                onPending: () => { setIsLoading(false); alert("Menunggu pembayaran Anda!"); },
                onError: () => { setIsLoading(false); alert("Pembayaran gagal! Silakan coba lagi."); },
                onClose: () => setIsLoading(false)
            });
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Gagal membuat transaksi. Hubungi dukungan jika masalah berlanjut.');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ ease: "easeInOut", duration: 0.3 }}
                className="w-full max-w-4xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Satu Langkah Lagi, {user.name}!</h1>
                    <p className="mt-3 text-lg text-slate-300">Pilih paket untuk membuka semua fitur dan meningkatkan produktivitas Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (index + 1), duration: 0.4 }}
                            className="bg-white dark:bg-slate-800/80 dark:backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-8 flex flex-col"
                        >
                            <h3 className="text-xl font-semibold text-teal-500 dark:text-teal-400">{plan.name}</h3>
                            <p className="mt-2 text-4xl font-extrabold text-slate-900 dark:text-white">Rp{Number(plan.price).toLocaleString('id-ID')}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">per {plan.duration === 'monthly' ? 'bulan' : 'tahun'}</p>
                            
                            <ul className="mt-8 space-y-3 text-slate-600 dark:text-slate-300 flex-grow">
                                {(plan.features || []).map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3">
                                        <CheckCircleIcon className="h-5 w-5 text-teal-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscribe(plan.name)}
                                disabled={isLoading}
                                className="mt-10 w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-lg shadow-lg shadow-teal-500/20 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            >
                                {isLoading ? 'Memproses...' : 'Pilih Paket'}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

// ====================================================================
// Komponen #2: Modal Tutorial (Setelah Bayar)
// ====================================================================
const TutorialModal = ({ onFinish }) => {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
             <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ ease: "easeInOut", duration: 0.3 }}
                className="bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-8 sm:p-10 text-center max-w-2xl w-full"
            >
                <RocketLaunchIcon className="h-16 w-16 text-teal-500 dark:text-teal-400 mx-auto"/>
                <h1 className="mt-5 text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Pembayaran Berhasil & Selamat Datang!</h1>
                <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">Akun Anda sekarang premium. Berikut adalah beberapa fitur utama yang baru saja Anda buka:</p>
                
                <div className="mt-8 space-y-4 text-left">
                    <div className="flex items-start gap-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                        <BookOpenIcon className="h-7 w-7 text-teal-500 dark:text-teal-400 mt-1 flex-shrink-0"/>
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Analisis Produktivitas</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Lihat data lengkap sesi Pomodoro, termasuk interupsi dan pengalih perhatian.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                        <UsersIcon className="h-7 w-7 text-teal-500 dark:text-teal-400 mt-1 flex-shrink-0"/>
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Leaderboard</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Bandingkan total jam fokus Anda dengan pengguna lain dan raih posisi puncak.</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onFinish}
                    className="mt-10 bg-teal-500 hover:bg-teal-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg shadow-teal-500/20 text-base transition-all duration-300 transform hover:scale-105"
                >
                    Mulai Produktif Sekarang!
                </button>
            </motion.div>
        </div>
    );
};

// ====================================================================
// Komponen #3: Tampilan Dashboard Utama (Konten di belakang modal)
// ====================================================================
const MainDashboard = ({ auth, subscription, pomodoroStats, leaderboard }) => {

    const StatsCard = ({ icon, label, value, unit }) => (
        <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
                <div className="bg-teal-100 dark:bg-teal-900/50 p-3 rounded-lg">{icon}</div>
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {value} <span className="text-base font-normal text-slate-600 dark:text-slate-300">{unit}</span>
                    </p>
                </div>
            </div>
        </div>
    );

    const recommendations = useMemo(() => {
        const suggestions = [];
        const { totalSessions = 0, manuallyStoppedCount = 0, tabSwitches = 0 } = pomodoroStats || {};
        if (totalSessions > 0) {
            if (manuallyStoppedCount / totalSessions > 0.4) suggestions.push("Banyak sesi dihentikan manual. Mungkin durasi fokus 25 menit terlalu lama? Coba kurangi menjadi 20 menit.");
            if (tabSwitches / totalSessions > 5) suggestions.push("Anda sering beralih tab. Manfaatkan fitur 'Blokir Situs' untuk membantu Anda tetap fokus pada satu tugas.");
        }
        if (totalSessions < 5) suggestions.push("Konsistensi adalah kunci. Coba jadwalkan 1-2 sesi Pomodoro setiap hari untuk membangun kebiasaan.");
        else suggestions.push("Kerja bagus! Anda telah membangun kebiasaan fokus. Pertahankan momentum ini.");
        return suggestions;
    }, [pomodoroStats]);

    const getMedal = (index) => {
        if (index === 0) return '🥇'; if (index === 1) return '🥈'; if (index === 2) return '🥉'; return <span className="text-slate-500 dark:text-slate-400">{index + 1}</span>;
    };

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-lg border border-slate-200 dark:border-slate-700 shadow-lg sm:rounded-2xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">👋 Selamat datang, {auth.user.name}!</h3>
                {subscription?.expired_at ? (
                     <p className="text-sm text-teal-600 dark:text-teal-400 mt-2 flex items-center gap-2 font-semibold">
                        <CheckCircleIcon className="h-5 w-5"/>
                        <span>Status Premium aktif hingga: {new Date(subscription.expired_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </p>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Pilih paket langganan untuk membuka semua fitur produktivitas.</p>
                )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-lg border border-slate-200 dark:border-slate-700 shadow-lg sm:rounded-2xl p-6 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3"><ChartBarIcon className="h-6 w-6 text-teal-500" />Analisis Produktivitas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                     <StatsCard icon={<ArrowTrendingUpIcon className="h-6 w-6 text-teal-600 dark:text-teal-400"/>} label="Total Sesi" value={pomodoroStats?.totalSessions ?? 0} unit="sesi" />
                    <StatsCard icon={<ClockIcon className="h-6 w-6 text-teal-600 dark:text-teal-400"/>} label="Waktu Fokus" value={Math.round((pomodoroStats?.totalFocusMinutes ?? 0) / 60)} unit="jam" />
                    <StatsCard icon={<HandRaisedIcon className="h-6 w-6 text-orange-500 dark:text-orange-400"/>} label="Sesi Dihentikan" value={pomodoroStats?.manuallyStoppedCount ?? 0} unit="kali" />
                    <StatsCard icon={<ChartBarIcon className="h-6 w-6 text-rose-500 dark:text-rose-400"/>} label="Pengalih Perhatian" value={pomodoroStats?.tabSwitches ?? 0} unit="kali" />
                </div>
                <div className="pt-4">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3"><LightBulbIcon className="h-5 w-5 text-yellow-400" />Rekomendasi untuk Anda</h4>
                    <ul className="space-y-2 text-sm list-disc list-inside text-slate-600 dark:text-slate-300">
                        {recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                    </ul>
                </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-lg border border-slate-200 dark:border-slate-700 shadow-lg sm:rounded-2xl">
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">🏆 Leaderboard Fokus</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="border-b-2 border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">#</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Nama Pengguna</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Total Sesi</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Total Fokus (Jam)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {leaderboard.map((user, index) => (
                                    <tr key={user.id} className={`${user.id === auth.user.id ? 'bg-teal-50 dark:bg-teal-900/50' : ''} hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors`}>
                                        <td className="px-4 py-3 font-bold text-lg">{getMedal(index)}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{user.name}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.pomodoro_sessions_count}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{Math.round(user.total_focus_minutes / 60)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// ====================================================================
// Komponen Utama: Dashboard (Sebagai Pengatur Layer & Modal)
// ====================================================================
export default function Dashboard({ auth, subscription = null, leaderboard = [], pomodoroStats = {}, plans = [], showTutorial = false }) {
    
    useEffect(() => {
        if (!subscription && !showTutorial && !window.snap) {
            const script = document.createElement('script');
            script.src = 'https://app.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
            script.async = true;
            document.body.appendChild(script);
        }
    }, [subscription, showTutorial]);

    const isPremium = !!subscription;
    const showSubscriptionModal = !isPremium && !showTutorial && plans.length > 0;

    const handleFinishTutorial = () => {
        router.get(route('dashboard'), {}, { preserveState: false, replace: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />
            
            {/* Wrapper untuk konten utama yang bisa di-blur */}
            <div className={`transition-all duration-500 ${showTutorial || showSubscriptionModal ? 'blur-md' : ''}`}>
                <MainDashboard
                    auth={auth}
                    subscription={subscription}
                    pomodoroStats={pomodoroStats}
                    leaderboard={leaderboard}
                />
            </div>

            {/* AnimatePresence digunakan agar animasi 'exit' bisa berjalan saat komponen di-unmount */}
            <AnimatePresence>
                {showTutorial && <TutorialModal onFinish={handleFinishTutorial} />}
                
                {showSubscriptionModal && (
                    <SubscriptionModal user={auth.user} plans={plans} />
                )}
            </AnimatePresence>
            
        </AuthenticatedLayout>
    );
}