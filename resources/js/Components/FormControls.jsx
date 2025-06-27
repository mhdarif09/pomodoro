// File: '@/Components/FormControls.jsx' (Contoh lokasi) atau di atas komponen utama

import { PlusIcon, CheckIcon, XMarkIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';

// Input Field yang sudah di-styling
export const Input = ({ className = '', ...props }) => (
    <input
        {...props}
        className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-blue-500 transition ${className}`}
    />
);

// Select Field yang sudah di-styling
export const Select = ({ className = '', children, ...props }) => (
     <select
        {...props}
        className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-blue-500 transition ${className}`}
    >
        {children}
    </select>
);

// Base Button
export const Button = ({ className = '', children, ...props }) => (
    <button
        {...props}
        className={`inline-flex items-center justify-center gap-x-2 rounded-md px-3 py-2 text-sm font-semibold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${className}`}
    >
        {children}
    </button>
);

// Icon-only Button
export const IconButton = ({ className = '', children, ...props }) => (
     <button
        {...props}
        type="button"
        className={`inline-flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition disabled:opacity-50 ${className}`}
    >
        {children}
    </button>
);