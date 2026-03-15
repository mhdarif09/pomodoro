
import TutorialGuide from '@/Components/TutorialGuide';
import GamificationPopup from '@/Components/GamificationPopup';
import WeeklyJourney from '@/Components/Gamification/WeeklyJourney';

import React, { useState, useEffect } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePomodoroTimer } from '@/Contexts/PomodoroContext';

import TaskFocusPanel from '@/Components/Dashboard/TaskFocusPanel';
import PriorityTaskWidget from '@/Components/Dashboard/PriorityTaskWidget';
import ContinueWorkBanner from '@/Components/Dashboard/ContinueWorkBanner';
import DailyLimitIndicator from '@/Components/Dashboard/DailyLimitIndicator';
import TaskRecoveryModal from '@/Components/Dashboard/TaskRecoveryModal';
import PomodoroIsland from '@/Components/Pomodoro/PomodoroIsland';
import ProductivityPulse from '@/Components/Dashboard/ProductivityPulse';
import UpgradeModal from '@/Components/UpgradeModal';
import DashboardNotes from '@/Components/Dashboard/DashboardNotes';
import { AnimatePresence, motion } from 'framer-motion';
import {
    PlusIcon, XMarkIcon, ListBulletIcon, CalendarDaysIcon,
    ExclamationTriangleIcon, CheckCircleIcon, PlayIcon, FireIcon, ShieldCheckIcon, BoltIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);



