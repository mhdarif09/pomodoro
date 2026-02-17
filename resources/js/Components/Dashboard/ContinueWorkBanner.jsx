import { motion } from 'framer-motion';
import { PlayIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function ContinueWorkBanner({ task, onDismiss, onContinue }) {
    if (!task) return null;

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="group relative overflow-hidden bg-white dark:bg-[#202020] border border-teal-100 dark:border-teal-900/30 rounded-2xl p-6 mb-6 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <PlayIcon className="w-32 h-32 text-teal-500" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 border border-teal-100 dark:border-teal-800/30">
                        <PlayIcon className="w-7 h-7 ml-1" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                🔥 Resume Streak
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Last active recently
                            </span>
                        </div>
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">
                            {task.title}
                        </h4>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => onContinue(task)}
                        className="flex-1 md:flex-none bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <PlayIcon className="w-5 h-5" />
                        Lanjut Fokus
                    </button>
                    <button
                        onClick={onDismiss}
                        className="p-3 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Skip for now"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
