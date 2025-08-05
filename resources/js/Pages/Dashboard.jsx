// File: resources/js/Pages/Dashboard.jsx (Full Code - FINAL PREMIUM VERSION)

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Impor SEMUA Komponen Modal yang dibutuhkan
import OnboardingModal from '@/Components/OnboardingModal';
import DailyGoalModal from '@/Components/DailyGoalModal';
import UpgradeModal from '@/Components/UpgradeModal'; // <-- Impor Komponen Premium

// Ikon-ikon yang digunakan
import { CheckCircleIcon as CheckCircleSolid, ClockIcon as ClockSolid, PlayIcon, PauseIcon, ArrowPathIcon, SparklesIcon as SparklesSolid, CalendarDaysIcon as CalendarSolid, LockClosedIcon } from '@heroicons/react/24/solid';
import { BellAlertIcon } from '@heroicons/react/24/outline';


// ====================================================================
// BAGIAN 1: KOMPONEN INTERNAL DASHBOARD (dengan penyesuaian premium)
// ====================================================================

/**
 * Komponen 1: Pomodoro Timer Interaktif.
 */
const PomodoroTimer = () => {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'

    const intervalRef = useRef(null);
    const audioRef = useRef(null);

    const phases = {
        focus: { duration: 25, title: 'Waktunya Fokus!' },
        shortBreak: { duration: 5, title: 'Istirahat Singkat' },
        longBreak: { duration: 15, title: 'Istirahat Panjang' },
    };

    const resetTimer = useCallback((newPhase) => {
        setIsActive(false);
        if(intervalRef.current) clearInterval(intervalRef.current);
        setPhase(newPhase);
        setMinutes(phases[newPhase].duration);
        setSeconds(0);
    }, [phases]);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setSeconds(s => {
                    if (s > 0) return s - 1;
                    setMinutes(m => {
                        if (m > 0) return m - 1;
                        if (audioRef.current) {
                            audioRef.current.play().catch(e => console.error("Error playing sound:", e));
                        }
                        resetTimer(phase === 'focus' ? 'shortBreak' : 'focus');
                        return 0;
                    });
                    return 59;
                });
            }, 1000);
        }
        return () => { if(intervalRef.current) clearInterval(intervalRef.current) };
    }, [isActive, phase, resetTimer]);
    
    const toggleTimer = () => setIsActive(!isActive);

    const timerColor = phase === 'focus' ? 'bg-rose-500' : 'bg-green-500';
    const buttonColor = isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-teal-500 hover:bg-teal-600';

    return (
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-lg border border-slate-200 dark:border-slate-700 shadow-lg sm:rounded-2xl p-6 flex flex-col items-center gap-4">
            <audio ref={audioRef} src="/audio/notification.mp3" preload="auto"></audio>
            
            <div className={`text-sm font-semibold px-4 py-1 rounded-full text-white ${timerColor}`}>{phases[phase].title}</div>
            <div className="text-7xl font-bold text-slate-800 dark:text-white my-4" style={{fontVariantNumeric: 'tabular-nums'}}>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</div>
            <div className="flex items-center gap-4">
                <button onClick={() => resetTimer('focus')} className="p-3 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition" aria-label="Reset to Focus"><ArrowPathIcon className="h-6 w-6" /></button>
                <button onClick={toggleTimer} className={`px-10 py-4 font-bold text-white rounded-lg shadow-lg transition transform hover:scale-105 ${buttonColor}`} aria-label={isActive ? "Pause Timer" : "Start Timer"}>{isActive ? <PauseIcon className="h-8 w-8" /> : <PlayIcon className="h-8 w-8" />}</button>
                <button onClick={() => resetTimer('shortBreak')} className="p-3 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition" aria-label="Start Short Break"><BellAlertIcon className="h-6 w-6" /></button>
            </div>
        </div>
    );
};

/**
 * Kartu untuk menampilkan status Refleksi Harian, dengan logika premium.
 */
const ReflectionCard = ({ hasReflectedToday, isPremium, onUpgradeClick }) => (
    <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-lg border border-slate-200 dark:border-slate-700 shadow-lg sm:rounded-2xl p-6 h-full flex flex-col">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center mb-2">
            <SparklesSolid className="w-5 h-5 mr-2 text-yellow-400"/>
            Refleksi Harian
        </h3>
        <div className="flex-grow flex flex-col justify-center">
            {/* Tampilan untuk Pengguna Premium */}
            {isPremium && (
                hasReflectedToday ? (
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <p className="text-green-800 dark:text-green-300">Hebat! Kamu sudah berefleksi hari ini 🙏</p>
                    </div>
                ) : (
                    <>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">Mulai sesi percakapan mendalam dengan AI GrowthBot.</p>
                        <Link href={route('refleksi.index')} className="w-full text-center bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 shadow-lg">Mulai Refleksi</Link>
                    </>
                )
            )}

            {/* Tampilan untuk Pengguna Gratis */}
            {!isPremium && (
                <div className="text-center p-4 border-2 border-dashed border-amber-400/50 dark:border-amber-500/40 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <div className="w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mb-3">
                        <LockClosedIcon className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                    </div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Refleksi AI Mendalam</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">Fitur Premium</p>
                    <button onClick={onUpgradeClick} className="w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition transform hover:scale-105 text-sm">
                        Upgrade untuk Membuka
                    </button>
                </div>
            )}
        </div>
    </div>
);

