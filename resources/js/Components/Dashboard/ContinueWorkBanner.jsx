import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';

export default function ContinueWorkBanner({ task, onDismiss }) {
    if (!task) return null;

    const handleContinue = () => {
        router.get(route('dashboard'), {
            continueTask: task.id
        });
    };

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-[2rem] p-6 mb-6"
        >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl shrink-0">
                        ▶️
                    </div>
                    <div>
                        <p className="text-sm font-medium opacity-90">Lanjut dari kemarin?</p>
                        <h4 className="font-black text-lg">{task.title}</h4>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleContinue}
                        className="bg-white text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-50 transition-colors"
                    >
                        Continue 🚀
                    </button>
                    <button
                        onClick={onDismiss}
                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-bold transition-colors"
                    >
                        Skip
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
