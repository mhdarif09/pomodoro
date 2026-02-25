import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarIcon, ClockIcon, CheckCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export default function TaskCard({ task, onEdit }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const priorityColors = {
        Rendah: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
        Sedang: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
        Tinggi: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300',
    };

    const handleToggleComplete = (e) => {
        e.stopPropagation();
        router.post(route('api.tasks.toggle-complete', task.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (confirm('Yakin ingin menghapus task ini?')) {
            setIsDeleting(true);
            router.delete(route('api.tasks.destroy', task.id), {
                preserveScroll: true,
                onFinish: () => setIsDeleting(false),
            });
        }
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit(task);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border-2 transition-all duration-200 select-none
                ${isDragging
                    ? 'border-emerald-400 shadow-2xl scale-105 rotate-2 z-50'
                    : 'border-gray-200 dark:border-slate-700 hover:border-emerald-300 hover:shadow-lg'
                }
                ${isDeleting ? 'opacity-50' : ''}
                group relative`}
        >
            {/* Drag Handle - Separate from card content */}
            <div
                {...attributes}
                {...listeners}
                className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            >
                <div className="flex flex-col gap-1 bg-gray-200 dark:bg-slate-700 rounded p-1">
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                </div>
            </div>

            {/* Complete Checkbox */}
            <div className="flex items-start gap-3 mb-3">
                <button
                    onClick={handleToggleComplete}
                    className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
                >
                    {task.is_completed ? (
                        <CheckCircleSolidIcon className="w-5 h-5 text-emerald-500" />
                    ) : (
                        <CheckCircleIcon className="w-5 h-5 text-gray-400 dark:text-gray-600 hover:text-emerald-500" />
                    )}
                </button>

                <div className="flex-1 min-w-0">
                    {/* Priority Badge & Tags */}
                    <div className="mb-2 flex flex-wrap gap-1">
                        {task.priority && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priorityColors[task.priority] || priorityColors.Sedang}`}>
                                {task.priority === 'Tinggi' ? '🔴' : task.priority === 'Sedang' ? '🟡' : '🔵'} {task.priority}
                            </span>
                        )}
                        {task.tags && task.tags.slice(0, 3).map(tag => (
                            <span key={tag.id} className={`text-[10px] px-2 py-0.5 rounded-full border border-transparent ${tag.color === '#3B82F6' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                tag.color === '#10B981' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                    tag.color === '#F59E0B' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                }`}>
                                {tag.name}
                            </span>
                        ))}
                        {task.tags && task.tags.length > 3 && (
                            <span className="text-[10px] px-1 py-0.5 text-slate-400">+{task.tags.length - 3}</span>
                        )}
                    </div>

                    {/* Title */}
                    <h4 className={`font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 ${task.is_completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                        {task.title}
                    </h4>

                    {/* Description */}
                    {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {task.description}
                        </p>
                    )}

                    {/* Subtasks and Estimates Info */}
                    {(task.subtasks?.length > 0 || task.estimated_minutes) && (
                        <div className="flex items-center gap-3 mb-2 text-xs text-gray-500 dark:text-gray-400">
                            {task.subtasks?.length > 0 && (
                                <div className="flex items-center gap-1" title="Subtasks">
                                    <span className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                        {task.subtasks.filter(t => t.is_completed).length}/{task.subtasks.length}
                                    </span>
                                    <span>Subtasks</span>
                                </div>
                            )}
                            {task.estimated_minutes && (
                                <div className="flex items-center gap-1" title="Estimated Time">
                                    <ClockIcon className="w-3 h-3" />
                                    <span>{task.estimated_minutes}m</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-slate-700">
                        {task.due_date && (
                            <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                <span>{new Date(task.due_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-auto">
                            <button
                                onClick={handleEdit}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition"
                                title="Edit"
                            >
                                <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                                title="Delete"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
