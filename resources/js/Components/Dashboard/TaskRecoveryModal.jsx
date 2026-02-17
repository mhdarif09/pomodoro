import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function TaskRecoveryModal({ plan, onClose }) {
    const handleApplyRecovery = () => {
        router.post(route('api.productivity.apply-recovery'), {}, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 max-w-md w-full"
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔄</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                        Task Recovery
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        Kamu punya {plan.total_tasks} pending tasks. Yuk cleanup!
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🗑️</span>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Archive</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Old low-priority</p>
                            </div>
                        </div>
                        <span className="font-black text-orange-600 dark:text-orange-400">{plan.to_archive}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📅</span>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Reschedule</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Move to next week</p>
                            </div>
                        </div>
                        <span className="font-black text-blue-600 dark:text-blue-400">{plan.to_reschedule}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">✨</span>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Keep</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">High priority & urgent</p>
                            </div>
                        </div>
                        <span className="font-black text-green-600 dark:text-green-400">{plan.to_keep}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApplyRecovery}
                        className="flex-1 px-4 py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all"
                    >
                        Apply Recovery
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
