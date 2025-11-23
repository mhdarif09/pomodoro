import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from '@/Components/TaskCard';
import axios from 'axios';

function DroppableColumn({ id, children, color, title, count }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div className="flex flex-col">
            {/* Column Header */}
            <div className={`bg-white rounded-xl p-4 mb-4 border-l-4 ${color} shadow-sm`}>
                <h3 className="font-semibold text-gray-900 flex items-center justify-between">
                    <span>{title}</span>
                    <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {count}
                    </span>
                </h3>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className={`flex-1 bg-gray-50 rounded-xl p-4 min-h-[400px] space-y-3 transition-colors ${isOver ? 'bg-emerald-50 border-2 border-emerald-300 border-dashed' : ''
                    }`}
            >
                {children}
            </div>
        </div>
    );
}

export default function KanbanBoard({ initialTasks }) {
    const [tasks, setTasks] = useState(initialTasks);
    const [activeId, setActiveId] = useState(null);

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
            axios.patch(route('kanban.update-status', activeTask.id), {
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
                                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
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
