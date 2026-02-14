import { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    PlusIcon, EllipsisHorizontalIcon, CalendarIcon, UserCircleIcon, FlagIcon,
    Bars3Icon, Squares2X2Icon
} from '@heroicons/react/24/outline';
import { PlayIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Menu, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
    DndContext, useSensor, useSensors, PointerSensor, DragOverlay,
    defaultDropAnimationSideEffects, closestCorners
} from '@dnd-kit/core';
import {
    SortableContext, useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import axios from 'axios';
import SlideOver from '@/Components/SlideOver';
import PomodoroIsland from '@/Components/Pomodoro/PomodoroIsland';
import { requestNotificationPermission, registerServiceWorker, startBackgroundTimer, stopBackgroundTimer } from '@/Utils/NotificationHelper';

dayjs.extend(relativeTime);

// --- Task Card Component ---
function TaskCard({ task, isOverlay, listeners, attributes, style, setNodeRef, onClick, onDelete, onToggleFocus }) {
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}
            onClick={onClick}
            className={`group relative bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${isOverlay ? 'shadow-2xl scale-105 z-50 rotate-3' : ''}`}>

            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${task.priority === 'Tinggi' || task.priority === 'Mendesak' ? 'bg-red-100 text-red-600' :
                        task.priority === 'Sedang' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                        {task.priority || 'Normal'}
                    </div>
                    {/* Focus Star Toggle */}
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); if (onToggleFocus) onToggleFocus(task); }}
                        className={`w-5 h-5 flex items-center justify-center transition-colors ${task.focus_date && new Date(task.focus_date).toDateString() === new Date().toDateString() ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}
                        title="Toggle Guild Focus"
                    >
                        <svg className={`w-4 h-4 ${task.focus_date && new Date(task.focus_date).toDateString() === new Date().toDateString() ? 'fill-current' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </button>
                </div>
                {onDelete && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(task); }} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="sr-only">Delete</span>
                        &times;
                    </button>
                )}
            </div>

            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2">{task.title}</h4>

            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                {task.assignee ? (
                    <div className="flex items-center gap-1" title={`Assigned to ${task.assignee.name}`}>
                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[9px] border border-white dark:border-slate-800">
                            {task.assignee.name.charAt(0)}
                        </div>
                        <span className="text-[10px] font-medium opacity-75 truncate max-w-[80px]">{task.assignee.name}</span>
                    </div>
                ) : (
                    <div className="text-[10px] italic opacity-50">Unassigned</div>
                )}

                {task.due_date && (
                    <div className="flex items-center gap-1 ml-auto">
                        <CalendarIcon className="w-3 h-3" />
                        {format(new Date(task.due_date), 'MMM d')}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Sortable Wrapper ---
function SortableTaskItem({ task, ...props }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <TaskCard
            task={task}
            {...props}
            listeners={listeners}
            attributes={attributes}
            style={style}
            setNodeRef={setNodeRef}
        />
    );
}

// --- Droppable Column ---
function DroppableColumn({ id, title, tasks, children, color }) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 min-h-[500px] border border-slate-200/50 dark:border-slate-800/50">
            <div className={`flex items-center gap-2 mb-4 pb-2 border-b-2 ${color}`}>
                <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">{title}</h3>
                <span className="ml-auto bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{tasks.length}</span>
            </div>
            <SortableContext id={id} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 flex-1">
                    {children}
                </div>
            </SortableContext>
        </div>
    );
}


