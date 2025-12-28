import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function ChapterHeader({ modul, navigation }) {
    return (
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-full px-4 py-2.5 flex items-center justify-between shadow-2xl shadow-black/10">
            <Link
                href={route('mini-moduls.show', modul.slug)}
                className="flex items-center gap-2 pl-2 pr-4 py-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors group"
            >
                <ChevronLeftIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white stroke-2" />
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate max-w-[150px] sm:max-w-[250px]">
                    {modul.title}
                </span>
            </Link>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-full p-1">
                <Link
                    href={navigation.prev ? route('mini-moduls.chapter', { miniModul: modul.slug, chapter: navigation.prev.slug }) : '#'}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${navigation.prev ? 'hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm' : 'opacity-30 cursor-not-allowed text-slate-400'}`}
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                </Link>

                <span className="text-xs font-black text-slate-400 px-3 font-mono">
                    {navigation.current} / {navigation.total}
                </span>

                <Link
                    href={navigation.next ? route('mini-moduls.chapter', { miniModul: modul.slug, chapter: navigation.next.slug }) : '#'}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${navigation.next ? 'hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm' : 'opacity-30 cursor-not-allowed text-slate-400'}`}
                >
                    <ChevronRightIcon className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}