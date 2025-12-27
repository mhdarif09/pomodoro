import React from 'react';
import { Link } from '@inertiajs/react';
import { ClockIcon, BookOpenIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function ModulCard({ modul, auth }) {

    const getDifficultyInfo = (difficulty) => {
        const styles = {
            beginner: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700/50',
            intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/50',
            advanced: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700/50'
        };
        const labels = { beginner: 'Pemula', intermediate: 'Menengah', advanced: 'Lanjutan' };
        return { style: styles[difficulty], label: labels[difficulty] };
    };

    const difficulty = getDifficultyInfo(modul.difficulty);
    const hasProgress = auth.user && modul.progress_percentage !== undefined && modul.progress_percentage !== null;

    return (
        <div key={modul.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative ${modul.is_locked ? 'opacity-75 grayscale-[0.5]' : ''}`}>
            {modul.is_locked && (
                <div className="absolute top-4 right-4 z-10 bg-amber-500 text-white p-1.5 rounded-lg shadow-lg">
                    <LockClosedIcon className="w-4 h-4" />
                </div>
            )}
            {modul.thumbnail && (
                <div className="aspect-w-16 aspect-h-9">
                    <img
                        src={`/storage/${modul.thumbnail}`}
                        alt={modul.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {modul.category.name}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${difficulty.style}`}>
                        {difficulty.label}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 flex-grow">
                    {modul.title}
                </h3>

                <div className="flex items-center justify-start text-sm text-gray-500 dark:text-gray-400 space-x-4 mb-5">
                    <div className="flex items-center">
                        <BookOpenIcon className="w-4 h-4 mr-1.5" />
                        <span>{modul.chapters_count} chapter</span>
                    </div>
                    <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1.5" />
                        <span>{modul.estimated_duration} mnt</span>
                    </div>
                </div>

                {hasProgress && !modul.is_locked && (
                    <div className="mb-5">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{modul.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${modul.progress_percentage}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <Link
                    href={route('mini-moduls.show', modul.slug)}
                    className={`mt-auto w-full font-bold py-2.5 px-4 rounded-lg text-center block transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${modul.is_locked
                            ? 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500'
                            : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500 dark:focus:ring-offset-gray-800'
                        }`}
                >
                    {modul.is_locked ? 'Unlock Premium' : (hasProgress && modul.progress_percentage > 0 ? 'Lanjutkan Belajar' : 'Mulai Belajar')}
                </Link>
            </div>
        </div>
    );
}