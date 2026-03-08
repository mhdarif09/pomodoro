import { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlusIcon, ListBulletIcon, CalendarDaysIcon, ExclamationTriangleIcon,
    CheckCircleIcon, CheckIcon, PlayIcon, XMarkIcon, ChartBarIcon
} from '@heroicons/react/24/outline';
import TaskFocusPanel from '@/Components/Dashboard/TaskFocusPanel';
import WeeklyJourney from '@/Components/Gamification/WeeklyJourney';
import { usePomodoroTimer } from '@/Contexts/PomodoroContext';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

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
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border-0 rounded-2xl text-lg font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 transition-all"
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
                                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
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
    const { auth, tasks, focusTasks = [], resumeTask, stagnantTasks = [], taskStats, todayTaskStats = { completed: 0, total: 3 }, filters, suggestedFocusTasks = [] } = props;

    const [localTasks, setLocalTasks] = useState(tasks || { data: [], total: 0 });
    const [localStats, setLocalStats] = useState(taskStats || { total: 0, completed: 0, dueThisWeek: 0, overdue: 0 });
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [showAIChoice, setShowAIChoice] = useState(false);
    const [newlyCreatedTask, setNewlyCreatedTask] = useState(null);

    // Use global Pomodoro timer from context (persists across page navigations)
    const pomodoro = usePomodoroTimer();
    const { startFocus: handleStartFocus } = pomodoro;

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

            <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
                {/* 1. MINIMALIST HEADER */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 dark:border-slate-800 pb-10"
                >
                    <div>
                        <h1 className="text-5xl sm:text-7xl font-[1000] text-slate-900 dark:text-white tracking-[ -0.05em] leading-[0.9]">
                            My Tasks <span className="text-emerald-500">.</span>
                        </h1>
                        <p className="text-xl text-slate-400 dark:text-slate-500 mt-4 font-bold tracking-tight">
                            Command your day, one task at a time.
                        </p>
                    </div>

                    <div className="flex shrink-0">
                        <button
                            onClick={() => setIsQuickAddOpen(true)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl shadow-emerald-500/20 px-10 py-5 rounded-[2rem] font-[1000] text-lg transition-all active:scale-95 flex items-center gap-3"
                        >
                            <PlusIcon className="w-6 h-6 stroke-[3]" />
                            Create Task
                        </button>
                    </div>
                </motion.div>

                {/* Weekly Journey Widget - Compact */}
                <WeeklyJourney compact />

                {/* 2. PERSISTENCE BANNERS (Resume & Momentum) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Resume Widget */}
                    <AnimatePresence>
                        {resumeTask && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="col-span-1 md:col-span-2"
                            >
                                <div className="bg-slate-900 dark:bg-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group h-full">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/30 transition-all duration-1000" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4 text-emerald-400 dark:text-emerald-600 font-black uppercase tracking-widest text-[10px]">
                                            <PlayIcon className="w-4 h-4 fill-current" />
                                            <span>Active Memory</span>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black text-white dark:text-slate-900 mb-6 leading-tight">
                                            Keep looking at <br />
                                            <span className="text-emerald-400 dark:text-emerald-600">"{resumeTask.title}"</span>
                                        </h3>
                                        <button
                                            onClick={() => handleStartFocus(resumeTask)}
                                            className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3"
                                        >
                                            <PlayIcon className="w-6 h-6 fill-current" />
                                            <span>Focus Now</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Momentum Stats Group */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="col-span-1 border-2 border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between"
                    >
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Daily Velocity</span>
                            <p className="text-5xl font-black text-slate-900 dark:text-white">
                                {todayTaskStats.completed}<span className="text-slate-300">/{Math.max(todayTaskStats.total, 3)}</span>
                            </p>
                        </div>
                        <div className="mt-8">
                            <div className="h-4 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.round((todayTaskStats.completed / Math.max(todayTaskStats.total, 3)) * 100)}%` }}
                                    className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                                />
                            </div>
                            <p className="text-[11px] font-black text-emerald-500 uppercase mt-4 text-right">
                                {Math.round((todayTaskStats.completed / Math.max(todayTaskStats.total, 3)) * 100)}% COMPLETED
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* 3. TASK REPOSITORY (Filters & List) */}
                <div className="space-y-8">
                    {/* Visual Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap items-center gap-3"
                    >
                        {filterCards.map(({ key, title, icon: Icon, colorClass }) => (
                            <button
                                key={key}
                                onClick={() => handleFilterChange(key)}
                                className={`flex items-center gap-2 px-8 py-4 rounded-[2rem] text-sm font-black transition-all border-2
                                    ${activeFilter === key
                                        ? `${colorClass} text-white border-transparent shadow-xl`
                                        : 'bg-white dark:bg-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white border-slate-100 dark:border-slate-800'
                                    }`}
                            >
                                <Icon className="w-5 h-5 stroke-[2.5]" />
                                <span>{title}</span>
                            </button>
                        ))}
                    </motion.div>

                    {/* Task Display */}
                    <div className="apple-glass rounded-[3rem] p-6 shadow-2xl border-white/5">
                        <TaskFocusPanel
                            tasks={localTasks}
                            focusTasks={focusTasks}
                            activeFilter={activeFilter}
                            onStartFocus={handleStartFocus}
                            auth={auth}
                            suggestedFocusTasks={suggestedFocusTasks}
                            hideHero={false} // Hero shows "Today's Focus" inside TaskFocusPanel
                        />
                    </div>
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
                </AnimatePresence>
            </div>
        </AuthenticatedLayout>
    );
}
