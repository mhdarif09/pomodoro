// File: resources/js/Components/TodoList/TodoListCard.jsx (FINAL FIXED VERSION)

import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/solid';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

export default function TodoListCard({ 
    tasks = { data: [], links: [], total: 0 }, // Memberi nilai default struktur pagination
    listTitle = 'Daftar Tugas' 
}) {
    const [view, setView] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const scrollContainerRef = useRef(null);

    const taskItems = tasks.data;

    const handleAddNew = () => setView('adding');
    const handleEdit = (task) => { setView('editing'); setEditingTask(task); };
    const handleCancel = () => { setView(null); setEditingTask(null); };
    const handleDelete = (taskId) => router.delete(route('tasks.destroy', taskId), { preserveScroll: true });

    const showForm = view === 'adding' || view === 'editing';

    useEffect(() => {
        if (!scrollContainerRef.current) return;
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && tasks.next_page_url) {
                    router.get(tasks.next_page_url, {}, {
                        preserveState: true,
                        preserveScroll: true,
                        only: ['tasks'],
                    });
                }
            },
            { root: scrollContainerRef.current, threshold: 1.0 }
        );
        const lastTaskElement = scrollContainerRef.current.querySelector('.task-item:last-of-type');
        if (lastTaskElement) {
            observer.observe(lastTaskElement);
        }
        return () => {
            if (lastTaskElement) {
                observer.unobserve(lastTaskElement);
            }
        };
    }, [tasks, scrollContainerRef]);

    return (
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-lg border border-slate-200 dark:border-slate-700 shadow-lg sm:rounded-2xl flex flex-col h-full min-h-[500px]">
            <div className="p-4 sm:p-6 flex justify-between items-center flex-shrink-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center text-xl">
                    {listTitle}
                    <span className="ml-2 text-base font-medium text-slate-400">({tasks.total})</span>
                </h3>
                {!showForm && (
                     <button onClick={handleAddNew} className="flex-shrink-0 flex items-center gap-1 text-sm font-semibold bg-teal-100 dark:bg-teal-800/50 text-teal-600 dark:text-teal-300 px-3 py-1.5 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-800 transition">
                        <PlusIcon className="w-4 h-4"/> Tambah Tugas
                    </button>
                )}
            </div>
            
            <AnimatePresence>
                {showForm && ( <TaskForm key={editingTask ? editingTask.id : 'add-form'} existingTask={editingTask} onCancel={handleCancel} /> )}
            </AnimatePresence>
            
            <div ref={scrollContainerRef} className="flex-grow overflow-y-auto border-t border-slate-200 dark:border-slate-700">
                {taskItems.length > 0 ? (
                    <div>
                        <AnimatePresence>
                           {taskItems.map(task => ( 
                               <div key={task.id} className="task-item">
                                   <TaskItem task={task} onEditClick={handleEdit} onDeleteClick={handleDelete}/>
                               </div>
                            ))}
                        </AnimatePresence>
                        
                        {tasks.next_page_url && (
                            <div className="p-4 text-center text-sm text-slate-500">
                                Memuat lebih banyak...
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-10 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 h-full">
                        <p className="text-4xl mb-4">🎉</p>
                        <p className="font-semibold text-lg">Hore, Kosong!</p>
                        <p className="mt-1 text-sm">Tidak ada tugas dalam kategori ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
}