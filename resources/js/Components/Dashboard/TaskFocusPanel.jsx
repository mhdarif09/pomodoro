import { useState, useEffect, useMemo, useRef } from 'react';
import { router, Link } from '@inertiajs/react';
import {
    CheckCircleIcon, TrashIcon, PlayIcon, ClockIcon,
    ChevronDownIcon, ChevronUpIcon, ChevronRightIcon,
    ListBulletIcon, CheckIcon, LockClosedIcon, PlusIcon, XMarkIcon, LinkIcon,
    EllipsisHorizontalIcon, ExclamationCircleIcon, CalendarIcon, TagIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { debounce } from 'lodash';
import { createPortal } from 'react-dom';

// DnD Kit
import {
    DndContext, useSensor, useSensors, PointerSensor, TouchSensor, DragOverlay,
    defaultDropAnimationSideEffects, closestCorners
} from '@dnd-kit/core';
import {
    SortableContext, useSortable, verticalListSortingStrategy, arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

// Context
import { useLanguage } from '../../Contexts/LanguageContext';

// --- Components ---

// Import NotionEditor
import NotionEditor from '../TodoList/NotionEditor';

// Import SlideOver
import SlideOver from '../SlideOver';

// Import GamificationPopup
import GamificationPopup from '../GamificationPopup';

// 1. Task Card (Pure UI)
function TaskCard({ task, onToggleComplete, onStartFocus, onToggleSubtask, onAddSubtask, onUpdateTask, onDeleteTask, onToggleFocus, auth, t, isOverlay, listeners, attributes, style, setNodeRef, onClick, ...props }) {
    // Tags Display Only
    return (
        <div ref={setNodeRef} style={style} {...attributes}
            className={`group relative apple-glass rounded-[2rem] border-none shadow-sm transition-all duration-300 overflow-hidden bg-white/40 dark:bg-slate-800/40 ${isOverlay ? 'shadow-2xl scale-105 cursor-grabbing z-50' : 'hover:shadow-lg'}`}
        >
            {/* Header / Draggable Area */}
            <div
                onClick={onClick}
                {...listeners} // Apply drag listeners here
                className="p-5 cursor-pointer select-none relative"
            >
                <div className="flex items-start gap-4">
                    {/* Toggle Button */}
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onToggleComplete(task); }}
                        className={`mt-1 flex-shrink-0 w-6 h-6 rounded-xl border-2 transition-all flex items-center justify-center active:scale-90
                            ${task.is_completed
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-900/50'
                            }`}
                    >
                        {task.is_completed && <CheckIcon className="w-4 h-4 stroke-[3]" />}
                    </button>

                    {/* Focus Star Toggle */}
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onToggleFocus(task); }}
                        className={`mt-1 flex-shrink-0 w-6 h-6 rounded-xl transition-all flex items-center justify-center active:scale-90
                             ${props.isFocused
                                ? 'text-amber-400 hover:text-amber-500'
                                : 'text-slate-300 hover:text-amber-400 opacity-0 group-hover:opacity-100'
                            }`}
                        title="Toggle Focus"
                    >
                        <svg className={`w-5 h-5 ${props.isFocused ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.613l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.613l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-bold tracking-tight transition-all truncate ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                                {task.title}
                            </h4>
                            {/* Tags Display */}
                            {task.tags && task.tags.slice(0, 3).map(tag => (
                                <span key={tag.id} className={`text-[9px] px-2 py-0.5 rounded-full border border-transparent ${tag.color === '#3B82F6' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                    tag.color === '#10B981' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                        tag.color === '#F59E0B' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                            'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                    }`}>
                                    {tag.name}
                                </span>
                            ))}
                            {/* Priority Badge */}
                            {task.priority && (
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${task.priority === 'Tinggi' || task.priority === 'Mendesak' ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' :
                                    task.priority === 'Sedang' ? 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50' :
                                        'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50'
                                    }`}>
                                    {task.priority}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                            {task.subtasks?.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <div className="flex -space-x-1">
                                        {[...Array(Math.min(5, task.subtasks.length))].map((_, i) => (
                                            <div key={i} className={`w-1.5 h-1.5 rounded-full border border-white dark:border-slate-800 ${i < task.subtasks.filter(s => s.is_completed).length ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">
                                        {task.subtasks.filter(s => s.is_completed).length}/{task.subtasks.length}
                                    </span>
                                </div>
                            )}
                            {task.estimated_minutes && (
                                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest">
                                    <ClockIcon className="w-3 h-3" />
                                    {task.estimated_minutes}M
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 2. Task Details Content (Rendered inside SlideOver)
function TaskDetailContent({ task, onStartFocus, onToggleSubtask, onAddSubtask, onUpdateTask, onDeleteTask, t, auth }) {
    // Quick Notes Debouncer
    const updateNotes = useMemo(() => debounce((val) => onUpdateTask(task.id, { notes: val }), 1000), [task.id]);

    return (
        <div className="space-y-8">
            {/* Properties Row (Notion Style) */}
            <div className="grid grid-cols-[120px_1fr] gap-y-3 text-[13px] mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">

                {/* Priority */}
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    {t('priority') || 'Priority'}
                </div>
                <div className="flex items-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${task.priority === 'Tinggi' || task.priority === 'Mendesak' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' :
                        task.priority === 'Sedang' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                        }`}>
                        {task.priority || 'Normal'}
                    </span>
                </div>

                {/* Due Date */}
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {t('due_date') || 'Due Date'}
                </div>
                <div className="text-slate-700 dark:text-slate-200 font-medium">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                </div>

                {/* Tags */}
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <TagIcon className="w-4 h-4" />
                    {t('tags') || 'Tags'}
                </div>
                <div className="flex flex-wrap gap-1">
                    {task.tags && task.tags.length > 0 ? task.tags.map(tag => (
                        <span key={tag.id} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 font-medium">
                            {tag.name}
                        </span>
                    )) : <span className="text-slate-400 italic">Empty</span>}
                </div>
            </div>

            {/* Focus Button */}
            {!task.is_completed && (
                <button
                    onClick={() => onStartFocus(task)}
                    className="apple-button w-full bg-slate-900 dark:bg-emerald-500 text-white flex items-center justify-between p-4 shadow-xl active:scale-[0.98]"
                >
                    <div className="flex items-center gap-3">
                        <PlayIcon className="w-5 h-5 fill-current" />
                        <span className="text-[12px] font-extrabold tracking-tight">{t('start_focus') || 'Start Focus'}</span>
                    </div>
                    <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black tracking-tight border border-white/10">
                        {task.estimated_minutes || 25}m
                    </div>
                </button>
            )}

            {/* Subtasks */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('subtasks') || 'Sub-Tasks'}</h5>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                        {task.subtasks?.filter(s => s.is_completed).length || 0}/{task.subtasks?.length || 0}
                    </span>
                </div>
                {task.subtasks?.map(sub => (
                    <div key={sub.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors group">
                        <button
                            onClick={() => onToggleSubtask(task.id, sub.id, sub.is_completed)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${sub.is_completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 group-hover:border-emerald-500'}`}
                        >
                            {sub.is_completed && <CheckIcon className="w-3.5 h-3.5" />}
                        </button>
                        <span className={`text-[14px] font-medium flex-1 ${sub.is_completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{sub.title}</span>
                    </div>
                ))}
                {!task.is_completed && (
                    <div className="mt-3 space-y-2">
                        <form onSubmit={(e) => { e.preventDefault(); onAddSubtask(task.id, e.target.subtask.value); e.target.subtask.value = ''; }} className="relative">
                            <input name="subtask" type="text" placeholder={t('placeholder_add_subtask') || "Add step..."} className="w-full bg-slate-50 dark:bg-black/20 border-none rounded-2xl py-3 pl-4 pr-10 text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 placeholder-slate-400" />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white dark:bg-slate-700 rounded-lg text-emerald-500 shadow-sm"><PlusIcon className="w-4 h-4" /></button>
                        </form>
                        {/* AI Suggest - Premium Only */}
                        {auth.user?.is_premium && (
                            <button
                                onClick={async () => {
                                    if (confirm('AI akan menyarankan langkah-langkah untuk tugas ini. Lanjutkan?')) {
                                        try {
                                            const res = await axios.post(route('api.tasks.suggest-breakdown', task.id));
                                            if (res.data.subtasks) {
                                                res.data.subtasks.forEach(title => onAddSubtask(task.id, title));
                                            }
                                        } catch (err) {
                                            alert('Gagal mendapatkan saran AI.');
                                        }
                                    }
                                }}
                                className="w-full py-2.5 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-xl transition-colors"
                            >
                                <span className="text-lg">✨</span>
                                {t('ai_suggest_subtasks') || 'Saran AI'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Notes */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Notes</h5>
                </div>
                <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-50 dark:bg-black/20 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all border border-slate-100 dark:border-white/5">
                    <NotionEditor
                        content={task.notes}
                        onChange={(html) => updateNotes(html)}
                        enableAi={auth.user?.is_premium}
                    />
                </div>
            </div>

            {/* Actions Footer */}
            <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-400 font-medium">
                    Created {new Date(task.created_at).toLocaleDateString()}
                </div>
                <button onClick={() => onDeleteTask(task)} className="text-xs text-red-500 hover:text-red-600 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                    <TrashIcon className="w-4 h-4" /> {t('delete') || 'Delete Task'}
                </button>
            </div>
        </div>
    );
}

// 2. Sortable Item Wrapper
function SortableTaskItem({ task, ...props }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { task } });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };

    return (
        <TaskCard
            task={task}
            {...props}
            listeners={listeners}
            attributes={attributes}
            style={style}
            setNodeRef={setNodeRef}
            onClick={() => props.onSelectTask(task)}
        />
    );
}

// 3. Droppable Container
function DroppableContainer({ id, items, children }) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
            <div ref={setNodeRef} className="h-full min-h-[150px]">{children}</div>
        </SortableContext>
    );
}

// 4. Main Component
export default function TaskFocusPanel({ tasks, focusTasks = [], activeFilter, onStartFocus, auth, onTaskComplete, suggestedFocusTasks = [], hideHero = false, hideList = false }) {
    const { t } = useLanguage();
    // Local State for Optimistic Updates
    const resolveTasks = (t) => Array.isArray(t) ? t : (t?.data || []);
    const [localTasks, setLocalTasks] = useState(resolveTasks(tasks));
    const [localFocusTasks, setLocalFocusTasks] = useState(focusTasks || []);
    const [selectedTask, setSelectedTask] = useState(null); // For SlideOver
    const [processingId, setProcessingId] = useState(null);
    const [addingToColumn, setAddingToColumn] = useState(null);
    const [activeId, setActiveId] = useState(null); // Dragging ID
    const [xpToast, setXpToast] = useState(null); // XP celebration toast
    const [roundClaiming, setRoundClaiming] = useState(false);
    const [showGamification, setShowGamification] = useState(false);
    const [gamificationData, setGamificationData] = useState(null);

    useEffect(() => { setLocalTasks(resolveTasks(tasks)); }, [tasks]);
    useEffect(() => { setLocalFocusTasks(focusTasks || []); }, [focusTasks]);

    // --- Focus Cycling Logic ---
    const completedFocusTasks = useMemo(() => localFocusTasks.filter(t => t.is_completed), [localFocusTasks]);
    const activeFocusTasks = useMemo(() => localFocusTasks.filter(t => !t.is_completed), [localFocusTasks]);
    const completedRounds = Math.floor(completedFocusTasks.length / 3);
    const roundComplete = activeFocusTasks.length === 0 && completedFocusTasks.length > 0 && completedFocusTasks.length % 3 === 0;

    // Auto-claim XP when round is complete
    useEffect(() => {
        if (roundComplete && !roundClaiming) {
            setRoundClaiming(true);
            axios.post(route('api.tasks.focus-round-complete'))
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

    const activeTask = useMemo(() => localTasks.find(t => t.id === activeId), [activeId, localTasks]);
    // Get latest version of selected task from localTasks
    const currentSelectedTask = useMemo(() => localTasks.find(t => t.id === selectedTask?.id), [selectedTask, localTasks]);


    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // Desktop
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }) // Mobile: Hold to drag, Tap to open
    );

    // Helpers
    const getColumnTasks = (status) => localTasks.filter(t => {
        if (status === 'todo') return !t.is_completed && (!t.status || t.status === 'todo');
        if (status === 'in_progress') return !t.is_completed && t.status === 'in_progress';
        if (status === 'done') return t.is_completed || t.status === 'done';
        return false;
    });

    const isTaskFocused = (taskId) => localFocusTasks.some(ft => ft.id === taskId);

    // Handlers
    const handleToggleFocus = async (task) => {
        const isFocused = isTaskFocused(task.id);

        if (isFocused) {
            // Remove from focus
            setLocalFocusTasks(prev => prev.filter(t => t.id !== task.id));
        } else {
            // Add to focus (check limit: max 3 UNCOMPLETED)
            if (activeFocusTasks.length >= 3) {
                alert("Maksimal 3 tugas fokus aktif! Selesaikan dulu yang lain.");
                return;
            }
            setLocalFocusTasks(prev => [...prev, task]);
        }

        try {
            await axios.patch(route('api.tasks.toggle-focus', task.id));
            router.reload({ only: ['focusTasks'] });
        } catch (error) {
            console.error("Gagal update focus:", error);
            router.reload({ only: ['focusTasks'] });
        }
    };

    const handleDragStart = (e) => setActiveId(e.active.id);

    const handleDragOver = (e) => {
        const { active, over } = e;
        if (!over) return;
        const activeT = localTasks.find(t => t.id === active.id);
        const overId = over.id;

        // Find Target Status
        let newStatus = activeT.status;
        if (overId === 'todo-col') newStatus = 'todo';
        else if (overId === 'doing-col') newStatus = 'in_progress';
        else if (overId === 'done-col') newStatus = 'done';
        else {
            const overTask = localTasks.find(t => t.id === overId);
            if (overTask) newStatus = overTask.status;
        }

        if (newStatus !== activeT.status) {
            setLocalTasks(prev => prev.map(t => t.id === active.id ? { ...t, status: newStatus, is_completed: newStatus === 'done' } : t));
            // Also update focus tasks for cycling detection
            setLocalFocusTasks(prev => prev.map(t => t.id === active.id ? { ...t, status: newStatus, is_completed: newStatus === 'done' } : t));
        }
    };

    const handleDragEnd = (e) => {
        const { active, over } = e;
        setActiveId(null);
        if (!over) return;

        const task = localTasks.find(t => t.id === active.id);
        // Sync API + reload focusTasks for cycling
        axios.patch(route('api.tasks.update', active.id), {
            status: task.status,
            is_completed: task.status === 'done'
        }).then(() => router.reload({ only: ['tasks', 'focusTasks'] }))
            .catch(() => router.reload({ only: ['tasks', 'focusTasks'] }));
    };

    const handleToggleComplete = (task) => {
        const newStatus = !task.is_completed;
        const newTask = { ...task, is_completed: newStatus, status: newStatus ? 'done' : 'todo' };
        setLocalTasks(prev => prev.map(t => t.id === task.id ? newTask : t));
        // Also update localFocusTasks so cycling detects completed focused tasks
        setLocalFocusTasks(prev => prev.map(t => t.id === task.id ? newTask : t));

        if (newStatus && onTaskComplete) {
            onTaskComplete();
        }

        axios.patch(route('api.tasks.toggle-complete', task.id))
            .then(res => {
                if (res.data.gamification) {
                    setGamificationData({
                        xpAwarded: res.data.gamification.xp_awarded || 0,
                        newStreak: res.data.gamification.current_streak || 0,
                        levelUp: res.data.gamification.level_up || false,
                        newLevel: res.data.gamification.new_level || 0,
                        achievements: res.data.gamification.achievements || [],
                        taskTitle: task.title
                    });
                    setShowGamification(true);
                }
            })
            .then(() => router.reload({ only: ['tasks', 'focusTasks'] }))
            .catch(() => router.reload({ only: ['tasks', 'focusTasks'] }));
    };

    const handleUpdateTask = (id, updates) => {
        setLocalTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        axios.patch(route('api.tasks.update', id), updates);
    };

    const handleToggleSubtask = (taskId, subId, currentStatus) => {
        setLocalTasks(prev => prev.map(t => {
            if (t.id !== taskId) return t;
            return { ...t, subtasks: t.subtasks.map(s => s.id === subId ? { ...s, is_completed: !currentStatus } : s) };
        }));
        axios.patch(route('api.subtasks.update', subId), { is_completed: !currentStatus });
    };

    const handleAddSubtask = (taskId, title) => {
        if (!title.trim()) return;
        axios.post(route('api.subtasks.store', taskId), { title }).then((res) => {
            setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), res.data.subtask] } : t));
        });
    };

    const handleDeleteTask = (task) => {
        if (!confirm('Delete this task?')) return;
        setLocalTasks(prev => prev.filter(t => t.id !== task.id));
        setLocalFocusTasks(prev => prev.filter(t => t.id !== task.id)); // Also remove from focus
        setSelectedTask(null);
        axios.delete(route('api.tasks.destroy', task.id));
    };

    // --- Smart Focus Suggestion Handlers ---
    const handleAcceptSuggestion = (task) => {
        // Optimistically add to focus
        if (activeFocusTasks.length >= 3) {
            alert("Maksimal 3 tugas fokus aktif!");
            return;
        }
        setLocalFocusTasks(prev => [...prev, task]);
        // API call handled by toggle-focus which now records 'accepted'
        axios.patch(route('api.tasks.toggle-focus', task.id))
            .then(() => router.reload({ only: ['focusTasks', 'suggestedFocusTasks'] }))
            .catch(() => router.reload({ only: ['focusTasks', 'suggestedFocusTasks'] }));
    };

    const handleDismissSuggestion = (task) => {
        // Optimistically remove from suggestions
        // (We can't easily modify props, but we can trigger a reload)
        axios.post(route('api.tasks.dismiss-suggestion', task.id))
            .then(() => router.reload({ only: ['suggestedFocusTasks'] }));
    };

    const columns = [
        { id: 'todo-col', title: t('kanban_todo') || 'To Do', status: 'todo', color: 'bg-slate-300' },
        { id: 'doing-col', title: t('kanban_inprogress') || 'In Progress', status: 'in_progress', color: 'bg-emerald-500' },
        { id: 'done-col', title: t('kanban_done') || 'Done', status: 'done', color: 'bg-emerald-500' }
    ];

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <div className="space-y-8 select-none">

                {/* --- SMART FOCUS 3 SECTION --- */}
                {activeFilter === 'all' && !hideHero && (
                    <div id="smart-focus-section" className="mb-8 pt-4">


                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="bg-gradient-to-br from-indigo-500 to-purple-500 text-transparent bg-clip-text">Today's Focus</span>
                                    <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-700/50">
                                        {activeFocusTasks.length}/3
                                    </span>
                                </h3>
                            </div>
                        </div>

                        {/* Round Complete Celebration */}
                        <AnimatePresence>
                            {roundComplete && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="mb-4"
                                >
                                    <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/10 dark:from-emerald-900/30 dark:to-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-center">
                                        <div className="text-2xl mb-1">🎉</div>
                                        <h4 className="text-lg font-black text-emerald-700 dark:text-emerald-300">Round {completedRounds} Complete!</h4>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">+50 XP! Pilih 3 tugas baru untuk round selanjutnya.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Render ACTIVE (uncompleted) Focused Tasks */}
                            {activeFocusTasks.map(task => (
                                <div key={'focus-' + task.id} className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.2rem] opacity-30 blur group-hover:opacity-60 transition duration-500"></div>
                                    <div className="relative h-full">
                                        <TaskCard
                                            task={task}
                                            isFocused={true}
                                            onToggleFocus={() => handleToggleFocus(task)}
                                            onSelectTask={setSelectedTask}
                                            onToggleComplete={handleToggleComplete} onStartFocus={onStartFocus}
                                            onToggleSubtask={handleToggleSubtask} onAddSubtask={handleAddSubtask}
                                            onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask}
                                            auth={auth} t={t}
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Empty Slots (out of 3 active) */}
                            {[...Array(Math.max(0, 3 - activeFocusTasks.length))].map((_, i) => (
                                <div key={'empty-' + i} className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] h-[150px] flex flex-col items-center justify-center text-slate-400 gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors relative group">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PlusIcon className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider">Slot Fokus Kosong</span>
                                </div>
                            ))}
                        </div>

                        {/* --- AI SUGGESTIONS SECTION (Only if slots available and suggestions exist) --- */}
                        {activeFocusTasks.length < 3 && suggestedFocusTasks && suggestedFocusTasks.length > 0 && (
                            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <span className="text-lg">🤖</span>
                                    <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide">
                                        Saran Untukmu
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {suggestedFocusTasks.map((task, idx) => (
                                        <div key={task.id} className="bg-white dark:bg-slate-800/80 rounded-[1.5rem] p-4 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                            {/* Score Badge */}
                                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl z-10">
                                                {task.focus_score}% Match
                                            </div>

                                            <div className="mb-3">
                                                <h5 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 text-sm">{task.title}</h5>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {task.focus_reasons?.map((r, i) => (
                                                        <span key={i} className="text-[10px] inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                                                            <span>{r.icon}</span> {r.text}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => handleAcceptSuggestion(task)}
                                                    className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <PlusIcon className="w-3 h-3" /> Fokus
                                                </button>
                                                <button
                                                    onClick={() => handleDismissSuggestion(task)}
                                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 text-xs font-bold rounded-xl transition-colors"
                                                    title="Lewati saran ini"
                                                >
                                                    <XMarkIcon className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}
                {/* ----------------------------- */}

                {/* ----------------------------- */}

                {!hideList && (
                    <div className="space-y-4">
                        {/* Task List Header & Controls */}
                        <div className="flex items-center justify-between pb-2">
                            <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Kanban Board</h3>


                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {columns.map(col => {
                                const colTasks = getColumnTasks(col.status);
                                return (
                                    <div key={col.id} className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3 px-4 py-2">
                                            <div className={`w-3 h-3 rounded-full ${col.id === 'doing-col' ? 'bg-emerald-500 animate-pulse' : col.color}`} />
                                            <h3 className="text-[13px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-tight">{col.title}</h3>
                                            <span className="ml-auto text-[11px] font-bold apple-glass border-none px-2.5 py-1 rounded-full text-slate-500">{colTasks.length}</span>
                                            {col.status === 'todo' && (
                                                <button onClick={() => setAddingToColumn('todo')} className="p-1 text-slate-400 hover:text-emerald-500"><PlusIcon className="w-5 h-5" /></button>
                                            )}
                                        </div>

                                        <DroppableContainer id={col.id} items={colTasks.map(t => t.id)}>
                                            <div className="space-y-4 min-h-[100px] sm:overflow-y-auto sm:max-h-[calc(100vh-300px)]">
                                                {colTasks.map(task => (
                                                    <SortableTaskItem
                                                        key={task.id} task={task}
                                                        isFocused={isTaskFocused(task.id)}
                                                        onToggleFocus={() => handleToggleFocus(task)}
                                                        onSelectTask={setSelectedTask} // Set selected task for SlideOver
                                                        onToggleComplete={handleToggleComplete} onStartFocus={onStartFocus}
                                                        onToggleSubtask={handleToggleSubtask} onAddSubtask={handleAddSubtask}
                                                        onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask}
                                                        auth={auth} t={t}
                                                    />
                                                ))}
                                                {addingToColumn === col.status && (
                                                    <div className="apple-glass p-5 rounded-[2rem] border-emerald-500/30">
                                                        <form onSubmit={(e) => {
                                                            e.preventDefault(); const title = e.target.title.value;
                                                            if (!title.trim()) return;
                                                            setProcessingId('quick-add');
                                                            axios.post(route('api.tasks.store'), { title, status: col.status }).then((res) => {
                                                                setLocalTasks(prev => [res.data.task, ...prev]); setAddingToColumn(null);
                                                            }).finally(() => setProcessingId(null));
                                                        }} className="space-y-3">
                                                            <input autoFocus name="title" placeholder={t('placeholder_quick_add') || "New Task..."} className="w-full bg-transparent border-none p-0 font-bold focus:ring-0" />
                                                            <div className="flex justify-end gap-2">
                                                                <button type="button" onClick={() => setAddingToColumn(null)} className="text-xs">Cancel</button>
                                                                <button type="submit" className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-lg">Add</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                )}
                                            </div>
                                        </DroppableContainer>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Task Details SlideOver */}
            <SlideOver
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                title={selectedTask?.title || 'Task Details'}
            >
                {currentSelectedTask ? (
                    <TaskDetailContent
                        task={currentSelectedTask}
                        onStartFocus={onStartFocus}
                        onToggleSubtask={handleToggleSubtask}
                        onAddSubtask={handleAddSubtask}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                        t={t}
                        auth={auth}
                    />
                ) : (
                    <div className="p-4 text-center text-slate-500">Task details not found.</div>
                )}
            </SlideOver>

            {createPortal(
                <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
                    {activeTask ? <TaskCard task={activeTask} isOverlay t={t} expandedTaskId={null} /> : null}
                </DragOverlay>,
                document.body
            )}

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
        </DndContext>
    );
}
