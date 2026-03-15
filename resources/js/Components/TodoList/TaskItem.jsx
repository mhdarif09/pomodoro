// File: resources/js/Components/TodoList/TaskItem.jsx (Final - With Priority Color Bar)

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilIcon, TrashIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/solid';
import { CalendarDaysIcon as CalendarOutline } from '@heroicons/react/24/outline';
import { router } from '@inertiajs/react';
import axios from 'axios';

export default function TaskItem({ task, onEditClick, onDeleteClick }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // --- KODE BARU: Mendefinisikan warna border untuk setiap prioritas ---
    const priorityBorderStyles = {
        'Rendah': 'border-l-sky-500',
        'Sedang': 'border-l-yellow-500',
        'Tinggi': 'border-l-orange-500',
        'Mendesak': 'border-l-rose-500',
    };
    // -----------------------------------------------------------------

    const handleToggleComplete = (e) => {
        e.stopPropagation();
        axios.patch(route('api.tasks.toggle-complete', task.id))
            .then(res => {
                // Gamification handled globally by PomodoroContext -> AuthenticatedLayout
                // We just reload Inertia props so that parent component receives the updated task list
                router.reload({ preserveScroll: true });
            })
            .catch(err => console.error('Failed to toggle task:', err));
    };

    const handleDelete = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
            onDeleteClick(task.id);
        }
    };

    const baseUrl = window.location.origin;

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: task.is_completed ? 0.5 : 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
            // --- KODE DIMODIFIKASI: Menambahkan kelas untuk border berwarna ---
            className={`
                flex flex-col text-sm bg-white dark:bg-slate-800 
                border-b border-slate-200 dark:border-slate-700
                border-l-4 transition-colors duration-300
                ${priorityBorderStyles[task.priority] || 'border-l-transparent'}
            `}
        // ----------------------------------------------------------------
        >
            <div className="p-4 flex items-center gap-4">
                <div
                    onClick={handleToggleComplete}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all duration-200 ${task.is_completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-slate-300 dark:border-slate-600 hover:border-green-400'
                        }`}
                >
                    {task.is_completed && <CheckIcon className="w-4 h-4 text-white" />}
                </div>

                <div className="flex-grow cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-2 mb-1">
                        <p className={`font-medium text-slate-800 dark:text-slate-100 transition-colors ${task.is_completed ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                            {task.title}
                        </p>
                        {task.tags && task.tags.map(tag => (
                            <span key={tag.id} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                // Simple mapping for predefined colors, fallback for others
                                tag.color === '#3B82F6' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                    tag.color === '#10B981' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                        tag.color === '#F59E0B' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                            'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                }`}>
                                {tag.name}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                        <CalendarOutline className="w-3 h-3 mr-1.5" />
                        Tenggat: {task.due_date ? new Date(task.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </p>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                    <button onClick={() => onEditClick(task)} className="p-1 text-slate-400 hover:text-blue-500 transition"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={handleDelete} className="p-1 text-slate-400 hover:text-rose-500 transition"><TrashIcon className="w-4 h-4" /></button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 text-slate-400 hover:text-slate-600 transition">
                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 pl-14 text-slate-600 dark:text-slate-300 text-xs space-y-2 overflow-hidden"
                    >
                        {task.description && <p className='whitespace-pre-wrap mb-2'>{task.description}</p>}

                        {task.notes && (
                            <div className="prose dark:prose-invert prose-sm max-w-none bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md border border-slate-200 dark:border-slate-700">
                                <div className="font-semibold text-xs text-slate-500 mb-1 uppercase tracking-wider">Catatan</div>
                                <div dangerouslySetInnerHTML={{ __html: task.notes }} />
                            </div>
                        )}

                        {task.document_path && (
                            <a href={`${baseUrl}/storage/${task.document_path}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-2">
                                Lihat Dokumen Terlampir
                            </a>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>

        </>
    );
}