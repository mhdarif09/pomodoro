import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Impor Komponen Eksternal
import OnboardingModal from '@/Components/OnboardingModal';
import DailyGoalModal from '@/Components/DailyGoalModal';

// Impor Ikon
import { CheckCircleIcon, PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { BellAlertIcon } from '@heroicons/react/24/outline';

// ====================================================================
// KOMPONEN-KOMPONEN INTERNAL UNTUK DASHBOARD
// ====================================================================

// KOMPONEN 1: Pomodoro Timer Interaktif
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
                        // Timer selesai
                        if (audioRef.current) {
                            audioRef.current.play().catch(e => console.error("Error playing sound:", e));
                        }
                        // Ganti ke fase berikutnya
                        resetTimer(phase === 'focus' ? 'shortBreak' : 'focus');
                        return 0; // Kembalikan nilai baru untuk menit
                    });
                    return 59; // Kembalikan nilai baru untuk detik
                });
            }, 1000);
        } else {
             if(intervalRef.current) clearInterval(intervalRef.current);
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

// KOMPONEN 2: Konten Dashboard Baru
const MainDashboard = ({ auth, todaysGoal, onEditGoalClick }) => {
    return (
        <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">👋 Hai, {auth.user.name}!</h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 mt-1">Siap bertumbuh hari ini?</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-lg border border-slate-200 dark:border-slate-700 shadow-lg sm:rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center"><span className="text-2xl mr-3">🎯</span>Goal Harian Kamu</h3>
                {todaysGoal?.goal ? (<p className="text-slate-700 dark:text-slate-200 text-lg mt-2 pl-9">"{todaysGoal.goal}"</p>) : (<p className="text-slate-500 dark:text-slate-400 mt-2 pl-9">Kamu belum mengatur goal untuk hari ini.</p>)}
                <button onClick={onEditGoalClick} className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline mt-3 ml-9">{todaysGoal?.goal ? 'Ganti Goal' : 'Atur Goal Sekarang'}</button>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 ml-2 flex items-center"><span className="text-2xl mr-3">⏱</span>Quick Start Pomodoro</h3>
                <PomodoroTimer />
            </motion.div>
        </div>
    );
};

// KOMPONEN 3 & 4 (Placeholder, tidak digunakan)
const SubscriptionModal = ({ user, plans }) => { /* ... Logika modal langganan Anda bisa ditaruh di sini ... */ return null; };
const TutorialModal = ({ onFinish }) => { /* ... Logika modal tutorial Anda bisa ditaruh di sini ... */ return null; };

// ====================================================================
// Komponen UTAMA: EXPORT DEFAULT DASHBOARD (Pengatur Semua Modal)
// ====================================================================
export default function Dashboard({
    auth, subscription = null, plans = [],
    showTutorial = false, showOnboarding = false,
    hasTodaysGoal = true, todaysGoal = null
}) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isEditingGoal, setIsEditingGoal] = useState(false);

    useEffect(() => {
        const needsSubscriptionModal = !showOnboarding && hasTodaysGoal && !isEditingGoal && !subscription && !showTutorial && (plans || []).length > 0;
        if (needsSubscriptionModal && !window.snap) {
            const script = document.createElement('script'); script.src = 'https://app.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY); script.async = true; document.body.appendChild(script);
        }
    }, [showOnboarding, hasTodaysGoal, isEditingGoal, subscription, showTutorial, plans]);

    const shouldShowOnboarding = showOnboarding;
    const shouldShowDailyGoal = (!showOnboarding && !hasTodaysGoal) || isEditingGoal;
    const shouldShowSubscription = !showOnboarding && !shouldShowDailyGoal && !subscription && !showTutorial && (plans || []).length > 0;
    const shouldShowTutorial = !shouldShowOnboarding && !shouldShowDailyGoal && !shouldShowSubscription && showTutorial;
    const anyModalActive = shouldShowOnboarding || shouldShowDailyGoal || shouldShowSubscription || shouldShowTutorial;

    // Handler untuk menyelesaikan Onboarding, mengirim semua data.
    const handleOnboardingFinish = (data) => {
        setIsProcessing(true);
        const { daily_goal, ...onboarding_data } = data;
        router.post(route('daily-goal.store'), { goal: daily_goal, onboarding_data }, {
            onFinish: () => setIsProcessing(false)
        });
    };

    // Handler HANYA untuk pop-up Goal Harian dengan LOGIKA FIX
    const handleSaveDailyGoal = (goal) => {
        setIsProcessing(true);
        router.post(route('daily-goal.store'), { goal }, {
            onSuccess: () => { setIsEditingGoal(false); },
            onFinish: () => { setIsProcessing(false); }
        });
    };
    
    const handleFinishTutorial = () => router.get(route('dashboard'), {}, { preserveState: false, replace: true });
    
    const renderMainContent = !showOnboarding;

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">Dashboard</h2>}>
            <Head title="Dashboard" />
            <div className={`transition-all duration-500 ${anyModalActive ? 'blur-md' : ''}`}>
                {renderMainContent &&
                    <MainDashboard
                        auth={auth}
                        todaysGoal={todaysGoal}
                        onEditGoalClick={() => setIsEditingGoal(true)}
                    />
                }
            </div>
            <AnimatePresence>
                {shouldShowOnboarding && <OnboardingModal onFinish={handleOnboardingFinish} isProcessing={isProcessing} />}
                {shouldShowDailyGoal && <DailyGoalModal onSave={handleSaveDailyGoal} isProcessing={isProcessing} onClose={() => setIsEditingGoal(false)} />}
                {shouldShowTutorial && <TutorialModal onFinish={handleFinishTutorial} />}
                {shouldShowSubscription && <SubscriptionModal user={auth.user} plans={plans} />}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}