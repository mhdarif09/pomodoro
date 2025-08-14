import React from 'react';
import { Link } from '@inertiajs/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function ChapterSidebar({ modul, allChapters, currentChapterId, userProgress }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 px-2">Daftar Isi</h3>
            <nav className="space-y-1">
                {allChapters.map((ch, index) => {
                    const isCurrent = ch.id === currentChapterId;
                    const isCompleted = userProgress && userProgress[ch.id]?.is_completed;

                    return (
                        <Link
                            key={ch.id}
                            href={route('mini-moduls.chapter', { miniModul: modul.slug, chapter: ch.slug })}
                            className={`flex items-center w-full p-3 rounded-lg text-sm transition-colors duration-200
                                ${isCurrent
                                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-bold'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                }
                            `}
                        >
                            {isCompleted ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0" />
                            ) : (
                                <div className="w-5 h-5 flex items-center justify-center mr-3 flex-shrink-0">
                                    <span className={`block w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                                </div>
                            )}
                            <span className="truncate">{ch.title}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}