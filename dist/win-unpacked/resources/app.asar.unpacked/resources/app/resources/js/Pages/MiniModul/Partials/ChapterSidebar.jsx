import React from 'react';
import { Link } from '@inertiajs/react';
import { CheckCircleIcon, PlayCircleIcon } from '@heroicons/react/24/solid';

export default function ChapterSidebar({ modul, allChapters, currentChapterId, userProgress }) {
    return (
        <div className="space-y-2">
            {allChapters && allChapters.map((ch, index) => {
                const isCurrent = ch.id === currentChapterId;
                const isCompleted = userProgress && userProgress[ch.id]?.is_completed;

                return (
                    <Link
                        key={ch.id}
                        href={route('mini-moduls.chapter', { miniModul: modul.slug, chapter: ch.slug })}
                        className={`block p-3 rounded-xl transition-all duration-200 flex items-center gap-3 text-sm
                            ${isCurrent 
                                ? 'bg-slate-900 text-white shadow-lg' 
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
                            ${isCurrent ? 'bg-white/20 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}
                        `}>
                            {isCompleted ? <CheckCircleIcon className="w-4 h-4"/> : index + 1}
                        </div>
                        <span className={`flex-1 truncate font-medium ${isCurrent ? 'font-bold' : ''}`}>{ch.title}</span>
                        {isCurrent && <PlayCircleIcon className="w-5 h-5 text-teal-400" />}
                    </Link>
                );
            })}
        </div>
    );
}