// File: resources/js/Pages/Learning/Index.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { AcademicCapIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion'; // <--- INI YANG KURANG TADI

export default function Index({ auth }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="font-black text-3xl text-slate-900 dark:text-white tracking-tight">
                        Learning Hub
                    </h2>
                </div>
            }
        >
            <Head title="Learning Hub" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center py-24 apple-glass rounded-[3rem] border-white/5 shadow-2xl overflow-hidden relative group"
                >
                    {/* Background Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.2 }}
                        className="relative z-10 flex items-center justify-center w-28 h-28 mx-auto mb-8 rounded-[2.5rem] bg-white dark:bg-slate-800 shadow-2xl shadow-teal-500/20"
                    >
                        <AcademicCapIcon className="w-14 h-14 text-teal-500" />
                    </motion.div>

                    <div className="relative z-10 px-6">
                        <h3 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-tight">
                            Pusat Pengetahuan
                        </h3>
                        <p className="text-lg sm:text-xl font-medium text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed tracking-tight">
                            Temukan modul pembelajaran interaktif yang dirancang khusus untuk memperakselerasi pertumbuhan karir dan produktivitas Anda.
                        </p>

                        <Link
                            href={route('mini-moduls.index')}
                            className="ios-btn inline-flex items-center gap-3 px-10 py-5 bg-teal-500 hover:bg-teal-600 text-white shadow-2xl shadow-teal-500/30 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
                        >
                            <span>Jelajahi Modul</span>
                            <AcademicCapIcon className="w-6 h-6" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}