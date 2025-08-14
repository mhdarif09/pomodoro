import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function ChapterHeader({ modul, navigation }) {
    return (
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-sm mb-6 sticky top-4 z-10">
            <div className="flex items-center justify-between">
                <Link
                    href={route('mini-moduls.show', modul.slug)}
                    className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline truncate pr-4"
                >
                    ← Kembali ke {modul.title}
                </Link>
                <div className="flex items-center space-x-1 flex-shrink-0">
                    {navigation.prev ? (
                        <Link
                            href={route('mini-moduls.chapter', { miniModul: modul.slug, chapter: navigation.prev.slug })}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                            title="Chapter Sebelumnya"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </Link>
                    ) : (
                        <span className="p-2 text-gray-300 dark:text-gray-600 cursor-not-allowed">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </span>
                    )}

                    <span className="text-sm text-gray-500 dark:text-gray-400 font-mono px-2">
                        {navigation.current}/{navigation.total}
                    </span>

                    {navigation.next ? (
                        <Link
                            href={route('mini-moduls.chapter', { miniModul: modul.slug, chapter: navigation.next.slug })}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                            title="Chapter Selanjutnya"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </Link>
                    ) : (
                        <span className="p-2 text-gray-300 dark:text-gray-600 cursor-not-allowed">
                            <ChevronRightIcon className="w-5 h-5" />
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}