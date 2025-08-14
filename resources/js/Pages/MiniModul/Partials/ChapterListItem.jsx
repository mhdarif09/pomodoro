import React from 'react';
import { Link } from '@inertiajs/react';
import { PlayCircleIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon as CheckSolidIcon } from '@heroicons/react/24/solid';
import { LockClosedIcon } from '@heroicons/react/24/outline'; // Jika ada fitur chapter terkunci

export default function ChapterListItem({ modulSlug, chapter, index, isCompleted, isNextUp }) {
    return (
        <Link
            href={route('mini-moduls.chapter', { miniModul: modulSlug, chapter: chapter.slug })}
            className={`
                group relative flex items-center w-full p-4 rounded-lg text-left transition-all duration-300
                ${isCompleted
                    ? 'bg-green-50 dark:bg-green-900/40'
                    : 'bg-white dark:bg-gray-800'
                }
                ${isNextUp
                    ? 'ring-2 ring-green-500 shadow-lg'
                    : 'border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600 hover:shadow-md'
                }
            `}
        >
            <div className="flex-shrink-0 mr-4">
                {isCompleted ? (
                    <CheckSolidIcon className="w-6 h-6 text-green-500 dark:text-green-400" />
                ) : (
                    <div className={`
                        w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs
                        ${isNextUp
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }
                    `}>
                        {index + 1}
                    </div>
                )}
            </div>

            <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">
                    {chapter.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {chapter.estimated_duration} menit
                </p>
            </div>

            <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <PlayCircleIcon className={`w-6 h-6 ${isNextUp ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`} />
            </div>
        </Link>
    );
}