const QuickAddTaskModal = ({ isOpen, onClose, onTaskAdded }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            const response = await axios.post(route('api.tasks.store'), {
                title,
                description,
                start_date: startDate,
                due_date: dueDate,
                status: 'todo',
                priority: 'Sedang',
                estimated_minutes: 25
            });

            setTitle('');
            setDescription('');
            setStartDate('');
            setDueDate('');
            onTaskAdded(response.data.task);
            onClose();
        } catch (error) {
            console.error("Gagal menambah tugas", error);
            alert("Gagal menambah tugas. Coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    >
                        <div className="w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-[2rem] shadow-2xl p-6 pointer-events-auto border border-white/20 relative">
                            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200">
                                <XMarkIcon className="w-5 h-5 text-slate-500" />
                            </button>

                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Tugas Baru</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Apa yang mau dikerjakan?"
                                        className="w-full text-lg font-bold bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-0 px-0 py-2 placeholder-slate-400 dark:text-white transition-colors"
                                        autoFocus
                                        disabled={loading}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mulai</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-sm focus:ring-2 focus:ring-emerald-500 dark:text-slate-300"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deadline</label>
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-sm focus:ring-2 focus:ring-emerald-500 dark:text-slate-300"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Catatan tambahan (opsional)..."
                                        rows="3"
                                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl border-none p-4 text-sm focus:ring-2 focus:ring-emerald-500 dark:text-slate-300 resize-none"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={loading}
                                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !title}
                                        className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Menyimpan...</span>
                                            </>
                                        ) : (
                                            <>
                                                <PlusIcon className="w-5 h-5 stroke-2" />
                                                <span>Simpan Tugas</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const MainDashboard = ({ auth, allTasks, taskStats, todayTaskStats, dailyStats, aiInsightSnippet, filters = {}, onStartFocus, focusTasks, suggestedFocusTasks, resumeTask, onTaskComplete, productivityRefreshTrigger }) => {
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

    return (
        <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
            {/* --- BEN TO GRID --- */}
            <div className="grid grid-cols-12 gap-6 items-start">

                {/* 1. HERO AREA: Welcome & Header (col-12) */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="col-span-12 flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-6 mb-4 border-b border-slate-100 dark:border-slate-800 pb-8"
                >
                    <div className="flex-1 flex flex-col md:flex-row gap-8 items-start md:items-end">
                        {/* Name & Greeting */}
                        <div className="relative group shrink-0">
                            <div className="absolute -inset-4 bg-emerald-500/5 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <h1 className="text-4xl sm:text-6xl font-[1000] text-slate-900 dark:text-white tracking-tighter leading-[0.9] relative z-10 mb-3">
                                Halo, <br />
                                <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
                                    {auth?.user?.name?.split(' ')[0] || 'Teman'}
                                </span>
                            </h1>

                            {/* Rank Badge Indicator */}
                            {auth?.gamification && (
                                <div className="inline-flex items-center gap-2 bg-slate-900 dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700/50">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-inner">
                                        <ShieldCheckIcon className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-xs font-bold text-white tracking-wide">
                                        {auth.gamification.rank_title} <span className="text-slate-400">#{auth.gamification.rank_position}</span>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Gamification Quick Stats - Horizontal Row */}
                        <div className="flex flex-wrap gap-4 flex-1 w-full justify-start md:justify-end pb-1">
                            {/* Streak Fire Widget */}
                            {auth?.gamification && (
                                <div className="flex bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow items-center gap-4 min-w-[140px]">
                                    <div className={`p-2.5 rounded-xl ${auth.gamification.streak > 0 ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                        <FireIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Streak</div>
                                        <div className="text-xl font-black text-slate-800 dark:text-white leading-none">
                                            {auth.gamification.streak > 0 ? `${auth.gamification.streak} Hari` : 'Mulai Hari Ini!'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Identity Trigger Card (Urgent State) */}
                            {auth?.gamification?.identity_trigger && auth.gamification.identity_trigger.urgency === 'high' && (
                                <div className="flex bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-2xl p-3 shadow-sm items-center gap-3 animate-pulse-soft max-w-sm">
                                    <div className="p-2 bg-red-100 dark:bg-red-500/30 rounded-full text-red-600 dark:text-red-400 shrink-0">
                                        <BoltIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-red-500 uppercase tracking-wider mb-0.5">WARNING</div>
                                        <div className="text-xs font-semibold text-red-700 dark:text-red-300 leading-tight">
                                            {auth.gamification.identity_trigger.context}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Identity Trigger Card (Medium State) */}
                            {auth?.gamification?.identity_trigger && auth.gamification.identity_trigger.urgency === 'medium' && (
                                <div className="flex bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-2xl p-3 shadow-sm items-center gap-3 max-w-sm">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-500/30 rounded-full text-amber-600 dark:text-amber-400 shrink-0">
                                        <ShieldCheckIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-0.5">NAIK RANK</div>
                                        <div className="text-xs font-semibold text-amber-800 dark:text-amber-200 leading-tight">
                                            {auth.gamification.identity_trigger.context}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex shrink-0 w-full lg:w-auto mt-4 lg:mt-0">
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add-task'))}
                            className="w-full justify-center apple-button bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl flex items-center gap-2 py-4 px-8 rounded-2xl font-black active:scale-95 transition-all outline-none"
                        >
                            <PlusIcon className="w-5 h-5 stroke-[3]" />
                            Tambah Tugas
                        </button>
                    </div>
                </motion.div>

                {/* 2. MAIN HUB (SMART FOCUS) - col-8 */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Agent Briefing Tile - Kiko */}
                    {(auth.user.is_premium || auth.user.is_admin) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="apple-glass rounded-[2.5rem] p-6 shadow-xl border-white/5 bg-white dark:bg-slate-900 overflow-hidden group"
                        >
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <div className="w-20 h-20 flex-shrink-0 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 3 }}
                                        className="text-4xl"
                                    >
                                        🤖
                                    </motion.div>
                                    <div className="absolute bottom-0 inset-x-0 h-1 bg-emerald-500" />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Kiko's Briefing</span>
                                        <span className="text-[10px] font-bold text-slate-400">STATUS: ACTIVE ANALYTICS</span>
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight">Siap beraksi hari ini?</h4>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed italic border-l-0 sm:border-l-4 border-emerald-500 pl-0 sm:pl-4 bg-emerald-50/50 dark:bg-emerald-900/10 py-3 rounded-xl sm:rounded-l-none sm:rounded-r-xl">
                                        {aiInsightSnippet ? `✨ "${aiInsightSnippet}"` : "Waktunya tumbuh dan lebih produktif hari ini. Tetap fokus pada targetmu! 🚀"}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="apple-glass rounded-[2.5rem] p-6 shadow-2xl border-white/10 dark:bg-white/5"
                    >
                        <TaskFocusPanel
                            tasks={allTasks}
                            focusTasks={focusTasks}
                            suggestedFocusTasks={suggestedFocusTasks}
                            activeFilter="all"
                            onStartFocus={onStartFocus}
                            auth={auth}
                            onTaskComplete={onTaskComplete}
                            hideHero={false} // Show Smart Focus here
                            hideList={true} // Hide the redundant list
                        />
                    </motion.div>
                </div>

                {/* 3. PERFORMANCE SIDEBAR (col-4) */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Weekly Journey - Compact Widget */}
                    <WeeklyJourney compact />

                    {/* Productivity Pulse (Trends) */}
                    <ProductivityPulse refreshTrigger={productivityRefreshTrigger} />

                    {/* Momentum Stats Group */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        {/* Task Momentum Card */}
                        <div className="apple-glass p-8 rounded-[2.5rem] border-white/5 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/80 to-emerald-50/20 dark:from-slate-900/80 dark:to-emerald-900/10">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-12 -mt-12" />
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 block">Task Pipeline</span>
                                <div className="flex items-end justify-between mb-4">
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white leading-none">
                                        {todayTaskStats.completed}<span className="text-slate-400 text-xl font-bold">/{Math.max(todayTaskStats.total, 3)}</span>
                                    </h3>
                                    <div className="bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                                        {Math.round((todayTaskStats.completed / Math.max(todayTaskStats.total, 3)) * 100)}%
                                    </div>
                                </div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (todayTaskStats.completed / Math.max(todayTaskStats.total, 3)) * 100)}%` }}
                                        className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Focus Momentum Card */}
                        <div className="apple-glass p-8 rounded-[2.5rem] border-white/5 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/80 to-orange-50/20 dark:from-slate-900/80 dark:to-orange-900/10">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-12 -mt-12" />
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4 block">Deep Work Flow</span>
                                <div className="flex items-end justify-between mb-4">
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white leading-none">
                                        {dailyStats.current}<span className="text-slate-400 text-xl font-bold">/{dailyStats.limit}</span>
                                    </h3>
                                    <div className="bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                                        {Math.round((dailyStats.current / dailyStats.limit) * 100)}%
                                    </div>
                                </div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (dailyStats.current / dailyStats.limit) * 100)}%` }}
                                        className="h-full bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 4. LOWER ROW: BACKLOG & FILTERS (col-12 or col-8) */}
                <div className="col-span-12">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Semua Tugas 📖</h2>
                        <div className="flex gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                            {filterCards.map(({ key, title, icon: Icon, colorClass }) => (
                                <button
                                    key={key}
                                    onClick={() => handleFilterChange(key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0
                                        ${activeFilter === key
                                            ? `${colorClass} text-white shadow-lg`
                                            : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-100 dark:border-slate-700'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="apple-glass rounded-[2rem] p-4 shadow-xl mb-10"
                    >
                        <TaskFocusPanel
                            tasks={allTasks}
                            focusTasks={focusTasks}
                            activeFilter={activeFilter}
                            onStartFocus={onStartFocus}
                            auth={auth}
                            onTaskComplete={onTaskComplete}
                            hideHero={true} // Hide Smart Focus here as it's already shown above
                            hideList={false} // Always show list here
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard(props) {
    const {
        auth, tasks, focusTasks = [], resumeTask, stagnantTasks = [], taskStats, filters, plans, deadlineRisks = [],
        priorityTasks = [], continueWorkTask, recoveryPlan, dailyStats = { current: 0, limit: 3 },
        todayTaskStats = { completed: 0, total: 3 }, aiInsightSnippet, suggestedFocusTasks = []
    } = props;
    const { flash } = usePage().props;

    // Ensure we work with the array of tasks, handling both array and paginated object
    const resolveTasks = (t) => Array.isArray(t) ? t : (t?.data || []);

    const [localTasks, setLocalTasks] = useState(resolveTasks(tasks));
    const [localStats, setLocalStats] = useState(taskStats || { total: 0, completed: 0, dueThisWeek: 0, overdue: 0 });

    useEffect(() => {
        setLocalTasks(resolveTasks(tasks));
        setLocalStats(taskStats);
    }, [tasks, taskStats]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [showAIChoice, setShowAIChoice] = useState(false);
    const [newlyCreatedTask, setNewlyCreatedTask] = useState(null);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [showContinueBanner, setShowContinueBanner] = useState(true);

    // Use global Pomodoro timer from context (persists across page navigations)
    const pomodoro = usePomodoroTimer();
    const { activeTask, secondsLeft, isRunning, totalDuration, currentStreak, startFocus: handleStartFocus } = pomodoro;

    const [productivityRefreshTrigger, setProductivityRefreshTrigger] = useState(0);



    // Handle Task Completion (from TaskFocusPanel or QuickAdd) -> Celebrate
    const handleTaskCompleted = () => {
        setProductivityRefreshTrigger(prev => prev + 1); // Refresh stats
    };

    // Passed to TaskFocusPanel to trigger celebration
    const onTaskComplete = () => {
        handleTaskCompleted();
    };

    // --- Stagnant Task Logic ---
    const [isStagnantModalOpen, setIsStagnantModalOpen] = useState(false);

    useEffect(() => {
        if (stagnantTasks && stagnantTasks.length > 0) {
            const hasSeen = sessionStorage.getItem('stagnant_alert_seen');
            if (!hasSeen) {
                // Short delay to not clash with animations
                setTimeout(() => setIsStagnantModalOpen(true), 1500);
            }
        }
    }, [stagnantTasks]);

    const handleDismissStagnant = () => {
        setIsStagnantModalOpen(false);
        sessionStorage.setItem('stagnant_alert_seen', 'true');
    };

    // Helper functions for notifications and service worker
    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
            return false;
        }

        let permission = Notification.permission;
        if (permission === "granted") {
            return true;
        } else if (permission !== "denied") {
            permission = await Notification.requestPermission();
            return permission === "granted";
        }
        return false;
    };

    const registerServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            } catch (err) {
                console.log('ServiceWorker registration failed: ', err);
            }
        }
    };

    useEffect(() => {
        const openModal = () => setIsQuickAddOpen(true);
        window.addEventListener('open-quick-add-task', openModal);

        // Register Service Worker and request notification permission
        const initializeNotifications = async () => {
            const hasPermission = await requestNotificationPermission();
            if (hasPermission) {
                await registerServiceWorker();
            }
        };
        initializeNotifications();

        // Show recovery modal if plan exists
        if (recoveryPlan) {
            setTimeout(() => setShowRecoveryModal(true), 2000);
        }

        return () => window.removeEventListener('open-quick-add-task', openModal);
    }, [recoveryPlan]);

    const handleTaskAdded = (newTask) => {
        setLocalTasks(prevTasks => [newTask, ...prevTasks]);

        setLocalStats(prevStats => ({
            ...prevStats,
            total: (prevStats?.total || 0) + 1,
            dueThisWeek: (prevStats?.dueThisWeek || 0) + 1
        }));

        // Show AI choice modal
        setNewlyCreatedTask(newTask);
        setShowAIChoice(true);
    };

    const handleAIGenerate = async () => {
        if (!newlyCreatedTask) return;
        try {
            const res = await axios.post(route('api.tasks.suggest-breakdown', newlyCreatedTask.id));
            if (res.data.success && res.data.subtasks) {
                // Add subtasks via API
                for (const title of res.data.subtasks) {
                    await axios.post(route('api.subtasks.store', newlyCreatedTask.id), { title });
                }

                // Show usage info if available
                if (res.data.usage) {
                    const { used, limit, remaining } = res.data.usage;
                    console.log(`AI Subtask: ${used}/${limit} used, ${remaining} remaining`);
                }

                router.reload({ only: ['tasks'] });
            }
        } catch (err) {
            console.error('AI generation failed:', err);
            if (err.response?.data?.limit_reached) {
                alert(err.response.data.message);
            } else {
                alert('Gagal generate subtasks. Coba lagi.');
            }
        } finally {
            setShowAIChoice(false);
            setNewlyCreatedTask(null);
        }
    };

    const handleManualSubtasks = () => {
        setShowAIChoice(false);
        setNewlyCreatedTask(null);
    };



    useEffect(() => {
        const checkUpgradeModal = () => {
            const localSeen = localStorage.getItem('tutorial_seen');
            const isTutorialDone = auth.user.has_seen_tutorial || localSeen === 'true';

            // Check WhatsApp Flow
            const hasPhone = auth.user.phone;
            const whatsappSeen = localStorage.getItem('whatsapp_warning_seen') === 'true';
            const isWhatsAppDone = hasPhone || whatsappSeen;

            if (flash?.show_upgrade_modal && isTutorialDone && isWhatsAppDone) {
                setShowUpgradeModal(true);
            }
        };

        checkUpgradeModal();

        const handleWhatsAppDismissed = () => {
            checkUpgradeModal();
        };

        window.addEventListener('whatsapp-modal-dismissed', handleWhatsAppDismissed);
        return () => window.removeEventListener('whatsapp-modal-dismissed', handleWhatsAppDismissed);
    }, [flash, auth.user.has_seen_tutorial, auth.user.phone]);

    const shouldShowUpgrade = showUpgradeModal;
    const anyModalActive = shouldShowUpgrade;

    const handleCloseUpgradeModal = () => {
        setShowUpgradeModal(false);
        localStorage.setItem('upgrade_modal_dismissed', 'true');
        router.post(route('dashboard.dismiss-upgrade-modal'), {}, { preserveState: true, preserveScroll: true });
    };

    const mainDashboardProps = {
        auth,
        allTasks: localTasks,
        taskStats: localStats,
        todayTaskStats,
        dailyStats,
        aiInsightSnippet,
        filters,
        plans,
        focusTasks,
        resumeTask,
        suggestedFocusTasks, // Pass to MainDashboard
        onStartFocus: handleStartFocus,
        onTaskComplete: (taskId) => {
            setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: true } : t));
            // Trigger refresh or update local stats if needed
        },
        productivityRefreshTrigger // Pass the trigger down
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">Markas Pusat</h2>}
        >
            <Head title="Dashboard" />

            <TutorialGuide
                setSidebarOpen={() => { }}
            />

            <div className={`transition-all duration-500 ${anyModalActive ? 'blur-md' : ''}`}>
                {/* Deadline Risk Agent Alert */}
                {deadlineRisks.length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 mt-4">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-4 flex items-start gap-3 shadow-sm"
                        >
                            <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-xl text-amber-600 dark:text-amber-400">
                                <ExclamationTriangleIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-amber-100 text-lg">Perhatian! Ada deadline berisiko.</h3>
                                <div className="space-y-2 mt-1">
                                    {deadlineRisks.slice(0, 2).map((risk, idx) => (
                                        <div key={idx} className="text-sm text-slate-600 dark:text-amber-200/80">
                                            <span className="font-semibold text-slate-800 dark:text-amber-100">Task "{risk.task_title}":</span> {risk.reason}
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-xs bg-white dark:bg-amber-900/40 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-700/50 text-amber-700 dark:text-amber-300 font-medium">
                                                    🤖 Agent: {risk.suggestion}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Productivity Features Container */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                    {/* Daily Limit Indicator - Top Right */}
                    <div className="flex justify-end mb-4">
                        <DailyLimitIndicator current={dailyStats.current} limit={dailyStats.limit} />
                    </div>

                    {/* Continue Work Banner */}
                    {continueWorkTask && showContinueBanner && (
                        <ContinueWorkBanner
                            task={continueWorkTask}
                            onDismiss={() => setShowContinueBanner(false)}
                            onContinue={() => {
                                handleStartFocus(continueWorkTask);
                                setShowContinueBanner(false);
                            }}
                        />
                    )}

                    {/* Priority Task Widget */}
                    {priorityTasks.length > 0 && (
                        <div className="mb-6">
                            <PriorityTaskWidget tasks={priorityTasks} />
                        </div>
                    )}
                </div>

                <MainDashboard
                    {...mainDashboardProps}
                    onTaskComplete={onTaskComplete}
                />
            </div>

            <AnimatePresence>
                {isQuickAddOpen && (
                    <QuickAddTaskModal
                        isOpen={isQuickAddOpen}
                        onClose={() => setIsQuickAddOpen(false)}
                        onTaskAdded={handleTaskAdded}
                    />
                )}

                {/* AI Choice Modal */}
                {showAIChoice && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={handleManualSubtasks}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                        >
                            <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-[2rem] shadow-2xl p-8 pointer-events-auto border border-white/20">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Generate Subtasks?</h3>
                                <p className="text-slate-600 dark:text-slate-300 mb-6">Apakah kamu ingin AI membantu membuat langkah-langkah untuk tugas ini?</p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleAIGenerate}
                                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        <span className="text-lg">✨</span>
                                        Ya, Generate dengan AI
                                    </button>
                                    <button
                                        onClick={handleManualSubtasks}
                                        className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all active:scale-95"
                                    >
                                        Tidak, Saya buat sendiri
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}

                {/* Onboarding Modal Removed */}
                {shouldShowUpgrade &&
                    <UpgradeModal
                        show={shouldShowUpgrade} isOpen={shouldShowUpgrade}
                        onClose={handleCloseUpgradeModal} plans={plans}
                    />
                }

                {/* Stagnant Tasks Modal */}
                {isStagnantModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                            onClick={handleDismissStagnant}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                        >
                            <div className="w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-[2rem] shadow-2xl p-6 pointer-events-auto border border-white/20 relative mx-4 max-h-[80vh] flex flex-col">
                                <button onClick={handleDismissStagnant} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 z-10">
                                    <XMarkIcon className="w-5 h-5 text-slate-500" />
                                </button>

                                <div className="text-center mb-6">
                                    <div className="text-4xl mb-2">🕸️</div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Task Cleaning Time!</h2>
                                    <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
                                        Ada {stagnantTasks?.length} tugas yang "berdebu" (lebih dari 7 hari tidak disentuh).
                                        Yuk rapihkan!
                                    </p>
                                </div>

                                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                    {stagnantTasks?.map(task => (
                                        <div key={task.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{task.title}</h4>
                                                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 font-mono">
                                                    {dayjs(task.updated_at).fromNow()}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => {
                                                        handleStartFocus(task);
                                                        setIsStagnantModalOpen(false);
                                                    }}
                                                    className="flex-1 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                                                >
                                                    🚀 Resume
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Archive/Delete this task?')) {
                                                            axios.delete(route('api.tasks.destroy', task.id)).then(() => {
                                                                router.reload({ only: ['stagnantTasks', 'tasks', 'taskStats'] });
                                                            });
                                                        }
                                                    }}
                                                    className="flex-1 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                                >
                                                    🗑️ Archive
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                                    <button
                                        onClick={handleDismissStagnant}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-bold"
                                    >
                                        Ingatkan Nanti Saja
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}

                {/* Task Recovery Modal */}
                {showRecoveryModal && recoveryPlan && (
                    <TaskRecoveryModal
                        plan={recoveryPlan}
                        onClose={() => setShowRecoveryModal(false)}
                    />
                )}
            </AnimatePresence>

            {/* Quick Notes Widget */}
            <DashboardNotes auth={auth} />

        </AuthenticatedLayout>
    );
}