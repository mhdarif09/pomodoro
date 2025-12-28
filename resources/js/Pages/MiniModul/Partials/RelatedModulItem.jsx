import React from 'react';
import { Link } from '@inertiajs/react';
import { BookOpenIcon } from '@heroicons/react/24/solid';

export default function RelatedModulItem({ modul }) {
    return (
        <Link 
            href={route('mini-moduls.show', modul.slug)}
            className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
        >
            <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                {modul.thumbnail ? (
                    <img src={`/storage/${modul.thumbnail}`} alt="" className="w-full h-full object-cover"/>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400"><BookOpenIcon className="w-6 h-6"/></div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h5 className="font-bold text-slate-900 dark:text-white truncate text-sm mb-1">{modul.title}</h5>
                <p className="text-xs text-slate-500 line-clamp-2">{modul.description}</p>
            </div>
        </Link>
    );
}