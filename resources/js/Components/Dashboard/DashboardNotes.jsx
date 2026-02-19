import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PencilSquareIcon, XMarkIcon,
    ArrowsPointingOutIcon, ArrowsPointingInIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import NotionEditor from '@/Components/TodoList/NotionEditor';

export default function DashboardNotes({ auth }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [content, setContent] = useState('');
    const [lastSaved, setLastSaved] = useState(null);

    // Load from local storage on mount
    useEffect(() => {
        const savedNotes = localStorage.getItem('dashboard_quick_notes');
        if (savedNotes) {
            setContent(savedNotes);
        }
    }, []);

    // Save to local storage on change (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (content) {
                localStorage.setItem('dashboard_quick_notes', content);
                setLastSaved(new Date());
            }
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [content]);

    const clearNotes = () => {
        if (confirm('Hapus semua catatan?')) {
            setContent('');
            localStorage.removeItem('dashboard_quick_notes');
        }
    };

    return (
        <>
            {/* Widget Button / Mini View */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-24 z-40 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-4 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 group transition-all"
                >
                    <PencilSquareIcon className="w-6 h-6 group-hover:text-teal-500 transition-colors" />
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Catatan Cepat
                    </span>
                </motion.button>
            )}

            {/* Main Note Interface */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop for Expanded Mode */}
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsExpanded(false)}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                            />
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                width: isExpanded ? '800px' : '380px',
                                height: isExpanded ? '80vh' : '500px',
                                bottom: isExpanded ? '10vh' : '24px',
                                right: isExpanded ? '50%' : '96px',
                                x: isExpanded ? '50%' : '0%'
                            }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={`fixed z-50 bg-white dark:bg-[#1e1e20] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden ${isExpanded ? 'max-w-[95vw]' : ''}`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 cursor-grab active:cursor-grabbing">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-teal-100 dark:bg-teal-500/20 rounded-md">
                                        <PencilSquareIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">Catatan Cepat</span>
                                    {lastSaved && (
                                        <span className="text-[10px] text-slate-400 ml-2 animate-pulse">
                                            Tersimpan {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={clearNotes}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Hapus Semua"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                        title={isExpanded ? "Kecilkan" : "Perbesar"}
                                    >
                                        {isExpanded ? <ArrowsPointingInIcon className="w-4 h-4" /> : <ArrowsPointingOutIcon className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Editor Area */}
                            <div className="flex-1 overflow-hidden bg-white dark:bg-[#1e1e20] flex flex-col">
                                <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
                                    <NotionEditor
                                        content={content}
                                        onChange={setContent}
                                        menuFixed={true}
                                        enableAi={auth.user.is_premium} // Only premium users get AI
                                        editable={true}
                                    />
                                </div>
                                {!auth.user.is_premium && (
                                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-xs text-center text-slate-500 border-t border-slate-100 dark:border-slate-800">
                                        💡 Upgrade ke Premium untuk menggunakan AI Writer.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>


        </>
    );
}
