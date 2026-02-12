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
                {task.user && (
                    <div className="flex items-center gap-1" title={`Created by ${task.user.name}`}>
                        <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-[9px]">
                            {task.user.name.charAt(0)}
                        </div>
                    </div>
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
    const [tasks, setTasks] = useState(initialTasks);
    const [activeId, setActiveId] = useState(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const [selectedTask, setSelectedTask] = useState(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Columns
    const columns = {
        todo: tasks.filter(t => !t.is_completed && t.status !== 'in_progress'),
        in_progress: tasks.filter(t => !t.is_completed && t.status === 'in_progress'),
        done: tasks.filter(t => t.is_completed || t.status === 'done')
    };

    const handleDragStart = (event) => setActiveId(event.active.id);

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeTask = tasks.find(t => t.id === active.id);
        const overId = over.id;

        // Find which column we are over
        let newStatus = activeTask.status;

        // If hovering over a container directly
        if (overId === 'col-todo') newStatus = 'todo';
        else if (overId === 'col-in_progress') newStatus = 'in_progress';
        else if (overId === 'col-done') newStatus = 'done';
        else {
            // Hovering over another task
            const overTask = tasks.find(t => t.id === overId);
            if (overTask) {
                newStatus = overTask.is_completed ? 'done' : (overTask.status || 'todo');
            }
        }

        // Optimistic UI update if status changed locally
        if (newStatus !== activeTask.status && !(newStatus === 'done' && activeTask.is_completed)) {
            setTasks(prev => prev.map(t => {
                if (t.id === active.id) {
                    return {
                        ...t,
                        status: newStatus === 'done' ? 'done' : newStatus, // simplified logic
                        is_completed: newStatus === 'done'
                    };
                }
                return t;
            }));
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const task = tasks.find(t => t.id === active.id);

        // Determine final status based on where dropped
        let finalStatus = task.status; // Default to current
        if (over.id === 'col-todo') finalStatus = 'todo';
        else if (over.id === 'col-in_progress') finalStatus = 'in_progress';
        else if (over.id === 'col-done') finalStatus = 'done';
        else {
            const overTask = tasks.find(t => t.id === over.id);
            if (overTask) finalStatus = overTask.is_completed ? 'done' : (overTask.status || 'todo');
        }

        const isCompleted = finalStatus === 'done';

        // Final State Update
        setTasks(prev => prev.map(t => t.id === active.id ? { ...t, status: finalStatus, is_completed: isCompleted } : t));

        // API Call
        axios.put(route('guilds.tasks.update', [guild.id, active.id]), {
            status: finalStatus,
            is_completed: isCompleted
        }).catch(err => {
            console.error(err);
            router.reload({ only: ['tasks'] }); // Revert on fail
        });
    };

    const handleDelete = (task) => {
        if (confirm('Delete task?')) {
            setTasks(prev => prev.filter(t => t.id !== task.id));
            axios.delete(route('guilds.tasks.destroy', [guild.id, task.id]));
        }
    }

    const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

    // Quick Add Mock Implementation
    const quickAdd = (e) => {
        e.preventDefault();
        const title = e.target.title.value;
        if (!title) return;

        axios.post(route('guilds.tasks.store', guild.id), {
            title: title, status: 'todo'
        }).then(res => {
            // Reload to get full task object usually, but let's try to simulate or reload
            router.reload({ only: ['tasks'] });
            setIsCreateOpen(false);
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
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button className="p-2 bg-white dark:bg-slate-700 shadow-sm rounded-md"><Squares2X2Icon className="w-5 h-5" /></button>
                        <button className="p-2 text-slate-400"><Bars3Icon className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Kanban Board */}
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
                                <form onSubmit={quickAdd} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg animate-in zoom-in-95 duration-200">
                                    <input name="title" autoFocus placeholder="Task title..." className="w-full border-none p-0 text-sm font-bold focus:ring-0 bg-transparent mb-2" />
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setIsCreateOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                                        <button type="submit" className="text-xs bg-teal-500 text-white px-3 py-1 rounded-md">Add</button>
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

                {/* SlideOver for Task Details */}
                <SlideOver
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    title={selectedTask?.title || 'Details'}
                >
                    {selectedTask && (
                        <div className="space-y-6">
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-500 uppercase">{selectedTask.status || 'todo'}</span>
                                <span className="px-2 py-1 bg-teal-50 text-teal-600 rounded text-xs font-bold uppercase">{selectedTask.priority}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{selectedTask.description || 'No description.'}</p>

                            {/* Simplistic View for now, can enhance with NotionEditor later if needed */}
                        </div>
                    )}
                </SlideOver>
            </div>
        </AuthenticatedLayout>
    );
}
