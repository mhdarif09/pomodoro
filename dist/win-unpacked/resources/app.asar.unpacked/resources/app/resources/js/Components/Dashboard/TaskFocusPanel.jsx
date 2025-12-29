import { useState, useEffect, useMemo, useRef } from 'react';
import { router, Link } from '@inertiajs/react';
import {
    CheckCircleIcon, TrashIcon, PlayIcon, ClockIcon,
    ChevronDownIcon, ChevronUpIcon, ChevronRightIcon,
    ListBulletIcon, CheckIcon, LockClosedIcon, PlusIcon, XMarkIcon, LinkIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { debounce } from 'lodash';
import { createPortal } from 'react-dom';

// DnD Kit
import {
    DndContext, useSensor, useSensors, PointerSensor, DragOverlay,
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

// 1. Task Card (Pure UI)
function TaskCard({ task, expandedTaskId, onToggleExpand, onToggleComplete, onStartFocus, onToggleSubtask, onAddSubtask, onUpdateTask, onDeleteTask, auth, t, isOverlay, listeners, attributes, style, setNodeRef }) {
    // Quick Notes Debouncer
    const updateNotes = useMemo(() => debounce((val) => onUpdateTask(task.id, { notes: val }), 1000), [task.id]);
    // Auto URL Debouncer
    const updateUrl = useMemo(() => debounce((val) => onUpdateTask(task.id, { auto_open_url: val }), 1000), [task.id]);

    const formatDuration = (minutes) => {
        if (!minutes) return '25m';
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}
            className={`group relative apple-glass rounded-[2rem] border-none shadow-sm transition-all duration-300 overflow-hidden bg-white/40 dark:bg-white/5 ${isOverlay ? 'shadow-2xl scale-105 cursor-grabbing z-50' : 'hover:shadow-lg'}`}
        >
            {/* Header / Draggable Area */}
            <div
                onClick={() => onToggleExpand(task.id)}
                {...listeners} // Apply drag listeners here
                className="p-5 cursor-pointer touch-none select-none relative"
            >
                <div className="flex items-start gap-4">
                    {/* Toggle Button */}
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onToggleComplete(task); }}
                        className={`mt-1 flex-shrink-0 w-6 h-6 rounded-xl border-2 transition-all flex items-center justify-center active:scale-90
                            ${task.is_completed
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-teal-500 bg-slate-50/50 dark:bg-slate-900/50'
                            }`}
                    >
                        {task.is_completed && <CheckIcon className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold tracking-tight transition-all truncate ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                            {task.title}
                        </h4>

                        <div className="flex items-center gap-3 mt-2">
                            {task.subtasks?.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <div className="flex -space-x-1">
                                        {[...Array(Math.min(5, task.subtasks.length))].map((_, i) => (
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
                {expandedTaskId === task.id && !isOverlay && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-900/20 cursor-auto"
                        onPointerDown={(e) => e.stopPropagation()} // Stop Drag from content
                    >
                        <div className="p-5 space-y-5">
                            {/* Focus Button */}
                            {!task.is_completed && (
                                <button
                                    onClick={() => onStartFocus(task)}
                                    className="apple-button w-full bg-slate-900 dark:bg-teal-500 text-white flex items-center justify-between p-4 shadow-xl active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-3">
                                        <PlayIcon className="w-5 h-5 fill-current" />
                                        <span className="text-[12px] font-extrabold tracking-tight">{t('start_focus') || 'Start Focus'}</span>
                                    </div>
                                    <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black tracking-tight border border-white/10">
                                        {formatDuration(task.estimated_minutes || 25)}
                                    </div>
                                </button>
                            )}

                            {/* Subtasks */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('subtasks') || 'Sub-Tasks'}</h5>
                                    <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full">
                                        {task.subtasks?.filter(s => s.is_completed).length || 0}/{task.subtasks?.length || 0}
                                    </span>
                                </div>
                                {task.subtasks?.map(sub => (
                                    <div key={sub.id} className="flex items-center gap-3 p-1 hover:bg-white/5 rounded-xl">
                                        <button
                                            onClick={() => onToggleSubtask(task.id, sub.id, sub.is_completed)}
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${sub.is_completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}
                                        >
                                            {sub.is_completed && <CheckIcon className="w-3.5 h-3.5" />}
                                        </button>
                                        <span className={`text-[13px] font-semibold flex-1 ${sub.is_completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{sub.title}</span>
                                    </div>
                                ))}
                                {!task.is_completed && (
                                    <form onSubmit={(e) => { e.preventDefault(); onAddSubtask(task.id, e.target.subtask.value); e.target.subtask.value = ''; }} className="relative mt-3">
                                        <input name="subtask" type="text" placeholder={t('placeholder_add_subtask') || "Add step..."} className="w-full bg-white/5 dark:bg-black/20 border-none rounded-2xl py-2.5 pl-4 pr-10 text-xs font-semibold focus:ring-2 focus:ring-teal-500/10" />
                                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-teal-500"><PlusIcon className="w-4 h-4" /></button>
                                    </form>
                                )}
                            </div>

                            {/* Quick Notes */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('quick_notes') || 'Quick Notes'}</h5>
                                    {!auth?.user?.premium_features?.quick_notes && <LockClosedIcon className="w-2.5 h-2.5 text-amber-500" />}
                                </div>
                                <div className="relative">
                                    <textarea
                                        defaultValue={task.notes}
                                        disabled={!auth?.user?.premium_features?.quick_notes}
                                        onChange={(e) => updateNotes(e.target.value)}
                                        placeholder={auth?.user?.premium_features?.quick_notes ? (t('placeholder_notes') || "Write notes here...") : "Premium Feature"}
                                        className="w-full bg-white/5 dark:bg-black/20 border-none rounded-[1.5rem] p-4 text-[13px] text-slate-600 dark:text-slate-300 min-h-[100px] focus:ring-2 focus:ring-teal-500/10 disabled:opacity-60"
                                    />
                                    {!auth?.user?.premium_features?.quick_notes && (
                                        <Link href={route('subscribe.index')} className="absolute inset-0 flex items-center justify-center bg-slate-900/5 rounded-2xl group-hover:bg-slate-900/10 transition-all opacity-0 hover:opacity-100">
                                            <span className="bg-white/90 px-3 py-1 rounded-full text-[9px] font-black uppercase text-amber-600 shadow-xl">{t('upgrade_premium') || 'Upgrade'}</span>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button onClick={() => onDeleteTask(task)} className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <TrashIcon className="w-3.5 h-3.5" /> {t('delete') || 'Delete'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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
export default function TaskFocusPanel({ tasks, activeFilter, onStartFocus, auth }) {
    const { t } = useLanguage();
    // Local State for Optimistic Updates
    const [localTasks, setLocalTasks] = useState(tasks.data || []);
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const [addingToColumn, setAddingToColumn] = useState(null);
    const [activeId, setActiveId] = useState(null); // Dragging ID

    useEffect(() => { setLocalTasks(tasks.data || []); }, [tasks.data]);

    const activeTask = useMemo(() => localTasks.find(t => t.id === activeId), [activeId, localTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }) // Prevent accidental drag
    );

    // Helpers
    const getColumnTasks = (status) => localTasks.filter(t => {
        if (status === 'todo') return !t.is_completed && (!t.status || t.status === 'todo');
        if (status === 'in_progress') return !t.is_completed && t.status === 'in_progress';
        if (status === 'done') return t.is_completed || t.status === 'done';
        return false;
    });

    // Handlers
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
        }
    };

    const handleDragEnd = (e) => {
        const { active, over } = e;
        setActiveId(null);
        if (!over) return;

        const task = localTasks.find(t => t.id === active.id);
        // Sync API
        axios.patch(route('api.tasks.update', active.id), {
            status: task.status,
            is_completed: task.status === 'done'
        }).catch(() => router.reload({ only: ['tasks'] }));
    };

    const handleToggleComplete = (task) => {
        const newStatus = !task.is_completed;
        const newTask = { ...task, is_completed: newStatus, status: newStatus ? 'done' : 'todo' };
        setLocalTasks(prev => prev.map(t => t.id === task.id ? newTask : t));
        axios.patch(route('api.tasks.toggle-complete', task.id)).catch(() => router.reload({ only: ['tasks'] }));
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
        // Optimistic add hard without ID, so just reload for subtasks usually, or wait.
        // We'll show loading state in UI if needed, or just standard post.
        axios.post(route('api.subtasks.store', taskId), { title }).then((res) => {
            // Append real subtask from response
            setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), res.data.subtask] } : t));
        });
    };

    const handleDeleteTask = (task) => {
        if (!confirm('Delete this task?')) return;
        setLocalTasks(prev => prev.filter(t => t.id !== task.id));
        axios.delete(route('api.tasks.destroy', task.id));
    };

    const columns = [
        { id: 'todo-col', title: t('kanban_todo') || 'To Do', status: 'todo', color: 'bg-slate-300' },
        { id: 'doing-col', title: t('kanban_inprogress') || 'In Progress', status: 'in_progress', color: 'bg-teal-500' },
        { id: 'done-col', title: t('kanban_done') || 'Done', status: 'done', color: 'bg-emerald-500' }
    ];

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <div className="space-y-6 select-none">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {columns.map(col => {
                        const colTasks = getColumnTasks(col.status);
                        return (
                            <div key={col.id} className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 px-4 py-2">
                                    <div className={`w-3 h-3 rounded-full ${col.id === 'doing-col' ? 'bg-teal-500 animate-pulse' : col.color}`} />
                                    <h3 className="text-[13px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-tight">{col.title}</h3>
                                    <span className="ml-auto text-[11px] font-bold apple-glass border-none px-2.5 py-1 rounded-full text-slate-500">{colTasks.length}</span>
                                    {col.status === 'todo' && (
                                        <button onClick={() => setAddingToColumn('todo')} className="p-1 text-slate-400 hover:text-teal-500"><PlusIcon className="w-5 h-5" /></button>
                                    )}
                                </div>

                                <DroppableContainer id={col.id} items={colTasks.map(t => t.id)}>
                                    <div className="space-y-4 min-h-[100px]">
                                        {colTasks.map(task => (
                                            <SortableTaskItem
                                                key={task.id} task={task} expandedTaskId={expandedTaskId}
                                                onToggleExpand={(id) => setExpandedTaskId(expandedTaskId === id ? null : id)}
                                                onToggleComplete={handleToggleComplete} onStartFocus={onStartFocus}
                                                onToggleSubtask={handleToggleSubtask} onAddSubtask={handleAddSubtask}
                                                onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask}
                                                auth={auth} t={t}
                                            />
                                        ))}
                                        {addingToColumn === col.status && (
                                            <div className="apple-glass p-5 rounded-[2rem] border-teal-500/30">
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
                                                        <button type="submit" className="text-xs bg-teal-500 text-white px-3 py-1 rounded-lg">Add</button>
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
            {createPortal(
                <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
                    {activeTask ? <TaskCard task={activeTask} isOverlay t={t} expandedTaskId={null} /> : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
