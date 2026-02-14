import { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlusIcon, ListBulletIcon, CalendarDaysIcon, ExclamationTriangleIcon,
    CheckCircleIcon, CheckIcon, PlayIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import TaskFocusPanel from '@/Components/Dashboard/TaskFocusPanel';
import PomodoroIsland from '@/Components/Pomodoro/PomodoroIsland';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { requestNotificationPermission, registerServiceWorker, startBackgroundTimer, stopBackgroundTimer } from '@/Utils/NotificationHelper';

dayjs.extend(relativeTime);

// Quick Add Modal
function QuickAddTaskModal({ isOpen, onClose, onTaskAdded }) {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post(route('api.tasks.store'), {
                title: title.trim(),
                status: 'todo',
                priority: 'Sedang',
            });
            onTaskAdded(res.data.task || res.data);
            setTitle('');
            onClose();
        } catch (err) {
            console.error('Failed to create task:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
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
                <div className="w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-[2rem] shadow-2xl p-8 pointer-events-auto border border-white/20 mx-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">✏️ Tugas Baru</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Apa yang ingin kamu kerjakan hari ini?"
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border-0 rounded-2xl text-lg font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 transition-all"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !title.trim()}
                                className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
                            >
                                {loading ? '⏳' : '🚀 Tambah'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </>
    );
}

export default function MyTasks(props) {
    const { auth, tasks, focusTasks = [], resumeTask, stagnantTasks = [], taskStats, filters } = props;

    const [localTasks, setLocalTasks] = useState(tasks || { data: [], total: 0 });
    const [localStats, setLocalStats] = useState(taskStats || { total: 0, completed: 0, dueThisWeek: 0, overdue: 0 });
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [showAIChoice, setShowAIChoice] = useState(false);
    const [newlyCreatedTask, setNewlyCreatedTask] = useState(null);

    // Pomodoro
    const [activeTask, setActiveTask] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [totalDuration, setTotalDuration] = useState(25 * 60);

    // Stagnant
    const [isStagnantModalOpen, setIsStagnantModalOpen] = useState(false);

    useEffect(() => {
        setLocalTasks(tasks);
        setLocalStats(taskStats);
    }, [tasks, taskStats]);

    useEffect(() => {
        if (stagnantTasks && stagnantTasks.length > 0) {
            const hasSeen = sessionStorage.getItem('stagnant_alert_seen_tasks');
            if (!hasSeen) {
                setTimeout(() => setIsStagnantModalOpen(true), 1500);
            }
        }
    }, [stagnantTasks]);

    const handleDismissStagnant = () => {
        setIsStagnantModalOpen(false);
        sessionStorage.setItem('stagnant_alert_seen_tasks', 'true');
    };

    // Keyboard shortcut
    useEffect(() => {
        const openModal = () => setIsQuickAddOpen(true);
        window.addEventListener('open-quick-add-task', openModal);
        return () => window.removeEventListener('open-quick-add-task', openModal);
    }, []);

    // Notifications
    useEffect(() => {
        (async () => {
            const hasPermission = await requestNotificationPermission();
            if (hasPermission) await registerServiceWorker();
        })();
    }, []);

    const handleTaskAdded = (newTask) => {
        setLocalTasks(prev => ({
            ...prev,
            data: [newTask, ...(prev?.data || [])],
            total: (prev?.total || 0) + 1
        }));
        setLocalStats(prev => ({
            ...prev,
            total: (prev?.total || 0) + 1,
            dueThisWeek: (prev?.dueThisWeek || 0) + 1
        }));
        setNewlyCreatedTask(newTask);
        setShowAIChoice(true);
    };

    const handleAIGenerate = async () => {
        if (!newlyCreatedTask) return;
        try {
            const res = await axios.post(route('api.tasks.suggest-breakdown', newlyCreatedTask.id));
            if (res.data.success && res.data.subtasks) {
                for (const title of res.data.subtasks) {
                    await axios.post(route('api.subtasks.store', newlyCreatedTask.id), { title });
                }
                router.reload({ only: ['tasks'] });
            }
        } catch (err) {
            console.error('AI generation failed:', err);
            if (err.response?.data?.limit_reached) {
                alert(err.response.data.message);
            } else {
                alert('Gagal generate subtasks.');
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
            await axios.post(route('api.pomodoro.start'), {
                task_id: task.id,
                duration_minutes: duration
            });
            setActiveTask(task);
            setSecondsLeft(duration * 60);
            setTotalDuration(duration * 60);
            setStartTime(dayjs());
            setIsRunning(true);
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
            stopBackgroundTimer();
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

    // Check active session on mount
    useEffect(() => {
        (async () => {
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
        })();
    }, []);

    // Timer countdown
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

    const activeFilter = filters?.filter || 'all';

    const handleFilterChange = (newFilter) => {
        router.get(route('tasks.index'), { filter: newFilter }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const filterCards = [
        { key: 'all', title: 'Semua', value: localStats.total, icon: ListBulletIcon, colorClass: 'bg-blue-500' },
        { key: 'week', title: 'Minggu Ini', value: localStats.dueThisWeek, icon: CalendarDaysIcon, colorClass: 'bg-orange-500' },
        { key: 'overdue', title: 'Terlambat', value: localStats.overdue, icon: ExclamationTriangleIcon, colorClass: 'bg-red-500' },
        { key: 'completed', title: 'Selesai', value: localStats.completed, icon: CheckCircleIcon, colorClass: 'bg-green-500' },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">My Tasks</h2>}
        >
            <Head title="My Tasks" />

            <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10"
                >
                    <div>
                        <h1 className="text-3xl sm:text-5xl font-[900] text-slate-900 dark:text-white tracking-tight leading-tight">
                            My Tasks 📋
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 font-semibold tracking-tight">
                            Kelola semua tugas pribadimu di sini.
                        </p>
                    </div>

                    <div className="flex shrink-0">
                        <button
                            onClick={() => setIsQuickAddOpen(true)}
                            className="apple-button bg-teal-500 hover:bg-teal-600 text-white shadow-xl shadow-teal-500/20 flex items-center gap-2"
                        >
                            <PlusIcon className="w-5 h-5 stroke-2" />
                            Tambah Tugas
                        </button>
                    </div>
                </motion.div>

                {/* Resume Task Widget */}
                <AnimatePresence>
                    {resumeTask && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            className="mb-8"
                        >
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white/10 dark:to-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-teal-500/30 transition-all duration-1000" />
                                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-teal-400 font-bold uppercase tracking-wider text-xs">
                                            <PlayIcon className="w-4 h-4" />
                                            <span>Resume Activation</span>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-black text-white mb-1">
                                            Lanjutkan tugasmu!
                                        </h3>
                                        <p className="text-slate-400 text-sm md:text-base">
                                            Ready to continue <span className="text-white font-bold">"{resumeTask.title}"</span>?
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleStartFocus(resumeTask)}
                                        className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                                    >
                                        <PlayIcon className="w-5 h-5 fill-current" />
                                        <span>Resume Task</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filter Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="apple-glass p-1.5 rounded-[2rem] flex items-center shadow-lg border-white/5 mb-10 overflow-x-auto scrollbar-hide"
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
                                    layoutId="activeFilterBgTasks"
                                    className={`absolute inset-0 ${colorClass} brightness-110`}
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon className={`w-4 h-4 relative z-10 transition-transform group-hover:scale-110 ${activeFilter === key ? 'text-white' : 'text-slate-400 group-hover:text-teal-500'}`} />
                            <span className="relative z-10">{title}</span>
                        </button>
                    ))}
                </motion.div>

                {/* Focus Panel + Tasks */}
                <div className="space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <TaskFocusPanel
                            tasks={localTasks}
                            focusTasks={focusTasks}
                            activeFilter={activeFilter}
                            onStartFocus={handleStartFocus}
                            auth={auth}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Quick Add Modal */}
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
                                <p className="text-slate-600 dark:text-slate-300 mb-6">Ingin AI membantu membuat langkah-langkah tugas ini?</p>
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
                                                    className="flex-1 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-bold rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
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
            </AnimatePresence>

            {/* Pomodoro Island */}
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
