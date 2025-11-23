// File: resources/js/Pages/Dashboard.jsx (FINAL FINAL FIXED VERSION)

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingModal from '@/Components/OnboardingModal';
import UpgradeModal from '@/Components/UpgradeModal';
import TodoListCard from '@/Components/TodoList/TodoListCard';
import StatCard from '@/Components/Dashboard/StatCard';
import { ListBulletIcon, CheckCircleIcon, CalendarDaysIcon, ExclamationTriangleIcon, PencilSquareIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';

const MainDashboard = ({ auth, todaysGoal, onSaveGoal, allTasks, taskStats, filters = {}, isProcessingGoal }) => {
    const activeFilter = filters.filter || 'all';
    const [isEditing, setIsEditing] = useState(false);
    const [goalInput, setGoalInput] = useState('');

    useEffect(() => {
        if (todaysGoal?.goal) {
            setGoalInput(todaysGoal.goal);
        } else {
            setIsEditing(true); // Auto-edit if no goal
        }
    }, [todaysGoal]);

    const handleFilterChange = (newFilter) => {
        router.get(route('dashboard'), { filter: newFilter }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSave = () => {
        if (!goalInput.trim()) return;
        onSaveGoal(goalInput, () => setIsEditing(false));
    };

    const handleCancel = () => {
        if (todaysGoal?.goal) {
            setGoalInput(todaysGoal.goal);
            setIsEditing(false);
        }
        // If no goal exists, we might want to keep it in edit mode or show a placeholder, 
        // but for now let's just keep it in edit mode if they cancel without a previous goal? 
        // Actually, if they cancel and there's no goal, maybe just leave it empty but editable.
    };

    const filterCards = [
        { key: 'all', title: 'Semua Tugas', value: taskStats.total, icon: ListBulletIcon, colorClass: 'bg-blue-500' },
        { key: 'week', title: 'Minggu Ini', value: taskStats.dueThisWeek, icon: CalendarDaysIcon, colorClass: 'bg-orange-500' },
        { key: 'overdue', title: 'Terlambat', value: taskStats.overdue, icon: ExclamationTriangleIcon, colorClass: 'bg-red-500' },
        { key: 'completed', title: 'Selesai', value: taskStats.completed, icon: CheckCircleIcon, colorClass: 'bg-green-500' },
    ];

    const activeListTitle = filterCards.find(card => card.key === activeFilter)?.title || 'Semua Tugas';

    return (
        <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">👋 Hai, {auth.user.name}!</h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 mt-1">Ini ringkasan produktivitasmu hari ini.</p>
            </motion.div>

            <motion.div
                className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                initial="hidden" animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
                {filterCards.map(({ key, ...cardProps }) => (
                    <motion.div key={key} variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                        <StatCard
                            {...cardProps}
                            isActive={activeFilter === key}
                            onClick={() => handleFilterChange(key)}
                        />
                    </motion.div>
                ))}
            </motion.div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                    <TodoListCard tasks={allTasks} listTitle={activeListTitle} />
                </motion.div>

                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-500 text-white">
                                        <span className="text-xl">🎯</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                            Goal Harian
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Fokus utamamu hari ini
                                        </p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="relative">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={goalInput}
                                                onChange={(e) => setGoalInput(e.target.value)}
                                                placeholder="Contoh: Menyelesaikan laporan project"
                                                maxLength={200}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSave();
                                                    if (e.key === 'Escape') handleCancel();
                                                }}
                                            />
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                                    Tekan Enter untuk simpan
                                                </span>
                                                <div className="flex gap-2">
                                                    {todaysGoal?.goal && (
                                                        <button
                                                            onClick={handleCancel}
                                                            className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-sm font-medium"
                                                        >
                                                            Batal
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={handleSave}
                                                        disabled={isProcessingGoal || !goalInput.trim()}
                                                        className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                                    >
                                                        {isProcessingGoal ? (
                                                            <>
                                                                <span className="animate-spin">⏳</span>
                                                                <span>Menyimpan...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckIcon className="w-4 h-4" />
                                                                <span>Simpan</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="group/goal relative">
                                            <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 transition-colors">
                                                <p className="flex-1 text-slate-700 dark:text-slate-200 text-base font-medium leading-relaxed">
                                                    {todaysGoal?.goal}
                                                </p>
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-teal-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition opacity-0 group-hover/goal:opacity-100 focus:opacity-100"
                                                    title="Edit Goal"
                                                    aria-label="Edit Goal"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard(props) {
    const { auth, tasks, taskStats, filters, plans, showOnboarding, todaysGoal } = props;
    const { flash } = usePage().props;

    const [isProcessing, setIsProcessing] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

    const handleOnboardingFinish = (data) => {
        setIsProcessing(true);
        const { daily_goal, ...onboarding_data } = data;
        router.post(route('daily-goal.store'), { goal: daily_goal, onboarding_data }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsProcessing(false)
        });
    };

    const handleSaveDailyGoal = (goal, onSuccess) => {
        setIsProcessing(true);
        router.post(route('daily-goal.store'), { goal }, {
            onSuccess: () => {
                if (onSuccess) onSuccess();
            },
            onFinish: () => setIsProcessing(false)
        });
    };

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
        todaysGoal,
        onSaveGoal: handleSaveDailyGoal,
        isProcessingGoal: isProcessing,
        plans,
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
                {/* DailyGoalModal removed */}
                {shouldShowUpgrade &&
                    <UpgradeModal
                        show={shouldShowUpgrade} isOpen={shouldShowUpgrade}
                        onClose={handleCloseUpgradeModal} plans={plans}
                    />
                }
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}