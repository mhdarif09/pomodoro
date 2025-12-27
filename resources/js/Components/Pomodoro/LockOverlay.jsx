// File: resources/js/Pages/Pomodoro/components/LockOverlay.jsx

import React from 'react';
import { LockClosedIcon } from '@heroicons/react/24/solid';

export default function LockOverlay({ message, onUpgrade }) {
    return (
        <div className="absolute inset-0 bg-slate-800/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 p-4 text-center">
            <div className="space-y-3">
                <LockClosedIcon className="h-10 w-10 text-yellow-400 mx-auto" />
                <p className="font-medium text-white">{message}</p>
                <button
                    onClick={onUpgrade}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold px-5 py-2 rounded-full shadow-lg text-sm"
                >
                    ✨ Upgrade
                </button>
            </div>
        </div>
    );
}