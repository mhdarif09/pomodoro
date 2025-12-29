import { useState } from 'react';
import { motion } from 'framer-motion';
import { PencilIcon as PencilSolidIcon } from '@heroicons/react/24/solid';

export default function DailyGoalModal({ onSave, isProcessing, onClose }) {
    const [goal, setGoal] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(goal);
    };
    
    // Ini contoh jika Anda ingin menutup modal dengan klik di luar area
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ ease: "easeOut", duration: 0.2 }}
                className="relative bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 w-full max-w-lg"
            >
                <div className="flex items-center mb-4">
                    <PencilSolidIcon className="h-6 w-6 text-teal-500 mr-3"/>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Apa Goal Kamu Hari Ini?</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6">Tentukan satu fokus utama untuk hari ini agar lebih produktif.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Contoh: Menyelesaikan laporan kuartal ini"
                        className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                        autoFocus
                    />
                    <div className="mt-6 flex justify-end">
                         <button
                            type="submit"
                            disabled={!goal.trim() || isProcessing}
                            className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-8 rounded-lg shadow-lg shadow-teal-500/20 transform hover:scale-105 transition"
                        >
                            {isProcessing ? 'Menyimpan...' : 'Simpan Goal'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}