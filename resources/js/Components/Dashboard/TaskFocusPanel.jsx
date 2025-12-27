import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    CheckCircleIcon,
    TrashIcon,
    PlayIcon,
    ClockIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ChevronRightIcon,
    ListBulletIcon,
    CheckIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link } from '@inertiajs/react';
import { useMemo } from 'react';
import { debounce } from 'lodash';
import { LinkIcon } from '@heroicons/react/24/solid';

export default function TaskFocusPanel({ tasks, activeFilter, onStartFocus, auth }) {
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const [addingToColumn, setAddingToColumn] = useState(null);

    useEffect(() => {
        const handleOpenQuickAdd = () => {
            setAddingToColumn('todo');
            // Scroll to Kanban if needed
            document.getElementById('kanban-board')?.scrollIntoView({ behavior: 'smooth' });
        };
        window.addEventListener('open-quick-add-task', handleOpenQuickAdd);
        return () => window.removeEventListener('open-quick-add-task', handleOpenQuickAdd);
    }, []);

    // Helper to format duration
    const formatDuration = (minutes) => {
        if (!minutes) return '25m'; // Default pomodoro
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    const handleToggleComplete = (task) => {
        setProcessingId(`toggle-${task.id}`);
        axios.patch(route('api.tasks.toggle-complete', task.id))
            .then(() => {
                // Refresh dashboard to reflect changes
                router.reload({ only: ['tasks', 'taskStats'] });
            })
            .finally(() => setProcessingId(null));
    };

    const handleDeleteTask = (task) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        setProcessingId(`delete-${task.id}`);
        axios.delete(route('api.tasks.destroy', task.id))
            .then(() => {
                router.reload({ only: ['tasks', 'taskStats'] });
            })
            .finally(() => setProcessingId(null));
    };

    const handleToggleSubtask = (subtask) => {
        // Toggle local state optimistically or just refresh
        // For subtasks, simple refresh is easiest but might flickery. 
        // Let's use axios and reload.
        axios.patch(route('api.subtasks.update', subtask.id), {
            is_completed: !subtask.is_completed
        }).then(() => {
            router.reload({ only: ['tasks'] });
        });
    };

    const handleStartFocus = (task) => {
        if (onStartFocus) {
            onStartFocus(task);
        }
    };

    if (!tasks.data || tasks.data.length === 0) {
        return (
            <div className="p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700/50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                    <ListBulletIcon className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Belum ada tugas</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
                    {activeFilter === 'all'
                        ? 'Mulai harimu dengan menambahkan tugas baru di Kanban!'
                        : 'Tidak ada tugas yang sesuai dengan filter ini.'}
                </p>
                <button
                    onClick={() => router.visit(route('kanban.index'))}
                    className="mt-6 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20"
                >
                    Tambah Tugas Sekarang
                </button>
            </div>
        );
    }

    const columns = [
        { id: 'todo', title: 'Belum Dimulai', icon: <div className="w-2 h-2 rounded-full bg-slate-400" />, status: 'todo' },
        { id: 'doing', title: 'Sedang Dikerjakan', icon: <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />, status: 'in_progress' },
        { id: 'done', title: 'Selesai', icon: <div className="w-2 h-2 rounded-full bg-emerald-500" />, status: 'done' }
    ];

    const getTasksByStatus = (status) => {
        return tasks.data.filter(t => { // Changed filteredTasks to tasks.data
            if (status === 'todo') return !t.is_completed && (!t.status || t.status === 'todo');
            if (status === 'in_progress') return !t.is_completed && t.status === 'in_progress';
            if (status === 'done') return t.is_completed;
            return false;
        });
    };

    const handleTaskClick = (taskId) => {
        setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
    };

    return (
        <div className="space-y-6" id="kanban-board">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map(column => (
                    <div key={column.id} className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 px-2">
                            {column.icon}
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                {column.title}
                            </h3>
                            <span className="ml-2 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                                {getTasksByStatus(column.status).length}
                            </span>

                            {column.status === 'todo' && (
                                <button
                                    onClick={() => setAddingToColumn(addingToColumn === 'todo' ? null : 'todo')}
                                    className="ml-auto p-1 text-slate-400 hover:text-teal-500 transition-colors"
                                >
                                    <ListBulletIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {addingToColumn === column.status && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-slate-800 p-3 rounded-2xl border-2 border-dashed border-teal-500/30"
                            >
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const title = e.target.title.value;
                                        if (!title.trim()) return;
                                        setProcessingId('quick-add');
                                        axios.post(route('api.tasks.store'), {
                                            title: title,
                                            status: column.status,
                                            due_date: e.target.due_date.value || null,
                                            estimated_minutes: e.target.estimated_minutes.value || null
                                        }).then(() => {
                                            setAddingToColumn(null);
                                            router.reload({ only: ['tasks', 'taskStats'] });
                                        }).finally(() => setProcessingId(null));
                                    }}
                                    className="space-y-3"
                                >
                                    <div className="space-y-2">
                                        <input
                                            name="title"
                                            type="text"
                                            placeholder="Ketik tugas baru..."
                                            autoFocus
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-2 px-3 text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/20"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                name="due_date"
                                                type="date"
                                                className="flex-1 bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-1.5 px-3 text-xs font-bold text-slate-500 focus:ring-2 focus:ring-teal-500/20"
                                                title="Tenggat Waktu"
                                            />
                                            <input
                                                name="estimated_minutes"
                                                type="number"
                                                placeholder="Menit"
                                                className="w-20 bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-1.5 px-3 text-xs font-bold text-slate-500 focus:ring-2 focus:ring-teal-500/20"
                                                title="Estimasi Waktu (Menit)"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setAddingToColumn(null)}
                                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processingId === 'quick-add'}
                                            className="bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg shadow-teal-500/20 active:scale-95 disabled:opacity-50"
                                        >
                                            Simpan
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        <div className="space-y-4 min-h-[150px]">
                            {getTasksByStatus(column.status).map((task) => (
                                <motion.div
                                    layout
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`group relative bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 overflow-hidden ${expandedTaskId === task.id ? 'ring-2 ring-teal-500/20' : ''}`}
                                >
                                    {/* Card Header/Preview */}
                                    <div
                                        onClick={() => handleTaskClick(task.id)}
                                        className="p-5 cursor-pointer select-none"
                                    >
                                        <div className="flex items-start gap-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleComplete(task);
                                                }}
                                                className={`mt-1 flex-shrink-0 w-6 h-6 rounded-xl border-2 transition-all flex items-center justify-center active:scale-90
                                                    ${task.is_completed
                                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-teal-500 bg-slate-50/50 dark:bg-slate-900/50'
                                                    }`}
                                            >
                                                {task.is_completed && <CheckIcon className="w-4 h-4 stroke-[3]" />}
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-sm font-bold tracking-tight transition-all truncate ${task.is_completed ? 'text-slate-400 line-through decoration-slate-400/50' : 'text-slate-900 dark:text-white'}`}>
                                                    {task.title}
                                                </h4>

                                                <div className="flex items-center gap-3 mt-2">
                                                    {task.subtasks?.length > 0 && (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="flex -space-x-1">
                                                                {[...Array(task.subtasks.length)].map((_, i) => (
                                                                    <div key={i} className={`w-1.5 h-1.5 rounded-full border border-white dark:border-slate-800 ${i < task.subtasks.filter(s => s.is_completed).length ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                                                ))}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-400">
                                                                {task.subtasks.filter(s => s.is_completed).length}/{task.subtasks.length}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {task.estimated_minutes && (
                                                        <div className="flex items-center gap-1 text-[10px] font-black text-teal-600/70 dark:text-teal-400/70 uppercase tracking-widest">
                                                            <ClockIcon className="w-3 h-3" />
                                                            {task.estimated_minutes}M
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    <AnimatePresence>
                                        {expandedTaskId === task.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-900/20"
                                            >
                                                <div className="p-5 space-y-5">
                                                    {/* Pomodoro Action */}
                                                    {!task.is_completed && (
                                                        <div className="group/focus relative">
                                                            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover/focus:opacity-40 transition duration-500"></div>
                                                            <button
                                                                onClick={() => handleStartFocus(task)}
                                                                className="relative w-full flex items-center justify-between gap-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-teal-600 text-white p-3.5 rounded-xl font-bold text-xs shadow-xl transition-all active:scale-[0.98] border border-white/10"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
                                                                        <PlayIcon className="w-5 h-5 text-white" />
                                                                    </div>
                                                                    <span className="tracking-tight uppercase font-black text-[10px]">Mulai Fokus Utama</span>
                                                                </div>
                                                                <div className="bg-white/10 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-white/5">
                                                                    {formatDuration(task.estimated_minutes || 25)}
                                                                </div>
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Subtasks Section */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Sub-Tasks</h5>
                                                            <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full">
                                                                {task.subtasks?.filter(s => s.is_completed).length || 0}/{task.subtasks?.length || 0}
                                                            </span>
                                                        </div>

                                                        {/* Subtasks List */}
                                                        {task.subtasks && task.subtasks.length > 0 && (
                                                            <div className="space-y-2">
                                                                {task.subtasks.map((subtask) => (
                                                                    <div key={subtask.id} className="flex items-center gap-3 group/sub">
                                                                        <button
                                                                            onClick={() => handleToggleSubtask(subtask)}
                                                                            className={`flex-shrink-0 w-4.5 h-4.5 rounded-[0.5rem] border-2 transition-all flex items-center justify-center active:scale-90
                                                                                ${subtask.is_completed
                                                                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-500'
                                                                                }`}
                                                                        >
                                                                            {subtask.is_completed && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                                                                        </button>
                                                                        <span className={`text-[13px] font-bold tracking-tight transition-all flex-1 ${subtask.is_completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                                                            {subtask.title}
                                                                        </span>
                                                                        {/* Subtask Specific Focus */}
                                                                        {!subtask.is_completed && (
                                                                            <button
                                                                                onClick={() => handleStartFocus({ ...task, title: `${task.title} - ${subtask.title}` })}
                                                                                className="opacity-0 group-hover/sub:opacity-100 p-1 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-all"
                                                                            >
                                                                                <PlayIcon className="w-4 h-4 fill-current" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Quick Add Form */}
                                                        {!task.is_completed && (
                                                            <form
                                                                onSubmit={(e) => {
                                                                    e.preventDefault();
                                                                    const title = e.target.subtask.value;
                                                                    if (!title.trim()) return;
                                                                    setProcessingId(`add-sub-${task.id}`);
                                                                    axios.post(route('api.subtasks.store', task.id), {
                                                                        title: title
                                                                    }).then(() => {
                                                                        e.target.subtask.value = '';
                                                                        router.reload({ only: ['tasks'] });
                                                                    }).finally(() => setProcessingId(null));
                                                                }}
                                                                className="relative mt-2"
                                                            >
                                                                <input
                                                                    name="subtask"
                                                                    type="text"
                                                                    placeholder="Tambah subtask..."
                                                                    disabled={processingId === `add-sub-${task.id}`}
                                                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-3 pr-9 text-xs font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/20 shadow-sm transition-all"
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-teal-500 transition-colors"
                                                                >
                                                                    <ChevronRightIcon className="w-3.5 h-3.5 stroke-[3]" />
                                                                </button>
                                                            </form>
                                                        )}
                                                    </div>

                                                    {/* Quick Notes Section */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Quick Notes</h5>
                                                                {!auth?.user?.is_premium && <LockClosedIcon className="w-2.5 h-2.5 text-amber-500" />}
                                                            </div>
                                                            {processingId === `saving-notes-${task.id}` && (
                                                                <span className="text-[8px] font-bold text-teal-500 animate-pulse">Menyimpan...</span>
                                                            )}
                                                        </div>
                                                        <div className="relative">
                                                            <textarea
                                                                defaultValue={task.notes}
                                                                disabled={!auth?.user?.is_premium}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    const taskId = task.id;
                                                                    setProcessingId(`saving-notes-${taskId}`);
                                                                    const save = debounce(() => {
                                                                        axios.patch(route('api.tasks.update', taskId), {
                                                                            notes: value
                                                                        }).finally(() => setProcessingId(null));
                                                                    }, 1000);
                                                                    save();
                                                                }}
                                                                placeholder={auth?.user?.is_premium ? "Tulis catatan cepat atau ide di sini..." : "Fitur Premium: Simpan catatan penting untuk tugas ini."}
                                                                className={`w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/10 min-h-[100px] transition-all ${!auth?.user?.is_premium ? 'cursor-not-allowed opacity-60' : ''}`}
                                                            />
                                                            {!auth?.user?.is_premium && (
                                                                <Link
                                                                    href={route('subscribe.index')}
                                                                    className="absolute inset-0 flex items-center justify-center bg-slate-900/5 rounded-2xl group-hover:bg-slate-900/10 transition-all"
                                                                >
                                                                    <span className="bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-amber-600 border border-amber-500/20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        Upgrade Premium
                                                                    </span>
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Auto-open URL Section */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Launch URL</h5>
                                                                {!auth?.user?.is_premium && <LockClosedIcon className="w-2.5 h-2.5 text-amber-500" />}
                                                            </div>
                                                            {task.auto_open_url && auth?.user?.is_premium && (
                                                                <a
                                                                    href={task.auto_open_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[9px] font-bold text-teal-600 hover:underline flex items-center gap-1"
                                                                >
                                                                    <LinkIcon className="w-2.5 h-2.5" />
                                                                    Buka Link
                                                                </a>
                                                            )}
                                                        </div>
                                                        <div className="relative">
                                                            <input
                                                                type="url"
                                                                disabled={!auth?.user?.is_premium}
                                                                defaultValue={task.auto_open_url}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    const taskId = task.id;
                                                                    setProcessingId(`saving-url-${taskId}`);
                                                                    const save = debounce(() => {
                                                                        axios.patch(route('api.tasks.update', taskId), {
                                                                            auto_open_url: value
                                                                        }).finally(() => setProcessingId(null));
                                                                    }, 1000);
                                                                    save();
                                                                }}
                                                                placeholder={auth?.user?.is_premium ? "https://..." : "Luncurkan link otomatis saat bekerja"}
                                                                className={`w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-[10px] font-bold text-teal-600 dark:text-teal-400 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/10 transition-all ${!auth?.user?.is_premium ? 'cursor-not-allowed opacity-60' : ''}`}
                                                            />
                                                        </div>
                                                        {task.auto_open_url && !task.is_completed && auth?.user?.is_premium && (
                                                            <p className="text-[8px] text-slate-400 italic">
                                                                * Link ini akan otomatis terbuka saat sesi Fokus dimulai.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {tasks.data.length < tasks.total && (
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 text-center">
                    <button
                        onClick={() => router.visit(route('kanban.index'))}
                        className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 hover:text-teal-700 transition-colors"
                    >
                        Lihat Semua Tugas di Kanban Board →
                    </button>
                </div>
            )}
        </div>
    );
}
