import React from 'react';
import { Link } from '@inertiajs/react';
import { ClockIcon, BookOpenIcon, PlayCircleIcon } from '@heroicons/react/24/solid';

export default function ModulCard({ modul }) {
    return (
        <Link 
            href={route('mini-moduls.show', modul.slug)}
            className="group block h-full bg-white dark:bg-slate-800 rounded-[2rem] p-4 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
        >
            {/* Image Container */}
            <div className="aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-4 relative bg-slate-100 dark:bg-slate-700">
                {modul.thumbnail ? (
                    <img 
                        src={`/storage/${modul.thumbnail}`} 
                        alt={modul.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-blue-500">
                        <BookOpenIcon className="w-12 h-12 text-white/50" />
                    </div>
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <PlayCircleIcon className="w-14 h-14 text-white drop-shadow-lg transform scale-75 group-hover:scale-100 transition-transform" />
                </div>
            </div>

            {/* Content */}
            <div className="px-1">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-500 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-md">
                        {modul.category?.name || 'Umum'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                        <ClockIcon className="w-3 h-3" /> {modul.total_duration}m
                    </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2 group-hover:text-teal-500 transition-colors">
                    {modul.title}
                </h3>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {modul.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <BookOpenIcon className="w-3.5 h-3.5" />
                        {modul.published_chapters_count || 0} Materi
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                        Buka
                    </span>
                </div>
            </div>
        </Link>
    );
}