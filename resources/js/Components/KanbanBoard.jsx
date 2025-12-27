import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from '@/Components/TaskCard';
import { PlusIcon } from '@heroicons/react/24/solid';
import { router } from '@inertiajs/react';
import axios from 'axios';

function DroppableColumn({ id, children, color, title, count, onAddTask, isSubmitting }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const [isAdding, setIsAdding] = useState(false);
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: id
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskData.title.trim() || isSubmitting) return;

        onAddTask(taskData, () => {
            // Success callback - reset form
            setTaskData({
                title: '',
                description: '',
                start_date: new Date().toISOString().split('T')[0],
                due_date: '',
                status: id
            });
            setIsAdding(false);
        });
    };

    const handleCancel = () => {
        if (isSubmitting) return; // Prevent cancel during submission
        setTaskData({
            title: '',
            description: '',
            start_date: new Date().toISOString().split('T')[0],
            due_date: '',
            status: id
        });
        setIsAdding(false);
    };

    const inputStyle = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed";
    const labelStyle = "block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="flex flex-col">
            {/* Column Header */}
            <div className={`bg-white dark:bg-slate-800 rounded-xl p-4 mb-4 border-l-4 ${color} shadow-sm`}>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                    <span>{title}</span>
                    <span className="text-sm bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                        {count}
                    </span>
                </h3>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className={`flex-1 bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4 min-h-[400px] space-y-3 transition-colors ${isOver ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-300 border-dashed' : ''
                    }`}
            >
                {/* Add Task Button/Form */}
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        disabled={isSubmitting}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-500 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all group disabled:opacity-50"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Add Task</span>
                    </button>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg p-4 border-2 border-emerald-500 shadow-lg space-y-3 max-h-[80vh] overflow-y-auto">
                        {/* Title */}
                        <div>
                            <label className={labelStyle}>Task Title *</label>
                            <input
                                type="text"
                                autoFocus
                                required
                                disabled={isSubmitting}
                                value={taskData.title}
                                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                                placeholder="Enter task title..."
                                className={inputStyle}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className={labelStyle}>Description (Optional)</label>
                            <textarea
                                disabled={isSubmitting}
                                value={taskData.description}
                                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                                placeholder="Add details..."
                                rows="2"
                                className={inputStyle + " resize-none"}
                            />
                        </div>

                        {/* Dates & Estimate */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className={labelStyle}>Start Date</label>
                                <input
                                    type="date"
                                    disabled={isSubmitting}
                                    value={taskData.start_date}
                                    onChange={(e) => setTaskData({ ...taskData, start_date: e.target.value })}
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>Due Date</label>
                                <input
                                    type="date"
                                    disabled={isSubmitting}
                                    value={taskData.due_date}
                                    onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                                    className={inputStyle}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className={labelStyle}>Estimated Time (Minutes)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        disabled={isSubmitting}
                                        value={taskData.estimated_minutes || ''}
                                        onChange={(e) => setTaskData({ ...taskData, estimated_minutes: e.target.value })}
                                        placeholder="e.g. 60"
                                        className={inputStyle}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 text-xs">
                                        mins
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subtasks */}
                        <div>
                            <label className={labelStyle}>Subtasks</label>
                            <div className="space-y-2 mb-2">
                                {(taskData.subtasks || []).map((subtask, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={subtask.title}
                                            onChange={(e) => {
                                                const newSubtasks = [...(taskData.subtasks || [])];
                                                newSubtasks[index].title = e.target.value;
                                                setTaskData({ ...taskData, subtasks: newSubtasks });
                                            }}
                                            placeholder="Subtask title..."
                                            className={`${inputStyle} text-xs py-1`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newSubtasks = [...(taskData.subtasks || [])];
                                                newSubtasks.splice(index, 1);
                                                setTaskData({ ...taskData, subtasks: newSubtasks });
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setTaskData({ ...taskData, subtasks: [...(taskData.subtasks || []), { title: '' }] })}
                                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                                <PlusIcon className="w-3 h-3" /> Add Subtask
                            </button>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={!taskData.title.trim() || isSubmitting}
                                className="flex-1 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white text-sm font-medium transition inline-flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    'Add Task'
                                )}
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleCancel}
                                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {children}
            </div>
        </div>
    );
}

