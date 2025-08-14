import React from 'react';
import { Link } from '@inertiajs/react';

export default function RelatedModulItem({ modul }) {
    return (
        <Link
            href={route('mini-moduls.show', modul.slug)}
            className="block group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200"
        >
            <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 mb-1">
                {modul.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
                {modul.chapters_count} chapter • {modul.estimated_duration} menit
            </p>
        </Link>
    );
}