export default function GuildToDo({ auth, guild, tasks, focusTasks = [], resumeTask, stagnantTasks = [], members, enableAi }) {
    // --- Core state ---
    const [viewMode, setViewMode] = useState('board');
    const [localTasks, setLocalTasks] = useState(tasks);
    const [localFocusTasks, setLocalFocusTasks] = useState(focusTasks);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // --- DnD state ---
    const [activeTaskDnd, setActiveTaskDnd] = useState(null);

    // --- Pomodoro state ---
    const [pomodoroTask, setPomodoroTask] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [totalDuration, setTotalDuration] = useState(25 * 60);

    // --- Stagnant modal state ---
    const [isStagnantModalOpen, setIsStagnantModalOpen] = useState(false);

    // --- XP toast state ---
    const [xpToast, setXpToast] = useState(null);
    const [roundClaiming, setRoundClaiming] = useState(false);

    // Sync props to local
    useEffect(() => { setLocalTasks(tasks); }, [tasks]);
    useEffect(() => { setLocalFocusTasks(focusTasks); }, [focusTasks]);

    // --- Focus Cycling Logic ---
    const completedFocusTasks = useMemo(() => localFocusTasks.filter(t => t.is_completed), [localFocusTasks]);
    const activeFocusTasks = useMemo(() => localFocusTasks.filter(t => !t.is_completed), [localFocusTasks]);
    const completedRounds = Math.floor(completedFocusTasks.length / 3);
    const roundComplete = activeFocusTasks.length === 0 && completedFocusTasks.length > 0 && completedFocusTasks.length % 3 === 0;

    // Auto-claim XP when round is complete
    useEffect(() => {
        if (roundComplete && !roundClaiming) {
            setRoundClaiming(true);
            axios.post(route('api.tasks.focus-round-complete'), { guild_id: guild.id })
                .then(res => {
                    if (res.data.xp_awarded > 0) {
                        setXpToast({ xp: res.data.xp_awarded, leveledUp: res.data.leveled_up, newLevel: res.data.new_level });
                        setTimeout(() => setXpToast(null), 4000);
                    }
                })
                .catch(err => console.error('Focus round claim error:', err))
                .finally(() => setRoundClaiming(false));
        }
    }, [roundComplete]);

    // --- Stagnant auto-popup ---
    useEffect(() => {
        if (stagnantTasks && stagnantTasks.length > 0) {
            const hasSeen = sessionStorage.getItem(`guild_stagnant_seen_${guild.id}`);
            if (!hasSeen) {
                setTimeout(() => setIsStagnantModalOpen(true), 1500);
            }
        }
    }, [stagnantTasks, guild.id]);

    const handleDismissStagnant = () => {
        setIsStagnantModalOpen(false);
        sessionStorage.setItem(`guild_stagnant_seen_${guild.id}`, 'true');
    };

    // --- Focus Handler ---
    const handleToggleFocus = async (task) => {
        const isFocused = localFocusTasks.some(ft => ft.id === task.id);

        if (isFocused) {
            setLocalFocusTasks(prev => prev.filter(t => t.id !== task.id));
        } else {
            // Check limit: max 3 UNCOMPLETED
            if (activeFocusTasks.length >= 3) {
                alert("Guild Focus Maksimal 3 tugas aktif! Selesaikan dulu.");
                return;
            }
            setLocalFocusTasks(prev => [...prev, { ...task, focus_date: new Date().toISOString() }]);
        }

        // Optimistic update in main list
        setLocalTasks(prev => prev.map(t => t.id === task.id ? { ...t, focus_date: isFocused ? null : new Date().toISOString() } : t));

        try {
            await axios.patch(route('api.tasks.toggle-focus', task.id));
            router.reload({ only: ['focusTasks', 'tasks'] });
        } catch (error) {
            console.error("Focus toggle error", error);
            router.reload({ only: ['focusTasks', 'tasks'] });
        }
    };

    // --- Pomodoro Handlers ---
    const handleStartFocus = async (task) => {
        const duration = task.estimated_minutes || 25;

        try {
            await axios.post(route('api.pomodoro.start'), {
                task_id: task.id,
                duration_minutes: duration
            });

            setPomodoroTask(task);
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
            router.reload({ only: ['tasks'] });
        } catch (error) {
            console.error("Failed to save session:", error);
        }
    };

    const handleTimerClose = () => {
        if (isRunning) {
            if (confirm('Timer masih berjalan. Berhenti dan simpan progres?')) {
                stopSession(true);
                setPomodoroTask(null);
            }
        } else {
            setPomodoroTask(null);
        }
    };

    // Check for active session on mount
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
                        setPomodoroTask(session.task || { id: session.task_id, title: 'Sesi Fokus' });
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

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Columns Logic
    const columns = useMemo(() => {
        return {
            todo: localTasks.filter(t => t.status === 'todo' && !t.is_completed).sort((a, b) => b.priority === 'Mendesak' ? 1 : -1),
            in_progress: localTasks.filter(t => t.status === 'in_progress' && !t.is_completed),
            done: localTasks.filter(t => t.status === 'done' || t.is_completed),
        };
    }, [localTasks]);

    // Completed Tasks for Inbox
    const completedTasks = useMemo(() => localTasks.filter(t => t.is_completed).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)), [localTasks]);

    // --- DnD Handlers ---
    const handleDragStart = (event) => {
        const { active } = event;
        setActiveTaskDnd(localTasks.find(t => t.id === active.id));
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeTask = localTasks.find(t => t.id === activeId);
        const overTask = localTasks.find(t => t.id === overId);

        if (!activeTask) return;

        const activeContainer = activeTask.status;
        const overContainer = overTask ? overTask.status : (overId.startsWith('col-') ? overId.replace('col-', '') : null);

        if (activeContainer !== overContainer && overContainer) {
            const newTask = { status: overContainer, is_completed: overContainer === 'done' };
            setLocalTasks((prev) => {
                return prev.map(t => {
                    if (t.id === activeId) {
                        return { ...t, ...newTask };
                    }
                    return t;
                });
            });
            // Also update focus tasks for cycling detection
            setLocalFocusTasks(prev => prev.map(t => t.id === activeId ? { ...t, ...newTask } : t));
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over) {
            const activeId = active.id;
            const overId = over.id;

            const activeTask = localTasks.find(t => t.id === activeId);
            const overTask = localTasks.find(t => t.id === overId);

            const activeContainer = activeTask?.status;
            const overContainer = overTask ? overTask.status : (overId.startsWith('col-') ? overId.replace('col-', '') : null);

            if (activeContainer && overContainer && activeContainer !== overContainer) {
                const newStatus = overContainer;
                const isCompleted = newStatus === 'done';

                setLocalTasks(prev => prev.map(t => t.id === activeId ? { ...t, status: newStatus, is_completed: isCompleted } : t));
                // Also update focus tasks for cycling detection
                setLocalFocusTasks(prev => prev.map(t => t.id === activeId ? { ...t, status: newStatus, is_completed: isCompleted } : t));

                axios.put(route('guilds.tasks.update', [guild.id, activeId]), {
                    status: newStatus,
                    is_completed: isCompleted
                }).then(() => router.reload({ only: ['focusTasks', 'tasks'] }));
            }
        }
        setActiveTaskDnd(null);
    };

    const handleDelete = (task) => {
        if (confirm('Delete this task?')) {
            router.delete(route('guilds.tasks.destroy', [guild.id, task.id]), {
                onSuccess: () => {
                    setLocalTasks(prev => prev.filter(t => t.id !== task.id));
                    if (selectedTask?.id === task.id) setSelectedTask(null);
                }
            });
        }
    };

    // Quick Add
    const quickAdd = (e) => {
        e.preventDefault();
        const title = e.target.title.value;
        const assignedTo = e.target.assigned_to.value;
        if (!title) return;

        router.post(route('guilds.tasks.store', guild.id), {
            title: title,
            status: 'todo',
            assigned_to: assignedTo || null
        }, {
            onSuccess: () => {
                setIsCreateOpen(false);
            }
        });
    }

    const handleAssign = (taskId, userId) => {
        axios.put(route('guilds.tasks.update', [guild.id, taskId]), {
            assigned_to: userId
        }).then(() => {
            setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, assigned_to: userId, assignee: members.find(m => m.id == userId) } : t));
            if (selectedTask && selectedTask.id === taskId) {
                setSelectedTask(prev => ({ ...prev, assigned_to: userId, assignee: members.find(m => m.id == userId) }));
            }
        });
    }

    return (
        <AuthenticatedLayout header={null}>
            <Head title={`${guild.name} - Board`} />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 font-sans text-slate-900 dark:text-white min-h-[calc(100vh-80px)] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <span className="text-2xl">{guild.emblem}</span>
                            Mission Board
                        </h1>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg gap-1">
                        <button onClick={() => setViewMode('board')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${viewMode === 'board' ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600 dark:text-teal-400' : 'text-slate-500 hover:text-slate-700'}`}>
                            Board
                        </button>
                        <button onClick={() => setViewMode('inbox')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${viewMode === 'inbox' ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600 dark:text-teal-400' : 'text-slate-500 hover:text-slate-700'}`}>
                            Inbox <span className="ml-1 text-[10px] bg-slate-200 dark:bg-slate-900 px-1.5 py-0.5 rounded-full">{completedTasks.length}</span>
                        </button>
                    </div>
                </div>

                {/* ========== RESUME WIDGET ========== */}
                <AnimatePresence>
                    {resumeTask && !pomodoroTask && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            className="mb-6"
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
                                            Welcome back, {auth.user.name.split(' ')[0]}!
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

                {/* ========== SMART FOCUS 3 SECTION ========== */}
                {viewMode === 'board' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-transparent bg-clip-text">Guild Focus 3</span>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px]">{activeFocusTasks.length}/3</span>
                            {completedRounds > 0 && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                                    🔥 {completedRounds} Round{completedRounds > 1 ? 's' : ''}
                                </span>
                            )}
                        </h3>

                        {/* Round Complete Celebration */}
                        <AnimatePresence>
                            {roundComplete && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="mb-4"
                                >
                                    <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-center">
                                        <div className="text-2xl mb-1">🎉</div>
                                        <h4 className="text-lg font-black text-emerald-700 dark:text-emerald-300">Round {completedRounds} Complete!</h4>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">+50 XP! Pilih 3 misi baru untuk round selanjutnya.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {activeFocusTasks.map(task => (
                                <div key={'focus-' + task.id} className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl opacity-20 blur group-hover:opacity-40 transition duration-500"></div>
                                    <div className="relative">
                                        <TaskCard
                                            task={task}
                                            onToggleFocus={() => handleToggleFocus(task)}
                                            onClick={() => { }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {/* Empty Slots (out of 3 active) */}
                            {[...Array(Math.max(0, 3 - activeFocusTasks.length))].map((_, i) => (
                                <div key={'empty-' + i} className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl h-[100px] flex items-center justify-center text-slate-400 gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-50">Slot Kosong</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ========== BOARD / INBOX VIEW ========== */}
                {viewMode === 'board' ? (
                    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-x-auto pb-4">

                            {/* Todo Column */}
                            <DroppableColumn id="col-todo" title="To Do" tasks={columns.todo} color="border-slate-400">
                                {columns.todo.map(task => (
                                    <SortableTaskItem key={task.id} task={task} onClick={() => setSelectedTask(task)} onDelete={handleDelete} onToggleFocus={handleToggleFocus} />
                                ))}
                                {/* Quick Add Button */}
                                {!isCreateOpen ? (
                                    <button onClick={() => setIsCreateOpen(true)} className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-teal-500 hover:border-teal-300 transition-colors flex items-center justify-center gap-2 text-sm font-bold">
                                        <PlusIcon className="w-4 h-4" /> Add Task
                                    </button>
                                ) : (
                                    <form onSubmit={quickAdd} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg animate-in zoom-in-95 duration-200 space-y-2">
                                        <input name="title" autoFocus placeholder="Task title..." className="w-full border-none p-0 text-sm font-bold focus:ring-0 bg-transparent" />
                                        <select name="assigned_to" className="w-full text-xs border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                            <option value="">Unassigned</option>
                                            {members.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button type="button" onClick={() => setIsCreateOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                                            <button type="submit" className="text-xs bg-teal-500 text-white px-3 py-1 rounded-md font-bold">Add</button>
                                        </div>
                                    </form>
                                )}
                            </DroppableColumn>

                            {/* In Progress Column */}
                            <DroppableColumn id="col-in_progress" title="In Progress" tasks={columns.in_progress} color="border-teal-500">
                                {columns.in_progress.map(task => (
                                    <SortableTaskItem key={task.id} task={task} onClick={() => setSelectedTask(task)} onDelete={handleDelete} onToggleFocus={handleToggleFocus} />
                                ))}
                            </DroppableColumn>

                            {/* Done Column */}
                            <DroppableColumn id="col-done" title="Done" tasks={columns.done} color="border-emerald-500">
                                {columns.done.map(task => (
                                    <SortableTaskItem key={task.id} task={task} onClick={() => setSelectedTask(task)} onDelete={handleDelete} onToggleFocus={handleToggleFocus} />
                                ))}
                            </DroppableColumn>

                        </div>

                        {createPortal(
                            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
                                {activeTaskDnd ? <TaskCard task={activeTaskDnd} isOverlay /> : null}
                            </DragOverlay>,
                            document.body
                        )}
                    </DndContext>
                ) : (
                    // INBOX VIEW (Completed Log)
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex-1 overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Task</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Completed By</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {completedTasks.map(task => (
                                    <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                                            <div className="opacity-50 line-through decoration-slate-400">{task.title}</div>
                                        </td>
                                        <td className="p-4">
                                            {task.completer ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                                                        {task.completer.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">{task.completer.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Unknown</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">
                                            {format(new Date(task.updated_at), 'MMM d, yyyy HH:mm')}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleDelete(task)} className="text-slate-400 hover:text-red-500"><span className="sr-only">Delete</span>&times;</button>
                                        </td>
                                    </tr>
                                ))}
                                {completedTasks.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-slate-400 italic">No completed tasks yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* SlideOver for Task Details */}
                <SlideOver
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    title={selectedTask?.title || 'Details'}
                >
                    {selectedTask && (
                        <div className="space-y-6">
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-bold text-slate-500 uppercase">{selectedTask.status || 'todo'}</span>
                                <span className="px-2 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded text-xs font-bold uppercase">{selectedTask.priority}</span>
                            </div>

                            {/* Start Focus Button */}
                            <button
                                onClick={() => { handleStartFocus(selectedTask); setSelectedTask(null); }}
                                className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <PlayIcon className="w-5 h-5" />
                                Start Focus
                            </button>

                            {/* Assignment Control */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assigned To</label>
                                <select
                                    value={selectedTask.assigned_to || ''}
                                    onChange={(e) => handleAssign(selectedTask.id, e.target.value)}
                                    className="w-full text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50"
                                >
                                    <option value="">Unassigned</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="prose dark:prose-invert">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Description</h4>
                                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap text-sm">{selectedTask.description || 'No description.'}</p>
                            </div>

                            {/* Metadata */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 space-y-1">
                                <p>Created by: {selectedTask.user?.name || 'Unknown'}</p>
                                <p>Created at: {format(new Date(selectedTask.created_at), 'MMM d, yyyy')}</p>
                            </div>
                        </div>
                    )}
                </SlideOver>
            </div>

            {/* ========== STAGNANT TASKS MODAL ========== */}
            <AnimatePresence>
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
                                        Ada {stagnantTasks?.length} misi guild yang "berdebu" (lebih dari 7 hari tidak disentuh).
                                        Yuk rapihkan!
                                    </p>
                                </div>

                                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                    {stagnantTasks?.map(task => (
                                        <div key={task.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{task.title}</h4>
                                                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 font-mono shrink-0 ml-2">
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
                                                        if (confirm('Archive/Delete this guild task?')) {
                                                            router.delete(route('guilds.tasks.destroy', [guild.id, task.id]), {
                                                                onSuccess: () => {
                                                                    router.reload({ only: ['stagnantTasks', 'tasks'] });
                                                                }
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

            {/* ========== POMODORO ISLAND ========== */}
            <AnimatePresence>
                {pomodoroTask && (
                    <PomodoroIsland
                        taskTitle={pomodoroTask.title}
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

            {/* XP Toast */}
            <AnimatePresence>
                {xpToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.8 }}
                        className="fixed bottom-8 right-8 z-[9999] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
                    >
                        <span className="text-3xl">⚡</span>
                        <div>
                            <p className="font-black text-lg">+{xpToast.xp} XP!</p>
                            {xpToast.leveledUp && <p className="text-sm opacity-90">Level Up! 🎉 Level {xpToast.newLevel}</p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
