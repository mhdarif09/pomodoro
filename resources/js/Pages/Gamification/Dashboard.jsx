
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { TrophyIcon, FireIcon, StarIcon } from '@heroicons/react/24/outline';

export default function GamificationDashboard({ auth, stats, achievements }) {
    return (
        <AuthenticatedLayout header={<h2 className="font-extrabold text-2xl text-slate-900 dark:text-white">Gamification Center</h2>}>
            <Head title="Achievements" />
            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">

                {/* Level Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-orange-500 to-red-500 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <TrophyIcon className="w-64 h-64 rotate-12" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/30 shadow-xl">
                            <span className="text-5xl font-black">Lvl {stats?.level || 1}</span>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-3xl font-black mb-2">Novice Pomodoroer</h3>
                            <div className="w-full bg-black/20 rounded-full h-4 mb-2 overflow-hidden">
                                <div className="bg-yellow-400 h-full rounded-full w-[45%]" />
                            </div>
                            <p className="text-orange-100 font-bold">450 / 1000 XP to next level</p>
                        </div>
                    </div>
                </motion.div>

                {/* Badges Grid */}
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <TrophyIcon className="w-6 h-6 text-yellow-500" />
                        Pencapaian Terbaru
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-square bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center p-4 hover:shadow-lg transition-all group grayscale hover:grayscale-0 cursor-pointer">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-3 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/20 flex items-center justify-center transition-colors">
                                    <StarIcon className="w-8 h-8 text-slate-400 group-hover:text-yellow-500" />
                                </div>
                                <span className="font-bold text-slate-500 dark:text-slate-400 text-sm group-hover:text-slate-900 dark:group-hover:text-white">Badge {i}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Challenges Section */}
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <FireIcon className="w-6 h-6 text-orange-500" />
                        Tantangan Harian
                    </h3>
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl mb-3">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold">
                                    🔥
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-900 dark:text-white">Fokus 4 Jam</h5>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Progress: 2.5/4 Jam</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold bg-orange-100 text-orange-600 px-3 py-1 rounded-full">+50 XP</span>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