export default function KanbanBoard({ initialTasks }) {
    const [tasks, setTasks] = useState(initialTasks);
    const [activeId, setActiveId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const columns = [
        { id: 'todo', title: '📋 To Do', color: 'border-blue-500' },
        { id: 'in_progress', title: '⚡ In Progress', color: 'border-yellow-500' },
        { id: 'done', title: '✅ Done', color: 'border-emerald-500' },
    ];

    const handleAddTask = async (taskData, onSuccessCallback) => {
        setIsSubmitting(true);

        // Optimistically add task to UI
        const tempId = `temp-${Date.now()}`;
        const optimisticTask = {
            id: tempId,
            ...taskData,
            created_at: new Date().toISOString(),
            priority: 'Sedang',
            is_completed: taskData.status === 'done'
        };

        setTasks(prev => ({
            ...prev,
            [taskData.status]: [optimisticTask, ...(prev[taskData.status] || [])]
        }));

        try {
            const response = await axios.post(route('api.tasks.store'), taskData);
            const newTask = response.data.task;

            // Update optimistic task with real data
            setTasks(prev => {
                const updatedList = (prev[taskData.status] || []).map(t =>
                    t.id === tempId ? newTask : t
                );
                return { ...prev, [taskData.status]: updatedList };
            });

            if (onSuccessCallback) onSuccessCallback();

        } catch (error) {
            console.error('Failed to create task:', error);
            // Revert optimistic update
            setTasks(prev => ({
                ...prev,
                [taskData.status]: (prev[taskData.status] || []).filter(t => t.id !== tempId)
            }));
            alert('Failed to create task. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeTask = findTask(active.id);
        const overColumn = over.id;

        if (activeTask && columns.find(col => col.id === overColumn)) {
            // Skip if dropping in same column
            if (activeTask.status === overColumn) {
                setActiveId(null);
                return;
            }

            // Optimistically update UI first
            setTasks(prev => {
                const newTasks = { ...prev };
                // Remove from old column
                Object.keys(newTasks).forEach(key => {
                    newTasks[key] = newTasks[key].filter(t => t.id !== activeTask.id);
                });
                // Add to new column
                newTasks[overColumn] = [...(newTasks[overColumn] || []), { ...activeTask, status: overColumn }];
                return newTasks;
            });

            // Update task status in backend
            axios.patch(route('api.tasks.update', activeTask.id), {
                status: overColumn
            }).catch(error => {
                console.error('Failed to update task status:', error);
                // Revert on error
                setTasks(initialTasks);
            });
        }

        setActiveId(null);
    };

    const findTask = (id) => {
        for (const column of Object.values(tasks)) {
            const task = column.find(t => t.id === id);
            if (task) return task;
        }
        return null;
    };

    const activeTask = activeId ? findTask(activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {columns.map((column) => (
                    <DroppableColumn
                        key={column.id}
                        id={column.id}
                        color={column.color}
                        title={column.title}
                        count={tasks[column.id]?.length || 0}
                        onAddTask={handleAddTask}
                        isSubmitting={isSubmitting}
                    >
                        <SortableContext
                            items={tasks[column.id]?.map(t => t.id) || []}
                            strategy={verticalListSortingStrategy}
                        >
                            {tasks[column.id]?.length > 0 ? (
                                tasks[column.id].map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-600 text-sm">
                                    No tasks yet
                                </div>
                            )}
                        </SortableContext>
                    </DroppableColumn>
                ))}
            </div>

            <DragOverlay>
                {activeTask ? (
                    <div className="rotate-3 scale-105">
                        <TaskCard task={activeTask} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