/**
 * Kartu untuk menampilkan statistik Progress Mingguan.
 */
const WeeklyProgressCard = ({ stats }) => (
    <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-lg border border-slate-200 dark:border-slate-700 shadow-lg sm:rounded-2xl p-6 h-full">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center mb-4"><CalendarSolid className="w-5 h-5 mr-2 text-indigo-400"/>Progress Minggu Ini</h3>
        <div className="space-y-4">
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-slate-600 dark:text-slate-300"><ClockSolid className="w-5 h-5 mr-3 text-rose-400"/> Sesi Pomodoro</span><span className="font-bold text-lg text-slate-800 dark:text-white">{stats?.pomodoros ?? 0}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-slate-600 dark:text-slate-300"><SparklesSolid className="w-5 h-5 mr-3 text-yellow-400"/> Hari Refleksi</span><span className="font-bold text-lg text-slate-800 dark:text-white">{stats?.reflections ?? 0}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-slate-600 dark:text-slate-300"><CheckCircleSolid className="w-5 h-5 mr-3 text-green-400"/> Goal Tercapai</span><span className="font-bold text-lg text-slate-800 dark:text-white">{stats?.goalsAchieved ?? 0} / 7</span></div>
        </div>
    </div>
);

// ====================================================================
// BAGIAN 2: HALAMAN DASHBOARD UTAMA (Main View)
// ====================================================================
const MainDashboard = ({ auth, todaysGoal, onEditGoalClick, hasReflectedToday, weeklyStats, onUpgradeClick }) => (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">👋 Hai, {auth.user.name}!</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mt-1">Siap bertumbuh hari ini?</p>
        </motion.div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-lg border border-slate-200 dark:border-slate-700 shadow-lg sm:rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center"><span className="text-2xl mr-3">🎯</span>Goal Harian Kamu</h3>
                    {todaysGoal?.goal ? (<p className="text-slate-700 dark:text-slate-200 text-lg mt-2 pl-9 italic">"{todaysGoal.goal}"</p>) : (<p className="text-slate-500 dark:text-slate-400 mt-2 pl-9">Kamu belum mengatur goal untuk hari ini.</p>)}
                    <button onClick={onEditGoalClick} className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline mt-3 ml-9">{todaysGoal?.goal ? 'Ganti Goal' : 'Atur Goal Sekarang'}</button>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 ml-2 flex items-center"><span className="text-2xl mr-3">⏱</span>Quick Start Pomodoro</h3>
                    <PomodoroTimer />
                </motion.div>
            </div>
            <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                    <ReflectionCard hasReflectedToday={hasReflectedToday} isPremium={auth.user.is_premium} onUpgradeClick={onUpgradeClick} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}><WeeklyProgressCard stats={weeklyStats} /></motion.div>
            </div>
        </div>
    </div>
);

// ====================================================================
// BAGIAN 3: EXPORT UTAMA & PENGATUR MODAL (dengan logika premium)
// ====================================================================
export default function Dashboard(props) {
    const { auth, plans, showOnboarding, hasTodaysGoal, todaysGoal, hasReflectedToday, weeklyStats, snap_token } = props;
    const { flash } = usePage().props;

    const [isProcessing, setIsProcessing] = useState(false);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        if (flash?.show_upgrade_modal) {
            setShowUpgradeModal(true);
        }
    }, [flash]);

    const shouldShowOnboarding = showOnboarding;
    const shouldShowDailyGoal = (!showOnboarding && !hasTodaysGoal) || isEditingGoal;
    const shouldShowUpgrade = !shouldShowOnboarding && !shouldShowDailyGoal && showUpgradeModal;

    const anyModalActive = shouldShowOnboarding || shouldShowDailyGoal || shouldShowUpgrade;
    const renderMainContent = !showOnboarding;

    const handleOnboardingFinish = (data) => {
        setIsProcessing(true);
        const { daily_goal, ...onboarding_data } = data;
        router.post(route('daily-goal.store'), { goal: daily_goal, onboarding_data }, { onFinish: () => setIsProcessing(false) });
    };

    const handleSaveDailyGoal = (goal) => {
        setIsProcessing(true);
        router.post(route('daily-goal.store'), { goal }, { onSuccess: () => setIsEditingGoal(false), onFinish: () => setIsProcessing(false) });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">Dashboard</h2>}>
            <Head title="Dashboard" />
            
            <div className={`transition-all duration-500 ${anyModalActive ? 'blur-md' : ''}`}>
                {renderMainContent &&
                    <MainDashboard
                        {...props}
                        onEditGoalClick={() => setIsEditingGoal(true)}
                        onUpgradeClick={() => setShowUpgradeModal(true)}
                    />
                }
            </div>
            
            <AnimatePresence>
                {shouldShowOnboarding && (
                    <OnboardingModal onFinish={handleOnboardingFinish} isProcessing={isProcessing} />
                )}
                {shouldShowDailyGoal && (
                    <DailyGoalModal onSave={handleSaveDailyGoal} isProcessing={isProcessing} onClose={() => setIsEditingGoal(false)} />
                )}
                {shouldShowUpgrade && (
                    <UpgradeModal show={shouldShowUpgrade} onClose={() => setShowUpgradeModal(false)} plans={plans} snap_token={snap_token} />
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}