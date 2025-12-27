// File: resources/js/Pages/Dashboard.jsx (FINAL FINAL FIXED VERSION)

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingModal from '@/Components/OnboardingModal';
import UpgradeModal from '@/Components/UpgradeModal';
import TodoListCard from '@/Components/TodoList/TodoListCard';
import TaskFocusPanel from '@/Components/Dashboard/TaskFocusPanel'; // Imported TaskFocusPanel
import StatCard from '@/Components/Dashboard/StatCard';
import { ListBulletIcon, CheckCircleIcon, CalendarDaysIcon, ExclamationTriangleIcon, PencilSquareIcon, XMarkIcon, CheckIcon, ClockIcon, PlusIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import axios from 'axios';
import PomodoroIsland from '@/Components/Pomodoro/PomodoroIsland';
import DynamicChatBar from '@/Components/Dashboard/DynamicChatBar';
import Modal from '@/Components/Modal';

const MainDashboard = ({ auth, allTasks, taskStats, filters = {}, onStartFocus }) => {
    const activeFilter = filters.filter || 'all';


    const handleFilterChange = (newFilter) => {
        router.get(route('dashboard'), { filter: newFilter }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const filterCards = [
        { key: 'all', title: 'Semua Tugas', value: taskStats.total, icon: ListBulletIcon, colorClass: 'bg-blue-500' },
        { key: 'week', title: 'Minggu Ini', value: taskStats.dueThisWeek, icon: CalendarDaysIcon, colorClass: 'bg-orange-500' },
        { key: 'overdue', title: 'Terlambat', value: taskStats.overdue, icon: ExclamationTriangleIcon, colorClass: 'bg-red-500' },
        { key: 'completed', title: 'Selesai', value: taskStats.completed, icon: CheckCircleIcon, colorClass: 'bg-green-500' },
    ];

    const activeListTitle = filterCards.find(card => card.key === activeFilter)?.title || 'Semua Tugas';

    return (
        <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10"
            >
                <div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        Halo, <span className="text-teal-600 dark:text-teal-400">{auth.user.name.split(' ')[0]}</span>!
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Ayo selesaikan tantanganmu hari ini. 🚀
                    </p>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add-task'))}
                        className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-200 transform hover:scale-105"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Tambah Tugas
                    </button>
                </div>

                <div className="flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    {filterCards.map(({ key, title, icon: Icon, colorClass }) => (
                        <button
                            key={key}
                            onClick={() => handleFilterChange(key)}
                            title={title}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden group
                                ${activeFilter === key
                                    ? 'text-white shadow-lg scale-105 z-10'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            {activeFilter === key && (
                                <motion.div
                                    layoutId="activeFilterBg"
                                    className={`absolute inset-0 ${colorClass} -z-10`}
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon className={`w-4 h-4 transition-transform group-hover:scale-125 ${activeFilter === key ? 'text-white' : 'text-slate-400'}`} />
                            <span className={activeFilter === key ? 'block' : 'hidden md:block'}>{title}</span>
                        </button>
                    ))}
                </div>
            </motion.div>

            <div className="space-y-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <TaskFocusPanel
                        tasks={allTasks}
                        activeFilter={activeFilter}
                        onStartFocus={onStartFocus}
                        auth={auth}
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default function Dashboard(props) {
    const { auth, tasks, taskStats, filters, plans, showOnboarding } = props;
    const { flash } = usePage().props;

    const [isProcessing, setIsProcessing] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // --- POMODORO TIMER STATE ---
    const [activeTask, setActiveTask] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState(null);
    // const [showTimerModal, setShowTimerModal] = useState(false); // Removed
    const [totalDuration, setTotalDuration] = useState(25 * 60);

    const handleStartFocus = (task) => {
        const duration = task.estimated_minutes || 25;
        setActiveTask(task);
        setSecondsLeft(duration * 60);
        setTotalDuration(duration * 60);
        setStartTime(dayjs());
        setIsRunning(true);

        // AUTO-OPEN LINK (Premium Only)
        if (auth.user.is_premium && task.auto_open_url) {
            window.open(task.auto_open_url, '_blank');
        }
    };

    const stopSession = async (manuallyStopped = true) => {
        if (!isRunning) return;
        setIsRunning(false);

        // Save session
        try {
            await axios.post(route('api.pomodoro.store'), {
                focus_minutes: Math.ceil(totalDuration / 60),
                started_at: startTime?.toISOString(),
                ended_at: dayjs().toISOString(),
                manually_stopped: manuallyStopped,
                task_id: activeTask?.id
            });
            router.reload({ only: ['tasks', 'taskStats'] });
        } catch (error) {
            console.error("Failed to save session:", error);
        }
    };

    const handleTimerClose = () => {
        if (isRunning) {
            if (confirm('Timer masih berjalan. Berhenti dan simpan progres?')) {
                stopSession(true);
                setActiveTask(null);
            }
        } else {
            setActiveTask(null);
        }
    };

    useEffect(() => {
        let timer;
        if (isRunning && secondsLeft > 0) {
            timer = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
        } else if (secondsLeft === 0 && isRunning) {
            stopSession(false);
            alert('Waktu fokus selesai! 🎉');
        }
        return () => clearInterval(timer);
    }, [isRunning, secondsLeft]);

    useEffect(() => {
        // Only show upgrade modal if tutorial is already completed
        const localSeen = localStorage.getItem('tutorial_seen');
        const isTutorialDone = auth.user.has_seen_tutorial || localSeen === 'true';

        if (flash?.show_upgrade_modal && isTutorialDone) {
            setShowUpgradeModal(true);
        }
    }, [flash, auth.user.has_seen_tutorial]);

    const shouldShowOnboarding = false; // Disabled by user request
    // Removed DailyGoalModal logic
    const shouldShowUpgrade = !shouldShowOnboarding && showUpgradeModal;
    const anyModalActive = shouldShowOnboarding || shouldShowUpgrade;
    const renderMainContent = true;


    const handleCloseUpgradeModal = () => {
        setShowUpgradeModal(false);
        localStorage.setItem('upgrade_modal_dismissed', 'true'); // Mark as dismissed for WhatsApp Warning sequence
        router.post(route('dashboard.dismiss-upgrade-modal'), {}, { preserveState: true, preserveScroll: true });
    };

    const mainDashboardProps = {
        auth,
        allTasks: tasks || { data: [], links: [], total: 0 },
        taskStats: taskStats || { total: 0, completed: 0, dueThisWeek: 0, overdue: 0 },
        filters,
        plans,
        onStartFocus: handleStartFocus,
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />
            <div className={`transition-all duration-500 ${anyModalActive ? 'blur-md' : ''}`}>
                {renderMainContent && <MainDashboard {...mainDashboardProps} />}
            </div>
            <AnimatePresence>
                {shouldShowOnboarding && <OnboardingModal onFinish={handleOnboardingFinish} isProcessing={isProcessing} />}
                {shouldShowUpgrade &&
                    <UpgradeModal
                        show={shouldShowUpgrade} isOpen={shouldShowUpgrade}
                        onClose={handleCloseUpgradeModal} plans={plans}
                    />
                }
            </AnimatePresence>

            <AnimatePresence>
                {activeTask && (
                    <PomodoroIsland
                        taskTitle={activeTask.title}
                        secondsLeft={secondsLeft}
                        isRunning={isRunning}
                        totalDuration={totalDuration}
                        onStart={() => setIsRunning(true)}
                        onStop={() => setIsRunning(false)}
                        onReset={() => {
                            setIsRunning(false);
                            setSecondsLeft(totalDuration);
                        }}
                        onClose={handleTimerClose}
                    />
                )}
            </AnimatePresence>

            <DynamicChatBar />
        </AuthenticatedLayout>
    );
}