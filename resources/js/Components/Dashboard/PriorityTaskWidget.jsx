import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';

export default function PriorityTaskWidget({ tasks }) {
    if (!tasks || tasks.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700">
                <h3 className="font-black text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    🎯 Top Prioritas Hari Ini
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">
                    Belum ada task. Silakan buat task baru!
                </p>
            </div>
        );
    }

    const handleStartTask = (taskId) => {
        router.get(route('dashboard'), {
            startTask: taskId
        });
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700">
            <h3 className="font-black text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                🎯 Top 3 Prioritas Hari Ini
            </h3>

            <div className="space-y-3">
                {tasks.map((task, index) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-2xl hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-black flex items-center justify-center shrink-0">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 dark:text-white truncate">
                                    {task.title}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                                    {task.reasoning}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <button
                                        onClick={() => handleStartTask(task.id)}
                                        className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-bold hover:bg-orange-600 transition-colors"
                                    >
                                        Mulai Sekarang →
                                    </button>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Score: {task.priority_score}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
