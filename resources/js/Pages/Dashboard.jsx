import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UpgradeModal from '@/Components/UpgradeModal';
import TaskFocusPanel from '@/Components/Dashboard/TaskFocusPanel';
import { ListBulletIcon, CheckCircleIcon, CalendarDaysIcon, ExclamationTriangleIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import axios from 'axios';
import PomodoroIsland from '@/Components/Pomodoro/PomodoroIsland';
import { requestNotificationPermission, registerServiceWorker, startBackgroundTimer, stopBackgroundTimer } from '@/Utils/NotificationHelper';

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
                                        className="w-full text-lg font-bold bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-0 px-0 py-2 placeholder-slate-400 dark:text-white transition-colors"
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
                                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-sm focus:ring-2 focus:ring-teal-500 dark:text-slate-300"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deadline</label>
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border-none text-sm focus:ring-2 focus:ring-teal-500 dark:text-slate-300"
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
                                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl border-none p-4 text-sm focus:ring-2 focus:ring-teal-500 dark:text-slate-300 resize-none"
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
                                        className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
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

    return (
        <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-12"
            >
                <div>
                    <h1 className="text-4xl sm:text-6xl font-[900] text-slate-900 dark:text-white tracking-tight leading-tight">
                        Halo, <span className="text-teal-500">{auth?.user?.name?.split(' ')[0] || 'Teman'}</span>
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mt-3 font-semibold tracking-tight">
                        Waktunya tumbuh dan lebih produktif hari ini. 🚀
                    </p>
                </div>

                <div className="flex shrink-0">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add-task'))}
                        className="apple-button bg-teal-500 hover:bg-teal-600 text-white shadow-xl shadow-teal-500/20 flex items-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5 stroke-2" />
                        Tambah Tugas
                    </button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="apple-glass p-1.5 rounded-[2rem] flex items-center shadow-lg border-white/5 mb-12 overflow-x-auto scrollbar-hide"
            >
                {filterCards.map(({ key, title, icon: Icon, colorClass }) => (
                    <button
                        key={key}
                        onClick={() => handleFilterChange(key)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.5rem] text-[13px] font-bold transition-all duration-500 relative overflow-hidden group flex-shrink-0
                            ${activeFilter === key
                                ? 'text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        {activeFilter === key && (
                            <motion.div
                                layoutId="activeFilterBg"
                                className={`absolute inset-0 ${colorClass} brightness-110`}
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeFilter === key ? 'text-white' : 'text-slate-400 group-hover:text-teal-500'}`} />
                        <span className={activeFilter === key ? 'block' : 'hidden md:block'}>{title}</span>
                    </button>
                ))}
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
        </div >
    );
};

export default function Dashboard(props) {
    const { auth, tasks, taskStats, filters, plans, deadlineRisks = [] } = props;
    const { flash } = usePage().props;

    const [localTasks, setLocalTasks] = useState(tasks || { data: [], total: 0 });
    const [localStats, setLocalStats] = useState(taskStats || { total: 0, completed: 0, dueThisWeek: 0, overdue: 0 });

    useEffect(() => {
        setLocalTasks(tasks);
        setLocalStats(taskStats);
    }, [tasks, taskStats]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [showAIChoice, setShowAIChoice] = useState(false);
    const [newlyCreatedTask, setNewlyCreatedTask] = useState(null);

    const [activeTask, setActiveTask] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [totalDuration, setTotalDuration] = useState(25 * 60);

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

        return () => window.removeEventListener('open-quick-add-task', openModal);
    }, []);

    const handleTaskAdded = (newTask) => {
        setLocalTasks(prevTasks => ({
            ...prevTasks,
            data: [newTask, ...(prevTasks?.data || [])],
            total: (prevTasks?.total || 0) + 1
        }));

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

    const handleStartFocus = async (task) => {
        const duration = task.estimated_minutes || 25;

        try {
            // Start session on backend for sync
            await axios.post(route('api.pomodoro.start'), {
                task_id: task.id,
                duration_minutes: duration
            });

            setActiveTask(task);
            setSecondsLeft(duration * 60);
            setTotalDuration(duration * 60);
            setStartTime(dayjs());
            setIsRunning(true);

            // Start background timer for notifications
            startBackgroundTimer({
                taskId: task.id,
                taskTitle: task.title,
                totalSeconds: duration * 60,
                remainingSeconds: duration * 60
            });

            if (auth.user.is_premium && task.auto_open_url) {
                window.open(task.auto_open_url, '_blank');
            }
        } catch (err) {
            console.error('Failed to start session:', err);
        }
    };

    const stopSession = async (manuallyStopped = true) => {
        if (!isRunning) return;
        setIsRunning(false);

        try {
            // Stop background timer
            stopBackgroundTimer();

            // Use new stop endpoint for sync
            await axios.post(route('api.pomodoro.stop'), {
                break_minutes: 0,
                tab_switches: 0,
                ai_questions_asked: 0,
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

    // Check for active session on mount (for sync)
    useEffect(() => {
        const checkActiveSession = async () => {
            try {
                const res = await axios.get(route('api.pomodoro.active'));
                if (res.data.session) {
                    const session = res.data.session;
                    const startedAt = dayjs(session.started_at);
                    const elapsed = dayjs().diff(startedAt, 'seconds');
                    const totalSecs = session.focus_minutes * 60;
                    const remaining = Math.max(0, totalSecs - elapsed);

                    if (remaining > 0) {
                        setActiveTask(session.task || { id: session.task_id, title: 'Sesi Fokus' });
                        setSecondsLeft(remaining);
                        setTotalDuration(totalSecs);
                        setStartTime(startedAt);
                        setIsRunning(true);
                    }
                }
            } catch (err) {
                console.error('Failed to check active session:', err);
            }
        };
        checkActiveSession();
    }, []);

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
        const localSeen = localStorage.getItem('tutorial_seen');
        const isTutorialDone = auth.user.has_seen_tutorial || localSeen === 'true';

        if (flash?.show_upgrade_modal && isTutorialDone) {
            setShowUpgradeModal(true);
        }
    }, [flash, auth.user.has_seen_tutorial]);

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
        filters,
        plans,
        onStartFocus: handleStartFocus,
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">Markas Pusat</h2>}
        >
            <Head title="Dashboard" />
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

                <MainDashboard {...mainDashboardProps} />
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
        </AuthenticatedLayout>
    );
}