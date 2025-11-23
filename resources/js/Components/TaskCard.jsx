import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function TaskCard({ task }) {
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
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    const priorityColors = {
        low: 'bg-blue-100 text-blue-700 border-blue-200',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        high: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all duration-200 select-none touch-none
                ${isDragging
                    ? 'border-emerald-400 shadow-2xl scale-105 rotate-2 z-50'
                    : 'border-gray-200 hover:border-emerald-300 hover:shadow-lg'
                }
                cursor-grab active:cursor-grabbing group`}
        >
            {/* Drag Handle Indicator */}
            <div className="flex items-center justify-center mb-2 opacity-40 group-hover:opacity-70 transition-opacity">
                <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                </div>
            </div>

            {/* Priority Badge */}
            {task.priority && (
                <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${priorityColors[task.priority] || priorityColors.low}`}>
                        {task.priority === 'high' ? '🔴 High' : task.priority === 'medium' ? '🟡 Medium' : '🔵 Low'}
                    </span>
                </div>
            )}

            {/* Title */}
            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {task.title}
            </h4>

            {/* Description */}
            {task.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                {task.due_date && (
                    <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                )}
                {task.created_at && (
                    <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
