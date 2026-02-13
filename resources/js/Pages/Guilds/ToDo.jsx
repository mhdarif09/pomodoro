import { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    PlusIcon, EllipsisHorizontalIcon, CalendarIcon, UserCircleIcon, FlagIcon,
    Bars3Icon, Squares2X2Icon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { format } from 'date-fns';
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

// --- Task Card Component ---
function TaskCard({ task, isOverlay, listeners, attributes, style, setNodeRef, onClick, onDelete }) {
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}
            onClick={onClick}
            className={`group relative bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${isOverlay ? 'shadow-2xl scale-105 z-50 rotate-3' : ''}`}>

            <div className="flex justify-between items-start mb-2">
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${task.priority === 'Tinggi' || task.priority === 'Mendesak' ? 'bg-red-100 text-red-600' :
                    task.priority === 'Sedang' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                    {task.priority || 'Normal'}
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


export default function GuildToDo({ auth, guild, tasks: initialTasks, members, enableAi }) {
    const [viewMode, setViewMode] = useState('board'); // 'board' or 'inbox'

    // Inbox Data (Completed Tasks)
    const completedTasks = useMemo(() => tasks.filter(t => t.is_completed).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)), [tasks]);

    // Quick Add Mock Implementation
    const quickAdd = (e) => {
        e.preventDefault();
        const title = e.target.title.value;
        const assignedTo = e.target.assigned_to.value;
        if (!title) return;

        axios.post(route('guilds.tasks.store', guild.id), {
            title: title,
            status: 'todo',
            assigned_to: assignedTo || null
        }).then(res => {
            router.reload({ only: ['tasks'] });
            setIsCreateOpen(false);
        });
    }

    const handleAssign = (taskId, userId) => {
        axios.put(route('guilds.tasks.update', [guild.id, taskId]), {
            assigned_to: userId
        }).then(() => {
            router.reload({ only: ['tasks'] });
            // Update local state for immediate feedback
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assigned_to: userId, assignee: members.find(m => m.id == userId) } : t));
            if (selectedTask && selectedTask.id === taskId) {
                setSelectedTask(prev => ({ ...prev, assigned_to: userId, assignee: members.find(m => m.id == userId) }));
            }
        });
    }

    return (
        <AuthenticatedLayout header={null}>
            <Head title={`${guild.name} - Board`} />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 font-sans text-slate-900 dark:text-white h-[calc(100vh-80px)] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
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

                {viewMode === 'board' ? (
                    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-x-auto pb-4">

                            {/* Todo Column */}
                            <DroppableColumn id="col-todo" title="To Do" tasks={columns.todo} color="border-slate-400">
                                {columns.todo.map(task => (
                                    <SortableTaskItem key={task.id} task={task} onClick={() => setSelectedTask(task)} onDelete={handleDelete} />
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
                                    <SortableTaskItem key={task.id} task={task} onClick={() => setSelectedTask(task)} onDelete={handleDelete} />
                                ))}
                            </DroppableColumn>

                            {/* Done Column */}
                            <DroppableColumn id="col-done" title="Done" tasks={columns.done} color="border-emerald-500">
                                {columns.done.map(task => (
                                    <SortableTaskItem key={task.id} task={task} onClick={() => setSelectedTask(task)} onDelete={handleDelete} />
                                ))}
                            </DroppableColumn>

                        </div>

                        {createPortal(
                            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
                                {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
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
        </AuthenticatedLayout>
    );
}
