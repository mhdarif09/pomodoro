// File: resources/js/Pages/Dashboard.jsx (Final - Integrated Layout with Pagination)

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingModal from '@/Components/OnboardingModal';
import DailyGoalModal from '@/Components/DailyGoalModal';
import UpgradeModal from '@/Components/UpgradeModal';
import TodoListCard from '@/Components/TodoList/TodoListCard';
import StatCard from '@/Components/Dashboard/StatCard';
import { ListBulletIcon, CheckCircleIcon, CalendarDaysIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const MainDashboard = ({ auth, todaysGoal, onEditGoalClick, allTasks, taskStats, filters }) => {
    // State untuk filter dipegang oleh URL, dibaca dari props 'filters'
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
                {filterCards.map(card => (
                    <motion.div key={card.key} variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                        <StatCard {...card} isActive={activeFilter === card.key} onClick={() => handleFilterChange(card.key)} />
                    </motion.div>
                ))}
            </motion.div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                    <TodoListCard tasks={allTasks} listTitle={activeListTitle} />
                </motion.div>

                <div className="space-y-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-lg border border-slate-200 dark:border-slate-700 shadow-lg sm:rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center mb-3">
                                <span className="text-2xl mr-3">🎯</span>Goal Harian Kamu
                            </h3>
                            {todaysGoal?.goal ? (
                                <p className="text-slate-700 dark:text-slate-200 text-lg italic">"{todaysGoal.goal}"</p>
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400">Kamu belum mengatur goal untuk hari ini.</p>
                            )}
                            <button onClick={onEditGoalClick} className="mt-4 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                                {todaysGoal?.goal ? 'Ganti Goal' : 'Atur Goal Sekarang'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard(props) {
    const { auth, tasks, taskStats, filters, plans, showOnboarding, hasTodaysGoal, todaysGoal } = props;
    const { flash } = usePage().props;
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => { 
        if (flash?.show_upgrade_modal) { setShowUpgradeModal(true); } 
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

    const handleCloseUpgradeModal = () => {
        setShowUpgradeModal(false);
        router.post(route('dashboard.dismiss-upgrade-modal'), {}, { preserveState: true, preserveScroll: true });
    };
    
    const mainDashboardProps = {
        auth,
        allTasks: tasks, // Kirim seluruh objek pagination
        taskStats,
        filters,
        todaysGoal,
        onEditGoalClick: () => setIsEditingGoal(true),
        plans,
    };

    return (
        <AuthenticatedLayout 
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />
            <div className={`transition-all duration-500 ${anyModalActive ? 'blur-md' : ''}`}>
                {renderMainContent && <MainDashboard {...mainDashboardProps} /> }
            </div>
            <AnimatePresence>
                {shouldShowOnboarding && <OnboardingModal onFinish={handleOnboardingFinish} isProcessing={isProcessing} />}
                {shouldShowDailyGoal && <DailyGoalModal onSave={handleSaveDailyGoal} isProcessing={isProcessing} onClose={() => setIsEditingGoal(false)} />}
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