// File: resources/js/Pages/Pomodoro/components/SessionSettings.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import LockOverlay from './LockOverlay';

export default function SessionSettings({
    isPremium,
    customFocusTime,
    setCustomFocusTime,
    customBreakTime,
    setCustomBreakTime,
    blockedUrls,
    setBlockedUrls,
    onUpgrade
}) {

    const handleCustomTimeChange = (type, value) => {
        const numValue = Number(value);
        if (!isPremium && ((type === 'focus' && numValue !== 25) || (type === 'break' && numValue !== 5))) {
            onUpgrade();
            return;
        }
        if (type === 'focus') {
            setCustomFocusTime(numValue);
        } else {
            setCustomBreakTime(numValue);
        }
    };

    const handleBlockedUrlChange = (index, value) => {
        const newUrls = [...blockedUrls];
        newUrls[index] = value;
        setBlockedUrls(newUrls);
    };

    const addBlockedUrl = () => {
        if (!isPremium && blockedUrls.filter(url => url.trim() !== '').length >= 1) {
            onUpgrade();
            return;
        }
        setBlockedUrls([...blockedUrls, '']);
    };

    const removeBlockedUrl = (index) => {
        const newUrls = [...blockedUrls];
        if (newUrls.length > 1) {
            newUrls.splice(index, 1);
            setBlockedUrls(newUrls);
        } else {
            setBlockedUrls(['']);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 rounded-2xl shadow-xl"
        >
            <h2 className="text-xl font-bold mb-6">Pengaturan Sesi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-4 relative">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Durasi</h3>
                    <label className="block">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Waktu Fokus (menit)</span>
                        <input type="number" value={customFocusTime} onChange={(e) => handleCustomTimeChange('focus', e.target.value)} className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-emerald-500 focus:ring-emerald-500" min="1" />
                    </label>
                    <label className="block">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Waktu Istirahat (menit)</span>
                        <input type="number" value={customBreakTime} onChange={(e) => handleCustomTimeChange('break', e.target.value)} className="mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-emerald-500 focus:ring-emerald-500" min="1" />
                    </label>
                    {!isPremium && <LockOverlay message="Kustomisasi durasi timer." onUpgrade={onUpgrade} />}
                </div>
                <div className="space-y-3 relative">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Blokir Situs</h3>
                    {blockedUrls.map((url, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input type="text" value={url} onChange={(e) => handleBlockedUrlChange(index, e.target.value)} placeholder="contoh: youtube.com" className="block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-emerald-500 focus:ring-emerald-500" />
                            <button onClick={() => removeBlockedUrl(index)} className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-full transition-colors">
                                <TrashIcon className="h-5 w-5"/>
                            </button>
                        </div>
                    ))}
                    <button onClick={addBlockedUrl} className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                        <PlusIcon className="h-4 w-4"/>Tambah URL
                    </button>
                    {!isPremium && blockedUrls.length > 1 && <LockOverlay message="Blokir lebih dari 1 situs." onUpgrade={onUpgrade}/>}
                </div>
            </div>
        </motion.div>
    );
}