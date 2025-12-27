import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ClockIcon, AcademicCapIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

export default function Index({ auth }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="font-bold text-2xl text-gray-900 dark:text-white">
                        📚 Learning Hub
                    </h2>
                </div>
            }
        >
            <Head title="Learning Hub" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-2xl bg-teal-100 dark:bg-teal-900/30">
                        <AcademicCapIcon className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                        Learning Center
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto font-medium">
                        Jelajahi koleksi modul pembelajaran interaktif untuk meningkatkan pengetahuan Anda.
                    </p>
                    <Link
                        href={route('mini-moduls.index')}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
                    >
                        Lihat Semua Modul
                        <AcademicCapIcon className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
